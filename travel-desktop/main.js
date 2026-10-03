const { app, BrowserWindow, ipcMain, shell, dialog, desktopCapturer, systemPreferences, safeStorage, screen, clipboard } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });
const { inspect, answer: localAnswer } = require('./src/engine');
const { answerQuestion } = require('./src/assistant');
const { sourceFor } = require('./src/campaign');
const workspace = require('./src/workspace');
const accounts = require('./src/accounts');
const accountDocuments = require('./src/account-documents');
const onboarding = require('./src/onboarding');
const privacy = require('./src/company-privacy');
const knowledge = require('./src/knowledge');
const sourceReview = require('./src/source-review');
const remoteImport = require('./src/remote-import');
const { CloudImports } = require('./src/cloud-import');
const cloud = new CloudImports({root:()=>app.getPath('userData'),secure:safeStorage,open:url=>shell.openExternal(url)});
const learning = require('./src/learning');
const { answerWorkspace, localWorkspaceAnswer } = require('./src/workspace-answer');
const { searchPublicWeb, factCheckPublic } = require('./src/web-search');
const { nativeWindow, observation, windowNumber } = require('./src/external-observation');
const { clampCompanion } = require('./src/companion-position');
const taskReview = require('./src/task-review');
const { BrowserBridge } = require('./src/browser-bridge');

const workKinds = ['email', 'linkedin', 'social', 'handover'];
const workWindows = new Map();
const workState = new Map();
const shared = new Set();
let agentWindow;
let companionWindow;
let aiEnabled = false;
let companyWorkspace = null;
let authenticatedPersonId = null;
let loginFailures = { count: 0, until: 0 };
let onboardingBusy = false;
let selectedExternalWindow = null;
let externalObservation = null;
let externalWatching = false;
let externalWatchTimer = null;
let externalCaptureBusy = false;
let externalError = '';
let externalEpoch = 0;
const browserBridge = new BrowserBridge({
  onObservation: result => {
    if (!signedIn() || browserBridge.personId !== companyWorkspace.activePersonId) { browserBridge.stop(); return; }
    selectedExternalWindow = { id: result?.windowId || selectedExternalWindow?.id || 'browser:pending', name: 'Shared browser field', adapter: 'browser-dom' };
    externalObservation = result; externalWatching = true; externalError = result ? '' : 'Editing selected field. Review updates after a pause.'; publish();
  },
  onStop: () => { stopExternal(); publish(); },
});
const runtimeKeys = { nebius: process.env.NEBIUS_API_KEY || '', tavily: process.env.TAVILY_API_KEY || '' };

function secretPath() { return path.join(app.getPath('userData'), 'averill-secrets.enc.json'); }
async function loadSecrets() {
  if (runtimeKeys.nebius && runtimeKeys.tavily) return;
  try {
    if (!await safeStorage.isAsyncEncryptionAvailable()) return;
    const encrypted = JSON.parse(fs.readFileSync(secretPath(), 'utf8'));
    for (const service of ['nebius', 'tavily']) {
      if (!runtimeKeys[service] && encrypted[service]) runtimeKeys[service] = (await safeStorage.decryptStringAsync(Buffer.from(encrypted[service], 'base64'))).result;
    }
  } catch { /* Environment variables remain usable when local encrypted storage is absent. */ }
}
async function saveSecret(service, value) {
  if (!['nebius', 'tavily'].includes(service)) throw new Error('Unknown service');
  if (!await safeStorage.isAsyncEncryptionAvailable()) throw new Error('Secure operating-system storage is unavailable');
  const key = String(value || '').trim();
  if (!key || key.length > 500) throw new Error('Enter a valid API key');
  let encrypted = {};
  try { encrypted = JSON.parse(fs.readFileSync(secretPath(), 'utf8')); } catch { /* First key. */ }
  encrypted[service] = (await safeStorage.encryptStringAsync(key)).toString('base64');
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(secretPath(), JSON.stringify(encrypted), { mode: 0o600 });
  runtimeKeys[service] = key;
}

