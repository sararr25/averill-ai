const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const accounts = require('../src/accounts');
const documents = require('../src/account-documents');

test('four login documents survive restart without leaking credentials into workspace snapshots', async () => {
 const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-login-documents-'));
 try {
  const data = workspace.create(root, 'Elseweek', 'Alex Holm');
  const entries = [];
  for (const [profile, email, name] of [
   ['owner', 'alex@elseweek.example', 'Alex Holm'],
   ['marketing_manager', 'maya@elseweek.example', 'Maya Jensen'],
   ['marketing_strategy', 'emma@elseweek.example', 'Emma Larsen'],
   ['content_creator', 'oscar@elseweek.example', 'Oscar Lind'],
  ]) {
   const person = profile === 'owner' ? workspace.person(data) : workspace.addPerson(data, name, accounts.profiles[profile].role, 'Marketing');
   const password = accounts.temporaryPassword();
   await accounts.configure(data, person.id, email, password, profile);
   entries.push({ email, password });
  }
  workspace.save(root, data);
  const files = documents.save(root, data, entries);
  assert.equal(files.length, 4);
  const restored = workspace.load(root);
  for (const [index, entry] of entries.entries()) {
   assert.match(fs.readFileSync(files[index], 'utf8'), new RegExp(entry.email.replaceAll('.', '\\.')));
   assert.ok(fs.readFileSync(files[index], 'utf8').includes(entry.password));
   assert.equal(fs.statSync(files[index]).mode & 0o777, 0o600);
   assert.equal((await accounts.authenticate(restored, entry.email, entry.password)).email, entry.email);
   assert.ok(!JSON.stringify(workspace.publicSnapshot(restored)).includes(entry.password));
   assert.ok(!fs.readFileSync(path.join(root, 'averill-workspace.json'), 'utf8').includes(entry.password));
  }
 } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
