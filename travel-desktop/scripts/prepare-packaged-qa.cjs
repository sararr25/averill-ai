// Creates only disposable synthetic data; prints its directory, never credentials.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const workspace = require('../src/workspace'), accounts = require('../src/accounts');
(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-acceptance-'));
  const data = workspace.create(directory, 'Vamo packaged QA - synthetic only', 'QA Owner');
  await accounts.configure(data, data.people[0].id, 'owner@synthetic.example', 'Synthetic-password-123', 'owner');
  const file = path.join(directory, 'qa-brand.md'); fs.writeFileSync(file, 'Do not claim "lowest prices guaranteed".');
  const source = workspace.importFile(directory, data, file, { department: 'Marketing', version: '2' });
  workspace.updateSource(data, source.id, 'approved'); workspace.save(directory, data);
  fs.writeFileSync(path.join(directory, 'qa-profile.json'), JSON.stringify({ purpose: 'averill-local-acceptance', workspaceId: data.id }), { mode: 0o600 });
  console.log(directory);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
