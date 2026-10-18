// Shared Nebius Token Factory client. Every call names a purpose and passes the company AI policy first.
const privacy = require('./company-privacy');

const API = 'https://api.tokenfactory.nebius.com/v1';
const MODEL_TTL = 10 * 60 * 1000;
const modelCache = new Map();
const listeners = new Set();

function onCall(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function notify(entry) { for (const listener of listeners) { try { listener(entry); } catch {} } }
function clearCache() { modelCache.clear(); }

async function request(fetcher, url, options, retries = 1) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetcher(url, options);
    if (response.ok || attempt >= retries || !(response.status === 429 || response.status >= 500)) return response;
  }
}

async function models(key, { fetcher = globalThis.fetch } = {}) {
  const cached = modelCache.get(key);
  if (cached && Date.now() - cached.at < MODEL_TTL) return cached.ids;
  const response = await request(fetcher, `${API}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`Nebius model discovery failed (${response.status}).`);
  const ids = (await response.json()).data?.map(item => item.id).filter(id => typeof id === 'string') || [];
  modelCache.set(key, { ids, at: Date.now() });
  return ids;
}

function pickChat(ids) {
  if (process.env.NEBIUS_MODEL) return process.env.NEBIUS_MODEL;
  return ids.find(id => /nemotron/i.test(id) && /super/i.test(id)) || ids.find(id => /nemotron/i.test(id)) || null;
}

function pickEmbedding(ids) {
  if (process.env.NEBIUS_EMBED_MODEL) return process.env.NEBIUS_EMBED_MODEL;
  return ids.find(id => /nvidia/i.test(id) && /embed/i.test(id)) || ids.find(id => /embed/i.test(id)) || null;
}

function guard(data, purpose, texts) {
  if (!purpose) throw new Error('Nebius calls need a purpose.');
  privacy.requireAI(data);
  if (texts.some(text => privacy.credentials(text))) throw new Error('Remove credentials before sending text to Nebius.');
}

function messageText(messages) {
  return messages.map(message => typeof message.content === 'string' ? message.content : JSON.stringify(message.content ?? '')).concat(messages.flatMap(message => (message.tool_calls || []).map(call => call.function?.arguments || '')));
}

// Returns { model, message, content }. Throws on policy refusal or HTTP failure so callers choose their fallback.
async function chat(data, { key, purpose, messages, tools, toolChoice, json = false, maxTokens = 1200, temperature = 0.1, timeout = 30000, model, fetcher = globalThis.fetch }) {
  if (!key) throw new Error('Nebius API key is not configured.');
  guard(data, purpose, messageText(messages));
  const chosen = model || pickChat(await models(key, { fetcher }));
  if (!chosen) throw new Error('No NVIDIA Nemotron model is available for this key.');
  // Nemotron reasons by default and can spend the whole token budget before answering; every caller wants the answer.
  const body = { model: chosen, temperature, max_tokens: maxTokens, messages, chat_template_kwargs: { enable_thinking: false } };
  if (tools?.length) { body.tools = tools; body.tool_choice = toolChoice || 'auto'; }
  if (json) body.response_format = { type: 'json_object' };
  const started = Date.now();
  const response = await request(fetcher, `${API}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
  notify({ service: 'nebius', purpose, kind: 'chat', model: chosen, ok: response.ok, status: response.status, items: messages.length, ms: Date.now() - started });
  if (!response.ok) throw new Error(`Nebius request failed (${response.status}).`);
  const choice = (await response.json()).choices?.[0] || {};
  const message = choice.message || {};
  if (choice.finish_reason === 'length' && !message.content && !message.tool_calls?.length) throw new Error('Nebius reply was cut off before an answer.');
  return { model: chosen, message, content: typeof message.content === 'string' ? message.content : '' };
}

async function embed(data, { key, purpose = 'embedding', texts, model, fetcher = globalThis.fetch, batch = 32 }) {
  if (!key) throw new Error('Nebius API key is not configured.');
  const input = (texts || []).map(text => String(text).slice(0, 8000));
  guard(data, purpose, input);
  const chosen = model || pickEmbedding(await models(key, { fetcher }));
  if (!chosen) throw new Error('No embedding model is available for this key.');
  const vectors = [];
  for (let start = 0; start < input.length; start += batch) {
    const slice = input.slice(start, start + batch);
    const response = await request(fetcher, `${API}/embeddings`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: chosen, input: slice }), signal: AbortSignal.timeout(30000) });
    notify({ service: 'nebius', purpose, kind: 'embed', model: chosen, ok: response.ok, status: response.status, items: slice.length });
    if (!response.ok) throw new Error(`Nebius embedding failed (${response.status}).`);
    const rows = (await response.json()).data || [];
    rows.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    if (rows.length !== slice.length) throw new Error('Nebius returned an unexpected number of embeddings.');
    vectors.push(...rows.map(row => row.embedding));
  }
  return { model: chosen, vectors };
}

function parseJson(raw) {
  const match = String(raw || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

module.exports = { API, models, pickChat, pickEmbedding, chat, embed, parseJson, onCall, clearCache };
