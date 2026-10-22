// One-click judge demo: a synthetic Vamo workspace with approved Marketing sources.
// Only runs on a Mac with no workspace yet; it never replaces existing data.
const fs = require('node:fs');
const path = require('node:path');
const workspace = require('./workspace');
const accounts = require('./accounts');
const accountDocuments = require('./account-documents');

// File, source version, priority — mirrors demo-company/vamo/README.md.
const marketingSources = [
  ['current-brief.md', '2', 90],
  ['linkedin-campaign.md', '1', 85],
  ['content-calendar.md', '1', 80],
  ['brand-and-legal.md', '1', 70],
  ['brand-and-company-context-v2.md', '2', 60],
];
const team = [
  { name: 'Maya Jensen', role: 'lead', department: 'Marketing', email: 'maya@vamo.example', profile: 'marketing_manager' },
  { name: 'Emma Larsen', role: 'employee', department: 'Marketing', email: 'emma@vamo.example', profile: 'marketing_strategy' },
];

async function create(userData, packRoot) {
  if (workspace.load(userData)) throw new Error('A workspace already exists on this Mac. The judge demo only starts on a fresh install.');
  const marketing = path.join(packRoot, 'vamo', 'Marketing');
  for (const [file] of marketingSources) {
    if (!fs.existsSync(path.join(marketing, file))) throw new Error(`Judge demo file is missing: ${file}`);
  }
  const data = workspace.create(userData, 'Vamo (judge demo)', 'Alex Holm');
  const credentials = [];
  const owner = workspace.person(data);
  const ownerPassword = accounts.temporaryPassword();
  await accounts.configure(data, owner.id, 'alex@vamo.example', ownerPassword, 'owner');
  credentials.push({ email: 'alex@vamo.example', password: ownerPassword });
  let emma = null;
  for (const member of team) {
    const added = workspace.addPerson(data, member.name, member.role, member.department);
    const password = accounts.temporaryPassword();
    await accounts.configure(data, added.id, member.email, password, member.profile);
    credentials.push({ email: member.email, password });
    if (member.email.startsWith('emma@')) emma = added;
  }
  for (const [file, version, priority] of marketingSources) {
    const source = workspace.importFile(userData, data, path.join(marketing, file), { department: 'Marketing', version });
    workspace.updateSource(data, source.id, 'approved', priority, 'Pre-approved for the judge demo');
  }
  accountDocuments.save(userData, data, credentials);
  workspace.switchPerson(data, emma.id);
  workspace.save(userData, data);
  return { data, personId: emma.id };
}

module.exports = { create, marketingSources, team };
