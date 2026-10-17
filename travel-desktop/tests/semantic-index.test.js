const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const semantic = require('../src/semantic-index');
const { answerWorkspace } = require('../src/workspace-answer');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-semantic-'));
const write = (name, text) => { const file = path.join(root, name); fs.writeFileSync(file, text); return file; };
const legal = write('legal.md', 'Brand and legal guidance.\n\nA price guarantee has not been approved; remove the phrase from every channel.\n\nEvery marketing email must include the unsubscribe footer.\n');
const people = write('people.md', 'Holiday requests go to your manager two weeks ahead.\n');
const make = () => ({ privacy: { companyAI: true }, activePersonId: 'staff', people: [{ id: 'owner', role: 'admin', department: null }, { id: 'staff', role: 'employee', department: 'Marketing' }],
  sources: [
    { id: 'legal', title: 'Legal', department: 'Marketing', scope: 'department', status: 'approved', version: '1', sha256: 'a', ownerId: 'owner', priority: 10, textPath: legal, aiAllowed: true, confidentiality: 'internal' },
    { id: 'people', title: 'People policy', department: 'People', scope: 'department', status: 'approved', version: '1', sha256: 'b', ownerId: 'owner', priority: 10, textPath: people, aiAllowed: true, confidentiality: 'internal' },
    { id: 'secret', title: 'Restricted', department: 'Marketing', scope: 'department', status: 'approved', version: '1', sha256: 'c', ownerId: 'owner', priority: 10, textPath: people, aiAllowed: false, confidentiality: 'restricted' },
  ] });
// Fake embeddings: dimension 0 = about prices/promises, 1 = about email footers, 2 = about holidays.
const vector = text => { const t = text.toLowerCase(); return [/price|guarantee|promise|cheapest/.test(t) ? 1 : 0, /footer|unsubscribe/.test(t) ? 1 : 0, /holiday|vacation/.test(t) ? 1 : 0, 0.01]; };
const sent = [];
const fetcher = async (url, options) => {
  if (url.endsWith('/models')) return { ok: true, json: async () => ({ data: [{ id: 'nvidia/embed-test' }, { id: 'nvidia/nemotron-super' }] }) };
  const body = JSON.parse(options.body); sent.push(...(body.input || []));
  return { ok: true, status: 200, json: async () => ({ data: body.input.map((text, index) => ({ index, embedding: vector(text) })) }) };
};

test('index embeds only approved consented sources and keeps vectors local', async () => {
  const data = make(); data.activePersonId = 'owner';
  const result = await semantic.build(root, data, { key: 'k', fetcher });
  assert.equal(result.model, 'nvidia/embed-test');
  assert.ok(sent.some(text => text.includes('price guarantee')));
  assert.equal(semantic.status(root, data).pending, 0);
  const again = await semantic.build(root, data, { key: 'k', fetcher });
  assert.equal(again.embedded, 0, 'unchanged sources are not re-embedded');
});

test('search finds passages by meaning and never returns sources the person cannot use', async () => {
  const data = make();
  const found = await semantic.search(root, data, 'Can I promise customers the cheapest deal?', { key: 'k', fetcher });
  assert.equal(found.mode, 'semantic');
  assert.equal(found.results[0].source.id, 'legal');
  assert.ok(/price guarantee/.test(found.results[0].quote));
  assert.ok(found.results.every(hit => hit.source.id !== 'people' && hit.source.id !== 'secret'));
  data.sources[0].version = '2';
  assert.equal((await semantic.search(root, data, 'promise', { key: 'k', fetcher })).results.length, 0, 'stale chunks are ignored');
});

test('answers use semantic passages but still require an exact model quote', async () => {
  const data = make();
  const found = await semantic.search(root, data, 'Can I promise customers the cheapest deal?', { key: 'k', fetcher });
  const original = global.fetch;
  global.fetch = async url => url.endsWith('/models') ? { ok: true, json: async () => ({ data: [{ id: 'nvidia/nemotron-super' }] }) } : { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify({ answer: 'A price guarantee has not been approved', evidence: [{ source_id: 'legal', quote: 'A price guarantee has not been approved; remove the phrase from every channel.' }] }) } }] }) };
  try {
    const answer = await answerWorkspace(data, 'Can I promise customers the cheapest deal?', 'k', 'nvidia/nemotron-super', found.results);
    assert.equal(answer.mode, 'model');
    assert.equal(answer.sources[0].reason, 'Exact passage · found by meaning');
  } finally { global.fetch = original; }
  semantic.removeSource(root, 'legal');
  assert.equal((await semantic.search(root, data, 'promise', { key: 'k', fetcher })).results.length, 0);
});
