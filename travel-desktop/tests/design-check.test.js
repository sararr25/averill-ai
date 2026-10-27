// FB-14 Canva design check: colour maths, large-text threshold, safe-zone bounds, payload validation, approved citations,
// the contextual service, the bridge and the extension worker relay. The DOM reader itself runs in Chromium in
// canva-design-reader.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const canva = require('../browser-extension/canva-design');
const designCheck = require('../src/design-check');
const rules = require('../src/rules');
const judgeDemo = require('../src/judge-demo');
const workspaceModule = require('../src/workspace');
const { ContextualReview } = require('../src/contextual-review');
const { BrowserBridge } = require('../src/browser-bridge');

const CREAM = [245, 240, 229], NEAR_BLACK = [16, 15, 13, 1], PISTACHIO = [147, 197, 114, 1];
const GUIDE = path.join(__dirname, '..', 'demo-company', 'vamo', 'Marketing', 'social-media-guidelines-v2.md');
const LINE = { normal: 'Design rule: instagram | contrast-normal | "4.5".', large: 'Design rule: instagram | contrast-large | "3".', margin: 'Design rule: instagram | safe-margin | "108".' };
const element = (extra = {}) => ({ text: 'finish this line: what makes the city good before 8?', box: { x: 120, y: 1276.17, width: 763.08, height: 37.96 }, fontSize: 23.14, fontWeight: 400, colors: [NEAR_BLACK], background: { dark: CREAM, light: CREAM }, ...extra });
const payload = (elements = [element()], design = { width: 1080, height: 1440, scale: 0.400694 }) => ({ design, elements });

let root, workspace;
test.before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-design-'));
  workspace = (await judgeDemo.create(root, path.join(__dirname, '..', 'demo-company'))).data;
  const [v1, v2] = judgeDemo.conflictingVersions.map(([, version]) => workspace.sources.find(source => source.title === 'social-media-guidelines.md' && source.version === version));
  workspace.activePersonId = workspace.people.find(person => person.role === 'lead' && person.department === 'Marketing').id;
  workspaceModule.updateSource(workspace, v2.id, 'approved', 40, 'Version 2 applies', v1.id);
});
test.after(() => fs.rmSync(root, { recursive: true, force: true }));

test('contrast maths matches WCAG on known pairs, including the FB-13 spike values', () => {
  assert.equal(canva.contrast([147, 197, 114], CREAM).toFixed(2), '1.76', 'pistachio on cream');
  assert.equal(canva.contrast([16, 15, 13], CREAM).toFixed(2), '16.86', 'near-black on cream');
  assert.equal(canva.contrast([0, 0, 0], [255, 255, 255]), 21);
  assert.equal(canva.contrast([255, 255, 255], [255, 255, 255]), 1);
  assert.equal(canva.contrast([118, 118, 118], [255, 255, 255]).toFixed(2), '4.54', '#767676 on white, the classic AA pass');
  // Worst case: dark and light clusters of a split background; the minimum is reported.
  const split = canva.clusters([...Array(50).fill([255, 255, 255]), ...Array(50).fill([20, 20, 20])]);
  assert.deepEqual(split, { dark: [20, 20, 20], light: [255, 255, 255] });
  assert(canva.worstContrast([NEAR_BLACK], split) < 1.1, 'black text over a partly black background is caught');
  // A half-transparent colour is blended over the background first.
  assert(canva.worstContrast([[16, 15, 13, 0.3]], { dark: CREAM, light: CREAM }) < 2);
  assert.deepEqual(canva.parseColor('rgba(16, 15, 13, 0.5)'), [16, 15, 13, 0.5]);
  assert.deepEqual(canva.parseColor('rgb(16 15 13 / 50%)'), [16, 15, 13, 0.5]);
  assert.equal(canva.parseColor('hsl(10 20% 30%)'), null);
});

test('large text: 24 px design-equivalent at 1080 width, or 18.66 px bold', () => {
  const design = { width: 1080, height: 1440 };
  assert.equal(designCheck.isLarge({ fontSize: 23.99, fontWeight: 400 }, design), false);
  assert.equal(designCheck.isLarge({ fontSize: 24, fontWeight: 400 }, design), true);
  assert.equal(designCheck.isLarge({ fontSize: 18.66, fontWeight: 700 }, design), true);
  assert.equal(designCheck.isLarge({ fontSize: 18.6, fontWeight: 700 }, design), false);
  assert.equal(designCheck.isLarge({ fontSize: 20, fontWeight: 600 }, design), false);
  // A 2160 wide design is scaled to 1080 first: 40 design px count as 20.
  assert.equal(designCheck.isLarge({ fontSize: 40, fontWeight: 400 }, { width: 2160, height: 2880 }), false);
});

