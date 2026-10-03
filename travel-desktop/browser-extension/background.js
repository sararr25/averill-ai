let queue = Promise.resolve();
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 queue = queue.then(async()=>{
  const {pair}=await chrome.storage.session.get('pair');
  if(!pair){reply({stopped:true});return;}
  const stop = message.kind==='stop-pair';
  if(!stop && (sender.tab?.id!==pair.tabId || sender.frameId!==0 || sender.origin!==pair.pageOrigin)) {reply({stopped:true});return;}
  const kind=stop?'stop':message.kind;
  if(!['field','heartbeat','editing','stop'].includes(kind)){reply({stopped:true});return;}
  pair.sequence++;await chrome.storage.session.set({pair});
  try{
   const response=await fetch(pair.endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({kind,tabId:pair.tabId,pageOrigin:pair.pageOrigin,sequence:pair.sequence,field:message.field,reason:message.reason}),signal:AbortSignal.timeout(4000)});
   if(!response.ok)throw new Error('Disconnected');
   if(stop){await chrome.storage.session.remove('pair');try{await chrome.tabs.sendMessage(pair.tabId,{kind:'stop'});}catch{}}
   reply({stopped:stop});
  }catch{await chrome.storage.session.remove('pair');reply({stopped:true});}
 }).catch(()=>reply({stopped:true}));
 return true;
});
chrome.tabs.onRemoved.addListener(async id=>{const {pair}=await chrome.storage.session.get('pair');if(pair?.tabId===id)await chrome.runtime.sendMessage({kind:'stop-pair'});});
