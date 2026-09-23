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
