const stopWords=new Set(['our','your','their','about','and','approved','are','can','come','company','con','current','della','delle','document','does','for','from','guidance','how','non','per','policy','source','that','the','this','una','what','when','where','which','who','why','with']);
const aliases={ferie:['leave','holidays','annual'],vacanze:['leave','holidays','annual'],assenza:['absence','sick'],malattia:['sick','leave'],holidays:['leave','annual'],vacation:['leave','annual'],postiamo:['posting','schedule','usually'],pubblichiamo:['posting','schedule','usually'],post:['posting','publish'],posting:['schedule'],expenses:['expense','receipt','report'],spese:['expenses','receipt'],rimborsi:['expenses','receipt'],rimborsare:['expenses','receipt'],rimborso:['expenses','receipt'],rimborso_spese:['expenses'],scadenza:['deadline','due'],scadenze:['deadline','due'],lancio:['launch'],data:['date'],date:['date'],pubblicazione:['posting','publish'],approvazione:['approval'],approvato:['approved'],remoto:['remote'],riunione:['meeting'],riunioni:['meeting'],sicurezza:['security'],password:['access','password']};
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function terms(question){return [...new Set((normalize(question).replace(/\btime[\s-]+off\b/gi,'annual leave').match(/[\p{L}\p{N}]{3,}/gu)||[]).filter(word=>!stopWords.has(word)).flatMap(word=>[word,...(aliases[word]||[])]))];}
// Chunks preserve original text offsets: quotations and line/page coordinates always refer to the managed source.
function score(text,question){
 const tokens=new Set(normalize(text).match(/[\p{L}\p{N}]+/gu)||[]);
 return terms(question).filter(word=>tokens.has(word)||(word.length>3&&tokens.has(word+'s'))).length;
}
function chunks(text,max=600){
 const input=String(text||''),out=[];let page=null,heading='',block=null,line=0;
 const flush=()=>{if(block){out.push(block);block=null;}};
 for(const match of input.matchAll(/[^\n]+(?:\n|$)|\n/g)){
  line++;const raw=match[0].replace(/\r?\n$/,''),trimmed=raw.trim();
  if(!trimmed){flush();continue;}
  const marker=trimmed.match(/^\[PDF page (\d+)\]$/);
  if(marker){flush();page=Number(marker[1]);continue;}
  if(/^#{1,6}\s/.test(trimmed)){flush();heading=trimmed.replace(/^#{1,6}\s+/,'');continue;}
  if(/^(?:Version|Status|Owner|Company|Approved|Intended status):/i.test(trimmed)){flush();continue;}
  let start=match.index+raw.indexOf(trimmed),end=start+trimmed.length;
  while(start<end){
   let stop=Math.min(end,start+max);
   if(stop<end){const space=input.lastIndexOf(' ',stop);if(space>start+max/2)stop=space;}
   if(block&&stop-block.start>max)flush();
   if(!block)block={quote:input.slice(start,stop),line,page,heading,start,end:stop};
   else{block.end=stop;block.quote=input.slice(block.start,stop);}
   start=stop;while(start<end&&/\s/.test(input[start]))start++;
   if(start<end)flush();
  }
 }
 flush();return out;
}
function passages(text,question,{limit=4}={}){
 return chunks(text).map(c=>({...c,score:score(c.quote,question)*3+score(c.heading,question)})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score||a.start-b.start).slice(0,limit);
}
function passage(text,question){
 const best=passages(text,question,{limit:1})[0];if(!best)return null;
 let offset=best.start;
 const lines=best.quote.split('\n').map((raw,index)=>{const quote=raw.trim(),start=offset+raw.indexOf(quote);offset+=raw.length+1;return {...best,quote,start,end:start+quote.length,line:best.line+index,score:score(quote,question)};}).filter(x=>x.quote&&x.score>0);
 return lines.sort((a,b)=>b.score-a.score||a.start-b.start)[0]||best;
}
module.exports={terms,score,chunks,passages,passage};
