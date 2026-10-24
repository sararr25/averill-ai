// Fixed-shape calls to Nebius Token Factory (NVIDIA Nemotron) and Tavily. Keys come only from environment variables.
const NEBIUS = 'https://api.tokenfactory.nebius.com/v1';
const TAVILY = 'https://api.tavily.com';
const MAX_OUTPUT_TOKENS = 800;
const SYSTEM_PROMPT = 'You review a marketing draft for a fictional company against its approved sources. Report only conflicts you can support with an exact quote from the draft and an exact quote from one approved source. If the sources do not cover something, do not report it. Reply with JSON: {"findings":[{"draftQuote":string,"issue":string,"sourceTitle":string,"sourceQuote":string,"suggestion":string}]}. Return {"findings":[]} when nothing conflicts.';
let chosenModel = null;

async function pickModel(key, fetcher) {
  if (process.env.NEBIUS_MODEL) return process.env.NEBIUS_MODEL;
  if (chosenModel) return chosenModel;
  const response = await fetcher(`${NEBIUS}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw Object.assign(new Error(`Nebius model discovery failed (${response.status}).`), { status: 502 });
  const ids = ((await response.json()).data || []).map(item => item.id).filter(id => typeof id === 'string');
  chosenModel = ids.find(id => /nemotron/i.test(id) && /super/i.test(id)) || ids.find(id => /nemotron/i.test(id)) || null;
  if (!chosenModel) throw Object.assign(new Error('No NVIDIA Nemotron model is available for this key.'), { status: 502 });
  return chosenModel;
}

function reviewMessages({ task, draft, sources }) {
  const sourceText = sources.map(source => `SOURCE "${source.title}" v${source.version}:\n${source.text}`).join('\n\n');
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `WORK TYPE: ${task}\n\nAPPROVED SOURCES:\n${sourceText}\n\nDRAFT:\n${draft}` },
  ];
}
// Upper bound used to reserve tokens before the call: about 3 characters per token plus the full output budget.
function estimateTokens(messages) { return Math.ceil(messages.reduce((sum, message) => sum + message.content.length, 0) / 3) + MAX_OUTPUT_TOKENS; }

async function nemotronReview(messages, { key = process.env.NEBIUS_API_KEY, fetcher = globalThis.fetch } = {}) {
  if (!key) throw Object.assign(new Error('The AI server has no Nebius key configured.'), { status: 503 });
  const model = await pickModel(key, fetcher);
  const response = await fetcher(`${NEBIUS}/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.1, max_tokens: MAX_OUTPUT_TOKENS, response_format: { type: 'json_object' }, chat_template_kwargs: { enable_thinking: false } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw Object.assign(new Error(`Nebius request failed (${response.status}).`), { status: 502 });
  const body = await response.json();
  let findings;
  try { findings = JSON.parse(body.choices?.[0]?.message?.content || '').findings; } catch { findings = null; }
  if (!Array.isArray(findings)) throw Object.assign(new Error('Nemotron returned an unreadable answer.'), { status: 502, usedTokens: body.usage?.total_tokens });
  return { model, findings: findings.slice(0, 6), usedTokens: body.usage?.total_tokens };
}

async function tavily(path, body, { key = process.env.TAVILY_API_KEY, fetcher = globalThis.fetch, timeout = 30000 } = {}) {
  if (!key) throw Object.assign(new Error('The AI server has no Tavily key configured.'), { status: 503 });
  const response = await fetcher(`${TAVILY}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw Object.assign(new Error(`Tavily request failed (${response.status}).`), { status: 502 });
  return response.json();
}

module.exports = { reviewMessages, estimateTokens, nemotronReview, tavily, SYSTEM_PROMPT, MAX_OUTPUT_TOKENS };
