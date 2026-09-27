let intakeCloudBrowser = {};
function renderIntakeOptions(section) {
 const drop = node('div',undefined,'intake-drop');drop.tabIndex=0;drop.setAttribute('role','button');drop.setAttribute('aria-label','Drop company files here or press Enter to choose files');
 drop.append(node('strong','Drop company files here'),node('p','Drag files from your Desktop or Finder. Local extraction starts after import; nothing is sent to Nebius automatically.'));
 const choose=async()=>{current=await window.desktop.uploadOnboarding();render();};
 drop.addEventListener('click',()=>choose().catch(e=>{el('workspace-feedback').textContent=e.message;}));
 drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose().catch(e=>{el('workspace-feedback').textContent=e.message;});}});
 drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-active');e.dataTransfer.dropEffect='copy';});
 drop.addEventListener('dragleave',()=>drop.classList.remove('drag-active'));
 drop.addEventListener('drop',async e=>{e.preventDefault();drop.classList.remove('drag-active');if(onboardingWorking)return;onboardingWorking=true;try{current=await window.desktop.dropOnboarding(Array.from(e.dataTransfer.files));render();}catch(error){el('workspace-feedback').textContent=error.message;}finally{onboardingWorking=false;}});
 section.append(drop);
 onboardingButton(section,'Choose synced Drive / OneDrive files',async()=>{current=await window.desktop.syncedOnboarding();render();});
 const links=node('details',undefined,'intake-option');links.append(node('summary','Import from links'));
 links.append(node('p','Paste HTTPS file or public webpage links, one per line. Private cloud links need a cloud connection or an exported/synced file. Imports join the local review; URL access does not grant AI permission.'));
 const input=node('textarea');input.rows=3;input.setAttribute('aria-label','Company document HTTPS links');input.placeholder='https://…';links.append(input);
 onboardingButton(links,'Import links',async()=>{const urls=input.value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);el('workspace-feedback').textContent='Downloading selected links…';current=await window.desktop.linkOnboarding(urls);render();});section.append(links);
 for(const connection of current.cloud||[]){
  const host=node('details',undefined,'intake-option');host.append(node('summary',`${connection.label} · ${connection.connected?'Connected':connection.configured?'Ready to connect':'Client setup needed'}`));
  host.append(node('p','Connect in your browser with read access. Browse folders and select files to import; connecting does not copy your whole drive or send anything to Nebius.'));
  if(!connection.configured){
   host.append(node('p',connection.provider==='google'?'Register a Google OAuth Desktop app with Drive API enabled. Drive read access may require Google verification.':'Register a Microsoft public desktop app. Add http://localhost/oauth/callback as a Mobile and desktop redirect and delegated Files.Read.'));
   const client=onboardingField(host,'OAuth client ID');let secret=null;if(connection.provider==='google')secret=onboardingField(host,'Desktop client secret, if provided by Google','','password');
   onboardingButton(host,'Save client configuration',async()=>{current=await window.desktop.cloudConfigure(connection.provider,client.value,secret?.value||'');render();});
   const guide=node('button','Open registration guide','secondary-button');guide.type='button';guide.addEventListener('click',()=>window.desktop.openWeb(connection.provider==='google'?'https://developers.google.com/identity/protocols/oauth2/native-app':'https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app'));host.append(guide);
  }
  if(!connection.connected){
   let cancel;
   const connect=onboardingButton(host,`Connect ${connection.label}`,async()=>{cancel.disabled=false;el('workspace-feedback').textContent='Complete cloud sign-in in your browser, or cancel below.';try{current=await window.desktop.cloudConnect(connection.provider);render();}finally{cancel.disabled=true;}});connect.disabled=!connection.configured;
   cancel=node('button','Cancel cloud sign-in','secondary-button');cancel.type='button';cancel.disabled=true;cancel.addEventListener('click',()=>window.desktop.cloudCancel());host.append(cancel);
  }else{
   const state=intakeCloudBrowser[connection.provider]||(intakeCloudBrowser[connection.provider]={folder:'root',trail:[],items:[],cursor:'',selected:new Set()});
   const load=async(folder,cursor='',append=false)=>{const result=await window.desktop.cloudList(connection.provider,folder,cursor);state.folder=folder;state.items=append?[...state.items,...result.items]:result.items;state.cursor=result.cursor;render();};
   onboardingButton(host,'Browse files',()=>load(state.folder));
   if(state.trail.length)onboardingButton(host,'Back to parent folder',async()=>{const previous=state.trail.pop();await load(previous);});
   const list=node('div',undefined,'cloud-file-list');
   for(const item of state.items){
    if(item.folder){onboardingButton(list,`Open folder: ${item.name}`,async()=>{state.trail.push(state.folder);await load(item.id);});}
    else {const label=node('label',`${item.name}${item.size?` · ${(item.size/1024).toFixed(0)} KB`:''}`);const check=node('input');check.type='checkbox';check.checked=state.selected.has(item.id);check.addEventListener('change',()=>{if(check.checked)state.selected.add(item.id);else state.selected.delete(item.id);});label.prepend(check);list.append(label);}
   }
   host.append(list);if(state.cursor)onboardingButton(host,'More files',()=>load(state.folder,state.cursor,true));
   onboardingButton(host,'Import selected cloud files',async()=>{el('workspace-feedback').textContent='Downloading selected cloud files…';current=await window.desktop.cloudImport(connection.provider,[...state.selected]);state.selected.clear();render();});
   onboardingButton(host,'Disconnect',async()=>{current=await window.desktop.cloudDisconnect(connection.provider);delete intakeCloudBrowser[connection.provider];render();});
   host.append(node('p','Disconnect removes local access. You can revoke Averill permissions in your Google/Microsoft account. Access tokens expire; reconnect when needed.'));
  }
  section.append(host);
 }
 const privacyHost=node('details',undefined,'intake-option');privacyHost.append(node('summary',`Company confidentiality · ${current.privacy?.companyAI?'AI permitted for selected files':'Local processing only'}`));
 privacyHost.append(node('p','Files stay local by default. Restricted documents cannot be sent to Nebius. Cloud imports, staff accounts and source approval are separate from permission to use external AI.'));
 privacyHost.append(node('p','Before allowing company AI, verify your Nebius agreement, confidentiality obligations, retention/region and no-training/opt-out settings. Averill cannot verify those settings or create an NDA. Local document copies use OS file permissions, not application encryption.'));
 const policy=node('label','I have verified the provider terms/settings and authorize selected company content to be processed by Nebius');const enabled=node('input');enabled.type='checkbox';enabled.checked=current.privacy?.companyAI===true;policy.prepend(enabled);privacyHost.append(policy);
 onboardingButton(privacyHost,'Save company AI policy',async()=>{current=await window.desktop.companyPrivacy(enabled.checked);render();});
 const terms=node('button','Read Nebius data terms','secondary-button');terms.type='button';terms.addEventListener('click',()=>window.desktop.openWeb('https://docs.tokenfactory.nebius.com/legal/terms-of-service'));privacyHost.append(terms);section.append(privacyHost);
}
