const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { resolveProfile } = require('../src/qa-profile');
test('QA profile is opt-in and rejects normal, unmarked and symlinked directories', () => {
  assert.equal(resolveProfile([]), null);
  assert.throws(() => resolveProfile(['--averill-qa-profile', '/tmp/example']));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-profile-test-'));
  try {
    const directory = path.join(root, 'averill-acceptance-fixture'); fs.mkdirSync(directory);
    const flag = `--averill-qa-profile=${directory}`;
    assert.throws(() => resolveProfile([flag], root));
    fs.writeFileSync(path.join(directory, 'qa-profile.json'), JSON.stringify({ purpose: 'averill-local-acceptance', workspaceId: 'qa' }));
    const data = { id: 'qa', authEnabled: true, people: [{ email: 'owner@synthetic.example' }] };
    const save = () => fs.writeFileSync(path.join(directory, 'averill-workspace.json'), JSON.stringify(data)); save();
    assert.equal(resolveProfile([flag], root), fs.realpathSync(directory));
    assert.throws(() => resolveProfile([flag, flag], root));
    data.people[0].email = 'owner@company.test'; save(); assert.throws(() => resolveProfile([flag], root));
    data.people[0].email = 'owner@synthetic.example'; data.authEnabled = false; save(); assert.throws(() => resolveProfile([flag], root));
    const link = path.join(root, 'averill-acceptance-link'); fs.symlinkSync(directory, link); assert.throws(() => resolveProfile([`--averill-qa-profile=${link}`], root));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