function signedIn() {
  return Boolean(companyWorkspace && (!companyWorkspace.authEnabled || authenticatedPersonId === companyWorkspace.activePersonId));
}
function requireSession() { if (!signedIn()) throw new Error('Sign in to your account first.'); }
function stopExternal(clearSelection = true) {
  browserBridge.stop();
  externalEpoch += 1;
  if (externalWatchTimer) clearInterval(externalWatchTimer);
  externalWatchTimer = null;
  externalWatching = false;
  externalObservation = null;
  externalError = '';
  if (clearSelection) selectedExternalWindow = null;
}
function isOwnWindowSource(source) {
  return [agentWindow, companionWindow, ...workWindows.values()].some(window => window && !window.isDestroyed() && window.getMediaSourceId() === source.id);
}
function clearSessionWork() {
  shared.clear(); aiEnabled = false; stopExternal();
  workState.clear();
  for (const window of workWindows.values()) if (!window.isDestroyed()) window.close();
  workWindows.clear();
  if (companionWindow && !companionWindow.isDestroyed()) companionWindow.hide();
}
function snapshot() {
  return {
    auth: { enabled: Boolean(companyWorkspace?.authEnabled), signedIn: signedIn(), accounts: accounts.publicAccounts(companyWorkspace), person: signedIn() ? accounts.publicAccounts(companyWorkspace).find(p => p.id === companyWorkspace.activePersonId) || null : null },
    privacy: {companyAI:privacy.allowed(companyWorkspace)},
    cloud: signedIn() && workspace.person(companyWorkspace)?.role==='admin' ? cloud.status(companyWorkspace) : [],
    onboarding: signedIn() ? onboarding.snapshot(companyWorkspace) : null,
    workspace: signedIn() ? workspace.publicSnapshot(companyWorkspace) : { configured: Boolean(companyWorkspace), company: companyWorkspace?.company },
    learning: learning.snapshot(signedIn() ? companyWorkspace : null),
    browserBridge: signedIn() ? browserBridge.status() : {ready:false,connected:false},
    externalWindow: signedIn() ? selectedExternalWindow : null,
    externalWatching: signedIn() && externalWatching,
    externalObservation: signedIn() ? externalObservation : null,
    externalError: signedIn() ? externalError : '',
    services: { nebius: Boolean(runtimeKeys.nebius), tavily: Boolean(runtimeKeys.tavily) },
    shared: [...shared],
    open: [...workWindows.keys()],
    aiEnabled,
    findings: workKinds.flatMap((kind) => shared.has(kind) ? inspect(kind, workState.get(kind) || {}).map((item) => ({ ...item, kind })) : []),
  };
}

function publish() {
  if (agentWindow && !agentWindow.isDestroyed()) agentWindow.webContents.send('agent:snapshot', snapshot());
  if (companionWindow && !companionWindow.isDestroyed()) {
    if (signedIn() && !companionWindow.isVisible()) companionWindow.showInactive();
    else if (!signedIn() && companionWindow.isVisible()) companionWindow.hide();
    companionWindow.webContents.send('companion:status', { watching: externalWatching, window: selectedExternalWindow?.name || '', capturedAt: externalObservation?.capturedAt || null, error: externalError });
  }
  for (const [kind, window] of workWindows) {
    if (!window.isDestroyed()) window.webContents.send('work:sharing', shared.has(kind));
  }
}

async function captureExternal() {
  requireSession();
  if (!selectedExternalWindow) throw new Error('Choose a work window first.');
  if (selectedExternalWindow.adapter === 'browser-dom') {
    if (!externalObservation) throw new Error('Select a draft field in the browser and finish editing before review.');
    return { window: externalObservation.windowName, text: externalObservation.text, method: 'browser-dom', capturedAt: externalObservation.capturedAt };
  }
  const chosen = selectedExternalWindow;
  const personId = companyWorkspace.activePersonId;
  const epoch = externalEpoch;
  const sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 1600, height: 1000 } });
  const source = sources.find(item => item.id === chosen.id);
  if (!source) { if (epoch === externalEpoch && selectedExternalWindow?.id === chosen.id) { stopExternal(); publish(); } throw new Error('The selected window closed. Choose it again.'); }
  const identity = await nativeWindow('identity', chosen.id);
  if (identity.status === 'gone' || chosen.pid && identity.pid && identity.pid !== chosen.pid) {
    if (epoch === externalEpoch && selectedExternalWindow?.id === chosen.id) { stopExternal(); publish(); }
    throw new Error('The selected window changed or closed. Choose it again.');
  }
  let method = 'accessibility';
  const accessible = await nativeWindow('read', chosen.id);
  let content = accessible.status === 'readable' && (!chosen.pid || accessible.pid === chosen.pid) ? accessible.text : '';
  if (!content) {
    method = 'ocr';
    if (source.thumbnail.isEmpty()) throw new Error('Visible-text capture is unavailable. Check Screen Recording permission or select a different window.');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-capture-'));
    const imagePath = path.join(directory, 'capture.png');
    try {
      fs.writeFileSync(imagePath, source.thumbnail.toPNG(), { mode: 0o600 });
      content = workspace.extractText(imagePath);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
  }
  if (!signedIn() || epoch !== externalEpoch || personId !== companyWorkspace.activePersonId || selectedExternalWindow?.id !== chosen.id) throw new Error('Sharing stopped before capture completed.');
  const next = observation({ personId, windowId: chosen.id, windowName: source.name || chosen.name, method, text: content });
  selectedExternalWindow = { ...chosen, name: source.name || chosen.name };
  externalError = '';
  if (!externalObservation || externalObservation.contentHash !== next.contentHash || externalObservation.method !== next.method) externalObservation = next;
  publish();
  return { window: next.windowName, text: next.text, method: next.method, confidence: next.confidence, capturedAt: next.capturedAt };
}

async function watchExternalTick() {
  if (!externalWatching || externalCaptureBusy) return;
  externalCaptureBusy = true;
  try { await captureExternal(); }
  catch (error) { if (externalWatching) { externalError = error.message; publish(); } }
  finally { externalCaptureBusy = false; }
}