test('safe zone: inside, exactly touching the line, and outside on each edge', () => {
  const design = { width: 1080, height: 1440 };
  assert.equal(designCheck.safeZone({ x: 120, y: 120, width: 700, height: 50 }, design, 108).inside, true);
  assert.equal(designCheck.safeZone({ x: 108, y: 108, width: 864, height: 1224 }, design, 108).inside, true, 'touching the safe line is inside');
  const left = designCheck.safeZone({ x: 40, y: 1276.17, width: 763.08, height: 37.96 }, design, 108);
  assert.deepEqual([left.inside, left.edge, Math.round(left.gap)], [false, 'left', 40]);
  assert.equal(designCheck.safeZone({ x: 108, y: 108, width: 865, height: 100 }, design, 108).edge, 'right');
  assert.equal(designCheck.safeZone({ x: 200, y: 1300, width: 100, height: 100 }, design, 108).edge, 'bottom');
  assert.equal(designCheck.safeZone({ x: 200, y: 107, width: 100, height: 100 }, design, 108).edge, 'top');
  assert.equal(designCheck.safeZone({ x: -12, y: 500, width: 100, height: 100 }, design, 108).gap, -12);
});

test('design rule lines parse; malformed ones are ignored; the Vamo guideline carries them with no em or en dash', () => {
  assert.deepEqual(rules.parseDesignLine(LINE.normal), { task: 'instagram', type: 'contrast-normal', value: '4.5', number: 4.5 });
  assert.deepEqual(rules.parseDesignLine(LINE.margin), { task: 'instagram', type: 'safe-margin', value: '108', number: 108 });
  for (const bad of ['Design rule: instagram | contrast-normal | "0.5"', 'Design rule: instagram | contrast-normal | "25"', 'Design rule: instagram | safe-margin | "10.5"', 'Design rule: instagram | safe-margin | "600"', 'Design rule: tiktok | safe-margin | "108"', 'Design rule: instagram | font | "Arial"', 'Design rule: instagram | contrast-large | "high"']) assert.equal(rules.parseDesignLine(bad), null, bad);
  const text = fs.readFileSync(GUIDE, 'utf8'), section = text.slice(text.indexOf('## Design'));
  assert(section.includes('4.5:1') && section.includes('108 px') && section.includes('margin guide Canva shows') && section.includes('not a value that Instagram publishes'));
  assert(!/[–—]/.test(section));
  assert.deepEqual(section.split('\n').filter(line => rules.parseDesignLine(line)), [LINE.normal, LINE.large, LINE.margin]);
});

test('payload validation: only texts and bounded numbers, no image data, at most 30 texts of 500 characters', () => {
  assert.deepEqual(canva.validate(payload()).elements[0].colors, [[16, 15, 13, 1]]);
  assert.equal(canva.validate(payload([])).elements.length, 0);
  const refused = value => assert.throws(() => canva.validate(value));
  refused(payload(Array(31).fill(element())));
  refused(payload([element({ text: 'x'.repeat(501) })]));
  refused(payload([element({ text: '   ' })]));
  refused(payload([element({ text: 'see data:image/png;base64,iVBORw0KGgo=' })]));
  refused(payload([element({ dataUrl: 'data:image/png;base64,AAAA' })]));
  refused(payload([element({ pixels: [1, 2, 3] })]));
  refused({ ...payload(), image: 'data:image/png;base64,AAAA' });
  refused(payload([element({ background: { dark: CREAM, light: CREAM, pixels: [] } })]));
  refused(payload([element({ box: { x: 1, y: 1, width: 1, height: 1, src: 'https://x' } })]));
  refused(payload([element({ colors: [[16, 15, 13]] })]));
  refused(payload([element({ colors: [[300, 15, 13, 1]] })]));
  refused(payload([element({ colors: Array(5).fill(NEAR_BLACK) })]));
  refused(payload([element({ fontSize: Infinity })]));
  refused(payload([element({ fontSize: '23' })]));
  refused(payload([element({ fontWeight: 400.5 })]));
  refused(payload([element({ box: { x: 1e9, y: 0, width: 1, height: 1 } })]));
  refused(payload([element()], { width: 1080, height: 1440 }));
  refused(payload(Array(13).fill(element({ text: 'y'.repeat(480) }))));
});

