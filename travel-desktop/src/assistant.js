const fs = require('node:fs');
const { answer: localAnswer } = require('./engine');
const { sources, sourceFor } = require('./campaign');
const nebius = require('./nebius');

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

// Fixture demo answers over the campaign pack. Goes through src/nebius.js like every other call (policy gate, model choice).
async function answerQuestion(question, key = process.env.NEBIUS_API_KEY, data) {
  const input = String(question || '').trim().slice(0, 1000);
  const fallback = { ...localAnswer(input), mode: 'local' };
  if (!input || !key) return fallback;
  try {
    const sourceText = Object.entries(sources).filter(([, item]) => item.kind !== 'asset').map(([id, item]) => `SOURCE ${id} (${item.title}):\n${fs.readFileSync(sourceFor(id).path, 'utf8')}`).join('\n\n');
    const reply = await nebius.chat(data, { key, purpose: 'demo-answer', json: true, maxTokens: 600, model: process.env.NEBIUS_MODEL || undefined, messages: [
      { role: 'system', content: 'You are a marketing work assistant for Vamo. Answer in English using ONLY the source text supplied. If the answer is absent, say you cannot verify it. Respond as JSON with keys answer (string) and source_ids (array of supplied source IDs). Cite only sources that directly support your answer. Never claim to have changed or published any work.' },
      { role: 'user', content: `${sourceText}\n\nQUESTION: ${input}` },
    ] });
    return parseModelAnswer(reply.content) || fallback;
  } catch {
    // The deterministic campaign answer stays available offline or when Nebius refuses.
    return fallback;
  }
}

module.exports = { answerQuestion, parseModelAnswer };
