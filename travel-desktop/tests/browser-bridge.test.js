const test = require('node:test');
const assert = require('node:assert/strict');
const { BrowserBridge } = require('../src/browser-bridge');
const endReasons = require('../browser-extension/end-reasons');

test('browser bridge binds the extension/tab, excludes sensitive fields, rejects stale events and revokes its token', async t => {
  const received = []; let stopped = 0;
  const bridge = new BrowserBridge({onObservation: item => received.push(item), onStop: () => stopped++});
  t.after(() => bridge.stop());
  const pair = await bridge.start('person-a');
  const origin = 'chrome-extension:' + '//'+ 'a'.repeat(32);
  const post = (payload, headers = {}) => fetch(pair.endpoint, {method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Averill-Token':pair.token,...headers},body:JSON.stringify({tabId:7,pageOrigin:'https://example.test',sequence:1,kind:'field',reason:'pause',field:{kind:'textarea',label:'Email body',value:'Draft text'},...payload})});
  assert.equal((await post({}, {Origin:'https://malicious.test'})).status,403);
  assert.equal((await post({}, {'X-Averill-Token':'0'.repeat(64)})).status,403);
  assert.equal((await post({}, {'X-Averill-Token':'å'.repeat(64)})).status,403);
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
  const bridge=new BrowserBridge({onObservation:()=>{},onStop:()=>stopped++,livenessMs:30}); t.after(()=>bridge.stop());
  const pair=await bridge.start('first');
  await fetch(pair.endpoint,{method:'POST',headers:{Origin:'chrome-extension://'+'b'.repeat(32),'Content-Type':'application/json','X-Averill-Token':pair.token},body:JSON.stringify({tabId:1,pageOrigin:'https://example.test',sequence:1,kind:'heartbeat'})});
  await new Promise(resolve=>setTimeout(resolve,60)); assert.equal(stopped,1); assert.equal(bridge.status().ready,false);
  const next=await bridge.start('second'); assert.notEqual(next.token,pair.token);
});

const extension = 'chrome-extension://' + 'd'.repeat(32);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function client(pair, tabId = 4) {
  let sequence = 0;
  return (payload = {}, token = pair.token) => fetch(pair.endpoint, { method: 'POST', headers: { Origin: extension, 'Content-Type': 'application/json', 'X-Averill-Token': token, Connection: 'close' }, body: JSON.stringify({ tabId, pageOrigin: 'https://draft.example', sequence: ++sequence, kind: 'heartbeat', ...payload }) });
}

test('a hidden tab pauses with a longer liveness window and resumes without a new pairing', async t => {
  const ends = []; let changes = 0;
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: reason => ends.push(reason), onState: () => changes++, livenessMs: 60, pausedLivenessMs: 600 });
  t.after(() => bridge.shutdown());
  const pair = await bridge.start('person', { origin: extension, tabId: 4, pageOrigin: 'https://draft.example' });
  const post = client(pair);
  assert.equal((await post({ paused: true })).status, 200);
  assert.equal(bridge.status().paused, true); assert.equal(changes, 1);
  await sleep(200); // Longer than the visible window: a paused tab is not idle-expired.
  assert.deepEqual(ends, []); assert.equal(bridge.status().connected, true);
  assert.equal((await post()).status, 200);
  assert.equal(bridge.status().paused, false); assert.equal(changes, 2); assert.equal(bridge.token, pair.token);
  await sleep(150);
  assert.deepEqual(ends, ['lost_contact']);
  assert.equal(bridge.status().lastEnd.message, 'Averill lost contact with the page.');
});

test('regular heartbeats keep an idle connection alive; silence ends it as lost contact', async t => {
  const ends = [];
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: reason => ends.push(reason), livenessMs: 80 });
  t.after(() => bridge.shutdown());
  const post = client(await bridge.start('person'));
  for (let i = 0; i < 8; i++) { assert.equal((await post()).status, 200); await sleep(30); }
  assert.deepEqual(ends, [], '240 ms of heartbeats outlast an 80 ms window');
  await sleep(140);
  assert.deepEqual(ends, ['lost_contact']); assert.equal(bridge.status().ready, false);
});

test('an ended bridge answers its own token with the end reason, never with data', async t => {
  const received = [];
  const bridge = new BrowserBridge({ onObservation: item => received.push(item), onStop: () => {}, tombstoneMs: 500 });
  t.after(() => bridge.shutdown());
  const pair = await bridge.start('person');
  const post = client(pair);
  assert.equal((await post()).status, 200);
  bridge.stop('signed_out');
  assert.equal(bridge.status().ready, false); assert.equal(bridge.token, null);
  const ended = await post({ kind: 'field', reason: 'pause', field: { kind: 'textarea', label: 'Body', value: 'After sign-out' } });
  assert.equal(ended.status, 410); assert.deepEqual(await ended.json(), { ended: 'signed_out' });
  assert.equal(received.length, 0);
  assert.equal((await post({}, 'f'.repeat(64))).status, 403);
  assert.equal(bridge.status().lastEnd.reason, 'signed_out');
  assert.throws(() => bridge.stop('not_a_reason'), /Unknown end reason/);
});

test('extension end reasons are recorded and a stop is accepted even behind a retried sequence', async t => {
  const ends = [];
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: reason => ends.push(reason) });
  t.after(() => bridge.shutdown());
  const pair = await bridge.start('person');
  const post = client(pair);
  assert.equal((await post({ sequence: 9 })).status, 200);
  assert.equal((await post({ sequence: 2, kind: 'stop', endReason: 'other_site' })).status, 200);
  assert.deepEqual(ends, ['other_site']); assert.equal(bridge.status().lastEnd.reason, 'other_site');
  const next = await bridge.start('person');
  assert.equal((await client(next)({ kind: 'stop', endReason: 'signed_out' })).status, 400, 'The extension cannot claim desktop-only reasons');
});

test('every end reason has its own plain-English message without dashes', () => {
  assert.deepEqual([...endReasons.REASONS].sort(), ['app_closed', 'approval_revoked', 'lost_contact', 'other_site', 'signed_out', 'stopped_by_user', 'tab_closed']);
  const messages = endReasons.REASONS.map(endReasons.message);
  assert.equal(new Set(messages).size, messages.length);
  for (const text of [...messages, endReasons.RECONNECT]) { assert.match(text, /^[A-Z].*\.$/); assert.doesNotMatch(text, /[\u2013\u2014]/); }
  assert.match(endReasons.RECONNECT, /click the Averill icon in the Chrome toolbar/);
  assert.throws(() => endReasons.message('expired'), /Unknown browser connection end reason/);
});
