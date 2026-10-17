const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const site = require('../src/public-site');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-site-'));
const brief = path.join(root, 'brief.md');
fs.writeFileSync(brief, 'Remove "lowest prices guaranteed" from every channel.\nField requirement: email | audience | "Travel subscribers — Denmark".\n');
const resolver = async () => [{ address: '93.184.216.34', family: 4 }];
const make = role => ({ privacy: { companyAI: true }, activePersonId: 'p', people: [{ id: 'p', role, department: 'Marketing' }],
  sources: [{ id: 'brief', title: 'Brief', department: 'Marketing', scope: 'department', status: 'approved', version: '2', ownerId: 'p', priority: 10, textPath: brief, aiAllowed: true, confidentiality: 'internal' }] });
const pages = [{ url: 'https://vamo.example/', raw_content: 'Winter escapes. Lowest prices guaranteed on every city break.\nFor all travellers in Europe.' }, { url: 'https://evil.example/', raw_content: 'x' }];
const ok = body => ({ ok: true, status: 200, json: async () => body });

test('only admins configure the website; private hosts and non-HTTPS addresses are refused', async () => {
  await assert.rejects(site.configure(make('lead'), 'https://vamo.example/', resolver), /Administrator/);
  await assert.rejects(site.configure(make('admin'), 'http://vamo.example/', resolver), /HTTPS/);
  await assert.rejects(site.configure(make('admin'), 'https://intranet/', async () => [{ address: '192.168.1.4', family: 4 }]), /Private/);
  assert.equal((await site.configure(make('admin'), 'https://vamo.example/', resolver)).url, 'https://vamo.example/');
  assert.equal(site.snapshot(make('employee')), null);
});

test('crawl keeps same-host pages; comparison finds forbidden claims and verified model contradictions', async () => {
  const data = make('admin');
  await site.configure(data, 'https://vamo.example/', resolver);
  assert.equal(await site.crawl(data, { key: 't', resolver, fetcher: async () => ok({ results: pages }) }), 1);
  const fetcher = async url => url.endsWith('/models') ? ok({ data: [{ id: 'nvidia/nemotron-super' }] }) : ok({ choices: [{ message: { content: JSON.stringify({ findings: [
    { rule_index: 1, page_quote: 'For all travellers in Europe.', summary: 'The page targets all of Europe; the approved audience is Denmark.' },
    { rule_index: 1, page_quote: 'A sentence that is not on the page.', summary: 'x' },
    { rule_index: 99, page_quote: 'Winter escapes.', summary: 'x' },
  ] }) } }] });
  const findings = await site.compare(data, { key: 'n', fetcher });
  assert.ok(findings.some(item => item.method === 'exact-rule' && /lowest prices guaranteed/i.test(item.pageQuote)));
  assert.ok(findings.some(item => item.method === 'model-validated' && item.pageQuote === 'For all travellers in Europe.'));
  assert.equal(findings.length, 2);
  assert.ok(findings.every(item => fs.readFileSync(brief, 'utf8').includes(item.source.quote)));
  assert.ok(!JSON.stringify(site.snapshot(data)).includes('Winter escapes.'), 'page text stays in the main process');
});

test('website decisions need a reason and survive a new comparison', async () => {
  const data = make('admin');
  await site.configure(data, 'https://vamo.example/', resolver);
  await site.crawl(data, { key: 't', resolver, fetcher: async () => ok({ results: pages }) });
  const [first] = await site.compare(data, { useModel: false });
  assert.throws(() => site.decide(data, first.id, 'fix-site', ''), /reason/);
  site.decide(data, first.id, 'fix-site', 'Marketing will update the hero copy');
  const again = await site.compare(data, { useModel: false });
  assert.equal(again.find(item => item.id === first.id).decision.action, 'fix-site');
  assert.equal(data.sources[0].status, 'approved', 'website findings never change source approval');
});
