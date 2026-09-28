const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const allowedExtensions = new Set(['.md', '.txt', '.csv', '.json', '.xlsx', '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.svg']);
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function id() { return crypto.randomUUID(); }
function clean(value, limit = 120) { return String(value || '').trim().slice(0, limit); }
function workspacePath(userData) { return path.join(userData, 'averill-workspace.json'); }
function fileStore(userData) { return path.join(userData, 'averill-sources'); }

function extractText(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (['.md', '.txt', '.csv', '.json', '.svg'].includes(extension)) return fs.readFileSync(filePath, 'utf8').slice(0, 100000);
  if (extension === '.xlsx') {
    try { return execFileSync(process.execPath, ['--max-old-space-size=256', path.join(__dirname, '..', 'scripts', 'extract-spreadsheet.cjs'), filePath], { timeout: 30000, maxBuffer: 1024 * 1024, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }).slice(0, 100000); }
    catch { return ''; }
  }
  if (process.platform !== 'darwin') return '';
  const binary = path.join(__dirname, '..', 'scripts', 'extract-text-macos-arm64');
  const command = fs.existsSync(binary) ? binary : '/usr/bin/swift';
  const args = command === binary ? [filePath] : [path.join(__dirname, '..', 'scripts', 'extract-text.swift'), filePath];
  try { return execFileSync(command, args, { timeout: 45000, maxBuffer: 1024 * 1024, encoding: 'utf8', env: { ...process.env, SWIFT_MODULECACHE_PATH: path.join(require('node:os').tmpdir(), 'averill-swift-cache'), CLANG_MODULE_CACHE_PATH: path.join(require('node:os').tmpdir(), 'averill-clang-cache') } }).trim().slice(0, 100000); }
  catch { return ''; }
}

function load(userData) {
  try {
    const data = JSON.parse(fs.readFileSync(workspacePath(userData), 'utf8'));
    return data && data.schema === 1 && Array.isArray(data.people) && Array.isArray(data.sources) ? data : null;
  } catch { return null; }
}

function save(userData, data) {
  fs.mkdirSync(userData, { recursive: true });
  const target = workspacePath(userData);
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, target);
}

function create(userData, company, adminName) {
  if (load(userData)) throw new Error('A workspace already exists');
  const name = clean(company);
  const person = clean(adminName);
  if (!name || !person) throw new Error('Company and administrator names are required');
  const admin = { id: id(), name: person, role: 'admin', department: null };
  const data = { schema: 1, id: id(), company: name, departments: ['Marketing'], people: [admin], activePersonId: admin.id, sources: [], createdAt: new Date().toISOString() };
  save(userData, data);
  return data;
}

function person(data) { return data.people.find((entry) => entry.id === data.activePersonId); }
function canManage(data, department) {
  const active = person(data);
  return active && (active.role === 'admin' || (active.role === 'lead' && active.department === department));
}

function addPerson(data, name, role, department) {
  if (person(data)?.role !== 'admin') throw new Error('Administrator access required');
  const trimmed = clean(name);
  if (!trimmed || !['admin', 'lead', 'employee'].includes(role)) throw new Error('Invalid person');
  const dept = role === 'admin' ? null : clean(department);
  if (dept && !data.departments.includes(dept)) data.departments.push(dept);
  if (role !== 'admin' && !dept) throw new Error('Department required');
  const entry = { id: id(), name: trimmed, role, department: dept };
  data.people.push(entry);
  return entry;
}

function switchPerson(data, personId) {
  if (!data.people.some((entry) => entry.id === personId)) throw new Error('Unknown person');
  data.activePersonId = personId;
}

