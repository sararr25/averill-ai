const stopWords=new Set(['about','and','approved','are','can','come','company','con','current','della','delle','document','does','for','from','guidance','how','non','per','policy','source','that','the','this','una','what','when','where','which','who','why','with']);
function terms(question){return [...new Set((String(question||'').toLowerCase().match(/[a-z0-9]{3,}/g)||[]).filter(word=>!stopWords.has(word)))];}
function passage(text,question){
 const words=terms(question),lines=String(text||'').split(/\r?\n/),matches=[];let page=null;
 for(let i=0;i<lines.length;i++){
  const marker=lines[i].match(/^\[PDF page (\d+)\]$/);if(marker){page=Number(marker[1]);continue;}
  const line=lines[i].trim();if(!line)continue;
  const count=words.filter(word=>line.toLowerCase().includes(word)).length;
  if(count)matches.push({quote:line.slice(0,500),line:i+1,page,score:count});
 }
 return matches.sort((a,b)=>b.score-a.score||a.line-b.line)[0]||null;
}
module.exports={terms,passage};
