const crypto = require('node:crypto');
const workspace = require('./workspace');
const guide = { title: 'Canva: group, layer and align elements', url: 'https://www.canva.com/help/layer-group-align/', checkedAt: '2026-09-26' };
const canvaExercise = require('./canva-exercise');
// Canva layout essentials, done inside Canva (owner decisions Q3/Q4, 27 October 2026). "auto" steps tick themselves when the
// browser card's design reading shows them (src/canva-exercise.js); "confirm" steps cannot be read from the page and are
// confirmed once, at the end of the page, by the employee.
const steps = [
 {id:'hierarchy',check:'auto',title:'Add a headline and a supporting line',instruction:'In an Instagram post design, add two texts: a short headline and one supporting line.',help:'Use Text › Add a heading, then Add a little bit of body text. Any two texts on the page count.',question:'Why does a post need a headline and a separate supporting line?',options:['So the main message is read first and the detail second','So Canva can export it','So the file is smaller'],correct:0,explanation:'Two clear levels tell the reader what to read first.'},
 {id:'size',check:'auto',title:'Make the headline clearly bigger',instruction:'Set the headline at least one and a half times the size of the supporting line.',help:'Select the headline and raise its font size in the top toolbar until it clearly leads.',question:'The supporting line is 40 px. What is the smallest headline size for this lesson?',options:['44 px','60 px','40 px'],correct:1,explanation:'One and a half times 40 px is 60 px: a size difference the eye notices at once.'},
 {id:'align',check:'auto',title:'Align the two texts',instruction:'Select both texts with Shift, open Position and align their left edges or their centres.',help:'With two elements selected, Position aligns them to each other instead of to the page.',question:'You select two texts and open Position. What do the alignment options use as their reference?',options:['The selected elements','The page border only','The last exported file'],correct:0,explanation:'With more than one element selected, alignment lines them up with each other.'},
 {id:'margin',check:'auto',title:'Keep text away from the edges',instruction:'Leave at least 60 pixels between every text and the edge of a 1080 pixel post.',help:'Drag the texts inward until Canva\'s spacing guides show room on every side.',question:'Why keep text away from the edge of a social post?',options:['Apps crop and overlay the edges, so text there can be hidden','It makes the export faster','Canva requires it'],correct:0,explanation:'Platforms place buttons and crops near the edges; a margin keeps the message visible.'},
 {id:'contrast',check:'auto',title:'Make every text easy to read',instruction:'Choose text and background colours with enough contrast: 4.5 to 1 for normal text, 3 to 1 for large text.',help:'Pale text on a pale photo is the usual problem. Darken the text, or add a solid shape behind it.',question:'Which change usually fixes low contrast on a photo?',options:['Put a solid shape behind the text','Make the text thinner','Lower the export quality'],correct:0,explanation:'A solid shape gives the text a predictable background with enough contrast.'},
 {id:'group',check:'confirm',title:'Group the headline and supporting line',instruction:'Keep both texts selected and press Command+G (Ctrl+G on Windows). Move the group and check that it stays together.',help:'Averill cannot see groups in the page, so you confirm this step yourself at the end.',question:'Which shortcut groups selected elements on a Mac?',options:['Command+P','Command+G','Command+S'],correct:1,explanation:'Command+G groups the selection so it moves as one.'},
];
const projects={
 composition:{title:'Improve a composition',tool:'Canva',demoSource:null,steps:['Choose two related elements and describe the alignment problem.','Use Position or grouping to change the layout; inspect the result in Canva.','Record what improved and what you would still check before export.']},
 linkedin_visual:{title:'Prepare a LinkedIn visual',tool:'LinkedIn',demoSource:'linkedin',steps:['Read the linked campaign source or the supplied LinkedIn guidance and state the approved audience and visual.','Prepare a landscape visual in Canva or the supplied draft; inspect its content and dimensions yourself.','Record the exported file name and how you checked it against the post draft.']},
 newsletter_export:{title:'Export for a newsletter',tool:'Newsletter',demoSource:'brief',steps:['Read the relevant approved email guidance and choose an appropriate visual.','Export the visual yourself from Canva, then inspect the downloaded file.','Record the file name and how you applied or would apply it to the newsletter draft.']},
};
function weekKey(now = new Date()) {
 const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now)).map(p=>[p.type,p.value]));
 const day = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`); day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7)); return day.toISOString().slice(0,10);
}
function owner(data) { const person= data && workspace.person(data); if(!person) throw new Error('Create a workspace and select a person first'); return person.id; }
function state(data) { return data.learning ||= {sessions:[], quizzes:[]}; }
function usableSources(data) {const conflicts=new Set(workspace.conflicts(data).flat());return workspace.approvedSources(data).filter(s=>!conflicts.has(s.id));}
function sourceNow(data,ref) {return ref && usableSources(data).find(s=>s.id===ref.id && s.sha256===ref.sha256 && s.version===ref.version);}
function sessionFor(data,id) {const s=state(data).sessions.find(s=>s.id===id&&s.ownerId===owner(data));if(!s)throw new Error('Learning session unavailable');return s;}
function start(data, sourceId, now=new Date()) {
 const ownerId=owner(data);const store=state(data);const active=store.sessions.find(s=>s.ownerId===ownerId&&!s.finishedAt&&!s.excluded);
 if(active)return active;
 const source=sourceId ? usableSources(data).find(s=>s.id===sourceId):null;if(sourceId&&!source)throw new Error('Choose a visible, approved source without a conflict');
 const session={id:crypto.randomUUID(),ownerId,title:'Canva layout essentials',lesson:'canva',checks:{},live:null,createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};store.sessions.push(session);return session;
}
function record(data,payload,now=new Date()) {
 const ownerId=owner(data);if(!['LinkedIn','Newsletter','Canva'].includes(payload.tool))throw new Error('Choose a supported work activity');
 const note=String(payload.note||'').trim().slice(0,1000);if(note.length<10||payload.confirmed!==true)throw new Error('Describe and confirm what you practised');
 const source=payload.sourceId?usableSources(data).find(s=>s.id===payload.sourceId):null;if(payload.sourceId&&!source)throw new Error('Company source unavailable');
 const session={id:crypto.randomUUID(),ownerId,title:`${payload.tool} practice`,note,createdAt:new Date(now).toISOString(),finishedAt:new Date(now).toISOString(),confirmed:[{id:'work',week:weekKey(now),at:new Date(now).toISOString(),kind:'employee-confirmed'}],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};state(data).sessions.push(session);return session;
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
 const session={id:crypto.randomUUID(),ownerId,title:template.title,createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null,project:{id:projectId,tool:template.tool,demoSource:template.demoSource,steps:template.steps,notes:[]}};state(data).sessions.push(session);return session;
}
function confirmProject(data,id,note,now=new Date()){
 const session=sessionFor(data,id);if(!session.project||session.excluded||session.finishedAt)throw new Error('Project unavailable');
 const text=String(note||'').trim().slice(0,1000);if(text.length<10)throw new Error('Describe the result of this step');
 const index=session.project.notes.length;if(index>=session.project.steps.length)throw new Error('Project already complete');
 session.project.notes.push(text);session.confirmed.push({id:`project:${index}`,week:weekKey(now),at:new Date(now).toISOString(),kind:'employee-confirmed'});
 if(session.project.notes.length===session.project.steps.length){session.note=session.project.notes.join(' · ');session.finishedAt=new Date(now).toISOString();}
 return session;
}
function activeLesson(data){return state(data).sessions.find(s=>s.ownerId===owner(data)&&!s.finishedAt&&!s.excluded&&!s.exercise&&!s.project&&s.title==='Canva layout essentials')||null;}
// A design reading from the Canva card: tick the steps it shows. A ticked step stays ticked; "now" says what the design shows today.
function checkDesign(data,reading,now=new Date()){
 const session=activeLesson(data);if(!session)return null;
 const result=canvaExercise.evaluate(reading);session.checks||={};
 for(const id of canvaExercise.AUTO_STEPS)if(result[id]&&!session.checks[id])session.checks[id]=new Date(now).toISOString();
 session.live={at:new Date(now).toISOString(),result};
 return {sessionId:session.id,title:session.title,steps:steps.map(step=>({id:step.id,title:step.title,check:step.check,done:step.check==='auto'&&Boolean(session.checks[step.id]),now:step.check==='auto'?Boolean(result[step.id]):null}))};
}
// One confirmation for the whole page: Averill-checked steps are recorded as such, the rest as confirmed by the employee.
// Without Canva (selfConfirmAll), every step is the employee's own confirmation and is labelled that way.
function finish(data,id,{selfConfirmAll=false}={},now=new Date()){
 const s=sessionFor(data,id);if(s.excluded||s.finishedAt)throw new Error('This session is no longer active');
 const checks=s.checks||{};const missing=steps.filter(step=>step.check==='auto'&&!checks[step.id]);
 if(missing.length&&!selfConfirmAll)throw new Error(`Averill has not seen these steps in your Canva design yet: ${missing.map(step=>step.title).join('; ')}.`);
 const at=new Date(now).toISOString(),done=new Set(s.confirmed.map(c=>c.id));
 for(const step of steps)if(!done.has(step.id))s.confirmed.push({id:step.id,at,week:weekKey(now),kind:step.check==='auto'&&checks[step.id]?'checked-by-averill':'employee-confirmed'});
 s.finishedAt=at;return s;
}
function exclude(data,id){sessionFor(data,id).excluded=true;}
function deleteHistory(data){const id=owner(data),store=state(data);store.sessions=store.sessions.filter(session=>session.ownerId!==id);store.quizzes=store.quizzes.filter(quiz=>quiz.ownerId!==id);}
function eligible(data,now) {return state(data).sessions.filter(s=>s.ownerId===owner(data)&&!s.excluded&&s.confirmed.some(c=>c.week===weekKey(now)));}
function validQuestion(data,q,now) {const sessions=eligible(data,now); if(q.type==='work')return sessions.some(s=>s.id===q.sessionId); if(q.type==='source')return sessions.some(s=>s.id===q.sessionId&&sourceNow(data,q.source));return sessions.some(s=>s.confirmed.some(c=>c.week===weekKey(now)&&c.id===q.stepId));}
function fingerprint(data,now){return JSON.stringify(eligible(data,now).map(s=>[s.id,s.confirmed.filter(c=>c.week===weekKey(now)).map(c=>c.id),sourceNow(data,s.source)?.sha256||null]));}
function beginQuiz(data,now=new Date()) {
 const sessions=eligible(data,now);if(!sessions.length)throw new Error('Confirm a learning step this week before starting practice');
 const store=state(data),ownerId=owner(data),week=weekKey(now);
 const existing=store.quizzes.find(q=>q.ownerId===ownerId&&q.week===week&&!q.finishedAt&&q.fingerprint===fingerprint(data,now)&&q.questions.every(x=>validQuestion(data,x,now)));if(existing)return existing;
 const learned=new Set(sessions.flatMap(s=>s.confirmed.filter(c=>c.week===week).map(c=>c.id)));
 const questions=steps.filter(s=>learned.has(s.id)).slice(-2).map(s=>({id:crypto.randomUUID(),type:'choice',stepId:s.id,prompt:s.question,options:s.options,correct:s.correct,explanation:s.explanation,guide}));
 const linked=sessions.find(s=>sourceNow(data,s.source));
 if(linked){const source=sourceNow(data,linked.source);questions.push({id:crypto.randomUUID(),type:'source',sessionId:linked.id,source:linked.source,prompt:`Before using ${source.title} in your campaign, what should you check?`,options:['Its current approval and version, then the instructions in the source','Only the file name','Whether a colleague used it once'],correct:0,explanation:`Open the current approved source and read its actual instructions. Version ${source.version} was linked to your session; this exercise does not infer its content.`});}
 const work=[...sessions].reverse().find(s=>s.note);if(work)questions.push({id:crypto.randomUUID(),type:'work',sessionId:work.id,prompt:`Reflect on your recorded ${work.title}: ${work.note.replace(/[.!?]+$/,'')}. Describe how you would apply this again and what you would check.`,explanation:'Compare your reflection with the activity you confirmed. Reopen current company guidance if needed; this reflection is not automatically graded.'});
 const skill=steps.find(s=>learned.has(s.id));if(skill)questions.push({id:crypto.randomUUID(),type:'practice',stepId:skill.id,prompt:`Practise “${skill.title}” in your design. Then explain what you did and one point you would check next time.`,explanation:skill.help,guide});
 const quiz={id:crypto.randomUUID(),ownerId,week,fingerprint:fingerprint(data,now),createdAt:new Date(now).toISOString(),questions,answers:{}};store.quizzes.push(quiz);return quiz;
}
function answer(data,quizId,questionId,value,now=new Date()) {
 const quiz=state(data).quizzes.find(q=>q.id===quizId&&q.ownerId===owner(data));if(!quiz||quiz.week!==weekKey(now))throw new Error('Start practice for the current week');
 const question=quiz.questions.find(q=>q.id===questionId);if(!question||!validQuestion(data,question,now))throw new Error('Learning record or source changed. Start a new practice set');
 if(quiz.answers[questionId])throw new Error('This answer is already saved');
 const result=['practice','work'].includes(question.type)?{text:String(value?.text||'').trim().slice(0,1000),confirmed:value?.confirmed===true}: {choice:value};
 if(['practice','work'].includes(question.type)){if(result.text.length<10||!result.confirmed)throw new Error('Describe your practice and confirm that you tried it');result.feedback='Practice reflection saved. Self-confirmed, not visually assessed. '+question.explanation;}
 else {if(!Number.isInteger(value)||value<0||value>=question.options.length)throw new Error('Choose an answer');result.correct=value===question.correct;result.feedback=(result.correct?'That matches the guidance. ':'Try this reasoning: ')+question.explanation;}
 quiz.answers[questionId]=result;if(quiz.questions.every(q=>quiz.answers[q.id]))quiz.finishedAt=new Date(now).toISOString();
}
function snapshot(data,now=new Date()) {
 if(!data||!workspace.person(data))return {configured:false};const id=owner(data),store=data.learning||{sessions:[],quizzes:[]};
 const sessions=store.sessions.filter(s=>s.ownerId===id).map(s=>({...s,sourceAvailable:!!sourceNow(data,s.source)}));
 const quiz=[...store.quizzes].reverse().find(q=>q.ownerId===id&&q.week===weekKey(now));
 return {configured:true,week:weekKey(now),guide,steps:steps.map(({question,options,correct,explanation,...s})=>s),projects:Object.entries(projects).map(([id,item])=>({id,title:item.title,tool:item.tool})),sessions,quiz:quiz?{...quiz,outdated:quiz.fingerprint!==fingerprint(data,now),questions:quiz.questions.map(({correct,explanation,...q})=>({...q,available:validQuestion(data,q,now)}))}:null};
}
module.exports={start,record,startFinding,completeFinding,startProject,confirmProject,checkDesign,finish,exclude,deleteHistory,beginQuiz,answer,snapshot,weekKey};
