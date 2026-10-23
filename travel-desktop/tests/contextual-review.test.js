const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const { observation } = require('../src/external-observation');
const { BrowserBridge } = require('../src/browser-bridge');
const { ContextualReview } = require('../src/contextual-review');

function fixture(t, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-context-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, 'policy.md'); fs.writeFileSync(file, 'Do not claim "lowest prices guaranteed".');
  const data = workspace.create(root, 'Synthetic company', 'Owner');
  const source = workspace.importFile(root, data, file, { department: 'Marketing', version: '2' });
  workspace.updateSource(data, source.id, 'approved');
  let state = { signedIn: true, workspace: data, epoch: 1, aiEnabled: false, key: '' };
  const observe = (text = 'Our lowest prices guaranteed.', fieldId = 'field-0001', revision = 0) => {
    state.observed = { ...observation({ personId: data.activePersonId, windowId: 'browser:1', windowName: 'Draft', method: 'browser-dom', text }), fieldId, revision };
    state.observed.field = { label: 'Email body', kind: 'textarea', value: state.observed.text };
  };
  observe();
  const service = new ContextualReview({ getState: () => state, ...options });
  return { data, source, file: source.textPath, state, service, observe, request: { task: 'email', fieldId: 'field-0001', revision: 0 } };
}

test('bound browser review returns a minimal cited result and a validated individual proposal', async t => {
  const f = fixture(t); const stopped = [];
  const bridge = new BrowserBridge({ onObservation: value => { if (value) f.state.observed = value; else f.state.observed = null; }, onStop: () => stopped.push(true), onRequest: p => p.kind === 'review' ? f.service.review(p) : f.service.status() });
  t.after(() => bridge.stop());
  const pair = await bridge.start(f.data.activePersonId);
  const headers = { Origin: 'chrome-extension://' + 'a'.repeat(32), 'Content-Type': 'application/json', 'X-Averill-Token': pair.token };
  const send = (route, payload, extra = {}) => fetch(pair.endpoint.replace('/observation', route), { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify({ tabId: 1, pageOrigin: 'https://draft.example', ...payload }) });
  assert.equal((await send('/context', { kind: 'review', ...f.request })).status, 400);
  await send('/observation', { kind: 'field', sequence: 1, reason: 'selection', field: { id: 'field-0001', revision: 0, kind: 'textarea', label: 'Email body', value: 'Our lowest prices guaranteed.' } });
  const response = await send('/context', { kind: 'review', ...f.request }); assert.equal(response.status, 200);
  const result = await response.json(); assert.equal(result.state, 'findings');
  assert.equal(result.findings[0].source.quote, 'Do not claim "lowest prices guaranteed".');
  const proposal = f.service.proposal({ reviewId: result.id, findingId: result.findings[0].id });
  assert.deepEqual([proposal.proposal.start, proposal.proposal.end, proposal.proposal.before, proposal.proposal.after], [4, 28, 'lowest prices guaranteed', '']);
  const serialized = JSON.stringify(result);
  for (const secret of [pair.token, f.file, 'textPath', 'ownerId', 'people', 'publicClaims', 'steps']) assert(!serialized.includes(secret));
  assert.equal((await send('/context', { kind: 'review', ...f.request, tabId: 2 })).status, 400);
  assert.equal((await send('/context', { kind: 'review', ...f.request }, { Origin: 'https://draft.example' })).status, 403);
  await send('/observation', { kind: 'editing', sequence: 2 });
  assert.equal((await send('/context', { kind: 'review', ...f.request })).status, 400);
  assert.throws(() => f.service.proposal({ reviewId: result.id, findingId: result.findings[0].id }), /changed/);
});

