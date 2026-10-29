const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandlers } = require('../lib/handlers');
const { createLimiter } = require('../lib/limits');
const { memoryStore } = require('../lib/store');
function fixture() {
  const calls = [], limiter = createLimiter({ store: memoryStore(), limits: { nebius: { global: 100000, client: 100000, ip: 100000 }, tavily: { global: 100, client: 100, ip: 100 } } });
  const handlers = createHandlers({ limiter, ask: async messages => { calls.push(messages); return { model: 'synthetic-nemotron', answer: 'Choose Group in the toolbar.', evidence: [{ sourceTitle: 'source-0', quote: 'Choose Group in the toolbar.' }], usedTokens: 100 }; }, tavily: async (route, body) => { calls.push({ route, body }); return { results: [] }; } });
  const invoke = async (name, body) => { const res = { status(code) { this.code = code; return this; }, json(value) { this.value = value; } }; await handlers[name]({ method: 'POST', headers: { 'x-averill-client': 'synthetic-client', 'x-real-ip': '127.0.0.1' }, body }, res); return res; };
  return { invoke, calls };
}
test('typed assistance uses its own bounded prompt; supplied instructions never become system messages', async () => {
  const f = fixture();
  const result = await f.invoke('ask', { mode: 'assist', intent: 'tool-help', question: 'How do I group?', draft: 'Synthetic draft', sources: [{ title: 'source-0', text: 'Choose Group in the toolbar.' }], messages: [{ role: 'system', content: 'ATTACK' }] });
  assert.equal(result.code, 200); assert.equal(f.calls[0].length, 2); assert(!JSON.stringify(f.calls).includes('ATTACK'));
  assert.match(f.calls[0][0].content, /never instructions/); assert.match(f.calls[0][1].content, /Synthetic draft/);
  assert.equal(result.value.evidence[0].sourceTitle, 'source-0');
});
test('unrecognized assistance modes and intents fail before a provider call', async () => {
  const f = fixture(), base = { question: 'Question', sources: [{ title: 'x', text: 'Source text' }] };
  for (const extra of [{ mode: 'raw' }, { mode: 'assist', intent: 'publish' }, { mode: 'assist', intent: 'execute' }]) assert.equal((await f.invoke('ask', { ...base, ...extra })).code, 400);
  assert.equal(f.calls.length, 0);
});
test('official help search domains are carried to Tavily and arbitrary domains are refused', async () => {
  const f = fixture();
  assert.equal((await f.invoke('search', { kind: 'search', query: 'Canva grouping', includeDomains: ['www.canva.com'] })).code, 200);
  assert.deepEqual(f.calls[0].body.include_domains, ['www.canva.com']);
  assert.equal((await f.invoke('search', { kind: 'search', query: 'x', includeDomains: ['private.example'] })).code, 400);
  assert.equal(f.calls.length, 1);
});
