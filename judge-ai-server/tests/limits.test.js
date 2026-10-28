const test = require('node:test');
const assert = require('node:assert/strict');
const { createLimiter, limitsFromEnv, LimitError, MESSAGES } = require('../lib/limits');
const { memoryStore } = require('../lib/store');
const { createHandlers } = require('../lib/handlers');

const caps = { nebius: { global: 1000, client: 400, ip: 600 }, tavily: { global: 6, client: 3, ip: 5 } };
const who = (client = 'client-aaaa', ip = '1.1.1.1') => ({ client, ip });

test('reservations stop at each cap and undo partial counts', async () => {
  const store = memoryStore();
  const limiter = createLimiter({ store, limits: caps, now: () => Date.parse('2026-10-24T10:00:00Z') });
  await limiter.reserve('nebius', who(), 400);
  await assert.rejects(() => limiter.reserve('nebius', who(), 1), error => error instanceof LimitError && error.message === MESSAGES.nebius);
  assert.equal(store.counts.get('nebius:2026-10-24:global'), 400, 'refused call leaves no trace');
  await limiter.reserve('nebius', who('client-bbbb'), 200);
  await assert.rejects(() => limiter.reserve('nebius', who('client-cccc'), 1), LimitError, 'per-IP cap of 600 reached');
  await limiter.reserve('nebius', who('client-cccc', '2.2.2.2'), 400);
  await assert.rejects(() => limiter.reserve('nebius', who('client-dddd', '3.3.3.3'), 1), LimitError, 'global cap of 1000 reached');
});

test('settle corrects to real usage and a new UTC day starts from zero', async () => {
  const store = memoryStore(); let now = Date.parse('2026-10-24T23:00:00Z');
  const limiter = createLimiter({ store, limits: caps, now: () => now });
  const reservation = await limiter.reserve('nebius', who(), 400);
  await limiter.settle(reservation, 120);
  assert.equal(store.counts.get('nebius:2026-10-24:client:client-aaaa'), 120);
  await limiter.reserve('nebius', who(), 280);
  now = Date.parse('2026-10-25T00:10:00Z');
  await limiter.reserve('nebius', who(), 400);
  const tavily = await limiter.reserve('tavily', who(), 3);
  await limiter.release(tavily);
  assert.equal(store.counts.get('tavily:2026-10-25:client:client-aaaa'), 0);
});

test('caps come from environment variables with safe defaults', () => {
  assert.deepEqual(limitsFromEnv({}).nebius, { global: 200000, client: 20000, ip: 40000 });
  assert.equal(limitsFromEnv({ TAVILY_DAILY_UNITS: '5', NEBIUS_DAILY_TOKENS: 'nonsense' }).tavily.global, 5);
  assert.equal(limitsFromEnv({ NEBIUS_DAILY_TOKENS: 'nonsense' }).nebius.global, 200000);
});

function call(handler, body, headers = { 'x-averill-client': 'client-aaaa', 'x-forwarded-for': '9.9.9.9, 10.0.0.1' }, method = 'POST') {
  return new Promise(resolve => {
    const res = { code: 0, status(code) { this.code = code; return this; }, json(payload) { resolve({ status: this.code, body: payload }); } };
    handler({ method, headers, body }, res);
  });
}
const reviewBody = { task: 'email', draft: 'Lowest prices guaranteed.', sources: [{ title: 'brand-and-legal.md', version: '1', text: 'Do not claim "lowest prices guaranteed".' }] };

test('endpoints refuse without a usage store instead of running uncapped', async () => {
  let called = false;
  const handlers = createHandlers({ limiter: null, review: async () => { called = true; } });
  assert.deepEqual((await call(handlers.review, reviewBody)).status, 503);
  assert.equal(called, false);
});

