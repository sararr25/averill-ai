const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const workspace=require('../src/workspace');const learning=require('../src/learning');
const now=new Date('2026-09-26T10:00:00Z');
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'averill-learning-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const data=workspace.create(dir,'Test company','Admin');return {dir,data};}
test('learning persists; weekly practice is one page with one submit and feedback for every answer',t=>{
 const {dir,data}=fixture(t);const s=learning.start(data,null,now);workspace.save(dir,data);const loaded=workspace.load(dir);
 assert.equal(learning.start(loaded,null,now).id,s.id);assert.throws(()=>learning.finish(loaded,s.id,{},now),/has not seen these steps/);
 learning.finish(loaded,s.id,{selfConfirmAll:true},now);assert.ok(loaded.learning.sessions[0].confirmed.every(c=>c.kind==='employee-confirmed'));
 const quiz=learning.beginQuiz(loaded,now);const view=learning.snapshot(loaded,now).quiz;
 assert.deepEqual(view.questions.map(q=>q.type),[...view.questions.map(q=>q.type)].sort((a,b)=>['picture','tap','order','text-picture','task'].indexOf(a)-['picture','tap','order','text-picture','task'].indexOf(b)));
 for(const q of view.questions){assert.equal(q.correct,undefined,'the answer key never reaches the page');assert.equal(q.explanation,undefined);assert.ok(q.picture.alt&&q.picture.file.endsWith('.svg'));}
 assert.deepEqual(new Set(view.questions.map(q=>q.type)),new Set(['picture','tap','order','text-picture','task']));
 for(const q of quiz.questions)assert.match(q.picture.source,/^drawn for Averill, assets\/learn\//,'every picture records its source');
 const answers=right(quiz);
 learning.submitQuiz(loaded,quiz.id,{answers,tried:true},now);
 const done=learning.snapshot(loaded,now).quiz;assert.ok(done.finishedAt);
 const scored=done.questions.filter(q=>q.type!=='task');assert.deepEqual(done.score,{right:scored.length,total:scored.length});
 for(const q of scored){assert.equal(q.result.correct,true);assert.ok(q.result.explanation&&q.result.right);}
 assert.equal(done.questions.find(q=>q.type==='task').result.kind,'employee-confirmed','a task Averill did not see is the employee’s own confirmation');
 assert.throws(()=>learning.submitQuiz(loaded,quiz.id,{answers,tried:true},now),/already submitted/);
 assert.equal(learning.saveQuizNote(loaded,quiz.id,'  Next time I will check the margin first.  ',now).note,'Next time I will check the margin first.');
});

const right=quiz=>Object.fromEntries(quiz.questions.filter(q=>q.type!=='task').map(q=>[q.id,q.type==='order'?[...q.correct]:q.correct]));
const wrongFor=q=>q.type==='order'?[...q.correct].reverse():q.type==='tap'?q.areas.find(a=>a.id!==q.correct).id:q.options.find(o=>o.id!==q.correct).id;
function weekly(t){const {data}=fixture(t);const s=learning.start(data,null,now);learning.finish(data,s.id,{selfConfirmAll:true},now);return {data,quiz:learning.beginQuiz(data,now)};}
test('each question type is scored: choose picture, text with picture, tap the spot, put in order',t=>{
 const {data,quiz}=weekly(t);const by=type=>quiz.questions.find(q=>q.type===type);
 const picture=by('picture'),text=by('text-picture'),tap=by('tap'),order=by('order');
 assert.ok(picture.options.every(o=>o.picture.alt),'picture options have alt text');assert.ok(tap.areas.length>=3);assert.ok(order.items.length>=3);
 assert.notDeepEqual(order.items.map(i=>i.id),order.correct,'the steps are shown shuffled');
 const answers={[picture.id]:wrongFor(picture),[text.id]:text.correct,[tap.id]:tap.correct,[order.id]:wrongFor(order)};
 learning.submitQuiz(data,quiz.id,{answers:{...right(quiz),...answers},tried:true},now);
 const r=quiz.results;assert.equal(r[picture.id].correct,false);assert.equal(r[text.id].correct,true);assert.equal(r[tap.id].correct,true);assert.equal(r[order.id].correct,false);
 const shown=learning.snapshot(data,now).quiz;const o=shown.questions.find(q=>q.id===order.id);
 assert.match(o.result.right,/Click the headline → Hold Shift/);assert.match(o.result.yours,/Choose Left or Center/);
 assert.deepEqual(shown.score,{right:shown.questions.filter(q=>q.type!=='task').length-2,total:shown.questions.filter(q=>q.type!=='task').length});
});
test('submitting with unanswered questions is rejected and stores nothing',t=>{
 const {data,quiz}=weekly(t);const all=right(quiz);const [first]=Object.keys(all);
 const missing={...all};delete missing[first];
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:missing,tried:true},now),/Answer every question before you submit: 1 left/);
 assert.deepEqual(quiz.results,{});assert.equal(quiz.finishedAt,undefined);
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:{...all,[first]:'nonsense'},tried:true},now),/1 left/);
 const order=quiz.questions.find(q=>q.type==='order');
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:{...all,[order.id]:order.correct.slice(1)},tried:true},now),/1 left/,'a partial order is not an answer');
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:{},tried:true},now),/left/);
 assert.deepEqual(quiz.results,{});
});
test('one page confirmation covers every task Averill did not see; a task it saw is checked by Averill',t=>{
 const {data,quiz}=weekly(t);const tasks=quiz.questions.filter(q=>q.type==='task');assert.ok(tasks.length>=1);
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:right(quiz)},now),/Confirm that you tried these tasks yourself/);
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:right(quiz),tried:'yes'},now),/Confirm that you tried/,'only an explicit true counts');
 assert.deepEqual(quiz.results,{});
 const step=tasks[0].task.step;
 // The Canva reading sees every step; the task is ticked by Averill and needs no employee confirmation.
 const good={design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]};
 assert.equal(learning.tickPractice(data,good,now),true);assert.ok(quiz.taskChecks[step]);
 learning.submitQuiz(data,quiz.id,{answers:right(quiz)},now);
 assert.equal(quiz.results[tasks[0].id].kind,'checked-by-averill');assert.equal(quiz.confirmation,undefined,'no employee confirmation was needed');
});
test('retry resets only the wrong answers and keeps the right ones and the history',t=>{
 const {data,quiz}=weekly(t);const [a,b]=quiz.questions.filter(q=>q.type!=='task');
 const answers={...right(quiz),[a.id]:wrongFor(a)};
 learning.submitQuiz(data,quiz.id,{answers,tried:true},now);assert.equal(quiz.results[a.id].correct,false);
 const keptTask=quiz.results[quiz.questions.find(q=>q.type==='task').id];
 learning.retryQuiz(data,quiz.id,now);
 assert.equal(quiz.results[a.id],undefined,'the wrong one is open again');assert.equal(quiz.results[b.id].correct,true,'right answers stay');assert.equal(quiz.finishedAt,undefined);
 assert.equal(quiz.results[quiz.questions.find(q=>q.type==='task').id],keptTask,'a finished task stays finished');
 assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:{},tried:true},now),/1 left/,'only the reset question needs an answer');
 learning.submitQuiz(data,quiz.id,{answers:{[a.id]:right(quiz)[a.id]},tried:true},now);
 assert.equal(quiz.results[a.id].correct,true);assert.deepEqual(quiz.history.map(h=>h.right<h.total),[true,false]);assert.equal(quiz.attempt,2);
 assert.throws(()=>learning.retryQuiz(data,quiz.id,now),/no wrong answers/);
});
test('weekly practice belongs to the active person and an answer key never crosses people',t=>{
 const {data,quiz}=weekly(t);const admin=data.activePersonId;const e=workspace.addPerson(data,'Employee','employee','Marketing');workspace.switchPerson(data,e.id);
 assert.equal(learning.snapshot(data,now).quiz,null);assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:right(quiz),tried:true},now),/current week/);assert.throws(()=>learning.retryQuiz(data,quiz.id,now));
 workspace.switchPerson(data,admin);assert.throws(()=>learning.submitQuiz(data,quiz.id,{answers:right(quiz),tried:true},new Date('2026-10-05T10:00:00Z')),/current week/);
});
test('learning is isolated by person and exclusion invalidates practice',t=>{const {data}=fixture(t);const admin=data.activePersonId;const s=learning.start(data,null,now);learning.finish(data,s.id,{selfConfirmAll:true},now);const q=learning.beginQuiz(data,now);const e=workspace.addPerson(data,'Employee','employee','Marketing');workspace.switchPerson(data,e.id);assert.deepEqual(learning.snapshot(data,now).sessions,[]);assert.throws(()=>learning.finish(data,s.id,{selfConfirmAll:true},now));assert.throws(()=>learning.submitQuiz(data,q.id,{answers:right(q),tried:true},now));workspace.switchPerson(data,admin);learning.exclude(data,s.id);assert.throws(()=>learning.beginQuiz(data,now));assert.throws(()=>learning.submitQuiz(data,q.id,{answers:right(q),tried:true},now));});
test('revoked and conflicting sources cannot justify questions; rule questions cite the approved source',t=>{
 const {dir,data}=fixture(t);const f=path.join(dir,'brief.md');fs.writeFileSync(f,'Approved instructions');const src=workspace.importFile(dir,data,f);workspace.updateSource(data,src.id,'approved');
 const s=learning.start(data,src.id,now);learning.finish(data,s.id,{selfConfirmAll:true},now);const q=learning.beginQuiz(data,now);
 const question=q.questions.find(x=>x.source?.id===src.id);assert.ok(question);assert.equal(question.source.version,String(src.version));assert.equal(question.source.title,src.title);assert(!q.questions.some(x=>x.bankId==='source-check'),'no generic document-version question replaces a practised skill');
 learning.submitQuiz(data,q.id,{answers:right(q),tried:true},now);
 assert.equal(learning.snapshot(data,now).quiz.questions.find(x=>x.id===question.id).source.title,src.title,'question retains the practised source');
 workspace.updateSource(data,src.id,'superseded');assert.equal(learning.snapshot(data,now).quiz.questions.find(x=>x.id===question.id).available,false);
 assert.throws(()=>learning.record(data,{tool:'Newsletter',note:'I checked the audience',sourceId:src.id,confirmed:true},now));workspace.updateSource(data,src.id,'approved');const f2=path.join(dir,'other.md');fs.writeFileSync(f2,'Other instructions');const other=workspace.importFile(dir,data,f2,{title:src.title});workspace.updateSource(data,other.id,'approved');assert.equal(learning.snapshot(data,now).sessions[0].sourceAvailable,false);
});
test('a revoked source makes a fresh submission impossible',t=>{
 const {dir,data}=fixture(t);const f=path.join(dir,'brief.md');fs.writeFileSync(f,'Approved instructions');const src=workspace.importFile(dir,data,f);workspace.updateSource(data,src.id,'approved');
 const s=learning.start(data,src.id,now);learning.finish(data,s.id,{selfConfirmAll:true},now);const q=learning.beginQuiz(data,now);
 workspace.updateSource(data,src.id,'superseded');assert.throws(()=>learning.submitQuiz(data,q.id,{answers:right(q),tried:true},now),/changed/);assert.deepEqual(q.results,{});
});
test('Copenhagen week rollover and recorded work without a free-text question',t=>{const {data}=fixture(t);assert.equal(learning.weekKey(new Date('2026-09-27T22:30:00Z')),'2026-09-28');learning.record(data,{tool:'Newsletter',note:'I practised checking the footer and unsubscribe link in my email.',confirmed:true},now);const q=learning.beginQuiz(data,now);assert.ok(q.questions.every(x=>['picture','text-picture','tap','order','task'].includes(x.type)),'no free-text reflection in the test');assert.ok(q.questions.some(x=>x.bankId==='task-brevo-footer'),'confirmed footer practice adds the matching Brevo draft task');assert.throws(()=>learning.beginQuiz(data,new Date('2026-09-28T10:00:00Z')));});
test('finding exercises keep employee confirmation separate from supported checks',t=>{const {data}=fixture(t);const finding={kind:'linkedin',id:'linkedin-claim',title:'Wrong claim',body:'Use approved copy',action:'Revise the claim',source:{id:'linkedin',title:'LinkedIn guidance'}};const exercise=learning.startFinding(data,finding,now);assert.equal(learning.startFinding(data,finding,now).id,exercise.id);learning.completeFinding(data,exercise.id,'I changed the post and checked the campaign guidance.','not-checked',now);assert.equal(exercise.exercise.check,'not-checked');assert.equal(exercise.confirmed[0].kind,'employee-confirmed');});
test('task exercises are one page with one confirmation; Canva steps tick from the design reading',t=>{
 const {data}=fixture(t);const project=learning.startProject(data,'linkedin_visual',null,now);assert.equal(project.project.steps.length,3);
 learning.finishProject(data,project.id,{note:'Exported linkedin-visual.png and compared it with the draft.'},now);
 assert.ok(project.finishedAt);assert.deepEqual(project.confirmed.map(c=>c.id),['project:0','project:1','project:2']);assert.ok(project.confirmed.every(c=>c.kind==='employee-confirmed'));
 assert.throws(()=>learning.finishProject(data,project.id,{},now),/unavailable/);
 const comp=learning.startProject(data,'composition',null,now);
 assert.throws(()=>learning.finishProject(data,comp.id,{},now),/has not seen these steps/);assert.equal(comp.finishedAt,undefined);
 assert.equal(learning.tickPractice(data,{design,elements:[text(96,120,800,700,120),text(40,300,1000,300,50)]},now),true,'two texts tick the first step');
 assert.deepEqual(Object.keys(comp.project.checks),['hierarchy']);
 assert.throws(()=>learning.finishProject(data,comp.id,{},now),/has not seen/,'alignment is not seen yet');
 learning.tickPractice(data,{design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]},now);
 learning.finishProject(data,comp.id,{},now);
 assert.deepEqual(comp.confirmed.map(c=>c.kind),['checked-by-averill','checked-by-averill','employee-confirmed'],'what Averill saw and what the employee confirmed stay apart');
 assert.equal(learning.snapshot(data,now).sessions.length,2);learning.deleteHistory(data);assert.deepEqual(learning.snapshot(data,now).sessions,[]);
});
test('without Canva the employee can confirm every step of an exercise on the one page',t=>{
 const {data}=fixture(t);const comp=learning.startProject(data,'composition',null,now);
 learning.finishProject(data,comp.id,{selfConfirmAll:true},now);assert.ok(comp.confirmed.every(c=>c.kind==='employee-confirmed'));
});
test('sessions saved before D1 and T7.3 open in the new format without losing anything',t=>{
 const {dir,data}=fixture(t);const person=data.activePersonId;
 // Shapes found in a real profile: a lesson with one old confirmed step but no lesson/checks fields, and a 3-step exercise with free-text notes.
 data.learning={sessions:[
  {id:'old-lesson',ownerId:person,title:'Canva layout essentials',createdAt:'2026-10-26T09:00:00Z',confirmed:[{id:'select',week:'2026-10-26',at:'2026-10-26T09:05:00Z',kind:'employee-confirmed'}],excluded:false,source:null},
  {id:'old-project',ownerId:person,title:'Improve a composition',createdAt:'2026-10-26T09:10:00Z',confirmed:[],excluded:false,source:null,project:{id:'composition',tool:'Canva',demoSource:null,steps:['Choose two related elements and describe the alignment problem.','Use Position or grouping to change the layout; inspect the result in Canva.','Record what improved and what you would still check before export.'],notes:[]}},
 ],quizzes:[{id:'old-quiz',ownerId:person,week:'2026-09-21',fingerprint:'[]',createdAt:'2026-09-22T09:00:00Z',questions:[{id:'x',type:'choice',options:['a'],correct:0}],answers:{x:{choice:0,correct:true}}}]};
 workspace.save(dir,data);const loaded=workspace.load(dir);
 const shown=learning.snapshot(loaded,now).sessions;
 const lesson=shown.find(s=>s.id==='old-lesson');assert.equal(lesson.lesson,'canva');assert.deepEqual(lesson.checks,{});assert.ok(lesson.migrated);assert.equal(lesson.confirmed.length,1,'the person’s confirmation is kept');
 assert.equal(shown.find(s=>s.id==='old-project').project.auto[1],'align');assert.deepEqual(shown.find(s=>s.id==='old-project').project.checks,{});
 assert.equal(loaded.learning.sessions[0].lesson,undefined,'reading never rewrites the record');
 // Opening it resumes the same session instead of creating a second one, and now ticks from the design reading.
 const resumed=learning.start(loaded,null,now);assert.equal(resumed.id,'old-lesson');assert.equal(resumed.lesson,'canva');assert.deepEqual(resumed.checks,{});assert.equal(loaded.learning.sessions.length,2,'nothing was added or removed');
 assert.ok(learning.checkDesign(loaded,{design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]},now).steps.some(x=>x.done));
 learning.finish(loaded,'old-lesson',{},now);
 assert.equal(resumed.confirmed.find(c=>c.id==='select').kind,'employee-confirmed','an old confirmation is never relabelled as checked by Averill');
 assert.equal(resumed.confirmed.find(c=>c.id==='hierarchy').kind,'checked-by-averill');
 // Old per-question quizzes stay in history; a new weekly practice is a separate v2 record.
 assert.equal(loaded.learning.quizzes.length,1);assert.equal(learning.snapshot(loaded,now).quiz,null);
 const q=learning.beginQuiz(loaded,now);assert.equal(q.version,2);assert.equal(loaded.learning.quizzes.length,2);
 // An old unfinished quiz of the current week is reported, not shown as the new page.
 loaded.learning.quizzes[0].week=learning.weekKey(now);assert.deepEqual(learning.snapshot(loaded,now).earlierPractice,{answered:1,total:1});
});
test('startProject works with and without an approved source',t=>{const {dir,data}=fixture(t);const plain=learning.startProject(data,'linkedin_visual',null,now);assert.equal(plain.source,null);assert.equal(plain.project.notes.length,0);assert.equal(learning.startProject(data,'linkedin_visual',null,now).id,plain.id);const f=path.join(dir,'brief.md');fs.writeFileSync(f,'Approved instructions');const src=workspace.importFile(dir,data,f);learning.exclude(data,plain.id);assert.throws(()=>learning.startProject(data,'linkedin_visual',src.id,now),/visible approved source/);workspace.updateSource(data,src.id,'approved');const linked=learning.startProject(data,'linkedin_visual',src.id,now);assert.notEqual(linked.id,plain.id);assert.equal(linked.source.id,src.id);assert.throws(()=>learning.startProject(data,'unknown',null,now),/Unknown practice project/);});

