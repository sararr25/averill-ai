// FB-07: typed questions from the in-page card. Real bridge, real ContextualReview, real local answer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const workspace = require('../src/workspace');
const { observation } = require('../src/external-observation');
const { BrowserBridge } = require('../src/browser-bridge');
const { ContextualReview } = require('../src/contextual-review');
const { localWorkspaceAnswer } = require('../src/workspace-answer');

const QUOTE = 'Do not claim "lowest prices guaranteed".';
function fixture(t, answerOverride) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-ask-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, 'policy.md'); fs.writeFileSync(file, QUOTE);
  const data = workspace.create(root, 'Synthetic company', 'Owner');
  const source = workspace.importFile(root, data, file, { department: 'Marketing', version: '2' });
  workspace.updateSource(data, source.id, 'approved');
  const state = { signedIn: true, workspace: data, epoch: 1, aiEnabled: false, key: '' };
  state.observed = { ...observation({ personId: data.activePersonId, windowId: 'browser:1', windowName: 'Draft', method: 'browser-dom', text: 'Our lowest prices guaranteed.' }), fieldId: 'field-0001', revision: 0 };
  state.observed.field = { label: 'Email body', kind: 'textarea', value: state.observed.text };
  const contexts = [];
  const answer = answerOverride || ((question, context) => { contexts.push(context); return localWorkspaceAnswer(data, question); });
  const service = new ContextualReview({ getState: () => state, answer });
  return { root, data, source, state, service, contexts };
}

test('ask is answered locally with a validated citation: title, version and exact quote', async t => {
  const f = fixture(t);
  const result = await f.service.ask({ question: 'Can we say lowest prices guaranteed?', fieldId: 'field-0001', revision: 0 });
  assert.equal(result.state, 'answered'); assert.equal(result.mode, 'local'); assert.equal(result.usedField, true);
  assert.deepEqual(Object.keys(result.citations[0]).sort(), ['id', 'quote', 'title', 'version']);
  assert.equal(result.citations[0].quote, QUOTE); assert.equal(result.citations[0].version, '2'); assert(result.citations[0].title);
  assert.equal(f.contexts[0], 'Our lowest prices guaranteed.', 'selected field is passed as context');
});

test('ask without a selected field, or with a stale revision, still answers but sends no field text', async t => {
  const f = fixture(t);
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?' })).usedField, false);
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?', fieldId: 'field-0001', revision: 5 })).usedField, false);
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?', fieldId: 'other-field', revision: 0 })).usedField, false);
  assert.deepEqual(f.contexts, ['', '', '']);
});

test('a credential in the question is refused before any answer path runs', async t => {
  let called = 0; const f = fixture(t, () => { called++; return { text: 'x', sources: [] }; });
  const result = await f.service.ask({ question: 'Use password: hunter2hunter2 to log in' });
  assert.equal(result.state, 'refused'); assert.match(result.message, /credentials out of the question/); assert.equal(called, 0);
  assert.deepEqual(result.citations, []);
});

test('credential-looking selected text is never passed as context', async t => {
  const f = fixture(t);
  f.state.observed.field.value = 'api_key: abcd1234efgh';
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?', fieldId: 'field-0001', revision: 0 })).usedField, false);
  assert.equal(f.contexts[0], '');
});

test('questions must be 1 to 500 characters', async t => {
  const f = fixture(t);
  await assert.rejects(f.service.ask({ question: '   ' }), /1 to 500/);
  await assert.rejects(f.service.ask({ question: 'a'.repeat(501) }), /1 to 500/);
  await assert.rejects(f.service.ask({ question: 42 }), /1 to 500/);
});

test('exact-quote validation: invented, altered or empty quotes are never cited', async t => {
  for (const quote of ['Lowest prices are fine.', QUOTE.toLowerCase(), '', 'x'.repeat(700)]) {
    const f = fixture(t, () => ({ text: 'Verified extract: invented', mode: 'model', sources: [{ id: f.source.id, title: 'Policy', quote }] }));
    const result = await f.service.ask({ question: 'lowest prices guaranteed?' });
    assert.equal(result.state, 'no-source'); assert.equal(result.message, 'No approved source answers this.'); assert.equal(result.text, '');
  }
  const f = fixture(t, () => ({ text: 'x', mode: 'model', sources: [{ id: 'not-a-source', title: 'Fake', quote: QUOTE }] }));
  assert.equal((await f.service.ask({ question: 'q' })).state, 'no-source');
});

