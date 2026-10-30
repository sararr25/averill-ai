// Local user-invoked pointer. Observes a real user click; never activates a host control.
(function(scope){
 'use strict';
 scope.AverillCanvaGuide?.stop();
 let overlay=null,bubble=null,target=null,clickListener=null,listener=null,labels=[],page='',active=false;
 const normalize=s=>String(s||'').toLowerCase().replace(/[.…]+$/g,'').replace(/\s+/g,' ').trim();
 const canonical=value=>normalize(value).replace(/\bcolour\b/g,'color').replace(/^current text color(?: .{1,100})?$/,'text color');
 const labelOf=e=>e.getAttribute('aria-label')||e.getAttribute('title')||(e.textContent.length<90?e.textContent:'');
 function clear(){if(target&&clickListener)target.removeEventListener('click',clickListener,true);clickListener=null;overlay?.remove();bubble?.remove();overlay=bubble=target=null;}
 function visible(e){const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(e.disabled||e.getAttribute('aria-disabled')==='true'||e.closest('[inert],[aria-hidden=true]')||s.visibility!=='visible'||s.display==='none'||Number(s.opacity)===0||r.width<8||r.height<8||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight)return false;const at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return at===e||e.contains(at);}
 function matches(doc,names){const wanted=names.map(canonical);return [...doc.querySelectorAll('button,[role=button],[role=tab],input[aria-label],select[aria-label]')].filter(e=>!e.closest('[data-averill-companion],[data-averill-design],[data-averill-guide]')&&visible(e)&&wanted.includes(canonical(labelOf(e))));}
 function draw(){if(!active||!target?.isConnected||location.pathname!==page||!labels.includes(canonical(labelOf(target)))||!visible(target)){clear();return}const r=target.getBoundingClientRect();overlay.style.cssText=`position:fixed;pointer-events:none;z-index:2147483647;border:4px solid #647d1f;border-radius:10px;box-shadow:0 0 0 3px #fff;left:${r.left-5}px;top:${r.top-5}px;width:${r.width+10}px;height:${r.height+10}px;box-sizing:border-box`;bubble.style.cssText=`position:fixed;pointer-events:none;z-index:2147483647;left:${Math.max(12,Math.min(r.left,innerWidth-250))}px;top:${Math.min(r.bottom+14,innerHeight-60)}px;max-width:240px;padding:10px 14px;border-radius:12px;background:#d6ef91;color:#242a1b;box-shadow:0 4px 18px #0003;font:600 16px/1.4 system-ui;text-align:left`;}
 function locate(step,options={}){
  clear();if(!step){active=false;removeEventListener('resize',draw);removeEventListener('scroll',draw,true);document.removeEventListener('visibilitychange',clear);clearInterval(listener);listener=null;return ''}
  active=true;if(!listener){addEventListener('resize',draw);addEventListener('scroll',draw,true);document.addEventListener('visibilitychange',clear);listener=setInterval(draw,400)}
  if(!step.labels?.length)return 'Do this in Canva, then choose Next step.';
  const found=matches(document,step.labels);if(found.length!==1)return found.length?'Several controls match. Select your text, then locate again.':'Select editable text or open More, then locate again.';
  labels=step.labels.map(canonical);page=location.pathname;target=found[0];overlay=document.createElement('div');bubble=document.createElement('div');for(const e of [overlay,bubble]){e.setAttribute('data-averill-guide','');e.setAttribute('aria-hidden','true');document.documentElement.append(e)}bubble.textContent=`${step.number||'→'} · ${labelOf(target)}`;draw();
  clickListener=event=>{if(!event.isTrusted)return;const advance=options.onAction;locate(null);setTimeout(()=>advance?.(),100)};target.addEventListener('click',clickListener,true);
  return 'Click the highlighted control. The guide will continue.';
 }
 scope.AverillCanvaGuide={locate,stop:()=>locate(null),matches};
})(globalThis);
