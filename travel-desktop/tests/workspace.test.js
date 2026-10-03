const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const { relevantSources, localWorkspaceAnswer, answerWorkspace } = require('../src/workspace-answer');
const privacy=require('../src/company-privacy');
const sourceReview=require('../src/source-review');

test('local company setup, lead approval, employee visibility and source conflict survive reload', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-test-'));
  try {
    const data = workspace.create(root, 'Sample Company', 'Ava Admin');
    const lead = workspace.addPerson(data, 'Morgan Lead', 'lead', 'Marketing');
    const employee = workspace.addPerson(data, 'Ellis Employee', 'employee', 'Marketing');
    const firstFile = path.join(root, 'brief-a.md');
    fs.writeFileSync(firstFile, 'Approved launch date: 17 October.');
    workspace.switchPerson(data, employee.id);
    const first = workspace.importFile(root, data, firstFile, { title: 'Campaign brief', department: 'Marketing' });
    assert.equal(first.status, 'pending');
    assert.equal(workspace.approvedSources(data).length, 0);
    assert.throws(() => workspace.updateSource(data, first.id, 'approved'), /access required/);
    workspace.switchPerson(data, lead.id);
    workspace.updateSource(data, first.id, 'approved', 80);
    workspace.switchPerson(data, employee.id);
    assert.equal(workspace.approvedSources(data).length, 1);
    assert.equal(relevantSources(data, 'launch date').length, 1);
    assert.equal(relevantSources(data, 'zyxwvuts qqqrrrttt').length, 0);
    assert.deepEqual(localWorkspaceAnswer(data, 'zyxwvuts qqqrrrttt').sources, []);
    const privateFile = path.join(root, 'notes.md');
    fs.writeFileSync(privateFile, 'Personal campaign note.');
    const personal = workspace.importFile(root, data, privateFile, { title: 'Personal note', department: 'Marketing', scope: 'private' });
    workspace.switchPerson(data, lead.id);
    assert.equal(workspace.visibleSources(data).some((source) => source.id === personal.id), false);
    assert.throws(() => workspace.updateSource(data, personal.id, 'approved'), /Private files/);
    workspace.switchPerson(data, employee.id);
    workspace.proposeSource(data, personal.id);
    workspace.switchPerson(data, lead.id);
    assert.equal(workspace.visibleSources(data).some((source) => source.id === personal.id), true);
    workspace.updateSource(data, personal.id, 'approved');
    workspace.switchPerson(data, employee.id);
    const secondFile = path.join(root, 'brief-b.md');
    fs.writeFileSync(secondFile, 'Approved launch date: 21 October.');
    const second = workspace.importFile(root, data, secondFile, { title: 'Campaign brief', department: 'Marketing' });
    workspace.switchPerson(data, lead.id);
    workspace.updateSource(data, second.id, 'approved', 20);
    assert.equal(workspace.conflicts(data).length, 1);
    assert.equal(relevantSources(data, 'launch date').length, 0);
    workspace.updateSource(data, second.id, 'superseded');
    assert.equal(workspace.conflicts(data).length, 0);
    workspace.save(root, data);
    assert.equal(workspace.load(root).sources.length, 3);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('approval queue records reasons and links a replacement with a real extracted-text comparison',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-versions-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const data=workspace.create(root,'Sample','Admin');const lead=workspace.addPerson(data,'Lead','lead','Marketing');const author=workspace.addPerson(data,'Author','employee','Marketing');
 const a=path.join(root,'old.md'),b=path.join(root,'new.md');fs.writeFileSync(a,'Audience: Everyone\nClaim: Lowest price');fs.writeFileSync(b,'Audience: Denmark\nClaim: Curated breaks');
 workspace.switchPerson(data,author.id);const old=workspace.importFile(root,data,a,{title:'Autumn plan'}),next=workspace.importFile(root,data,b,{title:'Winter campaign'});
 workspace.switchPerson(data,lead.id);workspace.updateSource(data,old.id,'approved',50,'Current autumn plan');workspace.updateSource(data,next.id,'clarification_requested',0,'Confirm the target audience');
 workspace.switchPerson(data,author.id);assert.match(workspace.publicSnapshot(data).sources.find(s=>s.id===next.id).latestDecision.reason,/target audience/);
 workspace.switchPerson(data,lead.id);const diff=sourceReview.compare(data,next.id,old.id);assert.ok(diff.changes.some(change=>change.type==='removed'&&change.text.includes('Everyone')));assert.ok(diff.changes.some(change=>change.type==='added'&&change.text.includes('Denmark')));
 workspace.updateSource(data,next.id,'approved',70,'Audience clarified',old.id);assert.equal(old.status,'superseded');assert.equal(next.supersedesId,old.id);assert.equal(workspace.conflicts(data).length,0);
 assert.throws(()=>workspace.updateSource(data,old.id,'approved',0,'',next.id),/cycle/);
});

test('company answers expose exact matching passage and approval metadata',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-evidence-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const data=workspace.create(root,'Sample','Admin');const file=path.join(root,'guidance.md');fs.writeFileSync(file,'Intro\nApproved audience: Denmark travel subscribers.\nOther material');
 const source=workspace.importFile(root,data,file,{version:'3'});workspace.updateSource(data,source.id,'approved',1,'Reviewed');const answer=localWorkspaceAnswer(data,'approved audience');
 assert.match(answer.text,/Denmark travel subscribers/);assert.equal(answer.sources[0].quote,'Approved audience: Denmark travel subscribers.');assert.equal(answer.sources[0].version,'3');assert.equal(answer.sources[0].line,2);assert.ok(answer.sources[0].approvedAt);
 assert.deepEqual(localWorkspaceAnswer(data,'What is the approved policy for Martian holidays?').sources,[]);
});

