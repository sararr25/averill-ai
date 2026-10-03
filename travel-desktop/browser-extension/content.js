(() => {
 if(window.__averillStop)window.__averillStop();
 let selected=null,timer=null,heartbeat=null,alive=true,composing=false;
 const abort=new AbortController();
 function stop(){alive=false;clearTimeout(timer);clearInterval(heartbeat);abort.abort();selected=null;}
 window.__averillStop=stop;
 chrome.runtime.onMessage.addListener(message=>{if(message.kind==='stop')stop();});
 function send(payload){if(!alive)return;chrome.runtime.sendMessage(payload).then(result=>{if(result?.stopped)stop();}).catch(stop);}
 function describe(element){
  if(!element || !element.isConnected || element.getClientRects().length===0)return null;
  const kind=element.matches('select')?'select':element.isContentEditable?'contenteditable':element.tagName==='TEXTAREA'?'textarea':element.type;
  if(!['text','textarea','contenteditable','select','date','time','checkbox'].includes(kind))return null;
  const label=element.getAttribute('aria-label')||element.labels?.[0]?.innerText||element.getAttribute('placeholder')||'Selected draft field';
  if(/password|token|secret|card|payment|recipient|e-?mail address|phone|personal|personnel/i.test([label,element.name,element.id,element.autocomplete].join(' ')))return null;
  const value=kind==='contenteditable'?element.innerText:kind==='checkbox'?String(element.checked):element.value;
  return {kind,label:label.slice(0,100),value:String(value||'').slice(0,6000)};
 }
 function commit(reason){timer=null;if(!alive||composing||document.visibilityState!=='visible')return;const field=describe(selected);if(field)send({kind:'field',field,reason});else send({kind:'editing'});}
 document.addEventListener('click',event=>{
  if(!event.isTrusted)return;
  const candidate=event.target.closest('textarea,input,select,[contenteditable="true"],[contenteditable=""]');
  if(describe(candidate)){selected=candidate;clearTimeout(timer);commit('selection');}
 },{signal:abort.signal,capture:true});
 document.addEventListener('input',event=>{if(event.target!==selected)return;clearTimeout(timer);send({kind:'editing'});timer=setTimeout(()=>commit('pause'),1200);},{signal:abort.signal});
 document.addEventListener('change',event=>{if(event.target===selected)commit('selection');},{signal:abort.signal});
 document.addEventListener('focusout',event=>{if(event.target===selected){clearTimeout(timer);commit('blur');}},{signal:abort.signal});
 document.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);send({kind:'editing'});},{signal:abort.signal});
 document.addEventListener('compositionend',()=>{composing=false;timer=setTimeout(()=>commit('pause'),1200);},{signal:abort.signal});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'){send({kind:'stop'});stop();}},{signal:abort.signal});
 window.addEventListener('pagehide',()=>{send({kind:'stop'});stop();},{signal:abort.signal});
 heartbeat=setInterval(()=>{if(selected&&!selected.isConnected){send({kind:'stop'});stop();}else {send({kind:'heartbeat'});if(selected&&!timer&&!composing)commit('read');}},4000);
 send({kind:'heartbeat'});
})();
