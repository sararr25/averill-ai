// Owner-requested fictional demo expansion. Never migrates a real/imported company or modifies existing sources.
const fs=require('node:fs'),path=require('node:path'),workspace=require('./workspace');
const files=['posting-rhythm.md','leave-and-absence.md','expenses-and-travel.md','remote-work-and-meetings.md','security-and-access.md','handover-and-escalation.md'];
const titles={'posting-rhythm.md':'Weekly posting rhythm','leave-and-absence.md':'Leave and absence','expenses-and-travel.md':'Expenses and work travel','remote-work-and-meetings.md':'Remote work and meetings','security-and-access.md':'Security and access','handover-and-escalation.md':'Handover and escalation'};
function ensure(userData,data,packRoot){
 if(data?.demoAccounts!==true||data.company!=='Vamo (judge demo)'||data.people.some(p=>p.email&&!p.email.endsWith('@vamo.example')))return 0;
 const owner=data.people.find(p=>p.role==='admin'&&p.email==='alex@vamo.example');if(!owner)return 0;
 const before=data.activePersonId;let count=0;
 try{data.activePersonId=owner.id;for(const file of files){if(data.sources.some(s=>s.title===file||s.title===titles[file]||s.demoBundleFile===file))continue;const location=path.join(packRoot,'vamo','Company',file);if(!fs.existsSync(location))throw new Error('Bundled general demo policy missing: '+file);const source=workspace.importFile(userData,data,location,{scope:'company',version:'1',title:titles[file]});source.demoBundle='company-general-v1';source.demoBundleFile=file;source.purpose='company-reference';workspace.updateSource(data,source.id,'approved',55,'Owner-requested fictional company-wide demo policy');count++;}}
 finally{data.activePersonId=before;}
 if(count)workspace.save(userData,data);return count;
}
module.exports={ensure,files};
