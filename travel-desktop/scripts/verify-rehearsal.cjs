// Isolated native regression rehearsal. Synthetic extension client; not installed-Chrome proof.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const desktop = path.resolve(__dirname, '..');
if (!process.versions.electron) {
  const {spawnSync} = require('node:child_process');
  require('dotenv').config({path:path.resolve(desktop, '../.env.local'),quiet:true});
  const live = process.argv.includes('--synthetic-consent');
  if (live && !process.env.NEBIUS_API_KEY) throw new Error('Configure a local key for the explicit synthetic live rehearsal.');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-rehearsal-'));
  try {
    for (const phase of ['work', 'restart']) {
      const child = spawnSync(require('electron'), [__filename], {env:{...process.env, AVERILL_REHEARSAL_PROFILE:profile, AVERILL_REHEARSAL_PHASE:phase, AVERILL_REHEARSAL_LIVE:live?'1':'0'},stdio:'inherit'});
      if (child.status !== 0) { process.exitCode=child.status || 1; break; }
    }
  } finally { fs.rmSync(profile,{recursive:true,force:true}); }
} else {
  const {app,BrowserWindow} = require('electron');
  const profile = process.env.AVERILL_REHEARSAL_PROFILE;
  assert.ok(profile && path.dirname(profile) === os.tmpdir() && path.basename(profile).startsWith('averill-rehearsal-'));
  const root = process.env.AVERILL_NATIVE_APP || desktop;
  const workspace = require(path.join(root,'src/workspace'));
  const accounts = require(path.join(root,'src/accounts'));
  const live = process.env.AVERILL_REHEARSAL_LIVE === '1';
  const pass = 'Synthetic-rehearsal-123';
  const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
  const out = path.join(desktop,'dist/rehearsal'); fs.mkdirSync(out,{recursive:true});
  app.setPath('userData',profile);
  let heartbeat, calls = 0;
  const originalFetch = global.fetch;
  global.fetch = async (url,options) => {
    if (String(url).includes('/chat/completions')) {
      assert.ok(live,'No provider request without explicit synthetic consent');
      const payload = JSON.parse(options.body);
      assert.ok(payload.messages[1].content.includes('Our lowest prices guaranteed.'));
      assert.ok(payload.messages[1].content.includes('Synthetic public rehearsal policy'));
      calls++;
    }
    return originalFetch(url,options);
  };
  (async()=>{
    if (process.env.AVERILL_REHEARSAL_PHASE === 'work') {
      const data = workspace.create(profile,'Vamo synthetic rehearsal','Synthetic Owner');
      const owner = workspace.person(data);
      await accounts.configure(data,owner.id,'owner@vamo.example',pass,'owner');
      const employee = workspace.addPerson(data,'Synthetic Employee','employee','Marketing');
      await accounts.configure(data,employee.id,'employee@vamo.example',pass,'employee');
      const policy = path.join(profile,'synthetic-marketing-policy.md');
      fs.writeFileSync(policy,'Synthetic public rehearsal policy. Do not claim "lowest prices guaranteed". Use "Discover curated winter city breaks" instead.');
      const source = workspace.importFile(profile,data,policy,{department:'Marketing',version:'2'});
      workspace.updateSource(data,source.id,'approved'); source.aiAllowed=true; source.confidentiality='public';
      workspace.save(profile,data);
    }
    require(path.join(root,'main.js'));
    await app.whenReady();
    let win;
    for(let i=0;i<100;i++) {
      win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));
      if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)')) break;
      await pause(100);
    }
    const run = js=>win.webContents.executeJavaScript(js);
    const snap = ()=>run('window.desktop.snapshot()');
    const login = email=>run(`window.desktop.login(${JSON.stringify(email)},${JSON.stringify(pass)})`);
    assert.equal((await snap()).auth.signedIn,false,'Restart requires separate login');
    await login('owner@vamo.example');
    const source=(await snap()).workspace.sources.find(s=>s.title.includes('synthetic-marketing-policy'));
    assert.ok(source && source.status==='approved','Approval survives restart');
    if(process.env.AVERILL_REHEARSAL_PHASE==='restart') {
      assert.equal((await snap()).aiEnabled,false);
      assert.equal((await snap()).externalObservation,null);
      assert.equal((await snap()).learning.sessions.length,1,'Own confirmed lesson persists');
      await run('window.desktop.logout()'); await login('employee@vamo.example');
      assert.equal((await snap()).learning.sessions.length,0,'Other person does not see owner lesson');
      const receiptPath=path.join(out,'verification.json');
      const receipt=JSON.parse(fs.readFileSync(receiptPath));
      receipt.checks.push('restart requires login','approval persistence','AI disabled after restart','learning persistence after restart');
      receipt.restartVerified=true;
      fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
      console.log('PASS packaged-resource restart, approvals, sign-in, AI reset and person-owned learning');
      app.quit(); return;
    }
    await run('window.desktop.companyPrivacy(true)');
    await run("document.querySelector('[data-tab-button=work]').click();window.confirmMessages=[];window.confirm=message=>{confirmMessages.push(message);return false;};document.getElementById('ai-toggle').click();");
    await pause(120);
    assert.equal((await snap()).aiEnabled,false);
    assert.equal(calls,0);
    if(live) {
      await run("window.confirm=message=>{confirmMessages.push(message);return true;};document.getElementById('ai-toggle').click();");
      await pause(180); assert.equal((await snap()).aiEnabled,true);
    }
    const pair=await run('window.desktop.pairBrowser()'); let sequence=0;
    const send=async extra=>{
      const response=await originalFetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'d'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:17,pageOrigin:'https://example.test',sequence:++sequence,...extra})});
      assert.equal(response.status,200);
    };
    await send({kind:'field',reason:'pause',field:{kind:'textarea',label:'Email body',value:'Our lowest prices guaranteed.'}});
    heartbeat=setInterval(()=>send({kind:'heartbeat'}).catch(()=>{}),4000);
    const before=await run("window.desktop.recheckExternalTask('email')");
    assert.ok(before.findings.some(f=>f.type==='forbidden-claim'));
    await run("window.confirm=message=>{confirmMessages.push(message);return false;};document.getElementById('external-task-review').click();");
    await pause(180);
    assert.equal(calls,0);
    if(live) {
      assert.match(await run('confirmMessages.at(-1)'),/observed text.*Nebius/);
      await run("window.confirm=message=>{confirmMessages.push(message);return true;};document.getElementById('external-task-review').click();");
      for(let i=0;i<450;i++) {
        if(await run("document.getElementById('external-task-result').textContent.includes('Nebius review completed.')")) break;
        await pause(100);
      }
      assert.equal(calls,1,'Only the explicitly accepted review sends a request');
      assert.ok(await run("document.getElementById('external-task-result').textContent.includes('AI suggestion')"),'Exact citation validated model finding displayed');
      assert.ok(await run("document.getElementById('external-task-result').textContent.includes('nemotron')"));
      await run("document.getElementById('external-task-result').scrollIntoView({block:'center'})");
      await pause(100);
      fs.writeFileSync(path.join(out,'live-consented-review.png'),(await win.webContents.capturePage()).toPNG());
    }
    await send({kind:'editing'}); await pause(80);
    assert.equal((await snap()).externalObservation,null);
    await send({kind:'field',reason:'blur',field:{kind:'textarea',label:'Email body',value:'Discover curated winter city breaks'}});
    assert.equal((await run("window.desktop.recheckExternalTask('email')")).findings.length,0);
    await run(`window.desktop.updateSource(${JSON.stringify(source.id)},'superseded',0,'Synthetic rehearsal revocation')`);
    assert.match((await run("window.desktop.reviewExternalTask('email',false)")).status,/No approved/);
    await run(`window.desktop.updateSource(${JSON.stringify(source.id)},'approved',0,'Restore synthetic rehearsal authority')`);
    const learned=await run("window.desktop.learningAction('start',{})");
    const lesson=learned.learning.sessions[0];
    await run(`window.desktop.learningAction('confirm',{sessionId:${JSON.stringify(lesson.id)},stepId:'select'})`);
    const quiz=await run("window.desktop.learningAction('quiz',{})");
    assert.ok(quiz.learning.quiz.questions.length);
    const companion=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('companion.html'));
    await companion.webContents.executeJavaScript("document.getElementById('stop').click()"); await pause(120);
    clearInterval(heartbeat); heartbeat=null;
    assert.equal((await snap()).externalObservation,null);
    assert.equal((await snap()).browserBridge.ready,false);
    await run('window.desktop.logout()'); await login('employee@vamo.example');
    assert.equal((await snap()).learning.sessions.length,0);
    await assert.rejects(()=>run(`window.desktop.learningAction('confirm',{sessionId:${JSON.stringify(lesson.id)},stepId:'position'})`),/unavailable/);
    const receipt={verifiedAt:new Date().toISOString(),packagedResources:root!==desktop,liveSyntheticReview:live,providerRequests:calls,checks:['consent declined','local correction','source revocation','typing invalidation','floating Stop','learning confirmation','weekly practice','person isolation'],boundary:'synthetic bridge client and regression consent-dialog decisions; no installed Chrome or real email platform proof'};
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(receipt,null,2)+'\n');
    console.log('PASS consent cancellation, local correction, revocation, Stop, weekly practice and person isolation'+(live?'; one live consented Nemotron review':''));
    app.quit();
  })().catch(error=>{if(heartbeat)clearInterval(heartbeat);console.error(error.message);app.exit(1);});
}
