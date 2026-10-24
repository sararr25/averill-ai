// Demo workspace only: NVIDIA Nemotron review through the owner's capped judge server (judge-ai-server/).
// The local approved-rules check always runs first; server findings are kept only when both quotes are found verbatim.
const crypto = require('node:crypto');
const { localReview, currentSources } = require('./task-review');

const ENDPOINT = process.env.AVERILL_JUDGE_SERVER || 'https://averill-judge-ai.vercel.app';
const HOST = new URL(ENDPOINT).host;
const PROVIDER = `Averill demo server (${HOST}) · Nebius Token Factory`;

// Straight and typographic quotes and runs of whitespace compare equal; every other character must match.
const normal = text => String(text || '').replace(/[“”„"]/g, '"').replace(/[‘’']/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
const contains = (haystack, needle) => normal(needle).length >= 4 && normal(haystack).includes(normal(needle));

function clientId(data) {
  data.judgeClientId ||= crypto.randomUUID();
  return data.judgeClientId;
}

function validated(findings, observed, sources) {
  const kept = [];
  for (const item of Array.isArray(findings) ? findings : []) {
    const match = sources.find(({ source }) => source.title === item?.sourceTitle);
    if (!match || !contains(observed, item.draftQuote) || !contains(match.text, item.sourceQuote)) continue;
    kept.push({
      type: 'model-finding', observedExcerpt: String(item.draftQuote).trim(),
      suggestion: String(item.suggestion || item.issue || '').trim().slice(0, 400) || `Review “${String(item.draftQuote).trim()}”.`,
      explanation: String(item.issue || '').trim().slice(0, 400),
      source: { id: match.source.id, title: match.source.title, version: match.source.version, approvedAt: match.source.approvedAt, quote: String(item.sourceQuote).trim(), kind: 'workspace' },
      confidence: 'model-suggestion',
    });
  }
  return kept;
}

async function review(data, task, observedText, observedField = null, { fetcher = globalThis.fetch, endpoint = ENDPOINT } = {}) {
  if (!data?.demoAccounts) throw new Error('The demo AI server is only available in the judge demo workspace.');
  const observed = String(observedText || '').trim();
  const local = localReview(data, task, observed, observedField);
  const steps = [{ label: 'Checked approved rules locally', tool: 'local' }];
  const sources = currentSources(data, task);
  if (!observed || !sources.length) return { ...local, steps };
  let response, body;
  try {
    response = await fetcher(`${endpoint}/api/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Client': clientId(data) },
      body: JSON.stringify({ task, draft: observed.slice(0, 4000), sources: sources.slice(0, 5).map(({ source, text }) => ({ title: source.title, version: source.version, text: text.slice(0, 3000) })) }),
      signal: AbortSignal.timeout(45000),
    });
    body = await response.json().catch(() => ({}));
  } catch {
    const notice = 'The demo AI server could not be reached. The approved-rules check above still applies.';
    return { ...local, steps, aiUnavailable: true, aiNotice: notice, status: `${local.status} ${notice}` };
  }
  if (!response.ok) {
    // The server's limit message is shown verbatim; it already says the approved-rules check still works.
    const message = response.status === 429 && body.error ? body.error : `The demo AI server is unavailable (${response.status}). The approved-rules check above still applies.`;
    return { ...local, steps, aiUnavailable: true, aiLimit: response.status === 429, aiNotice: message, status: `${local.status} ${message}` };
  }
  const extra = validated(body.findings, observed, sources)
    .filter(item => !local.findings.some(found => found.observedExcerpt && normal(found.observedExcerpt) === normal(item.observedExcerpt)));
  steps.push({ label: `Asked NVIDIA Nemotron (${body.model || 'Nemotron'}) through the demo server; kept ${extra.length} finding${extra.length === 1 ? '' : 's'} with verified quotes`, tool: 'model' });
  const findings = [...local.findings, ...extra].slice(0, 8);
  return { ...local, mode: 'model', provider: PROVIDER, model: body.model, steps, findings, status: findings.length ? 'These parts of your draft don’t match the approved rules.' : local.status };
}

module.exports = { review, validated, ENDPOINT, HOST };
