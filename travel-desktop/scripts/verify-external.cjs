const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.AVERILL_NATIVE_APP || path.resolve(__dirname, '..');
const profile = fs.mkdtempSync('/tmp/averill-external-');
app.setPath('userData', profile);
require(path.join(root, 'main.js'));

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  let external;
  try {
    let agent;
    for (let attempt = 0; attempt < 100; attempt++) {
      agent = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('agent.html'));
      if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break;
      await pause(100);
    }
    assert.ok(agent, 'Averill window opened');
    const run = script => agent.webContents.executeJavaScript(script);
    await run("window.desktop.createWorkspace('External Test','Owner','owner@example.test','Synthetic-password-123')");
    external = new BrowserWindow({ width: 780, height: 560, title: 'Synthetic external editor', backgroundColor: '#fff', webPreferences: { nodeIntegration: false, contextIsolation: true } });
    await external.loadURL('data:text/html,' + encodeURIComponent('<!doctype html><html><body style="font:32px sans-serif;background:white;color:black;padding:32px"><h1>Synthetic external editor</h1><div id="draft" contenteditable="true">Draft marker: winter city breaks</div></body></html>'));
    external.show();
    let listed;
    for (let attempt = 0; attempt < 30; attempt++) {
      listed = await run('window.desktop.externalWindows()');
      if (listed.windows.some(window => window.name === 'Synthetic external editor')) break;
      await pause(100);
    }
    const chosen = listed.windows.find(window => window.name === 'Synthetic external editor');
    assert.ok(chosen, 'external app window appears in selector');
    await run(`window.desktop.shareExternal(${JSON.stringify(chosen.id)},${JSON.stringify(chosen.name)})`);
    const first = await run('window.desktop.reviewExternal()');
    assert.match(first.text, /winter city breaks/i, `capture method: ${first.method}`);
    assert.ok(['accessibility', 'ocr'].includes(first.method));
    await run('window.desktop.watchExternal(true)');
    await external.webContents.executeJavaScript("document.getElementById('draft').textContent='Draft marker: Prague collection updated'");
    let observed;
    for (let attempt = 0; attempt < 25; attempt++) {
      observed = await run('window.desktop.snapshot()');
      if (observed.externalObservation?.text.includes('Prague collection updated')) break;
      await pause(500);
    }
    assert.match(observed.externalObservation?.text || '', /Prague collection updated/i, 'observation updates after an external edit');
    const companion = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('companion.html'));
    assert.ok(companion && companion.isVisible());
    await companion.webContents.executeJavaScript("document.getElementById('stop').click()");
    await pause(150);
    const stopped = await run('window.desktop.snapshot()');
    assert.equal(stopped.externalWindow, null);
    assert.equal(stopped.externalWatching, false);
    assert.equal(stopped.externalObservation, null);
    await run('window.desktop.logout()');
    const locked = await run('window.desktop.snapshot()');
    assert.equal(locked.externalObservation, null);
    assert.equal(companion.isVisible(), false);
    console.log(`PASS external selection, ${first.method} text extraction, changed-text observation, floating Stop and logout isolation`);
    app.quit();
  } catch (error) {
    console.error(error.stack);
    if (external && !external.isDestroyed()) external.close();
    app.exit(1);
  }
});
