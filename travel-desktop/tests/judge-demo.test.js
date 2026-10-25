const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const accounts = require('../src/accounts');
const judgeDemo = require('../src/judge-demo');
const todo = require('../src/todo');

const pack = path.join(__dirname, '..', 'demo-company');

test('judge demo creates approved Marketing sources and a signed-in-ready employee', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    const { data, personId } = await judgeDemo.create(root, pack);
    const active = workspace.person(data);
    assert.equal(active.id, personId);
    assert.equal(active.name, 'Emma Larsen');
    assert.equal(active.role, 'employee');
    assert.equal(data.authEnabled, true);
    const marketing = judgeDemo.marketingSources.length + judgeDemo.conflictingVersions.length;
    const others = Object.values(judgeDemo.otherSources).flat().length;
    assert.equal(data.sources.length, marketing + others + 1);
    assert.equal(accounts.publicAccounts(data).length, 3);
    assert.equal(workspace.approvedSources(data).length, marketing);
    assert.ok(workspace.approvedSources(data).every(source => source.department === 'Marketing'));
    const saved = workspace.load(root);
    assert.equal(saved.activePersonId, personId);
    assert.equal(fs.readdirSync(path.join(root, 'Averill-login-documents')).length, 3);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('judge demo refuses to touch an existing workspace', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    workspace.create(root, 'Existing Co', 'Real Owner');
    await assert.rejects(() => judgeDemo.create(root, pack), /already exists/);
    assert.equal(workspace.load(root).company, 'Existing Co');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('judge demo accounts sign in without a password', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    const { data } = await judgeDemo.create(root, pack);
    assert.equal(workspace.load(root).demoAccounts, true);
    const maya = data.people.find(p => p.email === 'maya@vamo.example');
    assert.equal(accounts.demoSignIn(data, maya.id).id, maya.id);
    maya.disabledAt = new Date().toISOString();
    assert.throws(() => accounts.demoSignIn(data, maya.id), /not available/);
    assert.throws(() => accounts.demoSignIn(data, 'missing'), /not available/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('passwordless sign-in is refused outside the demo workspace', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    const data = workspace.create(root, 'Real Co', 'Real Owner');
    const owner = workspace.person(data);
    await accounts.configure(data, owner.id, 'owner@real.example', 'a-strong-password', 'owner');
    assert.throws(() => accounts.demoSignIn(data, owner.id), /demo workspace/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('judge demo gives each role real work: Emma a pending note, Maya a review queue and a version conflict, Alex the roster', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    const { data } = await judgeDemo.create(root, pack);
    const byName = name => data.people.find(person => person.name === name);
    const note = data.sources.find(source => source.title === 'marketing-personal-note-v1.md');
    assert.equal(note.ownerId, byName('Emma Larsen').id);
    assert.equal(note.scope, 'department');
    assert.equal(note.status, 'pending');
    assert.ok(workspace.visibleSources(data).some(source => source.id === note.id));

    workspace.switchPerson(data, byName('Maya Jensen').id);
    assert.ok(workspace.visibleSources(data).some(source => source.id === note.id && source.status === 'pending'));
    const [conflict] = workspace.conflicts(data);
    assert.deepEqual(conflict.map(id => data.sources.find(source => source.id === id).version).sort(), ['1', '2']);
    assert.ok(workspace.visibleSources(data).every(source => source.department === 'Marketing'));

    workspace.switchPerson(data, byName('Alex Holm').id);
    assert.deepEqual([...data.departments].sort(), ['Marketing', 'Operations', 'People']);
    assert.equal(data.people.length, 7);
    for (const department of ['Operations', 'People']) {
      assert.equal(workspace.approvedSources(data).filter(source => source.department === department).length, judgeDemo.otherSources[department].length);
    }
    assert.ok(judgeDemo.roster.every(member => !accounts.publicAccounts(data).some(account => account.name === member.name)));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('judge demo seeds at least two open tasks for each of Emma, Maya and Alex, visible only to them', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-judge-'));
  try {
    const { data } = await judgeDemo.create(root, pack);
    const byName = name => data.people.find(person => person.name === name);
    const titles = {};
    for (const name of ['Emma Larsen', 'Maya Jensen', 'Alex Holm']) {
      workspace.switchPerson(data, byName(name).id);
      const { tasks } = todo.list(data);
      assert.ok(tasks.length >= 2, `${name} has ${tasks.length} tasks`);
      assert.ok(tasks.every(task => /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) && task.origin && task.action));
      titles[name] = tasks.map(task => task.title);
    }
    assert.equal(new Set(Object.values(titles).flat()).size, judgeDemo.taskSeeds.length);
    assert.ok(titles['Emma Larsen'].includes('Finish the Instagram Reel caption'));
    assert.ok(titles['Alex Holm'].includes('Check the Vamo website against the new brief'));
    assert.equal(workspace.load(root).tasks.length, judgeDemo.taskSeeds.length);
    // Maya also needs to review Emma's proposed note; Emma does not.
    workspace.switchPerson(data, byName('Maya Jensen').id);
    assert.equal(todo.list(data).review.length, 1);
    workspace.switchPerson(data, byName('Emma Larsen').id);
    assert.equal(todo.list(data).review.length, 0);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
