const https = require('node:https');
const dns = require('node:dns/promises');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const MAX = 20 * 1024 * 1024;
function publicAddress(address) {
 if (net.isIP(address) === 4) {
  const p = address.split('.').map(Number);
  return !(p[0]===0 || p[0]===10 || p[0]===127 || p[0]>=224 || (p[0]===169&&p[1]===254) || (p[0]===172&&p[1]>=16&&p[1]<=31) || (p[0]===192&&[0,168].includes(p[1])) || (p[0]===100&&p[1]>=64&&p[1]<=127) || (p[0]===198&&[18,19,51].includes(p[1])) || (p[0]===203&&p[1]===0));
 }
 // Public global unicast IPv6 only; mapped IPv4, link-local, ULA and multicast are excluded.
 const blocked=new net.BlockList();blocked.addSubnet('2001:db8::',32,'ipv6');blocked.addSubnet('2001::',32,'ipv6');blocked.addSubnet('2002::',16,'ipv6');
 return net.isIP(address) === 6 && /^[23][0-9a-f]{3}:/i.test(address) && !blocked.check(address,'ipv6');
}
async function target(value, resolver = dns.lookup) {
 let url; try { url = new URL(value); } catch { throw new Error('Enter a valid HTTPS link.'); }
 if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw new Error('Use an HTTPS link without embedded credentials or a custom port.');
 const host = url.hostname.replace(/^\[|\]$/g, '');
 let addresses; try { addresses = net.isIP(host) ? [{address:host,family:net.isIP(host)}] : await resolver(host,{all:true}); } catch { throw new Error('The link host could not be resolved.'); }
 if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error('Private, local and reserved network links cannot be imported.');
 url.hash = ''; return {url,address:addresses[0]};
}
async function download(value, options = {}, redirects = 0) {
 if (redirects > 5) throw new Error('The link redirects too many times.');
 const {url,address} = await target(value,options.resolver);
 const headers = { 'User-Agent':'Averill-company-import/0.1', ...(options.headers || {}) };
 return new Promise((resolve,reject)=>{
  const req = https.get(url,{headers,autoSelectFamily:false,lookup:(_host,_opts,callback)=>callback(null,address.address,address.family)},res=>{
   if ([301,302,303,307,308].includes(res.statusCode)) {
    res.resume();
    if (!res.headers.location) { reject(new Error('The download redirect is incomplete.')); return; }
    // Never forward bearer headers to a signed download host or arbitrary redirect.
    resolve(download(new URL(res.headers.location,url).href,{...options,headers:{}},redirects+1));return;
   }
   if(res.statusCode!==200){res.resume();reject(new Error(`Download failed (${res.statusCode}). Use an accessible file link or connect its cloud account.`));return;}
   if(Number(res.headers['content-length'])>MAX){res.destroy();reject(new Error('File exceeds 20 MB.'));return;}
   const chunks=[];let size=0;
   res.on('data',chunk=>{size+=chunk.length;if(size>MAX){res.destroy();reject(new Error('File exceeds 20 MB.'));}else chunks.push(chunk);});
   res.on('end',()=>resolve({content:Buffer.concat(chunks),type:String(res.headers['content-type']||''),disposition:String(res.headers['content-disposition']||''),url:url.href}));
   res.on('error',()=>reject(new Error('The file download was interrupted.')));
  });
  const deadline=setTimeout(()=>req.destroy(new Error('File download timed out.')),30000);
  deadline.unref();
  req.on('close',()=>clearTimeout(deadline));
  req.setTimeout(25000,()=>req.destroy(new Error('File download timed out.')));
  req.on('error',()=>reject(new Error('Could not download the file over HTTPS.')));
 });
}
function readableHTML(content) {
 return content.toString('utf8').replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<\/(p|div|h[1-6]|li|tr)>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/[ \t]+/g,' ').trim().slice(0,100000);
}
function save(root, response, proposedName, extensions) {
 const safe = path.basename(String(proposedName || 'linked-document')).replace(/[^\w .@()-]/g,'_').slice(0,150);
 let name = safe, extension = path.extname(name).toLowerCase();
 if(response.type.includes('text/html')) {
  if(/accounts\.google|login\.microsoft|sign in|sign-in/i.test(response.content.toString('utf8').slice(0,8000))) throw new Error('This link requires sign-in. Connect Google Drive/OneDrive or choose a synced local file.');
  name=`${path.basename(name,extension)}.txt`;extension='.txt';response.content=Buffer.from(readableHTML(response.content));
 } else if(!extensions.has(extension)) {
  const types={'application/pdf':'.pdf','image/svg+xml':'.svg','text/plain':'.txt','text/csv':'.csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'.xlsx','application/json':'.json','image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'};
  extension=types[response.type.split(';')[0]];
  if(!extension) throw new Error('Unsupported file type. Use an exported PDF, XLSX, SVG or text document.');
  name+=extension;
 }
 if(!response.content.length)throw new Error('The linked document is empty.');
 fs.mkdirSync(root,{recursive:true,mode:0o700});
 const directory=path.join(root,crypto.randomUUID());fs.mkdirSync(directory,{mode:0o700});
 const file=path.join(directory,name);fs.writeFileSync(file,response.content,{mode:0o600});return file;
}
module.exports={MAX,publicAddress,target,download,save};
