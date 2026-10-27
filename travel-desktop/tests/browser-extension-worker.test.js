// The actual extension service worker in a VM with a synthetic chrome API and fetch.
// This proves worker logic only; it is not an installed Chrome acceptance test.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const DIR = path.join(__dirname, '../browser-extension');
const TOKEN = 'a'.repeat(64), ENDPOINT = 'http://127.0.0.1:5555/observation', PAGE = 'https://draft.example';

// Values from the VM realm are copied so deepStrictEqual compares plain objects.
const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function worker({ respond }) {
  const storage = {}, listeners = {}, badges = [], pageMessages = [], injections = [], requests = [];
  let alive = false;
  const event = name => ({ addListener: f => { listeners[name] = f; } });
  const chrome = {
    runtime: { id: 'ext', onMessage: event('message') },
    storage: { session: {
      get: async keys => Object.fromEntries([].concat(keys).map(k => [k, storage[k] === undefined ? undefined : structuredClone(storage[k])])),
      set: async object => { Object.assign(storage, structuredClone(object)); },
    } },
    action: { setBadgeText: async value => { badges.push(plain(value)); }, setBadgeBackgroundColor: async () => {} },
    tabs: {
      query: async () => [{ id: 4, url: PAGE + '/draft' }],
      sendMessage: async (tabId, message) => { pageMessages.push(plain(message)); if (message.kind === 'ping') return { alive }; },
      onUpdated: event('updated'), onRemoved: event('removed'),
    },
    scripting: { executeScript: async ({ target, files }) => { injections.push(plain({ tabId: target.tabId, files })); alive = true; } },
  };
  const fetch = async (url, options) => {
    const body = JSON.parse(options.body); requests.push({ url, body, headers: options.headers });
    if (url.endsWith('/connect')) return new Response(JSON.stringify({ endpoint: ENDPOINT, token: TOKEN }), { status: 200 });
    if (body.kind === 'stop') return new Response('{}', { status: 200 });
    return respond(body, requests);
  };
  const context = vm.createContext({ chrome, fetch, URL, AbortSignal, Response, setTimeout, structuredClone, console });
  context.globalThis = context;
  context.importScripts = (...files) => { for (const file of files) vm.runInContext(fs.readFileSync(path.join(DIR, file), 'utf8'), context); };
  vm.runInContext(fs.readFileSync(path.join(DIR, 'background.js'), 'utf8'), context);
  const send = (message, sender = { id: 'ext' }) => new Promise(resolve => { listeners.message(message, sender, value => resolve(plain(value))); });
  const fromPage = message => send(message, { id: 'ext', tab: { id: 4 }, frameId: 0, origin: PAGE });
  return { storage, listeners, badges, pageMessages, injections, requests, send, fromPage, setAlive: value => { alive = value; } };
}
const ok = () => new Response(JSON.stringify({ reviewId: null }), { status: 200 });
const events = requests => requests.filter(r => r.url === ENDPOINT && r.body.kind !== 'stop');

test('connect sets the ON badge and the popup reads connected state; stop clears it with a reason', async () => {
  const w = worker({ respond: ok });
  assert.deepEqual(await w.send({ kind: 'status' }), { state: 'not-connected', host: 'draft.example', page: true });
  assert.deepEqual(await w.send({ kind: 'connect-tab' }), { connected: true });
  assert.deepEqual(w.badges.at(-1), { tabId: 4, text: 'ON' });
  assert.deepEqual(w.injections[0].files, ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'content.js']);
  assert.deepEqual(await w.send({ kind: 'status' }), { state: 'connected', host: 'draft.example' });
  assert.deepEqual(await w.send({ kind: 'stop-pair' }), { stopped: true });
  assert.deepEqual(w.badges.at(-1), { tabId: 4, text: '' });
  assert.equal(w.requests.at(-1).body.endReason, 'stopped_by_user');
  assert.deepEqual(w.pageMessages.at(-1), { kind: 'ended', reason: 'stopped_by_user' });
  assert.equal((await w.send({ kind: 'status' })).state, 'ended');
  assert.equal((await w.send({ kind: 'connect-tab' }, { id: 'ext', tab: { id: 4 } })).error, 'Extension control required.');
});

