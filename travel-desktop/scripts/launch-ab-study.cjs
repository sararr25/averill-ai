// Isolated, offline synthetic study session; never opens or alters a normal Averill profile.
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const variant=(process.argv.find(a=>a.startsWith('--variant='))||'--variant=B').split('=')[1];
if(!['A','B'].includes(variant))throw new Error('Choose --variant=A or --variant=B');
const ROOT=variant==='A'?'/tmp/averill-excellence-ab-20261030/control-A':path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),`averill-study-${variant}-`));
process.env.NEBIUS_API_KEY='';process.env.TAVILY_API_KEY='';process.env.AVERILL_CONNECT_PORT='0';
const original=global.fetch;global.fetch=(url,opts)=>new URL(url).hostname==='127.0.0.1'?original(url,opts):Promise.resolve(new Response(JSON.stringify({error:'Offline synthetic study session'}),{status:503}));
(async()=>{const judge=require(ROOT+'/src/judge-demo');await judge.create(profile,path.join(ROOT,'demo-company'));app.setPath('userData',profile);require(ROOT+'/main.js');await app.whenReady();app.setName(`Averill study ${variant}`);for(const win of BrowserWindow.getAllWindows())win.setTitle(`Averill study ${variant} · synthetic offline workspace`);console.log('Study variant',variant,'uses a new disposable synthetic profile. Use the bundled demo sign-in. No normal profile or provider key is loaded.');})().catch(error=>{console.error(error.message);app.exit(1)});