test('model claim is rejected unless its answer is an exact part of a cited source quote',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-extractive-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const previous=global.fetch;t.after(()=>{global.fetch=previous;});
 const data=workspace.create(root,'Sample','Admin');const file=path.join(root,'approved.md');fs.writeFileSync(file,'Approved audience: Denmark subscribers only.');const source=workspace.importFile(root,data,file);workspace.updateSource(data,source.id,'approved');source.aiAllowed=true;privacy.configure(data,true);
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({answer:'The audience is everyone.',evidence:[{source_id:source.id,quote:'Approved audience: Denmark subscribers only.'}]})}}]})});
 const rejected=await answerWorkspace(data,'approved audience','synthetic-key','synthetic-model');assert.equal(rejected.mode,'local');
 global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({answer:'Denmark subscribers only.',evidence:[{source_id:source.id,quote:'Approved audience: Denmark subscribers only.'}]})}}]})});
 const accepted=await answerWorkspace(data,'approved audience','synthetic-key','synthetic-model');assert.equal(accepted.mode,'model');assert.equal(accepted.sources[0].quote,'Approved audience: Denmark subscribers only.');
});

test('missing-evidence clarification stays with requester and authorised reviewer',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-clarify-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const data=workspace.create(root,'Sample','Admin');const lead=workspace.addPerson(data,'Lead','lead','Marketing');const requester=workspace.addPerson(data,'Requester','employee','Marketing');const peer=workspace.addPerson(data,'Peer','employee','Marketing');
 workspace.switchPerson(data,requester.id);const item=workspace.requestClarification(data,'Which approved source covers the new claim?');assert.equal(workspace.publicSnapshot(data).clarifications.length,1);
 workspace.switchPerson(data,peer.id);assert.equal(workspace.publicSnapshot(data).clarifications.length,0);assert.throws(()=>workspace.resolveClarification(data,item.id,'I need an updated brief.'),/Reviewer access/);
 workspace.switchPerson(data,lead.id);workspace.resolveClarification(data,item.id,'No approved guidance covers this claim yet.',null);workspace.switchPerson(data,requester.id);assert.match(workspace.publicSnapshot(data).clarifications[0].reply,/No approved guidance/);
});

test('local source deletion removes managed copies but preserves the outside original',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-delete-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const data=workspace.create(path.join(root,'profile'),'Sample','Admin');const person=workspace.addPerson(data,'Worker','employee','Marketing');const original=path.join(root,'outside.md');fs.writeFileSync(original,'Private campaign draft');
 workspace.switchPerson(data,person.id);const source=workspace.importFile(path.join(root,'profile'),data,original,{scope:'private'});const copy=source.storedPath,text=source.textPath;workspace.removeSource(path.join(root,'profile'),data,source.id);
 assert.equal(fs.existsSync(copy),false);assert.equal(fs.existsSync(text),false);assert.equal(fs.existsSync(original),true);assert.equal(workspace.load(path.join(root,'profile')).sources.length,0);
});

