// Public-only operations; no normal profile, private question or company sources leave this process.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const workspace=require('../src/workspace'),{WorkAssistant}=require('../src/work-assistant');
(async()=>{
 assert(process.argv.includes('--public-consent'),'Pass --public-consent to send generic public operations and official excerpts.');
 assert(process.env.NEBIUS_API_KEY&&process.env.TAVILY_API_KEY,'Development provider keys unavailable.');
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'averill-ex-public-')),results=[];
 try{
  const data=workspace.create(profile,'Synthetic public verification','Synthetic owner');data.privacy={companyAI:false};
  for(const question of ['Voglio mettere una foto dentro una forma','È leggibile questo testo?']){
   const assistant=new WorkAssistant(),options={task:'canva',publicNebiusKey:process.env.NEBIUS_API_KEY,tavilyKey:process.env.TAVILY_API_KEY},at=Date.now();
   const plan=await assistant.answer(data,question,options);assert(plan.consentRequired);
   assert(!plan.items.some(item=>item.text.includes(question)),'Original question must not enter the public preview.');
   const value=await assistant.answer(data,question,{...options,consent:true});
   results.push({question,ms:Date.now()-at,mode:value.mode,intent:value.assistant.intent,status:value.assistant.providerStatus,checked:value.assistant.checked,text:value.text,sources:value.sources});
   console.log(JSON.stringify({question,mode:value.mode,status:value.assistant.providerStatus,ms:Date.now()-at}));
  }
  const receipt={at:new Date().toISOString(),companyAI:false,companySources:0,scope:'Generic public operations/official excerpts only; not real Canva visual assessment',results};
  if(process.env.OUT){fs.mkdirSync(process.env.OUT,{recursive:true});fs.writeFileSync(path.join(process.env.OUT,'public-live.json'),JSON.stringify(receipt,null,2));}
  assert(results.every(r=>r.mode==='model'&&r.intent==='tool-help'&&r.checked===false),'Expected model help without a verified visual assessment.');
 }finally{fs.rmSync(profile,{recursive:true,force:true});}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
