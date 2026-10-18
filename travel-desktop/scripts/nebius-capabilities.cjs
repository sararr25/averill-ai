// AV-01 live capability probe. Sends ONLY the synthetic strings below; never reads userData or company files.
const fs=require('node:fs'),path=require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const nebius=require('../src/nebius');
const data={privacy:{companyAI:true}};
(async()=>{
 const key=process.env.NEBIUS_API_KEY;if(!key)throw new Error('Configure NEBIUS_API_KEY locally; it is never logged.');
 const ids=await nebius.models(key);
 const report={checkedAt:new Date().toISOString(),nvidiaModels:ids.filter(id=>/nvidia|nemotron/i.test(id)),embeddingModels:ids.filter(id=>/embed/i.test(id)),guardModels:ids.filter(id=>/guard|safety/i.test(id)),chatModel:nebius.pickChat(ids),embeddingModel:nebius.pickEmbedding(ids),toolCalling:false,jsonMode:false,embeddings:false};
 const tool={type:'function',function:{name:'get_rules',description:'Return approved rules for a work type.',parameters:{type:'object',properties:{task:{type:'string'}},required:['task']}}};
 try{const r=await nebius.chat(data,{key,purpose:'capability-probe',tools:[tool],toolChoice:'auto',messages:[{role:'user',content:'Call get_rules for the email work type.'}]});report.toolCalling=Boolean(r.message.tool_calls?.length);}catch(e){report.toolCallingError=e.message;}
 try{const r=await nebius.chat(data,{key,purpose:'capability-probe',json:true,messages:[{role:'user',content:'Return JSON {"ok":true}.'}]});report.jsonMode=nebius.parseJson(r.content)?.ok===true;}catch(e){report.jsonModeError=e.message;}
 if(report.embeddingModel)try{const r=await nebius.embed(data,{key,purpose:'capability-probe',texts:['synthetic winter campaign rule']});report.embeddings=r.vectors[0]?.length||0;}catch(e){report.embeddingError=e.message;}
 const out=path.resolve(__dirname,'../dist/nebius-capabilities.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
