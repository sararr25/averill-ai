// Judge demo AI path end to end: a flawed LinkedIn draft arrives through the browser bridge, Check approved rules asks
// for consent naming the demo server, and the result shows local findings plus Nemotron or an explicit notice.
// Default: unreachable server (no cost, outage path). LIVE=1: the real averill-judge-ai server (spends a few tokens).
const live = process.env.LIVE === '1';
if (!live) process.env.AVERILL_JUDGE_SERVER = 'https://127.0.0.1:9';
const {app,BrowserWindow}=require('electron');const fs=require('node:fs'),path=require('node:path');
const APP=path.resolve(__dirname,'..'); // run: npm run verify:demo-ai  (LIVE=1 npm run verify:demo-ai)
const profile=fs.mkdtempSync('/tmp/averill-demo-ai-');app.setPath('userData',profile);const errors=[];
app.on('web-contents-created',(e,wc)=>wc.on('console-message',(ev,l,m)=>{if(l>=3)errors.push(m)}));
require(APP+'/main.js');const pause=ms=>new Promise(r=>setTimeout(r,ms));const log=[];const step=(name,ok,detail='')=>log.push({name,ok,detail});
const draft=require(path.join(APP,'..','demo-tools','social-simulator','src','data','flawed-drafts.json')).social.find(p=>p.platform==='linkedin').text;
app.whenReady().then(async()=>{try{
 let agent;for(let i=0;i<100;i++){agent=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(agent&&!agent.webContents.isLoading()&&await agent.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=s=>agent.webContents.executeJavaScript(s);agent.setSize(520,850);
 await run("[...document.querySelectorAll('button')].find(b=>/Try the demo/.test(b.textContent)).click()");await pause(2500);
 await run("document.getElementById('guide-offer')?.querySelector('button')?.click()");await pause(400);
 const pair=await run('window.desktop.pairBrowser()');
 const sent=await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'c'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:9,pageOrigin:'https://averill-demo-sim.vercel.app',kind:'field',sequence:1,reason:'pause',field:{kind:'textarea',label:'Post text',value:draft}})});
 step('Flawed LinkedIn draft arrives through the browser bridge',sent.status===200,String(sent.status));await pause(600);
 await run("const t=document.getElementById('external-task');t.value='linkedin';t.dispatchEvent(new Event('change'))");await pause(300);
 await run("document.getElementById('external-task-review').click()");await pause(600);
 const consent=await run("({open:document.getElementById('outbound-dialog').open,service:document.getElementById('outbound-service').textContent,note:document.getElementById('outbound-note').textContent})");
 step('Consent names the demo server before anything is sent',consent.open&&consent.service==='SENT TO AVERILL DEMO SERVER'&&consent.note.includes('averill-judge-ai.vercel.app'),JSON.stringify(consent));
 await run("document.getElementById('outbound-send').click()");
 let res;for(let i=0;i<60;i++){await pause(1000);res=await run("(()=>{const o=document.getElementById('review-work-result');return {notice:o.querySelector('.ai-notice')?.textContent||'',scope:o.querySelector('.check-scope')?.textContent||'',cards:[...o.querySelectorAll('.review-evidence')].map(c=>({type:c.dataset.findingType,ai:!!c.querySelector('.ai-chip')}))}})()");if(res.scope)break;}
 step('Local approved-rules findings are shown',res.cards.filter(c=>c.type==='forbidden-claim'||c.type==='missing-required-text').length===2,JSON.stringify(res.cards));
 if(live)step('Nemotron answered through the demo server, or its limit is shown verbatim',/via Averill demo server/.test(res.scope)&&res.cards.some(c=>c.ai)||/Daily AI limit reached/.test(res.notice),JSON.stringify(res));
 else step('Outage is stated explicitly next to the local findings',res.notice==='The demo AI server could not be reached. The approved-rules check above still applies.'&&/Local rule check/.test(res.scope),JSON.stringify(res));
 step('No renderer errors',errors.length===0,JSON.stringify(errors));
}catch(e){step('Run completed',false,e.stack);}
for(const s of log)console.log(`${s.ok?'ok  ':'FAIL'} ${s.name}${s.ok?'':` — ${s.detail}`}`);const passed=log.filter(s=>s.ok).length;console.log(`${passed}/${log.length} pass (${live?'live server':'unreachable server'})`);
fs.rmSync(profile,{recursive:true,force:true});app.exit(passed===log.length?0:1);});
