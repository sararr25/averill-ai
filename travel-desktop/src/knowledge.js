const fs=require('node:fs');
const workspace=require('./workspace');
function list(data,query='',status='all'){
 const active=workspace.person(data);if(!active)return {documents:[],total:0,approved:0,uploaded:0};
 const read=source=>{try{return source.textPath?fs.readFileSync(source.textPath,'utf8').slice(0,100000):'';}catch{return '';}};
 const saved=workspace.visibleSources(data).map(source=>({...source,kind:'saved',name:source.title,text:read(source),readable:source.extractionStatus==='text available'}));
 const draft=data.onboarding;
 const uploaded=active.role==='admin'&&draft?.ownerId===active.id&&!draft.applied?draft.files.map(file=>({...file,kind:'uploaded',name:file.name,status:'uploaded',text:file.text||'',scope:'private',included:file.included!==false})):[];
 const all=[...uploaded,...saved];const search=String(query).trim().toLowerCase().slice(0,200);
 const documents=all.filter(file=>(status==='all'||(status==='private'?file.kind==='saved'&&file.scope==='private':file.status===status))&&(!search||`${file.name}\n${file.text}`.toLowerCase().includes(search))).map(file=>{
  const offset=search?file.text.toLowerCase().indexOf(search):-1;const start=Math.max(0,offset-80);
  return {id:file.id,kind:file.kind,name:file.name,status:file.status,scope:file.scope,department:file.department,version:file.version,readable:file.readable,confidentiality:file.confidentiality||'internal',aiAllowed:file.aiAllowed===true,excerpt:file.text.slice(start,start+900),included:file.included};
 });
 return {documents,total:all.length,approved:saved.filter(f=>f.status==='approved').length,uploaded:uploaded.length};
}
module.exports={list};
