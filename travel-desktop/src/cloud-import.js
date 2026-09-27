const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const remote = require('./remote-import');
const PROVIDERS = {
 google: {label:'Google Drive',auth:'https://accounts.google.com/o/oauth2/v2/auth',token:'https://oauth2.googleapis.com/token',scope:'https://www.googleapis.com/auth/drive.readonly',api:'https://www.googleapis.com/drive/v3'},
 microsoft: {label:'Microsoft OneDrive',auth:'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',token:'https://login.microsoftonline.com/common/oauth2/v2.0/token',scope:'https://graph.microsoft.com/Files.Read',api:'https://graph.microsoft.com/v1.0'},
};
function configFor(provider){const config=PROVIDERS[provider];if(!config)throw new Error('Unknown cloud provider.');return config;}
function validId(id){return typeof id==='string'&&/^[\w!.-]{1,250}$/.test(id);}
function key(data,provider){return `${data.id}:${data.activePersonId}:${provider}`;}
class CloudImports {
 constructor({root,secure,open,fetcher=fetch}){this.root=root;this.secure=secure;this.open=open;this.fetcher=fetcher;this.store={config:{},connections:{}};this.cancel=null;}
 file(){return path.join(this.root(),'averill-cloud.enc.json');}
 async load(){try{const value=fs.readFileSync(this.file(),'utf8');this.store=JSON.parse((await this.secure.decryptStringAsync(Buffer.from(value,'base64'))).result);}catch{/* No previous connections. */}}
 async persist(){if(!await this.secure.isAsyncEncryptionAvailable())throw new Error('Encrypted OS storage is unavailable.');const encrypted=await this.secure.encryptStringAsync(JSON.stringify(this.store));fs.mkdirSync(this.root(),{recursive:true});const temp=`${this.file()}.tmp`;fs.writeFileSync(temp,encrypted.toString('base64'),{mode:0o600});fs.renameSync(temp,this.file());}
 status(data){return Object.entries(PROVIDERS).map(([provider,config])=>{const connection=this.store.connections[key(data,provider)];return {provider,label:config.label,configured:Boolean(this.store.config[provider]?.clientId),connected:Boolean(connection?.expiresAt>Date.now()),expiresAt:connection?.expiresAt||null};});}
 async configure(provider,clientId,clientSecret=''){configFor(provider);if(!/^[\w.-]{8,250}$/.test(String(clientId)))throw new Error('Enter the registered OAuth client ID.');if(String(clientSecret).length>500)throw new Error('Client secret is too long.');this.store.config[provider]={clientId:String(clientId),clientSecret:provider==='google'?String(clientSecret):''};for(const entry of Object.keys(this.store.connections))if(entry.endsWith(`:${provider}`))delete this.store.connections[entry];await this.persist();}
 async connect(data,provider,authorize){
  const config=configFor(provider),registration=this.store.config[provider];if(!registration?.clientId)throw new Error(`Register an Averill ${config.label} OAuth app and save its client ID first.`);
  if(this.cancel)throw new Error('A cloud sign-in is already open.');
  const ownerKey=key(data,provider),state=crypto.randomBytes(32).toString('base64url'),verifier=crypto.randomBytes(48).toString('base64url');
  let timer,server,rejectCallback;
  const callback=new Promise((resolve,reject)=>{
   rejectCallback=reject;
   server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');
    if(req.method!=='GET'||url.pathname!=='/oauth/callback'||url.searchParams.get('state')!==state){res.writeHead(400,{'Content-Type':'text/plain'});res.end('Invalid authorization callback.');return;}
    res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('Return to Averill. You can close this tab.');
    if(url.searchParams.has('error'))reject(new Error('Cloud authorization was declined.'));
    else if(!url.searchParams.get('code'))reject(new Error('Cloud authorization did not return a code.'));
    else resolve(url.searchParams.get('code'));
   });
   server.on('error',()=>reject(new Error('Could not open the local OAuth callback.')));
   timer=setTimeout(()=>reject(new Error('Cloud sign-in timed out. Retry connection.')),240000);
  });
  // Attach rejection handling before listening or opening a browser.
  callback.catch(()=>{});
  this.cancel=()=>rejectCallback(new Error('Cloud sign-in cancelled.'));
  try{
   await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
   const redirect=`http://${provider==='google'?'127.0.0.1':'localhost'}:${server.address().port}/oauth/callback`;
   const url=new URL(config.auth);for(const [name,value]of Object.entries({client_id:registration.clientId,redirect_uri:redirect,response_type:'code',scope:config.scope,state,code_challenge:crypto.createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',prompt:'consent'}))url.searchParams.set(name,value);
   await this.open(url.href);const code=await callback;authorize();
   const body=new URLSearchParams({client_id:registration.clientId,grant_type:'authorization_code',code,redirect_uri:redirect,code_verifier:verifier});
   if(registration.clientSecret)body.set('client_secret',registration.clientSecret);
   const response=await this.fetcher(config.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString(),signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw new Error(`Cloud token exchange failed (${response.status}). Check the registered client and redirect URI.`);
   const token=await response.json();if(typeof token.access_token!=='string'||!Number.isFinite(Number(token.expires_in)))throw new Error('Cloud provider returned an invalid token.');authorize();
   this.store.connections[ownerKey]={accessToken:token.access_token,expiresAt:Date.now()+Math.max(0,Number(token.expires_in)-60)*1000};await this.persist();
  }finally{clearTimeout(timer);server?.close();this.cancel=null;}
 }
 token(data,provider){configFor(provider);const entry=this.store.connections[key(data,provider)];if(!entry||entry.expiresAt<=Date.now())throw new Error('Reconnect this cloud account to continue.');return entry.accessToken;}
 async disconnect(data,provider){configFor(provider);delete this.store.connections[key(data,provider)];await this.persist();}
 async json(data,provider,relative){const config=configFor(provider);const response=await this.fetcher(`${config.api}${relative}`,{headers:{Authorization:`Bearer ${this.token(data,provider)}`},signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`Cloud request failed (${response.status}). Reconnect or check file access.`);return response.json();}
 async list(data,provider,folder='root',cursor=''){
  if(!validId(folder)||cursor.length>2000)throw new Error('Invalid cloud folder or page.');
  if(provider==='google'){
   const query=new URLSearchParams({q:`'${folder}' in parents and trashed = false`,fields:'nextPageToken,files(id,name,mimeType,size)',pageSize:'100'});if(cursor)query.set('pageToken',cursor);
   const result=await this.json(data,provider,`/files?${query}`);return {items:(result.files||[]).map(f=>({id:f.id,name:f.name,folder:f.mimeType==='application/vnd.google-apps.folder',size:Number(f.size||0)})),cursor:result.nextPageToken||''};
  }
  const query=new URLSearchParams({'$select':'id,name,size,folder,file','$top':'100'});if(cursor)query.set('$skiptoken',cursor);
  const result=await this.json(data,provider,`${folder==='root'?'/me/drive/root':`/me/drive/items/${encodeURIComponent(folder)}`}/children?${query}`);
  let next='';if(result['@odata.nextLink']){const nextURL=new URL(result['@odata.nextLink']);if(nextURL.origin!=='https://graph.microsoft.com')throw new Error('Unexpected cloud pagination host.');next=nextURL.searchParams.get('$skiptoken')||'';}
  return {items:(result.value||[]).map(f=>({id:f.id,name:f.name,folder:Boolean(f.folder),size:Number(f.size||0)})),cursor:next};
 }
 async fileDownload(data,provider,id){
  if(!validId(id))throw new Error('Invalid cloud file.');
  const config=configFor(provider);let metadata,url,name;
  if(provider==='google'){
   metadata=await this.json(data,provider,`/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size`);name=metadata.name;
   const exports={'application/vnd.google-apps.document':['text/plain','.txt'],'application/vnd.google-apps.spreadsheet':['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.xlsx'],'application/vnd.google-apps.presentation':['application/pdf','.pdf']};
   if(exports[metadata.mimeType]){const [type,ext]=exports[metadata.mimeType];name+=ext;url=`${config.api}/files/${encodeURIComponent(id)}/export?mimeType=${encodeURIComponent(type)}`;}
   else {if(metadata.mimeType==='application/vnd.google-apps.folder')throw new Error('Select files inside the folder.');url=`${config.api}/files/${encodeURIComponent(id)}?alt=media`;}
  }else{
   metadata=await this.json(data,provider,`/me/drive/items/${encodeURIComponent(id)}?$select=id,name,size,file,folder`);if(!metadata.file)throw new Error('Select files inside the folder.');name=metadata.name;url=`${config.api}/me/drive/items/${encodeURIComponent(id)}/content`;
  }
  if(Number(metadata.size)>remote.MAX)throw new Error('Cloud file exceeds 20 MB.');
  const response=await remote.download(url,{headers:{Authorization:`Bearer ${this.token(data,provider)}`}});return {response,name,origin:{kind:provider,fileId:id}};
 }
}
module.exports={CloudImports,PROVIDERS,validId};
