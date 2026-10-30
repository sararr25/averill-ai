const test=require('node:test');const assert=require('node:assert/strict');
const {AIConnection,companyMode}=require('../src/ai-connection');
test('service connection sends only the configured key and is independent of company permission',async()=>{
 const sent=[];const connection=new AIConnection({models:async key=>{sent.push(key);return ['nvidia/Nemotron-test'];},pickModel:ids=>ids[0]});
 const result=await connection.connect({key:'synthetic-key',demo:true,question:'PRIVATE QUESTION',sources:['PRIVATE FILE']});
 assert.deepEqual(sent,['synthetic-key']);assert.equal(result.status,'connected');assert(!JSON.stringify(result).includes('synthetic-key'));assert.equal(companyMode({privacy:{companyAI:false}},'synthetic-key'),false);assert.equal(companyMode({privacy:{companyAI:true}},'synthetic-key'),true);
});
test('an unavailable provider keeps an explicit retryable connection state without enabling company access',async()=>{
 const connection=new AIConnection({models:async()=>{throw new Error('network failure');},pickModel:()=>null});
 assert.equal((await connection.connect({key:'synthetic'})).status,'unavailable');assert.equal(connection.snapshot().retryable,true);
 assert.equal((await connection.connect({demo:true})).status,'available');assert.equal((await connection.connect({})).status,'not-configured');
});
test('a stale model discovery cannot overwrite newer connection configuration',async()=>{
 let resolve;const connection=new AIConnection({models:()=>new Promise(r=>resolve=r),pickModel:ids=>ids[0]});
 const earlier=connection.connect({key:'old-synthetic'});await connection.connect({demo:true});resolve(['nvidia/Nemotron-test']);await earlier;assert.equal(connection.snapshot().via,'demo-server');
});
