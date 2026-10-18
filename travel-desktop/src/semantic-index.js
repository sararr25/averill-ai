// AV-40 / AV-41: local embedding index of approved sources with Nebius consent, plus hybrid search.
// Vectors stay on this Mac. Only consented source chunks and the person's question are embedded by Nebius.
const fs = require('node:fs');
const path = require('node:path');
const workspace = require('./workspace');
const privacy = require('./company-privacy');
const nebius = require('./nebius');
const evidence = require('./evidence');

const FILE = 'averill-semantic-index.json';
const indexPath = userData => path.join(userData, FILE);

function load(userData) {
  try { const data = JSON.parse(fs.readFileSync(indexPath(userData), 'utf8')); return data && Array.isArray(data.chunks) ? data : null; } catch { return null; }
}
function save(userData, index) {
  fs.mkdirSync(userData, { recursive: true });
  const target = indexPath(userData), temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(index), { mode: 0o600 });
  fs.renameSync(temporary, target);
}

// Paragraph chunks with their first line and PDF page, capped so each embeds cheaply.
function chunks(text, max = 900) {
  const out = [];
  let page = null, buffer = [], start = null;
  const flush = () => { const body = buffer.join(' ').replace(/\s+/g, ' ').trim(); if (body.length >= 20) out.push({ text: body.slice(0, max), line: start, page }); buffer = []; start = null; };
  String(text || '').split(/\r?\n/).forEach((raw, index) => {
    const marker = raw.match(/^\[PDF page (\d+)\]$/);
    if (marker) { flush(); page = Number(marker[1]); return; }
    const line = raw.trim();
    if (!line) { flush(); return; }
    if (start === null) start = index + 1;
    buffer.push(line);
    if (buffer.join(' ').length > max) flush();
  });
  flush();
  return out;
}

const readText = source => { try { return source.textPath ? fs.readFileSync(source.textPath, 'utf8').slice(0, 60000) : ''; } catch { return ''; } };
// Every approved source in the workspace that may be embedded. Visibility is applied again at search time.
const indexable = data => data.sources.filter(source => source.status === 'approved' && source.scope !== 'private' && source.textPath && privacy.eligible(source));

async function build(userData, data, { key, fetcher } = {}) {
  privacy.requireAI(data);
  const previous = load(userData);
  const keep = new Map((previous?.chunks || []).map(chunk => [`${chunk.sourceId}:${chunk.sha256}:${chunk.line}`, chunk]));
  const wanted = [];
  for (const source of indexable(data)) for (const chunk of chunks(readText(source))) wanted.push({ sourceId: source.id, version: source.version, sha256: source.sha256 || '', ...chunk });
  const missing = wanted.filter(chunk => !keep.has(`${chunk.sourceId}:${chunk.sha256}:${chunk.line}`) || previous?.model == null);
  let model = previous?.model || null;
  if (missing.length) {
    const result = await nebius.embed(data, { key, fetcher, purpose: 'knowledge-index', texts: missing.map(chunk => chunk.text), model: previous?.model || undefined });
    model = result.model;
    missing.forEach((chunk, index) => { chunk.vector = result.vectors[index]; keep.set(`${chunk.sourceId}:${chunk.sha256}:${chunk.line}`, chunk); });
  }
  const index = { model, builtAt: new Date().toISOString(), chunks: wanted.map(chunk => ({ ...chunk, vector: keep.get(`${chunk.sourceId}:${chunk.sha256}:${chunk.line}`).vector })) };
  save(userData, index);
  return { chunks: index.chunks.length, embedded: missing.length, model };
}

function removeSource(userData, sourceId) {
  const index = load(userData);
  if (!index) return;
  index.chunks = index.chunks.filter(chunk => chunk.sourceId !== sourceId);
  save(userData, index);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

// Hybrid ranking over sources the active person may use now; stale chunks (old version/hash) are ignored.
async function search(userData, data, query, { key, fetcher, limit = 6 } = {}) {
  const index = load(userData);
  const allowed = new Map(workspace.approvedSources(data).filter(source => privacy.eligible(source)).map(source => [source.id, source]));
  const candidates = (index?.chunks || []).filter(chunk => { const source = allowed.get(chunk.sourceId); return source && source.version === chunk.version && (source.sha256 || '') === chunk.sha256; });
  if (!candidates.length || !index.model) return { mode: 'keyword', results: [] };
  const { vectors: [vector] } = await nebius.embed(data, { key, fetcher, purpose: 'knowledge-search', texts: [String(query).slice(0, 1000)], model: index.model });
  const words = evidence.terms(query);
  const results = candidates.map(chunk => {
    const keyword = words.length ? words.filter(word => chunk.text.toLowerCase().includes(word)).length / words.length : 0;
    return { chunk, score: cosine(vector, chunk.vector) + 0.15 * keyword, semantic: cosine(vector, chunk.vector), keyword };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
  return { mode: 'semantic', model: index.model, results: results.map(({ chunk, score, semantic, keyword }) => ({ source: allowed.get(chunk.sourceId), quote: chunk.text, line: chunk.line, page: chunk.page, score, match: semantic >= keyword ? 'semantic' : 'keyword' })) };
}

function status(userData, data) {
  const index = load(userData);
  const current = new Set(indexable(data).map(source => `${source.id}:${source.sha256 || ''}`));
  const indexed = new Set((index?.chunks || []).map(chunk => `${chunk.sourceId}:${chunk.sha256}`));
  return { builtAt: index?.builtAt || null, model: index?.model || null, sources: [...current].filter(key => indexed.has(key)).length, pending: [...current].filter(key => !indexed.has(key)).length };
}

module.exports = { chunks, build, search, removeSource, status, cosine };
