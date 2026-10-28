let learningRenderKey,learningLead;
async function learnAction(kind,payload={}) {
 const status=el('learning-status');status.textContent='Saving…';
 try {learningLead=kind==='project-start'?payload.projectId:null;current=await window.desktop.learningAction(kind,payload);render();learningLead=null;
  const started=kind==='project-start'&&current.learning?.sessions?.find(s=>s.project?.id===payload.projectId&&!s.finishedAt&&!s.excluded);
  status.textContent=started?`Started “${started.title}”. All ${started.project.steps.length} steps are shown below.`:'Saved on this computer.';
  const next=kind==='finish'?el('learning-panel').querySelector('.learning-card h4')||el('learning-panel').querySelector('.learning-card h3'):['quiz','answer'].includes(kind)?el('learning-panel').querySelector('.learning-question form')?.closest('.learning-question')?.querySelector('h4')||el('learning-panel').querySelector('.learning-question h4'):['project-start','project-confirm'].includes(kind)?el('learning-panel').querySelector('.project-exercise h4')||el('learning-panel').querySelector('.project-exercise h3'):null;
  if(next){next.tabIndex=-1;next.focus();}
 }
 catch(error){learningLead=null;status.textContent=error.message;}
}
function learningButton(label,kind,payload){const b=node('button',label,'secondary-button');b.type='button';b.addEventListener('click',()=>learnAction(kind,payload));return b;}
function guideLink(guide){const b=node('button','Open official Canva guide','source-link');b.type='button';b.addEventListener('click',()=>window.desktop.openWeb(guide.url));return b;}
function prioritizeLearning(panel,preferred){
 const cards=[...panel.children].filter(child=>child.classList.contains('learning-card')&&child.tagName!=='DETAILS');
 const lead=preferred||cards[0];if(!lead)return;
 lead.dataset.currentLearning='true';panel.insertBefore(lead,panel.children[1]||null);
 for(const card of cards){if(card===lead)continue;const details=node('details',undefined,'learning-secondary');details.append(node('summary',card.querySelector('h3')?.textContent||'Other learning'));card.before(details);details.append(card);for(const button of card.querySelectorAll('.agent-primary')){button.classList.replace('agent-primary','secondary-button');}}
}
function renderLearning(){
 const data=current.learning||{configured:false};const key=JSON.stringify([data,current.workspace?.sources,current.workspace?.activePersonId]);if(key===learningRenderKey)return;learningRenderKey=key;
 const panel=el('learning-panel');panel.replaceChildren();
 if(!data.configured){panel.append(node('p','Create a company workspace and select a person in Workspace settings to save learning.'));return;}
 panel.append(node('p',`${current.workspace.people.find(p=>p.id===current.workspace.activePersonId)?.name}, here is your learning for this week.`,'section-note'));
 const active=data.sessions.find(s=>!s.finishedAt&&!s.excluded&&!s.exercise&&!s.project&&!s.note);
 const lesson=node('article',undefined,'learning-card');lesson.append(node('h3','Canva layout essentials'));
 if(!active){
  lesson.append(node('p','Six steps inside Canva: headline and supporting line, size, alignment, margins, contrast and grouping. Averill ticks the steps it can see in your design; you confirm the rest once, at the end.'));
  const label=node('label','Optional company context');label.htmlFor='learning-source';const select=node('select');select.id='learning-source';select.append(new Option('Tool practice only',''));
  const conflicts=new Set((current.workspace.conflicts||[]).flat());for(const source of current.workspace.sources.filter(s=>s.status==='approved'&&!conflicts.has(s.id)))select.append(new Option(`${source.title} · v${source.version}`,source.id));
  const start=node('button','Start Canva lesson','agent-primary');start.type='button';start.addEventListener('click',()=>learnAction('start',{sourceId:select.value||null}));lesson.append(label,select,start);
 }else{
  // D1: the whole page at once. Steps tick themselves from the Canva card's design reading; one confirmation finishes the page.
  const checks=active.checks||{},autoSteps=data.steps.filter(step=>step.check==='auto'),seen=autoSteps.filter(step=>checks[step.id]).length;
  lesson.append(node('p',`${seen} of ${autoSteps.length} steps seen in your Canva design${active.live?` · last reading at ${new Date(active.live.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:''}.`,'section-note'));
  const list=node('ol',undefined,'lesson-steps');
  for(const step of data.steps){
   const done=step.check==='auto'&&Boolean(checks[step.id]),kind=step.check==='confirm'?'confirm':done?'done':'todo';
   const item=node('li',undefined,`lesson-step ${kind}`);const mark=node('span',undefined,'lesson-mark');mark.innerHTML=icon(kind==='done'?'check-circle':kind==='confirm'?'pencil-simple-line':'seal-check');
   const text=node('div');text.append(node('h4',step.title),node('p',step.instruction),node('small',kind==='done'?'Checked by Averill in your design':kind==='confirm'?'Averill cannot see this. You confirm it below.':'Not seen in your design yet'));
   const help=node('details');help.append(node('summary','Help'),node('p',step.help));text.append(help);item.append(mark,text);list.append(item);
  }
  if(active.migrated)lesson.append(node('p','This lesson was started before the Canva page. Your earlier confirmations are kept as yours; Averill now ticks the steps it can see in your design.','field-hint'));lesson.append(list);
  const open=node('button',undefined,'secondary-button');open.type='button';open.innerHTML=icon('arrow-up-right');open.append(document.createTextNode('Open Canva'));open.addEventListener('click',()=>window.desktop.openWeb('https://www.canva.com/'));
  lesson.append(node('p','In Canva, open an Instagram post design, click the Averill icon in Chrome, Connect this tab, then turn on Watch my design.','field-hint'),open,guideLink(data.guide));
  if(active.source){lesson.append(node('p',`${active.source.title} · v${active.source.version}${active.sourceAvailable?'':' · no longer available for practice'}`));if(active.sourceAvailable){const b=node('button','Read company context','source-link');b.type='button';b.addEventListener('click',()=>showSource(active.source.id,b));lesson.append(b);}}
  const confirmSteps=data.steps.filter(step=>step.check==='confirm').map(step=>step.title.toLowerCase()).join(', ');
  const finish=node('form',undefined,'lesson-finish');const agree=node('label');const box=node('input');box.type='checkbox';box.required=true;agree.append(box,document.createTextNode(` I did the step Averill cannot see: ${confirmSteps}.`));
  const submit=node('button','Finish lesson','agent-primary');submit.type='submit';submit.disabled=seen<autoSteps.length;
  finish.append(agree,submit);finish.addEventListener('submit',event=>{event.preventDefault();learnAction('finish',{sessionId:active.id});});
  if(seen<autoSteps.length)finish.append(node('p','Finish unlocks when Averill has seen every other step in your design.','field-hint'));
  const self=node('details');self.append(node('summary','I cannot connect Canva'));const selfForm=node('form');const selfAgree=node('label');const selfBox=node('input');selfBox.type='checkbox';selfBox.required=true;selfAgree.append(selfBox,document.createTextNode(' I did every step myself. Record them as confirmed by me, not checked by Averill.'));
  const selfSubmit=node('button','Finish with my own confirmation','secondary-button');selfSubmit.type='submit';selfForm.append(selfAgree,selfSubmit);selfForm.addEventListener('submit',event=>{event.preventDefault();learnAction('finish',{sessionId:active.id,selfConfirmAll:true});});self.append(selfForm);
  lesson.append(finish,self);
 }
 panel.append(lesson);
 for(const session of data.sessions.filter(s=>s.exercise&&!s.finishedAt&&!s.excluded)){
  const exercise=node('article',undefined,'learning-card finding-exercise');const finding=session.exercise;const heading=node('h3',`Practise: ${finding.title}`);heading.tabIndex=-1;
  exercise.append(heading,node('p',`From the shared ${finding.kind} work. This is an employee exercise, not an automatic visual assessment.`));
  const comparison=node('div',undefined,'learning-comparison');comparison.append(node('div',`Before · ${finding.before}\n${finding.problem}`),node('div',`Target · ${finding.action}\nCheck the cited source, then make the edit yourself.`));exercise.append(comparison);
  const open=node('button','Open work window','secondary-button');open.type='button';open.addEventListener('click',()=>window.desktop.openWork(finding.kind).catch(error=>{el('learning-status').textContent=error.message;}));exercise.append(open);
  const sourceButton=node('button',`Read ${finding.source.title}${finding.source.version?` · v${finding.source.version}`:''}`,'source-link');sourceButton.type='button';sourceButton.addEventListener('click',()=>showSource(finding.source.id,sourceButton));exercise.append(sourceButton);
  const form=node('form',undefined,'workspace-form');const label=node('label','What did you change, and what did you check?');const response=node('textarea');response.required=true;response.minLength=10;response.maxLength=1000;response.rows=3;label.append(response);
  const confirm=node('label');const check=node('input');check.type='checkbox';check.required=true;confirm.append(check,document.createTextNode(' I made and reviewed this edit myself.'));
  const submit=node('button','Recheck supported field and save practice','agent-primary');submit.type='submit';form.append(label,confirm,submit);form.addEventListener('submit',e=>{e.preventDefault();learnAction('finding-complete',{sessionId:session.id,reflection:response.value});});exercise.append(form);panel.append(exercise);
 }
 const projectStart=node('details',undefined,'learning-card');projectStart.append(node('summary','Start a task-based exercise'),node('p','Choose a concrete result. You perform the work and confirm each step; Averill does not inspect Canva geometry or verify an exported file.'));
 const projectForm=node('form',undefined,'workspace-form');const projectLabel=node('label','Exercise');const projectSelect=node('select');for(const project of data.projects||[])projectSelect.append(new Option(project.title,project.id));projectLabel.append(projectSelect);
 const projectSourceLabel=node('label','Optional approved company source');const projectSource=node('select');projectSource.append(new Option('Use supplied demo guidance only',''));const projectBlocked=new Set((current.workspace.conflicts||[]).flat());for(const source of current.workspace.sources.filter(source=>source.status==='approved'&&!projectBlocked.has(source.id)))projectSource.append(new Option(`${source.title} · v${source.version}`,source.id));projectSourceLabel.append(projectSource);
 const projectButton=node('button','Start exercise','agent-primary');projectButton.type='submit';projectForm.append(projectLabel,projectSelect,projectSourceLabel,projectSource,projectButton);projectForm.addEventListener('submit',e=>{e.preventDefault();learnAction('project-start',{projectId:projectSelect.value,sourceId:projectSource.value||null});});projectStart.append(projectForm);panel.append(projectStart);
 for(const session of data.sessions.filter(s=>s.project&&!s.finishedAt&&!s.excluded))panel.append(renderProjectPage(session,data));
 const helpCard=node('details',undefined,'learning-card');helpCard.append(node('summary','Ask about a lesson step'));
 helpCard.append(node('p','Type a question about selection, Position, alignment or grouping. Averill answers from this offline lesson. A selected Canva window can be captured once on request; OCR does not verify layout.'));
 const helpForm=node('form',undefined,'workspace-form');const helpLabel=node('label','Your question');const helpInput=node('input');helpInput.type='text';helpInput.required=true;helpInput.maxLength=500;helpLabel.append(helpInput);const helpSubmit=node('button','Get step help','secondary-button');helpSubmit.type='submit';const helpResult=node('p',undefined,'learning-feedback');helpForm.append(helpLabel,helpSubmit);helpForm.addEventListener('submit',e=>{e.preventDefault();const words=helpInput.value.toLowerCase();const step=data.steps.find(s=>[s.id,s.title.toLowerCase()].some(term=>words.includes(term)))||data.steps.find(s=>s.id==='select'&&/shift|multiple|choose/.test(words))||data.steps.find(s=>s.id==='group'&&/shortcut|together/.test(words));helpResult.textContent=step?`${step.title}: ${step.instruction} ${step.help}`:'I cannot answer that from this bounded lesson. Ask about selection, Position, alignment or grouping, or open the official guide.';});helpCard.append(helpForm,helpResult,guideLink(data.guide));
 const capture=node('button','Capture one selected Canva frame','secondary-button');capture.type='button';capture.disabled=!current.externalWindow;capture.addEventListener('click',async()=>{helpResult.textContent='Reading one selected frame…';try{const result=await window.desktop.reviewExternal();helpResult.textContent=`Visible OCR text in ${result.window}: ${result.text||'No readable text detected.'} This does not assess geometry.`;}catch(error){helpResult.textContent=error.message;}});helpCard.append(capture);panel.append(helpCard);
 const activity=node('details',undefined,'learning-card');activity.append(node('summary','Record something else you practised'));
 const form=node('form');form.className='workspace-form';const toolLabel=node('label','Work tool');toolLabel.htmlFor='learning-tool';const tool=node('select');tool.id='learning-tool';for(const name of ['LinkedIn','Newsletter','Canva'])tool.append(new Option(name,name));
 const noteLabel=node('label','What did you do or learn?');noteLabel.htmlFor='learning-note';const note=node('textarea');note.id='learning-note';note.required=true;note.minLength=10;note.maxLength=1000;note.rows=3;
 const sourceLabel=node('label','Optional approved company source');sourceLabel.htmlFor='activity-source';const source=node('select');source.id='activity-source';source.append(new Option('No company source',''));const blocked=new Set((current.workspace.conflicts||[]).flat());for(const s of current.workspace.sources.filter(s=>s.status==='approved'&&!blocked.has(s.id)))source.append(new Option(`${s.title} · v${s.version}`,s.id));
 const checkLabel=node('label');const check=node('input');check.type='checkbox';check.required=true;checkLabel.append(check,document.createTextNode(' I confirm this activity reflects my work.'));
 const submit=node('button','Save confirmed activity','secondary-button');submit.type='submit';form.append(toolLabel,tool,noteLabel,note,sourceLabel,source,checkLabel,submit);form.addEventListener('submit',e=>{e.preventDefault();learnAction('record',{tool:tool.value,note:note.value,sourceId:source.value||null,confirmed:check.checked});});activity.append(form);panel.append(activity);
 const week=node('article',undefined,'learning-card');week.append(node('h3','Your week'),node('p','Review your confirmed activities before starting practice. Excluding a session removes it from practice; the local record remains visible.'));if(data.earlierPractice)week.append(node('p',`An earlier practice set from this week (${data.earlierPractice.answered} of ${data.earlierPractice.total} answered) is kept in your history.`));
 const sessions=data.sessions.filter(s=>s.confirmed.some(c=>c.week===data.week)||!s.finishedAt);
 if(!sessions.length)week.append(node('p','No learning recorded this week. Start a lesson and confirm a step.'));
 for(const s of sessions){const row=node('div',undefined,'learning-record');row.append(node('strong',s.title),node('p',`${s.note?'Activity confirmed this week':`${s.confirmed.filter(c=>c.week===data.week).length} steps confirmed this week`}${s.finishedAt&&!s.note?' · lesson finished':''}${s.excluded?' · excluded':''}`));if(s.note)row.append(node('p',s.note));if(s.exercise?.after)row.append(node('p',`Before: ${s.exercise.before} After: ${s.exercise.after} Employee confirmation and deterministic rule check are separate.`));if(!s.excluded)row.append(learningButton('Exclude this session','exclude',{sessionId:s.id}));week.append(row);}
 const canRefresh=sessions.some(s=>!s.excluded&&s.confirmed.some(c=>c.week===data.week));
 const refreshInstruction=canRefresh?'Refresh weekly practice to include the latest confirmed activities.':'Start a lesson and confirm a new step, or record a confirmed activity, to create weekly practice.';
 const begin=learningButton(data.quiz?'Resume or refresh weekly practice':'Start weekly practice','quiz');begin.classList.add('agent-primary');begin.disabled=!canRefresh;week.append(begin);const weekly=node('details',undefined,'learning-week');weekly.open=Boolean(data.quiz);weekly.append(node('summary','Your week and learning history'),week);panel.append(weekly);
 const remove=node('button','Delete my local learning history','learning-delete');remove.type='button';remove.addEventListener('click',()=>{if(window.confirm('Delete all of your local lesson, activity and weekly practice records? This cannot be undone in Averill.'))learnAction('delete-history');});week.append(remove);
 const quiz=data.quiz;if(!quiz){prioritizeLearning(panel,learningLead&&panel.querySelector(`.project-exercise[data-project-id="${learningLead}"]`)||(active?lesson:panel.querySelector('.project-exercise'))||panel.querySelector('.finding-exercise')||lesson);return;}
 if(quiz.outdated)panel.append(node('p',`Your learning record changed. ${refreshInstruction}`,'section-note'));
 const practice=renderWeeklyPractice(quiz,data,refreshInstruction);panel.append(practice);prioritizeLearning(panel,learningLead&&panel.querySelector(`.project-exercise[data-project-id="${learningLead}"]`)||(!quiz.outdated?practice:active?lesson:panel.querySelector('.project-exercise')||lesson));
}