// D1 (27 October 2026): the Canva lesson ticks itself from the browser card's design reading.
const canvaExercise=require('../src/canva-exercise');
const text=(fontSize,x,y,width,height,color=[16,15,13])=>({text:'t',box:{x,y,width,height},fontSize,fontWeight:400,colors:[color],background:{dark:[245,240,229],light:[245,240,229]}});
const design={width:1080,height:1350,scale:1};
test('Canva lesson steps are read from texts, sizes, positions and colours only',()=>{
 const good={design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]};
 assert.deepEqual(canvaExercise.evaluate(good),{hierarchy:true,size:true,align:true,margin:true,contrast:true});
 assert.deepEqual(canvaExercise.evaluate({design,elements:[text(96,120,800,700,120)]}),{hierarchy:false,size:false,align:false,margin:true,contrast:true});
 const flat={design,elements:[text(50,120,800,700,120),text(40,300,1000,300,50)]};
 const r=canvaExercise.evaluate(flat);assert.equal(r.size,false,'50 px is not 1.5 x 40 px');assert.equal(r.align,false,'different left, centre and right edges');
 assert.equal(canvaExercise.evaluate({design,elements:[text(96,20,800,700,120),text(40,20,1000,600,50)]}).margin,false,'20 px from the left edge');
 assert.equal(canvaExercise.evaluate({design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50,[200,200,190])]}).contrast,false,'pale text on cream');
});
test('design readings tick lesson steps for the active person; finishing records Averill checks separately from the employee',t=>{
 const {data}=fixture(t);assert.equal(learning.checkDesign(data,{design,elements:[]},now),null,'no lesson, nothing recorded');
 const s=learning.start(data,null,now);
 const first=learning.checkDesign(data,{design,elements:[text(96,120,800,700,120),text(40,300,1000,300,50)]},now);
 assert.deepEqual(first.steps.filter(x=>x.done).map(x=>x.id),['hierarchy','size','margin','contrast']);assert.equal(first.steps.at(-1).check,'confirm');
 assert.throws(()=>learning.finish(data,s.id,{},now),/Align the two texts/);
 const regressed=learning.checkDesign(data,{design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50,[200,200,190])]},now);
 assert.equal(regressed.steps.find(step=>step.id==='contrast').done,false,'a current defect clears the displayed tick');
 assert.throws(()=>learning.finish(data,s.id,{},now),/Make every text easy to read/);
 assert.ok(s.checks.contrast,'a step once seen stays ticked');assert.equal(s.live.result.contrast,false,'the live reading still shows today’s problem');
 learning.checkDesign(data,{design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]},now);
 learning.finish(data,s.id,{},now);
 assert.deepEqual(Object.fromEntries(s.confirmed.map(c=>[c.id,c.kind])),{hierarchy:'checked-by-averill',size:'checked-by-averill',align:'checked-by-averill',margin:'checked-by-averill',contrast:'checked-by-averill',group:'employee-confirmed'});
 const e=workspace.addPerson(data,'Employee','employee','Marketing');workspace.switchPerson(data,e.id);
 assert.equal(learning.checkDesign(data,{design,elements:[text(96,120,800,700,120)]},now),null,'another person’s reading never touches this lesson');
});

