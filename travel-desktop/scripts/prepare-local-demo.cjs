// Run with Electron on this Mac. Credentials and API keys never enter the bundle or Git.
const { app, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const workspace = require('../src/workspace');
const accounts = require('../src/accounts');
const documents = require('../src/account-documents');
const repository = path.resolve(__dirname, '../..');
const env = require('dotenv').parse(fs.readFileSync(path.join(repository, '.env.local')));
app.setName('averill-ai-desktop');
app.setPath('userData', path.join(app.getPath('appData'), 'averill-ai-desktop'));

app.whenReady().then(async () => {
 const root = app.getPath('userData');
 const current = workspace.load(root);
 if (!current || current.authEnabled || current.people.some(p => p.credential)) throw new Error('Only a legacy workspace without passwords can be prepared. Existing credentials are never reset.');
 if (!env.NEBIUS_API_KEY || !env.TAVILY_API_KEY) throw new Error('Both local service keys are required.');
 if (!await safeStorage.isAsyncEncryptionAvailable()) throw new Error('Encrypted OS storage is unavailable.');
 const encrypted = {};
 for (const [service, key] of [['nebius', env.NEBIUS_API_KEY], ['tavily', env.TAVILY_API_KEY]]) {
  encrypted[service] = (await safeStorage.encryptStringAsync(key)).toString('base64');
 }
 const next = structuredClone(current);
 const owner = next.people.find(p => p.role === 'admin');
 if (!owner) throw new Error('An existing administrator is required.');
 next.activePersonId = owner.id;
 const definitions = [
  { person: owner, email: 'alex@elseweek.example', profile: 'owner' },
  ...[
   ['Maya Jensen', 'maya@elseweek.example', 'marketing_manager'],
   ['Emma Larsen', 'emma@elseweek.example', 'marketing_strategy'],
   ['Oscar Lind', 'oscar@elseweek.example', 'content_creator'],
  ].map(([name, email, profile]) => ({ person: workspace.addPerson(next, name, accounts.profiles[profile].role, 'Marketing'), email, profile })),
 ];
 const receipt = [];
 for (const { person, email, profile } of definitions) {
  const password = accounts.temporaryPassword();
  await accounts.configure(next, person.id, email, password, profile);
  receipt.push({ email, password });
 }
 // Verify all four credentials before changing the existing workspace.
 for (const entry of receipt) await accounts.authenticate(next, entry.email, entry.password);
 const backup = path.join(root, `averill-workspace.before-logins-${Date.now()}.json`);
 fs.writeFileSync(backup, JSON.stringify(current, null, 2), { mode: 0o600 });
 const paths = documents.save(root, next, receipt);
 const exported = path.join(repository, 'demo-login-documents');
 fs.mkdirSync(exported, { recursive: true, mode: 0o700 });
 for (const file of paths) {
  const output = path.join(exported, path.basename(file));
  fs.copyFileSync(file, output); fs.chmodSync(output, 0o600);
 }
 fs.writeFileSync(path.join(root, 'averill-secrets.enc.json'), JSON.stringify(encrypted), { mode: 0o600 });
 workspace.save(root, next);
 console.log(JSON.stringify({ prepared: true, company: next.company, accounts: receipt.length, encryptedServices: Object.keys(encrypted), documents: exported, backup }));
 app.quit();
}).catch(() => { console.error('Local demo preparation failed; inspect prerequisites without printing keys or passwords.'); app.exit(1); });
