// Actual main process, bridge, review engine, background and content script; synthetic browser transport/approval only.
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const os = require('node:os'), fs = require('node:fs'), path = require('node:path'), http = require('node:http'), vm = require('node:vm'), assert = require('node:assert/strict');
const AB=process.env.AB_VARIANT||'';assert(['','expanded','compact'].includes(AB));
const VAMO=process.env.VAMO_PAGE||'';const FB06=process.env.FB06==='1';const FB08=process.env.FB08==='1';assert(['','brevo','linkedin','instagram'].includes(VAMO));
const APP = path.resolve(__dirname, '..'), profile = fs.mkdtempSync('/tmp/averill-contextual-ui-');
const workspace = require('../src/workspace'), { BrowserConnect } = require('../src/browser-connect');
const file = path.join(profile, 'brand.md'); fs.writeFileSync(file, 'Do not claim "lowest prices guaranteed".\nApproved lead: "Discover curated winter city breaks".'+(FB08?'\nImage rule: instagram | required | "image".\nImage rule: instagram | aspect | "4:5 to 1.91:1, 9:16".\nImage rule: instagram | min-width | "1080".\nImage rule: linkedin | aspect | "1.91:1, 1:1, 4:5".\nImage rule: any | alt-text | "required".':'')+(AB?'\nDo not claim "free flights".\nDo not claim "book today".':''));
const data = workspace.create(profile, 'Synthetic contextual test', 'Owner'), source = workspace.importFile(profile, data, file, { department: 'Marketing', version: '2' }); workspace.updateSource(data, source.id, 'approved'); workspace.save(profile, data);
app.setPath('userData', profile); process.env.AVERILL_CONNECT_PORT = '0';
const imageCalls = []; let connectPort, approvals = 0, editor, pageServer, backgroundListener, updatedListener, holdReviewReply = false; const storage = {}, badges = [];
const SHOTS = process.env.SHOTS || ''; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const originalStart = BrowserConnect.prototype.start;
BrowserConnect.prototype.start = async function () { connectPort = await originalStart.call(this); return connectPort; };
const originalDialog = dialog.showMessageBox;
dialog.showMessageBox = async (...args) => { const options = args.at(-1); assert.equal(options.title, 'Connect the Averill browser companion'); approvals++; return { response: 1 }; };
const originalFetch = global.fetch;
// FB-10: mocked Tavily only. Placeholder keys keep Averill from reading any stored secret; nothing real is ever contacted.
process.env.TAVILY_API_KEY = 'tvly-mock-not-a-real-key'; process.env.NEBIUS_API_KEY = 'mock-not-a-real-key';
const tavilyCalls = [];
global.fetch = (url, options) => {
  const target = new URL(url);
  if (target.hostname === 'api.tavily.com') {
    const body = JSON.parse(options.body); tavilyCalls.push(body);
    return Promise.resolve(new Response(JSON.stringify({ results: [
      { title: 'Tivoli Christmas market 2026 | Visit Copenhagen', url: 'https://visit.example/christmas-market', content: 'The Tivoli Christmas market opens on 14 November 2026 and runs until 31 December.', score: 0.9 },
      { title: 'Insecure page', url: 'http://visit.example/insecure', content: 'Dropped because it is not HTTPS.' },
    ] }), { status: 200 }));
  }
  assert.equal(target.hostname, '127.0.0.1', 'No provider request allowed'); return originalFetch(url, options);
};
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
 const relay = (payload, sender = { id: chrome.runtime.id, tab: { id: 9 }, frameId: 0, origin: pageOrigin }) => new Promise(resolve => backgroundListener(payload, sender, value => { if (payload.kind === 'image-check') imageCalls.push({ payload: JSON.parse(JSON.stringify(payload)), value: JSON.parse(JSON.stringify(value)) }); if (payload.kind === 'review' && holdReviewReply) setTimeout(() => resolve(value), 250); else resolve(value); }));
 const preload = path.join(profile, 'test-preload.cjs'); fs.writeFileSync(preload, "const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('testExtension',{send:p=>ipcRenderer.invoke('test-extension',p),onMessage:f=>ipcRenderer.on('test-extension-message',(_,p)=>f(p))});");
 editor = new BrowserWindow({ width: 1200, height: 900, show: false, webPreferences: { preload, contextIsolation: true, sandbox: true } });
 ipcMain.handle('test-extension', (event, payload) => { assert.equal(event.sender, editor.webContents); return relay(payload); });
 await editor.loadURL(pageOrigin + (VAMO?'/'+VAMO:'/draft')); const page = async s => {try{return await editor.webContents.executeJavaScript(s)}catch(error){console.error('Page operation:',s.slice(0,180));throw error}};
 if(VAMO){await pause(500);if(VAMO==='linkedin')await page("document.querySelector('.li-start').click()");else if(VAMO==='instagram'&&FB08){await page("document.querySelector('.ig-draft').click()");await pause(300)}else if(VAMO==='instagram'){await page("[...document.querySelectorAll('button')].find(b=>b.textContent==='Create post').click()");await page("const input=document.querySelector('input[type=file]'),dt=new DataTransfer();dt.items.add(new File(['<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\" fill=\"teal\"/></svg>'],'synthetic.svg',{type:'image/svg+xml'}));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));");await pause(200);}else{await page("document.querySelector('.br-campaign-main').click()");await pause(100);await page("[...document.querySelectorAll('button')].find(b=>/Edit design|Start designing/.test(b.textContent)).click()");}await pause(200);await page("const draft=document.querySelector('textarea');draft.id='draft';Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(draft,'  Hello 🌍\\nOur lowest prices guaranteed.\\nKeep https://example.test  ');draft.dispatchEvent(new Event('input',{bubbles:true}));");checks.push('Actual Vamo '+VAMO+' React editor opened, synthetic draft only; no send/save');}
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

 // FB-07: type a question in the card; real pointer click, real typing, Enter submits, Shift+Enter adds a line.
 {
  const ask=async question=>{
   const at=await page("(()=>{const t=testShadow.querySelector('textarea#averill-ask');t.scrollIntoView({block:'nearest'});const r=t.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(document.elementFromPoint(x,y)!==testShadow.host)throw new Error('Question box is clipped or covered');return {x:Math.round(x),y:Math.round(y)}})()");
   editor.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...at});editor.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...at});await pause(60);
   await page("(()=>{const t=testShadow.querySelector('textarea#averill-ask');t.value=''})()");
   assert.equal(await page("testShadow.activeElement?.id"),'averill-ask');
   await editor.webContents.insertText(question);return question;
  };
  const press=(keyCode,modifiers=[])=>{editor.webContents.sendInputEvent({type:'keyDown',keyCode,modifiers});editor.webContents.sendInputEvent({type:'keyUp',keyCode,modifiers})};
  const draftBefore=await page("document.getElementById('draft').value"),ob=(await run('window.desktop.snapshot()')).externalObservation;
  await ask('Can we say lowest prices guaranteed?');
  assert.equal(await page("(()=>{const t=testShadow.querySelector('textarea#averill-ask'),e=new KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true,composed:true,cancelable:true});t.dispatchEvent(e);return e.defaultPrevented||!testShadow.querySelector('.out').hidden})()"),false,'Shift+Enter is left to the textarea and does not ask');
  press('Return');
  await until("testShadow.querySelector('.out .cite')");
  const shown=await page("(()=>{const out=testShadow.querySelector('.out');return {text:out.textContent,cites:[...out.querySelectorAll('.cite')].map(c=>({title:c.querySelector('b').textContent,small:c.querySelector('small').textContent,quote:c.querySelector('.quote').textContent})),html:out.querySelectorAll('script,img,a').length}})()");
  assert.equal(shown.cites[0].quote,'Do not claim "lowest prices guaranteed".');assert.equal(shown.cites[0].small,'Approved · Version 2');assert(shown.cites[0].title.length>0);assert.equal(shown.html,0,'Answer is plain text');
  assert.equal(await page("document.getElementById('draft').value"),draftBefore,'Asking never edits the host field');
  assert(!(await page('testShadow.textContent')).includes(storage.pair.token));
  if(SHOTS)fs.writeFileSync(path.join(SHOTS,`ask-answer${VAMO?'-'+VAMO:''}.png`),(await editor.webContents.capturePage()).toPNG());
  const fit=await page("(()=>{const r=testShadow.host.getBoundingClientRect(),c=testShadow.querySelector('.card').getBoundingClientRect(),a=testShadow.querySelector('.ask').getBoundingClientRect(),f=testShadow.querySelector('.footer').getBoundingClientRect(),b=testShadow.querySelector('#averill-ask').parentElement.querySelector('button').getBoundingClientRect();return {inView:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,askBtnH:b.height,footerVisible:f.bottom<=c.bottom+1&&f.height>0,askAboveFooter:a.bottom<=f.top+1}})()");
  assert(fit.inView&&fit.footerVisible&&fit.askAboveFooter,'Card with answer fits the viewport: '+JSON.stringify(fit));assert.equal(Math.round(fit.askBtnH),32,'Ask button is the 32px secondary size');
  await ask('Can we offer free chocolate on every flight?');press('Return');await until("testShadow.querySelector('.out')&&testShadow.querySelector('.out').textContent.includes('No approved source answers this.')");
  if(SHOTS)fs.writeFileSync(path.join(SHOTS,`ask-no-source${VAMO?'-'+VAMO:''}.png`),(await editor.webContents.capturePage()).toPNG());
  await ask('Log in with password: hunter2hunter2');press('Return');await until("testShadow.querySelector('.out .error')");assert((await page("testShadow.querySelector('.out .error').textContent")).includes('credentials out of the question'));
  assert.equal(approvals,1);
  checks.push('FB-07 Ask by typing: Enter asks, Shift+Enter does not ask, a cited answer (title, version, exact quote) appears in the card as plain text; unmatched question says no approved source; credential question refused; host field untouched');
 }

 // FB-10: Double-check online. Claims come from the draft, nothing is sent before the button, only ticked text leaves, results are plain text with a link.
 {
  const DRAFT10='The Tivoli Gardens Christmas market in Copenhagen opens on 14 November 2026. Flights from Copenhagen to Vienna start at €79.\nOur lowest prices guaranteed.';
  const setDraft=text=>page(`(()=>{const d=document.getElementById('draft');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(d,${JSON.stringify(text)});d.dispatchEvent(new Event('input',{bubbles:true}))})()`);
  const tap=async selector=>{const at=await page(`(()=>{const e=testShadow.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),x=r.x+Math.min(r.width/2,40),y=r.y+r.height/2;if(document.elementFromPoint(x,y)!==testShadow.host)throw new Error('Clipped or covered: '+${JSON.stringify(selector)});return {x:Math.round(x),y:Math.round(y)}})()`);editor.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,...at});editor.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,...at});await pause(80)};
  const shot10=async name=>{if(SHOTS)fs.writeFileSync(path.join(SHOTS,`${name}${VAMO?'-'+VAMO:''}.png`),(await editor.webContents.capturePage()).toPNG())};
  await setDraft(DRAFT10);await pause(200);await click('Ask Averill');await until("testShadow.querySelector('.check .claim')");
  const offered=await page("(()=>{const c=testShadow.querySelector('.check');return {claims:[...c.querySelectorAll('textarea.claimtext')].map(t=>t.value),ticked:[...c.querySelectorAll('input[type=checkbox]')].map(i=>i.checked),button:[...c.querySelectorAll('button')].map(b=>[b.textContent,Math.round(b.getBoundingClientRect().height)]),text:c.textContent}})()");
  assert.deepEqual(offered.claims,['The Tivoli Gardens Christmas market in Copenhagen opens on 14 November 2026.','Flights from Copenhagen to Vienna start at €79.']);
  assert.deepEqual(offered.ticked,[true,true]);assert.deepEqual(offered.button[0],['Check with Tavily',32],'Secondary button is 32px');
  assert(offered.text.includes('Double-check online')&&offered.text.includes('Nothing is sent until you press the button')&&offered.text.includes('Only the ticked text above leaves this device'));
  assert.equal(tavilyCalls.length,0,'Nothing is sent before the employee presses Check with Tavily');
  await shot10('public-check-claims');
  const fit10=await page("(()=>{const r=testShadow.host.getBoundingClientRect(),c=testShadow.querySelector('.card').getBoundingClientRect(),f=testShadow.querySelector('.footer').getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&f.height>0&&f.bottom<=c.bottom+1})()");assert(fit10,'Card with claims fits the viewport');
  // Untick the second statement, then edit the first by real typing (a shortened version of the draft text).
  await tap('.check .claim:nth-of-type(2) input');assert.equal(await page("testShadow.querySelectorAll('.check .claim input')[1].checked"),false);assert((await page("testShadow.querySelector('.check .checkrow small').textContent")).startsWith('1 of 2'));
  await tap('.check .claim:nth-of-type(1) textarea');await page("testShadow.querySelector('.check textarea.claimtext').select()");
  const edited='Tivoli Gardens Christmas market in Copenhagen opens on 14 November 2026.';await editor.webContents.insertText(edited);await pause(60);
  assert.equal(await page("testShadow.querySelector('.check textarea.claimtext').value"),edited);assert.equal(tavilyCalls.length,0,'Editing or unticking sends nothing');
  const draftBefore10=await page("document.getElementById('draft').value");assert.equal(draftBefore10,DRAFT10,'The host field is untouched by the claim editor');
  await tap('.check .checkrow button');await until("testShadow.querySelector('.results .verdict')");
  assert.equal(tavilyCalls.length,1,'Exactly the ticked statement was searched');assert.equal(tavilyCalls[0].query,edited);assert(!JSON.stringify(tavilyCalls).includes('Vienna'),'The unticked statement never left the device');assert(!JSON.stringify(tavilyCalls).includes('lowest prices'));
  const results=await page("(()=>{const r=testShadow.querySelector('.results');const a=[...r.querySelectorAll('a')];return {title:r.querySelector('h3').textContent,verdicts:[...r.querySelectorAll('.verdict')].map(v=>[v.className,v.querySelector('b').textContent]),links:a.map(x=>({text:x.textContent,href:x.href,target:x.target,rel:x.rel,h:Math.round(x.getBoundingClientRect().height)})),urls:[...r.querySelectorAll('.src small')].map(x=>x.textContent),snippets:[...r.querySelectorAll('.snip')].map(x=>x.textContent),unsafe:r.querySelectorAll('script,img,iframe,style,form').length,text:r.textContent,focus:testShadow.activeElement===r.querySelector('h3')}})()");
  assert.equal(results.title,'Public check, not company approval');assert.deepEqual(results.verdicts,[['verdict unclear','Unclear']]);
  assert.equal(results.links.length,1,'The non-HTTPS result is dropped; the HTTPS result renders as a link');assert.equal(results.links[0].href,'https://visit.example/christmas-market');assert.equal(results.links[0].text,'Tivoli Christmas market 2026 | Visit Copenhagen');assert.equal(results.links[0].target,'_blank');assert(results.links[0].rel.includes('noopener')&&results.links[0].rel.includes('noreferrer'));assert(results.links[0].h>=24,'Text link is at least 24px tall');
  assert.deepEqual(results.urls,['https://visit.example/christmas-market']);assert(results.snippets[0].includes('opens on 14 November 2026'));assert.equal(results.unsafe,0,'Results are plain text');assert(!results.text.includes('insecure'));assert(results.focus,'Focus moves to the results heading');
  assert.equal(await page("document.getElementById('draft').value"),DRAFT10,'Checking online never edits the host field');
  await shot10('public-check-results');
  const fit10b=await page("(()=>{const r=testShadow.host.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1})()");assert(fit10b,'Card with results fits the viewport');
  // Desktop: the check is visible in the activity log and in Current work.
  await pause(400);
  const snap10=await run('window.desktop.snapshot()');
  assert.deepEqual(JSON.parse(JSON.stringify(snap10.onlineCheck.last.counts)),{supported:0,contradicted:0,unclear:1});assert.equal(snap10.onlineCheck.last.origin,'browser card');
  const lines10=snap10.cloudActivity.mine.filter(row=>row.kind==='summary');assert.equal(lines10.length,1);assert.equal(lines10[0].label,'Checked online with Tavily: 1 claim');assert(!JSON.stringify(snap10.cloudActivity).includes('Tivoli'),'Activity log keeps no claim text');
  const desktopText=await run("document.getElementById('online-checks-content').textContent");assert(desktopText.includes('Checked online with Tavily: 1 claim')&&desktopText.includes('from the browser card')&&desktopText.includes('0 supported, 0 contradicted, 1 unclear'),desktopText);
  assert.equal(await run("document.getElementById('online-checks').hidden"),false);
  // Typing in the host field invalidates the offer and the results.
  await setDraft(DRAFT10+' Edited.');await pause(100);assert.equal(await page("Boolean(testShadow.querySelector('.check, .results'))"),false,'Editing the draft clears the offer and the results');
  // Back to the field the following steps expect.
  await setDraft(original);await pause(200);await click('Ask Averill');await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");
  assert.equal(await page("Boolean(testShadow.querySelector('.check'))"),false,'A draft without public statements shows no double-check section');
  checks.push('FB-10 Double-check online: claims from the draft shown with checkboxes and the exact text; nothing sent before the 32px Check with Tavily button; unticked text never leaves; edited text sent as typed; mocked Tavily result renders as plain text with an HTTPS link and "Public check, not company approval"; desktop activity line and Current work summary appear; draft untouched');
 }


 // FB-08: "Check images too". Real Chromium canvas, real pointer clicks, real macOS OCR helper on the planted image; mocked nothing but the transport.
 if(FB08){
  assert(VAMO==='instagram','FB08 needs VAMO_PAGE=instagram (the planted image is on the Instagram Reel draft)');
  const step=async(name,fn)=>{try{await fn();checks.push('FB-08 '+VAMO+': '+name)}catch(error){error.message='FB-08 step failed: '+name+': '+error.message;throw error}};
  const shot=async(name,rect)=>{if(SHOTS)fs.writeFileSync(path.join(SHOTS,`${VAMO}-${name}.png`),(await editor.webContents.capturePage(rect)).toPNG())};
  const leftovers=()=>fs.readdirSync(os.tmpdir()).filter(name=>name.startsWith('averill-image-')).sort();
  const tempBefore=leftovers();
  // A second origin without CORS headers: its image can be shown but never read into a canvas.
  const foreign=http.createServer((req,res)=>{res.setHeader('Content-Type','image/svg+xml');res.end('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#3a6b7a"/></svg>')});
  await new Promise(r=>foreign.listen(0,'127.0.0.1',r));
  try{
  await page("window.__pngReads=0;const original=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(...a){window.__pngReads++;return original.apply(this,a)};void 0");
  await page(`(()=>{const i=document.createElement('img');i.id='foreign-img';i.alt='Partner photo';i.src='http://127.0.0.1:${foreign.address().port}/partner.svg';i.style.cssText='display:block;width:120px;height:150px';document.querySelector('[role=dialog]').append(i)})()`);
  await until("document.getElementById('foreign-img').complete&&document.getElementById('foreign-img').naturalWidth>0");
  await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");
  await step('nothing is collected before the click: no canvas read, no image request, section is off by default',async()=>{
   assert.equal(await page('window.__pngReads'),0);assert.equal(imageCalls.length,0);
   const section=await page("(()=>{const s=testShadow.querySelector('.images');return s&&{text:s.textContent,button:[...s.querySelectorAll('button')].map(b=>[b.textContent,Math.round(b.getBoundingClientRect().height),b.disabled,b.className])}})()");
   assert(section,'Images section is shown');assert(section.text.includes('Nothing is collected until you press the button'));
   assert.deepEqual(section.button,[['Check images too',32,false,'secondary']]);
  });
  const before=await page("document.getElementById('draft').value");
  await click('Check images too');await until("testShadow.querySelector('.images .imgitem h3')");
  const results=await page("(()=>{const s=testShadow.querySelector('.images');return {text:s.textContent,items:[...s.querySelectorAll('.imgitem .imgitem p')].map(p=>p.textContent),sources:[...s.querySelectorAll('details.source')].map(d=>({title:d.querySelector('summary').firstChild.textContent,quote:d.querySelector('.quote').textContent,summaryH:Math.round(d.querySelector('summary').getBoundingClientRect().height)})),pills:s.querySelectorAll('.pill').length,unsafe:s.querySelectorAll('script,img,a,svg').length,links:[...s.querySelectorAll('button,summary')].map(e=>Math.round(e.getBoundingClientRect().height))}})()");
  await step('Check images too reads the composer images; the planted claim is found by the real OCR helper and cites its approved line',async()=>{
   assert.equal(imageCalls.length,1);assert(await page('window.__pngReads')>0);
   assert(results.items.some(t=>/^Image 1 shows “Lowest prices guaranteed”/.test(t)),JSON.stringify(results.items));
   const claim=results.sources.find(x=>x.quote.includes('Do not claim "lowest prices guaranteed"'));assert(claim,JSON.stringify(results.sources));assert.equal(claim.title,'brand.md');
   assert(results.sources.every(x=>x.summaryH>=24),'citation links are at least 24px tall');assert.equal(results.pills,0,'no pills');assert.equal(results.unsafe,0,'plain text only');
   assert.equal(await page("document.getElementById('draft').value"),before,'the check never edits the field');
  });
  await step('a cross-origin image sends no pixels and the card says it could not be read on this page',async()=>{
   const sent=imageCalls[0].payload;assert.equal(sent.images.length,2);
   assert(sent.images[0].dataUrl.startsWith('data:image/png;base64,'));assert.equal(sent.images[1].dataUrl,undefined);assert.equal(sent.images[1].alt,'Partner photo');
   assert(results.text.includes('Image 2 could not be read on this page'),results.text);
  });
  await step('the downscaled PNG has a long side of at most 1600 pixels; the reply carries no image data',async()=>{
   const png=Buffer.from(imageCalls[0].payload.images[0].dataUrl.split(',')[1],'base64'),w=png.readUInt32BE(16),h=png.readUInt32BE(20);
   assert.equal(Math.max(w,h),1600,`${w}x${h}`);assert.equal(imageCalls[0].payload.images[0].width,1080);assert.equal(imageCalls[0].payload.images[0].height,1920);
   const reply=JSON.stringify(imageCalls[0].value);assert(!reply.includes('base64')&&!reply.includes('dataUrl')&&reply.length<6000,reply.length);
   assert(!JSON.stringify((await run('window.desktop.snapshot()'))).includes('base64'),'no image data in the desktop snapshot');
   assert.deepEqual(leftovers(),tempBefore,'every temporary image file was deleted');
  });
  await page("(()=>{const m=testShadow.querySelector('.main');m.scrollTop=m.scrollHeight})()");await pause(120);await shot('images-section-planted');
  await step('after the image is replaced by the original artwork the same check is clean',async()=>{
   await page("document.querySelector('[role=dialog] img[alt=\"Selected post preview\"]').src='/vamo/winter/winter-reel-vertical.svg'");await pause(300);
   await click('Check images too');await until("testShadow.querySelector('.images .imgitem h3')?.textContent==='No image conflicts found'");
   assert.equal(imageCalls.length,2);assert.equal(imageCalls[1].value.findings.length,0);assert.deepEqual(leftovers(),tempBefore);
   assert((await page("testShadow.querySelector('.images').textContent")).includes('Image 2 could not be read on this page'));
  });
  await page("(()=>{const m=testShadow.querySelector('.main');m.scrollTop=m.scrollHeight})()");await pause(120);await shot('images-section-clean');
  await step('editing the draft clears the image results',async()=>{
   await page("(()=>{const d=document.getElementById('draft');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(d,d.value+' More.');d.dispatchEvent(new Event('input',{bubbles:true}))})()");await pause(150);
   assert.equal(await page("Boolean(testShadow.querySelector('.images .imgitem'))"),false);
  });
  // Card header fix: with the card scrolled, no section title may sit under the header. "Before" re-applies the old header rules.
  await step('scrolled card: section titles never slide under the header',async()=>{
   await click('Ask Averill');await until("testShadow.textContent.includes('Remove “lowest prices guaranteed”.')");await click('Check images too');await until("testShadow.querySelector('.images .imgitem h3')");
   editor.setSize(1200,520);await pause(300);await page("window.dispatchEvent(new Event('resize'))");await pause(200);
   const geometry=()=>page("(()=>{const m=testShadow.querySelector('.main'),h=testShadow.querySelector('.head'),t=testShadow.querySelector('.images h3');m.scrollTop=m.scrollHeight;const hb=h.getBoundingClientRect().bottom,mt=m.getBoundingClientRect().top,tt=t.getBoundingClientRect().top;m.scrollTop=Math.max(0,m.scrollTop-40);const sc=m.scrollHeight>m.clientHeight;const titles=[...m.querySelectorAll('h2,h3')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>hb&&r.top<hb});return {scrolls:sc,headBottom:hb,mainTop:mt,opaque:getComputedStyle(h).backgroundColor,separator:getComputedStyle(h).borderBottomWidth,straddling:titles.map(e=>e.textContent)}})()");
   await page("(()=>{const m=testShadow.querySelector('.main');m.scrollTop=m.scrollHeight})()");
   const after=await geometry();assert(after.scrolls,'the card scrolls at this height');assert(after.mainTop>=after.headBottom-0.5,JSON.stringify(after));assert.equal(after.separator,'1px');assert.deepEqual(after.straddling,[]);
   await page("(()=>{const m=testShadow.querySelector('.main');m.scrollTop=m.scrollHeight-60})()");await pause(120);
   await shot('card-scrolled-header-after');
   await page("(()=>{const s=document.createElement('style');s.id='old-head';s.textContent='.head{padding-bottom:0!important;border-bottom:0!important}.main{padding-top:18px!important}';testShadow.append(s);const m=testShadow.querySelector('.main');m.scrollTop=m.scrollHeight-60})()");await pause(120);
   await shot('card-scrolled-header-before-old-css');
   await page("testShadow.getElementById('old-head').remove()");
  });
  editor.setSize(1200,900);
  }finally{foreign.close();foreign.closeAllConnections()}
  console.log(checks.filter(c=>c.startsWith('FB-08')).join('\n'));console.log(`FB08 ${VAMO} PASS ${checks.filter(c=>c.startsWith('FB-08')).length}/6 steps; zero real provider requests; real macOS OCR helper`);return;
 }
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
  console.log(checks.filter(c=>c.startsWith('FB-06')).join('\n'));console.log(`FB06 ${VAMO} PASS ${checks.filter(c=>c.startsWith('FB-06')).length}/4 steps; zero real provider requests`);return;
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
  await click('Preview change');await until("testShadow.textContent.includes('Review this change.')");await click('Apply change');await until("testShadow.textContent.includes('Change applied.')");assert.equal(await page("document.getElementById('draft').value"),original.replace('Our lowest prices guaranteed.', 'Discover curated winter city breaks.'));await click('Undo change');await until("testShadow.textContent.includes('Previous text restored.')");assert.equal(await page("document.getElementById('draft').value"),original);
  samples.sort((a,b)=>a-b);const receipt={variant:AB,variable:'Default finding disclosure only',scriptedTrials:samples.length,warmups:3,humans:0,medianMs:samples[Math.floor(samples.length/2)],p95Ms:samples[Math.ceil(samples.length*.95)-1],geometry,previewApplyUndo:'pass',firstCorrectionActions:3,routineAppSwitches:0,limits:['Synthetic transport, native pointer hit-testing in actual Vamo editor','Harness elapsed times include polling/tool overhead; not pure product latency','No randomized human sample or simplicity/intuitiveness outcome']};if(OUT)fs.writeFileSync(path.join(OUT,'benchmark.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));return;
 }
 await page("[...testShadow.querySelectorAll('button')].find(b=>b.textContent==='Preview change').focus()");await click('Preview change'); await until("testShadow.textContent.includes('Review this change.')");assert.equal(await page("testShadow.activeElement?.textContent"),'Apply change');checks.push('Preview restores keyboard focus to Apply; persistent status announces result');
 if(VAMO){const fit=await page("(()=>{const r=testShadow.host.getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1})()");assert(fit,'Entire preview must fit the viewport');checks.push('Real pointer hit testing reaches each Averill action; modal preview fits without clipping');}
 if (OUT) fs.writeFileSync(path.join(OUT, 'preview.png'), (await editor.webContents.capturePage()).toPNG());
 await click('Apply change'); await until("testShadow.textContent.includes('Change applied.')");
 assert.equal(await page("document.getElementById('draft').value"), original.replace('Our lowest prices guaranteed.', 'Discover curated winter city breaks.')); assert.equal(await page("testShadow.activeElement?.textContent"),'Undo change');checks.push('Explicit Apply replaces one complete sentence, preserving surrounding whitespace/link/newline');
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
 console.log(checks.join('\n')); console.log(`${checks.length} contextual checks passed; zero real provider requests; ${tavilyCalls.length} mocked Tavily search`);
 } catch (error) { console.error(error.stack); process.exitCode = 1; }
 finally { dialog.showMessageBox = originalDialog; global.fetch = originalFetch; editor?.destroy(); pageServer?.close(); pageServer?.closeAllConnections(); app.quit(); fs.rmSync(profile, { recursive: true, force: true }); }
});