test('evaluate: dark text passes; pistachio, the moved box and the forbidden claim each cite the exact approved line', () => {
  const clean = designCheck.evaluate({ workspace, payload: payload([element(), element({ text: 'copenhagen before 8', box: { x: 120, y: 891.79, width: 820, height: 354.72 }, fontSize: 119.3 })]) });
  assert.equal(clean.state, 'clean', JSON.stringify(clean.findings));
  assert.deepEqual(clean.checked, ['contrast', 'safe area', 'approved wording']);

  const pale = designCheck.evaluate({ workspace, payload: payload([element({ colors: [PISTACHIO] })]) });
  assert.equal(pale.state, 'findings');
  assert.deepEqual(pale.findings.map(f => [f.type, f.measured, f.source.quote, f.source.title, f.source.version]), [['contrast', 'contrast 1.76:1, needs 4.5:1', LINE.normal, 'social-media-guidelines.md', '2']]);
  // Large text is held to the approved 3:1 line: pistachio at 119 px still fails, a 3.2:1 colour passes.
  const big = designCheck.evaluate({ workspace, payload: payload([element({ fontSize: 119.3, colors: [PISTACHIO] })]) });
  assert.deepEqual(big.findings.map(f => [f.measured, f.source.quote]), [['contrast 1.76:1, needs 3:1 for large text', LINE.large]]);
  const mid = [126, 122, 112, 1];
  assert(canva.contrast(mid, CREAM) > 3 && canva.contrast(mid, CREAM) < 4.5);
  assert.equal(designCheck.evaluate({ workspace, payload: payload([element({ fontSize: 119.3, colors: [mid] })]) }).state, 'clean');
  assert.equal(designCheck.evaluate({ workspace, payload: payload([element({ colors: [mid] })]) }).findings[0].type, 'contrast');

  const moved = designCheck.evaluate({ workspace, payload: payload([element({ box: { x: 40, y: 1276.17, width: 763.08, height: 37.96 } })]) });
  assert.deepEqual(moved.findings.map(f => [f.type, f.measured, f.source.quote]), [['safe-zone', '40 px from the left edge, needs at least 108 px from every edge', LINE.margin]]);

  const claim = designCheck.evaluate({ workspace, payload: payload([element({ text: 'lowest prices guaranteed on every city break' })]) });
  assert.deepEqual(claim.findings.map(f => f.type), ['forbidden-claim']);
  const cited = claim.findings[0].source;
  const sourceText = fs.readFileSync(workspace.sources.find(source => source.id === cited.id).textPath, 'utf8');
  assert(sourceText.split('\n').map(line => line.trim()).includes(cited.quote), 'the citation is an exact line of the approved source');
  assert.match(cited.quote, /lowest prices guaranteed/);
  // Hashtag rules do not apply to a design.
  assert.equal(designCheck.evaluate({ workspace, payload: payload([element({ text: 'copenhagen #cheapestflights' })]) }).state, 'clean');
  // Findings carry no colours, boxes or pixels back.
  assert.deepEqual(Object.keys(pale.findings[0]).sort(), ['element', 'id', 'measured', 'problem', 'source', 'text', 'type']);
});

test('the captured starting post is outside Vamo\'s 108 px margin on all three texts', () => {
  const captured = designCheck.evaluate({ workspace, payload: payload([
    element({ text: 'vamo', box: { x: 32.05, y: 16.88, width: 117.37, height: 53.43 }, fontSize: 32.17, colors: [[16, 15, 13, 0.9]], background: { dark: [156, 196, 226], light: [158, 196, 226] } }),
    element({ text: 'copenhagen before 8', box: { x: 64.02, y: 891.79, width: 875.84, height: 354.72 }, fontSize: 119.3 }),
    element({ box: { x: 71.47, y: 1276.17, width: 763.08, height: 37.96 } }),
  ]) });
  assert.deepEqual(captured.findings.map(f => [f.type, f.element, f.measured]), [
    ['safe-zone', 1, '17 px from the top edge, needs at least 108 px from every edge'],
    ['safe-zone', 2, '64 px from the left edge, needs at least 108 px from every edge'],
    ['safe-zone', 3, '71 px from the left edge, needs at least 108 px from every edge'],
  ]);
});

