const { app, BrowserWindow, ipcMain, shell, dialog, desktopCapturer, systemPreferences, safeStorage, screen } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });
const { inspect, answer: localAnswer } = require('./src/engine');
const { answerQuestion } = require('./src/assistant');
const { sourceFor } = require('./src/campaign');
const workspace = require('./src/workspace');
const { answerWorkspace, localWorkspaceAnswer } = require('./src/workspace-answer');
const { searchPublicWeb } = require('./src/web-search');

const workKinds = ['email', 'social', 'handover'];
const workWindows = new Map();
const workState = new Map();
const shared = new Set();
let agentWindow;
let aiEnabled = false;
let companyWorkspace = null;
let selectedExternalWindow = null;
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

function snapshot() {
  return {
    workspace: workspace.publicSnapshot(companyWorkspace),
    externalWindow: selectedExternalWindow,
    services: { nebius: Boolean(runtimeKeys.nebius), tavily: Boolean(runtimeKeys.tavily) },
    shared: [...shared],
    open: [...workWindows.keys()],
    aiEnabled,
    findings: workKinds.flatMap((kind) => shared.has(kind) ? inspect(kind, workState.get(kind) || {}).map((item) => ({ ...item, kind })) : []),
  };
}

function publish() {
  if (agentWindow && !agentWindow.isDestroyed()) agentWindow.webContents.send('agent:snapshot', snapshot());
  for (const [kind, window] of workWindows) {
    if (!window.isDestroyed()) window.webContents.send('work:sharing', shared.has(kind));
  }
}

