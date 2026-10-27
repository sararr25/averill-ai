const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
// A hidden page pauses sharing; keep macOS occlusion of this test window from pausing it unexpectedly.
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
const profile=fs.mkdtempSync('/tmp/averill-browser-ui-');app.setPath('userData',profile);require('../main.js');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const SHOTS=process.env.SHOTS||'';if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const shot=async(win,name)=>{if(!SHOTS)return;await win.webContents.executeJavaScript("[...document.querySelectorAll('button')].find(b=>b.textContent==='Skip'&&b.offsetParent)?.click();document.getElementById('operation-dismiss')?.click();document.getElementById('browser-checklist').scrollIntoView({block:'center'});void 0");await pause(150);if(SHOTS)fs.writeFileSync(path.join(SHOTS,name),(await win.webContents.capturePage()).toPNG());};
app.whenReady().then(async()=>{try{
 let agent;
 for(let i=0;i<100;i++){agent=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(agent&&!agent.webContents.isLoading()&&await agent.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=s=>agent.webContents.executeJavaScript(s);
 await run("window.desktop.createWorkspace('Vamo Browser Test','Owner','owner@example.test','Synthetic-password-123')");
 const pair=await run('window.desktop.pairBrowser()');
 const send=async payload=>{const response=await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:9,pageOrigin:'https://example.test',...payload})});assert.equal(response.status,200);await pause(80);};
 await send({kind:'field',sequence:1,reason:'pause',field:{kind:'textarea',label:'Email body',value:'Visible draft marker'}});
 const first=await run('window.desktop.snapshot()');assert.equal(first.externalObservation.method,'browser-dom');assert.equal(first.externalObservation.field.label,'Email body');assert.equal(first.externalObservation.personId,first.workspace.activePersonId);
 assert.ok(!JSON.stringify(first).includes(pair.token));
 assert.ok(await run("document.getElementById('external-result').textContent.includes('Only this field')"));
 // FB-05 desktop checklist ticks live from the bridge state.
 await run("document.querySelector('[data-tab=review]')&&window.showTab?.('review')");
 const steps=await run("['extension','tab','field'].map(id=>[document.getElementById('browser-step-'+id).classList.contains('done'),document.getElementById('browser-step-'+id).textContent])");
 assert.equal(steps[1][0],true);assert.match(steps[1][1],/Tab connected \(example\.test\)/);assert.equal(steps[2][0],true);assert.match(steps[2][1],/Email body/);
 assert.equal(await run("document.getElementById('browser-end').hidden"),true);
 await send({kind:'heartbeat',paused:true,sequence:4});assert.equal((await run('window.desktop.snapshot()')).browserBridge.paused,true);assert.match(await run("document.getElementById('browser-step-tab').textContent"),/Paused while the tab is in the background/);
 await send({kind:'heartbeat',sequence:5});assert.equal((await run('window.desktop.snapshot()')).browserBridge.paused,false);
 await shot(agent,'desktop-checklist-connected.png');
 await send({kind:'editing',sequence:6});assert.equal((await run('window.desktop.snapshot()')).externalObservation,null);assert.ok(await run("document.getElementById('external-task-review').disabled"));
 await send({kind:'field',sequence:7,reason:'blur',field:{kind:'textarea',label:'Email body',value:'Corrected marker'}});
 const companion=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('companion.html'));await companion.webContents.executeJavaScript("document.getElementById('stop').click()");await pause(80);
 const stopped=await run('window.desktop.snapshot()');assert.equal(stopped.externalObservation,null);assert.equal(stopped.externalWindow,null);assert.equal(stopped.browserBridge.ready,false);
 assert.equal(stopped.browserBridge.lastEnd.reason,'stopped_by_user');assert.equal(await run("document.getElementById('browser-end').textContent"),'Last connection ended. Sharing stopped. You chose Stop sharing or connected another tab.');
 assert.equal(await run("document.getElementById('browser-step-tab').classList.contains('done')"),false);
 const ended=await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:9,pageOrigin:'https://example.test',kind:'heartbeat',sequence:8})});assert.equal(ended.status,410);assert.deepEqual(await ended.json(),{ended:'stopped_by_user'});
 await shot(agent,'desktop-checklist-ended.png');
 await run('window.desktop.pairBrowser()');await run('window.desktop.logout()');assert.equal((await run('window.desktop.snapshot()')).browserBridge.ready,false);
 // Exercise the actual content-script code in an isolated DOM; this is not a live Chrome extension install.
 const page=new BrowserWindow({width:700,height:500,show:false,webPreferences:{contextIsolation:true}});
 await page.loadURL('data:text/html,'+encodeURIComponent('<label>Body<textarea id="body">Draft</textarea></label><label>Password<input type="password" id="password"></label>'));
 await page.webContents.executeJavaScript("window.messages=[];window.reply={};window.testShadow=null;const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){return window.testShadow=attach.call(this,o)};window.chrome={runtime:{sendMessage:async item=>{window.messages.push(item);return window.reply;},onMessage:{addListener:()=>{}}}};void 0;");
 for(const file of ['end-reasons.js','field-select.js','content.js'])await page.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname,'../browser-extension',file),'utf8'));
 const box=await page.webContents.executeJavaScript("(()=>{const r=document.getElementById('body').getBoundingClientRect();return {x:Math.round(r.x+10),y:Math.round(r.y+10)}})()");
 page.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...box});page.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...box});await pause(80);
 assert.ok(await page.webContents.executeJavaScript("messages.some(x=>x.kind==='field'&&x.reason==='selection')"));
 await page.webContents.executeJavaScript("document.getElementById('body').value='Edited draft';document.getElementById('body').dispatchEvent(new Event('input',{bubbles:true}));");
 assert.equal(await page.webContents.executeJavaScript("messages.at(-1).kind"),'editing');let paused=false;for(let i=0;i<30&&!paused;i++){await pause(100);paused=await page.webContents.executeJavaScript("messages.some(x=>x.kind==='field'&&x.reason==='pause'&&x.field.value==='Edited draft')");}assert.ok(paused,'Edit pause must send the edited field');
 await page.webContents.executeJavaScript("document.getElementById('password').value='Sensitive-synthetic-only';document.getElementById('password').style.display='block'");
 const secretBox=await page.webContents.executeJavaScript("(()=>{const r=document.getElementById('password').getBoundingClientRect();return {x:Math.round(r.x+10),y:Math.round(r.y+10)}})()");
 page.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...secretBox});page.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...secretBox});await pause(80);
 assert.equal(await page.webContents.executeJavaScript("messages.at(-1).kind"),'editing');assert.equal(await page.webContents.executeJavaScript("messages.some(m=>JSON.stringify(m).includes('Sensitive-synthetic-only'))"),false);
 // Hidden tab pauses (no Stop), visible resumes; an end reason from the worker shows the ended card.
 await page.webContents.executeJavaScript("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))");await pause(50);
 assert.deepEqual(await page.webContents.executeJavaScript("messages.at(-1)"),{kind:'heartbeat',paused:true});
 await page.webContents.executeJavaScript("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'))");await pause(50);
 assert.ok(await page.webContents.executeJavaScript("messages.some(m=>m.kind==='heartbeat'&&!m.paused)"));assert.equal(await page.webContents.executeJavaScript("messages.some(m=>m.kind==='stop')"),false,'Hiding never stops sharing');
 await page.webContents.executeJavaScript("window.dispatchEvent(new PageTransitionEvent('pagehide'))");assert.equal(await page.webContents.executeJavaScript("messages.some(m=>m.kind==='stop')"),false,'Reload/navigation is handled by the worker, not a page Stop');
 await page.webContents.executeJavaScript("window.reply={stopped:true,reason:'signed_out'}");let endedCard=false;for(let i=0;i<60&&!endedCard;i++){await pause(100);endedCard=await page.webContents.executeJavaScript("Boolean(testShadow?.textContent.includes('You signed out of Averill, so sharing ended.'))");}
 assert.ok(endedCard,'The card explains why sharing ended');assert.match(await page.webContents.executeJavaScript("testShadow.textContent"),/Not connected.*click the Averill icon in the Chrome toolbar/);
 const count=await page.webContents.executeJavaScript("messages.length");await pause(4300);assert.equal(await page.webContents.executeJavaScript("messages.length"),count,'No events after the end');
 console.log('PASS native pairing, selected field, typing invalidation, floating Stop/logout, content-script selection and edit pause, live desktop checklist, pause/resume, ended card with reason; synthetic extension client only');app.quit();
}catch(error){console.error(error.stack);app.exit(1);}});