test('restricted and credential-bearing sources are never cited and their prose never leaks', async t => {
  for (const flag of ['restricted', 'credentials']) {
    const f = fixture(t);
    const second = path.join(f.root, 'tiers.md'); fs.writeFileSync(second, 'Secret internal pricing tier list.');
    const other = workspace.importFile(f.root, f.data, second, { department: 'Marketing', version: '1' }); workspace.updateSource(f.data, other.id, 'approved');
    if (flag === 'restricted') other.confidentiality = 'restricted'; else other.containsCredentials = true;
    const result = await f.service.ask({ question: 'secret internal pricing tier list and lowest prices guaranteed' });
    const serialized = JSON.stringify(result);
    assert(!result.citations.some(c => c.id === other.id), flag);
    assert(!serialized.includes('Secret internal pricing'), `${flag}: restricted text must not leak through the prose`);
    assert.equal(result.state, 'answered'); assert.equal(result.citations[0].id, f.source.id);
  }
  const f = fixture(t); f.source.confidentiality = 'restricted';
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?' })).state, 'no-source');
});

test('a revoked source is not cited and a changed session discards the answer', async t => {
  const f = fixture(t); f.source.status = 'superseded';
  assert.equal((await f.service.ask({ question: 'lowest prices guaranteed?' })).state, 'no-source');
  const g = fixture(t, async () => { g.state.epoch++; return { text: 'x', sources: [] }; });
  await assert.rejects(g.service.ask({ question: 'lowest prices guaranteed?' }), /changed/);
});

test('the answer exposes no workspace snapshot, paths, people or token', async t => {
  const f = fixture(t);
  const text = JSON.stringify(await f.service.ask({ question: 'lowest prices guaranteed?', fieldId: 'field-0001', revision: 0 }));
  for (const forbidden of [f.source.textPath, 'textPath', 'ownerId', 'people', 'privacy', 'publicClaims', 'steps', 'approvedBy', 'approvedAt', 'sources":', 'Synthetic company']) assert(!text.includes(forbidden), forbidden);
});

async function paired(t, f) {
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: () => {}, onRequest: p => p.kind === 'ask' ? f.service.ask(p) : { reviewId: null } });
  t.after(() => bridge.stop());
  const pair = await bridge.start(f.data.activePersonId, { origin: 'chrome-extension://' + 'a'.repeat(32), tabId: 1, pageOrigin: 'https://draft.example' });
  const headers = { Origin: 'chrome-extension://' + 'a'.repeat(32), 'Content-Type': 'application/json', 'X-Averill-Token': pair.token };
  const post = (payload, extra = {}, route = '/context') => fetch(pair.endpoint.replace('/observation', route), { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify({ tabId: 1, pageOrigin: 'https://draft.example', ...payload }) });
  return { bridge, pair, post };
}

test('over the authenticated bridge: allowed when paired; refused for wrong origin, tab, token or size', async t => {
  const f = fixture(t); const { post } = await paired(t, f);
  const ok = await post({ kind: 'ask', question: 'Can we say lowest prices guaranteed?' });
  assert.equal(ok.status, 200); const body = await ok.json(); assert.equal(body.state, 'answered'); assert.equal(body.citations[0].quote, QUOTE);
  assert.equal((await post({ kind: 'ask', question: 'x' }, { Origin: 'https://draft.example' })).status, 403);
  assert.equal((await post({ kind: 'ask', question: 'x' }, { 'X-Averill-Token': 'b'.repeat(64) })).status, 403);
  assert.equal((await post({ kind: 'ask', question: 'x', tabId: 2 })).status, 400, 'another tab');
  assert.equal((await post({ kind: 'ask', question: 'x', pageOrigin: 'https://evil.example' })).status, 400, 'another origin');
  assert.equal((await post({ kind: 'ask', question: 'x'.repeat(24500) })).status, 400, '24000 byte cap');
  assert.equal((await post({ kind: 'ask', question: 'password: hunter2hunter2' })).status, 200);
});

