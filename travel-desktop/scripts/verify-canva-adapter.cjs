// Representative Canva DOM + Chromium native edit pipeline. Not real-platform proof.
const { app, BrowserWindow, protocol } = require('electron');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
app.whenReady().then(async () => {
  let win;
  try {
    protocol.handle('https', () => new Response('<!doctype html><div class="ql-editor" style="white-space:pre-wrap" contenteditable="true" role="textbox" aria-label="Text editor in Text"><p style="text-align:center;font-size:48px"><span style="font-weight:500">Discover lowest prices guaranteed winter city breaks</span></p></div>', {headers:{'Content-Type':'text/html'}}));
    win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true } });
    await win.loadURL('https://www.canva.com/qa');
    await win.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, '../browser-extension/editor-adapter.js'), 'utf8'));
    const run = code => win.webContents.executeJavaScript(`(()=>{try{return eval(${JSON.stringify(code)})}catch(e){console.error(e.message);throw e}})()`, true);
    win.webContents.on('console-message',event=>console.log(event.message));
    await run(`window.field=document.querySelector('.ql-editor');window.identity=()=>({id:'qa',revision:0,value:field.innerText});window.adapter=AverillEditorAdapter.create(field,identity);window.original=field.innerText;window.proposal={start:original.indexOf('lowest'),end:original.indexOf('lowest')+'lowest prices guaranteed'.length,before:'lowest prices guaranteed',after:''};window.inputCount=0;field.addEventListener('input',()=>inputCount++);`);
    assert.equal(await run('AverillEditorAdapter.supported(field)'), true);
    await run('adapter.apply(proposal,identity()).then(value=>window.record=value)');
    assert.equal(await run('field.innerText'), 'Discover  winter city breaks');
    assert.equal(await run('inputCount'), 1);
    await run('adapter.undo(record)'); assert.equal(await run('field.innerText'), await run('original'));
    assert.equal(await run('inputCount'), 2);
    assert.equal(await run('field.querySelector("p").style.fontSize'), '48px');
    await run('adapter.apply(proposal,identity()).then(value=>{window.record=value;field.querySelector("span").style.fontWeight="700"})');
    assert.match(await run('adapter.undo(record).then(()=>null,e=>e.message)'), /formatting changed/);
    await run('field.innerHTML=\'<p><span style="font-weight:500">Mixed </span><span style="font-weight:700">format</span></p>\'');
    assert.equal(await run('AverillEditorAdapter.supported(field)'), false);
    await run('field.innerHTML=\'<p><span>One</span></p><p><span>Two</span></p>\'');
    assert.equal(await run('AverillEditorAdapter.supported(field)'), false);
    await run('field.innerHTML=\'<p><span>lowest prices guaranteed</span></p>\'');
    assert.match(await run('adapter.apply({...proposal,start:0,end:field.innerText.length},identity()).then(()=>null,e=>e.message)'), /whole Canva text/);
    await run('field.innerHTML=\'<p><span>Discover lowest prices guaranteed winter city breaks</span></p>\';window.nativeEdit=document.execCommand.bind(document);document.execCommand=(...args)=>{const result=nativeEdit(...args);field.querySelector("span").style.fontWeight="700";return result};void 0');
    const uncertain=await run('adapter.apply(proposal,identity()).then(()=>null,e=>({message:e.message,before:e.recovery?.before,text:field.innerText}))');
    assert.equal(uncertain.before,'Discover lowest prices guaranteed winter city breaks');assert.equal(uncertain.text,'Discover  winter city breaks');
    await run('document.execCommand=nativeEdit;field.setAttribute("aria-readonly","true")');assert.equal(await run('AverillEditorAdapter.supported(field)'),false);
    console.log('PASS Canva native Apply/Undo/input events/style retention; mixed-run, multiline, formatting change and whole-element deletion guards; uncertain-write manual recovery and readonly exclusion. Synthetic DOM only.');
  } catch (error) { console.error(error); app.exit(1); }
  finally { win?.destroy(); app.quit(); }
});
