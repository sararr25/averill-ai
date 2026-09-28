let feedbackOperation=0;
let feedbackTimer;
function showOperation(state,title,message,{actionable=false}={}){
 clearTimeout(feedbackTimer);
 const host=el('operation-feedback');host.hidden=false;host.dataset.state=state;
 host.setAttribute('aria-busy',String(state==='pending'));
 el('operation-title').textContent=title;
 el('operation-symbol').textContent=state==='pending'?'◌':state==='error'?'!':state==='success'?'✓':'i';
 el('operation-message').textContent=message;
 if(state==='success'&&!actionable)feedbackTimer=setTimeout(()=>{host.hidden=true;},5500);
}
window.desktop.onOperation(event=>{
 if(event.id<feedbackOperation)return;feedbackOperation=event.id;
 const actionable=event.state==='success'&&(event.intake||event.channel==='onboarding:apply');
 showOperation(event.state,event.state==='pending'?'Working…':event.state==='error'?'Action failed':'Completed',event.message,{actionable});
 el('operation-knowledge').hidden=!actionable;
});
el('operation-dismiss').addEventListener('click',()=>{clearTimeout(feedbackTimer);el('operation-feedback').hidden=true;});
el('operation-knowledge').addEventListener('click',()=>{showTab('knowledge');renderKnowledge();});
// Existing local validation messages receive the same visible treatment.
for(const id of ['workspace-feedback','learning-status'])new MutationObserver(()=>{
 const message=el(id).textContent.trim();if(!message)return;
 if(id==='learning-status'&&message==='Saved on this computer.')return;
 const host=el('operation-feedback');if(host.dataset.state==='pending')return;
 showOperation('notice','Update',message);
 el('operation-knowledge').hidden=true;
}).observe(el(id),{childList:true,subtree:true,characterData:true});
el('knowledge-search').addEventListener('input',()=>{clearTimeout(knowledgeSearchTimer);knowledgeSearchTimer=setTimeout(renderKnowledge,150);});
el('knowledge-filter').addEventListener('change',renderKnowledge);
for(const id of ['knowledge-department','knowledge-kind','knowledge-conflicts'])el(id).addEventListener('change',renderKnowledge);
