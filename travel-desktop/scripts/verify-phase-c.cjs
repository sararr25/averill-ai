// Feedback round 27 October, phase C: Current work shows the work, and the extension installs and connects from one place.
const {app,BrowserWindow,shell}=require('electron');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const childProcess=require('node:child_process');
const APP=path.resolve(__dirname,'..');const workspace=require(APP+'/src/workspace');const {BrowserConnect}=require(APP+'/src/browser-connect');
const shots=process.env.PHASE_C_SHOTS||path.resolve(APP,'../docs/screenshots/2026-10-27');fs.mkdirSync(shots,{recursive:true});
const profile=fs.mkdtempSync('/tmp/averill-phase-c-');const rule=path.join(profile,'brand-and-legal.md');
fs.writeFileSync(rule,'Do not claim "lowest prices guaranteed".\nEvery marketing email must include this footer: "You are receiving this email because you subscribed to Vamo. Unsubscribe anytime."');
const company=workspace.create(profile,'Vamo','Alex Holm');const policy=workspace.importFile(profile,company,rule,{department:'Marketing',version:'2'});workspace.updateSource(company,policy.id,'approved');workspace.save(profile,company);
// Never open the real Chrome or Finder from a test: record what Averill asked for instead.
const opened=[];childProcess.execFile=(command,args,callback)=>{opened.push([command,...args]);callback(null);};shell.showItemInFolder=file=>opened.push(['reveal',file]);
// A free port, so a running Averill on 43147 cannot interfere; the test reads it from the instance.
process.env.AVERILL_CONNECT_PORT='0';let connectServer;const start=BrowserConnect.prototype.start;BrowserConnect.prototype.start=async function(){connectServer=this;return start.call(this);};
app.setPath('userData',profile);require(APP+'/main.js');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const touching=scope=>`(()=>{const c=[...document.querySelectorAll('${scope} :is(button,select,a,summary)')].filter(e=>e.checkVisibility({contentVisibilityAuto:true})).map(e=>[e,e.getBoundingClientRect()]).filter(([,r])=>r.width>0&&r.height>0);const bad=[];for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const[a,r]=c[i],[b,s]=c[j];if(a.contains(b)||b.contains(a))continue;if(Math.max(s.left-r.right,r.left-s.right,s.top-r.bottom,r.top-s.bottom)<4)bad.push(a.textContent.trim().slice(0,24)+' / '+b.textContent.trim().slice(0,24));}return bad})()`;
app.whenReady().then(async()=>{try{
 let win;for(let i=0;i<100;i++){win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=js=>win.webContents.executeJavaScript(js);
 win.setSize(560,900);win.webContents.debugger.attach('1.3');
 const scheme=value=>win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value}]});
 const shot=async name=>{for(const s of ['light','dark']){await scheme(s);await pause(150);fs.writeFileSync(path.join(shots,`${s}-${name}`),(await win.webContents.capturePage()).toPNG());}await scheme('light');};
 await run("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Skip'&&b.offsetParent)?.click()");
 await run("showTab('review')");await pause(300);
 for(let i=0;i<50&&!connectServer?.server?.address();i++)await pause(100);

 // 1. Nothing open, extension never seen: the card says so and offers the guided install.
 let state=await run("({title:document.getElementById('working-now-title').textContent,install:[...document.querySelectorAll('#extension-panel button')].map(b=>b.textContent),steps:document.querySelectorAll('.install-steps li').length,hero:getComputedStyle(document.querySelector('.review-hero')).display,checklist:document.getElementById('browser-checklist').hidden,toolsHere:Boolean(document.querySelector('[data-tab=review] #work-controls')),toolsInSettings:Boolean(document.querySelector('[data-tab=setup] #work-controls'))})");
 assert.equal(state.title,'Nothing open yet');assert.deepEqual(state.install,['Install extension']);assert.equal(state.steps,3);
 assert.equal(state.hero,'none','The idle hero is replaced by the card');assert.equal(state.checklist,true,'No connect checklist before install');
 assert.equal(state.toolsHere,false);assert.equal(state.toolsInSettings,true,'Pairing recovery and window capture live in Workspace settings');
 await shot('c-not-installed.png');
 await run("document.querySelector('#extension-panel button').click()");await pause(300);
 assert.deepEqual(opened[0],['open','-a','Google Chrome','chrome://extensions']);assert.ok(opened[1][0]==='reveal'&&opened[1][1].endsWith(path.join('browser-extension','manifest.json')));
 assert.match(await run("document.querySelector('#extension-panel .field-hint').textContent"),/Follow the three steps/);

 // 2. The extension announces itself: Install becomes Connect, which only brings Chrome forward and never claims a connection.
 const port=connectServer.server.address().port;
 assert.equal((await fetch(`http://127.0.0.1:${port}/hello`,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32)}})).status,204);await pause(400);
 state=await run("({buttons:[...document.querySelectorAll('#extension-panel button')].map(b=>b.textContent),checklist:document.getElementById('browser-checklist').hidden})");
 assert.deepEqual(state.buttons,['Connect']);assert.equal(state.checklist,false);
 await run("document.querySelector('#extension-panel button').click()");await pause(300);
 assert.deepEqual(opened.at(-1),['open','-a','Google Chrome']);
 assert.match(await run("document.querySelector('#extension-panel .field-hint').textContent"),/Nothing is connected until/);
 assert.equal(await run("document.getElementById('working-now-title').textContent"),'Nothing open yet');
 await shot('c-installed.png');

 // 3. A Brevo draft field connects: the card names it, picks the email check, and Check now runs the review.
 const pair=await run('window.desktop.pairBrowser()');
 const send=async(seq,value)=>{const r=await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:9,pageOrigin:'https://brevo.example',kind:'field',sequence:seq,reason:'pause',field:{kind:'textarea',label:'Email body',value}})});assert.equal(r.status,200);await pause(400);};
 await send(1,'Winter Escapes 2027 — lowest prices guaranteed. Book Copenhagen, Vienna and Prague now.');
 await run("showTab('review')");await pause(200);
 state=await run("({open:document.getElementById('working-now').classList.contains('is-open'),title:document.getElementById('working-now-title').textContent,meta:document.getElementById('working-now-meta').textContent,task:document.getElementById('external-task').value,check:document.getElementById('working-check').disabled,icon:document.getElementById('connection-icon').getAttribute('aria-label')})");
 assert.ok(state.open);assert.equal(state.task,'email');assert.equal(state.check,false,'Check now is ready once a field is captured');
 assert.match(state.meta,/Brevo|Not checked yet/);assert.match(state.icon,/^Browser connected to brevo\.example/);
 await run("document.getElementById('working-check').click()");
 for(let i=0;i<50&&!(await run("/to fix/.test(document.getElementById('working-now-meta').textContent)"));i++)await pause(100);
 state=await run("({meta:document.getElementById('working-now-meta').textContent,hero:getComputedStyle(document.querySelector('.review-hero')).display,title:document.getElementById('hero-title').textContent,recent:[...document.querySelectorAll('#recent-work-list > li')].map(li=>li.textContent)})");
 assert.match(state.meta,/2 things to fix · checked at/);assert.notEqual(state.hero,'none','Corrections show under the card');assert.equal(state.title,'Review these corrections.');
 assert.equal(state.recent.length,1);assert.match(state.recent[0],/2 to fix/);
 await run("document.querySelector('#recent-work-list details').open=true;document.querySelector('.agent-main').scrollTop=0");await pause(100);
 await shot('c-connected-checked.png');
 assert.deepEqual(await run(touching('[data-tab=review]')),[],'Controls touch in Current work');

 // 4. Ask about this opens the question box; Disconnect returns to the empty card and keeps the recent work.
 await run("document.getElementById('working-ask').click()");assert.equal(await run("document.getElementById('review-chat').open&&document.activeElement.id"),'question');
 await run("document.getElementById('working-disconnect').click()");await pause(500);
 state=await run("({title:document.getElementById('working-now-title').textContent,recent:document.querySelectorAll('#recent-work-list > li').length})");
 assert.equal(state.title,'Nothing open yet');assert.equal(state.recent,1);
 win.webContents.debugger.detach();
 console.log('PASS phase C: guided install and honest Connect, Working on now card with automatic email check type, Check now, corrections, recent work, disconnect. Screenshots in '+shots);app.quit();
}catch(error){console.error(error.stack);app.exit(1);}});
