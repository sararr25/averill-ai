// Judge demo AI path end to end: a flawed LinkedIn draft arrives through the browser bridge, Check approved rules asks
// for consent naming the demo server, and the result shows local findings plus Nemotron or an explicit notice.
// Default: unreachable server (no cost, outage path). LIVE=1: the real averill-judge-ai server (spends a few tokens).
const live = process.env.LIVE === '1';
if (!live) process.env.AVERILL_JUDGE_SERVER = 'https://127.0.0.1:9';
// A dev machine's .env.local keys must not change what a judge without keys sees (dotenv never overrides a variable that is already set).
process.env.NEBIUS_API_KEY = ''; process.env.TAVILY_API_KEY = '';
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
 // T1.3: the question box. Design questions stay local (no dialog); other questions need the same consent, then show Nemotron or an explicit notice next to the local answer.
 const ask=async q=>{await run(`(()=>{const i=document.getElementById('question');i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input'));document.getElementById('ask-form').requestSubmit();})()`);await pause(700);};
 const dialog=()=>run("({open:document.getElementById('outbound-dialog').open,service:document.getElementById('outbound-service').textContent,items:[...document.querySelectorAll('#outbound-items li')].map(l=>l.textContent)})");
 const bubbles=()=>run("[...document.querySelectorAll('#conversation .assistant-message')].map(m=>({chip:m.querySelector('.ai-chip,.knowledge-meta')?.textContent||'',text:m.querySelector('p')?.textContent||''}))");
 const settled=async()=>{for(let i=0;i<60;i++){await pause(500);if(!await run("document.getElementById('answer-status').textContent")&&!await run("document.getElementById('outbound-dialog').open")&&(await bubbles()).length)break;}};
 await ask('Which font should headlines use?');await settled();
 const design=await dialog();step('Design question is answered locally without any consent dialog',!design.open&&(await bubbles()).some(b=>/Approved design rules|No approved rule covers/.test(b.text)),JSON.stringify(design));
 const before=(await bubbles()).length;
 await ask('Can we claim lowest prices guaranteed?');
 const askConsent=await dialog();
 step('Question box asks for the same consent naming the demo server',askConsent.open&&askConsent.service==='SENT TO AVERILL DEMO SERVER'&&askConsent.items.length===2&&/lowest prices guaranteed/.test(askConsent.items[0]),JSON.stringify(askConsent));
 await run("document.getElementById('outbound-cancel').click()");await settled();
 let all=await bubbles();
 step('Cancelling sends nothing and shows the local answer labelled as such',all.length===before+2&&all.slice(before).some(b=>b.chip==='Nemotron not asked')&&all.at(-1).chip==='Local approved-source answer'&&/Matching passage/.test(all.at(-1).text),JSON.stringify(all.slice(before)));
 const mid=all.length;
 await ask('Can we claim lowest prices guaranteed?');await run("document.getElementById('outbound-send').click()");await settled();
 all=(await bubbles()).slice(mid);
 if(live)step('Question answered by Nemotron through the demo server, or its limit shown verbatim, next to the local answer',(all.some(b=>/^Nemotron suggestion/.test(b.chip))||all.some(b=>/Daily AI limit reached/.test(b.text)))&&all.at(-1).chip==='Local approved-source answer',JSON.stringify(all));
 else step('Outage is stated explicitly next to the local answer',all.length===2&&all[0].chip==='Nemotron unavailable'&&all[0].text==='The demo AI server could not be reached. The local approved-source answer below still applies.'&&all[1].chip==='Local approved-source answer'&&/Matching passage/.test(all[1].text),JSON.stringify(all));
 const pill=await run("({pill:document.getElementById('ai-status').textContent,hidden:document.getElementById('ai-toggle').hidden,note:document.getElementById('ai-connection-note').textContent})");
 step('Demo Nemotron is available automatically without an enable toggle',pill.pill==='Nemotron · available via demo'&&pill.hidden&&/automatically/.test(pill.note),JSON.stringify(pill));
 step('No renderer errors',errors.length===0,JSON.stringify(errors));
}catch(e){step('Run completed',false,e.stack);}
for(const s of log)console.log(`${s.ok?'ok  ':'FAIL'} ${s.name}${s.ok?'':` — ${s.detail}`}`);const passed=log.filter(s=>s.ok).length;console.log(`${passed}/${log.length} pass (${live?'live server':'unreachable server'})`);
fs.rmSync(profile,{recursive:true,force:true});app.exit(passed===log.length?0:1);});
