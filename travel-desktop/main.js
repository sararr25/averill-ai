const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });
const { inspect, answer: localAnswer } = require('./src/engine');
const { answerQuestion } = require('./src/assistant');
const { sourceFor } = require('./src/campaign');

const workKinds = ['email', 'social', 'handover'];
const workWindows = new Map();
const workState = new Map();
const shared = new Set();
let agentWindow;
let aiEnabled = false;

function snapshot() {
  return {
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
    backgroundColor: '#f7f5f0',
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
  const window = createWindow('work.html', { width: 1000, height: 780, minWidth: 760, minHeight: 620, title: `${titles[kind]} · Aurelia Travel` }, { kind });
  workWindows.set(kind, window);
  window.on('closed', () => { workWindows.delete(kind); workState.delete(kind); shared.delete(kind); publish(); });
  publish();
}

app.whenReady().then(() => {
  agentWindow = createWindow('agent.html', { width: 540, height: 820, minWidth: 440, minHeight: 660, title: 'Averill' });
  ipcMain.handle('agent:snapshot', () => snapshot());
  ipcMain.handle('agent:open-work', (_, kind) => { openWork(kind); return snapshot(); });
  ipcMain.handle('agent:share', (_, kind, enable) => {
    if (!workKinds.includes(kind) || !workWindows.has(kind)) return snapshot();
    if (enable) shared.add(kind); else shared.delete(kind);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ai-mode', (_, enabled) => {
    aiEnabled = Boolean(enabled) && Boolean(process.env.NEBIUS_API_KEY);
    publish();
    return snapshot();
  });
  ipcMain.handle('agent:ask', (_, question) => aiEnabled ? answerQuestion(question) : { ...localAnswer(String(question || '').slice(0, 1000)), mode: 'local' });
  ipcMain.handle('agent:source', (_, id) => {
    const source = sourceFor(id);
    return source ? { ...source, content: fs.readFileSync(source.path, 'utf8') } : null;
  });
  ipcMain.handle('agent:open-source', async (_, id) => {
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