function createWindow(file, options, query) {
  const window = new BrowserWindow({
    ...options,
    backgroundColor: '#08282e',
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
  if (!workKinds.includes(kind)) return;
  const existing = workWindows.get(kind);
  if (existing && !existing.isDestroyed()) { existing.focus(); return; }
  const titles = { email: 'Email Studio', social: 'Social Publisher', handover: 'Campaign Files' };
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.max(760, Math.min(980, area.width - 540));
  const height = Math.min(850, area.height - 24);
  const window = createWindow('work.html', { x: area.x + 12, y: area.y + 12, width, height, minWidth: 760, minHeight: 620, title: `${titles[kind]} · Aurelia Travel` }, { kind });
  workWindows.set(kind, window);
  window.on('closed', () => { workWindows.delete(kind); workState.delete(kind); shared.delete(kind); publish(); });
  publish();
}

app.whenReady().then(async () => {
  companyWorkspace = workspace.load(app.getPath('userData'));
  const area = screen.getPrimaryDisplay().workArea;
  const agentWidth = Math.min(520, area.width - 40);
  agentWindow = createWindow('agent.html', { x: area.x + area.width - agentWidth - 12, y: area.y + 12, width: agentWidth, height: Math.min(850, area.height - 24), minWidth: 440, minHeight: 660, title: 'Averill' });
  loadSecrets().then(publish).catch(() => {});
  const fromAgent = (event) => {
    if (event.sender !== agentWindow.webContents) throw new Error('Averill window required');
  };
  const persistWorkspace = () => { workspace.save(app.getPath('userData'), companyWorkspace); publish(); return snapshot(); };
  ipcMain.handle('workspace:create', (event, company, adminName) => {
    fromAgent(event);
    companyWorkspace = workspace.create(app.getPath('userData'), company, adminName);
    publish(); return snapshot();
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
    workspace.switchPerson(companyWorkspace, personId);
    shared.clear(); aiEnabled = false; selectedExternalWindow = null;
    return persistWorkspace();
  });
  ipcMain.handle('workspace:import', async (event, options) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    const selection = await dialog.showOpenDialog(agentWindow, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Documents and exported designs', extensions: ['md', 'txt', 'csv', 'json', 'pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg'] }] });
    if (selection.canceled) return snapshot();
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
  ipcMain.handle('workspace:update-source', (event, id, action, priority) => {
    fromAgent(event);
    if (!companyWorkspace) throw new Error('Create a workspace first');
    workspace.updateSource(companyWorkspace, id, action, priority);
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
  ipcMain.handle('workspace:read-file', (event, id) => {
    fromAgent(event);
    const source = workspace.visibleSources(companyWorkspace || { people: [], sources: [] }).find((entry) => entry.id === id);
    if (!source) throw new Error('File is not accessible');
    return { title: source.title, text: source.textPath ? fs.readFileSync(source.textPath, 'utf8').slice(0, 5000) : '' };
  });
  ipcMain.handle('workspace:save-key', async (event, service, value) => {
    fromAgent(event);
    if (!companyWorkspace || workspace.person(companyWorkspace)?.role !== 'admin') throw new Error('Administrator access required');
    await saveSecret(service, value);
    publish(); return snapshot();
  });
  ipcMain.handle('agent:snapshot', () => snapshot());
  ipcMain.handle('agent:open-work', (_, kind) => { openWork(kind); return snapshot(); });
  ipcMain.handle('agent:share', (_, kind, enable) => {
    if (!workKinds.includes(kind) || !workWindows.has(kind)) return snapshot();
    if (enable) shared.add(kind); else shared.delete(kind);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ai-mode', (event, enabled) => {
    fromAgent(event);
    aiEnabled = Boolean(enabled) && Boolean(runtimeKeys.nebius);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ask', (event, question) => {
    fromAgent(event);
    if (companyWorkspace && workspace.approvedSources(companyWorkspace).length) {
      return aiEnabled ? answerWorkspace(companyWorkspace, question, runtimeKeys.nebius) : localWorkspaceAnswer(companyWorkspace, question);
    }
    return aiEnabled ? answerQuestion(question, runtimeKeys.nebius) : { ...localAnswer(String(question || '').slice(0, 1000)), mode: 'local' };
  });
  ipcMain.handle('agent:ask-demo', (event, question) => {
    fromAgent(event);
    return aiEnabled ? answerQuestion(question, runtimeKeys.nebius) : { ...localAnswer(String(question || '').slice(0, 1000)), mode: 'local' };
  });
  ipcMain.handle('agent:web-search', (event, query) => { fromAgent(event); return searchPublicWeb(query, runtimeKeys.tavily); });
  ipcMain.handle('agent:external-windows', async (event) => {
    fromAgent(event);
    const permission = process.platform === 'darwin' ? systemPreferences.getMediaAccessStatus('screen') : 'granted';
    const sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 0, height: 0 } });
    return { permission, windows: sources.filter((source) => source.name && !/Averill|Email Studio|Social Publisher|Campaign Files/.test(source.name)).map((source) => ({ id: source.id, name: source.name })) };
  });
  ipcMain.handle('agent:external-share', (event, id, name) => {
    fromAgent(event);
    selectedExternalWindow = id ? { id: String(id), name: String(name || 'Selected window').slice(0, 150) } : null;
    publish(); return snapshot();
  });
  ipcMain.handle('agent:external-review', async (event) => {
    fromAgent(event);
    if (!selectedExternalWindow) throw new Error('Choose a window first');
    const sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 1600, height: 1000 } });
    const selected = sources.find((source) => source.id === selectedExternalWindow.id);
    if (!selected || selected.thumbnail.isEmpty()) throw new Error('Window capture is unavailable. Check macOS Screen Recording permission or choose the window again.');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-capture-'));
    const imagePath = path.join(directory, 'capture.png');
    try {
      fs.writeFileSync(imagePath, selected.thumbnail.toPNG(), { mode: 0o600 });
      return { window: selectedExternalWindow.name, text: workspace.extractText(imagePath) };
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
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
  ipcMain.handle('agent:source', (_, id) => {
    if (companyWorkspace) {
      const item = workspace.visibleSources(companyWorkspace).find((source) => source.id === id && source.status === 'approved');
      if (item) return { id, title: item.title, kind: 'workspace', content: item.textPath ? fs.readFileSync(item.textPath, 'utf8') : 'No readable text was extracted. Open the file on this computer.' };
    }
    const source = sourceFor(id);
    return source ? { ...source, content: fs.readFileSync(source.path, 'utf8') } : null;
  });
  ipcMain.handle('agent:open-source', async (_, id) => {
    if (companyWorkspace) {
      const item = workspace.visibleSources(companyWorkspace).find((source) => source.id === id && source.status === 'approved');
      if (item) return (await shell.openPath(item.storedPath)) === '';
    }
    const source = sourceFor(id);
    if (!source) return false;
    return (await shell.openPath(source.path)) === '';
  });
  ipcMain.on('work:update', (event, kind, data) => {
    const window = workWindows.get(kind);
    if (!window || event.sender !== window.webContents || !workKinds.includes(kind)) return;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    workState.set(kind, data);
    if (shared.has(kind)) publish();
  });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) app.quit(); });
});

app.on('window-all-closed', () => app.quit());
