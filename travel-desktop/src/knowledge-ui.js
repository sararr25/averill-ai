let knowledgeRequest=0;
let knowledgeRenderKey=null;
function knowledgeExcerpt(text,query){
 const preview=node('p',undefined,'knowledge-preview');
 const value=(text||'No text could be extracted. Open the original file or upload a readable export.').replace(/^#{1,6}\s+/gm,'').replace(/`([^`]+)`/g,'$1');
 const term=String(query||'').trim();const match=term?value.toLowerCase().indexOf(term.toLowerCase()):-1;
 if(match<0){preview.textContent=value;return preview;}
 preview.append(document.createTextNode(value.slice(0,match)),node('mark',value.slice(match,match+term.length)),document.createTextNode(value.slice(match+term.length)));
 return preview;
}
async function renderKnowledge(){
 const host=el('knowledge-list'),summary=el('knowledge-summary'),requests=el('knowledge-requests');
 if(!current.workspace?.configured||current.auth?.enabled&&!current.auth.signedIn){knowledgeRequest++;knowledgeRenderKey=null;host.replaceChildren();requests.replaceChildren();summary.textContent='';return;}
 const renderKey=JSON.stringify([current.workspace?.activePersonId,current.workspace?.sources,current.workspace?.clarifications,current.onboarding,el('knowledge-search').value,el('knowledge-filter').value,el('knowledge-department').value,el('knowledge-kind').value,el('knowledge-conflicts').checked]);
 if(renderKey===knowledgeRenderKey)return;knowledgeRenderKey=renderKey;
 const request=++knowledgeRequest;
 requests.replaceChildren();const clarifications=current.workspace.clarifications||[];
 if(clarifications.length){requests.append(node('h3',`Private clarification requests · ${clarifications.filter(item=>item.status==='pending').length} pending`));
  const active=current.workspace.people.find(person=>person.id===current.workspace.activePersonId);
  for(const item of clarifications){const card=node('article',undefined,'knowledge-card');card.append(node('strong',`${item.status==='pending'?'Awaiting review':'Answered'} · ${item.department}`),node('p',item.question));
   if(item.reply)card.append(node('p',item.reply,'learning-feedback'));
   if(item.sourceId&&current.workspace.sources.some(source=>source.id===item.sourceId&&source.status==='approved'))card.append(sourceButton({id:item.sourceId,title:current.workspace.sources.find(source=>source.id===item.sourceId).title,kind:'workspace'}));
   if(item.status==='pending'&&(active.role==='admin'||active.role==='lead'&&active.department===item.department)){
    const form=node('form',undefined,'workspace-form');const label=node('label','Private response or reason evidence is still missing');const response=node('textarea');response.required=true;response.minLength=10;response.maxLength=1000;label.append(response);
    const sourceLabel=node('label','Optional approved source visible to requester');const source=node('select');source.append(new Option('No source yet',''));
    const blocked=new Set((current.workspace.conflicts||[]).flat());for(const candidate of current.workspace.sources.filter(candidate=>candidate.status==='approved'&&!blocked.has(candidate.id)&&(candidate.scope==='company'||candidate.department===item.department)))source.append(new Option(`${candidate.title} · v${candidate.version}`,candidate.id));sourceLabel.append(source);
    const send=node('button','Save private response','secondary-button');send.type='submit';form.append(label,sourceLabel,send);form.addEventListener('submit',async event=>{event.preventDefault();send.disabled=true;try{current=await window.desktop.resolveClarification(item.id,response.value,source.value||null);render();}catch(error){summary.textContent=error.message;send.disabled=false;}});card.append(form);
   }requests.append(card);
  }
 }
 summary.textContent='Loading company documents…';
 try{
  const department=el('knowledge-department');const selectedDepartment=department.value;
  department.replaceChildren(new Option('All departments','all'));
  for(const name of current.workspace.departments||[])department.append(new Option(name,name));
  department.append(new Option('Company-wide','Company'));department.value=[...department.options].some(option=>option.value===selectedDepartment)?selectedDepartment:'all';
  const result=await window.desktop.listKnowledge(el('knowledge-search').value,el('knowledge-filter').value,{department:department.value,kind:el('knowledge-kind').value,conflict:el('knowledge-conflicts').checked});
  if(request!==knowledgeRequest)return;
  summary.textContent=`${result.documents.length} shown of ${result.total} · ${result.uploaded} for review · ${result.approved} approved`;
  host.replaceChildren();
  if(!result.documents.length){host.append(node('p',result.total?'No documents match this search or status.':'No company documents yet. Add files in Setup; they appear here immediately for review.'));return;}
  for(const file of result.documents){
   const card=node('article',undefined,'knowledge-card');
   const status=node('strong',file.kind==='uploaded'?'Uploaded · review needed':file.scope==='private'?`Private · ${file.status}`:file.status==='approved'?`Approved ${file.scope==='company'?'company-wide':'department'} knowledge`:`${file.status} · not used for answers`,'knowledge-state');
   status.dataset.state=file.kind==='uploaded'?'uploaded':file.status;
   card.append(node('h3',file.name),status);
   card.append(node('p',`${file.kind==='uploaded'?'Upload proposal':file.scope==='company'?'Company-wide':file.scope==='private'?'Only you':file.department} · v${file.version||'1'} · ${file.readable?'Text extracted':'No readable text'} · ${file.confidentiality} · ${file.aiAllowed?'AI permission recorded':'Local only'}`,'knowledge-meta'));
   if(file.kind==='uploaded')card.append(node('p','This file has been received. Confirm the onboarding proposal in Setup to save it as a source; approval is a separate step.'));
   const metadata=node('details',undefined,'knowledge-details');metadata.append(node('summary','Approval details'));
   if(file.kind==='saved'){
    metadata.append(node('p',`Approved ${file.approvedAt?new Date(file.approvedAt).toLocaleString():'—'} · Approver ${file.approvedBy||'—'}${file.conflict?' · Conflict: excluded from answers':''}${file.supersedesId?' · Replaces an earlier source':''}${file.supersededBy?' · Replaced by a later source':''}`,'knowledge-meta'));
    if(file.latestDecision)metadata.append(node('p',`Latest decision: ${file.latestDecision.action} · ${file.latestDecision.reason} · ${new Date(file.latestDecision.at).toLocaleString()}`,'knowledge-decision'));
   }
   if(file.kind==='saved')card.append(metadata);
   card.append(knowledgeExcerpt(file.excerpt,el('knowledge-search').value));
   const read=node('button','Read extracted text','secondary-button');read.type='button';read.disabled=!file.readable;
   read.addEventListener('click',async()=>{read.disabled=true;try{const content=await(file.kind==='uploaded'?window.desktop.readOnboardingFile(file.id):window.desktop.readWorkspaceFile(file.id));activeSourceId=null;el('open-source').hidden=true;el('source-title').textContent=content.title;el('source-content').textContent=content.text||'No readable text.';el('source-dialog').showModal();}catch{}finally{read.disabled=!file.readable;}});card.append(read);
   if(file.kind==='saved'){
    const open=node('button','Open original file','secondary-button');open.type='button';open.addEventListener('click',()=>window.desktop.openWorkspaceSource(file.id).catch(()=>{}));card.append(open);
    if(file.canDelete){const remove=node('button','Delete local source copy','secondary-button');remove.type='button';remove.addEventListener('click',async()=>{if(!window.confirm(`Delete the local copy and extracted text of ${file.name}? The original outside Averill and system backups are not deleted.`))return;try{current=await window.desktop.removeSource(file.id);render();}catch(error){summary.textContent=error.message;}});card.append(remove);}
    if(file.status!=='approved'){const manage=node('button','Manage in Setup','secondary-button');manage.type='button';manage.addEventListener('click',()=>{showTab('setup');const target=[...document.querySelectorAll('[data-source-id]')].find(element=>element.dataset.sourceId===file.id);if(target){for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;target.scrollIntoView({block:'center'});target.tabIndex=-1;target.focus();}});card.append(manage);}
    const candidates=(current.workspace.sources||[]).filter(source=>source.id!==file.id&&source.status==='approved'&&source.scope===file.scope&&source.department===file.department);
    if(candidates.length){
      const label=node('label','Compare with an approved source');const select=node('select');select.append(new Option('Choose a document',''));
      for(const candidate of candidates)select.append(new Option(`${candidate.title} · v${candidate.version}`,candidate.id));label.append(select);card.append(label);
      const compare=node('button','Compare extracted versions','secondary-button');compare.type='button';compare.addEventListener('click',async()=>{if(!select.value)return;try{const diff=await window.desktop.compareSources(file.id,select.value);const lines=diff.changes.map(change=>`${change.type==='added'?'+':'−'} ${change.line}: ${change.text}`).join('\n');activeSourceId=null;el('open-source').hidden=true;el('source-title').textContent=`${diff.older.title} v${diff.older.version} → ${diff.newer.title} v${diff.newer.version}`;el('source-content').textContent=`${diff.method}\n${diff.truncated?'Comparison limited to first 250 lines per file and 200 changes.\n':''}\n${lines||'No line differences in the compared text.'}`;el('source-dialog').showModal();}catch(error){summary.textContent=error.message;}});card.append(compare);
      if(file.canReview&&['pending','clarification_requested'].includes(file.status))card.dataset.versionSelect='available';
    }
    if(file.canReview&&['pending','clarification_requested'].includes(file.status)){
      const decision=node('div',undefined,'knowledge-approval');const label=node('label','Decision reason (visible to the uploader and reviewers)');const reason=node('input');reason.type='text';reason.maxLength=500;reason.required=true;label.append(reason);decision.append(label);
      const previous=card.querySelector('select');
      for(const [value,text] of [['approved','Approve'],['rejected','Reject'],['clarification_requested','Ask for clarification']]){
       const button=node('button',text,'secondary-button');button.type='button';button.addEventListener('click',async()=>{if(!reason.value.trim()){reason.focus();summary.textContent='Add a reason before deciding.';return;}button.disabled=true;try{current=await window.desktop.updateSource(file.id,value,0,reason.value,value==='approved'&&previous?.value?previous.value:null);await renderKnowledge();renderWorkspace();}catch(error){summary.textContent=error.message;button.disabled=false;}});decision.append(button);
      }
      card.append(decision);
    }
   }else{const review=node('button','Review this file in Setup','secondary-button');review.type='button';review.addEventListener('click',()=>{showTab('setup');const target=[...document.querySelectorAll('[data-file-id]')].find(element=>element.dataset.fileId===file.id);if(target){target.open=true;target.scrollIntoView({block:'center'});target.querySelector('summary')?.focus();}});card.append(review);}
   host.append(card);
  }
 }catch(error){if(request===knowledgeRequest){knowledgeRenderKey=null;summary.textContent=`Could not load knowledge: ${error.message}`;host.replaceChildren();}}
}
let knowledgeSearchTimer;
