// FB-14 end to end: actual main process, loopback bridge, design check, extension worker (in a VM), content script and Canva
// design reader, on a synthetic Canva page rebuilt from the captured structure and served at https://www.canva.com/qa.
// Synthetic browser transport and approval only; not installed Chrome and not real canva.com.
// SHOTS=<dir> saves screenshots of the card states.
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const qa = require('./canva-qa-page.cjs');
const APP = path.resolve(__dirname, '..'), profile = fs.mkdtempSync('/tmp/averill-canva-design-');
const workspace = require('../src/workspace'), { BrowserConnect } = require('../src/browser-connect');
const data = workspace.create(profile, 'Synthetic Canva design test', 'Owner');
for (const name of ['social-media-guidelines-v2.md', 'current-brief.md']) {
  const source = workspace.importFile(profile, data, path.join(APP, 'demo-company/vamo/Marketing', name), { department: 'Marketing', version: '2' });
  workspace.updateSource(data, source.id, 'approved');
}
workspace.save(profile, data);
app.setPath('userData', profile); process.env.AVERILL_CONNECT_PORT = '0';
process.env.NEBIUS_API_KEY = ''; process.env.TAVILY_API_KEY = '';
app.commandLine.appendSwitch('force-device-scale-factor', '1');
const SHOTS = process.env.SHOTS || ''; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let connectPort, approvals = 0, editor, backgroundListener, updatedListener; const storage = {}, designCalls = [];
const originalStart = BrowserConnect.prototype.start;
BrowserConnect.prototype.start = async function () { connectPort = await originalStart.call(this); return connectPort; };
const originalDialog = dialog.showMessageBox;
dialog.showMessageBox = async (...args) => { assert.equal(args.at(-1).title, 'Connect the Averill browser companion'); approvals++; return { response: 1 }; };
const originalFetch = global.fetch;
let designDelay = 0, designInFlight = 0; // Holds design-check requests back so a check can be in flight when the watch is turned off.
global.fetch = async (url, options) => { assert.equal(new URL(url).hostname, '127.0.0.1', 'No provider request allowed'); if (designDelay && String(options?.body || '').includes('"design-check"')) { designInFlight++; await new Promise(resolve => setTimeout(resolve, designDelay)); designInFlight--; } return originalFetch(url, options); };
require('../main.js');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms)); const checks = [];
const PAGE = 'https://www.canva.com/qa';
app.whenReady().then(async () => { try {
  let agent; for (let i = 0; i < 100; i++) { agent = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html')); if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break; await pause(100); }
  const run = s => agent.webContents.executeJavaScript(s);
  await run("window.desktop.enableAccounts('owner@synthetic.example','Synthetic-password-123')");
  const ses = session.fromPartition('canva-design-qa');
  ses.protocol.handle('https', request => {
    const url = new URL(request.url);
    if (url.hostname !== 'www.canva.com') return new Response('', { status: 404 });
    if (url.pathname.startsWith('/qa/img/')) return new Response(qa.image(path.basename(url.pathname)), { headers: { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': 'https://www.canva.com' } });
    if (url.pathname.startsWith('/qa/assets/')) { const name = path.basename(url.pathname); if (!['mark.svg', 'plus-jakarta-sans.ttf'].includes(name)) return new Response('', { status: 404 }); return new Response(fs.readFileSync(path.join(APP, 'browser-extension/assets', name)), { headers: { 'Content-Type': name.endsWith('.svg') ? 'image/svg+xml' : 'font/ttf' } }); }
    if (url.pathname === '/qa') return new Response(qa.build({ zoom: url.searchParams.get('zoom') === '1' ? 1 : qa.CAPTURED_ZOOM, left: url.searchParams.get('zoom') === '1' ? 60 : 380, top: url.searchParams.get('zoom') === '1' ? -285 : 96, positions: qa.SAFE_POSITIONS }), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    return new Response('', { status: 404 });
  });
  const extOrigin = 'chrome-extension://' + 'c'.repeat(32);
  let tabUrl = PAGE;
  const chrome = { runtime: { id: 'c'.repeat(32), onMessage: { addListener: f => { backgroundListener = f; } } }, action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} }, storage: { session: { get: async keys => Object.fromEntries([].concat(keys).map(key => [key, storage[key] ? structuredClone(storage[key]) : undefined])), set: async object => Object.assign(storage, structuredClone(object)) } }, tabs: { query: async () => [{ id: 9, url: tabUrl }], sendMessage: async (_id, message) => { if (message.kind === 'ping') return { alive: await editor.webContents.executeJavaScript("typeof window.__averillStop==='function'") }; editor.webContents.send('test-extension-message', message); }, onRemoved: { addListener: () => {} }, onUpdated: { addListener: f => { updatedListener = f; } } }, scripting: { executeScript: async ({ files }) => { injected.push([...files]); for (const name of files) await editor.webContents.executeJavaScript(fs.readFileSync(path.join(APP, 'browser-extension', name), 'utf8')); } } };
  const injected = [];
  const worker = vm.createContext({ chrome, URL, AbortSignal, setTimeout, fetch: (url, options) => global.fetch(url, { ...options, headers: { ...options.headers, Origin: extOrigin } }) }); worker.globalThis = worker;
  worker.importScripts = (...files) => { for (const name of files) vm.runInContext(fs.readFileSync(path.join(APP, 'browser-extension', name), 'utf8'), worker); };
  vm.runInContext(fs.readFileSync(path.join(APP, 'browser-extension/background.js'), 'utf8').replace('http://127.0.0.1:43147/connect', `http://127.0.0.1:${connectPort}/connect`), worker);
  const relay = (payload, sender = { id: chrome.runtime.id, tab: { id: 9 }, frameId: 0, origin: 'https://www.canva.com' }) => new Promise(resolve => backgroundListener(payload, sender, value => { if (payload.kind === 'design-check') designCalls.push({ payload: JSON.parse(JSON.stringify(payload)), value: JSON.parse(JSON.stringify(value)) }); resolve(value); }));
  const preload = path.join(profile, 'test-preload.cjs'); fs.writeFileSync(preload, "const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('testExtension',{send:p=>ipcRenderer.invoke('test-extension',p),onMessage:f=>ipcRenderer.on('test-extension-message',(_,p)=>f(p))});");
  editor = new BrowserWindow({ width: 1400, height: 900, show: false, webPreferences: { session: ses, preload, contextIsolation: true, sandbox: true } });
  ipcMain.handle('test-extension', (event, payload) => { assert.equal(event.sender, editor.webContents); return relay(payload); });
  const page = async s => { try { return await editor.webContents.executeJavaScript(s); } catch (error) { console.error('Page operation:', s.slice(0, 160)); throw error; } };
  const shim = () => page(`window.testShadows=[];const originalShadow=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){const r=originalShadow.call(this,o);window.testShadows.push(r);return r};window.designShadow=()=>window.testShadows.find(r=>r.host.hasAttribute('data-averill-design')&&r.host.isConnected);window.chrome={runtime:{getURL:p=>'https://www.canva.com/qa/'+p,sendMessage:p=>window.testExtension.send(p),onMessage:{addListener:f=>window.testExtension.onMessage(f)}}};void 0;`);
  const load = async url => { await editor.loadURL(url); await page("Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})))"); await shim(); };
  const D = "designShadow()";
  const text = () => page(`${D}?.textContent||''`);
  async function until(expression, what = expression, ms = 8000) { const end = Date.now() + ms; while (Date.now() < end) { if (await page(expression)) return; await pause(80); } throw new Error('Timeout: ' + what + '\nCard: ' + await text()); }
  const tap = async selector => {
    const at = await page(`(()=>{const e=[...${D}.querySelectorAll(${JSON.stringify(selector.css)})].find(e=>${selector.label ? `(e.getAttribute('aria-label')||e.textContent)===${JSON.stringify(selector.label)}` : 'true'});if(!e)throw new Error('Missing '+${JSON.stringify(JSON.stringify(selector))});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),x=r.x+Math.min(r.width/2,30),y=r.y+r.height/2;if(document.elementFromPoint(x,y)!==${D}.host)throw new Error('Covered: '+${JSON.stringify(JSON.stringify(selector))});return {x:Math.round(x),y:Math.round(y)}})()`);
    editor.webContents.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, ...at }); editor.webContents.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, ...at }); await pause(60);
  };
  const shot = async name => { if (SHOTS) fs.writeFileSync(path.join(SHOTS, name + '.png'), (await editor.webContents.capturePage()).toPNG()); };
  const step = async (name, fn) => { try { await fn(); checks.push(name); } catch (error) { error.message = `Step failed: ${name}: ${error.message}`; throw error; } };
  const setBodyColor = color => page(`document.querySelectorAll('[data-qa-text=body] span').forEach(s=>s.style.color=${JSON.stringify(color)});[...document.querySelectorAll('[data-qa-layer] span')].at(-1).style.color=${JSON.stringify(color)};void 0`);
  const setBodyText = value => page(`document.querySelector('[data-qa-text=body] span').textContent=${JSON.stringify(value)};[...document.querySelectorAll('[data-qa-layer] span')].at(-1).textContent=${JSON.stringify(value)};void 0`);
  const moveBody = x => page(`document.querySelector('[data-qa-text=body]').style.transform='translate(${x}px, 1276.17px)';void 0`);
  const BODY = 'finish this line: what makes the city good before 8?', NEAR_BLACK = 'rgb(16, 15, 13)', PISTACHIO = 'rgb(147, 197, 114)';
  const clean = `${D}?.querySelector('h2')?.textContent==='No design problems found.'`, blocking = `${D}?.querySelector('h2')?.textContent==='Fix before you export'`;
  const findings = () => page(`[...${D}.querySelectorAll('.dfind')].map(f=>({text:f.querySelector('b').textContent,lines:[...f.querySelectorAll(':scope>p')].map(p=>p.textContent),title:f.querySelector('summary')?.firstChild.textContent,version:f.querySelector('summary small')?.textContent,quote:f.querySelector('.quote')?.textContent}))`);

  await load(PAGE);
  await step('Connect on the Canva tab injects the design reader before content.js; the design card shows "Watch my design" off by default and sends nothing', async () => {
    assert.equal((await relay({ kind: 'connect-tab' }, { id: chrome.runtime.id })).connected, true); assert.equal(approvals, 1);
    assert.deepEqual(injected[0], ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'canva-design.js', 'content.js']);
    await until(`Boolean(${D})`);
    const off = await page(`(()=>{const t=${D}.querySelector('input[type=checkbox]');return {checked:t.checked,label:t.getAttribute('aria-label'),size:[t.getBoundingClientRect().width,t.getBoundingClientRect().height]}})()`);
    assert.deepEqual(off, { checked: false, label: 'Watch my design', size: [24, 24] });
    await pause(1500); assert.equal(designCalls.length, 0, 'nothing is read or sent before the toggle');
  });
  await shot('fb14-off');
  await step('Watch on: dark text passes; the card sits right of the page frame without covering it', async () => {
    await tap({ css: 'input[type=checkbox]' });
    await until(clean, 'clean card');
    const geometry = await page(`(()=>{const c=${D}.host.getBoundingClientRect(),f=AverillCanvaDesign.frameRect(document);return {cardLeft:c.left,frameRight:f.right,inView:c.top>=0&&c.right<=innerWidth&&c.bottom<=innerHeight,pills:[...${D}.querySelectorAll('*')].filter(e=>getComputedStyle(e).borderRadius==='999px').length}})()`);
    assert(geometry.cardLeft >= geometry.frameRight, JSON.stringify(geometry)); assert(geometry.inView); assert.equal(geometry.pills, 0, 'no pills');
    const sent = designCalls.at(-1).payload;
    assert.deepEqual(Object.keys(sent).sort(), ['design', 'elements', 'kind']);
    assert.deepEqual(sent.elements.map(e => e.text), ['vamo', 'copenhagen before 8', BODY]);
    assert(!JSON.stringify(sent).includes('data:'), 'no image data'); assert(JSON.stringify(sent).length < 4000);
    assert((await text()).includes('Checked 3 texts for contrast, safe area, approved wording.'));
  });
  await shot('fb14-clean');
  await step('Pistachio body text on the cream panel: blocking card "Fix before you export" with the measured contrast and the exact approved line', async () => {
    const before = designCalls.length; await setBodyColor(PISTACHIO);
    await until(blocking, 'blocking card');
    const list = await findings();
    assert.deepEqual(list, [{ text: `“${BODY}”`, lines: ['This text is hard to read on its background.', 'contrast 1.76:1, needs 4.5:1'], title: 'social-media-guidelines-v2.md', version: 'Approved · Version 2', quote: 'Design rule: instagram | contrast-normal | "4.5".' }]);
    assert.equal(designCalls.length, before + 1, 'one check after the edit pause');
    const sizes = await page(`(()=>{const b=[...${D}.querySelectorAll('button')].find(b=>b.textContent==='Export anyway');const s=${D}.querySelector('.dfind summary');return {button:Math.round(b.getBoundingClientRect().height),radius:getComputedStyle(b).borderRadius,summary:s.getBoundingClientRect().height,border:getComputedStyle(${D}.querySelector('.dcard')).borderTopColor,unsafe:${D}.querySelectorAll('script,iframe,a').length}})()`);
    assert.equal(sizes.button, 32); assert.equal(sizes.radius, '12px'); assert(sizes.summary >= 24); assert.equal(sizes.unsafe, 0, 'plain text only');
  });
  await page(`${D}.querySelector('.dfind details').open=true`); await pause(100);
  await shot('fb14-block-contrast');
  await step('Fix the colour: the card clears on the next check', async () => { await setBodyColor(NEAR_BLACK); await until(clean, 'clean after fix'); });
  await step('Body box moved to x = 40: blocking card for the safe area citing the 108 px line', async () => {
    await moveBody(40); await until(blocking, 'safe zone block');
    const list = await findings();
    assert.deepEqual(list.map(f => [f.lines, f.quote]), [[['This text sits outside the safe area.', '40 px from the left edge, needs at least 108 px from every edge'], 'Design rule: instagram | safe-margin | "108".']]);
  });
  await page(`${D}.querySelector('.dfind details').open=true`); await pause(100);
  await shot('fb14-block-safe-zone');
  await step('Move it back: clean', async () => { await moveBody(120); await until(clean, 'clean after move back'); });
  await step('"lowest prices guaranteed" in the body: finding with its approved source line', async () => {
    await setBodyText('lowest prices guaranteed on winter city breaks'); await until(blocking, 'claim block');
    const list = await findings();
    assert.equal(list.length, 1); assert.equal(list[0].lines[0], 'Remove “lowest prices guaranteed”. The approved rules don’t allow it.');
    assert.equal(list[0].title, 'current-brief.md'); assert(list[0].quote.includes('Do not claim "lowest prices guaranteed"'), list[0].quote);
    await setBodyText(BODY); await until(clean, 'clean after text fix');
  });
  await step('Export anyway records an override in this session only and keeps the warning text; a new problem blocks again', async () => {
    await setBodyColor(PISTACHIO); await until(blocking, 'block before override');
    await tap({ css: 'button', label: 'Export anyway' });
    await until(`${D}.querySelector('h2')?.textContent==='Export anyway recorded.'`, 'override recorded');
    assert.equal(designCalls.at(-1).value.state, 'override-recorded');
    assert.deepEqual(Object.keys(designCalls.at(-1).payload).sort(), ['action', 'checkId', 'kind']);
    const status = (await run('window.desktop.snapshot()')).designCheck;
    assert.equal(status.overrides.length, 1); assert.deepEqual(status.overrides[0].types, ['contrast']);
    assert((await text()).includes('contrast 1.76:1, needs 4.5:1'), 'the problem stays listed');
    await moveBody(40); await until(blocking, 'new problem blocks again');
    await moveBody(120); await setBodyColor(NEAR_BLACK); await until(clean, 'clean');
  });
  await shot('fb14-after-override-clean');
  await step('Averill never edits the design: text, colour and position are only what the test set', async () => {
    assert.deepEqual(await page("(()=>{const b=document.querySelector('[data-qa-text=body]');return [b.style.transform,b.querySelector('span').textContent,b.querySelector('span').style.color]})()"), ['translate(120px, 1276.17px)', BODY, NEAR_BLACK]);
  });
  // Feedback round 27 October, D1: the Canva lesson runs inside Canva and ticks itself from the same design reading.
  await step('D1 lesson: after Start in Averill, the Canva card lists the six lesson steps with the ticks Averill saved', async () => {
    await run("window.desktop.learningAction('start',{})");
    await moveBody(121); await until(`Boolean(${D}?.querySelector('.dex'))`, 'lesson in the card');
    const listed = await page(`[...${D}.querySelectorAll('.dexlist li')].map(li=>[li.className,li.querySelector('b').textContent])`);
    const learn = (await run('window.desktop.snapshot()')).learning, lesson = learn.sessions.find(s => s.title === 'Canva layout essentials' && !s.finishedAt);
    const title = Object.fromEntries(learn.steps.map(s => [s.id, s.title]));
    assert.equal(listed.length, 6); assert.deepEqual(listed.at(-1), ['confirm', title.group], 'grouping is confirmed by the employee');
    assert.deepEqual(listed.filter(([kind]) => kind === 'done').map(([, t]) => t).sort(), Object.keys(lesson.checks).map(id => title[id]).sort(), 'card ticks match the saved lesson');
    console.log('D1 ticks on the synthetic page:', JSON.stringify(lesson.live.result));
    assert.deepEqual(Object.keys(lesson.checks).sort(), ['align', 'contrast', 'hierarchy', 'margin', 'size'], 'this clean post shows every readable step');
    await moveBody(120);
  });
  await shot('d1-lesson-in-canva');
  await step('D1 lesson: one confirmation finishes it; readable steps are recorded as checked by Averill, grouping as confirmed by the employee', async () => {
    const lesson = (await run('window.desktop.snapshot()')).learning.sessions.find(s => s.title === 'Canva layout essentials' && !s.finishedAt);
    const done = (await run(`window.desktop.learningAction('finish',{sessionId:${JSON.stringify(lesson.id)}})`)).learning.sessions.find(s => s.id === lesson.id);
    assert.ok(done.finishedAt);
    assert.deepEqual(Object.fromEntries(done.confirmed.map(c => [c.id, c.kind])), { hierarchy: 'checked-by-averill', size: 'checked-by-averill', align: 'checked-by-averill', margin: 'checked-by-averill', contrast: 'checked-by-averill', group: 'employee-confirmed' });
  });
  await step('Unrecognised structure: "Averill cannot read this design", nothing sent', async () => {
    const before = designCalls.length;
    await page("document.querySelectorAll('div[style]').forEach(d=>{if(d.style.width==='1080px'&&d.style.height==='1440px'&&!d.style.transform)d.style.width='1000px'});void 0");
    await until(`${D}.querySelector('h2')?.textContent==='Averill cannot read this design'`, 'unreadable');
    assert.equal(designCalls.length, before);
  });
  await shot('fb14-unreadable');
  await step('Same design at 100% zoom (page partly off screen): same-site reload re-injects, pistachio blocks with the same numbers, dark text clears', async () => {
    tabUrl = PAGE + '?zoom=1'; await load(tabUrl);
    updatedListener(9, { status: 'complete' }, { id: 9, url: tabUrl }); await until(`Boolean(${D})`, 'reinjected');
    assert.deepEqual(injected.at(-1), ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'canva-design.js', 'content.js']); assert.equal(approvals, 1);
    await tap({ css: 'input[type=checkbox]' }); await until(clean, 'clean at 100%');
    assert.equal(designCalls.at(-1).payload.design.scale, 1);
    assert.equal(designCalls.at(-1).payload.elements[2].box.x, 120);
    await setBodyColor(PISTACHIO); await until(blocking, 'block at 100%');
    assert.equal((await findings())[0].lines[1], 'contrast 1.76:1, needs 4.5:1');
    await shot('fb14-block-contrast-zoom100');
    await setBodyColor(NEAR_BLACK); await until(clean, 'clean at 100%');
  });
  await step('Turning the watch off while a check is in flight does not leave it stuck; turning it back on checks again', async () => {
    designDelay = 2000; await setBodyColor(PISTACHIO);
    for (let i = 0; i < 80 && !designInFlight; i++) await pause(50);
    assert.equal(designInFlight, 1, 'a design check is in flight');
    await tap({ css: 'input[type=checkbox]' }); await pause(2500); designDelay = 0;
    await tap({ css: 'input[type=checkbox]' });
    await until(blocking, 'blocking card after the watch is turned back on');
    await setBodyColor(NEAR_BLACK); await until(clean, 'clean again');
  });
  await step('Stop sharing ends the watch; a later design check is refused by the worker', async () => {
    await tap({ css: 'button', label: 'Stop sharing' });
    await until(`!${D}`, 'design card removed');
    const refused = await relay({ kind: 'design-check', design: { width: 1080, height: 1440, scale: 1 }, elements: [] });
    assert.equal(refused.stopped, true);
  });
  console.log(checks.map(c => 'PASS ' + c).join('\n'));
  console.log(`FB-14 verify-canva-design: ${checks.length} steps passed; ${designCalls.length} design-check relays; zero provider requests. Synthetic Canva page and transport, not real canva.com.`);
} catch (error) { console.error(error.stack); process.exitCode = 1; }
finally { dialog.showMessageBox = originalDialog; global.fetch = originalFetch; editor?.destroy(); app.quit(); fs.rmSync(profile, { recursive: true, force: true }); } });
