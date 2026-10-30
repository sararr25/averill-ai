// Opt-in real Nemotron check on generated synthetic sources only; never reads a normal workspace.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const workspace=require('../src/workspace'),{WorkAssistant}=require('../src/work-assistant');
(async()=>{
 assert(process.argv.includes('--synthetic-consent'),'Pass --synthetic-consent for generated synthetic source text only.');
 assert(process.env.NEBIUS_API_KEY,'Development provider key unavailable.');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-retrieval-live-'));
 try{
  const data=workspace.create(root,'Synthetic verification company','Synthetic verification owner');data.privacy={companyAI:true};
  const quote='Reimbursement deadline: Submit receipts within seven business days.';
  const file=path.join(root,'handbook.md');fs.writeFileSync(file,'# Synthetic handbook\n\n'+'Neutral synthetic reference information.\n'.repeat(700)+'\n[PDF page 7]\n## Expenses\n'+quote);
  const source=workspace.importFile(root,data,file,{title:'Synthetic handbook',department:'Marketing',version:'1'});workspace.updateSource(data,source.id,'approved');source.aiAllowed=true;
  const assistant=new WorkAssistant(),options={nebiusKey:process.env.NEBIUS_API_KEY},question='What is the reimbursement deadline?',started=Date.now();
  const preview=await assistant.answer(data,question,options);assert(preview.consentRequired);
  assert(preview.items.some(item=>item.text.includes(quote)));assert(!preview.items.some(item=>item.text.includes('Neutral synthetic reference information')));
  const result=await assistant.answer(data,question,{...options,consent:true});
  const receipt={at:new Date().toISOString(),scope:'Generated synthetic source only; no normal user data or Tavily call',ms:Date.now()-started,mode:result.mode,status:result.assistant.providerStatus,previewInputs:preview.items,text:result.text,sources:result.sources};
  if(process.env.OUT){fs.mkdirSync(process.env.OUT,{recursive:true});fs.writeFileSync(path.join(process.env.OUT,'retrieval-live.json'),JSON.stringify(receipt,null,2));}
  console.log(JSON.stringify({mode:result.mode,status:result.assistant.providerStatus,ms:receipt.ms}));assert.equal(result.mode,'model');assert(quote.includes(result.text));assert.match(result.text,/Submit receipts within seven business days/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
