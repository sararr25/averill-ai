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
  ['newsletter-style-guide.md', '1', 50],
];
// Two approved versions under one title: Maya sees a version conflict to resolve by superseding v1.
const conflictingVersions = [['social-media-guidelines-v1.md', '1'], ['social-media-guidelines-v2.md', '2']];
const otherSources = {
  Operations: [['trip-brief-procedure-v1.md', '1', 80], ['supplier-checklist-v1.md', '1', 70], ['brand-and-company-context-v2.md', '2', 60]],
  People: [['employee-onboarding-v2.md', '2', 80], ['time-off-and-travel-policy-v1.md', '1', 70], ['brand-and-company-context-v2.md', '2', 60]],
};
// Roster only: these people have no sign-in account, so the judge sign-in screen still lists Alex, Maya and Emma.
const roster = [
  { name: 'Noah Berg', role: 'lead', department: 'Operations' },
  { name: 'Oliver Madsen', role: 'employee', department: 'Operations' },
  { name: 'Lina Sørensen', role: 'lead', department: 'People' },
  { name: 'Freja Nielsen', role: 'employee', department: 'People' },
];
// Seed tasks per sign-in: [email, title, origin, days until due, screen the To do button opens].
const campaign = 'Winter Escapes 2027';
const taskSeeds = [
  ['emma@vamo.example', 'Finish the Instagram Reel caption', `${campaign}, assigned by Maya`, 2, 'review'],
  ['emma@vamo.example', 'Check the LinkedIn post against the approved brief', `${campaign}, assigned by Maya`, 4, 'review'],
  ['emma@vamo.example', 'Practise the paid partnership disclosure rule', 'Weekly learning', 6, 'learn'],
  ['maya@vamo.example', 'Decide which social media guidelines version applies', 'Version conflict in Marketing sources', 1, 'setup'],
  ['maya@vamo.example', 'Approve the launch email before it is scheduled', `${campaign}, email campaign`, 3, 'review'],
  ['alex@vamo.example', 'Check the Vamo website against the new brief', `${campaign}, website`, 5, 'setup'],
  ['alex@vamo.example', 'Review who has access to the campaign files', 'Team access', 7, 'setup'],
];
const dueIn = (days) => { const date = new Date(); date.setDate(date.getDate() + days); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };
const privateNote = path.join('Proposals', 'marketing-personal-note-v1.md');
const team = [
  { name: 'Maya Jensen', role: 'lead', department: 'Marketing', email: 'maya@vamo.example', profile: 'marketing_manager' },
  { name: 'Emma Larsen', role: 'employee', department: 'Marketing', email: 'emma@vamo.example', profile: 'marketing_strategy' },
];

async function create(userData, packRoot) {
  if (workspace.load(userData)) throw new Error('A workspace already exists on this Mac. The judge demo only starts on a fresh install.');
  const marketing = path.join(packRoot, 'vamo', 'Marketing');
  const required = [...marketingSources, ...conflictingVersions].map(([file]) => path.join('Marketing', file))
    .concat(Object.entries(otherSources).flatMap(([department, files]) => files.map(([file]) => path.join(department, file))), privateNote);
  for (const file of required) {
    if (!fs.existsSync(path.join(packRoot, 'vamo', file))) throw new Error(`Judge demo file is missing: ${file}`);
  }
  const data = workspace.create(userData, 'Vamo (judge demo)', 'Alex Holm');
  data.demoAccounts = true;
  const credentials = [];
  const owner = workspace.person(data);
  const ownerPassword = accounts.temporaryPassword();
  await accounts.configure(data, owner.id, 'alex@vamo.example', ownerPassword, 'owner');
  credentials.push({ email: 'alex@vamo.example', password: ownerPassword });
  const byEmail = { 'alex@vamo.example': owner };
  let emma = null;
  for (const member of team) {
    const added = workspace.addPerson(data, member.name, member.role, member.department);
    const password = accounts.temporaryPassword();
    await accounts.configure(data, added.id, member.email, password, member.profile);
    credentials.push({ email: member.email, password });
    byEmail[member.email] = added;
    if (member.email.startsWith('emma@')) emma = added;
  }
  for (const [file, version, priority] of marketingSources) {
    const source = workspace.importFile(userData, data, path.join(marketing, file), { department: 'Marketing', version });
    workspace.updateSource(data, source.id, 'approved', priority, 'Pre-approved for the judge demo');
  }
  for (const [file, version] of conflictingVersions) {
    const source = workspace.importFile(userData, data, path.join(marketing, file), { department: 'Marketing', version, title: 'social-media-guidelines.md' });
    workspace.updateSource(data, source.id, 'approved', 40, 'Pre-approved for the judge demo');
  }
  for (const member of roster) workspace.addPerson(data, member.name, member.role, member.department);
  for (const [department, files] of Object.entries(otherSources)) {
    for (const [file, version, priority] of files) {
      const source = workspace.importFile(userData, data, path.join(packRoot, 'vamo', department, file), { department, version });
      workspace.updateSource(data, source.id, 'approved', priority, 'Pre-approved for the judge demo');
    }
  }
  for (const [email, title, origin, days, area] of taskSeeds) workspace.addTask(data, { title, assigneeId: byEmail[email].id, dueDate: dueIn(days), origin, link: { area } });
  accountDocuments.save(userData, data, credentials);
  workspace.switchPerson(data, emma.id);
  // Emma's own note: imported privately, then proposed, so it waits for Maya's review.
  const note = workspace.importFile(userData, data, path.join(packRoot, 'vamo', privateNote), { scope: 'private', version: '1' });
  workspace.proposeSource(data, note.id);
  workspace.save(userData, data);
  return { data, personId: emma.id };
}

module.exports = { create, taskSeeds, marketingSources, conflictingVersions, otherSources, roster, team };
