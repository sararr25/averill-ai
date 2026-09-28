const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const profile = fs.mkdtempSync('/tmp/averill-native-window-');
const targetTitle = process.env.AVERILL_TEST_WINDOW || 'Untitled';
const initialMarker = process.env.AVERILL_INITIAL_MARKER || 'Averill native test: discover curated winter city breaks';
const updatedMarker = process.env.AVERILL_UPDATED_MARKER || 'Averill native test updated';
app.setPath('userData', profile);
require(path.resolve(__dirname, '..', 'main.js'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  try {
    let agent;
    for (let attempt = 0; attempt < 100; attempt++) {
      agent = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('agent.html'));
      if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break;
      await pause(100);
    }
    const run = script => agent.webContents.executeJavaScript(script);
    await run("window.desktop.createWorkspace('Native Test','Owner','owner@example.test','Synthetic-password-123')");
    const listing = await run('window.desktop.externalWindows()');
    const chosen = listing.windows.find(item => item.name.includes(targetTitle));
    assert.ok(chosen, `The synthetic ${targetTitle} window is listed (matching browser windows: ${listing.windows.filter(item => /Averill browser test|Google Chrome/.test(item.name)).map(item => item.name).join(', ') || 'none'})`);
    await run(`window.desktop.shareExternal(${JSON.stringify(chosen.id)},${JSON.stringify(chosen.name)})`);
    const first = await run('window.desktop.reviewExternal()');
    assert.ok(first.text.includes(initialMarker), `Capture should include initial marker via ${first.method}`);
    await run('window.desktop.watchExternal(true)');
    console.log(`READY ${chosen.name} capture via ${first.method}; edit the synthetic marker now`);
    let updated;
    for (let attempt = 0; attempt < 90; attempt++) {
      updated = await run('window.desktop.snapshot()');
      if (updated.externalObservation?.text.includes(updatedMarker)) break;
      await pause(500);
    }
    assert.ok((updated.externalObservation?.text || '').includes(updatedMarker), 'observed text should include updated marker');
    await run('window.desktop.shareExternal(null,null)');
    const stopped = await run('window.desktop.snapshot()');
    assert.equal(stopped.externalObservation, null);
    assert.equal(stopped.externalWatching, false);
    console.log(`PASS real ${chosen.name} selection, ${first.method} capture, changed-text observation and Stop`);
    app.quit();
  } catch (error) { console.error(error.stack); app.exit(1); }
});
