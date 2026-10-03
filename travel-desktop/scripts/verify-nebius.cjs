// Explicit live smoke: sends ONLY the synthetic strings below, never userData/imported company files.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
require('dotenv').config({path:path.resolve(__dirname,'../../.env.local'),quiet:true});
const {reviewTask}=require('../src/task-review');
(async()=>{
 if(!process.argv.includes('--synthetic-consent'))throw new Error('Use --synthetic-consent to permit this generated test policy and draft to Nebius. No real company document is read.');
 const key=process.env.NEBIUS_API_KEY;if(!key)throw new Error('Configure NEBIUS_API_KEY locally; it is never logged.');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-nebius-smoke-'));
 try{
  const source=path.join(root,'synthetic-policy.md');
  fs.writeFileSync(source,'Do not claim "lowest prices guaranteed". Use "Discover curated winter city breaks" instead.\n');
  const state={activePersonId:'synthetic-owner',people:[{id:'synthetic-owner',role:'admin'}],privacy:{companyAI:true},sources:[{id:'synthetic-policy',title:'Synthetic marketing test policy',version:'2',status:'approved',department:'Marketing',scope:'department',ownerId:'synthetic-owner',textPath:source,aiAllowed:true,confidentiality:'public'}]};
  const response=await fetch('https://api.tokenfactory.nebius.com/v1/models',{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`Model discovery failed (${response.status}).`);
  const models=(await response.json()).data?.map(item=>item.id)||[];
  const model=process.env.NEBIUS_MODEL || models.find(id=>/nvidia\/.*nemotron.*super/i.test(id)) || models.find(id=>/nvidia\/.*nemotron/i.test(id));
  if(!model||!/nvidia\/.*nemotron/i.test(model)||!models.includes(model))throw new Error('Choose an available NVIDIA Nemotron model for the live test.');
  process.env.NEBIUS_MODEL=model;
  const result=await reviewTask(state,'email','Our lowest prices guaranteed.',key,true);
  assert.equal(result.mode,'model','Live request must not silently fall back to local mode.');
  assert.ok(result.findings.some(item=>item.type==='model-suggestion'),'Require at least one model suggestion with exact validated observed/source excerpts.');
  const receipt={verifiedAt:new Date().toISOString(),provider:result.provider,model:result.model,task:'email',payload:'generated synthetic policy and draft only',validatedModelFindings:result.findings.filter(item=>item.type==='model-suggestion').length,localFindings:result.findings.filter(item=>item.type!=='model-suggestion').length,live:true};
  const out=path.resolve(__dirname,'../dist/nebius-verification.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
