// In-app guide check on a temporary judge-demo profile: first-run offer, ? controls, keyboard tour, per-person progress.
const {app,BrowserWindow}=require('electron');const fs=require('node:fs'),path=require('node:path');
const APP=path.resolve(__dirname,'..'); // run: npm run verify:guide
const profile=fs.mkdtempSync('/tmp/averill-guide-');app.setPath('userData',profile);const errors=[];
app.on('web-contents-created',(e,wc)=>wc.on('console-message',(ev,l,m)=>{if(l>=3)errors.push(m)}));
require(APP+'/main.js');const pause=ms=>new Promise(r=>setTimeout(r,ms));const log=[];const step=(name,ok,detail='')=>log.push({name,ok,detail});
app.whenReady().then(async()=>{try{
 let agent;for(let i=0;i<100;i++){agent=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(agent&&!agent.webContents.isLoading()&&await agent.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=s=>agent.webContents.executeJavaScript(s);agent.setSize(520,850);
 const key=async k=>{agent.focus();agent.webContents.focus();await pause(100);agent.webContents.sendInputEvent({type:'keyDown',keyCode:k});if(k==='Return')agent.webContents.sendInputEvent({type:'char',keyCode:'\r'});agent.webContents.sendInputEvent({type:'keyUp',keyCode:k});await pause(400);};
 const signIn=async who=>{await run(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Continue as ${who}')).click()`);await pause(1500);};
 const signOut=async()=>{await run("[...document.querySelectorAll('button')].find(b=>b.textContent==='Sign out').click()");await pause(1200);};
 step('No offer before sign-in',!(await run("!!document.getElementById('guide-offer')")));
 await run("[...document.querySelectorAll('button')].find(b=>/Try the demo/.test(b.textContent)).click()");await pause(2500);
 step('First-run offer: 1-minute tour / Skip',await run("(()=>{const o=document.getElementById('guide-offer');return !!o&&[...o.querySelectorAll('button')].map(b=>b.textContent).join('|')==='Skip|1-minute tour'})()"));
 const help=await run("[...document.querySelectorAll('.guide-help')].filter(b=>!b.hidden).map(b=>b.dataset.guide).sort()");
 step('? control on Work, Review, Learn, Library and Setup',JSON.stringify(help)===JSON.stringify(['knowledge','learn','review','setup','work']),JSON.stringify(help));
 await run("[...document.querySelectorAll('#guide-offer button')].find(b=>b.textContent==='1-minute tour').focus()");await key('Return');
 const seen=[];for(let i=0;i<30;i++){const s=await run("(()=>{const p=document.getElementById('guide-panel');return p&&{count:p.querySelector('.guide-count').textContent,focus:document.activeElement?.id,target:!!document.querySelector('.guide-target')}})()");if(!s)break;seen.push(s);await run("[...document.querySelectorAll('#guide-panel button')].find(b=>/Next|Done/.test(b.textContent)).click()");await pause(500);}
 step('Enter starts the tour; every step focuses its title and highlights a control',seen.length>=5&&seen.every(s=>s.focus==='guide-title'&&s.target),JSON.stringify(seen));
 await pause(500);const done=await run("current.guide");step('Finished tour is saved for this person',done.offered&&done.done.length===5,JSON.stringify(done));
 await run("document.querySelector('[data-tab-button=knowledge]').click()");await pause(300);
 await run("document.querySelector('.guide-help[data-guide=knowledge]').focus()");await key('Return');
 const open=await run("!!document.getElementById('guide-panel')");await key('Escape');
 step('? opens the screen guide; Escape skips and returns focus',open&&await run("!document.getElementById('guide-panel')&&document.activeElement?.dataset?.guide==='knowledge'"));
 await signOut();step('Signed out: no offer and no ? controls',await run("!document.getElementById('guide-offer')&&[...document.querySelectorAll('.guide-help')].every(b=>b.hidden)"));
 await signIn('Maya');step('Another person gets their own offer',await run("!!document.getElementById('guide-offer')"));
 await run("[...document.querySelectorAll('#guide-offer button')].find(b=>b.textContent==='Skip').click()");await pause(800);
 step('Skip hides the offer and is remembered',await run("!document.getElementById('guide-offer')&&current.guide.offered===true"));
 await signOut();await signIn('Emma');step('Emma keeps her progress after switching people',await run("current.guide.done.length===5"));
 await run("window.confirm=()=>true;document.querySelector('[data-tab-button=learn]').click()");await pause(400);
 await run("[...document.querySelectorAll('button')].find(b=>b.textContent==='Delete my local learning history').click()");await pause(1000);
 step('Deleting her local learning history clears her guide progress',await run("current.guide.offered===false&&current.guide.done.length===0"));
 // Every step for every role points at its real, visible control; Skip works at every step.
 for(const who of ['Emma','Maya','Alex']){
  await signOut();await signIn(who);
  await run("document.getElementById('guide-offer')?.querySelector('button')?.click()");await pause(600);
  for(const screen of ['review','work','knowledge','learn','setup']){
   const total=await run(`guideSteps('${screen}').length`);
   const checks=[];
   for(let i=0;i<total;i++){
    await run(`document.querySelector('[data-tab-button=${screen==='work'?'review':screen}]').click();document.querySelector('.guide-help[data-guide=${screen}]').click()`);await pause(400);
    for(let j=0;j<i;j++){await run("[...document.querySelectorAll('#guide-panel button')].find(b=>b.textContent==='Next').click()");await pause(350);}
    checks.push(await run(`(()=>{const step=guideRun.steps[${i}];const want=guideTarget(step);const got=document.querySelector('.guide-target');return {title:step.title,real:!!want&&want===got,visible:!!got&&got.getClientRects().length>0}})()`));
    await run("[...document.querySelectorAll('#guide-panel button')].find(b=>b.textContent==='Skip tour').click()");await pause(400);
    checks.at(-1).skipped=await run("!document.getElementById('guide-panel')&&!document.querySelector('.guide-target')");
   }
   step(`${who} · ${screen}: ${total} steps on real visible controls, Skip works at each`,total>=2&&total<=3&&checks.every(c=>c.real&&c.visible&&c.skipped),JSON.stringify(checks));
  }
 }
 step('No renderer errors',errors.length===0,JSON.stringify(errors));
}catch(e){step('Run completed',false,e.stack);}
for(const s of log)console.log(`${s.ok?'ok  ':'FAIL'} ${s.name}${s.ok?'':` — ${s.detail}`}`);const passed=log.filter(s=>s.ok).length;console.log(`${passed}/${log.length} pass`);
fs.rmSync(profile,{recursive:true,force:true});app.exit(passed===log.length?0:1);});
