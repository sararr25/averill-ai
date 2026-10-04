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
    await run("(async()=>{current=await window.desktop.snapshot();render();showTab('work');el('external-task-review').click();})()");
    for(let i=0;i<100;i++){if(await run("Boolean(externalReview)&&!reviewPending"))break;await pause(50);}
    assert.equal(await run('document.body.dataset.area'),'review');
    assert.ok(await run("el('review-work-result').textContent.includes('lowest prices guaranteed')"));
    assert.ok(await run("el('review-work-result').textContent.includes('Source v2')"));
    assert.equal(await run("document.activeElement.id"),'hero-title');
    for(const [width,height] of [[440,660],[520,850],[960,820]]){
      agent.setSize(width,height);await pause(100);
      for(const area of ['review','work','learn','knowledge','setup','research']){
        await run(`showTab('${area}')`);await pause(250);
        assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,`Overflow ${area} ${width}`);
        assert.equal(await run('document.querySelector(".agent-main").getBoundingClientRect().bottom<=innerHeight+1'),true);
      }
    }
    agent.setSize(520,850);await run("showTab('review')");await pause(350);
    fs.writeFileSync('/tmp/averill-guided-review.png',(await agent.webContents.capturePage()).toPNG());
    await run("showTab('work')");await pause(350);fs.writeFileSync('/tmp/averill-guided-work.png',(await agent.webContents.capturePage()).toPNG());
    await run("el('external-task').value='linkedin';el('external-task').dispatchEvent(new Event('change'))");
    assert.equal(await run("el('review-work-result').textContent"),'');
    await run("el('external-task').value='email';el('external-task').dispatchEvent(new Event('change'))");

    await external.webContents.executeJavaScript("document.getElementById('draft').textContent='Discover curated winter city breaks. You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.'");
    external.show();external.focus();await pause(600);
    await run("showTab('work');el('external-local-recheck').click()");
    for(let i=0;i<100;i++){if(await run("Boolean(externalReview)&&!reviewPending"))break;await pause(50);}
    assert.equal(await run('document.body.dataset.area'),'review');
    const corrected=await run('externalReview?.result');
    assert.ok(corrected,'Fresh capture must present a current result');
    const secondCapture = await run('window.desktop.snapshot()').then(s => s.externalObservation);
    assert.equal(corrected.findings.length, 0, `Remaining: ${corrected.findings.map(item => item.type).join(', ')}; visible: ${secondCapture.text}`);
    await run('renderTaskReview('+JSON.stringify(corrected)+')');
    assert.ok(await run("el('review-work-result').textContent.includes('Local rule check')"));
    await run(`window.desktop.updateSource(${JSON.stringify(policy.id)},'superseded',0,'Test revocation')`);
    assert.equal(await run("el('review-work-result').textContent"),'');
    const revoked = await run("window.desktop.reviewExternalTask('email',false)");
    assert.match(revoked.status, /No approved/);
    await run('window.desktop.shareExternal(null,null)');
    await assert.rejects(() => run("window.desktop.reviewExternalTask('email',false)"), /Read the selected window/);
    console.log('PASS external email rule citation, employee correction, fresh recheck, source revocation and Stop; guided Review result, task invalidation, focus and six-area responsive layout');
    if(process.env.AVERILL_UI_INSPECT){external.close();agent.show();await run("showTab('review')");console.log('READY for native UI inspection');return;}
    app.quit();
  } catch (error) { console.error(error.stack); app.exit(1); }
});
