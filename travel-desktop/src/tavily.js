// Shared Tavily client. Only public text the employee confirmed, or public HTTPS URLs, may leave the device.
const privacy = require('./company-privacy');
const remote = require('./remote-import');

const API = 'https://api.tavily.com';
const listeners = new Set();

function onCall(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function notify(entry) { for (const listener of listeners) { try { listener(entry); } catch {} } }

const normalize = text => String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Refuses text that repeats a long run of internal company source text, so internal passages are not searched by accident.
function leaksInternal(text, internalTexts = [], window = 60) {
  const input = normalize(text);
  if (input.length < window) return false;
  const corpus = internalTexts.map(normalize);
  for (let start = 0; start + window <= input.length; start += Math.max(1, Math.floor(window / 3))) {
    const piece = input.slice(start, start + window);
    if (corpus.some(body => body.includes(piece))) return true;
  }
  return false;
}

function outbound(text, { max = 400, internalTexts = [] } = {}) {
  const input = String(text || '').trim().slice(0, max);
  if (!input) throw new Error('Enter public text to check.');
  if (privacy.credentials(input)) throw new Error('Remove credentials before sending text to Tavily.');
  if (leaksInternal(input, internalTexts)) throw new Error('This text repeats internal company material. Only public statements can be checked with Tavily.');
  return input;
}

async function publicUrl(value, resolver) {
  const { url } = await remote.target(value, resolver);
  return url.toString();
}

const clip = (value, max) => String(value || '').slice(0, max);
const cleanResult = item => ({ title: clip(item.title || item.url, 200), url: item.url, content: clip(item.content, 1200), score: typeof item.score === 'number' ? item.score : null });

async function post(path, key, body, purpose, fetcher, timeout = 30000) {
  if (!key) throw new Error('Tavily API key is not configured');
  const started = Date.now();
  const response = await fetcher(`${API}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
  notify({ service: 'tavily', purpose, kind: path.slice(1), ok: response.ok, status: response.status, ms: Date.now() - started });
  if (!response.ok) throw Object.assign(new Error(`Tavily ${path.slice(1)} failed (${response.status})`), { status: response.status });
  return response.json();
}

// A transport replaces the direct Tavily request, for example the capped judge demo server. Callers still pass the
// outbound() guard first, and the call is reported to the same listeners as a direct request.
async function viaTransport(transport, path, body, purpose) {
  const started = Date.now();
  try {
    const result = await transport(path, body);
    notify({ service: 'tavily', purpose, kind: path.slice(1), ok: true, status: 200, ms: Date.now() - started });
    return result;
  } catch (error) {
    notify({ service: 'tavily', purpose, kind: path.slice(1), ok: false, status: error.status, ms: Date.now() - started });
    throw error;
  }
}

async function search(query, { key = process.env.TAVILY_API_KEY, purpose = 'search', depth = 'basic', answer = false, maxResults = 5, includeDomains, internalTexts, transport, fetcher = globalThis.fetch } = {}) {
  const input = outbound(query, { max: 300, internalTexts });
  const body = { query: input, search_depth: depth === 'advanced' ? 'advanced' : 'basic', max_results: Math.min(10, Math.max(1, maxResults)), include_answer: answer, include_raw_content: false, include_images: false };
  if (includeDomains?.length) body.include_domains = includeDomains.slice(0, 10);
  const result = transport ? await viaTransport(transport, '/search', body, purpose) : await post('/search', key, body, purpose, fetcher, 20000);
  const results = (result.results || []).filter(item => /^https:\/\//.test(item.url || '')).slice(0, body.max_results).map(cleanResult);
  return { query: input, answer: answer && results.length ? clip(result.answer, 2000) : '', results };
}

async function extract(urls, { key = process.env.TAVILY_API_KEY, purpose = 'extract', resolver, fetcher = globalThis.fetch } = {}) {
  const list = [];
  for (const url of (urls || []).slice(0, 10)) list.push(await publicUrl(url, resolver));
  if (!list.length) throw new Error('Choose at least one public HTTPS link.');
  const result = await post('/extract', key, { urls: list }, purpose, fetcher);
  return (result.results || []).filter(item => list.includes(item.url)).map(item => ({ url: item.url, content: clip(item.raw_content, 50000) }));
}

async function crawl(url, { key = process.env.TAVILY_API_KEY, purpose = 'crawl', limit = 30, depth = 2, resolver, fetcher = globalThis.fetch } = {}) {
  const root = new URL(await publicUrl(url, resolver));
  const result = await post('/crawl', key, { url: root.toString(), max_depth: Math.min(3, depth), limit: Math.min(50, limit), extract_depth: 'basic' }, purpose, fetcher, 120000);
  return (result.results || []).filter(item => { try { const page = new URL(item.url); return page.protocol === 'https:' && page.hostname === root.hostname; } catch { return false; } })
    .slice(0, limit).map(item => ({ url: item.url, content: clip(item.raw_content, 50000) }));
}

module.exports = { API, search, extract, crawl, outbound, leaksInternal, publicUrl, onCall };
