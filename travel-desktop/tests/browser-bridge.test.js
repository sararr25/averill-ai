const test = require('node:test');
const assert = require('node:assert/strict');
const { BrowserBridge } = require('../src/browser-bridge');

test('browser bridge binds the extension/tab, excludes sensitive fields, rejects stale events and revokes its token', async t => {
  const received = []; let stopped = 0;
  const bridge = new BrowserBridge({onObservation: item => received.push(item), onStop: () => stopped++});
  t.after(() => bridge.stop());
  const pair = await bridge.start('person-a');
  const origin = 'chrome-extension:' + '//'+ 'a'.repeat(32);
  const post = (payload, headers = {}) => fetch(pair.endpoint, {method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Averill-Token':pair.token,...headers},body:JSON.stringify({tabId:7,pageOrigin:'https://example.test',sequence:1,kind:'field',reason:'pause',field:{kind:'textarea',label:'Email body',value:'Draft text'},...payload})});
  assert.equal((await post({}, {Origin:'https://malicious.test'})).status,403);
  assert.equal((await post({}, {'X-Averill-Token':'0'.repeat(64)})).status,403);
  assert.equal((await post({})).status,200);
  assert.equal(received[0].personId,'person-a'); assert.equal(received[0].method,'browser-dom');
  assert.equal(received[0].confidence,'selected-field');
  assert.equal((await post({sequence:2,tabId:8})).status,400);
  assert.equal((await post({})).status,400);
  assert.equal((await post({sequence:2,field:{kind:'text',label:'Payment card',value:'4111111111111111'}})).status,400);
  assert.equal(received.length,1);
  assert.equal((await post({sequence:3,kind:'editing'})).status,200); assert.equal(received.at(-1),null);
  assert.equal((await post({sequence:4,kind:'stop'})).status,200); assert.equal(stopped,1); assert.equal(bridge.status().ready,false);
  assert.equal(bridge.token,null);
});

test('lost extension heartbeat clears observation and a new person gets a new pairing secret', async t => {
  let stopped=0;
  const bridge=new BrowserBridge({onObservation:()=>{},onStop:()=>stopped++,timeoutMs:30}); t.after(()=>bridge.stop());
  const pair=await bridge.start('first');
  await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'b'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:1,pageOrigin:'https://example.test',sequence:1,kind:'heartbeat'})});
  await new Promise(resolve=>setTimeout(resolve,60)); assert.equal(stopped,1); assert.equal(bridge.status().ready,false);
  const next=await bridge.start('second'); assert.notEqual(next.token,pair.token);
});
