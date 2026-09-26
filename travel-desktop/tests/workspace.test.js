const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const { relevantSources } = require('../src/workspace-answer');

test('local company setup, lead approval, employee visibility and source conflict survive reload', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-test-'));
  try {
    const data = workspace.create(root, 'Sample Company', 'Ava Admin');
    const lead = workspace.addPerson(data, 'Morgan Lead', 'lead', 'Marketing');
    const employee = workspace.addPerson(data, 'Ellis Employee', 'employee', 'Marketing');
    const firstFile = path.join(root, 'brief-a.md');
    fs.writeFileSync(firstFile, 'Approved launch date: 17 October.');
    workspace.switchPerson(data, employee.id);
    const first = workspace.importFile(root, data, firstFile, { title: 'Campaign brief', department: 'Marketing' });
    assert.equal(first.status, 'pending');
    assert.equal(workspace.approvedSources(data).length, 0);
    assert.throws(() => workspace.updateSource(data, first.id, 'approved'), /access required/);
    workspace.switchPerson(data, lead.id);
    workspace.updateSource(data, first.id, 'approved', 80);
    workspace.switchPerson(data, employee.id);
    assert.equal(workspace.approvedSources(data).length, 1);
    assert.equal(relevantSources(data, 'launch date').length, 1);
    const privateFile = path.join(root, 'notes.md');
    fs.writeFileSync(privateFile, 'Personal campaign note.');
    const personal = workspace.importFile(root, data, privateFile, { title: 'Personal note', department: 'Marketing', scope: 'private' });
    workspace.switchPerson(data, lead.id);
    assert.equal(workspace.visibleSources(data).some((source) => source.id === personal.id), false);
    assert.throws(() => workspace.updateSource(data, personal.id, 'approved'), /Private files/);
    workspace.switchPerson(data, employee.id);
    workspace.proposeSource(data, personal.id);
    workspace.switchPerson(data, lead.id);
    assert.equal(workspace.visibleSources(data).some((source) => source.id === personal.id), true);
    workspace.updateSource(data, personal.id, 'approved');
    workspace.switchPerson(data, employee.id);
    const secondFile = path.join(root, 'brief-b.md');
    fs.writeFileSync(secondFile, 'Approved launch date: 21 October.');
    const second = workspace.importFile(root, data, secondFile, { title: 'Campaign brief', department: 'Marketing' });
    workspace.switchPerson(data, lead.id);
    workspace.updateSource(data, second.id, 'approved', 20);
    assert.equal(workspace.conflicts(data).length, 1);
    assert.equal(relevantSources(data, 'launch date').length, 0);
    workspace.updateSource(data, second.id, 'superseded');
    assert.equal(workspace.conflicts(data).length, 0);
    workspace.save(root, data);
    assert.equal(workspace.load(root).sources.length, 3);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('folder import copies supported nested files and leaves them pending', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-folder-'));
  try {
    const data = workspace.create(path.join(root, 'data'), 'Sample Company', 'Ava Admin');
    const folder = path.join(root, 'campaign');
    fs.mkdirSync(path.join(folder, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(folder, 'brief.md'), 'Approved message: City escapes.');
    fs.writeFileSync(path.join(folder, 'nested', 'calendar.txt'), 'Launch: 17 October.');
    fs.writeFileSync(path.join(folder, 'ignore.bin'), 'binary');
    const result = workspace.importFolder(path.join(root, 'data'), data, folder, { department: 'Marketing' });
    assert.deepEqual(result, { imported: 2, scanned: 2, limited: false });
    assert.equal(data.sources.every((source) => source.status === 'pending' && fs.existsSync(source.storedPath)), true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('Elseweek pack retains approval, exact versions and department visibility after restart', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'elseweek-pack-'));
  const pack = path.join(__dirname, '..', 'demo-company', 'elseweek');
  try {
    const data = workspace.create(root, 'Elseweek', 'Alex Holm');
    const admin = workspace.person(data);
    const leads = {}, employees = {};
    for (const dept of ['Marketing', 'Operations', 'People']) {
      leads[dept] = workspace.addPerson(data, `${dept} lead`, 'lead', dept);
      employees[dept] = workspace.addPerson(data, `${dept} employee`, 'employee', dept);
      workspace.importFolder(root, data, path.join(pack, dept), { department: dept });
    }
    const brief = data.sources.find(item => item.title === 'current-brief.md');
    // Import separately with the exact campaign metadata, as the README instructs.
    data.sources = data.sources.filter(item => item.id !== brief.id);
    const v2 = workspace.importFile(root, data, path.join(pack, 'Marketing', 'current-brief.md'), { department: 'Marketing', version: '2' });
    for (const dept of Object.keys(leads)) {
      workspace.switchPerson(data, leads[dept].id);
      for (const source of data.sources.filter(item => item.department === dept)) workspace.updateSource(data, source.id, 'approved', 80);
    }
    workspace.switchPerson(data, employees.Marketing.id);
    assert.throws(() => workspace.importFile(root, data, path.join(pack, 'Operations', 'trip-brief-procedure-v1.md'), { department: 'Operations' }), /own department/);
    const note = workspace.importFile(root, data, path.join(pack, 'Proposals', 'marketing-personal-note-v1.md'), { scope: 'private', department: 'Marketing' });
    workspace.switchPerson(data, leads.Marketing.id);
    assert.equal(workspace.visibleSources(data).some(item => item.id === note.id), false);
    assert.throws(() => workspace.updateSource(data, data.sources.find(item => item.department === 'Operations').id, 'approved'), /access required/);
    workspace.switchPerson(data, employees.Marketing.id);
    workspace.proposeSource(data, note.id);
    workspace.switchPerson(data, leads.Marketing.id);
    workspace.updateSource(data, note.id, 'approved');
    const old = workspace.importFile(root, data, path.join(pack, 'Archive', 'old-brief.md'), { department: 'Marketing', version: '1' });
    workspace.updateSource(data, old.id, 'superseded');
    workspace.save(root, data);
    const restored = workspace.load(root);
    assert.equal(restored.sources.find(item => item.id === v2.id).version, '2');
    for (const dept of Object.keys(employees)) {
      workspace.switchPerson(restored, employees[dept].id);
      const visible = workspace.visibleSources(restored);
      assert.ok(visible.length >= 2);
      assert.ok(visible.every(item => item.department === dept));
      assert.ok(visible.some(item => item.title === 'brand-and-company-context-v1.md'));
      assert.equal(workspace.approvedSources(restored).some(item => item.id === old.id), false);
    }
    workspace.switchPerson(restored, admin.id);
    assert.equal(workspace.approvedSources(restored).length, 10);
    assert.deepEqual(workspace.conflicts(restored), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
