const fs=require('node:fs');
const workspace=require('./workspace');
function list(data,query='',status='all',filters={}){
 const active=workspace.person(data);if(!active)return {documents:[],total:0,approved:0,uploaded:0};
 const read=source=>{try{return source.textPath?fs.readFileSync(source.textPath,'utf8').slice(0,100000):'';}catch{return '';}};
 const saved=workspace.visibleSources(data).map(source=>({...source,kind:'saved',name:source.title,text:read(source),readable:source.extractionStatus==='text available'}));
 const draft=data.onboarding;
 const uploaded=active.role==='admin'&&draft?.ownerId===active.id&&!draft.applied?draft.files.map(file=>({...file,kind:'uploaded',name:file.name,status:'uploaded',text:file.text||'',scope:'private',included:file.included!==false})):[];
 const all=[...uploaded,...saved];const search=String(query).trim().toLowerCase().slice(0,200);const conflicted=new Set(workspace.conflicts(data).flat());
 const department=String(filters?.department||'all'),kind=String(filters?.kind||'all'),conflict=filters?.conflict===true;
 const documents=all.filter(file=>(status==='all'||(status==='private'?file.kind==='saved'&&file.scope==='private':file.status===status))&&(department==='all'||file.department===department)&&(kind==='all'||file.kind===kind)&&(!conflict||conflicted.has(file.id))&&(!search||`${file.name}\n${file.text}`.toLowerCase().includes(search))).map(file=>{
  const offset=search?file.text.toLowerCase().indexOf(search):-1;
  const start=offset<0?0:Math.max(0,offset-80,file.text.lastIndexOf('\n',offset-1)+1);
  const canReview=file.kind==='saved'&&file.scope!=='private'&&(active.role==='admin'||active.role==='lead'&&file.scope==='department'&&active.department===file.department);
  return {id:file.id,kind:file.kind,name:file.name,status:file.status,scope:file.scope,department:file.department,version:file.version,readable:file.readable,confidentiality:file.confidentiality||'internal',aiAllowed:file.aiAllowed===true,excerpt:file.text.slice(start,start+900),included:file.included,conflict:conflicted.has(file.id),canReview,canDelete:file.kind==='saved'&&(active.role==='admin'||file.ownerId===active.id&&file.scope==='private'&&file.status!=='approved'),ownerId:file.ownerId,supersedesId:file.supersedesId||null,supersededBy:file.supersededBy||null,approvedAt:file.approvedAt||null,approvedBy:file.approvedBy?data.people.find(p=>p.id===file.approvedBy)?.name||'Unknown':null,latestDecision:file.ownerId===active.id||canReview?file.decisions?.at(-1)||null:null};
 });
 return {documents,total:all.length,approved:saved.filter(f=>f.status==='approved').length,uploaded:uploaded.length};
}
module.exports={list};