test('current lesson uses stricter company constraints as well as the general baseline',t=>{
 const {data}=fixture(t);learning.start(data,null,now);
 const reading={design,elements:[text(96,80,800,700,120),text(40,80,1000,600,50)]};
 assert.equal(learning.checkDesign(data,reading,now).steps.find(s=>s.id==='margin').done,true);
 const stricter=learning.checkDesign(data,{...reading,constraints:{margin:108}},now);
 assert.equal(stricter.steps.find(s=>s.id==='margin').done,false);
 assert.equal(stricter.steps.find(s=>s.id==='margin').seenBefore,true);
});


test('pending checks clear on regression and manual completion preserves attribution',t=>{
 const {data,quiz}=weekly(t);
 const lesson=learning.start(data,null,now),project=learning.startProject(data,'composition',null,now);
 const good={design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]};
 learning.tickPractice(data,good,now);learning.checkDesign(data,good,now);
 assert.ok(project.project.checks.align);assert.ok(Object.keys(quiz.taskChecks).length);
 learning.tickPractice(data,{design,elements:[]},now);
 assert.deepEqual(project.project.checks,{});assert.deepEqual(quiz.taskChecks,{});
 assert.throws(()=>learning.finishProject(data,project.id,{},now),/has not seen/);
 learning.tickPractice(data,good,now);
 learning.finishProject(data,project.id,{selfConfirmAll:true},now);
 learning.finish(data,lesson.id,{selfConfirmAll:true},now);
 assert.ok(project.confirmed.every(c=>c.kind==='employee-confirmed'));
 assert.ok(lesson.confirmed.every(c=>c.kind==='employee-confirmed'));
 const history=JSON.stringify(project.confirmed);
 learning.tickPractice(data,{design,elements:[]},now);
 assert.equal(JSON.stringify(project.confirmed),history);
});