test('folder import copies supported nested files and leaves them pending', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-folder-'));
  try {
    const data = workspace.create(path.join(root, 'data'), 'Sample Company', 'Ava Admin');
    const folder = path.join(root, 'campaign');
    fs.mkdirSync(path.join(folder, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(folder, 'brief.md'), 'Approved message: City escapes.');
    fs.writeFileSync(path.join(folder, 'nested', 'calendar.txt'), 'Launch: 17 October.');
    fs.writeFileSync(path.join(folder, 'ignore.bin'), 'binary');
    const result = workspace.importFolder(path.join(root, 'data'), data, folder, { department: 'Marketing' });
    assert.deepEqual(result, { imported: 2, scanned: 2, limited: false });
    assert.equal(data.sources.every((source) => source.status === 'pending' && fs.existsSync(source.storedPath)), true);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('Vamo pack retains approval, exact versions and department visibility after restart', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vamo-pack-'));
  const pack = path.join(__dirname, '..', 'demo-company', 'vamo');
  try {
    const data = workspace.create(root, 'Vamo', 'Alex Holm');
    const admin = workspace.person(data);
    const leads = {}, employees = {};
    for (const dept of ['Marketing', 'Operations', 'People']) {
      leads[dept] = workspace.addPerson(data, `${dept} lead`, 'lead', dept);
      employees[dept] = workspace.addPerson(data, `${dept} employee`, 'employee', dept);
      workspace.importFolder(root, data, path.join(pack, dept), { department: dept });
    }
    const brief = data.sources.find(item => item.title === 'current-brief.md');
    // Import separately with the exact campaign metadata, as the README instructs.
    data.sources = data.sources.filter(item => item.id !== brief.id);
    const v2 = workspace.importFile(root, data, path.join(pack, 'Marketing', 'current-brief.md'), { department: 'Marketing', version: '2' });
    for (const dept of Object.keys(leads)) {
      workspace.switchPerson(data, leads[dept].id);
      for (const source of data.sources.filter(item => item.department === dept)) workspace.updateSource(data, source.id, 'approved', 80);
    }
    workspace.switchPerson(data, employees.Marketing.id);
    assert.throws(() => workspace.importFile(root, data, path.join(pack, 'Operations', 'trip-brief-procedure-v1.md'), { department: 'Operations' }), /own department/);
    const note = workspace.importFile(root, data, path.join(pack, 'Proposals', 'marketing-personal-note-v1.md'), { scope: 'private', department: 'Marketing' });
    workspace.switchPerson(data, leads.Marketing.id);
    assert.equal(workspace.visibleSources(data).some(item => item.id === note.id), false);
    assert.throws(() => workspace.updateSource(data, data.sources.find(item => item.department === 'Operations').id, 'approved'), /access required/);
    workspace.switchPerson(data, employees.Marketing.id);
    workspace.proposeSource(data, note.id);
    workspace.switchPerson(data, leads.Marketing.id);
    workspace.updateSource(data, note.id, 'approved');
    const old = workspace.importFile(root, data, path.join(pack, 'Archive', 'old-brief.md'), { department: 'Marketing', version: '1' });
    workspace.updateSource(data, old.id, 'superseded');
    workspace.save(root, data);
    const restored = workspace.load(root);
    assert.equal(restored.sources.find(item => item.id === v2.id).version, '2');
    for (const dept of Object.keys(employees)) {
      workspace.switchPerson(restored, employees[dept].id);
      const visible = workspace.visibleSources(restored);
      assert.ok(visible.length >= 2);
      assert.ok(visible.every(item => item.department === dept));
      assert.ok(visible.some(item => item.title === 'brand-and-company-context-v2.md'));
      assert.equal(workspace.approvedSources(restored).some(item => item.id === old.id), false);
    }
    workspace.switchPerson(restored, admin.id);
    assert.equal(workspace.approvedSources(restored).length, 10);
    assert.deepEqual(workspace.conflicts(restored), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
