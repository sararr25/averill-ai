// Isolated, local-only workspace for installed Chrome/manual accessibility acceptance.
// No normal accounts, sources or encrypted credential store are loaded.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const workspace = require('../src/workspace');
const profile = fs.mkdtempSync('/tmp/averill-manual-contextual-');
const file = path.join(profile, 'qa-brand.md');
fs.writeFileSync(file, 'Do not claim "lowest prices guaranteed".');
const data = workspace.create(profile, 'Vamo QA - synthetic only', 'QA Owner');
const source = workspace.importFile(profile, data, file, { department: 'Marketing', version: '2' });
workspace.updateSource(data, source.id, 'approved');
workspace.save(profile, data);
app.setPath('userData', profile);
process.env.NEBIUS_API_KEY = ''; process.env.TAVILY_API_KEY = '';
const localFetch = global.fetch;
global.fetch = (url, options) => { if (new URL(url).hostname !== '127.0.0.1') throw new Error('Manual QA permits loopback requests only.'); return localFetch(url, options); };
require('../main.js');
app.whenReady().then(async () => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const window = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html'));
    if (window && !window.webContents.isLoading() && await window.webContents.executeJavaScript('Boolean(window.desktop)')) {
      await window.webContents.executeJavaScript("window.desktop.enableAccounts('owner@synthetic.example', 'Synthetic-password-123')");
      window.setTitle('Averill - isolated synthetic QA');
      window.show();
      console.log('Isolated QA ready; close this app to discard the temporary workspace.');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('QA window did not become ready');
});
app.on('will-quit', () => fs.rmSync(profile, { recursive: true, force: true }));