test('a transient relay failure is retried with fresh sequence numbers, then succeeds', async () => {
  let calls = 0;
  const w = worker({ respond: () => { calls++; if (calls < 3) throw new TypeError('Failed to fetch'); return ok(); } });
  await w.send({ kind: 'connect-tab' });
  assert.deepEqual(await w.fromPage({ kind: 'heartbeat' }), { reviewId: null });
  assert.deepEqual(events(w.requests).map(r => r.body.sequence), [1, 2, 3]);
  assert.equal(w.storage.pair.token, TOKEN, 'The pair survives transient failures');
});

test('retry exhaustion ends with app_closed and tells the page why', async () => {
  const w = worker({ respond: () => new Response('', { status: 503 }) });
  await w.send({ kind: 'connect-tab' });
  assert.deepEqual(await w.fromPage({ kind: 'heartbeat' }), { stopped: true, reason: 'app_closed' });
  assert.equal(events(w.requests).length, 3);
  assert.equal(w.storage.pair, null); assert.equal(w.storage.ended.reason, 'app_closed');
  assert.deepEqual(w.pageMessages.at(-1), { kind: 'ended', reason: 'app_closed' });
  assert.deepEqual(w.badges.at(-1), { tabId: 4, text: '' });
});

test('a rejected token ends immediately without retry; a 410 carries the desktop reason', async () => {
  const revoked = worker({ respond: () => new Response('', { status: 403 }) });
  await revoked.send({ kind: 'connect-tab' });
  assert.deepEqual(await revoked.fromPage({ kind: 'heartbeat' }), { stopped: true, reason: 'approval_revoked' });
  assert.equal(events(revoked.requests).length, 1);
  const unauthorized = worker({ respond: () => new Response('', { status: 401 }) });
  await unauthorized.send({ kind: 'connect-tab' });
  assert.equal((await unauthorized.fromPage({ kind: 'heartbeat' })).reason, 'approval_revoked');
  assert.equal(events(unauthorized.requests).length, 1);
  const signedOut = worker({ respond: () => new Response(JSON.stringify({ ended: 'signed_out' }), { status: 410 }) });
  await signedOut.send({ kind: 'connect-tab' });
  assert.deepEqual(await signedOut.fromPage({ kind: 'heartbeat' }), { stopped: true, reason: 'signed_out' });
  assert.equal(events(signedOut.requests).length, 1);
});

test('a paused heartbeat is relayed as paused; resuming needs no new approval', async () => {
  const w = worker({ respond: ok });
  await w.send({ kind: 'connect-tab' });
  await w.fromPage({ kind: 'heartbeat', paused: true });
  await w.fromPage({ kind: 'heartbeat' });
  assert.deepEqual(events(w.requests).map(r => [r.body.sequence, r.body.paused]), [[1, true], [2, false]]);
  assert.equal(w.requests.filter(r => r.url.endsWith('/connect')).length, 1);
});

test('same-site reload re-injects and keeps the sequence; another site ends with other_site', async () => {
  const w = worker({ respond: ok });
  await w.send({ kind: 'connect-tab' });
  await w.fromPage({ kind: 'heartbeat' }); await w.fromPage({ kind: 'field', reason: 'pause', field: { id: 'field_1', revision: 0, kind: 'textarea', label: 'Body', value: 'x' } });
  w.setAlive(false); // The reload destroyed the old content script.
  w.listeners.updated(4, { status: 'complete' }, { id: 4, url: PAGE + '/draft?reloaded' });
  await w.fromPage({ kind: 'heartbeat' });
  assert.equal(w.injections.length, 2, 'Reload re-injects into the same tab');
  assert.deepEqual(events(w.requests).map(r => r.body.sequence), [1, 2, 3], 'No stale sequence after re-inject');
  assert.deepEqual(w.badges.at(-1), { tabId: 4, text: 'ON' });
  w.listeners.updated(4, { status: 'complete' }, { id: 4, url: PAGE + '/spa-route' }); // Content still alive: SPA route, no re-injection.
  await w.fromPage({ kind: 'heartbeat' });
  assert.equal(w.injections.length, 2);
  // Chrome withdraws activeTab on another site, so the worker cannot read tab.url there.
  w.listeners.updated(4, { status: 'complete' }, { id: 4 });
  assert.deepEqual(await w.fromPage({ kind: 'heartbeat' }), { stopped: true, reason: 'other_site' });
  assert.equal(w.requests.find(r => r.body.kind === 'stop').body.endReason, 'other_site');
  assert.deepEqual(await w.send({ kind: 'status' }), { state: 'ended', reason: 'other_site', host: 'draft.example', page: true });
});

