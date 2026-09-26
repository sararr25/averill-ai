const crypto = require('node:crypto');
const workspace = require('./workspace');
const guide = { title: 'Canva: group, layer and align elements', url: 'https://www.canva.com/help/layer-group-align/', checkedAt: '2026-09-26' };
const steps = [
 {id:'select',title:'Select the elements',instruction:'Select one element. Hold Shift while selecting another to make a multiple selection.',help:'Start with two elements already on your page. If an element cannot be selected, stop and check the editor rather than guessing.',question:'You want to select a second element without losing the first. What do you do?',options:['Hold Shift while selecting it','Open the download menu','Delete the first element'],correct:0,explanation:'Shift adds an element to the selection. Practise this with two elements on your page.'},
 {id:'position',title:'Find Position',instruction:'With your elements selected, find Position in the editor toolbar. If it is hidden, check the toolbar’s additional options.',help:'The available options depend on your selection. One element uses the page as its reference; multiple elements can align with each other.',question:'Which control contains alignment and layer options?',options:['Download','Position','Comments'],correct:1,explanation:'Position provides alignment and layer controls. Available choices depend on the selection.'},
 {id:'align',title:'Practise alignment',instruction:'Use an alignment option suitable for the selected elements. Look at the result and decide whether it matches your intended layout.',help:'Try aligning two elements, then undo if the result is not what you intended. Averill cannot confirm their geometry from OCR.',question:'Why can alignment options change when you select more than one element?',options:['The reference can change from the page to the selected elements','Alignment always changes the font','Multiple elements cannot be aligned'],correct:0,explanation:'A single element can align to the page; multiple selected elements can align with one another.'},
 {id:'group',title:'Group and practise moving together',instruction:'Keep the intended elements selected and group them using Command+G on Mac or Ctrl+G on Windows. Move the group and check the result yourself.',help:'Grouping keeps a set of elements together for operations such as moving. Some element types have restrictions; consult the guide if grouping is unavailable.',question:'Which shortcut groups selected elements on a Mac?',options:['Command+P','Command+G','Command+S'],correct:1,explanation:'Command+G groups the selected elements on a Mac. Use Ctrl+G on Windows.'}
];
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
 const session={id:crypto.randomUUID(),ownerId,title:'Canva layout essentials',createdAt:new Date(now).toISOString(),confirmed:[],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};store.sessions.push(session);return session;
}
function record(data,payload,now=new Date()) {
 const ownerId=owner(data);if(!['LinkedIn','Newsletter','Canva'].includes(payload.tool))throw new Error('Choose a supported work activity');
 const note=String(payload.note||'').trim().slice(0,1000);if(note.length<10||payload.confirmed!==true)throw new Error('Describe and confirm what you practised');
 const source=payload.sourceId?usableSources(data).find(s=>s.id===payload.sourceId):null;if(payload.sourceId&&!source)throw new Error('Company source unavailable');
 const session={id:crypto.randomUUID(),ownerId,title:`${payload.tool} practice`,note,createdAt:new Date(now).toISOString(),finishedAt:new Date(now).toISOString(),confirmed:[{id:'work',week:weekKey(now),at:new Date(now).toISOString(),kind:'employee-confirmed'}],excluded:false,source:source?{id:source.id,title:source.title,version:source.version,sha256:source.sha256}:null};state(data).sessions.push(session);return session;
}
function confirm(data,id,stepId,now=new Date()) {const s=sessionFor(data,id);if(s.excluded||s.finishedAt)throw new Error('This session is no longer active');const next=steps[s.confirmed.length];if(!next||next.id!==stepId)throw new Error('Confirm the current step first');s.confirmed.push({id:stepId,at:new Date(now).toISOString(),week:weekKey(now),kind:'employee-confirmed'});if(s.confirmed.length===steps.length)s.finishedAt=new Date(now).toISOString();}
function exclude(data,id){sessionFor(data,id).excluded=true;}
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
 return {configured:true,week:weekKey(now),guide,steps:steps.map(({question,options,correct,explanation,...s})=>s),sessions,quiz:quiz?{...quiz,outdated:quiz.fingerprint!==fingerprint(data,now),questions:quiz.questions.map(({correct,explanation,...q})=>({...q,available:validQuestion(data,q,now)}))}:null};
}
module.exports={start,record,confirm,exclude,beginQuiz,answer,snapshot,weekKey};
