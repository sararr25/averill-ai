const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const workspace=require('../src/workspace'),onboarding=require('../src/onboarding'),knowledge=require('../src/knowledge');
test('knowledge exposes staged uploads immediately and searches extracted text without leaking private staff material',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-knowledge-'));try{
  const data=workspace.create(root,'Company','Owner'),owner=data.activePersonId;
  const doc=path.join(root,'guide.txt');fs.writeFileSync(doc,'Company know-how: use the cobalt palette.');
  onboarding.stage(root,data,[doc]);let result=knowledge.list(data,'cobalt');assert.equal(result.documents.length,1);assert.equal(result.documents[0].status,'uploaded');assert.equal(result.uploaded,1);assert.ok(!JSON.stringify(result).includes('storedPath'));
  const source=workspace.importFile(root,data,doc,{scope:'company'});workspace.updateSource(data,source.id,'approved',80);
  const privateDoc=path.join(root,'personnel.txt');fs.writeFileSync(privateDoc,'Private salary secret zebra');workspace.importFile(root,data,privateDoc,{scope:'private'});
  result=knowledge.list(data,'cobalt','approved');assert.equal(result.documents.length,1);assert.equal(result.documents[0].kind,'saved');
  const employee=workspace.addPerson(data,'Employee','employee','Marketing');data.activePersonId=employee.id;
  result=knowledge.list(data);assert.equal(result.uploaded,0);assert.equal(result.total,1);assert.equal(knowledge.list(data,'zebra').documents.length,0);assert.equal(knowledge.list(data,'','private').documents.length,0);
  data.activePersonId=owner;data.onboarding.applied=true;assert.equal(knowledge.list(data).uploaded,0);assert.equal(knowledge.list(data,'zebra','private').documents.length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