function importFile(userData, data, sourcePath, options = {}) {
  const active = person(data);
  if (!active) throw new Error('Select a person first');
  const stat = fs.lstatSync(sourcePath);
  const extension = path.extname(sourcePath).toLowerCase();
  if (!stat.isFile() || stat.isSymbolicLink() || !allowedExtensions.has(extension) || stat.size > MAX_FILE_BYTES) throw new Error('Unsupported file or file exceeds 20 MB');
  const content = fs.readFileSync(sourcePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const department = options.scope === 'company' ? 'Company' : clean(options.department || active.department || 'Marketing');
  if (options.scope === 'company' && active.role !== 'admin') throw new Error('Administrator access required for company-wide sources');
  if (department !== 'Company' && !data.departments.includes(department)) throw new Error('Unknown department');
  if (active.role !== 'admin' && department !== active.department) throw new Error('Import into your own department only');
  const sourceId = id();
  const destination = path.join(fileStore(userData), `${sourceId}${extension}`);
  fs.mkdirSync(fileStore(userData), { recursive: true });
  fs.writeFileSync(destination, content, { mode: 0o600, flag: 'wx' });
  const extractedText = extractText(destination);
  const textPath = path.join(fileStore(userData), `${sourceId}.extracted.txt`);
  if (extractedText) fs.writeFileSync(textPath, extractedText, { mode: 0o600, flag: 'wx' });
  const source = {
    id: sourceId, title: clean(options.title || path.basename(sourcePath)), department,
    originalPath: sourcePath, storedPath: destination, sha256: hash,
    textPath: extractedText ? textPath : null, extractionStatus: extractedText ? 'text available' : 'no readable text',
    ownerId: active.id, scope: ['private', 'company'].includes(options.scope) ? options.scope : 'department',
    status: 'pending', priority: 0, version: clean(options.version || '1', 30),
    createdAt: new Date().toISOString(), approvedAt: null, approvedBy: null,
  };
  data.sources.push(source);
  return source;
}

function importFolder(userData, data, directory, options = {}) {
  const selected = [];
  function visit(current, depth) {
    if (depth > 5 || selected.length >= 100) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) visit(file, depth + 1);
      else if (entry.isFile() && allowedExtensions.has(path.extname(file).toLowerCase())) selected.push(file);
      if (selected.length >= 100) break;
    }
  }
  visit(directory, 0);
  const imported = [];
  for (const file of selected) {
    try { imported.push(importFile(userData, data, file, options)); } catch { /* Skip unreadable or oversized files. */ }
  }
  return { imported: imported.length, scanned: selected.length, limited: selected.length >= 100 };
}

function updateSource(data, sourceId, action, priority = 0, reason = '', supersedesId = null) {
  const source = data.sources.find((entry) => entry.id === sourceId);
  if (!source) throw new Error('Unknown source');
  if (source.scope === 'private') throw new Error('Private files must be proposed before approval');
  if (source.scope === 'company' ? person(data)?.role !== 'admin' : !canManage(data, source.department)) throw new Error('Department lead or administrator access required');
  if (!['approved', 'rejected', 'superseded', 'clarification_requested'].includes(action)) throw new Error('Invalid source status');
  if (supersedesId) {
    if (action !== 'approved') throw new Error('Only an approval can replace a previous source');
    const previous=data.sources.find(entry=>entry.id===supersedesId);
    if (!previous||previous.id===source.id||previous.status!=='approved'||previous.department!==source.department||previous.scope!==source.scope||previous.sha256===source.sha256) throw new Error('Choose a different approved source in the same scope and department');
    if(previous.supersedesId===source.id)throw new Error('Version link would create a cycle');
    previous.status='superseded';previous.supersededBy=source.id;
    source.supersedesId=previous.id;
  }
  const before=source.status;
  source.status = action;
  source.priority = Math.max(0, Math.min(100, Number(priority) || 0));
  if(action==='approved'&&before!=='approved'){source.approvedAt=new Date().toISOString();source.approvedBy=data.activePersonId;}
  if(action!=='approved'){source.approvedAt=null;source.approvedBy=null;}
  if(action!==before||supersedesId||String(reason||'').trim()){
    source.decisions||=[];source.decisions.push({action,reason:clean(reason||`${action} in Setup`,500),by:data.activePersonId,at:new Date().toISOString(),supersedesId:supersedesId||null});
  }
  return source;
}

