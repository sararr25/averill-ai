const {app,BrowserWindow,dialog}=require('electron');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.env.AVERILL_NATIVE_APP||path.resolve(__dirname,'..');const profile=fs.mkdtempSync('/tmp/averill-feedback-');app.setPath('userData',profile);const fixture=path.join(profile,'company-guide.txt');fs.writeFileSync(fixture,'Company knowledge: cobalt palette and weekly planning.');let cancel=false;dialog.showOpenDialog=async()=>({canceled:cancel,filePaths:cancel?[]:[fixture]});if(process.env.QA_PORT_CONFLICT==='1'){require(path.join(root,'src/browser-connect')).BrowserConnect.prototype.start=async function(){throw Object.assign(new Error('Synthetic occupied port'),{code:'EADDRINUSE'})}}require(path.join(root,'main.js'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{try{
 let win;for(let i=0;i<100;i++){win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const rendererErrors=[];win.webContents.on('console-message',(_event,level,message)=>{if(level===3)rendererErrors.push(message)});
 const run=js=>win.webContents.executeJavaScript(js);
 await run("window.desktop.createWorkspace('Feedback Test','Owner','owner@example.test','Synthetic-password-123')");
 if(process.env.QA_PORT_CONFLICT==='1'){assert.equal(await run("document.getElementById('browser-guided-status').hidden"),false);assert.match(await run("document.getElementById('browser-guided-status').textContent"),/Close other Averill instances/);}
 const companion=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('companion.html'));
 assert.ok(companion && companion.isVisible());
 await companion.webContents.executeJavaScript("document.getElementById('open').click()");
 await pause(100);assert.equal(await run("document.body.dataset.area"),'review');assert.ok(await run("document.activeElement.closest('#working-now')!==null"),'Open Averill lands on the Working on now card');
 assert.ok(await run("document.querySelector('#context-form') && document.querySelector('.demo-fixtures').open === false"));
 assert.equal(await run("document.documentElement.scrollWidth <= innerWidth"),true);
 await run("(async()=>{current=await window.desktop.snapshot();render();showTab('setup');window.testEvents=[];window.desktop.onOperation(e=>window.testEvents.push(e));document.querySelector('.onboarding-section button').click();})()");
 for(let i=0;i<100;i++){if(await run("window.testEvents.some(e=>e.channel==='onboarding:upload'&&e.state==='success')"))break;await pause(100);}
 assert.ok(await run("window.testEvents.some(e=>e.channel==='onboarding:upload'&&e.state==='pending')"));assert.ok(await run("document.querySelector('#operation-message').textContent.includes('Files received: 1')"));assert.equal(await run("document.querySelector('#operation-feedback').hidden"),false);
 await run("document.querySelector('#operation-knowledge').click()");await pause(100);assert.equal(await run("document.querySelectorAll('.knowledge-card').length"),1);assert.ok(await run("document.querySelector('#knowledge-list').textContent.includes('cobalt')"));
 await run("window.testSourceTrigger=document.querySelector('.knowledge-card button');testSourceTrigger.click()");await pause(100);assert.equal(await run("document.querySelector('#source-dialog').open"),true);assert.ok(await run("document.querySelector('#source-content').textContent.includes('cobalt')"));await run("window.replacementRead=testSourceTrigger.cloneNode(true);testSourceTrigger.replaceWith(replacementRead);document.querySelector('#source-dialog').close()");let restored=false;for(let i=0;i<20&&!restored;i++){await pause(50);restored=await run("document.activeElement?.dataset.focusKey===window.testSourceTrigger.dataset.focusKey");}assert.equal(restored,true,'Closing uploaded source must restore focus to its read button');await run("knowledgeRenderKey=null;renderKnowledge()");await pause(300);assert.equal(await run("document.activeElement?.dataset.focusKey===window.testSourceTrigger.dataset.focusKey&&!document.activeElement.isSameNode(window.replacementRead)"),true,'A library refresh must keep focus on the same read button');
 await assert.rejects(run("window.desktop.linkOnboarding(['https://127.0.0.1/no.txt'])"),/Private, local/);assert.equal(await run("document.querySelector('#operation-feedback').dataset.state"),'error');assert.ok(await run("document.querySelector('#operation-message').textContent.includes('Private, local')"));
 cancel=true;await run('window.desktop.uploadOnboarding()');assert.ok(await run("document.querySelector('#operation-message').textContent.includes('Selection cancelled')"));
 await run("(async()=>{current=await window.desktop.snapshot();render();const draft=current.onboarding;const applied=await window.desktop.applyOnboarding({batchId:draft.id,people:[],documents:draft.files.map(f=>({id:f.id,included:true,scope:'company',department:'Marketing',version:'1',approve:true}))});current=applied.snapshot;render();showTab('knowledge')})()");await pause(150);
 assert.equal(await run("document.querySelectorAll('.knowledge-card').length"),1);assert.ok(await run("document.querySelector('#knowledge-list').textContent.includes('Approved company-wide knowledge')"));assert.ok(await run("!document.querySelector('#knowledge-summary').textContent.includes('Loading')"));
 await run("window.testSavedTrigger=document.querySelector('.knowledge-card button');testSavedTrigger.click()");await pause(100);assert.equal(await run("document.querySelector('#source-dialog').open"),true);win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(80);assert.equal(await run("!document.querySelector('#source-dialog').open && document.activeElement?.dataset.focusKey===window.testSavedTrigger.dataset.focusKey"),true,'Escape must close the saved source and restore its trigger focus');

 await run("document.querySelector('#knowledge-search').value='missing term';document.querySelector('#knowledge-search').dispatchEvent(new Event('input'))");await pause(250);assert.equal(await run("document.querySelectorAll('.knowledge-card').length"),0);
 await run("document.querySelector('#knowledge-search').value='cobalt';document.querySelector('#knowledge-search').dispatchEvent(new Event('input'))");await pause(250);assert.equal(await run("document.querySelectorAll('.knowledge-card').length"),1);
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);assert.equal(await run('document.querySelector(".agent-main").getBoundingClientRect().bottom<=innerHeight+1'),true);
 await run("(async()=>{current=await window.desktop.learningAction('start',{});render();showTab('learn')})()");await pause(100);
 assert.ok(await run("[...document.querySelectorAll('#learning-panel button')].some(b=>b.textContent.includes('continue')&&b.classList.contains('agent-primary'))"));
 await run("[...document.querySelectorAll('#learning-panel button')].find(b=>b.textContent.includes('continue')).click()");await pause(150);assert.ok(await run("document.activeElement.tagName==='H4'"));
 assert.equal(await run("document.querySelectorAll('#learning-panel > [data-current-learning]').length"),1,'Learn must have one leading activity');
 assert.ok(await run("document.querySelector('#learning-panel > [data-current-learning] h4')"),'Active lesson step leads');
 cancel=false;fs.writeFileSync(fixture,'Updated company knowledge: cobalt palette and clearer source review.');
 await run("(async()=>{current=await window.desktop.importSources({department:'Marketing',version:'2'});render();showTab('knowledge')})()");await pause(200);
 assert.equal(await run("document.querySelectorAll('#knowledge-list .knowledge-approval').length"),0,'Reader cards cannot contain decision forms');
 assert.equal(await run("document.querySelectorAll('#knowledge-decisions .knowledge-approval').length"),1,'Reviewer sees pending decision in separate queue');
 assert.ok(await run("!document.getElementById('knowledge-review-queue').hidden"));
 await run("document.getElementById('knowledge-review-queue').open=true;document.querySelector('#knowledge-decisions button').click()");await pause(100);
 assert.ok(await run("document.getElementById('source-dialog').open"));await run("document.getElementById('source-dialog').close()");await pause(80);
 assert.ok(await run("document.activeElement===document.querySelector('#knowledge-decisions button')"),'Proposal reader restores focus to queue trigger');
 await run("document.querySelector('#knowledge-decisions .knowledge-approval input').value='Approved after reviewing synthetic evidence';document.querySelector('#knowledge-decisions .knowledge-approval button').click()");await pause(200);
 assert.ok(await run("document.getElementById('knowledge-review-queue').hidden"),'Approval removes completed decision from queue');
 win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await pause(50);
 assert.ok(await run("guidedMotion.reduced.matches"));await run("showTab('work')");assert.equal(await run("document.getAnimations().length"),0);
 win.webContents.debugger.detach();
 fs.writeFileSync('/tmp/averill-feedback-knowledge.png',(await win.webContents.capturePage()).toPNG());await run('window.desktop.logout()');assert.equal(await run("document.querySelectorAll('.knowledge-card').length"),0);
 assert.deepEqual(rendererErrors,[],'Renderer must complete without console errors');
 console.log('PASS native pending/success/error/cancel feedback, uploaded/full-text/approved knowledge, text search, separate approval queue/focus, one leading Learn activity, viewport and logout cleanup');app.quit();
 }catch(error){console.error(error.stack);app.exit(1);}});