test('without approved design lines nothing is called clean', () => {
  const bare = { ...workspace, sources: workspace.sources.filter(source => source.title !== 'social-media-guidelines.md') };
  const result = designCheck.evaluate({ workspace: bare, payload: payload([element({ colors: [PISTACHIO] })]) });
  assert.equal(result.state, 'insufficient-evidence');
  assert(result.notes.some(note => /contrast was not checked/.test(note)) && result.notes.some(note => /safe area was not checked/.test(note)));
});

function service() {
  const state = { signedIn: true, workspace, epoch: 1, aiEnabled: false, key: '', observed: null };
  return { state, review: new ContextualReview({ getState: () => state }) };
}
const CANVA = 'https://www.canva.com';

test('contextual designCheck: canva.com only, signed in only, and Export anyway records an override for the last check', () => {
  const { state, review } = service();
  assert.throws(() => review.designCheck({ ...payload(), pageOrigin: 'https://evil.example' }), /canva\.com only/);
  assert.throws(() => review.designCheck({ ...payload(), pageOrigin: 'https://canva.com.evil.example' }), /canva\.com only/);
  const blocked = review.designCheck({ ...payload([element({ colors: [PISTACHIO] })]), pageOrigin: CANVA, tabId: 3, kind: 'design-check' });
  assert.equal(blocked.state, 'findings');
  assert.throws(() => review.designCheck({ action: 'override', checkId: '00000000-0000-4000-8000-000000000000', pageOrigin: CANVA }), /changed|again/i);
  const recorded = review.designCheck({ action: 'override', checkId: blocked.id, pageOrigin: CANVA });
  assert.equal(recorded.state, 'override-recorded');
  const status = review.designStatus(workspace.activePersonId);
  assert.equal(status.overrides.length, 1); assert.deepEqual(status.overrides[0].types, ['contrast']); assert.equal(status.last.findingCount, 1);
  // A clean check cannot be overridden; another person sees nothing; clearing the session forgets it.
  const clean = review.designCheck({ ...payload(), pageOrigin: CANVA });
  assert.throws(() => review.designCheck({ action: 'override', checkId: clean.id, pageOrigin: CANVA }), /changed|again/i);
  assert.deepEqual(review.designStatus('someone-else'), { last: null, overrides: [] });
  review.clearDesign(); assert.deepEqual(review.designStatus(workspace.activePersonId), { last: null, overrides: [] });
  state.signedIn = false;
  assert.throws(() => review.designCheck({ ...payload(), pageOrigin: CANVA }), /changed|again/i);
});

test('bridge: a design check is refused without a connection, for another tab or origin, and after Stop', async t => {
  const { review } = service();
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: () => {}, onRequest: body => body.kind === 'design-check' ? review.designCheck(body) : { reviewId: null } });
  t.after(() => bridge.shutdown());
  const origin = 'chrome-extension://' + 'a'.repeat(32);
  const pair = await bridge.start(workspace.activePersonId);
  const post = (url, body) => fetch(pair.endpoint.replace('/observation', url), { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ tabId: 7, pageOrigin: CANVA, ...body }) });
  const check = { kind: 'design-check', ...payload() };
  assert.equal((await post('/context', check)).status, 400, 'not connected yet: no bound tab');
  assert.equal((await post('/observation', { kind: 'heartbeat', sequence: 1 })).status, 200);
  const ok = await post('/context', check);
  assert.equal(ok.status, 200); assert.equal((await ok.json()).state, 'clean');
  assert.equal((await post('/context', { ...check, tabId: 8 })).status, 400, 'another tab');
  assert.equal((await post('/context', { ...check, pageOrigin: 'https://www.canva.co' })).status, 400, 'another origin');
  assert.equal((await post('/context', { ...check, elements: [element({ dataUrl: 'data:image/png;base64,AAAA' })] })).status, 400, 'image data is refused by Averill too');
  bridge.stop('stopped_by_user');
  assert.equal((await post('/context', check)).status, 410, 'after Stop');
});

