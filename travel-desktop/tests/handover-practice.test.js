const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const briefing = require('../src/version-briefing');
const practice = require('../src/rule-exercises');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-handover-'));
const sources = path.resolve(__dirname, '../sources');
const write = (name, text) => { const file = path.join(root, name); fs.writeFileSync(file, text); return file; };
const v1 = write('v1.md', 'Field requirement: email | audience | "All subscribers".\nField requirement: email | date | "2026-10-08".\nDo not claim "best deal ever".\n');
const v2 = write('v2.md', 'Field requirement: email | audience | "Travel subscribers — Denmark".\nField requirement: email | date | "2026-10-15".\nField requirement: email | time | "10:00".\nDo not claim "lowest prices guaranteed".\n');
const people = [{ id: 'owner', role: 'admin', department: null }, { id: 'lead', role: 'lead', department: 'Marketing' }, { id: 'staff', role: 'employee', department: 'Marketing' }, { id: 'other', role: 'employee', department: 'Marketing' }];
const base = { department: 'Marketing', scope: 'department', ownerId: 'owner', priority: 10, aiAllowed: true, confidentiality: 'internal' };
const make = () => ({ privacy: { companyAI: true }, activePersonId: 'lead', people, sources: [
  { ...base, id: 'v1', title: 'Brief', version: '1', status: 'superseded', supersededBy: 'v2', textPath: v1 },
  { ...base, id: 'v2', title: 'Brief', version: '2', status: 'approved', supersedesId: 'v1', textPath: v2 },
  { ...base, id: 'calendar', title: 'Calendar', version: '1', status: 'approved', textPath: path.join(sources, 'content-calendar.md') },
] });

test('briefing lists changed, added and removed rules with quotes from both versions', async () => {
  const result = await briefing.brief(make(), 'v1');
  assert.equal(result.replacement.id, 'v2');
  const audience = result.changes.find(change => change.kind === 'audience');
  assert.equal(audience.type, 'changed');
  assert.equal(audience.from, 'All subscribers');
  assert.equal(audience.value, 'Travel subscribers — Denmark');
  assert.ok(fs.readFileSync(v1, 'utf8').includes(audience.older.quote) && fs.readFileSync(v2, 'utf8').includes(audience.newer.quote));
  assert.ok(result.changes.some(change => change.type === 'added' && change.kind === 'time'));
  assert.ok(result.changes.some(change => change.type === 'removed' && change.value === 'best deal ever'));
  assert.ok(result.changes.some(change => change.type === 'added' && change.value === 'lowest prices guaranteed'));
});

test('Nemotron briefing points are kept only when their quotes are exact', async () => {
  const fetcher = async url => url.endsWith('/models') ? { ok: true, json: async () => ({ data: [{ id: 'nvidia/nemotron-super' }] }) } : { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify({ points: [
    { text: 'The audience is now Denmark only.', old_quote: '"All subscribers"', new_quote: '"Travel subscribers — Denmark"' },
    { text: 'Invented change.', old_quote: '', new_quote: 'This is not in either file.' },
  ] }) } }] }) };
  const result = await briefing.brief(make(), 'v1', { key: 'k', fetcher, useModel: true });
  assert.equal(result.points.length, 1);
  assert.equal(result.points[0].text, 'The audience is now Denmark only.');
});

test('practice drafts need lead approval, work offline and follow the current rule', async () => {
  const data = make();
  data.activePersonId = 'staff';
  await assert.rejects(practice.generate(data), /lead or administrator/);
  data.activePersonId = 'lead';
  const drafts = await practice.generate(data);
  assert.ok(drafts.length >= 1);
  assert.ok(drafts.every(item => item.origin === 'template' && item.options[item.correct]));
  data.activePersonId = 'staff';
  assert.equal(practice.snapshot(data).items.length, 0, 'drafts are not shown to employees');
  assert.equal(practice.snapshot(data).pending.length, 0);
  data.activePersonId = 'lead';
  for (const item of drafts) practice.decide(data, item.id, 'approved');
  data.activePersonId = 'staff';
  const view = practice.snapshot(data);
  assert.ok(view.items.length >= 1);
  assert.ok(view.items.every(item => item.correct === undefined), 'answers are not sent to the renderer');
  const item = data.ruleExercises.items.find(entry => entry.id === view.items[0].id);
  assert.equal(practice.answer(data, item.id, item.correct).correct, true);
  data.activePersonId = 'other';
  assert.equal(practice.snapshot(data).items[0].answered, null, 'answers belong to the person who gave them');
  data.sources[1].version = '3';
  data.activePersonId = 'staff';
  assert.ok(practice.snapshot(data).items.every(entry => entry.sourceVersion !== '2'), 'items from an older source version are hidden');
});

test('model practice drafts must keep the rule value only in the correct option', () => {
  const rule = { value: '2026-10-15' };
  assert.ok(practice.validDraft({ prompt: 'When?', options: ['2026-10-15 at 10:00', '2026-10-08', '2026-11-01'], correct: 0 }, rule));
  assert.equal(practice.validDraft({ prompt: 'When?', options: ['2026-10-15', '2026-10-15 at 9', 'x'], correct: 0 }, rule), null);
  assert.equal(practice.validDraft({ prompt: 'When?', options: ['a', 'b', 'c'], correct: 0 }, rule), null);
});
