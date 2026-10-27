const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const rules = require('../src/rules');
const { localReview } = require('../src/task-review');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-rules-'));
const write = (name, text) => { const file = path.join(root, name); fs.writeFileSync(file, text); return file; };
// A non-Vamo company with no hand-written "Field requirement:" lines.
const brief = write('brief.md', 'Nordlys Outdoor autumn brief.\nThe newsletter goes to Norwegian hiking club members only.\nNever say "free shipping forever" in any channel.\nEvery newsletter must end with: "Sent by Nordlys Outdoor. Unsubscribe in one click."\nPublish the newsletter on 2026-11-03.\n');
const calendar = write('calendar.md', 'Calendar: newsletter on 2026-11-04 at 08:00.\nMarketing posts must not use "best in the world".\n');
const people = [{ id: 'owner', role: 'admin', department: null }, { id: 'lead', role: 'lead', department: 'Marketing' }, { id: 'sales-lead', role: 'lead', department: 'Sales' }, { id: 'staff', role: 'employee', department: 'Marketing' }];
const source = (id, textPath, extra = {}) => ({ id, title: id, department: 'Marketing', scope: 'department', status: 'approved', version: '1', approvedAt: '2026-10-01', ownerId: 'owner', priority: 10, textPath, aiAllowed: true, confidentiality: 'internal', ...extra });
const fresh = () => ({ people, activePersonId: 'owner', privacy: { companyAI: true }, sources: [source('brief', brief), source('calendar', calendar)] });
const reply = rulesList => async (url) => url.endsWith('/models') ? { ok: true, json: async () => ({ data: [{ id: 'nvidia/nemotron-super' }] }) } : { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify({ rules: rulesList }) } }] }) };

test('deterministic rules come from explicit source lines and inherit source approval', () => {
  const data = fresh();
  const active = rules.active(data);
  assert.ok(active.some(rule => rule.kind === 'claim-forbidden' && rule.value === 'best in the world' && rule.line === 2));
  data.sources[1].status = 'superseded';
  assert.ok(!rules.active(data).some(rule => rule.value === 'best in the world'));
});

test('Nemotron extraction keeps only candidates whose quote is exact source text', async () => {
  const data = fresh();
  const result = await rules.extract(data, data.sources[0], { key: 'k', fetcher: reply([
    { kind: 'claim-forbidden', task: 'any', value: 'free shipping forever', quote: 'Never say "free shipping forever" in any channel.' },
    { kind: 'audience', task: 'email', value: 'Norwegian hiking club members', quote: 'The newsletter goes to Norwegian hiking club members only.' },
    { kind: 'date', task: 'email', value: '2026-11-03', quote: 'Publish the newsletter on 2026-11-03.' },
    { kind: 'required-text', task: 'email', value: 'Sent by Nordlys Outdoor. Unsubscribe in one click.', quote: 'Every newsletter must end with: "Sent by Nordlys Outdoor. Unsubscribe in one click."' },
    { kind: 'claim-approved', task: 'any', value: 'invented', quote: 'This quote does not exist in the brief.' },
    { kind: 'made-up-kind', task: 'email', value: 'x', quote: 'Publish the newsletter on 2026-11-03.' },
  ]) });
  assert.equal(result.candidates.length, 4);
  assert.equal(result.rejected, 2);
  assert.equal(rules.propose(data, data.sources[0], result.candidates).length, 4);
  assert.equal(rules.propose(data, data.sources[0], result.candidates).length, 0, 'duplicates are not proposed twice');
  assert.ok(data.rules.every(rule => rule.status === 'proposed'));
});

test('extraction refuses sources without Nebius consent and when company AI is off', async () => {
  const data = fresh();
  data.sources[0].aiAllowed = false;
  await assert.rejects(rules.extract(data, data.sources[0], { key: 'k', fetcher: reply([]) }), /consent/);
  data.sources[0].aiAllowed = true; data.privacy.companyAI = false;
  await assert.rejects(rules.extract(data, data.sources[0], { key: 'k', fetcher: reply([]) }), /Company AI is off/);
});

test('only approved model rules guide review, so a new company gets findings without hand-written rule lines', () => {
  const data = fresh();
  rules.propose(data, data.sources[0], [
    { kind: 'claim-forbidden', task: 'any', value: 'free shipping forever', quote: 'Never say "free shipping forever" in any channel.' },
    { kind: 'required-text', task: 'email', value: 'Sent by Nordlys Outdoor. Unsubscribe in one click.', quote: 'Every newsletter must end with: "Sent by Nordlys Outdoor. Unsubscribe in one click."' },
    { kind: 'audience', task: 'email', value: 'Norwegian hiking club members', quote: 'The newsletter goes to Norwegian hiking club members only.' },
  ]);
  const draft = 'Autumn gear is here, with free shipping forever!';
  assert.equal(localReview(data, 'email', draft).findings.length, 0, 'proposals do not guide work');
  for (const rule of data.rules) rules.decide(data, rule.id, 'approved');
  const review = localReview(data, 'email', draft);
  assert.ok(review.findings.some(item => item.type === 'forbidden-claim' && item.observedExcerpt === 'free shipping forever'));
  assert.ok(review.findings.some(item => item.type === 'missing-required-text'));
  assert.ok(review.findings.every(item => fs.readFileSync(brief, 'utf8').includes(item.source.quote)));
  const field = localReview(data, 'email', draft, { label: 'Audience', value: 'All subscribers' });
  assert.ok(field.findings.some(item => item.type === 'field-requirement' && /Norwegian hiking/.test(item.suggestion)));
  data.sources[0].version = '2';
  assert.ok(!localReview(data, 'email', draft).findings.some(item => item.confidence === 'approved-rule'), 'rules of an older source version stop applying');
});