test('closing the shared tab ends with tab_closed', async () => {
  const w = worker({ respond: ok });
  await w.send({ kind: 'connect-tab' });
  w.listeners.removed(4);
  await w.fromPage({ kind: 'heartbeat' });
  assert.equal(w.storage.ended.reason, 'tab_closed');
  assert.equal(w.requests.find(r => r.body.kind === 'stop').body.endReason, 'tab_closed');
});

// FB-08: the image check is the only request that may be large, and only the validated image fields leave the worker.
const PNG_URL = 'data:image/png;base64,' + Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]).toString('base64');
test('image-check is whitelisted, sends only sizes, alt text and PNG data, and marks the request kind', async () => {
  const w = worker({ respond: () => new Response(JSON.stringify({ state: 'no-conflict', findings: [], images: [], notes: [] }), { status: 200 }) });
  await w.send({ kind: 'connect-tab' });
  const value = await w.fromPage({ kind: 'image-check', task: 'instagram', fieldId: 'field_1', revision: 2, token: 'LEAK', images: [{ width: 1080, height: 1350, alt: 'A bridge', dataUrl: PNG_URL, src: 'https://leak.example/a.png', text: 'LEAK' }, { width: 640, height: 480 }] });
  assert.equal(value.state, 'no-conflict');
  const sent = w.requests.at(-1);
  assert.match(sent.url, /\/context$/); assert.equal(sent.headers['X-Averill-Kind'], 'image-check');
  assert.deepEqual(sent.body.images, [{ width: 1080, height: 1350, alt: 'A bridge', dataUrl: PNG_URL }, { width: 640, height: 480, alt: '', unreadable: true }]);
  assert(!JSON.stringify(sent.body).includes('LEAK'));
  const other = await w.fromPage({ kind: 'ask', question: 'q' });
  assert.equal(w.requests.at(-1).headers['X-Averill-Kind'], undefined, 'other requests keep the small-request path');
});
test('image-check rejects too many images, non-PNG data, and bodies above 6 MB before anything is sent', async () => {
  const w = worker({ respond: ok });
  await w.send({ kind: 'connect-tab' });
  const before = w.requests.length, image = { width: 100, height: 100, alt: 'x', dataUrl: PNG_URL };
  assert.match((await w.fromPage({ kind: 'image-check', task: 'instagram', fieldId: 'f', revision: 0, images: Array(5).fill(image) })).error, /up to 4 images/);
  assert.match((await w.fromPage({ kind: 'image-check', task: 'instagram', fieldId: 'f', revision: 0, images: [{ ...image, dataUrl: 'data:text/html;base64,AAAA' }] })).error, /up to 4 images/);
  assert.match((await w.fromPage({ kind: 'image-check', task: 'instagram', fieldId: 'f', revision: 0, images: [{ ...image, alt: 'a'.repeat(301) }] })).error, /up to 4 images/);
  const huge = 'data:image/png;base64,' + 'A'.repeat(1.6 * 1024 * 1024);
  assert.match((await w.fromPage({ kind: 'image-check', task: 'instagram', fieldId: 'f', revision: 0, images: Array(4).fill({ ...image, dataUrl: huge }) })).error, /too large to check \(limit 6 MB\)/);
  assert.equal(w.requests.length, before, 'nothing was relayed');
});
