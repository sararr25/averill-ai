// Same generated workspace and 80 prompts against both frozen implementations. No external provider is contacted.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUT||path.resolve(ROOT,'../docs/review-evidence-2026-10-30/full-ab');
const control=process.env.AB_CONTROL||'/tmp/averill-excellence-ab-20261030/control-A';
const catalogue=require('../../docs/specs/excellence-2026-10-30/evaluation-catalogue.json');
(async()=>{
 const all=[];
 for(const [variant,app] of [['A',control],['B',ROOT]]){
  const workspace=require(app+'/src/workspace'),{WorkAssistant}=require(app+'/src/work-assistant'),{localWorkspaceAnswer}=require(app+'/src/workspace-answer');
  const results=[];
  for(const scenario of catalogue.cases){
   const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-ab-prompt-'));let calls=0;
   try{
    const data=workspace.create(root,'Synthetic A/B company','Synthetic owner');data.privacy={companyAI:false};
    const file=path.join(root,'campaign-brief.md'),text='# Synthetic campaign brief\n\n## Audience\nApproved audience: Travel subscribers in Denmark.\n\n## Schedule\nApproved email date: 15 October 2026 at 10:00 Europe/Copenhagen.\n\n## Wording\nDo not claim lowest prices guaranteed.\n\n## Expenses\nExpenses: Submit receipts to your lead before booking.\n';
    fs.writeFileSync(file,text);const source=workspace.importFile(root,data,file,{title:'campaign brief',department:'Marketing',version:'2'});workspace.updateSource(data,source.id,'approved');
    const assistant=new WorkAssistant(),options={consent:false,fetcher:async()=>{calls++;throw new Error('No external transport in technical comparison');},contextIdentity:'synthetic-context'};
    if(['tool-help','visual-review'].includes(scenario.category))options.task=/brevo|email/i.test(scenario.question)?'email':/linkedin/i.test(scenario.question)?'linkedin':/instagram/i.test(scenario.question)?'instagram':'canva';
    if(scenario.category==='draft')options.task='email';
    if(scenario.category==='follow-up')await assistant.answer(data,'How do I edit a post in LinkedIn?',options);
    const started=performance.now();let value,error;
    try{value=await assistant.answer(data,scenario.question,options)||localWorkspaceAnswer(data,scenario.question);}catch(e){error=e.message;}
    const exact=!value?.sources?.some(s=>s.kind==='workspace'&&!text.includes(s.quote));
    const guarded=calls===0&&exact&&value?.assistant?.checked!==true;
    results.push({id:scenario.id,category:scenario.category,split:scenario.split,question:scenario.question,elapsedMs:performance.now()-started,state:error?'error':'answered',intent:value?.assistant?.intent||'company-lookup',mode:value?.mode||null,text:value?.text||'',sourceCount:value?.sources?.length||0,guardrails:{noProviderCalls:calls===0,exactWorkspaceQuotes:exact,noUnseenVerification:value?.assistant?.checked!==true},guardrailsPassed:guarded,error,semanticQuality:'Requires human review; automated invariants are not an answer-quality score'});
   }finally{fs.rmSync(root,{recursive:true,force:true});}
  }
  const result={variant,prompts:results.length,guardrailsPassed:results.filter(r=>r.guardrailsPassed).length,errors:results.filter(r=>r.state==='error').length,results};all.push(result);
 }
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'prompt-comparison.json'),JSON.stringify({scope:'Scripted offline technical comparison, not human A/B testing. Scenario descriptions do not simulate all lifecycle events; lifecycle/permission/transport behavior has separate tests.',humanParticipants:0,winner:null,variants:all},null,2));
 console.log(JSON.stringify(all.map(r=>({variant:r.variant,prompts:r.prompts,guardrails:r.guardrailsPassed,errors:r.errors}))));
 assert(all.every(r=>r.prompts===80&&r.guardrailsPassed===80&&r.errors===0));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