test('rule decisions follow source authority and rejections need a reason', () => {
  const data = fresh();
  data.sources.push(source('policy', brief, { scope: 'company', department: 'Company' }));
  const [dept] = rules.propose(data, data.sources[0], [{ kind: 'date', task: 'email', value: '2026-11-03', quote: 'Publish the newsletter on 2026-11-03.' }]);
  const [company] = rules.propose(data, data.sources[2], [{ kind: 'date', task: 'email', value: '2026-11-03', quote: 'Publish the newsletter on 2026-11-03.' }]);
  data.activePersonId = 'staff';
  assert.throws(() => rules.decide(data, dept.id, 'approved'), /lead or administrator/);
  assert.deepEqual(rules.pending(data), []);
  data.activePersonId = 'sales-lead';
  assert.throws(() => rules.decide(data, dept.id, 'approved'), /lead or administrator/);
  data.activePersonId = 'lead';
  assert.throws(() => rules.decide(data, company.id, 'approved'), /Administrator access required/);
  assert.throws(() => rules.decide(data, dept.id, 'rejected'), /reason/);
  assert.equal(rules.decide(data, dept.id, 'approved', { value: '2026-11-03' }).status, 'approved');
  assert.ok(rules.pending(data).every(rule => rule.id !== company.id), 'leads do not see company-wide proposals');
});

test('conflicts only for single-valued kinds; additive rules from different sources stay active', () => {
  const data = fresh();
  rules.propose(data, data.sources[0], [{ kind: 'date', task: 'email', value: '2026-11-03', quote: 'Publish the newsletter on 2026-11-03.' }]);
  rules.propose(data, data.sources[1], [{ kind: 'date', task: 'email', value: '2026-11-04', quote: 'Calendar: newsletter on 2026-11-04 at 08:00.' }]);
  const found = rules.conflicts(data);
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, 'date');
  const forbidden = rules.active(data).filter(rule => rule.kind === 'claim-forbidden');
  assert.ok(forbidden.length >= 1);
  assert.ok(!found.some(item => item.kind === 'claim-forbidden'));
  assert.ok(localReview(data, 'email', 'best in the world').findings.some(item => item.type === 'forbidden-claim'), 'sources are not excluded by a candidate conflict');
});

test('hashtag rules: parsed from explicit lines, matched case-insensitively, and each finding cites its exact line', () => {
  const tags = write('tags.md', 'Hashtags.\nHashtag rule: instagram | required | "#nordlys".\nHashtag rule: instagram | max | "2".\nHashtag rule: any | banned | "#cheapest".\nHashtag rule: instagram | paid-required | "#ad".\n');
  const data = { ...fresh(), sources: [source('tags', tags)] };
  assert.deepEqual(rules.parseHashtagLine('Hashtag rule: any | banned | "#cheapest".'), { task: 'any', type: 'banned', value: '#cheapest' });
  assert.equal(rules.parseHashtagLine('Hashtag rule: tiktok | max | "3".'), null);
  assert.deepEqual(rules.hashtagsIn('a #Nordlys b #nordlys c#x https://x.test/#anchor #ad'), ['#Nordlys', '#ad']);
  assert.equal(rules.active(data).filter(rule => rule.kind === 'hashtag').length, 4);
  const types = text => localReview(data, 'instagram', text).findings.map(f => `${f.type}:${f.source.quote}`);
  assert.deepEqual(types('Trip #NORDLYS #hike'), []);
  assert.deepEqual(types('Trip #hike'), ['hashtag-missing:Hashtag rule: instagram | required | "#nordlys".']);
  assert.deepEqual(types('Trip #nordlys #Cheapest'), ['hashtag-banned:Hashtag rule: any | banned | "#cheapest".']);
  assert.deepEqual(types('Trip #nordlys #a #b'), ['hashtag-too-many:Hashtag rule: instagram | max | "2".']);
  assert.deepEqual(types('Paid partnership #nordlys'), ['hashtag-missing:Hashtag rule: instagram | paid-required | "#ad".']);
  assert.deepEqual(localReview(data, 'linkedin', 'Trip #hike').findings, [], 'instagram rules do not apply to LinkedIn');
  assert.deepEqual(localReview(data, 'instagram', 'Trip #hike', { kind: 'select', label: 'Audience', value: 'x' }).findings, [], 'only caption fields are checked');
});