test('review charges real tokens, refuses past the cap without calling Nebius, and validates input', async () => {
  const store = memoryStore(); let calls = 0;
  const limiter = createLimiter({ store, limits: { ...caps, nebius: { global: 5000, client: 2000, ip: 5000 } } });
  const handlers = createHandlers({ limiter, review: async () => { calls++; return { model: 'nemotron', findings: [{ draftQuote: 'Lowest prices guaranteed' }], usedTokens: 900 }; } });
  const ok = await call(handlers.review, reviewBody);
  assert.equal(ok.status, 200); assert.equal(ok.body.findings.length, 1);
  assert.equal(store.counts.get(`nebius:${new Date().toISOString().slice(0, 10)}:ip:9.9.9.9`), 900);
  await call(handlers.review, reviewBody);
  const refused = await call(handlers.review, reviewBody);
  assert.equal(refused.status, 429); assert.equal(refused.body.error, MESSAGES.nebius); assert.equal(refused.body.limit, true);
  assert.equal(calls, 2);
  assert.equal((await call(handlers.review, reviewBody, {})).status, 400, 'client id required');
  assert.equal((await call(handlers.review, { ...reviewBody, task: 'sms' })).status, 400);
  assert.equal((await call(handlers.review, { ...reviewBody, sources: [] })).status, 400);
  assert.equal((await call(handlers.review, reviewBody, undefined, 'GET')).status, 405);
});

test('review caps draft length at 4000 characters before reserving', async () => {
  let seen;
  const handlers = createHandlers({ limiter: createLimiter({ store: memoryStore(), limits: { ...caps, nebius: { global: 9999, client: 9999, ip: 9999 } } }), review: async messages => { seen = messages; return { model: 'm', findings: [], usedTokens: 10 }; } });
  await call(handlers.review, { ...reviewBody, draft: 'x'.repeat(9000) });
  assert.ok(seen.at(-1).content.endsWith('x'.repeat(4000)) && !seen.at(-1).content.includes('x'.repeat(4001)));
});

test('Tavily search and crawl use units, refuse past the cap and release on failure', async () => {
  const store = memoryStore(); const paths = [];
  const limiter = createLimiter({ store, limits: caps });
  let fail = false;
  const handlers = createHandlers({ limiter, tavily: async path => { paths.push(path); if (fail) throw Object.assign(new Error('Tavily request failed (500).'), { status: 502 }); return { results: [] }; } });
  assert.equal((await call(handlers.search, { kind: 'search', query: 'Vamo winter' })).status, 200);
  assert.equal((await call(handlers.search, { kind: 'crawl', url: 'http://vamo.example' })).status, 400);
  fail = true;
  assert.equal((await call(handlers.search, { kind: 'search', query: 'again' })).status, 502);
  fail = false;
  assert.equal((await call(handlers.search, { kind: 'search', query: 'two' })).status, 200);
  assert.equal((await call(handlers.search, { kind: 'search', query: 'three' })).status, 200);
  const refused = await call(handlers.search, { kind: 'search', query: 'four' });
  assert.equal(refused.status, 429); assert.equal(refused.body.error, MESSAGES.tavily);
  assert.equal((await call(handlers.search, { kind: 'crawl', url: 'https://vamo.example' }, { 'x-averill-client': 'client-zzzz', 'x-forwarded-for': '8.8.8.8' })).status, 429, 'crawl costs 5 units, over the per-client cap of 3');
  assert.deepEqual(paths, ['/search', '/search', '/search', '/search']);
});

test('a prefixed Redis URL from the Vercel integration is found and used for counters', async () => {
  const { redisUrlFromEnv, redisStore } = require('../lib/store');
  assert.equal(redisUrlFromEnv({ averill_storage_REDIS_URL: 'redis://x' }), 'redis://x');
  assert.equal(redisUrlFromEnv({ REDIS_URL: 'redis://plain', other_REDIS_URL: 'redis://y' }), 'redis://plain');
  assert.equal(redisUrlFromEnv({}), null);
  const ops = [];
  const fake = { on() {}, async connect() {}, multi() { const chain = { incrBy(k, n) { ops.push(['incrBy', k, n]); return chain; }, expire(k, s) { ops.push(['expire', k, s]); return chain; }, async exec() { return [7, true]; } }; return chain; } };
  const store = redisStore({ url: 'redis://x', createClient: () => fake });
  assert.equal(await store.incrby('k', 3, 60), 7);
  assert.deepEqual(ops, [['incrBy', 'k', 3], ['expire', 'k', 60]]);
});

