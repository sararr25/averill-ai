const test = require('node:test');
const assert = require('node:assert/strict');
const { BrowserConnect } = require('../src/browser-connect');
const origin = 'chrome-extension://' + 'c'.repeat(32);
async function setup(t, options = {}) {
 let session = 'first-person:1', approved = 0, connected = 0;
 const server = new BrowserConnect({ port: 0, getSession: () => session, approve: async () => { approved++; return true; }, connect: async binding => { connected++; return { endpoint: 'http://127.0.0.1:1234/observation', token: 'a'.repeat(64), binding }; }, ...options });
 t.after(() => server.stop()); const port = await server.start();
 const post = (payload = {}, headers = {}) => fetch(`http://127.0.0.1:${port}/connect`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Connection: 'close', ...headers }, body: JSON.stringify({ tabId: 1, pageOrigin: 'https://draft.example', ...payload }) });
 return { server, post, session: value => { session = value; }, counts: () => [approved, connected] };
}
test('loopback connection requires extension origin and one first-session approval; reconnect stays tab-bound', async t => {
 const f = await setup(t);
 assert.equal((await f.post({}, { Origin: 'https://draft.example' })).status, 403);
 assert.equal((await f.post({ pageOrigin: 'file:///private' })).status, 400);
 const first = await f.post(); assert.equal(first.status, 200); assert.equal((await first.json()).binding.origin, origin);
 assert.deepEqual(f.counts(), [1, 1]);
 assert.equal((await f.post({ tabId: 2, pageOrigin: 'https://second.example' })).status, 200);
 assert.deepEqual(f.counts(), [1, 2]);
 f.session(null); assert.equal((await f.post()).status, 401);
 f.session('next-person:2'); assert.equal((await f.post()).status, 200); assert.deepEqual(f.counts(), [2, 3]);
 f.server.revoke(); await f.post(); assert.deepEqual(f.counts(), [3, 4]);
});
test('cancelled approval and logout while a prompt is open issue no pairing secret', async t => {
 let resolve, started; const waiting = new Promise(r => { started = r; }); let connections = 0;
 const f = await setup(t, { approve: () => { started(); return new Promise(r => { resolve = r; }); }, connect: () => { connections++; return {}; } });
 const first = f.post(); await waiting;
 assert.equal((await f.post()).status, 409);
 f.session(null); resolve(true); assert.equal((await first).status, 403); assert.equal(connections, 0);
 const cancelled = await setup(t, { approve: async () => false, connect: () => { connections++; } });
 assert.equal((await cancelled.post()).status, 403); assert.equal(connections, 0);
});

test('a new process requires fresh approval and an occupied rendezvous port fails without taking over', async t => {
 const first = await setup(t);
 assert.equal((await first.post()).status, 200);
 const occupiedPort = first.server.server.address().port;
 let secondaryApprovals = 0, secondaryConnections = 0;
 const second = new BrowserConnect({ port: occupiedPort, getSession: () => 'other-process', approve: async () => { secondaryApprovals++; return true; }, connect: async () => { secondaryConnections++; return {}; } });
 await assert.rejects(second.start(), { code: 'EADDRINUSE' });
 assert.equal(secondaryApprovals, 0); assert.equal(secondaryConnections, 0);
 assert.equal((await first.post()).status, 200); assert.deepEqual(first.counts(), [1, 2]);
 const closed = new Promise(resolve => first.server.server.once('close', resolve));
 first.server.stop(); await closed;
 const restarted = new BrowserConnect({ port: occupiedPort, getSession: () => 'first-person:1', approve: async () => { secondaryApprovals++; return true; }, connect: async () => { secondaryConnections++; return { synthetic: true }; } });
 t.after(() => restarted.stop()); await restarted.start();
 assert.equal((await first.post()).status, 200);
 assert.equal(secondaryApprovals, 1); assert.equal(secondaryConnections, 1);
});

test('hello marks the extension as installed without sign-in, trust or a connection; other origins are refused', async t => {
 const seen = [];
 const f = await setup(t, { onSeen: at => seen.push(at) });
 const port = f.server.server.address().port;
 const hello = headers => fetch(`http://127.0.0.1:${port}/hello`, { method: 'POST', headers: { Connection: 'close', ...headers } });
 assert.equal(f.server.status(null).extensionSeenAt, null);
 assert.equal((await hello({ Origin: 'https://evil.example' })).status, 403);
 assert.equal(f.server.status(null).extensionSeenAt, null);
 f.session(null);
 assert.equal((await hello({ Origin: origin })).status, 204);
 const status = f.server.status('first-person:1');
 assert.ok(Number.isSafeInteger(status.extensionSeenAt)); assert.equal(seen.length, 1);
 assert.equal(status.approved, false); assert.deepEqual(f.counts(), [0, 0]);
});
