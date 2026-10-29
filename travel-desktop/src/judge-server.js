// Demo workspace only: NVIDIA Nemotron review through the owner's capped judge server (judge-ai-server/).
// The local approved-rules check always runs first; server findings are kept only when both quotes are found verbatim.
const crypto = require('node:crypto');
const { localReview, currentSources } = require('./task-review');
const { relevantSources, localWorkspaceAnswer, designTopics } = require('./workspace-answer');
const privacy = require('./company-privacy');

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

// T1.3: the question box in the demo workspace. Design questions stay local (approved design rule lines only); everything
// else may go to /api/ask after consent, with only the best-matching passages of approved, non-restricted sources.
function askSources(data, question) {
  if (designTopics(question)) return [];
  return relevantSources(data, question)
    .filter(({ source }) => source.confidentiality !== 'restricted' && !source.containsCredentials)
    .slice(0, 5).map(({ source, content, passage }) => {
      const at = Math.max(0, content.indexOf(passage.quote));
      const start = Math.max(0, at - 1000);
      return { source, text: content.slice(start, start + 3000), content };
    });
}
// What a consent dialog must list before a question leaves this Mac, or null when the question stays local.
function askPlan(data, question) {
  if (!data?.demoAccounts) throw new Error('The demo AI server is only available in the judge demo workspace.');
  const input = String(question || '').trim().slice(0, 500);
  const sources = input ? askSources(data, input) : [];
  if (!sources.length) return null;
  if (privacy.credentials(input)) throw new Error('Remove credentials before using external AI.');
  return { items: [`Your question: ${input}`, `Matching passages from ${sources.length} approved source${sources.length === 1 ? '' : 's'}: ${sources.map(({ source }) => source.title).join(', ')}`] };
}
const asked = (local, ai) => ({ ...local, ai });
async function ask(data, question, { fetcher = globalThis.fetch, endpoint = ENDPOINT } = {}) {
  if (!data?.demoAccounts) throw new Error('The demo AI server is only available in the judge demo workspace.');
  const input = String(question || '').trim().slice(0, 500);
  const local = localWorkspaceAnswer(data, input);
  const sources = input ? askSources(data, input) : [];
  if (!sources.length) return local;
  if (privacy.credentials(input)) throw new Error('Remove credentials before using external AI.');
  let response, body;
  try {
    response = await fetcher(`${endpoint}/api/ask`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Client': clientId(data) },
      body: JSON.stringify({ question: input, sources: sources.map(({ source, text }) => ({ title: source.title, version: source.version, text })) }),
      signal: AbortSignal.timeout(45000),
    });
    body = await response.json().catch(() => ({}));
  } catch { return asked(local, { status: 'unavailable', notice: 'The demo AI server could not be reached. The local approved-source answer below still applies.' }); }
  if (!response.ok) {
    const limit = response.status === 429 && body.error;
    return asked(local, { status: limit ? 'limit' : 'unavailable', notice: limit ? body.error : `The demo AI server is unavailable (${response.status}). The local approved-source answer below still applies.` });
  }
  // Keep the model answer only when every quote is verbatim in the passage that was sent and the answer sits inside a quote.
  const quotes = [];
  for (const item of Array.isArray(body.evidence) ? body.evidence : []) {
    const match = sources.find(({ source }) => source.title === item?.sourceTitle);
    if (match && typeof item.quote === 'string' && item.quote.trim().length >= 10 && contains(match.text, item.quote)) quotes.push({ match, quote: item.quote.trim() });
  }
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (!answer || !quotes.length || !quotes.some(({ quote }) => contains(quote, answer))) {
    return asked(local, { status: 'unverified', model: body.model, notice: 'NVIDIA Nemotron gave no answer that could be verified against the approved sources, so it is not shown. The local approved-source answer below still applies.' });
  }
  const cited = quotes.map(({ match: { source, content }, quote }) => ({
    id: source.id, title: source.title, kind: 'workspace', version: source.version, approvedAt: source.approvedAt,
    approvedBy: data.people.find(person => person.id === source.approvedBy)?.name || 'Unknown approver', quote,
    line: content.includes(quote) ? content.slice(0, content.indexOf(quote)).split('\n').length : null, reason: 'Quoted by Nemotron, verified against the source',
  }));
  return asked(local, { status: 'suggestion', model: body.model, provider: PROVIDER, text: answer, sources: cited });
}

const SEARCH_LIMIT = 'Daily online check limit reached. Try again tomorrow.';

// Demo workspace only: a transport for src/tavily.js that sends one public search to the owner's capped judge server
// (POST /api/search). The server holds the Tavily key and counts one unit per search for this app install.
// Callers must run the tavily.js outbound() guards first; this function only carries the request.
function searchTransport(data, { fetcher = globalThis.fetch, endpoint = ENDPOINT } = {}) {
  if (!data?.demoAccounts) throw new Error('The demo search server is only available in the judge demo workspace.');
  const client = clientId(data);
  return async (path, body) => {
    if (path !== '/search') throw new Error('The demo search server only supports web search.');
    let response, reply;
    try {
      response = await fetcher(`${endpoint}/api/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Client': client },
        body: JSON.stringify({ kind: 'search', query: body.query, ...(body.include_domains ? { includeDomains: body.include_domains } : {}) }), signal: AbortSignal.timeout(30000),
      });
      reply = await response.json().catch(() => ({}));
    } catch { throw Object.assign(new Error('The demo search server could not be reached.'), { expose: true }); }
    if (response.status === 429) throw Object.assign(new Error(SEARCH_LIMIT), { limit: true, status: 429, expose: true });
    if (!response.ok) throw Object.assign(new Error(`The demo search server is unavailable (${response.status}).`), { status: response.status, expose: true });
    return reply.result || {};
  };
}

// Typed assistance, never a raw model proxy. Sources are validated again by WorkAssistant after the response.
async function assist(data, { question, context, intent, sources }, { fetcher = globalThis.fetch, endpoint = ENDPOINT } = {}) {
  if (!data?.demoAccounts) throw new Error('Demo assistance is available only in the judge workspace.');
  const response = await fetcher(`${endpoint}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Client': clientId(data) }, body: JSON.stringify({ mode: 'assist', intent: intent.kind, question: String(question).slice(0, 500), draft: String(context || '').slice(0, 1500), sources: sources.map((s, index) => ({ title: `source-${index}`, version: 'demo', text: s.text.slice(0, 3000) })) }), signal: AbortSignal.timeout(20000) });
  const reply = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(response.status === 429 ? reply.error || 'Daily AI limit reached.' : `The demo assistant is unavailable (${response.status}).`), { expose: true, limit: response.status === 429 });
  return { model: reply.model, content: JSON.stringify({ answer: reply.answer, evidence: (reply.evidence || []).map(e => ({ source_id: /^source-\d+$/.test(e.sourceTitle) ? sources[Number(e.sourceTitle.slice(7))]?.id : null, quote: e.quote })) }) };
}
module.exports = { review, ask, askPlan, validated, searchTransport, assist, ENDPOINT, HOST, SEARCH_LIMIT };
