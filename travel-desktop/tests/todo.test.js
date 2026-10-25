const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const todo = require('../src/todo');

// Alex (admin), Maya (Marketing lead), Lena (Operations lead), Emma (Marketing employee).
function setup() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-todo-'));
  const data = workspace.create(root, 'Todo Co', 'Alex');
  const alex = data.people[0];
  const maya = workspace.addPerson(data, 'Maya', 'lead', 'Marketing');
  const lena = workspace.addPerson(data, 'Lena', 'lead', 'Operations');
  const emma = workspace.addPerson(data, 'Emma', 'employee', 'Marketing');
  data.departments.push('Operations');
  const file = path.join(root, 'note.md'); fs.writeFileSync(file, 'Synthetic note about winter travel guidance.');
  const as = (person, run) => { data.activePersonId = person.id; return run(); };
  return { root, data, alex, maya, lena, emma, file, as };
}

test('review items are scoped by role: leads see their department, company-wide approvals are admin only', () => {
  const { root, data, alex, maya, lena, emma, file, as } = setup();
  try {
    const dept = as(alex, () => workspace.importFile(root, data, file, { department: 'Marketing', title: 'dept.md' }));
    const company = as(alex, () => workspace.importFile(root, data, file, { scope: 'company', title: 'company.md' }));
    const privateNote = as(emma, () => workspace.importFile(root, data, file, { scope: 'private', title: 'private.md' }));
    const ids = (person) => as(person, () => todo.list(data).review.map((item) => item.id));
    assert.deepEqual(ids(maya), [`source:${dept.id}`]);
    assert.deepEqual(ids(lena), []);
    assert.deepEqual(ids(emma), []);
    assert.deepEqual([...ids(alex)].sort(), [`source:${company.id}`, `source:${dept.id}`].sort());
    assert.ok(!ids(alex).includes(`source:${privateNote.id}`));
    as(emma, () => workspace.proposeSource(data, privateNote.id));
    assert.ok(ids(maya).includes(`source:${privateNote.id}`));
    assert.ok(!ids(emma).includes(`source:${privateNote.id}`));
    as(maya, () => workspace.updateSource(data, dept.id, 'approved', 50, 'ok'));
    assert.ok(!ids(maya).includes(`source:${dept.id}`));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('clarification requests reach reviewers of that department, never the requester or other departments', () => {
  const { data, root, alex, maya, lena, emma, as } = setup();
  try {
    const request = as(emma, () => workspace.requestClarification(data, 'Which launch date is approved for Vienna?'));
    const ids = (person) => as(person, () => todo.list(data).review.map((item) => item.id));
    assert.deepEqual(ids(maya), [`clarification:${request.id}`]);
    assert.deepEqual(ids(alex), [`clarification:${request.id}`]);
    assert.deepEqual(ids(lena), []);
    assert.deepEqual(ids(emma), []);
    as(maya, () => workspace.resolveClarification(data, request.id, 'The brief v2 date applies.', null));
    assert.deepEqual(ids(maya), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('findings from shared work are listed for the signed-in person and open the review screen', () => {
  const { data, root, emma, as } = setup();
  try {
    const { review } = as(emma, () => todo.list(data, [{ kind: 'email', id: 'f1', title: 'Footer missing' }]));
    assert.equal(review.length, 1);
    assert.equal(review[0].action.findingKey, 'email:f1');
    assert.equal(review[0].action.area, 'review');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('tasks belong to their assignee: others never see them and cannot complete them', () => {
  const { data, root, alex, maya, emma, as } = setup();
  try {
    const task = workspace.addTask(data, { title: 'Write the caption', assigneeId: emma.id, dueDate: '2027-01-10', origin: 'Winter Escapes 2027', link: { area: 'review' } });
    workspace.addTask(data, { title: 'Later task', assigneeId: emma.id, dueDate: '2027-02-10', origin: 'Winter Escapes 2027' });
    assert.deepEqual(as(emma, () => todo.list(data).tasks.map((item) => item.title)), ['Write the caption', 'Later task']);
    for (const other of [maya, alex]) {
      assert.deepEqual(as(other, () => todo.list(data).tasks), []);
      assert.equal(as(other, () => todo.list(data).count), 0);
      assert.throws(() => as(other, () => workspace.completeTask(data, task.id)), /not assigned to you/);
    }
    assert.equal(data.tasks.find((entry) => entry.id === task.id).status, 'open');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('completing a task removes it from the list and cannot be repeated', () => {
  const { data, root, emma, as } = setup();
  try {
    const task = workspace.addTask(data, { title: 'Write the caption', assigneeId: emma.id, origin: 'Winter Escapes 2027', link: { area: 'review' } });
    assert.equal(as(emma, () => todo.list(data).count), 1);
    as(emma, () => workspace.completeTask(data, task.id));
    assert.equal(as(emma, () => todo.list(data).count), 0);
    assert.equal(data.tasks[0].status, 'done');
    assert.throws(() => as(emma, () => workspace.completeTask(data, task.id)), /already done/);
    assert.throws(() => as(emma, () => workspace.completeTask(data, 'missing')), /not assigned to you/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('tasks persist with the workspace, stay out of the public snapshot and reject bad input', () => {
  const { data, root, emma } = setup();
  try {
    workspace.addTask(data, { title: 'Write the caption', assigneeId: emma.id, dueDate: '2027-01-10', origin: 'Winter Escapes 2027', link: { area: 'review' } });
    workspace.save(root, data);
    assert.equal(workspace.load(root).tasks.length, 1);
    assert.equal('tasks' in workspace.publicSnapshot(data), false);
    assert.throws(() => workspace.addTask(data, { title: '', assigneeId: emma.id, origin: 'x' }), /required/);
    assert.throws(() => workspace.addTask(data, { title: 'a', assigneeId: 'nobody', origin: 'x' }), /Unknown assignee/);
    assert.throws(() => workspace.addTask(data, { title: 'a', assigneeId: emma.id, origin: 'x', dueDate: 'tomorrow' }), /YYYY-MM-DD/);
    assert.throws(() => workspace.addTask(data, { title: 'a', assigneeId: emma.id, origin: 'x', link: { area: 'nowhere' } }), /destination/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('no new To do text contains an em dash or en dash', () => {
  const dash = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
  for (const file of ['src/todo.js', 'src/todo-ui.js']) assert.ok(!dash.test(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')), file);
  assert.ok(!dash.test(JSON.stringify(require('../src/judge-demo').taskSeeds)));
});
