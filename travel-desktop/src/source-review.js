const fs=require('node:fs');
const workspace=require('./workspace');
function compare(data,newId,oldId){
 const visible=new Set(workspace.visibleSources(data).map(source=>source.id));
 if(!visible.has(newId)||!visible.has(oldId)||newId===oldId)throw new Error('Both documents must be accessible');
 const newer=data.sources.find(source=>source.id===newId),older=data.sources.find(source=>source.id===oldId);
 if(newer.department!==older.department||newer.scope!==older.scope)throw new Error('Compare sources in the same scope and department');
 const read=source=>{try{return source.textPath?fs.readFileSync(source.textPath,'utf8').slice(0,50000):'';}catch{return '';}};
 const a=read(older).split(/\r?\n/).slice(0,250),b=read(newer).split(/\r?\n/).slice(0,250);
 if(!a.join('').trim()||!b.join('').trim())throw new Error('Both sources need readable extracted text');
 const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
 const changes=[];let i=0,j=0;
 while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&a[i]===b[j]){i++;j++;continue;}if(j<b.length&&(i===a.length||dp[i][j+1]>=dp[i+1][j]))changes.push({type:'added',line:j+1,text:b[j++]});else changes.push({type:'removed',line:i+1,text:a[i++]});}
 return {older:{id:older.id,title:older.title,version:older.version,status:older.status},newer:{id:newer.id,title:newer.title,version:newer.version,status:newer.status},changes:changes.slice(0,200),truncated:a.length===250||b.length===250||changes.length>200,method:'Line-level comparison of extracted text; not a semantic conflict decision'};
}
module.exports={compare};
