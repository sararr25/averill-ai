// Explicit local acceptance profile. Never changes the default workspace or authentication.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function resolveProfile(argv, temporaryRoot = os.tmpdir()) {
  const flags = argv.filter(value => value === '--averill-qa-profile' || value.startsWith('--averill-qa-profile='));
  if (!flags.length) return null;
  if (flags.length !== 1 || !flags[0].startsWith('--averill-qa-profile=')) throw new Error('Choose one synthetic QA profile.');
  const requested = flags[0].slice('--averill-qa-profile='.length);
  if (!path.isAbsolute(requested) || fs.lstatSync(requested).isSymbolicLink()) throw new Error('QA profile must be an absolute temporary directory.');
  const directory = fs.realpathSync(requested), root = fs.realpathSync(temporaryRoot);
  if (path.dirname(directory) !== root || !path.basename(directory).startsWith('averill-acceptance-')) throw new Error('QA profile must be a dedicated temporary acceptance directory.');
  const marker = JSON.parse(fs.readFileSync(path.join(directory, 'qa-profile.json'), 'utf8'));
  const workspace = JSON.parse(fs.readFileSync(path.join(directory, 'averill-workspace.json'), 'utf8'));
  if (marker.purpose !== 'averill-local-acceptance' || marker.workspaceId !== workspace.id || workspace.authEnabled !== true || !workspace.people?.length || workspace.people.some(person => !person.email?.endsWith('@synthetic.example'))) throw new Error('QA profile must contain marked synthetic accounts with authentication enabled.');
  return directory;
}

function apply(app, argv = process.argv) {
  const directory = resolveProfile(argv);
  if (!directory) return;
  app.setPath('userData', directory);
  app.setPath('sessionData', directory);
  // dotenv does not override existing empty entries. No normal encrypted key store is read.
  process.env.NEBIUS_API_KEY = ''; process.env.TAVILY_API_KEY = '';
}

module.exports = { resolveProfile, apply };