test('revoking a design reading blocks pending completion, preserves seen history and allows a fresh retry',t=>{
 const {data,quiz}=weekly(t),lesson=learning.start(data,null,now),project=learning.startProject(data,'composition',null,now);
 const good={design,elements:[text(96,120,800,700,120),text(40,120,1000,600,50)]};
 learning.checkDesign(data,good,now);learning.tickPractice(data,good,now);
 const seen=JSON.stringify(lesson.checks);
 assert.equal(learning.invalidateDesign(data),true);
 assert.equal(lesson.live,undefined);assert.equal(JSON.stringify(lesson.checks),seen);
 assert.deepEqual(project.project.checks,{});assert.deepEqual(quiz.taskChecks,{});
 assert.throws(()=>learning.finish(data,lesson.id,{},now),/has not seen/);
 assert.throws(()=>learning.finishProject(data,project.id,{},now),/has not seen/);
 assert.equal(learning.invalidateDesign(data),false,'repeated Stop is harmless');
 learning.checkDesign(data,good,now);learning.tickPractice(data,good,now);
 learning.finish(data,lesson.id,{},now);learning.finishProject(data,project.id,{},now);
 const history=JSON.stringify([lesson,project]);learning.invalidateDesign(data);
 assert.equal(JSON.stringify([lesson,project]),history,'completed records remain intact');
});
