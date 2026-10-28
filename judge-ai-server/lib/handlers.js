// Request validation, caps and responses for both endpoints. Dependencies are injected so tests run without network.
const { LimitError } = require('./limits');
const providers = require('./providers');

const LIMITS = { draft: 4000, sourceText: 3000, sources: 5, query: 300, question: 500 };
const TASKS = new Set(['email', 'linkedin', 'instagram']);
// Tavily credits differ by call type: a search is one unit, a small crawl five.
const TAVILY_UNITS = { search: 1, crawl: 5 };

class RequestError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';

function identity(req) {
  const client = String(req.headers['x-averill-client'] || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(client)) throw new RequestError('Missing app client id.');
  const forwarded = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown');
  return { client, ip: forwarded.split(',')[0].trim().slice(0, 64) || 'unknown' };
}

const cleanSources = list => (Array.isArray(list) ? list : []).slice(0, LIMITS.sources)
  .map(source => ({ title: text(source?.title, 120), version: text(String(source?.version ?? ''), 20), text: text(source?.text, LIMITS.sourceText) }))
  .filter(source => source.title && source.text);

function reviewInput(body) {
  const task = text(body?.task, 20);
  const draft = text(body?.draft, LIMITS.draft);
  if (!TASKS.has(task)) throw new RequestError('Unsupported work type.');
  if (!draft) throw new RequestError('Draft text is required.');
  const sources = cleanSources(body.sources);
  if (!sources.length) throw new RequestError('At least one approved source is required.');
  return { task, draft, sources };
}

function askInput(body) {
  const question = text(body?.question, LIMITS.question);
  if (!question) throw new RequestError('A question is required.');
  const sources = cleanSources(body.sources);
  if (!sources.length) throw new RequestError('At least one approved source is required.');
  return { question, sources };
}

function searchInput(body) {
  const kind = text(body?.kind, 10);
  if (kind === 'search') {
    const query = text(body.query, LIMITS.query);
    if (!query) throw new RequestError('Search text is required.');
    return { kind, path: '/search', body: { query, search_depth: 'basic', max_results: 5, include_answer: false } };
  }
  if (kind === 'crawl') {
    let url;
    try { url = new URL(text(body.url, 500)); } catch { throw new RequestError('Enter a full https:// website address.'); }
    if (url.protocol !== 'https:') throw new RequestError('Only https:// websites can be read.');
    return { kind, path: '/crawl', body: { url: url.toString(), max_depth: 1, limit: 10, extract_depth: 'basic' }, timeout: 90000 };
  }
  throw new RequestError('Unsupported search type.');
}

function createHandlers({ limiter, review = providers.nemotronReview, ask = providers.nemotronAsk, tavily = providers.tavily }) {
  async function run(req, res, work) {
    try {
      if (req.method !== 'POST') throw new RequestError('Use POST.', 405);
      if (!limiter) throw new RequestError('Usage limits are not configured on this server.', 503);
      res.status(200).json(await work(identity(req), req.body || {}));
    } catch (error) {
      const status = error instanceof LimitError ? 429 : error.status || 500;
      res.status(status).json({ error: status === 500 ? 'The AI server failed. The approved-rules check still works.' : error.message, limit: error instanceof LimitError });
    }
  }
  return {
    review: (req, res) => run(req, res, async (who, body) => {
      const messages = providers.reviewMessages(reviewInput(body));
      const reservation = await limiter.reserve('nebius', who, providers.estimateTokens(messages));
      try {
        const result = await review(messages);
        await limiter.settle(reservation, result.usedTokens ?? reservation.units);
        return { model: result.model, findings: result.findings };
      } catch (error) {
        // Charge what Nebius reports even on a failed parse; release the reservation when nothing was used.
        if (error.usedTokens) await limiter.settle(reservation, error.usedTokens); else await limiter.release(reservation);
        throw error;
      }
    }),
    ask: (req, res) => run(req, res, async (who, body) => {
      const messages = providers.askMessages(askInput(body));
      const reservation = await limiter.reserve('nebius', who, providers.estimateTokens(messages));
      try {
        const result = await ask(messages);
        await limiter.settle(reservation, result.usedTokens ?? reservation.units);
        return { model: result.model, answer: result.answer, evidence: result.evidence };
      } catch (error) {
        if (error.usedTokens) await limiter.settle(reservation, error.usedTokens); else await limiter.release(reservation);
        throw error;
      }
    }),
    search: (req, res) => run(req, res, async (who, body) => {
      const call = searchInput(body);
      const reservation = await limiter.reserve('tavily', who, TAVILY_UNITS[call.kind]);
      try { return { kind: call.kind, result: await tavily(call.path, call.body, { timeout: call.timeout }) }; }
      catch (error) { await limiter.release(reservation); throw error; }
    }),
  };
}

module.exports = { createHandlers, LIMITS, TAVILY_UNITS };
