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
