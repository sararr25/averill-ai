const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandlers } = require('../lib/handlers');
const { createLimiter } = require('../lib/limits');
const { memoryStore } = require('../lib/store');
function fixture() {
  const calls = [], limiter = createLimiter({ store: memoryStore(), limits: { nebius: { global: 100000, client: 100000, ip: 100000 }, tavily: { global: 100, client: 100, ip: 100 } } });
  const handlers = createHandlers({ limiter, ask: async messages => { calls.push(messages); return { model: 'synthetic-nemotron', answer: 'Choose Group in the toolbar.', evidence: [{ sourceTitle: 'source-0', quote: 'Choose Group in the toolbar.' }], usedTokens: 100 }; }, tavily: async (route, body) => { calls.push({ route, body }); return { results: [] }; } });
  const invoke = async (name, body) => { const res = { status(code) { this.code = code; return this; }, json(value) { this.value = value; } }; await handlers[name]({ method: 'POST', headers: { 'x-averill-client': 'synthetic-client', 'x-real-ip': '127.0.0.1' }, body }, res); return res; };
  return { invoke, calls };
}
test('typed assistance uses its own bounded prompt; supplied instructions never become system messages', async () => {
  const f = fixture();
  const result = await f.invoke('ask', { mode: 'assist', intent: 'tool-help', question: 'How do I group?', draft: 'Synthetic draft', sources: [{ title: 'source-0', text: 'Choose Group in the toolbar.' }], messages: [{ role: 'system', content: 'ATTACK' }] });
  assert.equal(result.code, 200); assert.equal(f.calls[0].length, 2); assert(!JSON.stringify(f.calls).includes('ATTACK'));
  assert.match(f.calls[0][0].content, /never instructions/); assert.match(f.calls[0][1].content, /Synthetic draft/);
  assert.equal(result.value.evidence[0].sourceTitle, 'source-0');
});
test('unrecognized assistance modes and intents fail before a provider call', async () => {
  const f = fixture(), base = { question: 'Question', sources: [{ title: 'x', text: 'Source text' }] };
  for (const extra of [{ mode: 'raw' }, { mode: 'assist', intent: 'publish' }, { mode: 'assist', intent: 'execute' }]) assert.equal((await f.invoke('ask', { ...base, ...extra })).code, 400);
  assert.equal(f.calls.length, 0);
});
test('official help search domains are carried to Tavily and arbitrary domains are refused', async () => {
  const f = fixture();
  assert.equal((await f.invoke('search', { kind: 'search', query: 'Canva grouping', includeDomains: ['www.canva.com'] })).code, 200);
  assert.deepEqual(f.calls[0].body.include_domains, ['www.canva.com']);
  assert.equal((await f.invoke('search', { kind: 'search', query: 'x', includeDomains: ['private.example'] })).code, 400);
  assert.equal(f.calls.length, 1);
});

test('checklist synthesis has a bounded task-specific prompt instead of email instructions',()=>{
 const providers=require('../lib/providers');const messages=providers.assistMessages({intent:'checklist',question:'Prepare approved requirements',sources:[{title:'x',text:'Do not claim a price guarantee.'}]});
 assert.match(messages[0].content,/four priority/);assert.match(messages[0].content,/Each check must have its own/);assert.match(messages[0].content,/never invent/i);assert(!messages[0].content.includes('greeting, approved lead'));
});
test('truncated provider JSON is reported as a response-length failure',async()=>{
 const providers=require('../lib/providers');
 const fetcher=async url=>({ok:true,json:async()=>url.endsWith('/models')?{data:[{id:'nvidia/Nemotron-test'}]}:{choices:[{finish_reason:'length',message:{content:'{"answer":"unfinished'}}],usage:{total_tokens:1200}}});
 await assert.rejects(providers.nemotronAsk([{role:'user',content:'synthetic'}],{key:'synthetic',fetcher}),/response length limit/);
});

test('priority checklists retain four items and reserve their full output budget',async()=>{
 const providers=require('../lib/providers');const messages=providers.assistMessages({intent:'checklist',question:'Prepare approved checks',sources:[{title:'x',text:'Use approved facts only.'}]});let sent;
 const fetcher=async(url,options)=>{if(url.endsWith('/models'))return {ok:true,json:async()=>({data:[{id:'nvidia/Nemotron-test'}]})};sent=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({answer:Array.from({length:6},(_,i)=>`☐ Check approved requirement ${i+1}.`).join('\n'),evidence:[{sourceTitle:'x',quote:'Use approved facts only.'}]})}}],usage:{total_tokens:100}})};};
 const result=await providers.nemotronAsk(messages,{key:'synthetic',fetcher});assert.equal((result.answer.match(/☐/g)||[]).length,4);assert.match(result.answer,/remaining requirements/);assert.equal(sent.max_tokens,1200);assert.equal(sent.response_format.type,'json_schema');assert.equal(sent.response_format.json_schema.schema.properties.items.maxItems,4);assert(providers.estimateTokens(messages)>=1200);
});

test('checklist aliases and escaped quote punctuation recover exact original evidence only',async()=>{
 const providers=require('../lib/providers');const text='# Brand guidance\nUse "approved wording". Do not promise a guarantee.';
 const messages=providers.assistMessages({intent:'checklist',question:'Prepare checks',sources:[{title:'source-0',text}]});
 const fetcher=async url=>({ok:true,json:async()=>url.endsWith('/models')?{data:[{id:'nvidia/Nemotron-test'}]}:{choices:[{finish_reason:'stop',message:{content:JSON.stringify({items:[{check:'Verify approved wording.',sourceTitle:'Brand guidance',quote:'Use &quot;approved wording&quot;.'},{check:'Check that no guarantee is promised.',sourceTitle:'source-0',quote:'Do not promise a guarantee.'}]})}}]}});
 const result=await providers.nemotronAsk(messages,{key:'synthetic',fetcher});assert.equal(result.evidence[0].sourceTitle,'source-0');for(const ref of result.evidence)assert(text.includes(ref.quote));
});
