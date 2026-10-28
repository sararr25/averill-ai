const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const judgeDemo = require('../src/judge-demo');
const judgeServer = require('../src/judge-server');

const draft = 'Winter Escapes 2027 is here. Lowest prices guaranteed — book before the end of October.';
const field = { kind: 'textarea', label: 'Post text', value: draft };
let root, data;
test.before(async () => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-server-')); data = (await judgeDemo.create(root, path.join(__dirname, '..', 'demo-company'))).data; });
test.after(() => fs.rmSync(root, { recursive: true, force: true }));
const reply = (status, body) => async () => ({ ok: status === 200, status, json: async () => body });

test('only the judge demo workspace may use the demo server', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-real-'));
  try {
    const real = workspace.create(dir, 'Real Co', 'Owner');
    let called = false;
    await assert.rejects(() => judgeServer.review(real, 'linkedin', draft, field, { fetcher: async () => { called = true; } }), /only available in the judge demo/);
    assert.equal(called, false);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('sends a capped request with an install id and keeps only findings whose quotes are verbatim', async () => {
  let sent;
  const fetcher = async (url, options) => { sent = { url, headers: options.headers, body: JSON.parse(options.body) }; return reply(200, { model: 'nvidia/nemotron-test', findings: [
    { draftQuote: 'book before the end of October', issue: 'Invented urgency', sourceTitle: 'linkedin-campaign.md', sourceQuote: 'Avoid invented discounts, availability or booking guarantees.', suggestion: 'Remove the deadline.' },
    { draftQuote: 'book before the end of October', issue: 'Typographic quotes still match', sourceTitle: 'current-brief.md', sourceQuote: "Do not claim 'lowest prices guaranteed' or imply a price guarantee.", suggestion: 'x' },
    { draftQuote: 'free hotel upgrade', issue: 'Not in the draft', sourceTitle: 'linkedin-campaign.md', sourceQuote: 'Avoid invented discounts', suggestion: 'x' },
    { draftQuote: 'Winter Escapes 2027 is here', issue: 'Invented source text', sourceTitle: 'linkedin-campaign.md', sourceQuote: 'Every post must mention snow.', suggestion: 'x' },
  ] })(); };
  const result = await judgeServer.review(data, 'linkedin', draft, field, { fetcher, endpoint: 'https://judge.example' });
  assert.equal(sent.url, 'https://judge.example/api/review');
  assert.match(sent.headers['X-Averill-Client'], /^[0-9a-f-]{36}$/);
  assert.equal(sent.body.draft, draft);
  assert.ok(sent.body.sources.length >= 1 && sent.body.sources.length <= 5 && sent.body.sources.every(source => source.text.length <= 3000));
  assert.equal(result.mode, 'model');
  const ai = result.findings.filter(item => item.confidence === 'model-suggestion');
  assert.equal(ai.length, 1, 'duplicate excerpt, unseen draft text and invented source text are dropped');
  assert.equal(ai[0].source.title, 'linkedin-campaign.md');
  assert.ok(result.findings.some(item => item.type === 'forbidden-claim'), 'local findings are kept');
});

test('a daily limit shows the server message verbatim and keeps the local check', async () => {
  const message = 'Daily AI limit reached. The approved-rules check still works.';
  const result = await judgeServer.review(data, 'linkedin', draft, field, { fetcher: reply(429, { error: message, limit: true }) });
  assert.equal(result.aiLimit, true);
  assert.ok(result.status.endsWith(message));
  assert.equal(result.aiNotice, message);
  assert.equal(result.mode, 'local');
  assert.ok(result.findings.some(item => item.type === 'forbidden-claim'));
});

test('an outage says so explicitly and keeps the local check', async () => {
  const down = await judgeServer.review(data, 'linkedin', draft, field, { fetcher: async () => { throw new Error('offline'); } });
  assert.equal(down.aiUnavailable, true);
  assert.match(down.status, /could not be reached\. The approved-rules check above still applies\./);
  const broken = await judgeServer.review(data, 'linkedin', draft, field, { fetcher: reply(503, { error: 'Usage limits are not configured on this server.' }) });
  assert.match(broken.status, /unavailable \(503\)/);
  assert.ok(broken.findings.length >= 1);
});

// T1.3: the question box through the judge server.
const question = 'Can we claim lowest prices guaranteed?';
const quoteOf = async () => {
  const { relevantSources } = require('../src/workspace-answer');
  const hit = relevantSources(data, question)[0];
  return { title: hit.source.title, quote: hit.passage.quote };
};

test('askPlan lists what leaves the Mac, and design or unmatched questions stay local', () => {
  const plan = judgeServer.askPlan(data, question);
  assert.match(plan.items[0], /lowest prices guaranteed/);
  assert.match(plan.items[1], /approved source/);
  assert.equal(judgeServer.askPlan(data, 'Which font should headlines use?'), null);
  assert.equal(judgeServer.askPlan(data, 'zzzz qqqq xxxx'), null);
  assert.throws(() => judgeServer.askPlan(data, 'lowest prices password: hunter2hunter2'), /credentials/);
});

test('a design question never calls the server', async () => {
  let called = false;
  const result = await judgeServer.ask(data, 'Which font should headlines use?', { fetcher: async () => { called = true; } });
  assert.equal(called, false);
  assert.equal(result.mode, 'local'); assert.equal(result.ai, undefined);
});

test('ask sends a capped request and keeps a Nemotron answer only when its quotes are verbatim', async () => {
  const { title, quote } = await quoteOf();
  let sent;
  const good = async (url, options) => { sent = { url, headers: options.headers, body: JSON.parse(options.body) }; return reply(200, { model: 'nvidia/nemotron-test', answer: quote.slice(0, 20), evidence: [{ sourceTitle: title, quote }] })(); };
  const result = await judgeServer.ask(data, question, { fetcher: good, endpoint: 'https://judge.example' });
  assert.equal(sent.url, 'https://judge.example/api/ask');
  assert.match(sent.headers['X-Averill-Client'], /^[0-9a-f-]{36}$/);
  assert.equal(sent.body.question, question);
  assert.ok(sent.body.sources.length >= 1 && sent.body.sources.length <= 5 && sent.body.sources.every(source => source.text.length <= 3000));
  assert.equal(result.ai.status, 'suggestion'); assert.equal(result.ai.sources[0].quote, quote);
  assert.match(result.text, /Matching passage/, 'the local answer stays next to it');
  // Unquoted claim, invented quote, and an answer outside the quote are all dropped with an explicit notice.
  for (const bad of [
    { answer: 'Yes, you can.', evidence: [] },
    { answer: 'Yes, you can.', evidence: [{ sourceTitle: title, quote: 'This sentence is not in any approved source.' }] },
    { answer: 'Yes, you can.', evidence: [{ sourceTitle: title, quote }] },
    { answer: quote.slice(0, 20), evidence: [{ sourceTitle: 'other.md', quote }] },
  ]) {
    const dropped = await judgeServer.ask(data, question, { fetcher: reply(200, { model: 'm', ...bad }) });
    assert.equal(dropped.ai.status, 'unverified'); assert.equal(dropped.ai.text, undefined);
    assert.match(dropped.ai.notice, /could not be verified|no answer that could be verified/);
    assert.match(dropped.text, /Matching passage/);
  }
});

test('ask shows the limit message verbatim and an explicit outage notice, with the local answer both times', async () => {
  const limit = await judgeServer.ask(data, question, { fetcher: reply(429, { error: 'Daily AI limit reached. Try again tomorrow.', limit: true }) });
  assert.deepEqual([limit.ai.status, limit.ai.notice], ['limit', 'Daily AI limit reached. Try again tomorrow.']);
  const down = await judgeServer.ask(data, question, { fetcher: async () => { throw new Error('offline'); } });
  assert.equal(down.ai.status, 'unavailable'); assert.match(down.ai.notice, /could not be reached/);
  const broken = await judgeServer.ask(data, question, { fetcher: reply(503, {}) });
  assert.match(broken.ai.notice, /unavailable \(503\)/);
  for (const result of [limit, down, broken]) assert.match(result.text, /Matching passage/);
});

test('ask is refused outside the judge demo workspace', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-real-'));
  try {
    const real = workspace.create(dir, 'Real Co', 'Owner');
    await assert.rejects(() => judgeServer.ask(real, question, { fetcher: async () => {} }), /only available in the judge demo/);
    assert.throws(() => judgeServer.askPlan(real, question), /only available in the judge demo/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
