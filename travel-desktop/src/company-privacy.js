const workspace = require('./workspace');
function allowed(data) { return data?.privacy?.companyAI === true; }
function requireAI(data) {
 if (!allowed(data)) throw new Error('Company AI is off. The owner must verify the Nebius confidentiality, retention and no-training settings, then enable company AI in Setup.');
}
function configure(data, enabled) {
 if (workspace.person(data)?.role !== 'admin') throw new Error('Administrator access required.');
 data.privacy = { companyAI: enabled === true, updatedBy: data.activePersonId, updatedAt: new Date().toISOString() };
}
function credentials(text) { return /(?:password|api[_ -]?key|access[_ -]?token|client[_ -]?secret|private[_ -]?key)\s*[:=]\s*[^\s,;]{4,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(String(text)); }
function eligible(file) { return file.aiAllowed === true && file.confidentiality !== 'restricted' && !file.containsCredentials; }
function permissions(files, selections) {
 if (!Array.isArray(selections)) throw new Error('Choose the files that Nebius may process.');
 const seen = new Set();
 for (const selection of selections) {
  const file = files.find(f => f.id === selection.id);
  if (!file || seen.has(file.id) || !['internal', 'public', 'restricted'].includes(selection.confidentiality)) throw new Error('Invalid document privacy selection.');
  seen.add(file.id);
 }
 for(const selection of selections){const file=files.find(f=>f.id===selection.id);file.confidentiality=selection.confidentiality;file.aiAllowed=selection.aiAllowed===true&&file.confidentiality!=='restricted'&&!file.containsCredentials;}
}
module.exports = { allowed, requireAI, configure, eligible, permissions, credentials };
