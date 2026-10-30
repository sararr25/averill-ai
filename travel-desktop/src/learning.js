const crypto = require('node:crypto');
const workspace = require('./workspace');
const guide = { title: 'Canva: group, layer and align elements', url: 'https://www.canva.com/help/layer-group-align/', checkedAt: '2026-09-26' };
const canvaExercise = require('./canva-exercise');
const bank = require('./practice-bank');
const ruleExercises = require('./rule-exercises');
// Canva layout essentials, done inside Canva (owner decisions Q3/Q4, 27 October 2026). "auto" steps tick themselves when the
// browser card's design reading shows them (src/canva-exercise.js); "confirm" steps cannot be read from the page and are
// confirmed once, at the end of the page, by the employee.
const steps = [
 {id:'hierarchy',check:'auto',title:'Add a headline and a supporting line',instruction:'In an Instagram post design, add two texts: a short headline and one supporting line.',help:'Use Text › Add a heading, then Add a little bit of body text. Any two texts on the page count.',question:'Why does a post need a headline and a separate supporting line?',options:['So the main message is read first and the detail second','So Canva can export it','So the file is smaller'],correct:0,explanation:'Two clear levels tell the reader what to read first.'},
 {id:'size',check:'auto',title:'Make the headline clearly bigger',instruction:'Set the headline at least one and a half times the size of the supporting line.',help:'Select the headline and raise its font size in the top toolbar until it clearly leads.',question:'The supporting line is 40 px. What is the smallest headline size for this lesson?',options:['44 px','60 px','40 px'],correct:1,explanation:'One and a half times 40 px is 60 px: a size difference the eye notices at once.'},
 {id:'align',check:'auto',title:'Align the two texts',instruction:'Select both texts with Shift, open Position and align their left edges or their centres.',help:'With two elements selected, Position aligns them to each other instead of to the page.',question:'You select two texts and open Position. What do the alignment options use as their reference?',options:['The selected elements','The page border only','The last exported file'],correct:0,explanation:'With more than one element selected, alignment lines them up with each other.'},
 {id:'margin',check:'auto',title:'Keep text away from the edges',instruction:'Leave at least 60 pixels between every text and the edge of a 1080 pixel post.',help:'Drag the texts inward until Canva\'s spacing guides show room on every side.',question:'Why keep text away from the edge of a social post?',options:['Apps crop and overlay the edges, so text there can be hidden','It makes the export faster','Canva requires it'],correct:0,explanation:'Platforms place buttons and crops near the edges; a margin keeps the message visible.'},
 {id:'contrast',check:'auto',title:'Make every text easy to read',instruction:'Choose text and background colours with enough contrast: 4.5 to 1 for normal text, 3 to 1 for large text.',help:'Pale text on a pale photo is the usual problem. Darken the text, or add a solid shape behind it.',question:'Which change usually fixes low contrast on a photo?',options:['Put a solid shape behind the text','Make the text thinner','Lower the export quality'],correct:0,explanation:'A solid shape gives the text a predictable background with enough contrast.'},
 {id:'group',check:'confirm',title:'Group the headline and supporting line',instruction:'Keep both texts selected and choose Group in the editor toolbar. Move the group and check that it stays together.',help:'Averill cannot see groups in the page, so you confirm this step yourself at the end.',question:'Which shortcut groups selected elements on a Mac?',options:['Command+P','Command+G','Command+S'],correct:1,explanation:'Command+G groups the selection so it moves as one.'},
];
// Task-based exercises (T7.3): all steps on one page and one confirmation at the end. A step with `auto` ticks itself from the
// Canva card's design reading (same reading as the lesson); the rest cannot be seen by Averill and are confirmed once.
const projects={
 composition:{title:'Improve a composition',tool:'Canva',demoSource:null,steps:['Choose two related elements in Canva: a headline and a supporting line.','Use Position to align them, then inspect the result.','Note what improved and what you would still check before export.'],auto:['hierarchy','align',null]},
 linkedin_visual:{title:'Prepare a LinkedIn visual',tool:'LinkedIn',demoSource:'linkedin',steps:['Read the linked campaign source or the supplied LinkedIn guidance and state the approved audience and visual.','Prepare a landscape visual in Canva or the supplied draft; inspect its content and dimensions yourself.','Record the exported file name and how you checked it against the post draft.'],auto:[null,null,null]},
 newsletter_export:{title:'Export for a newsletter',tool:'Newsletter',demoSource:'brief',steps:['Read the relevant approved email guidance and choose an appropriate visual.','Export the visual yourself from Canva, then inspect the downloaded file.','Record the file name and how you applied or would apply it to the newsletter draft.'],auto:[null,null,null]},
};
function weekKey(now = new Date()) {
 const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)).map(p=>[p.type,p.value]));
 const day = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`); day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7)); return day.toISOString().slice(0,10);
}
function owner(data) { const person= data && workspace.person(data); if(!person) throw new Error('Create a workspace and select a person first'); return person.id; }
function state(data) { return data.learning ||= {sessions:[], quizzes:[]}; }
function usableSources(data) {const conflicts=new Set(workspace.conflicts(data).flat());return workspace.approvedSources(data).filter(s=>!conflicts.has(s.id));}
function sourceNow(data,ref) {return ref && usableSources(data).find(s=>s.id===ref.id && s.sha256===ref.sha256 && s.version===ref.version);}
const isLesson=s=>s.title==='Canva layout essentials'&&!s.exercise&&!s.project&&!s.note;
// T7.4: a lesson saved before D1 has no `lesson` and no `checks`. It is upgraded in place when it is opened: nothing is deleted,
// the steps the person already confirmed stay as their own confirmations (never relabelled as checked by Averill), and the
// page now shows all six steps with automatic ticks. Task exercises saved before T7.3 get an empty `checks`.
function adopt(s){
 if(isLesson(s)&&(!('lesson' in s)||!('checks' in s))){s.lesson||='canva';s.checks||={};s.live||=null;s.migrated={from:'before-d1',keptConfirmations:s.confirmed.length};}
 if(s.project&&!s.project.checks)s.project.checks={};
 return s;
}
function sessionFor(data,id) {const s=state(data).sessions.find(s=>s.id===id&&s.ownerId===owner(data));if(!s)throw new Error('Learning session unavailable');return adopt(s);}
function start(data, sourceId, now=new Date()) {
 const ownerId=owner(data);const store=state(data);const active=store.sessions.find(s=>s.ownerId===ownerId&&!s.finishedAt&&!s.excluded&&isLesson(s));
 if(active)return adopt(active);
 const source=sourceId ? usableSources(data).find(s=>s.id===sourceId):null;if(sourceId&&!source)throw new Error('Choose a visible, approved source without a conflict');
 const session={id:crypto.randomUUID(),ownerId,title:'Canva layout essentials',lesson:'canva',checks:{},live:null,createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};store.sessions.push(session);return session;
}
function record(data,payload,now=new Date()) {
 const ownerId=owner(data);if(!['LinkedIn','Newsletter','Canva'].includes(payload.tool))throw new Error('Choose a supported work activity');
 const note=String(payload.note||'').trim().slice(0,1000);if(note.length<10||payload.confirmed!==true)throw new Error('Describe and confirm what you practised');
 const source=payload.sourceId?usableSources(data).find(s=>s.id===payload.sourceId):null;if(payload.sourceId&&!source)throw new Error('Company source unavailable');
 const session={id:crypto.randomUUID(),ownerId,title:`${payload.tool} practice`,note,createdAt:new Date(now).toISOString(),finishedAt:new Date(now).toISOString(),confirmed:(Array.isArray(payload.skills)&&payload.skills.some(id=>steps.some(s=>s.id===id)||id==='email-footer')?[...new Set(payload.skills)].filter(id=>steps.some(s=>s.id===id)||id==='email-footer'):['work']).map(id=>({id,week:weekKey(now),at:new Date(now).toISOString(),kind:'employee-confirmed'})),skills:Array.isArray(payload.skills)?payload.skills.filter(id=>steps.some(s=>s.id===id)||id==='email-footer'):[],tool:payload.tool,profile:workspace.person(data)?.profile||workspace.person(data)?.role,guidance:Array.isArray(payload.guidance)?payload.guidance.filter(g=>typeof g.url==='string'&&/^https:\/\//.test(g.url)).slice(0,3):[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};state(data).sessions.push(session);return session;
}
function startFinding(data, finding, now=new Date()) {
 const ownerId=owner(data);
 if(!finding||!['email','linkedin','social','handover'].includes(finding.kind)||!finding.id||!finding.source?.id)throw new Error('Choose a supported finding');
 const existing=state(data).sessions.find(s=>s.ownerId===ownerId&&!s.excluded&&!s.finishedAt&&s.exercise?.kind===finding.kind&&s.exercise?.findingId===finding.id);
 if(existing)return existing;
 const session={id:crypto.randomUUID(),ownerId,title:`${finding.kind} correction practice`,createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,exercise:{kind:finding.kind,findingId:finding.id,title:finding.title,problem:finding.body,action:finding.action,source:{id:finding.source.id,title:finding.source.title,version:finding.source.id==='brief'?'2':finding.source.id==='oldBrief'?'1':null},before:'Finding present in the shared demo work',after:null,check:'pending'}};
 state(data).sessions.push(session);return session;
}
function completeFinding(data,id,reflection,check,now=new Date()){
 const session=sessionFor(data,id);if(!session.exercise||session.excluded||session.finishedAt)throw new Error('Finding exercise unavailable');
 const text=String(reflection||'').trim().slice(0,1000);if(text.length<10)throw new Error('Describe what you changed and checked');
 if(!['rule-clear','still-found','not-checked'].includes(check))throw new Error('Invalid review result');
 session.note=text;session.exercise.after=check==='rule-clear'?'The original deterministic finding is no longer present.':check==='still-found'?'The finding is still present.':'No live field check was available.';session.exercise.check=check;
 session.confirmed.push({id:'work',week:weekKey(now),at:new Date(now).toISOString(),kind:'employee-confirmed'});session.finishedAt=new Date(now).toISOString();return session;
}
function startProject(data,projectId,sourceId,now=new Date()){
 const template=projects[projectId];if(!template)throw new Error('Unknown practice project');
 const ownerId=owner(data);const existing=state(data).sessions.find(session=>session.ownerId===ownerId&&!session.excluded&&!session.finishedAt&&session.project?.id===projectId);if(existing)return existing;
 const source=sourceId?usableSources(data).find(item=>item.id===sourceId):null;if(sourceId&&!source)throw new Error('Choose a visible approved source without a conflict');
 const session={id:crypto.randomUUID(),ownerId,title:template.title,createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null,project:{id:projectId,tool:template.tool,demoSource:template.demoSource,steps:template.steps,notes:[],checks:{}}};state(data).sessions.push(session);return session;
}
// One confirmation for the whole exercise page. Steps Averill saw in the design are recorded as checked-by-averill, the others as
// confirmed by the employee. Without a connected design (selfConfirmAll) every step is the employee's own confirmation.
// Steps confirmed one by one before T7.3 stay as they were recorded.
function finishProject(data,id,{note='',selfConfirmAll=false}={},now=new Date()){
 const session=sessionFor(data,id);if(!session.project||session.excluded||session.finishedAt)throw new Error('Project unavailable');
 const template=projects[session.project.id],autos=template?.auto||[],checks=session.project.checks||{},done=new Set(session.confirmed.map(c=>c.id));
 const pending=session.project.steps.map((text,index)=>({text,index,auto:autos[index]||null})).filter(step=>!done.has(`project:${step.index}`));
 const missing=pending.filter(step=>step.auto&&!checks[step.auto]);
 if(missing.length&&!selfConfirmAll)throw new Error(`Averill has not seen these steps in your Canva design yet: ${missing.map(step=>step.text).join(' ')}`);
 const text=String(note||'').trim().slice(0,1000),at=new Date(now).toISOString();
 for(const step of pending)session.confirmed.push({id:`project:${step.index}`,week:weekKey(now),at,kind:!selfConfirmAll&&step.auto&&checks[step.auto]?'checked-by-averill':'employee-confirmed'});
 if(text){session.note=text;session.project.notes.push(text);}
 session.finishedAt=at;return session;
}
function activeLesson(data){const s=state(data).sessions.find(s=>s.ownerId===owner(data)&&!s.finishedAt&&!s.excluded&&isLesson(s));return s?adopt(s):null;}
// A design reading from the Canva card: tick the steps it shows. A ticked step stays ticked; "now" says what the design shows today.
// Current measurements are revocable; previously seen steps and completed history remain intact.
function invalidateDesign(data,now=new Date()){
 if(!data||!workspace.person(data))return false;
 const id=owner(data),store=state(data);let changed=false;
 for(const session of store.sessions)if(session.ownerId===id&&!session.finishedAt&&!session.excluded){
  if(session.live){delete session.live;changed=true;}
  if(session.project&&Object.keys(session.project.checks||{}).length){session.project.checks={};changed=true;}
 }
 for(const quiz of store.quizzes)if(quiz.ownerId===id&&!quiz.finishedAt&&Object.keys(quiz.taskChecks||{}).length){quiz.taskChecks={};changed=true;}
 return changed;
}
function checkDesign(data,reading,now=new Date()){
 const session=activeLesson(data);if(!session)return null;
 const result=canvaExercise.evaluate(reading);session.checks||={};
 for(const id of canvaExercise.AUTO_STEPS)if(result[id]&&!session.checks[id])session.checks[id]=new Date(now).toISOString();
 session.live={at:new Date(now).toISOString(),result};
 return {sessionId:session.id,title:session.title,steps:steps.map(step=>({id:step.id,title:step.title,check:step.check,done:step.check==='auto'&&Boolean(result[step.id]),seenBefore:Boolean(session.checks[step.id]),now:step.check==='auto'?Boolean(result[step.id]):null}))};
}
// One confirmation for the whole page: Averill-checked steps are recorded as such, the rest as confirmed by the employee.
// Without Canva (selfConfirmAll), every step is the employee's own confirmation and is labelled that way.
function finish(data,id,{selfConfirmAll=false}={},now=new Date()){
 const s=sessionFor(data,id);if(s.excluded||s.finishedAt)throw new Error('This session is no longer active');
 const checks=s.checks||{};const missing=steps.filter(step=>step.check==='auto'&&!(s.live?.result?.[step.id]));
 if(missing.length&&!selfConfirmAll)throw new Error(`Averill has not seen these steps in your Canva design yet: ${missing.map(step=>step.title).join('; ')}.`);
 const at=new Date(now).toISOString(),done=new Set(s.confirmed.map(c=>c.id));
 for(const step of steps)if(!done.has(step.id))s.confirmed.push({id:step.id,at,week:weekKey(now),kind:!selfConfirmAll&&step.check==='auto'&&s.live?.result?.[step.id]?'checked-by-averill':'employee-confirmed'});
 s.finishedAt=at;return s;
}
function exclude(data,id){sessionFor(data,id).excluded=true;}
function deleteHistory(data){const id=owner(data),store=state(data);store.sessions=store.sessions.filter(session=>session.ownerId!==id);store.quizzes=store.quizzes.filter(quiz=>quiz.ownerId!==id);}
function eligible(data,now) {return state(data).sessions.filter(s=>s.ownerId===owner(data)&&!s.excluded&&s.confirmed.some(c=>c.week===weekKey(now)));}
function skillsFor(s,week){const ids=s.confirmed.filter(c=>c.week===week).map(c=>c.id);if((s.tool==='Newsletter'||/^Newsletter|^Brevo/.test(s.title))&&/footer|unsubscribe/i.test(s.note||''))ids.push('email-footer');return [...new Set(ids)];}
function validQuestion(data,q,now) {
 const sessions=eligible(data,now),week=weekKey(now);
 if(q.sessionId&&!sessions.some(s=>s.id===q.sessionId&&(!q.source||sourceNow(data,q.source))))return false;
 if(q.ruleItemId&&!ruleExercises.available(data).some(item=>item.id===q.ruleItemId))return false;
 if(q.ruleRef&&!bank.ruleStillApproved(data,q.ruleRef))return false;
 if(q.stepId&&!sessions.some(s=>skillsFor(s,week).includes(q.stepId)))return false;
 return sessions.length>0;
}
function fingerprint(data,now){return JSON.stringify(eligible(data,now).map(s=>[s.id,s.confirmed.filter(c=>c.week===weekKey(now)).map(c=>c.id),sourceNow(data,s.source)?.sha256||null]));}
// Weekly practice (T7.0/T7.1): one page, every question a picture-based multiple choice, task or order question. `version: 2`
// separates it from the older per-question quizzes, which stay in the person's history untouched.
function beginQuiz(data,now=new Date()) {
 const sessions=eligible(data,now);if(!sessions.length)throw new Error('Confirm a learning step this week before starting practice');
 const store=state(data),ownerId=owner(data),week=weekKey(now);
 const existing=store.quizzes.find(q=>q.version===2&&q.relevanceVersion===3&&q.ownerId===ownerId&&q.week===week&&!q.finishedAt&&q.fingerprint===fingerprint(data,now)&&q.questions.every(x=>validQuestion(data,x,now)));if(existing)return existing;
 const learned=new Set(sessions.flatMap(s=>skillsFor(s,week)));
 const all=bank.entries(data),related=all.filter(e=>e.steps.some(id=>learned.has(id)));
 // One question of each answer type, from what the person practised; a shorter quiz is better than unrelated filler.
 const chosen=[];for(const type of ['picture','tap','order','text-picture']){const pick=related.find(e=>e.type===type);if(pick&&!chosen.includes(pick))chosen.push(pick);}
 const questions=chosen.map(entry=>{const q=bank.instantiate(entry);const s=sessions.find(s=>skillsFor(s,week).some(id=>entry.steps.includes(id)));if(s){q.sessionId=s.id;q.source=s.source||null;q.stepId=skillsFor(s,week).find(id=>entry.steps.includes(id));}return q;});
 const linked=sessions.find(s=>sourceNow(data,s.source));
 const practisedSources=new Set(sessions.map(s=>sourceNow(data,s.source)?.id).filter(Boolean));
 const item=ruleExercises.available(data).find(item=>practisedSources.has(item.sourceId));
 if(item)questions.push(bank.ruleItemQuestion(item,data.sources.find(x=>x.id===item.sourceId)?.title||''));
 if(!questions.length && !learned.has('email-footer'))throw new Error('Not enough relevant practice yet. Complete a tool lesson or an exercise linked to an approved rule, then try again.');
 const auto=[...steps].reverse().find(step=>step.check==='auto'&&learned.has(step.id));if(auto)questions.push(bank.taskQuestion(auto));
 if(learned.has('email-footer'))questions.push(bank.brevoTask());
 questions.sort((x,y)=>bank.TYPE_ORDER.indexOf(x.type)-bank.TYPE_ORDER.indexOf(y.type));
 const quiz={id:crypto.randomUUID(),version:2,relevanceVersion:3,ownerId,week,fingerprint:fingerprint(data,now),createdAt:new Date(now).toISOString(),questions,results:{},taskChecks:{},attempt:1,history:[]};store.quizzes.push(quiz);return quiz;
}
function currentQuiz(data,quizId,now){
 const quiz=state(data).quizzes.find(q=>q.id===quizId&&q.ownerId===owner(data)&&q.version===2);
 if(!quiz||quiz.week!==weekKey(now)||quiz.relevanceVersion!==3)throw new Error('Start practice for the current week with questions relevant to your work');return quiz;
}
function answered(question,value){
 if(question.type==='tap')return typeof value==='string'&&question.areas.some(a=>a.id===value);
 if(question.type==='order')return Array.isArray(value)&&value.length===question.items.length&&new Set(value).size===value.length&&value.every(id=>question.items.some(item=>item.id===id));
 return typeof value==='string'&&question.options.some(o=>o.id===value);
}
const sameOrder=(a,b)=>a.length===b.length&&a.every((id,index)=>id===b[index]);
// The single "Submit practice": every open question needs an answer, the one page confirmation covers the tasks Averill did not see,
// and nothing is stored unless the whole submission is valid.
function submitQuiz(data,quizId,payload={},now=new Date()) {
 const quiz=currentQuiz(data,quizId,now),answers=payload&&typeof payload.answers==='object'&&payload.answers&&!Array.isArray(payload.answers)?payload.answers:{};
 if(quiz.fingerprint!==fingerprint(data,now))throw new Error('Your learning record changed. Start a new practice set');
 const open=quiz.questions.filter(q=>!quiz.results[q.id]);if(!open.length)throw new Error('This practice is already submitted');
 if(!open.every(q=>validQuestion(data,q,now)))throw new Error('Learning record or source changed. Start a new practice set');
 const unanswered=open.filter(q=>q.type!=='task'&&!answered(q,answers[q.id]));
 if(unanswered.length)throw new Error(`Answer every question before you submit: ${unanswered.length} left.`);
 const seen=q=>q.task.check==='auto'&&Boolean(quiz.taskChecks[q.task.step]);
 const unseen=open.filter(q=>q.type==='task'&&!seen(q));
 if(unseen.length&&payload.tried!==true)throw new Error('Confirm that you tried these tasks yourself.');
 const at=new Date(now).toISOString();
 for(const q of open){
  if(q.type==='task'){quiz.results[q.id]={done:true,kind:seen(q)?'checked-by-averill':'employee-confirmed',at};continue;}
  const value=q.type==='order'?[...answers[q.id]]:answers[q.id];
  quiz.results[q.id]={value,correct:q.type==='order'?sameOrder(value,q.correct):value===q.correct,at};
 }
 if(unseen.length)quiz.confirmation={at,week:weekKey(now),kind:'employee-confirmed'};
 const scored=quiz.questions.filter(q=>q.type!=='task');
 quiz.history.push({at,attempt:quiz.attempt,right:scored.filter(q=>quiz.results[q.id]?.correct).length,total:scored.length});
 quiz.finishedAt=at;return quiz;
}
// Retry only the wrong answers: right answers and finished tasks stay as they are.
function retryQuiz(data,quizId,now=new Date()) {
 const quiz=currentQuiz(data,quizId,now),wrong=quiz.questions.filter(q=>quiz.results[q.id]?.correct===false);
 if(!wrong.length)throw new Error('There are no wrong answers to retry');
 for(const q of wrong)delete quiz.results[q.id];
 delete quiz.finishedAt;quiz.attempt+=1;return quiz;
}
// The only free text left in practice: an optional note after the result, never graded.
function saveQuizNote(data,quizId,text,now=new Date()) {
 const quiz=currentQuiz(data,quizId,now);if(!quiz.finishedAt)throw new Error('Submit the practice first');
 quiz.note=String(text||'').trim().slice(0,1000);return quiz;
}
// A design reading also ticks the Canva tasks of this week's practice and the automatic steps of open task exercises.
function tickPractice(data,reading,now=new Date()) {
 const id=owner(data),store=state(data),week=weekKey(now),result=canvaExercise.evaluate(reading),at=new Date(now).toISOString();let changed=false;
 const quiz=[...store.quizzes].reverse().find(q=>q.version===2&&q.ownerId===id&&q.week===week&&!q.finishedAt);
 // Pending checks describe the latest reading; completed records remain historical.
 const update=(checks,step)=>{
  if(result[step]&&!checks[step]){checks[step]=at;changed=true;}
  else if(!result[step]&&checks[step]){delete checks[step];changed=true;}
 };
 if(quiz)for(const q of quiz.questions)if(q.type==='task'&&q.task.check==='auto'&&!quiz.results[q.id])update(quiz.taskChecks,q.task.step);
 for(const s of store.sessions)if(s.ownerId===id&&s.project&&!s.finishedAt&&!s.excluded){adopt(s);for(const auto of projects[s.project.id]?.auto||[])if(auto)update(s.project.checks,auto);}
 return changed;
}
const label=(list,id)=>list.find(x=>x.id===id)?.label||'';
function view(data,quiz,q,now){
 const base={id:q.id,type:q.type,typeLabel:bank.TYPE_LABEL[q.type],prompt:q.prompt,picture:q.picture,stepId:q.stepId||null,source:q.source||null,available:validQuestion(data,q,now)};
 if(q.options)base.options=q.options;if(q.areas)base.areas=q.areas;if(q.items)base.items=q.items;
 if(q.type==='task')Object.assign(base,{tool:q.tool,task:q.task,ticked:q.task.check==='auto'&&Boolean(quiz.taskChecks[q.task.step])});
 const r=quiz.results[q.id];if(!r)return base;
 if(q.type==='task')return {...base,result:{done:true,kind:r.kind,explanation:q.explanation}};
 const yours=q.type==='tap'?label(q.areas,r.value):q.type==='order'?r.value.map(id=>label(q.items,id)).join(' → '):label(q.options,r.value);
 const right=q.type==='tap'?label(q.areas,q.correct):q.type==='order'?q.correct.map(id=>label(q.items,id)).join(' → '):label(q.options,q.correct);
 return {...base,result:{correct:r.correct,value:r.value,answer:q.correct,yours,right,explanation:q.explanation,rule:q.rule||null}};
}
function snapshot(data,now=new Date()) {
 if(!data||!workspace.person(data))return {configured:false};const id=owner(data),store=data.learning||{sessions:[],quizzes:[]};
 const sessions=store.sessions.filter(s=>s.ownerId===id).map(s=>({...adopt({...s,project:s.project&&{...s.project}}),sourceAvailable:!!sourceNow(data,s.source)})).map(s=>s.project?{...s,project:{...s.project,auto:projects[s.project.id]?.auto||[]}}:s);
 const mine=store.quizzes.filter(q=>q.ownerId===id&&q.week===weekKey(now));
 const quiz=[...mine].reverse().find(q=>q.version===2);
 const earlier=mine.filter(q=>q.version!==2).map(q=>({answered:Object.keys(q.answers||{}).length,total:q.questions.length}))[0]||null;
 let view2=null;
 if(quiz){const scored=quiz.questions.filter(q=>q.type!=='task'&&quiz.results[q.id]);view2={id:quiz.id,week:quiz.week,attempt:quiz.attempt,finishedAt:quiz.finishedAt||null,note:quiz.note||'',confirmation:quiz.confirmation||null,outdated:quiz.relevanceVersion!==3||quiz.fingerprint!==fingerprint(data,now),score:quiz.finishedAt?{right:scored.filter(q=>quiz.results[q.id].correct).length,total:scored.length}:null,questions:quiz.questions.map(q=>view(data,quiz,q,now))};}
 return {configured:true,week:weekKey(now),guide,steps:steps.map(({question,options,correct,explanation,...s})=>s),projects:Object.entries(projects).map(([id,item])=>({id,title:item.title,tool:item.tool})),sessions,quiz:view2,earlierPractice:earlier};
}
module.exports={invalidateDesign,start,record,startFinding,completeFinding,startProject,finishProject,checkDesign,tickPractice,finish,exclude,deleteHistory,beginQuiz,submitQuiz,retryQuiz,saveQuizNote,snapshot,weekKey};
