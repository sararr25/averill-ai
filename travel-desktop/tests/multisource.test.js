const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const http=require('node:http');const https=require('node:https');const {EventEmitter}=require('node:events');const crypto=require('node:crypto');
const remote=require('../src/remote-import');const {CloudImports}=require('../src/cloud-import');const workspace=require('../src/workspace');const onboarding=require('../src/onboarding');const privacy=require('../src/company-privacy');const {answerWorkspace}=require('../src/workspace-answer');
const pack=path.join(__dirname,'../demo-company/vamo-intake');
function fixture(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'averill-multisource-'));return {root,data:workspace.create(root,'Vamo','Alex Holm')};}
test('HTTPS imports block private DNS/IPs, mixed DNS answers, credentials and nonstandard ports',async()=>{
 for(const address of ['127.0.0.1','10.1.2.3','172.16.0.1','192.168.2.1','169.254.169.254','100.64.0.1','::1','fc00::1','fe80::1','::ffff:127.0.0.1','2001:db8::1'])assert.equal(remote.publicAddress(address),false,address);
 for(const url of ['http://example.org/a.pdf','https://user:password@example.org/a.pdf','https://example.org:8443/a.pdf','https://127.0.0.1/a.pdf','https://[::1]/a.pdf'])await assert.rejects(remote.target(url),/HTTPS|Private/);
 await assert.rejects(remote.target('https://company.example/a.pdf',async()=>[{address:'8.8.8.8',family:4},{address:'10.0.0.1',family:4}]),/Private/);
 const valid=await remote.target('https://company.example/file.pdf',async()=>[{address:'8.8.8.8',family:4}]);assert.equal(valid.address.address,'8.8.8.8');
});
test('download redirects are validated and never receive the previous bearer token; oversized responses fail',async()=>{
 const original=https.get;const calls=[];let oversized=false;
 https.get=(url,options,handler)=>{
  calls.push({url:String(url),headers:options.headers});const request=new EventEmitter();request.setTimeout=()=>{};request.destroy=error=>request.emit('error',error);
  queueMicrotask(()=>{const response=new EventEmitter();response.headers=oversized?{'content-length':String(remote.MAX+1)}:calls.length===1?{location:'https://files.example/download.pdf'}:{'content-type':'application/pdf'};response.statusCode=oversized?200:calls.length===1?302:200;response.resume=()=>{};response.destroy=()=>{};handler(response);if(response.statusCode===200&&!oversized){response.emit('data',Buffer.from('%PDF-synthetic'));response.emit('end');}});return request;
 };
 try{const result=await remote.download('https://api.example/content',{headers:{Authorization:'Bearer synthetic-token'},resolver:async()=>[{address:'8.8.8.8',family:4}]});assert.equal(result.type,'application/pdf');assert.equal(calls[0].headers.Authorization,'Bearer synthetic-token');assert.equal(calls[1].headers.Authorization,undefined);oversized=true;await assert.rejects(remote.download('https://files.example/file.pdf',{resolver:async()=>[{address:'8.8.8.8',family:4}]}),/20 MB/);}finally{https.get=original;}
});
test('company privacy blocks all network calls by default and restricted/credential files cannot enter prompts',async()=>{
 const {root,data}=fixture();try{
  onboarding.stage(root,data,[path.join(pack,'vamo-team.xlsx'),path.join(pack,'linkedin-campaign.md')]);assert.ok(data.onboarding.files.every(f=>!f.aiAllowed));
  let calls=0;const fetcher=async()=>{calls++;throw new Error('Unexpected network');};
  await assert.rejects(onboarding.analyze(data,'synthetic-key',{consent:true,fetcher}),/Company AI is off/);assert.equal(calls,0);
  privacy.configure(data,true);privacy.permissions(data.onboarding.files,data.onboarding.files.map(f=>({id:f.id,confidentiality:'restricted',aiAllowed:true})));
  await assert.rejects(onboarding.analyze(data,'synthetic-key',{consent:true,fetcher}),/Select permitted/);assert.equal(calls,0);
  const credentialFile=path.join(root,'credentials.txt');fs.writeFileSync(credentialFile,'Password: synthetic-secret-123');onboarding.stage(root,data,[credentialFile]);assert.equal(data.onboarding.files[0].containsCredentials,true);privacy.permissions(data.onboarding.files,[{id:data.onboarding.files[0].id,confidentiality:'internal',aiAllowed:true}]);assert.equal(data.onboarding.files[0].aiAllowed,false);
  await assert.rejects(onboarding.analyze(data,'synthetic-key',{consent:true,fetcher}),/Select permitted/);assert.equal(calls,0);
  const before=structuredClone(data.onboarding.files);assert.throws(()=>privacy.permissions(data.onboarding.files,[{id:before[0].id,confidentiality:'public',aiAllowed:true},{id:'unknown',confidentiality:'public',aiAllowed:true}]),/Invalid/);assert.deepEqual(data.onboarding.files,before);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('only explicitly selected file text is sent and retained privacy/provenance reach imported sources',async()=>{
 const {root,data}=fixture();try{
  const draft=onboarding.stage(root,data,[{path:path.join(pack,'linkedin-campaign.md'),name:'linked-guide.md',origin:{kind:'google',fileId:'synthetic-file'}},path.join(pack,'people-onboarding.md')]);
  privacy.configure(data,true);privacy.permissions(draft.files,[{id:draft.files[0].id,confidentiality:'internal',aiAllowed:true},{id:draft.files[1].id,confidentiality:'restricted',aiAllowed:true}]);let sent;
  await onboarding.analyze(data,'synthetic-key',{consent:true,model:'synthetic-model',fetcher:async(_url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({people:[],documents:[],company:null})}}]})};}});
  const payload=JSON.parse(sent.messages[1].content);assert.equal(payload.length,1);assert.equal(payload[0].name,'linked-guide.md');assert.ok(!JSON.stringify(sent).includes('People onboarding'));
  await onboarding.apply(root,data,{batchId:draft.id,people:[],documents:draft.files.map(f=>({id:f.id,included:true,scope:'department',department:'Marketing',version:'1',approve:true}))});assert.equal(data.sources[0].origin.kind,'google');assert.equal(data.sources[0].aiAllowed,true);assert.equal(data.sources[1].aiAllowed,false);assert.equal(data.sources[1].confidentiality,'restricted');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('source answers never send restricted or legacy sources even when company AI is permitted',async()=>{
 const {root,data}=fixture();const old=global.fetch;try{
  const source=workspace.importFile(root,data,path.join(pack,'linkedin-campaign.md'),{scope:'department',department:'Marketing'});workspace.updateSource(data,source.id,'approved',80);privacy.configure(data,true);source.aiAllowed=true;source.confidentiality='restricted';let calls=0;global.fetch=async()=>{calls++;throw new Error('Unexpected network');};await answerWorkspace(data,'LinkedIn guidance','synthetic-key','synthetic-model');assert.equal(calls,0);delete source.aiAllowed;source.confidentiality='internal';await answerWorkspace(data,'LinkedIn guidance','synthetic-key','synthetic-model');assert.equal(calls,0);
 }finally{global.fetch=old;fs.rmSync(root,{recursive:true,force:true});}
});
test('cloud OAuth binds callback state, uses PKCE/read scopes, stores encrypted tokens and isolates owner/workspace',async()=>{
 const {root,data}=fixture();const encryptionKey=crypto.randomBytes(32);const secure={isAsyncEncryptionAvailable:async()=>true,encryptStringAsync:async(text)=>{const iv=crypto.randomBytes(16),cipher=crypto.createCipheriv('aes-256-cbc',encryptionKey,iv);return Buffer.concat([iv,cipher.update(text),cipher.final()]);},decryptStringAsync:async(value)=>{const decipher=crypto.createDecipheriv('aes-256-cbc',encryptionKey,value.subarray(0,16));return {result:Buffer.concat([decipher.update(value.subarray(16)),decipher.final()]).toString()};}};
 let auth,tokenBody;const request=url=>new Promise((resolve,reject)=>http.get(url,r=>{r.resume();r.on('end',()=>resolve(r.statusCode));}).on('error',reject));
 const cloud=new CloudImports({root:()=>root,secure,open:async value=>{auth=new URL(value);const redirect=new URL(auth.searchParams.get('redirect_uri'));redirect.searchParams.set('code','synthetic-code');redirect.searchParams.set('state','wrong-state');assert.equal(await request(redirect),400);redirect.searchParams.set('state',auth.searchParams.get('state'));assert.equal(await request(redirect),200);},fetcher:async(url,options)=>{if(url.includes('/token')){tokenBody=new URLSearchParams(options.body);return {ok:true,json:async()=>({access_token:'synthetic-cloud-access',expires_in:3600})};}return {ok:true,json:async()=>({files:[{id:'file-1',name:'Team.xlsx',mimeType:'xlsx',size:20}]})};}});
 try{
  await cloud.configure('google','test-client-id');await cloud.connect(data,'google',()=>{});assert.equal(auth.searchParams.get('scope'),'https://www.googleapis.com/auth/drive.readonly');assert.equal(auth.searchParams.get('code_challenge_method'),'S256');assert.equal(crypto.createHash('sha256').update(tokenBody.get('code_verifier')).digest('base64url'),auth.searchParams.get('code_challenge'));assert.equal(cloud.status(data)[0].connected,true);
  assert.ok(!fs.readFileSync(cloud.file(),'utf8').includes('synthetic-cloud-access'));assert.ok(!JSON.stringify(cloud.status(data)).includes('synthetic-cloud-access'));
  const other={...data,activePersonId:'other-owner'};assert.throws(()=>cloud.token(other,'google'),/Reconnect/);assert.throws(()=>cloud.token({...data,id:'other-company'},'google'),/Reconnect/);
  const restored=new CloudImports({root:()=>root,secure,open:async()=>{}});await restored.load();assert.equal(restored.token(data,'google'),'synthetic-cloud-access');assert.equal((await cloud.list(data,'google')).items[0].name,'Team.xlsx');await cloud.disconnect(data,'google');assert.equal(cloud.status(data)[0].connected,false);assert.throws(()=>cloud.token(data,'google'),/Reconnect/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