test('ask is refused when the bridge is not paired to an extension and tab', async t => {
  const f = fixture(t);
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: () => {}, onRequest: p => f.service.ask(p) });
  t.after(() => bridge.stop());
  const pair = await bridge.start(f.data.activePersonId);
  const response = await fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', headers: { Origin: 'chrome-extension://' + 'a'.repeat(32), 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ kind: 'ask', question: 'x', tabId: 1, pageOrigin: 'https://draft.example' }) });
  assert.equal(response.status, 400);
  bridge.stop();
  await assert.rejects(fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', body: '{}' }));
});

test('the extension worker whitelists ask and forwards only the question and optional field identity', async () => {
  const DIR = path.join(__dirname, '../browser-extension'), TOKEN = 'a'.repeat(64), ENDPOINT = 'http://127.0.0.1:5555/observation', PAGE = 'https://draft.example';
  const storage = {}, requests = []; let listener;
  const chrome = { runtime: { id: 'ext', onMessage: { addListener: f => { listener = f; } } }, storage: { session: { get: async keys => Object.fromEntries([].concat(keys).map(k => [k, storage[k] === undefined ? undefined : structuredClone(storage[k])])), set: async o => { Object.assign(storage, structuredClone(o)); } } }, action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} }, tabs: { query: async () => [{ id: 4, url: PAGE + '/d' }], sendMessage: async (_t, m) => (m.kind === 'ping' ? { alive: true } : undefined), onUpdated: { addListener() {} }, onRemoved: { addListener() {} } }, scripting: { executeScript: async () => {} } };
  const fetchStub = async (url, options) => { const body = JSON.parse(options.body); requests.push({ url, body }); if (url.endsWith('/connect')) return new Response(JSON.stringify({ endpoint: ENDPOINT, token: TOKEN }), { status: 200 }); if (body.question === 'bad') return new Response('{}', { status: 400 }); return new Response(JSON.stringify({ state: 'answered' }), { status: 200 }); };
  const context = vm.createContext({ chrome, fetch: fetchStub, URL, AbortSignal, Response, setTimeout, structuredClone, console }); context.globalThis = context;
  context.importScripts = (...files) => { for (const file of files) vm.runInContext(fs.readFileSync(path.join(DIR, file), 'utf8'), context); };
  vm.runInContext(fs.readFileSync(path.join(DIR, 'background.js'), 'utf8'), context);
  const send = (message, sender) => new Promise(resolve => listener(message, sender, value => resolve(JSON.parse(JSON.stringify(value)))));
  await send({ kind: 'connect-tab' }, { id: 'ext' });
  const page = { id: 'ext', tab: { id: 4 }, frameId: 0, origin: PAGE };
  const value = await send({ kind: 'ask', question: 'q'.repeat(900), fieldId: 'field_1', revision: 2, text: 'LEAK', field: { value: 'LEAK' }, token: 'LEAK' }, page);
  assert.equal(value.state, 'answered');
  const sent = requests.at(-1); assert.match(sent.url, /\/context$/);
  assert.deepEqual(Object.keys(sent.body).filter(k => sent.body[k] !== undefined).sort(), ['fieldId', 'kind', 'pageOrigin', 'question', 'revision', 'tabId', 'useAI']);
  assert.equal(sent.body.question.length, 500); assert(!JSON.stringify(sent.body).includes('LEAK'));
  assert.deepEqual(await send({ kind: 'ask', question: '   ' }, page), { error: 'Type a question first.' });
  assert.match((await send({ kind: 'ask', question: 'bad' }, page)).error, /could not be answered/);
  assert.deepEqual(await send({ kind: 'ask', question: 'q' }, { id: 'ext', tab: { id: 4 }, frameId: 0, origin: 'https://evil.example' }), { stopped: true, reason: 'lost_contact' });
});
