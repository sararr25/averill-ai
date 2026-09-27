let knowledgeRequest=0;
function knowledgeExcerpt(text,query){
 const preview=node('p',undefined,'knowledge-preview');
 const value=(text||'No text could be extracted. Open the original file or upload a readable export.').replace(/^#{1,6}\s+/gm,'').replace(/`([^`]+)`/g,'$1');
 const term=String(query||'').trim();const match=term?value.toLowerCase().indexOf(term.toLowerCase()):-1;
 if(match<0){preview.textContent=value;return preview;}
 preview.append(document.createTextNode(value.slice(0,match)),node('mark',value.slice(match,match+term.length)),document.createTextNode(value.slice(match+term.length)));
 return preview;
}
async function renderKnowledge(){
 const request=++knowledgeRequest;const host=el('knowledge-list'),summary=el('knowledge-summary');
 if(!current.workspace?.configured||current.auth?.enabled&&!current.auth.signedIn){host.replaceChildren();summary.textContent='';return;}
 summary.textContent='Loading company documents…';
 try{
  const result=await window.desktop.listKnowledge(el('knowledge-search').value,el('knowledge-filter').value);
  if(request!==knowledgeRequest)return;
  summary.textContent=`${result.documents.length} shown of ${result.total} · ${result.uploaded} for review · ${result.approved} approved`;
  host.replaceChildren();
  if(!result.documents.length){host.append(node('p',result.total?'No documents match this search or status.':'No company documents yet. Add files in Setup; they appear here immediately for review.'));return;}
  for(const file of result.documents){
   const card=node('article',undefined,'knowledge-card');
   const status=node('strong',file.kind==='uploaded'?'Uploaded · review needed':file.scope==='private'?`Private · ${file.status}`:file.status==='approved'?'Approved company knowledge':`${file.status} · not used for answers`,'knowledge-state');
   status.dataset.state=file.kind==='uploaded'?'uploaded':file.status;
   card.append(node('h3',file.name),status);
   card.append(node('p',`${file.kind==='uploaded'?'Upload proposal':file.scope==='company'?'Company-wide':file.scope==='private'?'Only you':file.department} · v${file.version||'1'} · ${file.readable?'Text extracted':'No readable text'} · ${file.confidentiality} · ${file.aiAllowed?'AI permission recorded':'Local only'}`,'knowledge-meta'));
   if(file.kind==='uploaded')card.append(node('p','This file has been received. Confirm the onboarding proposal in Setup to save it as a source; approval is a separate step.'));
   card.append(knowledgeExcerpt(file.excerpt,el('knowledge-search').value));
   const read=node('button','Read extracted text','secondary-button');read.type='button';read.disabled=!file.readable;
   read.addEventListener('click',async()=>{read.disabled=true;try{const content=await(file.kind==='uploaded'?window.desktop.readOnboardingFile(file.id):window.desktop.readWorkspaceFile(file.id));activeSourceId=null;el('open-source').hidden=true;el('source-title').textContent=content.title;el('source-content').textContent=content.text||'No readable text.';el('source-dialog').showModal();}catch{}finally{read.disabled=!file.readable;}});card.append(read);
   if(file.kind==='saved'){
    const open=node('button','Open original file','secondary-button');open.type='button';open.addEventListener('click',()=>window.desktop.openWorkspaceSource(file.id).catch(()=>{}));card.append(open);
    if(file.status!=='approved'){const manage=node('button','Manage in Setup','secondary-button');manage.type='button';manage.addEventListener('click',()=>{showTab('setup');const target=[...document.querySelectorAll('[data-source-id]')].find(element=>element.dataset.sourceId===file.id);if(target){target.scrollIntoView({block:'center'});target.tabIndex=-1;target.focus();}});card.append(manage);}
   }else{const review=node('button','Review this file in Setup','secondary-button');review.type='button';review.addEventListener('click',()=>{showTab('setup');const target=[...document.querySelectorAll('[data-file-id]')].find(element=>element.dataset.fileId===file.id);if(target){target.open=true;target.scrollIntoView({block:'center'});target.querySelector('summary')?.focus();}});card.append(review);}
   host.append(card);
  }
 }catch(error){if(request===knowledgeRequest){summary.textContent=`Could not load knowledge: ${error.message}`;host.replaceChildren();}}
}
let knowledgeSearchTimer;