function proposeSource(data, sourceId) {
  const source = data.sources.find((entry) => entry.id === sourceId);
  if (!source || source.ownerId !== data.activePersonId || source.scope !== 'private') throw new Error('Only the owner can propose this private file');
  source.scope = 'department';
  source.status = 'pending';
  return source;
}
function removeSource(userData,data,sourceId){
 const index=data.sources.findIndex(entry=>entry.id===sourceId);if(index<0)throw new Error('Unknown source');
 const source=data.sources[index],active=person(data);
 if(active?.role!=='admin'&&!(source.ownerId===active?.id&&source.scope==='private'&&source.status!=='approved'))throw new Error('Administrator access required to delete a shared source');
 data.sources.splice(index,1);save(userData,data);
 const root=fileStore(userData);
 for(const filename of [`${source.id}${path.extname(source.storedPath)}`,`${source.id}.extracted.txt`])fs.rmSync(path.join(root,filename),{force:true});
 return source.id;
}
function visibleClarifications(data){const active=person(data);if(!active)return [];return (data.clarifications||[]).filter(item=>item.requesterId===active.id||active.role==='admin'||active.role==='lead'&&active.department===item.department);}
function requestClarification(data,question){
 const active=person(data);if(!active)throw new Error('Sign in first');const text=clean(question,1000);if(text.length<10)throw new Error('Describe what evidence is missing');
 const item={id:id(),requesterId:active.id,department:active.department||'Company',question:text,status:'pending',createdAt:new Date().toISOString(),reply:null,sourceId:null,resolvedBy:null,resolvedAt:null};data.clarifications||=[];data.clarifications.push(item);return item;
}
function resolveClarification(data,requestId,reply,sourceId){
 const active=person(data),item=(data.clarifications||[]).find(entry=>entry.id===requestId);if(!item||!(active?.role==='admin'||active?.role==='lead'&&active.department===item.department))throw new Error('Reviewer access required');
 const text=clean(reply,1000);if(text.length<10)throw new Error('Explain the decision or missing evidence');
 if(sourceId){const source=approvedSources(data).find(entry=>entry.id===sourceId&&!conflicts(data).flat().includes(entry.id)&&(entry.scope==='company'||entry.department===item.department));if(!source)throw new Error('Choose an approved source visible to the requester');item.sourceId=source.id;}
 item.reply=text;item.status='answered';item.resolvedBy=active.id;item.resolvedAt=new Date().toISOString();return item;
}

function visibleSources(data) {
  const active = person(data);
  if (!active) return [];
  return data.sources.filter((source) => source.ownerId === active.id || ((source.scope === 'company' && source.status === 'approved') || (source.scope === 'company' && active.role === 'admin') || (source.scope === 'department' && (active.role === 'admin' || (source.department === active.department && (source.status === 'approved' || active.role === 'lead'))))));
}

function approvedSources(data) {
  const active = person(data);
  if (!active) return [];
  return visibleSources(data).filter((source) => source.status === 'approved' && (source.scope === 'company' || active.role === 'admin' || source.department === active.department));
}

function conflicts(data) {
  const approved = data.sources.filter((source) => source.status === 'approved');
  const groups = new Map();
  for (const source of approved) {
    const key = `${source.department}:${source.title.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) || []), source]);
  }
  return [...groups.values()].filter((group) => group.length > 1 && new Set(group.map((source) => source.sha256)).size > 1).map((group) => group.map((source) => source.id));
}

function publicSnapshot(data) {
  if (!data) return { configured: false };
  const visible = visibleSources(data);
  const visibleIds = new Set(visible.map((source) => source.id));
  const active=person(data);
  return { configured: true, company: data.company, departments: data.departments, people: data.people.map(({ credential, onboardingEvidence, ...entry }) => entry), activePersonId: data.activePersonId, conflicts: conflicts(data).filter((group) => group.every((id) => visibleIds.has(id))), sources: visible.map(({ storedPath, textPath, decisions, ...source }) => ({...source,latestDecision:source.ownerId===active.id||active.role==='admin'||active.role==='lead'&&active.department===source.department?decisions?.at(-1)||null:null})),clarifications:visibleClarifications(data) };
}

module.exports = { load, save, create, person, addPerson, switchPerson, importFile, importFolder, updateSource, proposeSource, removeSource, visibleSources, visibleClarifications, requestClarification, resolveClarification, approvedSources, conflicts, publicSnapshot, extractText };
