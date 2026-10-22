const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const accounts = require('../src/accounts');
const judgeDemo = require('../src/judge-demo');

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
    assert.equal(data.sources.length, judgeDemo.marketingSources.length);
    assert.ok(data.sources.every(source => source.status === 'approved'));
    assert.equal(accounts.publicAccounts(data).length, 3);
    assert.equal(workspace.approvedSources(data).length, judgeDemo.marketingSources.length);
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
