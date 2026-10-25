// Actual main process, bridge, review engine, background and content script; synthetic browser transport/approval only.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), vm = require('node:vm'), assert = require('node:assert/strict');
const AB=process.env.AB_VARIANT||'';assert(['','expanded','compact'].includes(AB));
const VAMO=process.env.VAMO_PAGE||'';const FB06=process.env.FB06==='1';assert(['','brevo','linkedin','instagram'].includes(VAMO));
const APP = path.resolve(__dirname, '..'), profile = fs.mkdtempSync('/tmp/averill-contextual-ui-');
const workspace = require('../src/workspace'), { BrowserConnect } = require('../src/browser-connect');
const file = path.join(profile, 'brand.md'); fs.writeFileSync(file, 'Do not claim "lowest prices guaranteed".'+(AB?'\nDo not claim "free flights".\nDo not claim "book today".':''));
const data = workspace.create(profile, 'Synthetic contextual test', 'Owner'), source = workspace.importFile(profile, data, file, { department: 'Marketing', version: '2' }); workspace.updateSource(data, source.id, 'approved'); workspace.save(profile, data);
app.setPath('userData', profile); process.env.AVERILL_CONNECT_PORT = '0';
let connectPort, approvals = 0, editor, pageServer, backgroundListener, updatedListener, holdReviewReply = false; const storage = {}, badges = [];
const SHOTS = process.env.SHOTS || ''; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const originalStart = BrowserConnect.prototype.start;
BrowserConnect.prototype.start = async function () { connectPort = await originalStart.call(this); return connectPort; };
const originalDialog = dialog.showMessageBox;
dialog.showMessageBox = async (...args) => { const options = args.at(-1); assert.equal(options.title, 'Connect the Averill browser companion'); approvals++; return { response: 1 }; };
const originalFetch = global.fetch;
global.fetch = (url, options) => { assert.equal(new URL(url).hostname, '127.0.0.1', 'No provider request allowed'); return originalFetch(url, options); };
require('../main.js');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms)); const checks = [];
const OUT = process.env.OUT || ''; if (OUT) fs.mkdirSync(OUT, { recursive: true });
app.whenReady().then(async () => { try {
 let agent; for (let i = 0; i < 100; i++) { agent = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html')); if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break; await pause(100); }
 const run = s => agent.webContents.executeJavaScript(s);
 await run("window.desktop.enableAccounts('owner@synthetic.example','Synthetic-password-123')");
 pageServer = http.createServer((req, res) => {
  if (req.url.startsWith('/assets/')&&(!VAMO||['mark.svg','plus-jakarta-sans.ttf'].includes(path.basename(req.url)))) { const name = path.basename(req.url); if (!['mark.svg', 'plus-jakarta-sans.ttf'].includes(name)) { res.writeHead(404); res.end(); return; } res.setHeader('Content-Type', name.endsWith('.svg') ? 'image/svg+xml' : 'font/ttf'); res.end(fs.readFileSync(path.join(APP, 'browser-extension/assets', name))); return; }
  if(VAMO){const dist=path.join(APP,'../demo-tools/social-simulator/dist');const target=path.resolve(dist,'.'+new URL(req.url,'http://local').pathname);if(!target.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}const file=fs.existsSync(target)&&fs.statSync(target).isFile()?target:path.join(dist,'index.html');const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.html':'text/html; charset=utf-8'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));return;}
  res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<!doctype html><html><meta charset="utf-8"><title>Synthetic draft</title><body style="font:16px sans-serif;padding:35px;background:#f6f7fa"><h1>Synthetic email editor</h1><label>Email body<textarea id="draft" style="display:block;width:510px;height:450px;font:16px/1.7 sans-serif;margin-top:20px">  Hello 🌍\nOur lowest prices guaranteed.\nKeep https://example.test  </textarea></label><button id="publish" disabled>Send (disabled)</button></body></html>');
 }); await new Promise(r => pageServer.listen(0, '127.0.0.1', r)); const pageOrigin = `http://127.0.0.1:${pageServer.address().port}`;
 const extOrigin = 'chrome-extension://' + 'c'.repeat(32);
 const chrome = { runtime: { id: 'c'.repeat(32), onMessage: { addListener: f => { backgroundListener = f; } } }, action: { setBadgeText: async value => { badges.push(value); }, setBadgeBackgroundColor: async () => {} }, storage: { session: { get: async keys => Object.fromEntries([].concat(keys).map(key => [key, storage[key] ? structuredClone(storage[key]) : undefined])), set: async object => Object.assign(storage, structuredClone(object)), remove: async key => { delete storage[key]; } } }, tabs: { query: async () => [{ id: 9, url: pageOrigin + '/draft' }], sendMessage: async (_id, message) => { if (message.kind === 'ping') return { alive: await editor.webContents.executeJavaScript("typeof window.__averillStop==='function'") }; editor.webContents.send('test-extension-message', message); }, onRemoved: { addListener: () => {} }, onUpdated: { addListener: f => { updatedListener = f; } } }, scripting: { executeScript: async ({ files }) => { for (const name of files) await editor.webContents.executeJavaScript((name==='content.js'&&AB?fs.readFileSync(path.join(APP, 'browser-extension', name), 'utf8').replace('result=value;uiState=',`result=value;expanded=${AB==='expanded'};uiState=`):fs.readFileSync(path.join(APP, 'browser-extension', name), 'utf8'))); } } };
 const worker = vm.createContext({ chrome, URL, AbortSignal, setTimeout, fetch: (url, options) => global.fetch(url, { ...options, headers: { ...options.headers, Origin: extOrigin } }) }); worker.globalThis = worker;
 worker.importScripts = (...files) => { for (const name of files) vm.runInContext(fs.readFileSync(path.join(APP, 'browser-extension', name), 'utf8'), worker); };
 vm.runInContext(fs.readFileSync(path.join(APP, 'browser-extension/background.js'), 'utf8').replace('http://127.0.0.1:43147/connect', `http://127.0.0.1:${connectPort}/connect`), worker);
 const relay = (payload, sender = { id: chrome.runtime.id, tab: { id: 9 }, frameId: 0, origin: pageOrigin }) => new Promise(resolve => backgroundListener(payload, sender, value => { if (payload.kind === 'review' && holdReviewReply) setTimeout(() => resolve(value), 250); else resolve(value); }));
 const preload = path.join(profile, 'test-preload.cjs'); fs.writeFileSync(preload, "const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('testExtension',{send:p=>ipcRenderer.invoke('test-extension',p),onMessage:f=>ipcRenderer.on('test-extension-message',(_,p)=>f(p))});");
 editor = new BrowserWindow({ width: 1200, height: 900, show: false, webPreferences: { preload, contextIsolation: true, sandbox: true } });
 ipcMain.handle('test-extension', (event, payload) => { assert.equal(event.sender, editor.webContents); return relay(payload); });
 await editor.loadURL(pageOrigin + (VAMO?'/'+VAMO:'/draft')); const page = async s => {try{return await editor.webContents.executeJavaScript(s)}catch(error){console.error('Page operation:',s.slice(0,180));throw error}};
 if(VAMO){await pause(500);if(VAMO==='linkedin')await page("document.querySelector('.li-start').click()");else if(VAMO==='instagram'){await page("[...document.querySelectorAll('button')].find(b=>b.textContent==='Create post').click()");await page("const input=document.querySelector('input[type=file]'),dt=new DataTransfer();dt.items.add(new File(['<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\" fill=\"teal\"/></svg>'],'synthetic.svg',{type:'image/svg+xml'}));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));");await pause(200);}else{await page("document.querySelector('.br-campaign-main').click()");await pause(100);await page("[...document.querySelectorAll('button')].find(b=>/Edit design|Start designing/.test(b.textContent)).click()");}await pause(200);await page("const draft=document.querySelector('textarea');draft.id='draft';Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(draft,'  Hello 🌍\\nOur lowest prices guaranteed.\\nKeep https://example.test  ');draft.dispatchEvent(new Event('input',{bubbles:true}));");checks.push('Actual Vamo '+VAMO+' React editor opened, synthetic draft only; no send/save');}
 if(AB)await page("const d=document.getElementById('draft');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(d,d.value+' Free flights: book today.');d.dispatchEvent(new Event('input',{bubbles:true}));");
 const shim = () => page(`window.testShadow=null;const originalShadow=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){const r=originalShadow.call(this,o);window.testShadow=r;return r};window.chrome={runtime:{getURL:p=>${JSON.stringify(pageOrigin + '/')}+p,sendMessage:p=>window.testExtension.send(p),onMessage:{addListener:f=>window.testExtension.onMessage(f)}}};void 0;`);
 await shim();
 const connected = await relay({ kind: 'connect-tab' }, { id: chrome.runtime.id }); assert.equal(connected.connected, true); assert.equal(approvals, 1); assert.deepEqual(JSON.parse(JSON.stringify(badges.at(-1))), { tabId: 9, text: 'ON' }); checks.push('Guided connection: actual loopback rendezvous/bridge, synthetic approval, no JSON paste; toolbar badge ON');
 const bounds = await page("(()=>{const r=document.getElementById('draft').getBoundingClientRect();return {x:Math.round(r.x+20),y:Math.round(r.y+30)}})()");
 editor.webContents.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, ...bounds }); editor.webContents.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, ...bounds }); await pause(180);
 await page(`testShadow.querySelector('select').value='${VAMO==='linkedin'?'linkedin':VAMO==='instagram'?'instagram':'email'}';testShadow.querySelector('select').dispatchEvent(new Event('change'));`);
 const click = async label => {const js=`(()=>{const b=[...testShadow.querySelectorAll('button')].find(b=>b.textContent===${JSON.stringify(label)});if(!b)throw new Error('Missing action '+${JSON.stringify(label)});${VAMO?"b.scrollIntoView({block:'nearest'});const r=b.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;if(document.elementFromPoint(x,y)!==testShadow.host)throw new Error('Averill action is clipped or covered');return {x:Math.round(x),y:Math.round(y)}":"b.click()"}})()`;const bounds=await page(js);if(VAMO){editor.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...bounds});editor.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...bounds});await pause(30);}};
 async function until(expression) { for (let i = 0; i < 100; i++) { if (await page(expression)) return; await pause(60); } throw new Error('Timeout: ' + expression); }
 const original = await page("document.getElementById('draft').value"); assert(original.includes('🌍'));
 await page("[...testShadow.querySelectorAll('button')].find(b=>b.textContent==='Ask Averill').focus()");
 holdReviewReply=true;await click('Ask Averill');await until("testShadow.textContent.includes('Checking your draft.')");await click('×');await pause(350);assert(await page("Boolean(testShadow.querySelector('.chip'))"));checks.push('Dismissed pending review stays dismissed when its reply arrives');holdReviewReply=false;await click('Ask Averill');await click('Ask Averill');await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");
 assert(await page("testShadow.textContent.includes('Approved · Version 2')")); assert(!(await page('testShadow.textContent')).includes(storage.pair.token)); checks.push('Ask shows the actual local cited finding in-page; no desktop navigation or token exposure');

 // FB-06: the same simulator composer after edits, after the app replaces the field node, and as a role=textbox editor.
 if(FB06){
  assert(VAMO==='linkedin'||VAMO==='instagram','FB06 needs VAMO_PAGE=linkedin or instagram');
  const step=async(name,fn)=>{try{await fn();checks.push('FB-06 '+VAMO+': '+name)}catch(error){error.message='FB-06 step failed: '+name+': '+error.message;throw error}};
  const shot=async name=>{if(SHOTS)fs.writeFileSync(path.join(SHOTS,`${VAMO}-${name}.png`),(await editor.webContents.capturePage()).toPNG())};
  const finding="testShadow.textContent.includes('Remove “lowest prices guaranteed”.')";
  await step('edit the draft, the finding still arrives',async()=>{await page("(()=>{const d=document.getElementById('draft');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(d,d.value+' Extra line.');d.dispatchEvent(new Event('input',{bubbles:true}))})()");await pause(200);await click('Ask Averill');await until(finding)});
  await shot('card-after-edit');
  await step('the app replaces the field node, the selection is found again and the finding arrives',async()=>{
   await page("(()=>{const old=document.getElementById('draft'),n=document.createElement('textarea');for(const a of old.attributes)n.setAttribute(a.name,a.value);n.value=old.value;old.replaceWith(n)})()");
   await until("testShadow.host.style.display==='block'&&!testShadow.textContent.includes('Remove')");
   assert.equal(await page("document.querySelector('textarea')===document.getElementById('draft')&&document.getElementById('draft').isConnected"),true);
   await click('Ask Averill');await until(finding);assert.equal((await run('window.desktop.snapshot()')).browserBridge.connected,true);assert.equal(approvals,1)});
  await shot('card-after-rerender');
  await step('a role=textbox plaintext-only editor can be shared and reviewed',async()=>{
   await page("(()=>{const d=document.createElement('div');d.id='fb06-box';d.setAttribute('role','textbox');d.setAttribute('contenteditable','plaintext-only');d.setAttribute('aria-label','Write a caption...');d.style.cssText='position:relative;margin:8px;min-height:60px;border:1px solid #888;background:#fff;color:#000';d.textContent='Our lowest prices guaranteed.';(document.querySelector('[role=dialog]')||document.body).append(d)})()");
   const box=await page("(()=>{const r=document.getElementById('fb06-box').getBoundingClientRect();return {x:Math.round(r.x+20),y:Math.round(r.y+20)}})()");
   editor.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...box});editor.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...box});await pause(250);
   await click('Ask Averill');await until(finding)});
  await shot('card-role-textbox');
  await step('a field that never comes back ends the selection but not the connection',async()=>{
   await page("document.getElementById('fb06-box').remove()");await pause(3200);
   assert.equal(await page("testShadow.host.style.display"),'none');assert.equal((await run('window.desktop.snapshot()')).browserBridge.connected,true)});
  console.log(checks.filter(c=>c.startsWith('FB-06')).join('\n'));console.log(`FB06 ${VAMO} PASS ${checks.filter(c=>c.startsWith('FB-06')).length}/4 steps; zero provider requests`);return;
 }
 if(AB){
  const samples=[];
  for(let i=0;i<23;i++){
   await page("document.getElementById('draft').dispatchEvent(new Event('input',{bubbles:true}))");
   const start=performance.now();await click('Ask Averill');await until("testShadow.textContent.includes('3 suggestions')");
   if(i>=3)samples.push(performance.now()-start);
  }
  const geometry=await page("(()=>{const c=testShadow.querySelector('.card'),m=testShadow.querySelector('.main'),p=testShadow.querySelector('.primary'),r=p.getBoundingClientRect();return {height:c.getBoundingClientRect().height,contentHeight:m.scrollHeight,visibleContentHeight:m.clientHeight,controls:c.querySelectorAll('button,select,summary').length,visibleFindings:testShadow.querySelectorAll('.source').length,primaryVisible:r.top>=0&&r.bottom<=innerHeight}})()");
  assert(geometry.primaryVisible);if(OUT)fs.writeFileSync(path.join(OUT,'variant.png'),(await editor.webContents.capturePage()).toPNG());
  await click('Preview change');await until("testShadow.textContent.includes('Review this change.')");await click('Apply change');await until("testShadow.textContent.includes('Change applied.')");assert.equal(await page("document.getElementById('draft').value"),original.replace('lowest prices guaranteed',''));await click('Undo change');await until("testShadow.textContent.includes('Previous text restored.')");assert.equal(await page("document.getElementById('draft').value"),original);
  samples.sort((a,b)=>a-b);const receipt={variant:AB,variable:'Default finding disclosure only',scriptedTrials:samples.length,warmups:3,humans:0,medianMs:samples[Math.floor(samples.length/2)],p95Ms:samples[Math.ceil(samples.length*.95)-1],geometry,previewApplyUndo:'pass',firstCorrectionActions:3,routineAppSwitches:0,limits:['Synthetic transport, native pointer hit-testing in actual Vamo editor','Harness elapsed times include polling/tool overhead; not pure product latency','No randomized human sample or simplicity/intuitiveness outcome']};if(OUT)fs.writeFileSync(path.join(OUT,'benchmark.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));return;
 }
 await page("[...testShadow.querySelectorAll('button')].find(b=>b.textContent==='Preview change').focus()");await click('Preview change'); await until("testShadow.textContent.includes('Review this change.')");assert.equal(await page("testShadow.activeElement?.textContent"),'Apply change');checks.push('Preview restores keyboard focus to Apply; persistent status announces result');
 if(VAMO){const fit=await page("(()=>{const r=testShadow.host.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1})()");assert(fit,'Entire preview must fit the viewport');checks.push('Real pointer hit testing reaches each Averill action; modal preview fits without clipping');}
 if (OUT) fs.writeFileSync(path.join(OUT, 'preview.png'), (await editor.webContents.capturePage()).toPNG());
 await click('Apply change'); await until("testShadow.textContent.includes('Change applied.')");
 assert.equal(await page("document.getElementById('draft').value"), original.replace('lowest prices guaranteed', '')); assert.equal(await page("testShadow.activeElement?.textContent"),'Undo change');checks.push('Explicit Apply changes only the validated phrase, preserving surrounding whitespace/link/newline');
 await click('Undo change'); await until("testShadow.textContent.includes('Previous text restored.')"); assert.equal(await page("document.getElementById('draft').value"), original); checks.push('Undo restores the exact original text');if(VAMO){await page("document.getElementById('draft').dispatchEvent(new Event('input',{bubbles:true}))");assert.equal(await page("document.getElementById('draft').value"),original);checks.push('React-controlled value preserved after input rerender');}
 await click(VAMO?'Ask Averill':'Recheck selected text'); await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");
 await click('Open in Averill ↗'); await pause(200); assert(await run("document.getElementById('source-dialog').open")); await run("document.getElementById('source-dialog').close()"); checks.push('Explicit deep link opens the authorized source in the desktop app');
 await click('Preview change'); await until("testShadow.textContent.includes('Review this change.')");
 await run(`window.desktop.updateSource(${JSON.stringify(source.id)},'superseded',0,'Synthetic test revocation')`);
 await click('Apply change'); await until("testShadow.textContent.includes('changed')"); assert.equal(await page("document.getElementById('draft').value"), original); checks.push('Revoked source blocks Apply without changing the editor');
 await click('Ask Averill'); await until("testShadow.textContent.includes('No approved source yet.')"); checks.push('Unavailable authority is insufficient evidence, never a clean result');
 await run(`window.desktop.updateSource(${JSON.stringify(source.id)},'approved')`);
 await click('Try again'); await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");
 await click('Preview change'); await until("testShadow.textContent.includes('Review this change.')"); await click('Apply change'); await until("testShadow.textContent.includes('Change applied.')");
 await page("document.getElementById('draft').value+=' New typing';document.getElementById('draft').dispatchEvent(new Event('input',{bubbles:true}));");
 assert(!(await page('testShadow.textContent')).includes('Undo change')); assert((await page("document.getElementById('draft').value")).endsWith(' New typing')); assert((await page('testShadow.textContent')).includes('Undo will not overwrite'));await click('Show previous text for manual recovery');assert.equal(await page('testShadow.querySelector("textarea").value'),original);checks.push('Intervening typing blocks Undo and offers explicit manual recovery without overwriting newer work');
 await click('Review current text'); await until("testShadow.textContent.includes('No conflicts found.')"); checks.push('Recheck clears the corrected conflict');
 if (OUT) fs.writeFileSync(path.join(OUT, 'clear.png'), (await editor.webContents.capturePage()).toPNG());
 if (!VAMO) {
  assert((await page('testShadow.textContent')).includes('Connected to Averill')); if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'card-connected-pill.png'), (await editor.webContents.capturePage({ x: 560, y: 0, width: 640, height: 640 })).toPNG()); checks.push('In-page card header shows the Connected to Averill status pill');
  const before = storage.pair.sequence;
  await page("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))"); await pause(200);
  assert.equal((await run('window.desktop.snapshot()')).browserBridge.paused, true); assert.equal(storage.pair.token !== undefined, true);
  await page("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'))"); await pause(200);
  const resumed = await run('window.desktop.snapshot()'); assert.equal(resumed.browserBridge.paused, false); assert.equal(resumed.browserBridge.connected, true); assert.equal(approvals, 1);
  checks.push('Hidden tab pauses the bridge and visible resumes it with the same pair and no new approval');
  await editor.webContents.reload(); await new Promise(r => editor.webContents.once('did-finish-load', r)); await shim();
  updatedListener(9, { status: 'complete' }, { id: 9, url: pageOrigin + '/draft' }); await until("Boolean(window.__averillStop)"); await pause(300);
  editor.webContents.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, ...bounds }); editor.webContents.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, ...bounds }); await pause(250);
  const reloaded = await run('window.desktop.snapshot()'); assert.equal(reloaded.browserBridge.connected, true); assert.equal(reloaded.externalObservation?.field?.label, 'Email body'); assert(storage.pair.sequence > before + 2, 'Sequence continues across re-injection'); assert.equal(approvals, 1);
  checks.push('Same-origin reload re-injects the companion, keeps the pair and sequence, and needs no new approval');
  await page(`testShadow.querySelector('select').value='email';testShadow.querySelector('select').dispatchEvent(new Event('change'));`);
 }
 await page("testShadow.querySelector('.primary').focus()");editor.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});editor.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await pause(80);assert(await page("Boolean(testShadow.querySelector('.chip')) && document.getElementById('draft').isConnected && document.activeElement===document.getElementById('draft')"));checks.push('Escape dismisses only Averill, preserves the host editor and restores draft focus');await click('Ask Averill');
 await click('Stop sharing'); await until("testShadow.textContent.includes('Sharing ended.')"); assert((await page('testShadow.textContent')).includes('You chose Stop sharing')); assert(!(await page('testShadow.textContent')).includes('lowest prices')); assert.equal((await run('window.desktop.snapshot()')).browserBridge.ready, false); assert.equal((await run('window.desktop.snapshot()')).browserBridge.lastEnd.reason, 'stopped_by_user'); assert.equal(storage.pair, null); assert.deepEqual(JSON.parse(JSON.stringify(badges.at(-1))), { tabId: 9, text: '' }); checks.push('Stop ends text sharing and the authenticated bridge; the in-page card says why and how to reconnect; badge cleared');
 if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'card-ended-stopped.png'), (await editor.webContents.capturePage({ x: 560, y: 260, width: 640, height: 640 })).toPNG());
 await relay({ kind: 'connect-tab' }, { id: chrome.runtime.id }); assert.equal(approvals, 1); checks.push('Same-session explicit reconnect needs no repeated desktop approval');
 const pair = storage.pair; await run('window.desktop.logout()'); assert.equal((await run('window.desktop.snapshot()')).browserBridge.ready, false);
 assert.deepEqual(JSON.parse(JSON.stringify(await relay({ kind: 'heartbeat' }))), { stopped: true, reason: 'signed_out' }); await until("testShadow.textContent.includes('You signed out of Averill')");
 await pause(400); if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'card-ended-signed-out.png'), (await editor.webContents.capturePage({ x: 560, y: 260, width: 640, height: 640 })).toPNG());
 checks.push('Logout revokes the connection; the page learns the signed_out reason from the ended bridge');
 const response = await global.fetch(`http://127.0.0.1:${connectPort}/connect`, { method: 'POST', headers: { Origin: extOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ tabId: 9, pageOrigin }) }); assert.equal(response.status, 401);
 if (OUT) fs.writeFileSync(path.join(OUT, 'verification.json'), JSON.stringify({ checks, providerRequests: 0, limits: ['Synthetic transport and browser approval; '+(VAMO?'actual Vamo '+VAMO+' mock editor, not a real platform':'synthetic editor, not installed Chrome or real-platform acceptance'), 'Plain text controls only; rich editor writes remain unsupported'] }, null, 2));
 console.log(checks.join('\n')); console.log(`${checks.length} contextual checks passed; zero provider requests`);
 } catch (error) { console.error(error.stack); process.exitCode = 1; }
 finally { dialog.showMessageBox = originalDialog; global.fetch = originalFetch; editor?.destroy(); pageServer?.close(); pageServer?.closeAllConnections(); app.quit(); fs.rmSync(profile, { recursive: true, force: true }); }
});
