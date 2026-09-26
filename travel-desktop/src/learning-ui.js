let learningRenderKey;
async function learnAction(kind,payload={}) {
 const status=el('learning-status');status.textContent='Saving…';
 try {current=await window.desktop.learningAction(kind,payload);render();status.textContent='Saved on this computer.';}
 catch(error){status.textContent=error.message;}
}
function learningButton(label,kind,payload){const b=node('button',label,'secondary-button');b.type='button';b.addEventListener('click',()=>learnAction(kind,payload));return b;}
function guideLink(guide){const b=node('button','Open official Canva guide','source-link');b.type='button';b.addEventListener('click',()=>window.desktop.openWeb(guide.url));return b;}
function renderLearning(){
 const data=current.learning||{configured:false};const key=JSON.stringify([data,current.workspace?.sources,current.workspace?.activePersonId]);if(key===learningRenderKey)return;learningRenderKey=key;
 const panel=el('learning-panel');panel.replaceChildren();
 if(!data.configured){panel.append(node('p','Create a company workspace and select a person in Setup to save learning.'));return;}
 panel.append(node('p',`Learning for ${current.workspace.people.find(p=>p.id===current.workspace.activePersonId)?.name}. Week beginning ${data.week} · Europe/Copenhagen.`,'section-note'));
 const active=data.sessions.find(s=>!s.finishedAt&&!s.excluded);
 const lesson=node('article',undefined,'learning-card');lesson.append(node('h3','Canva layout essentials'));
 if(!active){
  lesson.append(node('p','Practise selecting, positioning, aligning and grouping elements. Start with an open Canva design. A shared window is optional; use Work for explicit OCR capture.'));
  const label=node('label','Optional company context');label.htmlFor='learning-source';const select=node('select');select.id='learning-source';select.append(new Option('Tool practice only',''));
  const conflicts=new Set((current.workspace.conflicts||[]).flat());for(const source of current.workspace.sources.filter(s=>s.status==='approved'&&!conflicts.has(s.id)))select.append(new Option(`${source.title} · v${source.version}`,source.id));
  const start=node('button','Start Canva lesson','secondary-button');start.type='button';start.addEventListener('click',()=>learnAction('start',{sourceId:select.value||null}));lesson.append(label,select,start);
 }else{
  const step=data.steps[active.confirmed.length];lesson.append(node('p',`Step ${active.confirmed.length+1} of ${data.steps.length} · Confirmed by you, not automatically verified.`,'section-note'),node('h4',step.title),node('p',step.instruction));
  const help=node('details');help.append(node('summary','I need help with this step'),node('p',step.help));lesson.append(help,guideLink(data.guide));
  if(active.source){lesson.append(node('p',`${active.source.title} · v${active.source.version}${active.sourceAvailable?'':' · no longer available for practice'}`));if(active.sourceAvailable){const b=node('button','Read company context','source-link');b.type='button';b.addEventListener('click',()=>showSource(active.source.id));lesson.append(b);}}
  lesson.append(learningButton('I tried this step — continue','confirm',{sessionId:active.id,stepId:step.id}));
 }
 panel.append(lesson);
 const activity=node('details',undefined,'learning-card');activity.append(node('summary','Record something else you practised'));
 const form=node('form');form.className='workspace-form';const toolLabel=node('label','Work tool');toolLabel.htmlFor='learning-tool';const tool=node('select');tool.id='learning-tool';for(const name of ['LinkedIn','Newsletter','Canva'])tool.append(new Option(name,name));
 const noteLabel=node('label','What did you do or learn?');noteLabel.htmlFor='learning-note';const note=node('textarea');note.id='learning-note';note.required=true;note.minLength=10;note.maxLength=1000;note.rows=3;
 const sourceLabel=node('label','Optional approved company source');sourceLabel.htmlFor='activity-source';const source=node('select');source.id='activity-source';source.append(new Option('No company source',''));const blocked=new Set((current.workspace.conflicts||[]).flat());for(const s of current.workspace.sources.filter(s=>s.status==='approved'&&!blocked.has(s.id)))source.append(new Option(`${s.title} · v${s.version}`,s.id));
 const checkLabel=node('label');const check=node('input');check.type='checkbox';check.required=true;checkLabel.append(check,document.createTextNode(' I confirm this activity reflects my work.'));
 const submit=node('button','Save confirmed activity','secondary-button');submit.type='submit';form.append(toolLabel,tool,noteLabel,note,sourceLabel,source,checkLabel,submit);form.addEventListener('submit',e=>{e.preventDefault();learnAction('record',{tool:tool.value,note:note.value,sourceId:source.value||null,confirmed:check.checked});});activity.append(form);panel.append(activity);
 const week=node('article',undefined,'learning-card');week.append(node('h3','Your week'),node('p','Review your confirmed activities before starting practice. Excluding a session removes it from practice; the local record remains visible.'));
 const sessions=data.sessions.filter(s=>s.confirmed.some(c=>c.week===data.week)||!s.finishedAt);
 if(!sessions.length)week.append(node('p','No learning recorded this week. Start a lesson and confirm a step.'));
 for(const s of sessions){const row=node('div',undefined,'learning-record');row.append(node('strong',s.title),node('p',`${s.note?'Activity confirmed this week':`${s.confirmed.filter(c=>c.week===data.week).length} steps confirmed this week`}${s.finishedAt&&!s.note?' · lesson finished':''}${s.excluded?' · excluded':''}`));if(s.note)row.append(node('p',s.note));if(!s.excluded)row.append(learningButton('Exclude this session','exclude',{sessionId:s.id}));week.append(row);}
 const begin=learningButton(data.quiz?'Resume or refresh weekly practice':'Start weekly practice','quiz');begin.disabled=!sessions.some(s=>!s.excluded&&s.confirmed.some(c=>c.week===data.week));week.append(begin);panel.append(week);
 const quiz=data.quiz;if(!quiz)return;
 if(quiz.outdated)panel.append(node('p','Your learning record changed. Refresh weekly practice to include the latest confirmed activities.','section-note'));
 const practice=node('article',undefined,'learning-card');practice.append(node('h3',quiz.finishedAt?'Weekly practice complete':'Weekly practice'),node('p','Feedback supports learning. It is not an employee performance or mastery score.'));
 for(const q of quiz.questions){const card=node('div',undefined,'learning-question');card.append(node('h4',q.prompt));
  if(!q.available){card.append(node('p','This activity or source changed. Refresh weekly practice.'));practice.append(card);continue;}
  if(q.guide)card.append(guideLink(q.guide));if(q.source){const b=node('button',`Read ${q.source.title} · v${q.source.version}`,'source-link');b.type='button';b.addEventListener('click',()=>showSource(q.source.id));card.append(b);}
  const answer=quiz.answers[q.id];if(answer){card.append(node('p',['practice','work'].includes(q.type)?answer.text:`Your answer: ${q.options[answer.choice]}`),node('p',answer.feedback,'learning-feedback'));practice.append(card);continue;}
  const form=node('form');form.className='workspace-form';
  if(['practice','work'].includes(q.type)){
   const label=node('label','What did you try, and what would you check?');const text=node('textarea');text.id=`reflection-${q.id}`;label.htmlFor=text.id;text.required=true;text.minLength=10;text.maxLength=1000;text.rows=3;
   const checkLabel=node('label');const check=node('input');check.type='checkbox';check.required=true;checkLabel.append(check,document.createTextNode(' I tried this operation myself.'));form.append(label,text,checkLabel);
   form.addEventListener('submit',e=>{e.preventDefault();learnAction('answer',{quizId:quiz.id,questionId:q.id,value:{text:text.value,confirmed:check.checked}});});
  }else{
   const field=node('fieldset');const legend=node('legend','Choose an answer');field.append(legend);
   for(const [i,option] of q.options.entries()){const label=node('label');const radio=node('input');radio.type='radio';radio.name='answer';radio.value=String(i);radio.required=true;label.append(radio,document.createTextNode(' '+option));field.append(label);}form.append(field);
   form.addEventListener('submit',e=>{e.preventDefault();learnAction('answer',{quizId:quiz.id,questionId:q.id,value:Number(new FormData(form).get('answer'))});});
  }
  const submit=node('button',['practice','work'].includes(q.type)?'Save practice reflection':'Check my answer','secondary-button');submit.type='submit';form.append(submit);card.append(form);practice.append(card);
 }
 if(quiz.finishedAt){const revisit=quiz.questions.find(q=>quiz.answers[q.id]?.correct===false);const topic=data.steps.find(s=>s.id===revisit?.stepId);practice.append(node('p',topic?`Next practice: ${topic.title}. Try it again in a new layout and consult the guide.`:'Next practice: apply one of these operations in a new layout and check the result yourself.','learning-feedback'));}panel.append(practice);
}
