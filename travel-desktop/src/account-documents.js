const fs = require('node:fs');
const path = require('node:path');
const { profiles, validEmail } = require('./accounts');

function directory(userData) { return path.join(userData, 'Averill-login-documents'); }
function save(userData, data, entries) {
 if (!entries.length) return [];
 const root = directory(userData);
 fs.mkdirSync(root, { recursive: true, mode: 0o700 });
 return entries.map(entry => {
  if (!validEmail(entry.email) || typeof entry.password !== 'string') throw new Error('Invalid account document.');
  const person = data.people.find(p => p.email === entry.email);
  if (!person?.credential) throw new Error('Account document requires an existing account.');
  const filename = `${entry.email.replace(/[^a-z0-9@._-]/gi, '_')}.md`;
  const target = path.join(root, filename);
  const content = `# Averill — demo login\n\nCompany: ${data.company}\nName: ${person.name}\nProfile: ${profiles[person.profile]?.label || person.profile}\n\nEmail: ${entry.email}\nPassword: ${entry.password}\n\nThis account works in the local Averill workspace on this Mac.\nCreated: ${new Date().toISOString()}\n`;
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, content, { mode: 0o600 });
  fs.renameSync(temporary, target);
  return target;
 });
}
module.exports = { directory, save };
