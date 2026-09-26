const fs = require('node:fs');
const { answer: localAnswer } = require('./engine');
const { sources, sourceFor } = require('./campaign');

const API = 'https://api.tokenfactory.nebius.com/v1';
let modelPromise;

async function discoverModel(key) {
  if (process.env.NEBIUS_MODEL) return process.env.NEBIUS_MODEL;
  const response = await fetch(`${API}/models`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Model discovery failed: ${response.status}`);
  const body = await response.json();
  const ids = (body.data || []).map((item) => item.id).filter(Boolean);
  return ids.find((id) => /nemotron/i.test(id) && /super/i.test(id)) || ids.find((id) => /nemotron/i.test(id)) || null;
}

function parseModelAnswer(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.answer !== 'string' || !Array.isArray(parsed.source_ids)) return null;
    const cited = [...new Set(parsed.source_ids)].filter((id) => sources[id] && sources[id].kind !== 'asset').map(sourceFor);
    if (parsed.answer.trim() && cited.length) return { text: parsed.answer.trim(), sources: cited, mode: 'model' };
    return null;
  } catch { return null; }
}

async function answerQuestion(question, key = process.env.NEBIUS_API_KEY) {
  const input = String(question || '').trim().slice(0, 1000);
  const fallback = { ...localAnswer(input), mode: 'local' };
  if (!input || !key) return fallback;
  try {
    modelPromise ||= discoverModel(key);
    const model = await modelPromise;
    if (!model) return fallback;
    const sourceText = Object.entries(sources).filter(([, item]) => item.kind !== 'asset').map(([id, item]) => `SOURCE ${id} (${item.title}):\n${fs.readFileSync(sourceFor(id).path, 'utf8')}`).join('\n\n');
    const response = await fetch(`${API}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 600,
        messages: [
          { role: 'system', content: 'You are a marketing work assistant for Elseweek. Answer in English using ONLY the source text supplied. If the answer is absent, say you cannot verify it. Respond as JSON with keys answer (string) and source_ids (array of supplied source IDs). Cite only sources that directly support your answer. Never claim to have changed or published any work.' },
          { role: 'user', content: `${sourceText}\n\nQUESTION: ${input}` },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return fallback;
    const body = await response.json();
    const raw = body.choices?.[0]?.message?.content || '';
    return parseModelAnswer(raw) || fallback;
  } catch {
    modelPromise = undefined;
    return fallback;
  }
}

module.exports = { answerQuestion, parseModelAnswer };
