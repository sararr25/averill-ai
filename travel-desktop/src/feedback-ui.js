let feedbackOperation=0;
window.desktop.onOperation(event=>{
 if(event.id<feedbackOperation)return;feedbackOperation=event.id;
 const host=el('operation-feedback');host.hidden=false;host.dataset.state=event.state;host.setAttribute('aria-busy',String(event.state==='pending'));
 el('operation-title').textContent=event.state==='pending'?'Working…':event.state==='error'?'Action failed':'Completed';
 el('operation-symbol').textContent=event.state==='pending'?'◌':event.state==='error'?'!':'✓';
 el('operation-message').textContent=event.message;
 el('operation-knowledge').hidden=!(event.state==='success'&&(event.intake||event.channel==='onboarding:apply'));
});
el('operation-dismiss').addEventListener('click',()=>{el('operation-feedback').hidden=true;});
el('operation-knowledge').addEventListener('click',()=>{showTab('knowledge');renderKnowledge();});
// Existing local validation messages receive the same visible treatment.
for(const id of ['workspace-feedback','learning-status'])new MutationObserver(()=>{
 const message=el(id).textContent.trim();if(!message)return;
 const host=el('operation-feedback');if(host.dataset.state==='pending')return;host.dataset.state='notice';el('operation-title').textContent='Update';el('operation-symbol').textContent='i';
 host.hidden=false;el('operation-message').textContent=message;
}).observe(el(id),{childList:true,subtree:true,characterData:true});
el('knowledge-search').addEventListener('input',()=>{clearTimeout(knowledgeSearchTimer);knowledgeSearchTimer=setTimeout(renderKnowledge,150);});
el('knowledge-filter').addEventListener('change',renderKnowledge);
