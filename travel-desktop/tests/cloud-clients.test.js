const test = require('node:test');
const assert = require('node:assert/strict');
const nebius = require('../src/nebius');
const tavily = require('../src/tavily');

const on = { privacy: { companyAI: true } };
const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
const publicResolver = async () => [{ address: '93.184.216.34', family: 4 }];

test('Nebius chat refuses when company AI is off or text contains credentials', async () => {
  let called = false;
  const fetcher = async () => { called = true; return json({}); };
  await assert.rejects(nebius.chat({ privacy: { companyAI: false } }, { key: 'k', purpose: 'review', model: 'm', messages: [{ role: 'user', content: 'hi' }], fetcher }), /Company AI is off/);
  await assert.rejects(nebius.chat(on, { key: 'k', purpose: 'review', model: 'm', messages: [{ role: 'user', content: 'api_key: abcd1234' }], fetcher }), /credentials/);
  await assert.rejects(nebius.chat(on, { key: 'k', model: 'm', messages: [], fetcher }), /purpose/);
  assert.equal(called, false);
});

test('Nebius chat picks Nemotron Super, retries once on 5xx and reports calls without payloads', async () => {
  nebius.clearCache();
  const calls = [], log = [];
  const stop = nebius.onCall(entry => log.push(entry));
  let failures = 1;
  const fetcher = async (url, options) => {
    calls.push(url);
    if (url.endsWith('/models')) return json({ data: [{ id: 'meta/llama' }, { id: 'nvidia/nemotron-nano' }, { id: 'nvidia/nemotron-3-super-120b' }] });
    if (failures-- > 0) return json({}, 503);
    assert.equal(JSON.parse(options.body).model, 'nvidia/nemotron-3-super-120b');
    return json({ choices: [{ message: { content: '{"ok":true}' } }] });
  };
  try {
    const result = await nebius.chat(on, { key: 'retry-key', purpose: 'review', messages: [{ role: 'user', content: 'secret draft text' }], fetcher });
    assert.equal(result.model, 'nvidia/nemotron-3-super-120b');
    assert.deepEqual(nebius.parseJson(result.content), { ok: true });
    assert.equal(calls.filter(url => url.endsWith('/chat/completions')).length, 2);
    assert.ok(log.every(entry => !JSON.stringify(entry).includes('secret draft')));
  } finally { stop(); }
});

test('Nebius embeddings keep input order and reject mismatched responses', async () => {
  const fetcher = async (_url, options) => {
    const input = JSON.parse(options.body).input;
    return json({ data: input.map((_, index) => ({ index, embedding: [index] })).reverse() });
  };
  const result = await nebius.embed(on, { key: 'k', model: 'nvidia/embed', texts: ['a', 'b', 'c'], batch: 2, fetcher });
  assert.deepEqual(result.vectors, [[0], [1], [0]]);
  await assert.rejects(nebius.embed(on, { key: 'k', model: 'nvidia/embed', texts: ['a'], fetcher: async () => json({ data: [] }) }), /unexpected number/);
});

test('Tavily outbound guard blocks credentials and repeated internal source text', async () => {
  const internal = 'Do not claim lowest prices guaranteed in any Winter Escapes 2027 email because legal has not approved it for this campaign.';
  assert.throws(() => tavily.outbound('password: hunter22'), /credentials/);
  assert.throws(() => tavily.outbound(`Is it true that ${internal}`, { internalTexts: [internal] }), /internal company material/);
  assert.equal(tavily.outbound('Copenhagen Christmas market opening date 2026', { internalTexts: [internal] }), 'Copenhagen Christmas market opening date 2026');
});

test('Tavily search keeps only HTTPS results and the requested depth', async () => {
  let body;
  const fetcher = async (_url, options) => { body = JSON.parse(options.body); return json({ answer: 'Opens 14 November.', results: [{ title: 'A', url: 'https://a.example/x', content: 'x' }, { title: 'B', url: 'http://b.example', content: 'y' }] }); };
  const result = await tavily.search('Copenhagen market opening', { key: 'k', depth: 'advanced', answer: true, fetcher });
  assert.equal(body.search_depth, 'advanced');
  assert.equal(result.results.length, 1);
  assert.equal(result.answer, 'Opens 14 November.');
});

test('Tavily extract and crawl refuse private hosts and keep same-host pages', async () => {
  await assert.rejects(tavily.extract(['https://intranet.local/x'], { key: 'k', resolver: async () => [{ address: '10.0.0.2', family: 4 }], fetcher: async () => json({}) }), /Private, local/);
  await assert.rejects(tavily.extract(['http://site.example/'], { key: 'k', resolver: publicResolver, fetcher: async () => json({}) }), /HTTPS/);
  const fetcher = async () => json({ results: [{ url: 'https://vamo.example/offers', raw_content: 'From EUR 499' }, { url: 'https://other.example/', raw_content: 'x' }] });
  const pages = await tavily.crawl('https://vamo.example/', { key: 'k', resolver: publicResolver, fetcher });
  assert.deepEqual(pages.map(page => page.url), ['https://vamo.example/offers']);
});

test('cloud activity stays per person, keeps no payload and gives admins totals only', () => {
  const activity = require('../src/cloud-activity');
  const data = {};
  activity.record(data, 'a', { service: 'nebius', purpose: 'review', ok: true, query: 'private text' });
  activity.record(data, 'b', { service: 'tavily', purpose: 'fact-check', ok: false });
  assert.equal(activity.forPerson(data, 'a').length, 1);
  assert.equal(activity.forPerson(data, 'a')[0].query, undefined);
  assert.equal(activity.forPerson(data, 'c').length, 0);
  assert.deepEqual(activity.summary(data), { nebius: { calls: 1, failed: 0 }, tavily: { calls: 1, failed: 1 } });
});