function worker(pageUrl) {
  const storage = {}, listeners = {}, requests = [], injections = [];
  const chrome = {
    runtime: { id: 'ext', onMessage: { addListener: f => { listeners.message = f; } } },
    storage: { session: { get: async keys => Object.fromEntries([].concat(keys).map(k => [k, storage[k] === undefined ? undefined : structuredClone(storage[k])])), set: async object => { Object.assign(storage, structuredClone(object)); } } },
    action: { setBadgeText: async () => {}, setBadgeBackgroundColor: async () => {} },
    tabs: { query: async () => [{ id: 4, url: pageUrl }], sendMessage: async () => ({ alive: true }), onUpdated: { addListener() {} }, onRemoved: { addListener() {} } },
    scripting: { executeScript: async ({ files }) => { injections.push([...files]); } },
  };
  const fetch = async (url, options) => {
    const body = JSON.parse(options.body); requests.push({ url, body });
    if (url.endsWith('/connect')) return new Response(JSON.stringify({ endpoint: 'http://127.0.0.1:5555/observation', token: 'b'.repeat(64) }), { status: 200 });
    return new Response(JSON.stringify({ state: 'clean', findings: [] }), { status: 200 });
  };
  const context = vm.createContext({ chrome, fetch, URL, AbortSignal, Response, setTimeout, structuredClone, console }); context.globalThis = context;
  context.importScripts = (...files) => { for (const file of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '../browser-extension', file), 'utf8'), context); };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../browser-extension/background.js'), 'utf8'), context);
  const origin = new URL(pageUrl).origin;
  const send = (message, sender) => new Promise(resolve => listeners.message(message, sender, value => resolve(JSON.parse(JSON.stringify(value)))));
  return { requests, injections, connect: () => send({ kind: 'connect-tab' }, { id: 'ext' }), fromPage: (message, sender = { id: 'ext', tab: { id: 4 }, frameId: 0, origin }) => send(message, sender) };
}

test('worker: the reader is injected before content.js on canva.com only; the relay sends only validated texts and numbers', async () => {
  const other = worker('https://draft.example/x'); await other.connect();
  assert.deepEqual(other.injections[0], ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'content.js']);
  assert.match((await other.fromPage({ kind: 'design-check', ...payload() })).error, /canva\.com only/);
  const w = worker('https://www.canva.com/design/DAHZAkgeHzA/edit'); await w.connect();
  assert.deepEqual(w.injections[0], ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'canva-design.js', 'content.js']);
  assert.equal((await w.fromPage({ kind: 'design-check', ...payload(), screenshot: 'data:image/png;base64,AAAA', token: 'x' })).state, 'clean');
  const sent = w.requests.at(-1);
  assert(sent.url.endsWith('/context'));
  assert.deepEqual(Object.keys(sent.body).sort(), ['design', 'elements', 'kind', 'pageOrigin', 'tabId']);
  assert(!JSON.stringify(sent.body).includes('base64'));
  const before = w.requests.length;
  for (const bad of [payload(Array(31).fill(element())), payload([element({ text: 'x'.repeat(501) })]), payload([element({ dataUrl: 'data:image/png;base64,AAAA' })]), { design: payload().design }]) {
    assert.match((await w.fromPage({ kind: 'design-check', ...bad })).error, /cannot read this design/);
  }
  assert.match((await w.fromPage({ kind: 'design-check', action: 'override', checkId: 'not-an-id' })).error, /again/);
  assert.equal(w.requests.length, before, 'invalid requests never reach Averill');
  await w.fromPage({ kind: 'design-check', action: 'override', checkId: '00000000-0000-4000-8000-000000000000', extra: 'x' });
  assert.deepEqual(Object.keys(w.requests.at(-1).body).sort(), ['action', 'checkId', 'kind', 'pageOrigin', 'tabId']);
  // Another frame, origin or tab is not relayed.
  const n = w.requests.length;
  for (const sender of [{ id: 'ext', tab: { id: 4 }, frameId: 1, origin: CANVA }, { id: 'ext', tab: { id: 4 }, frameId: 0, origin: 'https://evil.example' }, { id: 'ext', tab: { id: 9 }, frameId: 0, origin: CANVA }]) {
    assert.equal((await w.fromPage({ kind: 'design-check', ...payload() }, sender)).stopped, true);
  }
  assert.equal(w.requests.length, n);
});
