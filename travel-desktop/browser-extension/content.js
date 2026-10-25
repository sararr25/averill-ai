(() => {
 if(window.__averillStop)window.__averillStop();
 let selected=null,selectedSig=null,refinding=null,timer=null,heartbeat=null,alive=true,composing=false,sequence=0,generation=0,result=null,claimSet=null,imageSet=null,reviewValue='',expanded=false,uiState='ready',error='',undo=null,mutationPending=false;
 const FS=globalThis.AverillFieldSelect;if(!FS)throw new Error('Averill field-select.js was not loaded.');
 const identities=new WeakMap(),abort=new AbortController();
 const host=document.createElement('div');host.setAttribute('data-averill-companion','');host.tabIndex=0;host.setAttribute('aria-label','Averill review controls');
 host.style.cssText='position:fixed;z-index:2147483646;display:none;pointer-events:auto;margin:0;padding:0;border:0;background:transparent;inset:auto;width:360px;max-width:calc(100vw - 24px);';
 const root=host.attachShadow({mode:'closed'});document.documentElement.append(host);
 const asset=file=>chrome.runtime.getURL?chrome.runtime.getURL(file):'';
 const style=document.createElement('style');style.textContent=`
 @font-face{font-family:AverillJakarta;src:url('${asset('assets/plus-jakarta-sans.ttf')}');font-weight:200 800;font-display:swap}
 :host{all:initial;color-scheme:dark}*{box-sizing:border-box}.card{font:14px/1.6 AverillJakarta,system-ui,sans-serif;color:#f3f1f8;background:#2b2835;border:1px solid #57505f;border-radius:22px;box-shadow:0 16px 50px #100f192b;max-height:calc(100vh - 24px);display:flex;flex-direction:column;overflow:hidden;text-align:left}.head{display:flex;align-items:center;gap:8px;padding:14px 12px 10px 20px;flex:none;position:relative;z-index:1;background:#2b2835;border-bottom:1px solid #484351}.head img{width:24px;height:24px}.brand{font-size:20px;letter-spacing:-.045em;font-weight:600}.pill{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font:600 11px/16px AverillJakarta,system-ui,sans-serif;color:#d6ef91;background:#363e2d;border-radius:999px;padding:3px 10px;white-space:nowrap}.pill::before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}.pill.off{color:#ffc794;background:#44362e}.hint{font-size:13px}.main{padding:16px 20px 18px;overflow:auto;min-height:0}.footer{padding:0 20px 14px;flex:none}h2{font-size:24px;line-height:1.3;letter-spacing:-.035em;font-weight:600;margin:0 0 12px}p{font-size:14px;color:#b8b2c6;margin:0 0 14px;line-height:1.6}.tag{font-size:11px;color:#b8b2c6;margin-bottom:9px}.observed{background:#44362e;color:#ffc794;border-radius:9px;padding:12px;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}.primary{display:block;background:#d6ef91;color:#242a1b;border:0;border-radius:12px;padding:0 16px;font:600 13px/20px AverillJakarta,system-ui,sans-serif;min-height:36px;width:100%;text-align:center}.more .primary{display:inline-block;width:auto}.secondary{background:transparent;border:1px solid #8e879b;color:#f3f1f8;border-radius:12px;padding:0 12px;min-height:32px;font:600 13px/20px AverillJakarta,system-ui,sans-serif}.primary+.text,.primary+.secondary{margin-top:8px}.text{border:0;background:transparent;color:#b8b2c6;padding:0;text-decoration:underline;text-underline-offset:3px;min-height:24px;font:600 13px/20px AverillJakarta,system-ui,sans-serif}.text+.text{display:table;margin-top:8px}.close{border:0;background:transparent;color:#b8b2c6;font-size:20px;line-height:1;min-width:32px;min-height:32px;border-radius:12px}.row{display:flex;gap:15px;justify-content:space-between;align-items:center}.source{background:#35313f;border-radius:12px;padding:12px;font-size:13px;color:#f3f1f8;margin-bottom:4px}.source summary{cursor:pointer}.source small{display:block;font-size:12px;color:#b8b2c6}.quote{margin-top:12px;border-top:1px solid #484351;padding-top:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;max-height:130px;overflow:auto}.diff{border:1px solid #484351;border-radius:12px;overflow:hidden;margin:12px 0}.diff div{padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}.before{background:#44362e;color:#ffc794}.after{background:#363e2d;color:#d6ef91}.diff small{display:block;font-size:11px;margin-bottom:5px}.notice{color:#d6ef91}.error{color:#ffb8bf}.more{border-top:1px solid #484351;margin-top:14px;padding-top:14px}button,select{font:inherit;cursor:pointer}button:disabled{opacity:.6;cursor:default}button:focus-visible,summary:focus-visible,select:focus-visible{outline:3px solid #d6ef91;outline-offset:3px}select{width:100%;padding:10px;background:#35313f;color:#f3f1f8;border:1px solid #8e879b;border-radius:10px;margin-bottom:12px}.ask{border-top:1px solid #484351;padding:14px 20px;flex:none}.ask label{display:block;font-size:12px;font-weight:600;color:#b8b2c6;margin-bottom:6px}.ask textarea{display:block;width:100%;min-height:56px;resize:none;background:#35313f;color:#f3f1f8;border:1px solid #8e879b;border-radius:12px;padding:8px 12px;font:13px/1.5 AverillJakarta,system-ui,sans-serif}.ask textarea:focus-visible{outline:3px solid #d6ef91;outline-offset:2px}.askrow{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px}.askrow small{font-size:12px;color:#b8b2c6;line-height:1.4}.out{margin-top:12px;max-height:200px;overflow:auto}.out p{font-size:13px;margin:0 0 8px}.cite{background:#35313f;border-radius:12px;padding:12px;font-size:13px;margin-bottom:8px}.cite b{display:block;font-weight:600}.cite small{display:block;font-size:12px;color:#b8b2c6}.cite .quote{margin-top:8px;padding-top:8px;max-height:96px}.check{border-top:1px solid #484351;margin-top:14px;padding-top:14px}.check h3,.results h3{font-size:14px;line-height:1.4;font-weight:600;margin:0 0 6px;color:#f3f1f8}.check .hint,.results .hint{font-size:13px;color:#b8b2c6;margin:0 0 10px;line-height:1.5}.claim{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}.claim input{flex:none;width:24px;height:24px;margin:4px 0 0;accent-color:#d6ef91;cursor:pointer}.claim textarea{flex:1;min-width:0;display:block;min-height:52px;resize:none;background:#35313f;color:#f3f1f8;border:1px solid #8e879b;border-radius:12px;padding:6px 10px;font:13px/1.5 AverillJakarta,system-ui,sans-serif}.claim.off textarea{opacity:.6}.claim input:focus-visible,.claim textarea:focus-visible{outline:3px solid #d6ef91;outline-offset:2px}.checkrow{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:4px}.checkrow small{font-size:12px;color:#b8b2c6;line-height:1.4}.checknote{font-size:12px;color:#b8b2c6;margin:8px 0 0;line-height:1.5}.results{margin-top:14px}.verdict{border-left:3px solid #8e879b;background:#35313f;border-radius:0 12px 12px 0;padding:10px 12px;margin-bottom:8px;font-size:13px}.verdict.supported{border-color:#d6ef91}.verdict.contradicted{border-color:#ffb8bf}.verdict b{display:block;font-weight:600}.verdict.supported b{color:#d6ef91}.verdict.contradicted b{color:#ffb8bf}.verdict p{font-size:13px;margin:4px 0 0;overflow-wrap:anywhere}.src{margin-top:8px;border-top:1px solid #484351;padding-top:8px}.src a{display:inline-block;min-height:24px;color:#f3f1f8;font-weight:600;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}.src a:focus-visible{outline:3px solid #d6ef91;outline-offset:2px}.src small{display:block;font-size:12px;color:#b8b2c6;overflow-wrap:anywhere}.src .snip{font-size:12px;margin-top:4px;overflow-wrap:anywhere}.chip{border:1px solid #57505f;background:#2b2835;color:#f3f1f8;border-radius:12px;min-height:36px;padding:0 16px;font:600 13px AverillJakarta,system-ui,sans-serif;box-shadow:0 4px 18px #100f1920}h3{scroll-margin-top:16px}.images{border-top:1px solid #484351;margin-top:14px;padding-top:14px}.images h3{font-size:14px;line-height:1.4;font-weight:600;margin:0 0 6px;color:#f3f1f8}.images .hint{font-size:13px;color:#b8b2c6;margin:0 0 10px;line-height:1.5}.images .source summary{min-height:24px}.images>.imgitem{margin-top:14px}.imgitem{margin-bottom:10px;font-size:13px;overflow-wrap:anywhere}.imgitem p{font-size:13px;color:#f3f1f8;margin:0 0 6px}.imgitem p.checknote{color:#b8b2c6;font-size:12px}.imgfacts{margin:8px 0 0;padding:0;list-style:none}.imgfacts li{font-size:12px;color:#b8b2c6;line-height:1.5;margin:0 0 2px;overflow-wrap:anywhere}button{transition:background-color 140ms cubic-bezier(.16,1,.3,1)}button:hover{filter:brightness(1.06)}@media(prefers-reduced-motion:reduce){button{transition:none}}
 `;root.append(style);const box=document.createElement('div');root.append(box);
 const status=node('div');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');status.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);';root.append(status);
 // FB-07: one persistent question box, moved into whichever card is showing. Plain text only.
 const askInput=node('textarea');askInput.id='averill-ask';askInput.rows=2;askInput.maxLength=500;askInput.setAttribute('aria-label','Ask about this draft or company rules');askInput.placeholder='For example: Can we say this?';
 const askOut=node('div',undefined,'out');askOut.hidden=true;let askBusy=false;
 const askButton=button('Ask',()=>submitAsk(),'secondary');askButton.setAttribute('aria-label','Ask the question');
 askInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submitAsk()}});
 for(const type of ['keydown','keyup','keypress'])host.addEventListener(type,e=>{const t=e.composedPath()[0];if(t===askInput||t?.classList?.contains('claimtext'))e.stopPropagation()});
 function askSection(){const wrap=node('div',undefined,'ask'),label=node('label','Ask about this draft or company rules');label.htmlFor='averill-ask';const row=node('div',undefined,'askrow');row.append(node('small','Enter to ask. Shift+Enter for a new line.'),askButton);wrap.append(label,askInput,row,askOut);return wrap}
 function showAsk(value,problem){
  askOut.replaceChildren();askOut.hidden=!value&&!problem;
  if(problem){askOut.append(node('p',String(problem).slice(0,300),'error'));return}
  if(!value)return;
  if(value.state==='refused'){askOut.append(node('p',String(value.message||'This question was not accepted.').slice(0,300),'error'));return}
  if(value.state!=='answered'||!Array.isArray(value.citations)||!value.citations.length){askOut.append(node('p','No approved source answers this.'),node('p','Try other words, or ask an administrator to approve the guidance.','hint'));return}
  askOut.append(node('div',value.mode==='model'?'Nemotron answer':'Checked locally','tag'),node('p',String(value.text||'').slice(0,1500)));
  for(const c of value.citations.slice(0,3)){const box=node('div',undefined,'cite');box.append(node('b',String(c.title||'').slice(0,160)),node('small',`Approved · Version ${String(c.version||'').slice(0,20)}`),node('div',String(c.quote||'').slice(0,600),'quote'));askOut.append(box)}
 }
 async function submitAsk(){
  if(askBusy||!alive)return;const question=askInput.value.trim();
  if(!question){showAsk(null,'Type a question first.');return}
  askBusy=true;askInput.readOnly=true;askButton.disabled=true;askOut.hidden=false;askOut.replaceChildren(node('p','Looking in approved sources.','hint'));status.textContent='Looking in approved sources.';
  // Syncing the selected field first lets the answer use its current text; a stale revision is simply ignored by Averill.
  const field=selected?await commit('selection'):null;
  const value=alive?await send({kind:'ask',question,task,...(field?{fieldId:field.id,revision:field.revision}:{})}):{};
  askBusy=false;askInput.readOnly=false;askButton.disabled=false;if(!alive)return;
  if(value.error)showAsk(null,value.error);else showAsk(value);
  // FB-10: after an answer the card may offer the draft's public statements for an online double-check. Nothing is sent from here.
  if(!value.error&&field&&selected&&describe(selected)?.revision===field.revision){const next=offerClaims(field,value.publicCheck,claimSet);if(next&&next!==claimSet){claimSet=next;render()}}
  status.textContent=value.error||(value.state==='answered'?`Answer from ${value.citations?.[0]?.title||'an approved source'}.`:value.message||'No approved source answers this.');
  if(selected)position();
 }
 const site=location.hostname.replace(/^(www|app|my)\./,'');
 const detected=/(^|\.)linkedin\.com$/.test(site)?'linkedin':/(^|\.)brevo\.com$/.test(site)?'email':/(^|\.)instagram\.com$/.test(site)?'instagram':/(^|\.)canva\.com$/.test(site)?'canva':null;
 let task=detected;
 function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
 function button(label,action,cls='text'){const b=node('button',label,cls);b.type='button';b.addEventListener('click',action);return b;}
 function describe(element){
  if(!element||!element.isConnected||element.getClientRects().length===0)return null;
  const kind=element.matches('select')?'select':FS.isEditableText(element)&&!element.matches('input,textarea')?'contenteditable':element.tagName==='TEXTAREA'?'textarea':element.type;
  if(!['text','textarea','contenteditable','select','date','time','checkbox'].includes(kind))return null;
  const label=FS.labelOf(element);
  if(FS.isSensitive([label,element.name,element.id,element.autocomplete]))return null;
  const value=kind==='contenteditable'?element.innerText:kind==='checkbox'?String(element.checked):element.value;
  if(String(value||'').length>6000)return null;
  let identity=identities.get(element);if(!identity){identity={id:`field_${Date.now().toString(36)}_${++sequence}`,revision:0,value:String(value||'')};identities.set(element,identity)}
  if(identity.value!==String(value||'')){identity.revision++;identity.value=String(value||'')}
  return {id:identity.id,revision:identity.revision,kind,label:label.slice(0,100),value:String(value||'')};
 }
 function teardown(){if(!alive)return false;alive=false;clearTimeout(timer);clearTimeout(refinding?.timer);refinding=null;selectedSig=null;observer.disconnect();clearInterval(heartbeat);abort.abort();selected=null;result=null;undo=null;return true}
 function remove(){teardown();chrome.runtime.onMessage.removeListener?.(onMessage);root.replaceChildren();host.remove()}
 // Sharing ended: keep a short card that says why and how to reconnect, instead of disappearing.
 function stop(reason){if(!teardown())return;showEnded(reason)}
 window.__averillStop=remove;
 function onMessage(message,sender,reply){if(message.kind==='ping'){reply?.({alive});return}if(message.kind==='ended')stop(message.reason);else if(message.kind==='stop')stop('stopped_by_user')}
 chrome.runtime.onMessage.addListener(onMessage);
 // A missing extension context means the extension was reloaded or removed while this page stayed open.
 async function send(payload){if(!alive)return {};try{const value=await chrome.runtime.sendMessage(payload)||{};if(value.stopped)stop(value.reason||'lost_contact');return value}catch{stop('lost_contact');return {stopped:true}}}
 function pill(text,off){const p=node('span',text,off?'pill off':'pill');return p}
 function showEnded(reason){
  const reasons=globalThis.AverillEndReasons;const message=reasons.message(reasons.isReason(reason)?reason:'lost_contact');
  if(host.matches?.(':popover-open'))host.hidePopover();host.removeAttribute('popover');
  if(host.parentElement!==document.documentElement)document.documentElement.append(host);
  host.style.cssText+='display:block;left:auto;top:auto;right:12px;bottom:12px;width:360px;';
  const card=node('section',undefined,'card');card.setAttribute('aria-label','Averill sharing ended');
  const head=node('div',undefined,'head'),mark=node('img');mark.src=asset('assets/mark.svg');mark.alt='';
  const close=button('×',remove,'close');close.setAttribute('aria-label','Close');
  head.append(mark,node('span','Averill','brand'),pill('Not connected',true),close);
  const main=node('div',undefined,'main');main.append(node('h2','Sharing ended.'),node('p',message),node('p',reasons.RECONNECT,'hint'),button('Close',remove,'secondary'));
  card.append(head,main);box.replaceChildren(card);status.textContent=`Sharing ended. ${message}`;
 }
 function invalidate(message=''){generation++;result=null;claimSet=null;imageSet=null;uiState='ready';error=message;expanded=false;render()}
 async function commit(reason){const request=generation;timer=null;if(!alive||composing||document.visibilityState!=='visible')return;if(reason==='pause'&&selected?.isConnected)selectedSig=sign(selected);const field=describe(selected);const value=await send(field?{kind:'field',field,reason}:{kind:'editing'});if(request===generation&&result&&Object.hasOwn(value,'reviewId')&&value.reviewId!==result.id)invalidate('The draft or approved guidance changed. Check again.');return field}
 function position(){if(!selected||!selected.isConnected)return;const container=selected.closest('[role=dialog],dialog[open]')||document.documentElement;if(host.parentElement!==container)container.append(host);host.style.right='';host.style.bottom='';const r=selected.getBoundingClientRect(),width=Math.min(expanded?420:360,innerWidth-24);host.style.width=width+'px';const height=host.getBoundingClientRect().height;let left,top;
  if(r.right+width+24<=innerWidth){left=r.right+12;top=Math.max(12,Math.min(r.top,innerHeight-height-12))}
  else if(r.left-width-12>=12){left=r.left-width-12;top=Math.max(12,Math.min(r.top,innerHeight-height-12))}
  else{left=Math.max(12,innerWidth-width-12);top=Math.max(12,innerHeight-height-12)}
  left=Math.min(left,innerWidth-width-12);host.style.left=left+'px';host.style.top=top+'px';
  // A transformed modal establishes its own fixed-position containing block.
  if(container!==document.documentElement&&typeof host.showPopover==='function'){host.setAttribute('popover','manual');if(!host.matches(':popover-open'))host.showPopover();}
  const actual=host.getBoundingClientRect();host.style.left=(left+left-actual.left)+'px';host.style.top=(top+top-actual.top)+'px';
 }
 async function ask(useAI=false,consent=false){if(mutationPending)return;if(!task){render();return}const request=++generation;result=null;claimSet=null;error='';if(useAI&&!consent){uiState='consent';render();return}uiState='checking';render();const field=await commit('selection');if(!field||!alive||request!==generation)return;reviewValue=field.value;
  const value=await send({kind:'review',task,fieldId:field.id,revision:field.revision,useAI,consent});
  if(!alive||request!==generation||describe(selected)?.id!==field.id||describe(selected)?.revision!==field.revision)return;
  if(value.error){uiState='error';error=value.error}else{claimSet=offerClaims(field,value.publicCheck,null);result=value;uiState=value.state||'error'}render();
 }
 async function preview(finding){if(!result)return;const request=++generation,value=await send({kind:'proposal',reviewId:result.id,findingId:finding.id});if(!alive||request!==generation)return;if(value.error){invalidate(value.error);return}uiState='preview';render(value.proposal)}
 async function apply(finding){
  if(!result||!finding||mutationPending)return;
  const review=result,field=selected,restoreControlFocus=Boolean(root.activeElement),request=++generation;uiState='applying';render();
  const authorized=await send({kind:'proposal',reviewId:review.id,findingId:finding.id});
  if(!alive||request!==generation||field!==selected)return;
  if(authorized.error){invalidate(authorized.error);return}
  mutationPending=true;try{const adapter=globalThis.AverillEditorAdapter.create(field,()=>describe(field));const record=await adapter.apply(authorized.proposal,{id:review.fieldId,revision:review.revision,value:reviewValue});mutationPending=false;if(!alive||field!==selected)return;undo={adapter,record};result=null;uiState='applied';error='';await commit('selection');render();if(restoreControlFocus)[...box.querySelectorAll('button')].find(b=>b.textContent==='Undo change')?.focus({preventScroll:true})}catch(e){mutationPending=false;if(!alive||field!==selected)return;result=null;if(e.recovery){undo={record:e.recovery};uiState='undo-conflict'}else uiState='error';error=e.message;render()}
 }
 async function undoChange(){if(mutationPending||!undo?.adapter)return;const target=selected,previous=undo;mutationPending=true;uiState='undoing';render();try{await previous.adapter.undo(previous.record);mutationPending=false;if(!alive||target!==selected)return;undo=null;result=null;uiState='restored';error='';commit('selection');render()}catch(e){mutationPending=false;if(!alive||target!==selected)return;error=e.message;uiState='undo-conflict';render()}}
 // FB-10: double-check public statements online. The employee ticks or edits the exact text; only that text is sent, after the button press.
 const CLAIM_BLOCKED=['checking','consent','preview','applying','undoing','applied','undo-conflict','recovery','restored'];
 function offerClaims(field,offer,keep){
  if(!field||!offer||!Array.isArray(offer.claims)||!offer.claims.length)return null;
  if(keep&&keep.fieldId===field.id&&keep.revision===field.revision)return keep;
  return {fieldId:field.id,revision:field.revision,task,items:offer.claims.slice(0,5).map(text=>({text:String(text).slice(0,300),on:true})),nemotron:offer.nemotron===true,quota:offer.quota==='demo'?'demo':null,busy:false,outcome:null,message:'',focusResults:false};
 }
 function chosenClaims(set){return set.items.filter(item=>item.on&&item.text.trim()).map(item=>item.text.trim())}
 async function runCheck(set){
  if(set.busy||!alive||claimSet!==set)return;const chosen=chosenClaims(set);if(!chosen.length)return;
  set.busy=true;set.outcome=null;set.message='';render();status.textContent='Searching public sources.';
  const value=await send({kind:'public-check',task:set.task,fieldId:set.fieldId,revision:set.revision,claims:chosen});
  if(!alive||claimSet!==set)return;
  set.busy=false;set.focusResults=true;
  if(value.error)set.message=String(value.error).slice(0,300);else if(value.state==='checked'&&Array.isArray(value.claims))set.outcome=value;else set.message=String(value.message||'The online check could not finish. Try again.').slice(0,300);
  render();status.textContent=set.outcome?`Public check finished for ${set.outcome.claims.length} statement${set.outcome.claims.length===1?'':'s'}.`:set.message;
 }
 function sourceLine(entry,withSnippet){
  const box=node('div',undefined,'src');let ok=false;try{ok=new URL(entry.url).protocol==='https:'}catch{}
  if(ok){const a=node('a',String(entry.title||entry.url).slice(0,160));a.href=entry.url;a.target='_blank';a.rel='noopener noreferrer';box.append(a)}else box.append(node('b',String(entry.title||'Source').slice(0,160)));
  box.append(node('small',String(entry.url).slice(0,200)));
  if(withSnippet&&entry.snippet)box.append(node('div',`“${String(entry.snippet).slice(0,240)}”`,'snip'));
  return box;
 }
 function checkResults(out){
  const wrap=node('div',undefined,'results'),title=node('h3','Public check, not company approval');title.tabIndex=-1;wrap.append(title,node('p','Public sources can show whether a statement is still true. They never replace an approved company source.','hint'));
  const labels={supported:'Supported',contradicted:'Contradicted',unclear:'Unclear'};
  for(const c of out.claims.slice(0,5)){
   const verdict=labels[c.verdict]?c.verdict:'unclear',card=node('div',undefined,`verdict ${verdict}`);card.append(node('b',labels[verdict]),node('p',`“${String(c.claim).slice(0,300)}”`));
   if(c.explanation)card.append(node('p',String(c.explanation).slice(0,300),'hint'));
   if(c.evidence)card.append(sourceLine(c.evidence,true));else for(const entry of (c.sources||[]).slice(0,2))card.append(sourceLine(entry,true));
   wrap.append(card);
  }
  wrap.append(node('p',`${String(out.method||'Tavily search').slice(0,80)}. Plain text only.`,'checknote'));
  return wrap;
 }
 function checkSection(){
  const set=claimSet,field=selected?describe(selected):null;
  if(!set||!field||field.id!==set.fieldId||field.revision!==set.revision||CLAIM_BLOCKED.includes(uiState))return null;
  const section=node('section',undefined,'check');section.setAttribute('aria-label','Double-check online');
  section.append(node('h3','Double-check online'),node('p','Tick the public statements to search with Tavily. Nothing is sent until you press the button.','hint'));
  const go=button('Check with Tavily',()=>runCheck(set),'secondary'),count=node('small');
  const refresh=()=>{const n=chosenClaims(set).length;count.textContent=`${n} of ${set.items.length} will be sent`;go.disabled=set.busy||!n};
  set.items.forEach((item,index)=>{
   const row=node('div',undefined,item.on?'claim':'claim off'),box=node('input');box.type='checkbox';box.checked=item.on;box.setAttribute('aria-label',`Search statement ${index+1}`);
   const text=node('textarea',undefined,'claimtext');text.value=item.text;text.rows=2;text.maxLength=300;text.setAttribute('aria-label',`Statement ${index+1}. This exact text is sent.`);text.readOnly=set.busy;box.disabled=set.busy;
   box.addEventListener('change',()=>{item.on=box.checked;row.className=item.on?'claim':'claim off';refresh()});text.addEventListener('input',()=>{item.text=text.value;refresh()});
   row.append(box,text);section.append(row);
  });
  const row=node('div',undefined,'checkrow');row.append(count,go);section.append(row);refresh();
  if(set.busy)go.textContent='Searching';
  section.append(node('p',`Only the ticked text above leaves this device. ${set.nemotron?'Averill then asks NVIDIA Nemotron to compare the results with each statement. ':''}${set.quota==='demo'?'Each statement uses one of the demo server’s 10 daily online searches.':''}`.trim(),'checknote'));
  if(set.message)section.append(node('p',set.message,'error'));
  if(set.outcome)section.append(checkResults(set.outcome));
  return section;
 }
 // FB-08: "Check images too". Nothing is collected before the employee presses the button; pixels are read in a canvas here and go
 // only to Averill on this device. A page image the browser will not let us read sends no pixels at all.
 const IMAGE_MAX=4,IMAGE_SIDES=[1600,1200,900,600],IMAGE_URL_BUDGET=1.4*1024*1024,IMAGE_MIN_RENDERED=64,IMAGE_TASKS=['instagram','linkedin'];
 const COMPOSER='[role=dialog],dialog,form,[class*="compose" i],[class*="composer" i],[class*="share-box" i]';
 function imageCandidates(box){
  const found=[];
  for(const el of box.querySelectorAll('img')){
   if(found.length>=IMAGE_MAX)break;const r=el.getBoundingClientRect();
   if(el.complete&&el.naturalWidth>0&&el.naturalHeight>0&&r.width>=IMAGE_MIN_RENDERED&&r.height>=IMAGE_MIN_RENDERED)found.push({kind:'img',el});
  }
  let seen=0;
  for(const el of box.querySelectorAll('*')){
   if(found.length>=IMAGE_MAX||++seen>600)break;if(el.tagName==='IMG')continue;
   const bg=getComputedStyle(el).backgroundImage,match=/^url\((["']?)(.+)\1\)$/.exec(bg||'');
   if(!match)continue;const r=el.getBoundingClientRect();
   if(r.width>=IMAGE_MIN_RENDERED&&r.height>=IMAGE_MIN_RENDERED)found.push({kind:'bg',el,url:match[2]});
  }
  return found;
 }
 // The post editor around the shared field: its dialog, form or composer, never the whole page.
 function composerOf(field){
  const modal=field.closest('[role=dialog],dialog');if(modal)return modal;
  for(let node=field.parentElement,steps=0;node&&node!==document.body&&node!==document.documentElement&&steps<12;node=node.parentElement,steps++){
   if(node.matches(COMPOSER)&&imageCandidates(node).length)return node;
  }
  for(let node=field.parentElement,steps=0;node&&node!==document.body&&node!==document.documentElement&&steps<6;node=node.parentElement,steps++)if(imageCandidates(node).length)return node;
  return null;
 }
 function loadImage(url,cors){return new Promise((resolve,reject)=>{const img=new Image();if(cors)img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('load'));img.src=url})}
 // Downscaled PNG, long side at most 1600 pixels (smaller if the file would be too big). Throws if the canvas is tainted.
 function pngOf(source,width,height){
  for(const side of IMAGE_SIDES){
   const scale=Math.min(1,side/Math.max(width,height)),canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
   const url=canvas.toDataURL('image/png');if(url.length<=IMAGE_URL_BUDGET)return url;
  }
  return null;
 }
 async function readImage(candidate){
  if(candidate.kind==='img'){
   const el=candidate.el,out={width:el.naturalWidth,height:el.naturalHeight,alt:(el.getAttribute('alt')||'').trim().slice(0,300)};
   try{const url=pngOf(el,out.width,out.height);if(url)out.dataUrl=url}catch{}
   return out;
  }
  const label=(candidate.el.getAttribute('aria-label')||'').trim().slice(0,300);
  try{
   const plain=await loadImage(candidate.url,false),out={width:plain.naturalWidth,height:plain.naturalHeight,alt:candidate.el.getAttribute('role')==='img'?label:''};
   if(!out.width||!out.height)return null;
   try{const url=pngOf(await loadImage(candidate.url,true),out.width,out.height);if(url)out.dataUrl=url}catch{}
   return out;
  }catch{return null}
 }
 async function collectImages(field){
  const box=composerOf(field);if(!box)return [];
  const images=[];for(const candidate of imageCandidates(box).slice(0,IMAGE_MAX)){const image=await readImage(candidate);if(image)images.push(image)}
  return images;
 }
 async function runImageCheck(set){
  if(set.busy||!alive||imageSet!==set)return;
  set.busy=true;set.outcome=null;set.message='';render();status.textContent='Checking the images on this device.';
  const field=selected?await commit('selection'):null;
  if(!alive||imageSet!==set)return;
  if(!field||field.id!==set.fieldId||field.revision!==set.revision){set.busy=false;set.message='The draft changed. Check the images again.';render();return}
  let images;try{images=await collectImages(selected)}catch{set.busy=false;set.message='The images on this page could not be collected.';render();return}
  const value=await send({kind:'image-check',task:set.task,fieldId:set.fieldId,revision:set.revision,images});
  if(!alive||imageSet!==set)return;
  set.busy=false;set.focusResults=true;
  if(value.error)set.message=String(value.error).slice(0,300);else if(['findings','no-conflict','insufficient-evidence'].includes(value.state)&&Array.isArray(value.findings))set.outcome=value;else set.message='The image check could not finish. Try again.';
  render();status.textContent=set.outcome?(set.outcome.findings.length?`${set.outcome.findings.length} image suggestion${set.outcome.findings.length===1?'':'s'}.`:'No image conflicts found.'):set.message;
 }
 function imageResults(out){
  const wrap=node('div',undefined,'imgitem'),title=node('h3',out.findings.length?`${out.findings.length} image suggestion${out.findings.length===1?'':'s'}`:out.state==='insufficient-evidence'?'No approved image guidance yet':'No image conflicts found');title.tabIndex=-1;wrap.append(title);
  for(const f of out.findings.slice(0,12)){const item=node('div',undefined,'imgitem');item.append(node('p',String(f.suggestion||'').slice(0,400)));if(f.source)item.append(source(f));wrap.append(item)}
  const facts=node('ul',undefined,'imgfacts');
  for(const image of (out.images||[]).slice(0,IMAGE_MAX))facts.append(node('li',`Image ${image.index}: ${image.width} by ${image.height} pixels, ${image.altPresent?'alt text present':'no alt text'}, ${String(image.reading||'').slice(0,40)}.`));
  for(const note of (out.notes||[]).slice(0,8))facts.append(node('li',String(note).slice(0,240)));
  if(facts.children.length)wrap.append(facts);
  wrap.append(node('p',`Checked${out.scope?.checked?.length?': '+out.scope.checked.join(', '):''}. Only the images inside this post editor were looked at. Pictures and any text read from them stayed on this device.`,'checknote'));
  return wrap;
 }
 function imageSection(){
  const field=selected?describe(selected):null;
  if(!field||!IMAGE_TASKS.includes(task)||CLAIM_BLOCKED.includes(uiState))return null;
  if(!imageSet||imageSet.fieldId!==field.id||imageSet.revision!==field.revision||imageSet.task!==task)imageSet={fieldId:field.id,revision:field.revision,task,busy:false,outcome:null,message:'',focusResults:false};
  const set=imageSet,section=node('section',undefined,'images');section.setAttribute('aria-label','Images');
  section.append(node('h3','Images'),node('p','Check the images attached to this post: size, alt text and any text printed on them. This happens on this device only. Nothing is collected until you press the button.','hint'));
  const go=button(set.busy?'Checking images':'Check images too',()=>runImageCheck(set),'secondary');go.disabled=set.busy;section.append(go);
  if(set.message)section.append(node('p',set.message,'error'));
  if(set.outcome)section.append(imageResults(set.outcome));
  return section;
 }
 function source(finding){const details=node('details',undefined,'source'),summary=node('summary',finding.source.title);summary.append(node('small',`Approved · Version ${finding.source.version}`));details.append(summary,node('div',finding.source.quote,'quote'));return details}
 function render(proposal){if(!alive||!selected)return;const focused=root.activeElement;const focusLabel=focused?.getAttribute('aria-label')||focused?.textContent;host.style.display='block';box.replaceChildren();
  if(uiState==='dismissed'){box.append(button('Ask Averill',()=>{uiState='ready';render()},'chip'));position();return}
  const card=node('section',undefined,'card');card.setAttribute('aria-label','Ask Averill');const head=node('div',undefined,'head'),mark=node('img');mark.src=asset('assets/mark.svg');mark.alt='';const connected=pill('Connected to Averill');connected.title=`Sharing one field on ${site}`;head.append(mark,node('span','Averill','brand'),connected,button('×',()=>{generation++;result=null;uiState='dismissed';render();selected?.focus()},'close'));head.lastChild.setAttribute('aria-label','Dismiss Averill');
  const main=node('div',undefined,'main');main.setAttribute('aria-label','Review guidance');
  if(error)main.append(node('p',error,'error'));
  if(!task){main.append(node('h2','What are you working on?'),node('p','Choose the guidance for this selected field.'));const select=node('select');select.setAttribute('aria-label','Work type');const empty=node('option','Choose work type');empty.value='';select.append(empty);for(const [id,label]of [['email','Marketing email'],['linkedin','Organic LinkedIn post'],['instagram','Instagram caption'],['canva','Canva text'],['operations','Operations'],['people','People guidance']]){const o=node('option',label);o.value=id;select.append(o)}select.onchange=()=>{task=select.value||null;render()};main.append(select)}
  else if(uiState==='checking')main.append(node('div','Checking · selected text','tag'),node('h2','Checking your draft.'),node('p','Comparing this field with approved company guidance.'));
  else if(uiState==='undoing')main.append(node('h2','Restoring previous text.'),node('p','Waiting for the selected editor to confirm Undo.'));
  else if(uiState==='applying')main.append(node('h2','Applying this change.'),node('p','Waiting for the selected editor to confirm the update.'));
  else if(uiState==='applied'){main.append(node('h2','Change applied.'),node('p','Nothing was sent or published.','notice'),button('Undo change',undoChange,'primary'),button('Recheck selected text',()=>ask(false)))}
  else if(uiState==='undo-conflict'){main.append(node('h2','Your draft changed.'),node('p','Undo will not overwrite your newer work.'),button('Review current text',()=>ask(false),'primary'),button('Show previous text for manual recovery',()=>{uiState='recovery';render()}))}
  else if(uiState==='recovery'&&undo){main.append(node('h2','Recover the text yourself.'),node('p','This is the text before the last Averill edit. Copy only what you want to restore.'));const old=node('textarea');old.readOnly=true;old.value=undo.record.before;old.rows=6;old.setAttribute('aria-label','Previous text for manual recovery');old.style.cssText='width:100%;background:#35313f;color:#f3f1f8;border:1px solid #8e879b;border-radius:10px;padding:12px;';main.append(old,button('Select previous text',()=>{old.focus();old.select()},'secondary'),button('Review current text',()=>ask(false),'primary'))}
  else if(uiState==='restored')main.append(node('h2','Previous text restored.'),button('Recheck selected text',()=>ask(false),'primary'));
  else if(uiState==='consent'){main.append(node('h2','Review with Nemotron?'),node('p','Your selected field and matching passages from eligible approved sources will be sent to Nebius. Company AI policy and file consent still apply.'),button('Confirm this AI review',()=>ask(true,true),'primary'),button('Keep the check local',()=>ask(false)))}
  else if(uiState==='preview'&&proposal){main.append(node('div','Preview · one change','tag'),node('h2','Review this change.'));const diff=node('div',undefined,'diff');for(const [label,text,cls]of [['Before',proposal.before,'before'],['After',proposal.after||'(Remove this phrase)','after']]){const d=node('div',undefined,cls);d.append(node('small',label),node('span',text));diff.append(d)}main.append(diff);if(globalThis.AverillEditorAdapter?.supported(selected)){const finding=result.findings.find(f=>f.proposal?.id===proposal.id);main.append(button('Apply change',()=>apply(finding),'primary'))}else main.append(node('p','Direct editing is not available for this editor yet. Make this change in your tool, then recheck.'),button('Recheck selected text',()=>ask(false),'primary'));main.append(button('Back to suggestion',()=>{uiState='findings';render()}))}
  else if(result?.state==='findings'){const list=expanded?result.findings:result.findings.slice(0,1);main.append(node('div',`${result.findings.length} suggestion${result.findings.length===1?'':'s'} · ${result.mode==='local'?'Checked locally':'Nemotron review'}`,'tag'));for(const [index,f]of list.entries()){const section=node('div',undefined,index?'more':'');section.append(node('h2',f.type==='forbidden-claim'?`Remove “${f.observedExcerpt}”.`:f.type==='missing-required-text'?'Add the required text.':f.suggestion),...(f.type==='missing-required-text'?[node('p',f.suggestion)]:[]),...(f.observedExcerpt?[node('div',f.observedExcerpt,'observed')]:[]));if(f.proposal)section.append(button('Preview change',()=>preview(f),'primary'));section.append(source(f),button('Open in Averill ↗',async()=>{const request=generation;const value=await send({kind:'open',reviewId:result.id,findingId:f.id});if(request===generation&&value.error)invalidate(value.error)}));main.append(section)}main.append(button(expanded?'Show less':result.findings.length>1?`View all ${result.findings.length} suggestions`:'What was checked',()=>{expanded=!expanded;render()}));if(expanded)main.append(node('p',`${result.scope.field} · ${result.scope.sourceCount} approved source(s). Other fields, layout and publication were not checked.`))}
  else if(result?.state==='no-conflict')main.append(node('h2','No conflicts found.'),node('p','No conflict was found in the selected text against the approved rules checked. Other fields and visual layout were not reviewed.'),button('Recheck selected text',()=>ask(false),'primary'));
  else if(result?.state==='insufficient-evidence')main.append(node('h2','No approved source yet.'),node('p','There is not enough approved, visible guidance to check this text. Your draft has not changed.'),button('Try again',()=>ask(false),'primary'));
  else{main.append(node('h2',uiState==='error'?'The check could not finish.':'Help, right where you work.'),node('p','Check this selected field against approved company guidance.'));if(task)main.append(button(uiState==='error'?'Try again':'Ask Averill',()=>ask(false),'primary'))}
  if(task){const check=checkSection();if(check)main.append(check);const pictures=imageSection();if(pictures)main.append(pictures)}
  if(task&&uiState!=='checking'&&uiState!=='consent'&&uiState!=='preview'&&uiState!=='applying'&&uiState!=='undoing'&&uiState!=='applied')main.append(button('Use Nemotron for this review',()=>ask(true)));
  const footer=node('div',undefined,'footer');footer.append(button('Stop sharing',async()=>{await send({kind:'stop'});stop('stopped_by_user')}));card.append(head,main,askSection(),footer);box.append(card);position();if(focused===askInput){askInput.focus({preventScroll:true})}
  status.textContent=main.querySelector('h2')?.textContent||error;
  const resultsFocus=Boolean(claimSet?.focusResults||imageSet?.focusResults);if(claimSet)claimSet.focusResults=false;if(imageSet)imageSet.focusResults=false;
  if(focused&&focused!==askInput&&!resultsFocus){const controls=[...box.querySelectorAll('button,select,summary,a[href],input')];const next=controls.find(e=>(e.getAttribute('aria-label')||e.textContent)===focusLabel)||main.querySelector('.primary')||main.querySelector('h2');if(next){if(next.tagName==='H2')next.tabIndex=-1;next.focus({preventScroll:true})}}
  if(resultsFocus){const heading=box.querySelector('.results h3')||box.querySelector('.imgitem h3')||box.querySelector('.check .error')||box.querySelector('.images .error');if(heading){heading.tabIndex=-1;heading.focus()}}
 }
  const visible=element=>Boolean(describe(element));
  function sign(element){return FS.signature(element,document,visible)}
  function cancelRefind(){clearTimeout(refinding?.timer);refinding=null}
  // An editor that re-renders its field ends the old node, not the selection: look for the same field
  // (tag, role, name, label, stable id, position) for a few seconds, then give the selection up.
  function lose(){
   if(!selected||selected.isConnected||refinding)return;const signature=selectedSig;generation++;selected=null;result=null;undo=null;host.style.display='none';send({kind:'editing'});
   if(!signature)return;refinding={signature,step:0,timer:null};tryRefind();
  }
  function tryRefind(){
   if(!alive||!refinding)return;const state=refinding,found=FS.refind(state.signature,document,visible);
   if(found){refinding=null;selected=found;selectedSig=sign(found);undo=null;invalidate();commit('selection');render();return}
   const delays=[100,300,800,2000];if(state.step>=delays.length){refinding=null;return}
   state.timer=setTimeout(tryRefind,delays[state.step++]);
  }
  const observer=new MutationObserver(()=>{if(selected&&!selected.isConnected)lose()});observer.observe(document.documentElement,{childList:true,subtree:true});
 function chooseField(event){if(!event.isTrusted||event.composedPath().includes(host))return;const candidate=FS.fieldFromEvent(event);if(candidate&&!describe(candidate)){generation++;selected=null;selectedSig=null;cancelRefind();result=null;undo=null;send({kind:'editing'});host.style.cssText+='display:block;left:auto;top:auto;right:12px;bottom:12px;';box.replaceChildren();const card=node('section',undefined,'card'),main=node('div',undefined,'main');main.append(node('h2','This field cannot be shared.'),node('p','Choose a supported draft text field. Sensitive fields and oversized content are excluded.'),button('Dismiss',()=>{host.style.display='none'},'secondary'),button('Stop sharing',async()=>{await send({kind:'stop'});stop('stopped_by_user')}));card.append(main,askSection());box.append(card);return}if(describe(candidate)){cancelRefind();if(candidate!==selected){selected=candidate;undo=null;invalidate()}selectedSig=sign(candidate);clearTimeout(timer);commit('selection');render()}}
 document.addEventListener('click',chooseField,{signal:abort.signal,capture:true});
 document.addEventListener('focusin',event=>{if(event.target!==selected)chooseField(event)},{signal:abort.signal,capture:true});
 document.addEventListener('input',event=>{if(event.target!==selected)return;clearTimeout(timer);describe(selected);if(mutationPending){send({kind:'editing'});return}invalidate();if(undo){uiState='undo-conflict';render()}send({kind:'editing'});timer=setTimeout(()=>commit('pause'),1200)},{signal:abort.signal});
 document.addEventListener('change',event=>{if(event.target===selected){describe(selected);invalidate();commit('selection')}},{signal:abort.signal});
 document.addEventListener('focusout',event=>{if(event.target===selected){clearTimeout(timer);commit('blur')}},{signal:abort.signal});
 document.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);invalidate();send({kind:'editing'})},{signal:abort.signal});
 document.addEventListener('compositionend',()=>{composing=false;timer=setTimeout(()=>commit('pause'),1200)},{signal:abort.signal});
 // A hidden tab pauses sharing and resumes when visible again (owner decision D1). Reload and
 // navigation are handled by the extension worker, which re-injects on the same site.
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){send({kind:'heartbeat'});if(selected&&!timer&&!composing)commit('read')}else{clearTimeout(timer);timer=null;send({kind:'heartbeat',paused:true})}},{signal:abort.signal});
 root.addEventListener('toggle',position,true);
 window.addEventListener('resize',position,{signal:abort.signal});window.addEventListener('scroll',position,{signal:abort.signal,capture:true});
 host.addEventListener('focus',()=>{if(!root.activeElement)box.querySelector('button,select,summary')?.focus()},{signal:abort.signal});
 window.addEventListener('keydown',event=>{if(!event.composedPath().includes(host))return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();generation++;result=null;uiState='dismissed';render();selected?.focus()}else if(event.key==='Tab'){
  // Host modal focus scopes cannot enumerate controls inside a closed shadow root.
  event.stopPropagation();const controls=[...box.querySelectorAll('button:not(:disabled),select,summary,textarea:not([readonly]),input:not(:disabled),a[href]')].filter(e=>e.getClientRects().length);const index=controls.indexOf(root.activeElement);if((event.shiftKey&&index===0)||(!event.shiftKey&&index===controls.length-1)){event.preventDefault();selected?.focus()}
 }},{signal:abort.signal,capture:true});
 heartbeat=setInterval(()=>{if(document.visibilityState!=='visible'){send({kind:'heartbeat',paused:true});return}
  // An editor that re-renders its field ends the selection, not the connection.
  if(selected&&!selected.isConnected){lose();return}{const request=generation;send({kind:'heartbeat'}).then(value=>{if(request===generation&&result&&Object.hasOwn(value,'reviewId')&&value.reviewId!==result.id)invalidate('The draft or company guidance changed. Check again.')});if(selected&&!timer&&!composing)commit('read')}},4000);
 send(document.visibilityState==='visible'?{kind:'heartbeat'}:{kind:'heartbeat',paused:true});
})();
