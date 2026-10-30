// Shared local answer/guide view. Never evaluates model HTML or model-provided selectors.
(function (scope) {
 'use strict';
 const step = (title, text, image, labels = []) => ({ title, text, image, labels });
 const select = step('Select your text', 'Click the text box you want to change.', 'text');
 const color = step('Open Text color', 'Click Text color in the toolbar.', 'contrast', ['Text color', 'Text colour', 'Colore del testo']);
 const chooseColor = step('Choose a readable color', 'Pick a text color that stands out from the background.', 'contrast');
 const spacing = step('Open Spacing', 'Open Advanced Settings or Spacing. Adjust the line and letter spacing sliders.', 'text', ['Spacing', 'Advanced Settings', 'Spaziatura', 'Impostazioni avanzate']);
 const position = step('Arrange separate elements', 'Select your text boxes. Open Position and choose an alignment.', 'align', ['Position', 'Posizione']);
 const check = step('Check the result', 'Recheck this slide in Watch. Inspect the spacing yourself.', 'contrast');
 const guides = {
  hierarchy:{title:'Add a headline and supporting line',steps:[step('Open Text','Click Text in the side panel.','text',['Text','Testo']),step('Add a heading','Choose Add a heading and type your headline.','text',['Add a heading','Aggiungi un titolo']),step('Add a supporting line','Add body text and write a short supporting line.','text')]},
  'contrast-spacing': { title: 'Improve contrast and spacing', steps: [select, color, chooseColor, spacing, position, check] },
  contrast: { title: 'Make text easier to read', steps: [select, color, chooseColor, check] },
  spacing: { title: 'Give your text room', steps: [select, spacing, position, check] },
  align: { title: 'Align your elements', steps: [select, position, check] },
  size: { title: 'Change text size', steps: [select, step('Find Font size', 'Use Font size on the text toolbar. Enter a size, then inspect the line for clipping.', 'size', ['Font size', 'Dimensione carattere']), check] },
  margin: { title: 'Keep text inside the safe area', steps: [step('Show margins', 'Open Canva’s design menu and look for Settings, then Show margins. The menu location can vary between editor versions.', 'margin'), step('Move important text inward', 'Keep important text inside the required safe area. Company rules may require a larger inset than Canva’s own margin.', 'margin'), check] },
  group: { title: 'Group your elements', steps: [step('Select the elements together', 'Hold Shift and click each element you want to group.', 'group'), step('Choose Group', 'Click Group on the toolbar. If it is missing, confirm that more than one editable element is selected.', 'group', ['Group', 'Raggruppa']), step('Inspect the group', 'Select the group and check that the intended elements move together. Averill cannot measure grouping; you confirm this yourself.', 'group')] },
  frame: { title: 'Add an image frame', steps: [step('Open Elements', 'Click Elements in Canva’s side panel.', 'text', ['Elements', 'Elementi']), step('Find a frame', 'Browse Frames or search for the shape you need. Add a frame, then drag an image into it. Double-click the image to adjust its crop.', 'margin'), step('Inspect the crop', 'Check that the subject stays visible and the frame does not cover important text.', 'margin')] }
 };
 const css = `.av-answer [hidden]{display:none!important}.av-answer{font-family:inherit;font-size:16px;line-height:1.6;color:var(--tx,var(--av-text));overflow-wrap:anywhere}.av-answer p{font-size:16px;white-space:pre-wrap;margin:0 0 12px;color:inherit}.av-answer ol,.av-answer ul{padding-left:24px;margin:8px 0 16px;display:grid;gap:10px}.av-answer li{padding-left:3px}.av-answer h3{font-size:22px;line-height:1.4;margin:0 0 12px;color:inherit}.av-answer button{font-family:inherit;font-weight:600;font-size:15px;line-height:1.4;cursor:pointer;border:1px solid var(--ct,var(--av-control-border));background:var(--rs,var(--av-surface-raised));color:inherit;border-radius:12px;min-height:36px;padding:8px 12px}.av-answer button:focus-visible{outline:3px solid var(--fc,var(--av-accent));outline-offset:3px}.av-answer button:disabled{opacity:.5;cursor:default}.av-answer .av-start,.av-answer .av-next{background:var(--at,var(--av-accent));color:var(--sf,var(--av-on-accent));border-color:transparent}.av-answer .av-start{margin:4px 0 14px}.av-answer .av-guide{background:var(--rs,var(--av-surface-raised));border:1px solid var(--ln,var(--av-border));border-radius:16px;padding:16px;margin:12px 0}.av-answer .av-guide[hidden]{display:none}.av-answer .av-guide img{display:block;max-width:100%;width:240px;height:120px;object-fit:contain;margin:12px auto}.av-answer .av-progress,.av-answer .av-locate-status{font-size:14px;color:var(--mu,var(--av-text-secondary));margin-bottom:8px}.av-answer .av-guide-nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.av-answer details{font-size:14px;margin:14px 0}.av-answer summary{cursor:pointer;min-height:24px}.av-answer .av-note{font-size:14px;color:var(--mu,var(--av-text-secondary))}.av-answer .av-illustration{display:block;max-width:100%;width:220px;height:110px;object-fit:contain;margin:12px auto}.av-answer .av-guide:focus{outline:none}`;
 function splitBlocks(text) {
  return String(text || '').replace(/\s+(\d+[.)])\s+/g, '\n$1 ').replace(/\*\*/g, '').split(/\n+/).map(s => s.trim()).filter(Boolean).map(s => ({ type: /^\d+[.)]\s/.test(s) ? 'ol' : /^[-*☐]\s/.test(s) ? 'ul' : 'p', text: s.replace(/^(?:\d+[.)]|[-*☐])\s+/, '').replace(/^#{1,6}\s*/, '') }));
 }
 function render(container, value, options = {}) {
  const doc = container.ownerDocument, el = (tag, text, cls) => { const n = doc.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const root = el('section', undefined, 'av-answer'); root.setAttribute('aria-label', 'Averill guidance');
  const style = el('style', css); root.append(style);
  const content=el('div',undefined,'av-answer-content');root.append(content);
  let list;
  for (const block of splitBlocks(value.text)) {
   if (block.type === 'p') { list = null; content.append(el('p', block.text)); }
   else { if (!list || list.tagName.toLowerCase() !== block.type) { list = el(block.type); content.append(list); } list.append(el('li', block.text)); }
  }
  const guide = guides[value.assistant?.guide];
  const guided=Boolean(guide&&['tool-help','mixed'].includes(value.assistant?.intent));
  if(guided)content.hidden=true; let running = false, index = 0, illustration, start, guideHeading;
  const stop = () => { running = false; content.hidden=false;if(illustration)illustration.hidden=false;if(start)start.hidden=false;if(guideHeading)guideHeading.hidden=false; options.onLocate?.(null); };
  if (guide) {
   if(guided){guideHeading=el('h3',guide.title);root.append(guideHeading);}
   illustration = el('img', undefined, 'av-illustration'); illustration.src = options.asset(`assets/howto-${guide.steps[1]?.image || guide.steps[0].image}.svg`); illustration.alt = `Illustration: ${guide.title}. An Averill sketch, not Canva’s current screen.`; root.append(illustration);
   const panel = el('section', undefined, 'av-guide'); panel.hidden = true; panel.tabIndex = -1;
   start = el('button', options.onLocate ? 'Show me in Canva' : 'Walk me through it', 'av-start'); start.type = 'button'; start.setAttribute('aria-expanded', 'false');
   const draw = () => {
    options.onLocate?.(null); panel.replaceChildren(); const current = guide.steps[index];
    const progress = el('p', `Step ${index + 1} of ${guide.steps.length}`, 'av-progress'); progress.setAttribute('role', 'status');
    panel.append(progress, el('h3', current.title), el('p', current.text));
    const contents=el('details');contents.append(el('summary','Guide steps'));const stepList=el('ol');guide.steps.forEach((item,n)=>{const b=el('button',item.title);b.type='button';b.setAttribute('aria-current',n===index?'step':'false');b.onclick=()=>{index=n;draw()};const li=el('li');li.append(b);stepList.append(li)});contents.append(stepList);panel.append(contents);
    const img = el('img'); img.src = options.asset(`assets/howto-${current.image}.svg`); img.alt = `Illustration: ${current.title}. This is an Averill sketch.`; panel.append(img);
    const locateStatus = el('p', '', 'av-locate-status'); locateStatus.setAttribute('role', 'status'); panel.append(locateStatus);
    const locate = () => { locateStatus.textContent = options.onLocate ? options.onLocate({...current,number:index+1}, {onAction:()=>{if(running&&index<guide.steps.length-1){index++;draw();}}}) : 'Follow this step in Canva.'; };
    if (current.labels.length && options.onLocate) { const b = el('button', 'Locate control'); b.type = 'button'; b.onclick = locate; panel.append(b); }
    locate();
    const nav = el('div', undefined, 'av-guide-nav');
    const back = el('button', 'Back'); back.type = 'button'; back.disabled = index === 0; back.onclick = () => { index--; draw(); };
    const next = el('button', index === guide.steps.length - 1 ? 'Finish guide' : 'Next step', 'av-next'); next.type = 'button'; next.onclick = () => { if (index < guide.steps.length - 1) { index++; draw(); } else { stop(); panel.hidden = true; start.setAttribute('aria-expanded', 'false'); start.textContent = 'Review the guide'; start.focus(); } };
    const end = el('button', 'Stop guide'); end.type = 'button'; end.onclick = () => { stop(); panel.hidden = true; start.setAttribute('aria-expanded', 'false'); start.focus(); };
    nav.append(back, next, end); panel.append(nav);const scope=el('details');scope.append(el('summary','About these checks'),el('p','You make every change. A click advances this guide; measured checks remain separate.','av-note'));panel.append(scope);
    if (running){next.focus({preventScroll:true});const scroller=root.closest('.main,.agent-main');if(scroller)scroller.scrollTop+=panel.getBoundingClientRect().top-scroller.getBoundingClientRect().top-12;}
   };
   start.onclick = () => { running = true; index = 0; content.hidden=true;if(guideHeading)guideHeading.hidden=true;illustration.hidden=true;start.hidden=true; panel.hidden = false; start.setAttribute('aria-expanded', 'true'); draw(); panel.focus({ preventScroll: true }); };
   panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.stopPropagation(); endGuide(); } });
   function endGuide() { stop(); panel.hidden = true; start.setAttribute('aria-expanded', 'false'); start.focus(); }
   root.append(start, panel);illustration.before(start);if(guided){const details=el('details');details.append(el('summary','Read the instructions'),content);root.append(details);content.hidden=false;details.addEventListener('toggle',()=>{content.hidden=false})}
  }
  if (value.assistant?.notice) { const details = el('details'); details.append(el('summary', 'Answer status'), el('p', value.assistant.notice)); root.append(details); }
  const facts=(value.assistant?.facts||[]).filter(f=>typeof f.value==='string'&&String(value.text).includes(f.value)&&(!f.detail||String(value.text).includes(f.detail))).slice(0,4);
  if(facts.length){const grid=el('div',undefined,'av-facts');grid.style.cssText='display:grid;gap:12px;margin:8px 0 16px';facts.forEach((fact,i)=>{const tile=el('article');tile.style.cssText='padding:16px;background:var(--rs,var(--av-surface-raised));border-radius:16px;border:1px solid var(--ln,var(--av-border))';const label=el('p',`${value.assistant.factKind==='process'?String(i+1)+' · ':''}${fact.label}`);label.style.cssText='font-size:14px;margin:0 0 8px';const body=el('p',fact.value);body.style.cssText='font-size:18px;font-weight:600;margin:0';tile.append(label,body);if(fact.detail){const time=el('p',fact.detail);time.style.cssText='font-size:24px;font-weight:700;margin:8px 0 0';tile.append(time)}grid.append(tile)});content.replaceChildren(grid);if(value.assistant.factNote&&String(value.text).includes(value.assistant.factNote))content.append(el('p',value.assistant.factNote,'av-note'));}
  if(options.onQuestion)for(const suggestion of (value.assistant?.suggestions||[]).slice(0,4)){const button=el('button',suggestion.label);button.type='button';button.onclick=()=>options.onQuestion(suggestion.question);root.append(button)}
  container.append(root);
  return { stop, root };
 }
 const api = { guides, render, splitBlocks, css };
 if (typeof module === 'object' && module.exports) module.exports = api;
 scope.AverillAssistantView = api;
})(globalThis);