function createWindow(file, options, query) {
  const window = new BrowserWindow({
    ...options,
    backgroundColor: '#002129',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  window.loadFile(path.join(__dirname, 'src', file), query ? { query } : undefined);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  return window;
}

function openWork(kind) {
  requireSession();
  if (!workKinds.includes(kind)) return;
  const existing = workWindows.get(kind);
  if (existing && !existing.isDestroyed()) { existing.focus(); return; }
  const titles = { email: 'Email Studio', linkedin: 'LinkedIn Draft', social: 'Social Publisher', handover: 'Campaign Files' };
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.max(760, Math.min(980, area.width - 540));
  const height = Math.min(850, area.height - 24);
  const window = createWindow('work.html', { x: area.x + 12, y: area.y + 12, width, height, minWidth: 760, minHeight: 620, title: `${titles[kind]} · Vamo` }, { kind, person: companyWorkspace.activePersonId });
  workWindows.set(kind, window);
  window.on('closed', () => { workWindows.delete(kind); workState.delete(kind); shared.delete(kind); publish(); });
  publish();
}

app.whenReady().then(async () => {
  companyWorkspace = workspace.load(app.getPath('userData'));
  await cloud.load();
  const area = screen.getPrimaryDisplay().workArea;
  const agentWidth = Math.min(520, area.width - 40);
  agentWindow = createWindow('agent.html', { x: area.x + area.width - agentWidth - 12, y: area.y + 12, width: agentWidth, height: Math.min(850, area.height - 24), minWidth: 440, minHeight: 660, title: 'Averill' });
  const companionPath = path.join(app.getPath('userData'), 'averill-companion-position.json');
  let savedCompanion = null;
  try { savedCompanion = JSON.parse(fs.readFileSync(companionPath, 'utf8')); } catch { /* First launch. */ }
  const position = clampCompanion(savedCompanion, screen.getAllDisplays());
  companionWindow = createWindow('companion.html', { ...position, minWidth: 210, minHeight: 84, frame: false, transparent: true, resizable: false, skipTaskbar: true, alwaysOnTop: true, show: false, title: 'Ask Averill' });
  companionWindow.setAlwaysOnTop(true, 'floating');
  companionWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  companionWindow.on('moved', () => { try { fs.writeFileSync(companionPath, JSON.stringify(companionWindow.getBounds()), { mode: 0o600 }); } catch { /* Position is optional. */ } });
  const keepCompanionVisible = () => {
    if (companionWindow && !companionWindow.isDestroyed()) companionWindow.setBounds(clampCompanion(companionWindow.getBounds(), screen.getAllDisplays()));
  };
  screen.on('display-removed', keepCompanionVisible);
  screen.on('display-metrics-changed', keepCompanionVisible);
  companionWindow.on('closed', () => { companionWindow = null; });
  agentWindow.on('closed', () => { if (companionWindow && !companionWindow.isDestroyed()) companionWindow.close(); });
  loadSecrets().then(publish).catch(() => {});
  const fromAgent = (event, allowAnonymous = false) => {
    if (event.sender !== agentWindow.webContents) throw new Error('Averill window required');
    if (!allowAnonymous) {
      requireSession();
      if (onboardingBusy) throw new Error('Wait for the current onboarding operation to finish.');
    }
  };
  const fromApp = (event) => {
    if (event.sender !== agentWindow.webContents && ![...workWindows.values()].some(w => w.webContents === event.sender)) throw new Error('Averill application window required');
    requireSession();
  };
  ipcMain.handle('companion:open', (event) => {
    if (!companionWindow || event.sender !== companionWindow.webContents) throw new Error('Companion window required');
    requireSession();
    agentWindow.show(); agentWindow.focus();
    agentWindow.webContents.send('agent:open-context');
    return true;
  });
  ipcMain.handle('companion:snapshot', (event) => {
    if (!companionWindow || event.sender !== companionWindow.webContents) throw new Error('Companion window required');
    if (!signedIn()) return { watching: false, window: '', capturedAt: null, error: '' };
    return { watching: externalWatching, window: selectedExternalWindow?.name || '', capturedAt: externalObservation?.capturedAt || null, error: externalError };
  });
  ipcMain.handle('companion:stop', (event) => {
    if (!companionWindow || event.sender !== companionWindow.webContents) throw new Error('Companion window required');
    requireSession(); stopExternal(); publish(); return true;
  });
  const persistWorkspace = () => { workspace.save(app.getPath('userData'), companyWorkspace); publish(); return snapshot(); };
  ipcMain.handle('learning:action', (event, action, payload = {}) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid learning action');
    if (action === 'record') learning.record(companyWorkspace, payload);
    else if (action === 'start') learning.start(companyWorkspace, payload.sourceId);
    else if (action === 'finding-start') {
      if (!workKinds.includes(payload.kind) || !shared.has(payload.kind)) throw new Error('Share the work window and select a current finding first.');
      const finding = inspect(payload.kind, workState.get(payload.kind) || {}).find(item => item.id === payload.findingId);
      if (!finding) throw new Error('This finding has changed. Review the current work again.');
      learning.startFinding(companyWorkspace, { ...finding, kind: payload.kind });
    }
    else if (action === 'finding-complete') {
      const session = learning.snapshot(companyWorkspace).sessions.find(item => item.id === payload.sessionId && item.exercise);
      if (!session) throw new Error('Finding exercise unavailable.');
      const kind = session.exercise.kind;
      const check = !shared.has(kind) ? 'not-checked' : inspect(kind, workState.get(kind) || {}).some(item => item.id === session.exercise.findingId) ? 'still-found' : 'rule-clear';
      learning.completeFinding(companyWorkspace, payload.sessionId, payload.reflection, check);
    }
    else if(action==='project-start')learning.startProject(companyWorkspace,payload.projectId,payload.sourceId);
    else if(action==='project-confirm')learning.confirmProject(companyWorkspace,payload.sessionId,payload.note);
    else if (action === 'confirm') learning.confirm(companyWorkspace, payload.sessionId, payload.stepId);
    else if (action === 'exclude') learning.exclude(companyWorkspace, payload.sessionId);
    else if (action === 'delete-history') learning.deleteHistory(companyWorkspace);
    else if (action === 'quiz') learning.beginQuiz(companyWorkspace);
    else if (action === 'answer') learning.answer(companyWorkspace, payload.quizId, payload.questionId, payload.value);
    else throw new Error('Unknown learning action');
    return persistWorkspace();
  });
  ipcMain.handle('workspace:create', async (event, company, adminName, email, password) => {
    fromAgent(event, true);
    if (!accounts.validEmail(email)) throw new Error('Enter your account email.');
    accounts.validatePassword(password);
    // Hash before writing the workspace: validation failures cannot strand first-run setup.
    const hashed = await accounts.credential(password);
    companyWorkspace = workspace.create(app.getPath('userData'), company, adminName);
    const owner = workspace.person(companyWorkspace);
    Object.assign(owner, { email: accounts.email(email), profile: 'owner', jobTitle: accounts.profiles.owner.label, credential: hashed });
    companyWorkspace.authEnabled = true; authenticatedPersonId = owner.id;
    accountDocuments.save(app.getPath('userData'), companyWorkspace, [{ email: owner.email, password }]);
    return persistWorkspace();
  });
  ipcMain.handle('account:login', async (event, email, password) => {
    fromAgent(event, true);
    if (onboardingBusy) throw new Error('Wait for onboarding to finish before changing accounts.');
    if (Date.now() < loginFailures.until) throw new Error('Too many attempts. Wait a minute and retry.');
    try {
      const person = await accounts.authenticate(companyWorkspace, email, password);
      clearSessionWork(); authenticatedPersonId = person.id; workspace.switchPerson(companyWorkspace, person.id);
      loginFailures = { count: 0, until: 0 }; return persistWorkspace();
    } catch (error) {
      loginFailures.count++; if (loginFailures.count >= 5) { loginFailures.until = Date.now() + 60000; loginFailures.count = 0; }
      throw error;
    }
  });
  ipcMain.handle('account:logout', (event) => {
    fromAgent(event); if (onboardingBusy) throw new Error('Wait for onboarding to finish before signing out.');
    clearSessionWork(); authenticatedPersonId = null; publish(); return snapshot();
  });
  ipcMain.handle('account:enable', async (event, email, password) => {
    fromAgent(event);
    if (companyWorkspace.authEnabled || workspace.person(companyWorkspace)?.role !== 'admin') throw new Error('Only the current legacy administrator can enable accounts.');
    await accounts.configure(companyWorkspace, companyWorkspace.activePersonId, email, password, 'owner');
    accountDocuments.save(app.getPath('userData'), companyWorkspace, [{ email: accounts.email(email), password }]);
    authenticatedPersonId = companyWorkspace.activePersonId; clearSessionWork(); return persistWorkspace();
  });
  ipcMain.handle('account:create', async (event, personId, email, profile) => {
    fromAgent(event);
    if (workspace.person(companyWorkspace)?.role !== 'admin' || !companyWorkspace.authEnabled) throw new Error('Sign in as the owner to create accounts.');
    const actor = companyWorkspace.activePersonId;
    const password = accounts.temporaryPassword();
    const next = structuredClone(companyWorkspace);
    await accounts.configure(next, personId, email, password, profile);
    fromAgent(event); if (companyWorkspace.activePersonId !== actor) throw new Error('Account changed. Retry as the owner.');
    companyWorkspace = next; persistWorkspace();
    accountDocuments.save(app.getPath('userData'), companyWorkspace, [{ email: accounts.email(email), password }]);
    return { snapshot: snapshot(), account: { email: accounts.email(email), profile, password } };
  });
  ipcMain.handle('account:documents', async (event) => {
    fromAgent(event);
    if (workspace.person(companyWorkspace)?.role !== 'admin') throw new Error('Administrator access required.');
    const folder = accountDocuments.directory(app.getPath('userData'));
    fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
    const error = await shell.openPath(folder);
    if (error) throw new Error(error);
    return true;
  });
  ipcMain.handle('account:disable',(event,personId)=>{admin(event);const target=accounts.disable(companyWorkspace,personId);const result=persistWorkspace();accountDocuments.remove(app.getPath('userData'),target.email);return result;});
  ipcMain.handle('account:recover',async(event,personId)=>{admin(event);const actor=companyWorkspace.activePersonId,next=structuredClone(companyWorkspace);const {target,password}=await accounts.recover(next,personId);admin(event);if(companyWorkspace.activePersonId!==actor)throw new Error('Account changed.');companyWorkspace=next;persistWorkspace();accountDocuments.save(app.getPath('userData'),companyWorkspace,[{email:target.email,password}]);return {snapshot:snapshot(),account:{email:target.email,profile:target.profile,password}};});
  ipcMain.handle('account:change-password',async(event,currentPassword,nextPassword)=>{fromAgent(event);const actor=companyWorkspace.activePersonId,next=structuredClone(companyWorkspace);const target=await accounts.changePassword(next,actor,currentPassword,nextPassword);fromAgent(event);if(companyWorkspace.activePersonId!==actor)throw new Error('Account changed.');companyWorkspace=next;persistWorkspace();accountDocuments.save(app.getPath('userData'),companyWorkspace,[{email:target.email,password:nextPassword}]);return snapshot();});
  const admin = (event) => { fromAgent(event); if(workspace.person(companyWorkspace)?.role!=='admin')throw new Error('Administrator access required.'); };
  const addIntake = (selected) => {
    const previous = companyWorkspace.onboarding;
    const existing = previous && !previous.applied ? previous.files.map(f=>({path:f.storedPath,name:f.name,origin:f.origin,confidentiality:f.confidentiality})) : [];
    if(existing.length+selected.length>30)throw new Error('Choose up to 30 files per onboarding batch. Confirm the current batch first.');
    onboarding.stage(app.getPath('userData'),companyWorkspace,[...existing,...selected]);
  };
  const remoteBatch = async (event,loader) => {
    admin(event); const actor=companyWorkspace.activePersonId;
    onboardingBusy=true; const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'averill-download-'));
    try {
      const entries=await loader(temporary);requireSession();if(actor!==companyWorkspace.activePersonId)throw new Error('Account changed. Retry import.');
      addIntake(entries);return persistWorkspace();
    } finally {onboardingBusy=false;fs.rmSync(temporary,{recursive:true,force:true});}
  };
  ipcMain.handle('company:privacy',(event,enabled)=>{admin(event);privacy.configure(companyWorkspace,enabled);if(!enabled)aiEnabled=false;return persistWorkspace();});
  ipcMain.handle('onboarding:read-file',(event,id)=>{
    admin(event);const draft=companyWorkspace.onboarding;
    if(!draft||draft.ownerId!==companyWorkspace.activePersonId)throw new Error('This upload is not available to this account.');
    const file=draft.files.find(f=>f.id===id);if(!file)throw new Error('Uploaded document not found.');
    return {title:file.name,text:file.text||'',readable:file.readable};
  });
  ipcMain.handle('onboarding:drop',(event,files)=>{admin(event);if(!Array.isArray(files)||!files.length||files.some(f=>typeof f!=='string'||!path.isAbsolute(f)))throw new Error('Drop local files from Finder or the Desktop.');addIntake(files);return persistWorkspace();});
  ipcMain.handle('onboarding:synced',async(event)=>{
    admin(event);const actor=companyWorkspace.activePersonId;
    const result=await dialog.showOpenDialog(agentWindow,{title:'Choose files from a synced Google Drive or OneDrive folder',properties:['openFile','multiSelections']});
    admin(event);if(actor!==companyWorkspace.activePersonId)throw new Error('Account changed.');if(result.canceled)return {...snapshot(),operationNotice:'Selection cancelled. No files added.'};addIntake(result.filePaths.map(file=>({path:file,origin:{kind:'synced-folder'}})));return persistWorkspace();
  });
  ipcMain.handle('onboarding:links',async(event,links)=>remoteBatch(event,async(temporary)=>{
    if(!Array.isArray(links)||!links.length||links.length>30||links.some(l=>typeof l!=='string'||l.length>4000))throw new Error('Enter up to 30 HTTPS document links.');
    const entries=[];
    for(const link of links){
      let linked;try{linked=new URL(link);}catch{throw new Error('Enter valid HTTPS document links.');}
      if(linked.protocol!=='https:'||linked.username||linked.password)throw new Error('Use HTTPS links without embedded credentials.');
      if(['drive.google.com','docs.google.com'].includes(linked.hostname)){const id=linked.pathname.match(/\/d\/([\w-]+)/)?.[1]||linked.searchParams.get('id');if(id){const file=await cloud.fileDownload(companyWorkspace,'google',id);entries.push({path:remoteImport.save(temporary,file.response,file.name,onboarding.EXTENSIONS),origin:file.origin});continue;}}
      const response=await remoteImport.download(link);const host=new URL(response.url).hostname;let name;try{name=decodeURIComponent(new URL(response.url).pathname.split('/').pop());}catch{name='linked-document';}
      const file=remoteImport.save(temporary,response,name||'linked-document',onboarding.EXTENSIONS);entries.push({path:file,origin:{kind:'link',host}});}
    return entries;
  }));
  ipcMain.handle('cloud:configure',async(event,provider,id,secret)=>{admin(event);onboardingBusy=true;try{await cloud.configure(provider,id,secret);return snapshot();}finally{onboardingBusy=false;publish();}});
  ipcMain.handle('cloud:connect',async(event,provider)=>{
    admin(event);const actor=companyWorkspace.activePersonId;onboardingBusy=true;
    try{await cloud.connect(companyWorkspace,provider,()=>{requireSession();if(actor!==companyWorkspace.activePersonId)throw new Error('Account changed.');});return snapshot();}finally{onboardingBusy=false;publish();}
  });
  ipcMain.handle('cloud:cancel',event=>{fromAgent(event,true);requireSession();if(workspace.person(companyWorkspace)?.role!=='admin')throw new Error('Administrator access required.');cloud.cancel?.();return true;});
  ipcMain.handle('cloud:disconnect',async(event,provider)=>{admin(event);onboardingBusy=true;try{await cloud.disconnect(companyWorkspace,provider);return snapshot();}finally{onboardingBusy=false;publish();}});
  ipcMain.handle('cloud:list',async(event,provider,folder,cursor)=>{admin(event);const actor=companyWorkspace.activePersonId;const result=await cloud.list(companyWorkspace,provider,folder,cursor||'');admin(event);if(actor!==companyWorkspace.activePersonId)throw new Error('Account changed.');return result;});
  ipcMain.handle('cloud:import',async(event,provider,ids)=>remoteBatch(event,async(temporary)=>{
    if(!Array.isArray(ids)||!ids.length||ids.length>30)throw new Error('Select up to 30 cloud files.');
    const entries=[];for(const id of [...new Set(ids)]){const file=await cloud.fileDownload(companyWorkspace,provider,id);entries.push({path:remoteImport.save(temporary,file.response,file.name,onboarding.EXTENSIONS),origin:file.origin});}return entries;
  }));
  ipcMain.handle('onboarding:upload', async (event) => {
    fromAgent(event);
    if (workspace.person(companyWorkspace)?.role !== 'admin') throw new Error('Administrator access required.');
    if (onboardingBusy) throw new Error('An onboarding operation is already running.');
    const personId = companyWorkspace.activePersonId;
    const selection = await dialog.showOpenDialog(agentWindow, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Company files — Excel, PDF, SVG and documents', extensions: [...onboarding.EXTENSIONS].map(e => e.slice(1)) }] });
    fromAgent(event);
    if (personId !== companyWorkspace.activePersonId) throw new Error('Account changed. Upload the files again.');
    if(selection.canceled)return {...snapshot(),operationNotice:'Selection cancelled. No files added.'};
    addIntake(selection.filePaths);
    return persistWorkspace();
  });
  ipcMain.handle('onboarding:analyze', async (event, consent, selections) => {
    fromAgent(event);
    if (onboardingBusy) throw new Error('An onboarding operation is already running.');
    const personId = companyWorkspace.activePersonId;
    onboardingBusy = true;
    try {
      if(consent!==true)throw new Error('Authorize the selected files before external AI analysis.');
      if(workspace.person(companyWorkspace)?.role!=='admin')throw new Error('Administrator access required.');
      privacy.requireAI(companyWorkspace);
      privacy.permissions(companyWorkspace.onboarding?.files||[],selections);
      workspace.save(app.getPath('userData'),companyWorkspace);
      await onboarding.analyze(companyWorkspace, runtimeKeys.nebius, { consent: consent === true, authorize: () => { requireSession(); if (personId !== companyWorkspace.activePersonId) throw new Error('Account changed.'); } });
      return persistWorkspace();
    } finally { onboardingBusy = false; }
  });
  ipcMain.handle('onboarding:apply', async (event, review) => {
    fromAgent(event);
    if (onboardingBusy) throw new Error('An onboarding operation is already running.');
    if (!companyWorkspace.authEnabled) throw new Error('Enable the owner account before creating employee accounts.');
    onboardingBusy = true;
    try {
      const result = await onboarding.apply(app.getPath('userData'), companyWorkspace, review);
      accountDocuments.save(app.getPath('userData'), companyWorkspace, result.receipt);
      publish(); return { ...result, snapshot: snapshot() };
    } finally { onboardingBusy = false; }
  });
  ipcMain.handle('workspace:add-person', (event, name, role, department) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    workspace.addPerson(companyWorkspace, name, role, department);
    return persistWorkspace();
  });
  ipcMain.handle('workspace:switch-person', (event, personId) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    if (companyWorkspace.authEnabled) throw new Error('Sign out and use the other account email/password.');
    workspace.switchPerson(companyWorkspace, personId);
    clearSessionWork();
    return persistWorkspace();
  });
  ipcMain.handle('workspace:import', async (event, options) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    const selection = await dialog.showOpenDialog(agentWindow, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Documents and exported designs', extensions: ['md', 'txt', 'csv', 'json', 'xlsx', 'pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg'] }] });
    if (selection.canceled) return {...snapshot(),operationNotice:'Selection cancelled. No files added.'};
    for (const file of selection.filePaths) workspace.importFile(app.getPath('userData'), companyWorkspace, file, options || {});
    return persistWorkspace();
  });
  ipcMain.handle('workspace:import-folder', async (event, options) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    const selection = await dialog.showOpenDialog(agentWindow, { properties: ['openDirectory'] });
    if (selection.canceled || !selection.filePaths[0]) return { ...snapshot(), importSummary: null };
    const importSummary = workspace.importFolder(app.getPath('userData'), companyWorkspace, selection.filePaths[0], options || {});
    return { ...persistWorkspace(), importSummary };
  });
  ipcMain.handle('workspace:update-source', (event, id, action, priority, reason, supersedesId) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    workspace.updateSource(companyWorkspace, id, action, priority, reason, supersedesId);
    return persistWorkspace();
  });
  ipcMain.handle('workspace:propose-source', (event, id) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    workspace.proposeSource(companyWorkspace, id);
    return persistWorkspace();
  });
  ipcMain.handle('workspace:open-source', async (event, id) => {
    fromAgent(event);
    const source = workspace.visibleSources(companyWorkspace || { people: [], sources: [] }).find((entry) => entry.id === id);
    return source ? (await shell.openPath(source.storedPath)) === '' : false;
  });
  ipcMain.handle('workspace:knowledge',(event,query,status,filters)=>{fromAgent(event);return companyWorkspace?knowledge.list(companyWorkspace,query,status,filters):{documents:[],total:0,approved:0,uploaded:0};});
  ipcMain.handle('workspace:compare-sources',(event,newId,oldId)=>{fromAgent(event);return sourceReview.compare(companyWorkspace,newId,oldId);});
  ipcMain.handle('workspace:remove-source',(event,id)=>{fromAgent(event);workspace.removeSource(app.getPath('userData'),companyWorkspace,id);publish();return snapshot();});
  ipcMain.handle('workspace:request-clarification',(event,question)=>{fromAgent(event);workspace.requestClarification(companyWorkspace,question);return persistWorkspace();});
  ipcMain.handle('workspace:resolve-clarification',(event,id,reply,sourceId)=>{fromAgent(event);workspace.resolveClarification(companyWorkspace,id,reply,sourceId);return persistWorkspace();});
  ipcMain.handle('workspace:read-file', (event, id) => {
    fromAgent(event);
    const source = workspace.visibleSources(companyWorkspace || { people: [], sources: [] }).find((entry) => entry.id === id);
    if (!source) throw new Error('File is not accessible');
    return { title: source.title, text: source.textPath ? fs.readFileSync(source.textPath, 'utf8').slice(0, 100000) : '' };
  });
  ipcMain.handle('workspace:save-key', async (event, service, value) => {
    fromAgent(event);
    if (!companyWorkspace || workspace.person(companyWorkspace)?.role !== 'admin') throw new Error('Administrator access required');
    await saveSecret(service, value);
    publish(); return snapshot();
  });
  ipcMain.handle('agent:snapshot', (event) => { fromAgent(event, true); return snapshot(); });
  ipcMain.handle('agent:open-work', (event, kind) => { fromApp(event); if (!workKinds.includes(kind)) throw new Error('Unknown work window'); openWork(kind); return snapshot(); });
  ipcMain.handle('agent:copy-finding', (event, kind, id) => {
    fromAgent(event);
    if (!workKinds.includes(kind) || !shared.has(kind)) throw new Error('Share the work window first.');
    const finding = inspect(kind, workState.get(kind) || {}).find(item => item.id === id);
    if (!finding) throw new Error('This finding has changed.');
    clipboard.writeText(`${finding.action}. ${finding.body}`);
    return true;
  });
  ipcMain.handle('agent:share', (event, kind, enable) => {
    fromAgent(event);
    if (!workKinds.includes(kind) || !workWindows.has(kind)) return snapshot();
    if (enable) shared.add(kind); else shared.delete(kind);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ai-mode', (event, enabled) => {
    fromAgent(event);
    if (enabled) privacy.requireAI(companyWorkspace);
    aiEnabled = Boolean(enabled) && Boolean(runtimeKeys.nebius);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ask', (event, question) => {
    fromAgent(event);
    if(aiEnabled&&privacy.credentials(question))throw new Error('Remove credentials before using external AI.');
    if (companyWorkspace) {
      return aiEnabled && privacy.allowed(companyWorkspace) ? answerWorkspace(companyWorkspace, question, runtimeKeys.nebius) : localWorkspaceAnswer(companyWorkspace, question);
    }
    return aiEnabled && privacy.allowed(companyWorkspace) ? answerQuestion(question, runtimeKeys.nebius) : { ...localAnswer(String(question || '').slice(0, 1000)), mode: 'local' };
  });
  ipcMain.handle('agent:ask-demo', (event, question) => {
    fromAgent(event);
    if(aiEnabled&&privacy.credentials(question))throw new Error('Remove credentials before using external AI.');
    return aiEnabled && privacy.allowed(companyWorkspace) ? answerQuestion(question, runtimeKeys.nebius) : { ...localAnswer(String(question || '').slice(0, 1000)), mode: 'local' };
  });
  ipcMain.handle('agent:web-search', (event, query) => { fromAgent(event); if (privacy.credentials(query)) throw new Error('Remove credentials before public web research.'); return searchPublicWeb(query, runtimeKeys.tavily); });
  ipcMain.handle('agent:fact-check', (event, query) => { fromAgent(event); if (privacy.credentials(query)) throw new Error('Remove credentials before public fact-checking.'); return factCheckPublic(query, runtimeKeys.tavily); });
  ipcMain.handle('agent:external-windows', async (event) => {
    fromAgent(event);
    const permission = process.platform === 'darwin' ? systemPreferences.getMediaAccessStatus('screen') : 'granted';
    const sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 0, height: 0 } });
    return { permission, windows: sources.filter((source) => source.name && !isOwnWindowSource(source)).map((source) => ({ id: source.id, name: source.name })) };
  });
  ipcMain.handle('agent:external-share', async (event, id, name) => {
    fromAgent(event);
    if (id) {
      if (!windowNumber(id)) throw new Error('Choose a listed work window.');
      const available = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 0, height: 0 } });
      if (!available.some(source => source.id === id && source.name === name && source.name && !isOwnWindowSource(source))) throw new Error('Choose an available external window.');
      fromAgent(event);
      const identity = await nativeWindow('identity', id);
      if (identity.status === 'gone') throw new Error('That window closed. Choose it again.');
      fromAgent(event);
      stopExternal();
      selectedExternalWindow = { id: String(id), name: String(name).slice(0, 150), pid: Number(identity.pid) || null, app: String(identity.owner || 'External app').slice(0, 100) };
    } else {
      stopExternal();
    }
    publish(); return snapshot();
  });
  ipcMain.handle('agent:external-review', async (event) => { fromAgent(event); return captureExternal(); });
  ipcMain.handle('agent:browser-pair', async event => {
    fromAgent(event); stopExternal();
    const personId = companyWorkspace.activePersonId, pairingEpoch = externalEpoch;
    const pair = await browserBridge.start(personId);
    try { fromAgent(event); if (personId !== companyWorkspace.activePersonId || pairingEpoch !== externalEpoch) throw new Error('Sharing or account changed. Start pairing again.'); }
    catch (error) { browserBridge.stop(); throw error; }
    publish(); return pair;
  });
  ipcMain.handle('agent:browser-copy-pair', async event => {
    fromAgent(event);
    if (!browserBridge.token || !browserBridge.server) throw new Error('Start browser pairing first.');
    clipboard.writeText(JSON.stringify({ endpoint: `http://127.0.0.1:${browserBridge.server.address().port}/observation`, token: browserBridge.token }));
    return true;
  });
  ipcMain.handle('agent:external-recheck', async (event, task) => {
    fromAgent(event);
    if (!taskReview.tasks[task]) throw new Error('Choose a supported work type.');
    await captureExternal();
    fromAgent(event);
    const observed = externalObservation;
    if (!observed || !selectedExternalWindow) throw new Error('Sharing stopped before review completed.');
    return { ...taskReview.localReview(companyWorkspace, task, observed.text, observed.field), observedAt: observed.capturedAt, method: observed.method, window: observed.windowName, contentHash: observed.contentHash };
  });
  ipcMain.handle('agent:external-task-review', async (event, task, useAI) => {
    fromAgent(event);
    if (!taskReview.tasks[task]) throw new Error('Choose a supported work type.');
    const observed = externalObservation;
    if (!observed || !selectedExternalWindow || observed.windowId !== selectedExternalWindow.id) throw new Error('Read the selected window before reviewing its work.');
    const personId = companyWorkspace.activePersonId;
    const epoch = externalEpoch;
    const result = await taskReview.reviewTask(companyWorkspace, task, observed.text, runtimeKeys.nebius, useAI === true && aiEnabled, observed.field);
    fromAgent(event);
    if (epoch !== externalEpoch || personId !== companyWorkspace.activePersonId || observed.contentHash !== externalObservation?.contentHash) throw new Error('The work changed or sharing stopped. Read it again.');
    const current = new Map(taskReview.currentSources(companyWorkspace, task).map(item => [item.source.id, item]));
    if (result.findings.some(item => { const entry = current.get(item.source.id); return !entry || entry.source.version !== item.source.version || entry.source.approvedAt !== item.source.approvedAt || !entry.text.includes(item.source.quote); })) throw new Error('The approved company sources changed. Review again.');
    return { ...result, observedAt: observed.capturedAt, method: observed.method, window: observed.windowName, contentHash: observed.contentHash };
  });
  ipcMain.handle('agent:external-watch', (event, enabled) => {
    fromAgent(event);
    if (enabled && !selectedExternalWindow) throw new Error('Choose a work window first.');
    if (selectedExternalWindow?.adapter === 'browser-dom' && enabled) throw new Error('Browser field sharing is controlled by the extension.');
    if (!enabled) { stopExternal(false); publish(); return snapshot(); }
    externalWatching = true;
    if (!externalWatchTimer) externalWatchTimer = setInterval(watchExternalTick, 6000);
    watchExternalTick(); publish(); return snapshot();
  });
  ipcMain.handle('agent:open-web', async (event, url) => {
    fromAgent(event);
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) return false;
      await shell.openExternal(parsed.toString());
      return true;
    } catch { return false; }
  });
  ipcMain.handle('agent:source', (event, id) => {
    fromApp(event);
    if (companyWorkspace) {
      const item = workspace.visibleSources(companyWorkspace).find((source) => source.id === id && source.status === 'approved');
      if (item) return { id, title: item.title, kind: 'workspace', content: item.textPath ? fs.readFileSync(item.textPath, 'utf8') : 'No readable text was extracted. Open the file on this computer.' };
    }
    const source = sourceFor(id);
    return source ? { ...source, content: fs.readFileSync(source.path, 'utf8') } : null;
  });
  ipcMain.handle('agent:open-source', async (event, id) => {
    fromApp(event);
    if (companyWorkspace) {
      const item = workspace.visibleSources(companyWorkspace).find((source) => source.id === id && source.status === 'approved');
      if (item) return (await shell.openPath(item.storedPath)) === '';
    }
    const source = sourceFor(id);
    if (!source) return false;
    return (await shell.openPath(source.path)) === '';
  });
  ipcMain.on('work:update', (event, kind, data) => {
    if (!signedIn()) return;
    const window = workWindows.get(kind);
    if (!window || event.sender !== window.webContents || !workKinds.includes(kind)) return;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    workState.set(kind, data);
    if (shared.has(kind)) publish();
  });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) app.quit(); });
});

app.on('before-quit', () => browserBridge.stop());
app.on('window-all-closed', () => app.quit());
