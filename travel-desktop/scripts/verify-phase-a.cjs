// Feedback round 27 October, phase A: Current work scrolls, controls never touch, pairing never claims a connection.
const {app,BrowserWindow,dialog}=require('electron');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const profile=fs.mkdtempSync('/tmp/averill-phase-a-');app.setPath('userData',profile);
const shots=process.env.PHASE_A_SHOTS||path.resolve(root,'../docs/screenshots/2026-10-27');fs.mkdirSync(shots,{recursive:true});
const fixture=path.join(profile,'company-guide.txt');fs.writeFileSync(fixture,'Company knowledge: cobalt palette and weekly planning.');
dialog.showOpenDialog=async()=>({canceled:false,filePaths:[fixture]});
require(path.join(root,'main.js'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
// Every pair of visible controls inside `scope` must be at least 4px apart: no touching, no overlap.
const touching=scope=>`(()=>{const c=[...document.querySelectorAll('${scope} :is(button,select,input:not([type=checkbox]),a,summary)')].filter(e=>e.checkVisibility({contentVisibilityAuto:true})).map(e=>[e,e.getBoundingClientRect()]).filter(([,r])=>r.width>0&&r.height>0);const bad=[];for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const[a,r]=c[i],[b,s]=c[j];if(a.contains(b)||b.contains(a))continue;const gx=Math.max(s.left-r.right,r.left-s.right),gy=Math.max(s.top-r.bottom,r.top-s.bottom);if(Math.max(gx,gy)<4)bad.push((a.textContent||a.tagName).trim().slice(0,30)+' / '+(b.textContent||b.tagName).trim().slice(0,30)+' ['+[r.left,r.top,r.right,r.bottom].map(Math.round)+' | '+[s.left,s.top,s.right,s.bottom].map(Math.round)+']');}return bad})()`;
app.whenReady().then(async()=>{try{
 let win;for(let i=0;i<100;i++){win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=js=>win.webContents.executeJavaScript(js);const shot=async name=>fs.writeFileSync(path.join(shots,name),(await win.webContents.capturePage()).toPNG());
 await run("window.desktop.createWorkspace('Phase A Test','Owner','owner@example.test','Synthetic-password-123')");await pause(300);
 await run("(async()=>{current=await window.desktop.snapshot();render();})()");await pause(200);
 await run("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Skip'&&b.offsetParent)?.click()");await pause(150);

 // A1: Current work reaches its last element at three window heights.
 for(const height of [600,800,1000]){
  win.setSize(480,height);await pause(250);
  await run("showTab('review');document.getElementById('work-controls').open=true");await pause(150);
  const r=await run(`(()=>{const m=document.querySelector('.agent-main');m.scrollTop=m.scrollHeight;const last=[...document.querySelectorAll('[data-tab=review] .review-feed > *')].filter(e=>e.offsetParent).pop();const lr=last.getBoundingClientRect(),mr=m.getBoundingClientRect();return{scrollable:m.scrollHeight>m.clientHeight,lastBottom:lr.bottom,mainBottom:mr.bottom}})()`);
  assert.ok(r.scrollable,`Current work at ${height}px must overflow so it can scroll`);
  assert.ok(r.lastBottom<=r.mainBottom+1,`Current work at ${height}px: last element (${r.lastBottom}) must be reachable within the view (${r.mainBottom})`);
  await shot(`current-work-${height}.png`);
 }

 // A3: pairing opens an endpoint but never reports a connection that does not exist.
 await run("window.testEvents=[];window.desktop.onOperation(e=>window.testEvents.push(e));document.getElementById('browser-pair').click()");
 for(let i=0;i<50&&!(await run("window.testEvents.some(e=>e.channel==='agent:browser-pair'&&e.state!=='pending')"));i++)await pause(100);
 const pairEvent=await run("window.testEvents.find(e=>e.channel==='agent:browser-pair'&&e.state!=='pending')");
 assert.notEqual(pairEvent.state,'success','Pairing must not show a success tick');assert.doesNotMatch(pairEvent.message,/completed/i);
 await run("(async()=>{current=await window.desktop.snapshot();render();})()");await pause(100);
 assert.match(await run("document.getElementById('browser-pair-status').textContent"),/^Waiting for the extension/);
 assert.match(await run("browserPairStatus({ready:true,connected:true,pageHost:'example.test'})"),/^Connected to example\.test/);
 assert.match(await run("browserPairStatus({ready:false,connected:false})"),/^Not connected/);
 await run("document.getElementById('stop-external').click()");await pause(200);

 // A2: the Learn step card and the source approval card have no touching controls.
 win.setSize(560,900);await pause(200);
 await run("(async()=>{current=await window.desktop.learningAction('start',{});render();showTab('learn')})()");await pause(250);
 await shot('learn-step.png');
 assert.deepEqual(await run(touching('#learning-panel')),[],'Learn step controls touch');
 await run("(async()=>{current=await window.desktop.importSources({department:'Marketing',version:'1'});current=await window.desktop.importSources({department:'Marketing',version:'2'});render();showTab('knowledge');document.getElementById('knowledge-review-queue').open=true})()");await pause(300);
 await run("document.getElementById('knowledge-review-queue').scrollIntoView()");await pause(100);await shot('source-approval.png');
 assert.deepEqual(await run(touching('#knowledge-decisions')),[],'Source approval controls touch');
 for(const tab of ['todo','review','knowledge','learn','research','setup']){await run(`showTab('${tab}')`);await pause(120);assert.deepEqual(await run(touching(`[data-tab=${tab}]`)),[],`Controls touch in ${tab}`);}
 console.log('PASS phase A: Current work scrolls at 600/800/1000px, pairing reports waiting/connected/not connected truthfully, no touching controls in any tab. Screenshots in '+shots);app.quit();
}catch(error){console.error(error.stack);app.exit(1);}});
