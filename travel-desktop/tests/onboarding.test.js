const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const workspace=require('../src/workspace');const accounts=require('../src/accounts');const onboarding=require('../src/onboarding');const learning=require('../src/learning');
const pack=path.join(__dirname,'../demo-company/elseweek-intake');
async function owner(root){const data=workspace.create(root,'Elseweek','Alex Holm');await accounts.configure(data,data.activePersonId,'alex@elseweek.example','Demo-owner-test-123','owner');return data;}
function review(draft){return {batchId:draft.id,people:structuredClone(draft.people),documents:draft.files.map(f=>({id:f.id,included:f.included,scope:f.scope,department:f.department,version:f.version,approve:f.category!=='personnel'}))};}
test('XLSX onboarding bulk creates separate manager, strategist and creator accounts with private personnel evidence',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-intake-'));
 try{
  const data=await owner(root);const originalOwner=data.activePersonId;
  const draft=onboarding.stage(root,data,['elseweek-team.xlsx','elseweek-brand-and-company.svg','winter-escapes-campaign-v2.pdf','linkedin-campaign.md'].map(f=>path.join(pack,f)));
  assert.equal(draft.people.length,3);assert.deepEqual(draft.people.map(p=>p.profile),['marketing_manager','marketing_strategy','content_creator']);
  assert.equal(draft.files[0].scope,'private');assert.match(draft.files[1].text,/Elseweek curates/);assert.equal(draft.files[2].version,'2');
  const result=await onboarding.apply(root,data,review(draft));assert.equal(result.peopleAdded,3);assert.equal(result.documentsAdded,4);
  const disk=fs.readFileSync(path.join(root,'averill-workspace.json'),'utf8');for(const account of result.receipt){assert.ok(!disk.includes(account.password));assert.equal((await accounts.authenticate(data,account.email,account.password)).profile,account.profile);}
  await assert.rejects(accounts.authenticate(data,'maya@elseweek.example','incorrect-password'),/incorrect/);
  assert.ok(!JSON.stringify(workspace.publicSnapshot(data)).includes('credential'));
  assert.ok(!JSON.stringify(workspace.publicSnapshot(data)).includes('onboardingEvidence'));
  const roster=data.sources.find(s=>s.title==='elseweek-team.xlsx');const brand=data.sources.find(s=>s.title==='elseweek-brand-and-company.svg');
  assert.equal(roster.scope,'private');assert.equal(roster.status,'pending');assert.equal(brand.scope,'company');
  for(const p of data.people.filter(p=>p.role!=='admin')){
   workspace.switchPerson(data,p.id);assert.equal(onboarding.snapshot(data),null);assert.ok(!workspace.visibleSources(data).some(s=>s.id===roster.id));assert.ok(workspace.approvedSources(data).some(s=>s.id===brand.id));
   assert.throws(()=>workspace.updateSource(data,brand.id,'superseded'),/access required/);
  }
  const creator=data.people.find(p=>p.profile==='content_creator');workspace.switchPerson(data,creator.id);learning.start(data);const strategist=data.people.find(p=>p.profile==='marketing_strategy');workspace.switchPerson(data,strategist.id);assert.equal(learning.snapshot(data).sessions.length,0);
  workspace.switchPerson(data,originalOwner);await assert.rejects(onboarding.apply(root,data,review(draft)),/already applied/);
  const restored=workspace.load(root);assert.equal(restored.people.length,4);assert.equal(restored.sources.find(s=>s.title.includes('campaign-v2')).version,'2');
  const duplicate=onboarding.stage(root,restored,[path.join(pack,'elseweek-team.xlsx')]);assert.ok(duplicate.people.every(p=>!p.included));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('model interpretation rejects fabricated names/emails/evidence and never grants imported admin access',()=>{
 const draft={people:[],files:[{id:'roster',text:'Maya Jensen maya@elseweek.example Marketing manager\nEmma Larsen emma@elseweek.example Marketing strategy employee',name:'team.pdf'},{id:'brand',text:'Elseweek curates short European city breaks.',name:'brand.svg'}]};
 const parsed=onboarding.parseModel(JSON.stringify({company:{name:'Elseweek',description:'Short city breaks',sourceId:'brand',evidence:'Elseweek curates short European city breaks.'},people:[{name:'Maya Jensen',email:'maya@elseweek.example',profile:'owner',department:'Marketing',sourceId:'roster',evidence:'Maya Jensen maya@elseweek.example Marketing manager'},{name:'Invented Person',email:'fake@elseweek.example',sourceId:'roster',evidence:'Maya Jensen maya@elseweek.example Marketing manager'}],documents:[{sourceId:'roster',category:'brand',scope:'company',version:'1'}]}),draft);
 assert.equal(parsed.people.length,1);assert.equal(parsed.people[0].profile,'employee');assert.equal(parsed.people[0].needsReview,true);assert.equal(parsed.documents[0].scope,'private');assert.equal(parsed.documents[0].category,'personnel');assert.equal(parsed.company.name,'Elseweek');assert.equal(parsed.warnings.length,1);
});
test('Nebius analysis requires explicit consent, sends bounded text without credentials, and preserves the draft on failure',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-nebius-'));
 try{
  const data=await owner(root);onboarding.stage(root,data,[path.join(pack,'elseweek-team.xlsx')]);
  await assert.rejects(onboarding.analyze(data,'test-key',{consent:false}),/Confirm sending/);
  let sent;
  await onboarding.analyze(data,'test-key',{consent:true,model:'test-nemotron',fetcher:async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({company:null,people:[],documents:[]})}}]})};}});
  assert.ok(!JSON.stringify(sent).includes('credential'));assert.ok(!JSON.stringify(sent).includes('Demo-owner-test-123'));assert.ok(JSON.stringify(sent).includes('maya@elseweek.example'));assert.equal(data.onboarding.mode,'nebius');
  const saved=JSON.stringify(data.onboarding);await assert.rejects(onboarding.analyze(data,'test-key',{consent:true,model:'test-nemotron',fetcher:async()=>({ok:false,status:503})}),/503/);assert.equal(JSON.stringify(data.onboarding),saved);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('failed onboarding application leaves no partial people or imported copies',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-atomic-'));
 try{
  const data=await owner(root);const draft=onboarding.stage(root,data,[path.join(pack,'elseweek-team.xlsx'),path.join(pack,'linkedin-campaign.md')]);const proposed=review(draft);proposed.documents.push({id:'unknown-file',included:true});
  await assert.rejects(onboarding.apply(root,data,proposed),/Unknown uploaded document/);assert.equal(data.people.length,1);assert.equal(data.sources.length,0);assert.equal(data.onboarding.applied,false);assert.deepEqual(fs.readdirSync(path.join(root,'averill-sources')),[]);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
