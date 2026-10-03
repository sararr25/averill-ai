const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const workspace = require('../src/workspace');

const profile = fs.mkdtempSync('/tmp/averill-task-review-ui-');
const ruleFile = path.join(profile, 'marketing-policy.md');
fs.writeFileSync(ruleFile, 'Do not claim "lowest prices guaranteed".\nEvery marketing email must include this footer: "You are receiving this email because you subscribed to Vamo. Unsubscribe anytime."');
const company = workspace.create(profile, 'Vamo', 'Demo Owner');
const policy = workspace.importFile(profile, company, ruleFile, { department: 'Marketing', version: '2' });
workspace.updateSource(company, policy.id, 'approved');
workspace.save(profile, company);
app.setPath('userData', profile);
require('../main.js');
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
    const external = new BrowserWindow({ width: 840, height: 580, title: 'Synthetic email editor', backgroundColor: '#fff' });
    await external.loadURL('data:text/html,' + encodeURIComponent('<!doctype html><html><body style="font:28px sans-serif;background:white;padding:28px"><h1>Synthetic email editor</h1><div id="draft" contenteditable="true">Our lowest prices guaranteed.</div></body></html>'));
    external.show();
    let chosen;
    for (let attempt = 0; attempt < 30; attempt++) {
      chosen = (await run('window.desktop.externalWindows()')).windows.find(item => item.name === 'Synthetic email editor');
      if (chosen) break;
      await pause(100);
    }
    assert.ok(chosen);
    await run(`window.desktop.shareExternal(${JSON.stringify(chosen.id)},${JSON.stringify(chosen.name)})`);
    await run('window.desktop.reviewExternal()');
    const before = await run("window.desktop.reviewExternalTask('email',false)");
    assert.ok(before.findings.some(item => item.type === 'forbidden-claim' && item.source.id === policy.id));
    assert.ok(before.findings.some(item => item.type === 'missing-required-text'));
    await external.webContents.executeJavaScript("document.getElementById('draft').textContent='Discover curated winter city breaks. You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.'");
    await pause(400);
    const corrected = await run("window.desktop.recheckExternalTask('email')");
    const secondCapture = await run('window.desktop.snapshot()').then(s => s.externalObservation);
    assert.equal(corrected.findings.length, 0, `Remaining: ${corrected.findings.map(item => item.type).join(', ')}; visible: ${secondCapture.text}`);
    await run(`window.desktop.updateSource(${JSON.stringify(policy.id)},'superseded',0,'Test revocation')`);
    const revoked = await run("window.desktop.reviewExternalTask('email',false)");
    assert.match(revoked.status, /No approved/);
    await run('window.desktop.shareExternal(null,null)');
    await assert.rejects(() => run("window.desktop.reviewExternalTask('email',false)"), /Read the selected window/);
    console.log('PASS external email rule citation, employee correction, fresh recheck, source revocation and Stop');
    app.quit();
  } catch (error) { console.error(error.stack); app.exit(1); }
});
