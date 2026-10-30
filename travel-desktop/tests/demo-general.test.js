const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const workspace=require('../src/workspace'),judge=require('../src/judge-demo'),general=require('../src/demo-general'),{localWorkspaceAnswer}=require('../src/workspace-answer'),task=require('../src/task-review');
test('fictional company policies answer English and Italian questions for an employee without exposing People-only files',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'av-company-general-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const pack=path.resolve(__dirname,'../demo-company');const {data}=await judge.create(root,pack);
 for(const [question,expected] of [['When do we usually post?',/Tuesday and Thursday at 09:00/],['Quando postiamo di solito?',/Tuesday and Thursday/],['Come chiedo le ferie?',/two weeks in advance/],['How do I request time off?',/two weeks in advance/],['What is our expenses process?',/receipt|expense report/i],['What is the remote work policy?',/Agree remote working days/]]){
  const r=localWorkspaceAnswer(data,question);assert.match(r.text,expected,question);assert.equal(r.assistant.presentation,'fact');assert.equal(r.sources.length,1);const source=data.sources.find(s=>s.id===r.sources[0].id);assert.equal(source.scope,'company');assert(fs.readFileSync(source.textPath,'utf8').includes(r.text));
 }
 assert(!workspace.visibleSources(data).some(s=>s.title==='employee-onboarding-v2.md'));assert(!task.currentSources(data,'canva').some(e=>e.source.purpose==='company-reference'));
 const count=data.sources.length,person=data.activePersonId;assert.equal(general.ensure(root,data,pack),0);assert.equal(data.sources.length,count);assert.equal(data.activePersonId,person);
});
test('general demo fixture seeding refuses real workspaces and imported company sources',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'av-general-real-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const data=workspace.create(root,'Real business','Real owner');assert.equal(general.ensure(root,data,path.resolve(__dirname,'../demo-company')),0);assert.equal(data.sources.length,0);
});
