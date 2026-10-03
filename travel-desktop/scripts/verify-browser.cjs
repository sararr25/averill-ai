const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const profile=fs.mkdtempSync('/tmp/averill-browser-ui-');app.setPath('userData',profile);require('../main.js');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
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
 await send({kind:'editing',sequence:2});assert.equal((await run('window.desktop.snapshot()')).externalObservation,null);assert.ok(await run("document.getElementById('external-task-review').disabled"));
 await send({kind:'field',sequence:3,reason:'blur',field:{kind:'textarea',label:'Email body',value:'Corrected marker'}});
 const companion=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('companion.html'));await companion.webContents.executeJavaScript("document.getElementById('stop').click()");await pause(80);
 const stopped=await run('window.desktop.snapshot()');assert.equal(stopped.externalObservation,null);assert.equal(stopped.externalWindow,null);assert.equal(stopped.browserBridge.ready,false);
 await run('window.desktop.pairBrowser()');await run('window.desktop.logout()');assert.equal((await run('window.desktop.snapshot()')).browserBridge.ready,false);
 // Exercise the actual content-script code in an isolated DOM; this is not a live Chrome extension install.
 const page=new BrowserWindow({width:700,height:500,webPreferences:{contextIsolation:true}});
 await page.loadURL('data:text/html,'+encodeURIComponent('<label>Body<textarea id="body">Draft</textarea></label><label>Password<input type="password" id="password"></label>'));
 await page.webContents.executeJavaScript("window.messages=[];window.chrome={runtime:{sendMessage:async item=>{window.messages.push(item);return {};},onMessage:{addListener:()=>{}}}};void 0;");
 await page.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname,'../browser-extension/content.js'),'utf8'));
 const box=await page.webContents.executeJavaScript("(()=>{const r=document.getElementById('body').getBoundingClientRect();return {x:Math.round(r.x+10),y:Math.round(r.y+10)}})()");
 page.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...box});page.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...box});await pause(80);
 assert.ok(await page.webContents.executeJavaScript("messages.some(x=>x.kind==='field'&&x.reason==='selection')"));
 await page.webContents.executeJavaScript("document.getElementById('body').value='Edited draft';document.getElementById('body').dispatchEvent(new Event('input',{bubbles:true}));");
 assert.equal(await page.webContents.executeJavaScript("messages.at(-1).kind"),'editing');await pause(1400);assert.ok(await page.webContents.executeJavaScript("messages.some(x=>x.kind==='field'&&x.reason==='pause'&&x.field.value==='Edited draft')"));
 console.log('PASS native pairing, selected field, typing invalidation, floating Stop/logout, content-script selection and edit pause; synthetic extension client only');app.quit();
}catch(error){console.error(error.stack);app.exit(1);}});
