const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const freshness = require('../src/source-freshness');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-fresh-'));
const legal = path.join(root, 'legal.md');
fs.writeFileSync(legal, 'Field requirement: instagram | disclosure | "Paid partnership".\n');
const quote = 'Field requirement: instagram | disclosure | "Paid partnership".';
const make = () => ({ privacy: { companyAI: true }, activePersonId: 'lead', people: [{ id: 'owner', role: 'admin', department: null }, { id: 'lead', role: 'lead', department: 'Marketing' }, { id: 'staff', role: 'employee', department: 'Marketing' }],
  sources: [{ id: 'legal', title: 'Legal', department: 'Marketing', scope: 'department', status: 'approved', version: '1', ownerId: 'owner', priority: 10, textPath: legal, aiAllowed: true, confidentiality: 'internal' }] });
const ok = body => ({ ok: true, status: 200, json: async () => body });

test('leads mark public dependencies for rules they manage; employees cannot', () => {
  const data = make();
  data.activePersonId = 'staff';
  assert.throws(() => freshness.mark(data, { sourceId: 'legal', quote, query: 'Instagram paid partnership label' }), /lead or administrator/);
  data.activePersonId = 'lead';
  assert.throws(() => freshness.mark(data, { sourceId: 'legal', quote, query: 'api_key: abcd1234' }), /credentials/);
  const entry = freshness.mark(data, { sourceId: 'legal', quote, query: 'Instagram paid partnership label', domains: ['help.instagram.com', 'not a domain'] });
  assert.deepEqual(entry.domains, ['help.instagram.com']);
  assert.equal(freshness.snapshot(data).dependencies.length, 1);
  data.activePersonId = 'staff';
  assert.equal(freshness.snapshot(data).dependencies.length, 0);
});

test('only admins run checks; only stored queries are sent; approval never changes', async () => {
  const data = make();
  freshness.mark(data, { sourceId: 'legal', quote, query: 'Instagram paid partnership label', domains: ['help.instagram.com'] });
  await assert.rejects(freshness.run(data, { tavilyKey: 't' }), /Administrator/);
  data.activePersonId = 'owner';
  const sent = [];
  const fetcher = async (url, options) => {
    if (url.endsWith('/models')) return ok({ data: [{ id: 'nvidia/nemotron-super' }] });
    const body = JSON.parse(options.body); sent.push({ url, body });
    if (url.includes('tavily')) return ok({ results: [{ title: 'Branded content', url: 'https://help.instagram.com/x', content: 'Creators must now use the label "Paid partnership with" followed by the brand.' }] });
    return ok({ choices: [{ message: { content: JSON.stringify({ verdict: 'may-be-outdated', url: 'https://help.instagram.com/x', snippet: 'must now use the label "Paid partnership with"', explanation: 'The public label wording changed.' }) } }] });
  };
  assert.equal(await freshness.run(data, { tavilyKey: 't', nebiusKey: 'n', fetcher }), 1);
  const tavilyCall = sent.find(item => item.url.includes('tavily'));
  assert.equal(tavilyCall.body.query, 'Instagram paid partnership label');
  assert.deepEqual(tavilyCall.body.include_domains, ['help.instagram.com']);
  const view = freshness.snapshot(data);
  assert.equal(view.queue.length, 1);
  assert.equal(view.dependencies[0].lastCheck.verdict, 'may-be-outdated');
  assert.equal(data.sources[0].status, 'approved');
  const invented = async (url, options) => url.includes('tavily') || url.endsWith('/models') ? fetcher(url, options) : ok({ choices: [{ message: { content: JSON.stringify({ verdict: 'may-be-outdated', url: 'https://help.instagram.com/x', snippet: 'text that was never returned', explanation: '' }) } }] });
  await freshness.run(data, { tavilyKey: 't', nebiusKey: 'n', fetcher: invented });
  assert.equal(freshness.snapshot(data).dependencies[0].lastCheck.verdict, 'unclear');
});