const askBody = { question: 'Can we say lowest prices guaranteed?', sources: reviewBody.sources };

test('ask charges tokens, validates input, refuses past the cap and releases when nothing was used', async () => {
  const store = memoryStore(); let calls = 0, seen, mode = 'ok';
  const limiter = createLimiter({ store, limits: { ...caps, nebius: { global: 5000, client: 2000, ip: 5000 } } });
  const handlers = createHandlers({ limiter, ask: async messages => {
    calls++; seen = messages;
    if (mode === 'fail') throw Object.assign(new Error('Nebius request failed (500).'), { status: 502 });
    return { model: 'nemotron', answer: 'Do not claim', evidence: [{ sourceTitle: 'brand-and-legal.md', quote: 'Do not claim "lowest prices guaranteed".' }], usedTokens: 900 };
  } });
  const ok = await call(handlers.ask, { ...askBody, question: 'q'.repeat(900) });
  assert.equal(ok.status, 200); assert.equal(ok.body.answer, 'Do not claim'); assert.equal(ok.body.evidence.length, 1);
  assert.ok(seen.at(-1).content.includes('QUESTION: ' + 'q'.repeat(500)) && !seen.at(-1).content.includes('q'.repeat(501)));
  assert.equal(store.counts.get(`nebius:${new Date().toISOString().slice(0, 10)}:ip:9.9.9.9`), 900);
  mode = 'fail';
  assert.equal((await call(handlers.ask, askBody)).status, 502);
  assert.equal(store.counts.get(`nebius:${new Date().toISOString().slice(0, 10)}:ip:9.9.9.9`), 900, 'failed call released its reservation');
  mode = 'ok';
  await call(handlers.ask, askBody);
  const refused = await call(handlers.ask, askBody);
  assert.equal(refused.status, 429); assert.equal(refused.body.error, MESSAGES.nebius); assert.equal(refused.body.limit, true);
  const before = calls;
  assert.equal((await call(handlers.ask, askBody, {})).status, 400, 'client id required');
  assert.equal((await call(handlers.ask, { ...askBody, question: '  ' })).status, 400);
  assert.equal((await call(handlers.ask, { ...askBody, sources: [] })).status, 400);
  assert.equal((await call(handlers.ask, askBody, undefined, 'GET')).status, 405);
  assert.equal(calls, before, 'invalid or refused requests never reach Nebius');
});

test('ask refuses without a usage store', async () => {
  let called = false;
  const handlers = createHandlers({ limiter: null, ask: async () => { called = true; } });
  assert.equal((await call(handlers.ask, askBody)).status, 503);
  assert.equal(called, false);
});

test('nemotronAsk parses the model answer and rejects unreadable output with its usage', async () => {
  const { nemotronAsk } = require('../lib/providers');
  const reply = content => async url => ({ ok: true, status: 200, json: async () => url.endsWith('/models') ? { data: [{ id: 'nvidia/nemotron-super-test' }] } : { choices: [{ message: { content } }], usage: { total_tokens: 321 } } });
  process.env.NEBIUS_MODEL = 'nvidia/nemotron-test';
  try {
    const good = await nemotronAsk([{ role: 'user', content: 'x' }], { key: 'k', fetcher: reply(JSON.stringify({ answer: 'a', evidence: [{ sourceTitle: 't', quote: 'a' }] })) });
    assert.deepEqual([good.answer, good.usedTokens, good.model], ['a', 321, 'nvidia/nemotron-test']);
    await assert.rejects(() => nemotronAsk([{ role: 'user', content: 'x' }], { key: 'k', fetcher: reply('not json') }), error => error.status === 502 && error.usedTokens === 321);
    await assert.rejects(() => nemotronAsk([], { key: '', fetcher: reply('') }), error => error.status === 503);
  } finally { delete process.env.NEBIUS_MODEL; }
});
