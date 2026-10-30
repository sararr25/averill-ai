// Actual startup/main/renderer IPC on a disposable synthetic profile. Only model discovery precedes consent.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=process.env.AVERILL_NATIVE_APP||path.resolve(__dirname,'..');
if(!process.versions.electron){
 const {spawnSync}=require('node:child_process');const profile=fs.mkdtempSync(path.join(os.tmpdir(),'averill-auto-connect-'));
 try {for(const phase of ['first','restart']){const child=spawnSync(require('electron'),[__filename],{env:{...process.env,AVERILL_AUTO_PROFILE:profile,AVERILL_AUTO_PHASE:phase},stdio:'inherit'});if(child.status!==0){process.exitCode=child.status||1;break;}}}finally{fs.rmSync(profile,{recursive:true,force:true});}
}else{
 const {app,BrowserWindow}=require('electron');const profile=process.env.AVERILL_AUTO_PROFILE;assert(path.basename(profile).startsWith('averill-auto-connect-'));assert.equal(path.dirname(profile),os.tmpdir());app.setPath('userData',profile);process.env.AVERILL_CONNECT_PORT='0';process.env.NEBIUS_API_KEY='synthetic-autoconnect';process.env.TAVILY_API_KEY='synthetic-autoconnect';process.env.NEBIUS_MODEL='';
 const workspace=require(path.join(ROOT,'src/workspace')),accounts=require(path.join(ROOT,'src/accounts'));const checks=[];let healthCalls=0,contentCalls=0,consented=false;
 global.fetch=async(url,options={})=>{
  if(String(url).endsWith('/models')){healthCalls++;assert.equal(options.body,undefined);return new Response(JSON.stringify({data:[{id:'nvidia/Nemotron-auto-test'}]}));}
  contentCalls++;assert(consented,'No content request before explicit consent');const request=JSON.parse(options.body),input=JSON.parse(request.messages.at(-1).content),s=input.sources[0];return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({answer:s.text,evidence:[{source_id:s.id,quote:s.text}]})}}]}));
 };
 (async()=>{try{
  if(process.env.AVERILL_AUTO_PHASE==='first'){
   const data=workspace.create(profile,'Synthetic auto connection','Synthetic owner');await accounts.configure(data,data.activePersonId,'owner@synthetic.example','Synthetic-password-123','owner');data.privacy={companyAI:false};
   const file=path.join(profile,'synthetic-policy.md');fs.writeFileSync(file,'Our campaign covers Copenhagen, Vienna and Prague.');const s=workspace.importFile(profile,data,file,{department:'Marketing',version:'1'});workspace.updateSource(data,s.id,'approved');s.aiAllowed=true;workspace.save(profile,data);
  }
  require(path.join(ROOT,'main.js'));await app.whenReady();let win;const pause=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<100;i++){win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(60);}
  const run=js=>win.webContents.executeJavaScript(js);await run("window.desktop.login('owner@synthetic.example','Synthetic-password-123')");let state=await run('window.desktop.snapshot()');assert.equal(state.services.connection.status,'connected');assert.equal(healthCalls,1);assert.equal(contentCalls,0);checks.push('Automatic key-only discovery on startup; zero content requests');
  await run("(async()=>{current=await window.desktop.snapshot();render();showTab('review');})()");assert(await run("document.getElementById('ai-toggle').hidden"));assert.match(await run("document.getElementById('ai-status').textContent"),/connected/);checks.push('Connected status replaces the off/on toggle');
  if(process.env.AVERILL_AUTO_PHASE==='first'){
   assert.equal(state.privacy.companyAI,false);assert.equal(state.aiEnabled,false);await run('window.desktop.aiMode(true)');state=await run('window.desktop.snapshot()');assert.equal(state.privacy.companyAI,false);assert.equal(state.services.connection.status,'connected');assert.equal(contentCalls,0);checks.push('Old reconnect IPC does not throw Company AI off or alter permission');
   await run('window.desktop.companyPrivacy(true)');state=await run('window.desktop.snapshot()');assert.equal(state.aiEnabled,true);const preview=await run("window.desktop.ask('Which cities does our campaign cover?')");assert(preview.consentRequired);assert.equal(contentCalls,0);consented=true;const answer=await run("window.desktop.ask('Which cities does our campaign cover?',true)");assert.equal(answer.mode,'model');checks.push('Company answering previews exact content before its first model call');
  }else{assert.equal(state.aiEnabled,true);checks.push('Restart restores permitted company mode without an enable click');assert.equal(contentCalls,0);}
  assert.equal((await run('window.desktop.snapshot()')).externalObservation,null);checks.push('Startup does not enable observation or sharing');checks.forEach(c=>console.log('PASS '+c));console.log(`Automatic connection ${process.env.AVERILL_AUTO_PHASE}: ${checks.length} checks passed; health ${healthCalls}, content ${contentCalls}. Synthetic providers, not live acceptance.`);app.quit();
 }catch(error){console.error(error.stack);app.exit(1);}})();
}
