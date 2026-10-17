const {app,BrowserWindow}=require('electron');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const OUT=process.env.OUT;const APP=path.resolve(__dirname,'../../travel-desktop'); // run: OUT=<dir> npx electron docs/review-evidence-2026-10-17/e2e-ui-check.cjs
const workspace=require(APP+'/src/workspace');
const profile=fs.mkdtempSync('/tmp/averill-e2e-');const rule=path.join(profile,'brand-and-legal.md');
fs.writeFileSync(rule,'Do not claim "lowest prices guaranteed".\nEvery marketing email must include this footer: "You are receiving this email because you subscribed to Vamo. Unsubscribe anytime."');
const company=workspace.create(profile,'Vamo','Alex Holm');const policy=workspace.importFile(profile,company,rule,{department:'Marketing',version:'2'});workspace.updateSource(company,policy.id,'approved');workspace.save(profile,company);
app.setPath('userData',profile);require(APP+'/main.js');
const pause=ms=>new Promise(r=>setTimeout(r,ms));const log=[];const step=(name,ok,detail='')=>{log.push({name,ok,detail});};
app.whenReady().then(async()=>{try{
 let agent;for(let i=0;i<100;i++){agent=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(agent&&!agent.webContents.isLoading()&&await agent.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=s=>agent.webContents.executeJavaScript(s);const shot=async(n,w=520,h=850)=>{agent.setSize(w,h);await pause(450);fs.writeFileSync(path.join(OUT,n),(await agent.webContents.capturePage()).toPNG());};
 agent.setSize(520,850);await run("document.querySelector('[data-tab-button=review]').click()");await pause(400);
 const idle=await run("({steps:document.getElementById('review-steps').innerText,cta:document.getElementById('review-start').textContent,attach:document.querySelector('.composer-attach').textContent,ctx:document.getElementById('review-context').textContent})");
 step('Review idle with approved source shows Share/Check/Fix, no Setup step',!idle.steps.includes('Add')&&idle.cta==='Choose what to review',JSON.stringify(idle));
 step('Composer action is a labelled button',idle.attach==='Choose work',idle.attach);
 step('Jargon context line removed',!idle.ctx.includes('no demo window shared'),idle.ctx);
 await shot('01-review-idle.png');
 await run("document.querySelector('[data-tab-button=work]').click()");await pause(300);
 const dis=await run("['stop-external','external-local-recheck','external-task-review'].map(id=>{const e=document.getElementById(id);return [id,e.disabled,getComputedStyle(e).opacity]})");
 step('Unavailable Work actions are disabled and dimmed',dis.every(([,d,o])=>d&&Number(o)<0.6),JSON.stringify(dis));await shot('02-work-disabled.png');
 const pair=await run('window.desktop.pairBrowser()');
 const send=async(seq,value)=>{const r=await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:9,pageOrigin:'https://brevo.example',kind:'field',sequence:seq,reason:'pause',field:{kind:'textarea',label:'Email body',value}})});assert.equal(r.status,200);await pause(400);};
 await send(1,'Winter Escapes 2027 — lowest prices guaranteed. Book Copenhagen, Vienna and Prague now.');
 await run("document.getElementById('external-task-review').click()");await pause(1500);
 const conflict=await run("({area:document.body.dataset.area,title:document.getElementById('hero-title').textContent,result:document.getElementById('review-work-result').innerText,outline:getComputedStyle(document.getElementById('hero-title')).outlineStyle,focused:document.activeElement.id,pill:getComputedStyle(document.getElementById('sharing-status')).visibility,banner:document.getElementById('operation-feedback').hidden})");
 step('Real rule conflict lands in Review',conflict.area==='review'&&conflict.title==='Review these corrections.'&&conflict.result.includes('lowest prices guaranteed'),conflict.result.slice(0,300));
 step('Headline focused without visible box',conflict.focused==='hero-title'&&conflict.outline==='none',`${conflict.focused} ${conflict.outline}`);
 step('Duplicate status pill hidden while live bar shows',conflict.pill==='hidden',conflict.pill);
 step('Success banner not repeated',conflict.banner===true,String(conflict.banner));
 step('Missing footer also reported',conflict.result.toLowerCase().includes('unsubscribe'),'');
 await shot('03-conflict-520.png');await shot('04-conflict-960.png',960,820);
 await send(2,'Winter Escapes 2027 — discover curated winter city breaks in Copenhagen, Vienna and Prague.\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.');
 const cleared=await run("({title:document.getElementById('hero-title').textContent,result:document.getElementById('review-work-result').innerText})");
 step('Editing invalidates the old finding',!cleared.result.includes('lowest prices guaranteed'),cleared.title);
 const waiting=await run("({title:document.getElementById('hero-title').textContent,cta:document.getElementById('review-start').textContent,hidden:document.getElementById('review-start').hidden,steps:document.getElementById('review-steps').hidden})");
 step('After an edit Review offers the check directly',waiting.title==='Ready to check.'&&waiting.cta==='Check approved rules'&&!waiting.hidden&&waiting.steps,JSON.stringify(waiting));await shot('04b-ready-to-check.png');
 await run("document.getElementById('review-start').click()");await pause(1500);
 const clear=await run("({title:document.getElementById('hero-title').textContent,cls:document.body.classList.contains('review-clear'),result:document.getElementById('review-work-result').innerText})");
 step('Fixed draft rechecks as all clear',clear.cls&&clear.title==='No conflicts with approved rules.',clear.result.slice(0,200));await shot('05-clear-520.png');
 await run("document.querySelector('.review-context .stop-button').click()");await pause(600);
 const stopped=await run("window.desktop.snapshot().then(s=>({obs:s.externalObservation,win:s.externalWindow,bridge:s.browserBridge.ready,title:document.getElementById('hero-title').textContent}))");
 step('Stop clears observation and advice',!stopped.obs&&!stopped.win&&!stopped.bridge&&!stopped.title.startsWith('No conflicts'),JSON.stringify(stopped));await shot('06-stopped.png');
 for(const t of ['learn','knowledge','research','setup']){await run(`document.querySelector('[data-tab-button=${t}]').click()`);await pause(400);await shot(`07-${t}.png`);}
 const scopes=await run("[...document.querySelectorAll('[data-tab] .check-scope')].length");step('Checked/Not checked blocks present in Learn, Knowledge, Research',scopes>=3,String(scopes));
 const header=await run("(()=>{const m=document.querySelector('.agent-header .brand-mark').getBoundingClientRect(),h=document.querySelector('.agent-header h1').getBoundingClientRect();return Math.round(h.left-m.right)})()");step('Logo sits next to the Averill name',header<=24,`${header}px gap`);
 console.log(JSON.stringify(log));
}catch(e){console.error(e);console.log(JSON.stringify(log));process.exitCode=1}finally{fs.rmSync(profile,{recursive:true,force:true});app.quit();}});
