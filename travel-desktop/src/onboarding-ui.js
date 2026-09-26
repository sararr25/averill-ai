let onboardingReview = null;
let onboardingReceipt = null;
let onboardingWorking = false;
function onboardingField(parent, label, value, type = 'text') {
 const wrapper = node('label', label); const input = node('input');input.type=type;input.value=value || '';
 if(type==='email') input.autocomplete='off';
 wrapper.append(input);parent.append(wrapper);return input;
}
function onboardingButton(parent,label,callback) {
 const button=node('button',label,'secondary-button');button.type='button';button.disabled=onboardingWorking;
 button.addEventListener('click',async()=>{
  if(onboardingWorking) return;onboardingWorking=true;button.disabled=true;
  el('workspace-feedback').textContent='';
  for (const control of document.querySelectorAll('.onboarding-section button')) control.disabled=true;
  try{await callback();}catch(error){el('workspace-feedback').textContent=error.message;}
  finally{onboardingWorking=false;button.disabled=false;for (const control of document.querySelectorAll('.onboarding-section button')) control.disabled=false;}
 });parent.append(button);return button;
}
function showAccountReceipt(accounts) {
 onboardingReceipt=accounts;
 const host=el('account-receipt');host.replaceChildren();
 host.append(node('h3','Team account access'),node('p','Save these temporary passwords now. They are shown once; only password hashes are stored. Share them yourself. No invitation emails have been sent.'));
 for(const account of accounts) {
  const row=node('div',undefined,'account-credential');row.append(node('strong',account.name||account.profile),node('code',account.email),node('code',account.password));host.append(row);
 }
 const copy=node('button','Copy account access','secondary-button');copy.type='button';copy.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(accounts.map(a=>`${a.name || a.profile}\n${a.email}\n${a.password}`).join('\n\n'));copy.textContent='Copied';}catch{copy.textContent='Select and copy the credentials above';}
 });host.append(copy);
}
function renderOnboarding(panel) {
 const active=current.workspace.people?.find(p=>p.id===current.workspace.activePersonId);
 if(active?.role!=='admin') return;
 const section=node('section',undefined,'onboarding-section');section.append(node('h3','Bring your company into Averill'),node('p','Upload existing files once. Review the people and company knowledge, then create your team accounts together.'));
 onboardingButton(section,'Add company files',async()=>{
  if(current.onboarding&&!current.onboarding.applied&&!window.confirm('Replace the current onboarding proposal with a new file selection?')) return;
  current=await window.desktop.uploadOnboarding();render();
 });
 section.append(node('p','Excel .xlsx, CSV, PDF, SVG, text and images · up to 30 files. Legacy .xls needs an XLSX/CSV export.'));
 const draft=current.onboarding;
 if(!draft){panel.append(section);return;}
 if(draft.applied){section.append(node('p','Onboarding completed. Your team and sources are saved. Add another batch whenever company material changes.'));panel.append(section);return;}
 if(!onboardingReview||onboardingReview.batchId!==draft.id) onboardingReview={batchId:draft.id,useCompany:false,people:structuredClone(draft.people),documents:draft.files.map(f=>({id:f.id,included:f.included,scope:f.scope,department:f.department,version:f.version,approve:false}))};
 // Keep edited proposals through re-renders and include new Nebius suggestions.
 for(const person of draft.people) if(!onboardingReview.people.some(p=>p.id===person.id)) onboardingReview.people.push(structuredClone(person));
 for(const file of draft.files) {
  const document=onboardingReview.documents.find(d=>d.id===file.id);
  if(document && !document.edited) Object.assign(document,{scope:file.scope,department:file.department,version:file.version});
 }
 section.append(node('p',`${draft.people.filter(p=>p.included).length} people ready to review · ${draft.files.length} files`));
 section.append(node('p',draft.mode==='nebius'?`Interpreted with Nebius · ${draft.model}`:'Readable staff tables were extracted locally. Use Nebius for company context and less structured documents.'));
 for(const warning of draft.warnings) section.append(node('p',warning,'onboarding-warning'));
 const files=node('details',undefined,'onboarding-files');files.append(node('summary',`${draft.files.length} uploaded files · inspect extracted text`));
 for(const file of draft.files){const detail=node('details');detail.append(node('summary',`${file.name} · ${file.readable?'Text ready':'Needs a readable export'}`),node('pre',file.preview||'No readable text'));files.append(detail);}
 section.append(files);
 const analyze=onboardingButton(section,'Interpret with Nebius',async()=>{
  if(!current.services?.nebius){el('workspace-feedback').textContent='Add the Nebius key under Service keys, then retry. Your proposal is kept.';return;}
  const selected=draft.files.filter(f=>f.readable);
  const chars=Math.min(60000,selected.reduce((total,f)=>total+f.sentCharacters,0));
  if(!window.confirm(`Send extracted text from these files to Nebius for company/personnel interpretation?\n\n${selected.map(f=>f.name).join('\n')}\n\nUp to ${chars.toLocaleString()} characters. Personnel names and email addresses may be included. Passwords, keys and file binaries are not sent.`))return;
  el('workspace-feedback').textContent='Nebius is reading the company files. Your local proposal is kept…';
  current=await window.desktop.analyzeOnboarding(true);el('workspace-feedback').textContent='Proposal ready. Review all assignments before confirming.';render();
 });analyze.disabled=onboardingWorking;
 if(draft.company){
  const label=node('label',`Use company name and context: ${draft.company.name}`);const checkbox=node('input');checkbox.type='checkbox';checkbox.checked=onboardingReview.useCompany;checkbox.addEventListener('change',()=>{onboardingReview.useCompany=checkbox.checked;});label.prepend(checkbox);section.append(label,node('p',draft.company.description));
 }
 section.append(node('h3',`People to add · ${onboardingReview.people.filter(p=>p.included).length}`));
 if(!draft.people.length)section.append(node('p','No staff rows detected. Try Nebius for a PDF or export a table with Name, Email, Job title and Department columns.'));
 for(const p of onboardingReview.people){
  const row=node('fieldset',undefined,'onboarding-person');row.append(node('legend',p.name||'Proposed person'));
  const includeLabel=node('label','Create this account');const include=node('input');include.type='checkbox';include.checked=p.included;include.addEventListener('change',()=>{p.included=include.checked;});includeLabel.prepend(include);row.append(includeLabel);
  const name=onboardingField(row,'Name',p.name);name.addEventListener('input',()=>{p.name=name.value;});
  const email=onboardingField(row,'Email',p.email,'email');email.addEventListener('input',()=>{p.email=email.value;});
  const department=onboardingField(row,'Department',p.department);department.addEventListener('input',()=>{p.department=department.value;});
  const label=node('label','Account profile');const profile=node('select');
  for(const [value,text] of [['marketing_manager','Marketing manager'],['marketing_strategy','Marketing strategy employee'],['content_creator','Content creator'],['employee','Employee']]){const option=node('option',text);option.value=value;profile.append(option);}profile.value=p.profile;profile.addEventListener('change',()=>{p.profile=profile.value;});label.append(profile);row.append(label);
  const source=draft.files.find(f=>f.id===p.sourceId);row.append(node('small',`Extracted from ${source?.name||'uploaded file'}`),node('blockquote',p.evidence));
  if(p.needsReview)row.append(node('p','Check this assignment. Imported records cannot create an owner/admin.','onboarding-warning'));
  const detail=node('details',undefined,'onboarding-edit');detail.append(node('summary',`${p.name} · ${p.email} · ${p.department} · ${p.profile.replaceAll('_',' ')}`),row);if(p.needsReview)detail.open=true;section.append(detail);
 }
 section.append(node('h3','Company knowledge'));
 const approveAllLabel=node('label','I have reviewed the knowledge files: approve the readable company/department sources');const approveAll=node('input');approveAll.type='checkbox';
 approveAll.addEventListener('change',()=>{for(const d of onboardingReview.documents){const file=draft.files.find(f=>f.id===d.id);if(file.readable&&file.category!=='personnel'&&file.category!=='archive'&&d.scope!=='private'&&!draft.people.some(p=>p.sourceId===file.id)){d.approve=approveAll.checked;d.edited=true;}}render();});
 approveAll.checked=onboardingReview.documents.filter(d=>{const f=draft.files.find(f=>f.id===d.id);return f.readable&&f.category!=='personnel'&&f.category!=='archive'&&d.scope!=='private';}).every(d=>d.approve);approveAllLabel.prepend(approveAll);section.append(approveAllLabel);
 for(const d of onboardingReview.documents){
  const file=draft.files.find(f=>f.id===d.id);const row=node('fieldset',undefined,'onboarding-document');row.append(node('legend',file.name));
  const includeLabel=node('label','Keep this file');const include=node('input');include.type='checkbox';include.checked=d.included;include.addEventListener('change',()=>{d.included=include.checked;d.edited=true;});includeLabel.prepend(include);row.append(includeLabel);
  const personnel=file.category==='personnel'||draft.people.some(p=>p.sourceId===file.id);
  if(personnel)row.append(node('p','Personnel record · private to the administrator. It will not become employee knowledge.'));
  else{
   const label=node('label','Who can use this source?');const scope=node('select');
   for(const [value,text] of [['company','Everyone in the company'],['department','Selected department'],['private','Only me']]){const option=node('option',text);option.value=value;scope.append(option);}scope.value=d.scope;scope.addEventListener('change',()=>{d.scope=scope.value;d.edited=true;});label.append(scope);row.append(label);
   const department=onboardingField(row,'Department (for department sources)',d.department);department.addEventListener('input',()=>{d.department=department.value;d.edited=true;});
   const approveLabel=node('label','I have reviewed this source: approve it for use');const approve=node('input');approve.type='checkbox';approve.checked=d.approve;approve.disabled=!file.readable||file.category==='archive';approve.addEventListener('change',()=>{d.approve=approve.checked;d.edited=true;});approveLabel.prepend(approve);row.append(approveLabel);
  }
  const version=onboardingField(row,'Source version',d.version);version.addEventListener('input',()=>{d.version=version.value;d.edited=true;});
  if(file.category==='archive')row.append(node('p','Archived/superseded material is retained without approval.'));
  const detail=node('details',undefined,'onboarding-edit');detail.append(node('summary',`${file.name} · ${personnel?'Private personnel record':d.scope==='company'?'Company-wide':d.department} · v${d.version}`),row);section.append(detail);
 }
 onboardingButton(section,'Confirm company onboarding',async()=>{
  if(!current.auth?.enabled){el('workspace-feedback').textContent='Create your owner login first, then confirm this batch.';return;}
  const result=await window.desktop.applyOnboarding(onboardingReview);current=result.snapshot;onboardingReview=null;render();
  if(result.receipt.length)showAccountReceipt(result.receipt);
  el('workspace-feedback').textContent=`Added ${result.peopleAdded} accounts and ${result.documentsAdded} sources.${result.duplicates.length?` Existing accounts skipped: ${result.duplicates.join(', ')}.`:''}`;
 });
 panel.append(section);
}
function renderAccountAccess(panel){
 const data=current.workspace;
 const active=data.people?.find(p=>p.id===data.activePersonId);
 if(active?.role!=='admin')return;
 const host=node('section',undefined,'account-management');host.append(node('h3','Account access'));
 if(!current.auth?.enabled){
  host.append(node('p','Create the owner login to replace the legacy role switcher. Existing people, documents and learning are preserved.'));
  const form=node('form',undefined,'workspace-form');const email=onboardingField(form,'Owner email','','email');email.required=true;const password=onboardingField(form,'Owner password','','password');password.required=true;password.minLength=10;password.autocomplete='new-password';
  const submit=node('button','Enable owner login','secondary-button');submit.type='submit';form.append(submit);
  form.addEventListener('submit',async e=>{e.preventDefault();submit.disabled=true;try{current=await window.desktop.enableAccounts(email.value,password.value);password.value='';render();}catch(error){el('workspace-feedback').textContent=error.message;}finally{submit.disabled=false;}});host.append(form);
 }else{
  host.append(node('p','People imported through onboarding receive separate accounts automatically. For an existing person, create access below.'));
  const available=data.people.filter(p=>!current.auth.accounts.some(a=>a.id===p.id));
  if(available.length){
   const form=node('form',undefined,'workspace-form');const label=node('label','Existing person');const select=node('select');for(const p of available){const option=node('option',`${p.name} · ${p.role}`);option.value=p.id;select.append(option);}label.append(select);form.append(label);
   const email=onboardingField(form,'Account email','','email');email.required=true;
   const profileLabel=node('label','Account profile');const profile=node('select');
   function options(){profile.replaceChildren();const p=available.find(p=>p.id===select.value);const choices=p.role==='admin'?[['owner','Owner / CEO / admin']]:p.role==='lead'?[['marketing_manager','Marketing manager']]:[['marketing_strategy','Marketing strategy employee'],['content_creator','Content creator'],['employee','Employee']];for(const [value,text]of choices){const option=node('option',text);option.value=value;profile.append(option);}}
   options();select.addEventListener('change',options);profileLabel.append(profile);form.append(profileLabel);
   const button=node('button','Create account access','secondary-button');button.type='submit';form.append(button);form.addEventListener('submit',async e=>{e.preventDefault();button.disabled=true;try{const result=await window.desktop.createAccount(select.value,email.value,profile.value);current=result.snapshot;render();showAccountReceipt([result.account]);}catch(error){el('workspace-feedback').textContent=error.message;}finally{button.disabled=false;}});host.append(form);
  }
 }
 panel.append(host);
}
function renderSession(){
 const locked=Boolean(current.auth?.enabled&&!current.auth.signedIn);
 document.body.classList.toggle('auth-locked',locked);
 const panel=el('login-panel');panel.hidden=!locked;
 const session=el('session-bar');session.replaceChildren();
 if(locked){
  el('learning-panel').replaceChildren(); el('workspace-panel').replaceChildren();
  onboardingReceipt=null;el('account-receipt').replaceChildren();
  el('login-company').textContent=current.workspace?.company||'Your company';
  const accounts=el('login-account');const old=accounts.value;accounts.replaceChildren();
  const placeholder=node('option','Choose an account or enter your email');placeholder.value='';accounts.append(placeholder);
  for(const person of current.auth.accounts){const option=node('option',`${person.name} · ${person.jobTitle}`);option.value=person.email;accounts.append(option);}accounts.value=old;
  return false;
 }
 if(current.auth?.signedIn&&current.auth.person){
  const person=current.auth.person;session.append(node('strong',person.name),node('span',`${person.jobTitle}${person.department?` · ${person.department}`:''}`));
  const logout=node('button','Sign out','secondary-button');logout.type='button';logout.addEventListener('click',async()=>{try{current=await window.desktop.logout();el('conversation').replaceChildren(node('div','Ask about this campaign or an approved source.','assistant-message'));el('company-draft').value='';el('draft-result').replaceChildren();el('external-result').replaceChildren();el('question').value='';el('source-dialog').close();el('source-content').textContent='';onboardingReview=null;render();}catch(error){el('workspace-feedback').textContent=error.message;}});session.append(logout);
 }
 return true;
}
