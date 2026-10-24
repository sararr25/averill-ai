const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const learning = require('../src/learning');
const guide = require('../src/guide');

test('guide progress is kept per person and cleared only for that person', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-guide-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const data = workspace.create(dir, 'Test company', 'Admin');
  const admin = data.activePersonId;
  assert.deepEqual(guide.snapshot(data), { offered: false, done: [], screens: guide.screens });
  guide.update(data, 'done', 'knowledge');
  guide.update(data, 'done', 'knowledge');
  assert.deepEqual(guide.snapshot(data), { offered: true, done: ['knowledge'], screens: guide.screens });
  assert.throws(() => guide.update(data, 'done', 'elsewhere'), /Unknown guide screen/);
  assert.throws(() => guide.update(data, 'jump'), /Unknown guide action/);

  const employee = workspace.addPerson(data, 'Employee', 'employee', 'Marketing');
  workspace.switchPerson(data, employee.id);
  assert.equal(guide.snapshot(data).offered, false);
  guide.update(data, 'offered');
  workspace.save(dir, data);
  const loaded = workspace.load(dir);
  assert.equal(guide.snapshot(loaded).offered, true);

  learning.deleteHistory(loaded); guide.clearMine(loaded);
  assert.equal(guide.snapshot(loaded).offered, false);
  workspace.switchPerson(loaded, admin);
  assert.deepEqual(guide.snapshot(loaded).done, ['knowledge']);
});