test('guidance/role/session/field changes revoke status, deep links and proposals; rereading unchanged text does not', async t => {
  for (const change of ['version', 'revoked', 'file text', 'person', 'session', 'field', 'revision', 'logout']) {
    const f = fixture(t); const result = await f.service.review(f.request);
    f.state.observed = { ...f.state.observed, capturedAt: '2030-01-01' };
    assert.equal(f.service.status().reviewId, result.id);
    if (change === 'version') f.source.version = '3';
    if (change === 'revoked') f.source.status = 'superseded';
    if (change === 'file text') fs.appendFileSync(f.file, '\nChanged approved text.');
    if (change === 'person') f.data.activePersonId = 'another-person';
    if (change === 'session') f.state.epoch++;
    if (change === 'field') f.observe(undefined, 'field-0002');
    if (change === 'revision') f.observe(undefined, 'field-0001', 1);
    if (change === 'logout') f.state.signedIn = false;
    assert.throws(() => f.service.open({ reviewId: result.id, findingId: result.findings[0].id }), /changed/, change);
    assert.equal(f.service.status().reviewId, null, change);
  }
});

test('source absence, source visibility, ambiguous phrases and redaction never create an unsafe edit', async t => {
  const f = fixture(t); f.source.status = 'pending';
  assert.equal((await f.service.review(f.request)).state, 'insufficient-evidence');
  f.source.status = 'approved'; f.observe('lowest prices guaranteed; lowest prices guaranteed');
  assert.equal((await f.service.review(f.request)).findings[0].proposal, null);
  f.observe('api_key=synthetic-not-a-secret Our lowest prices guaranteed.');
  assert.equal((await f.service.review(f.request)).findings[0].proposal, null);
  f.data.people.push({ id: 'staff', role: 'employee', department: 'People' }); f.data.activePersonId = 'staff'; f.observe();
  assert.equal((await f.service.review(f.request)).state, 'insufficient-evidence');
});

test('AI uses the shared client only after consent; source changes in flight invalidate the entire reply', async t => {
  let calls = 0, release, started;
  const begun = new Promise(resolve => { started = resolve; });
  const f = fixture(t, { fetcher: async () => {
    calls++; started(); await new Promise(resolve => { release = resolve; });
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"findings":[],"public_claims":[]}' } }] }) };
  } });
  f.state.aiEnabled = true; f.state.key = 'synthetic-test-key'; f.data.privacy = { companyAI: true }; f.source.aiAllowed = true;
  await assert.rejects(f.service.review({ ...f.request, useAI: true }), /Confirm/); assert.equal(calls, 0);
  const pending = f.service.review({ ...f.request, useAI: true, consent: true }); await begun;
  f.source.status = 'superseded'; release(); await assert.rejects(pending, /changed/);
  assert.equal(f.service.status().reviewId, null); assert.equal(calls, 1);
});

test('local review remains offline even when the provider is configured', async t => {
  const f = fixture(t, { fetcher: () => { throw new Error('No request expected'); } });
  f.state.key = 'synthetic-key'; f.state.aiEnabled = true; f.data.privacy = { companyAI: true };
  assert.equal((await f.service.review(f.request)).mode, 'local');
});

test('a late model reply cannot replace a newer local review on the same field', async t => {
  let release, started; const begun = new Promise(r => { started = r; });
  const f = fixture(t, { fetcher: async () => { started(); await new Promise(r => { release = r; }); return { ok: true, json: async () => ({ choices: [{ message: { content: '{"findings":[]}' } }] }) }; } });
  f.state.aiEnabled = true; f.state.key = 'synthetic-key'; f.data.privacy = { companyAI: true }; f.source.aiAllowed = true;
  const old = f.service.review({ ...f.request, useAI: true, consent: true }); await begun;
  const current = await f.service.review(f.request); release(); await assert.rejects(old, /changed/);
  assert.equal(f.service.status().reviewId, current.id);
  assert.throws(() => f.service.proposal({ reviewId: 'old-result', findingId: current.findings[0].id }), /changed/);
  f.source.confidentiality = 'restricted';
  assert.equal((await f.service.review(f.request)).state, 'insufficient-evidence');
  const other = path.join(path.dirname(f.file), 'other.md'); fs.writeFileSync(other, 'General writing guidance.');
  f.data.sources.push({ ...f.source, id: 'other-source', title: 'Other source', textPath: other, confidentiality: 'public' });
  assert.equal((await f.service.review(f.request)).state, 'insufficient-evidence');
});
