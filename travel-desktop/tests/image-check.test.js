// FB-08 photo check. The OCR helper is mocked here; verify:contextual runs the real macOS binary once on the planted image.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const judgeDemo = require('../src/judge-demo');
const workspaceModule = require('../src/workspace');
const rules = require('../src/rules');
const imageCheck = require('../src/image-check');
const { ContextualReview } = require('../src/contextual-review');
const { BrowserBridge } = require('../src/browser-bridge');
const { observation } = require('../src/external-observation');

const PNG_HEAD = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = (marker = 'a') => Buffer.concat([PNG_HEAD, Buffer.from(marker.repeat(40))]);
const dataUrl = bytes => 'data:image/png;base64,' + bytes.toString('base64');
// Alt text present, sizes that fit the approved image rules, and a PNG the validator accepts.
const good = (extra = {}) => ({ width: 1080, height: 1350, alt: 'Harbour at dawn', dataUrl: dataUrl(png()), ...extra });

let root, workspace;
test.before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-images-'));
  workspace = (await judgeDemo.create(root, path.join(__dirname, '..', 'demo-company'))).data;
  const [v1, v2] = judgeDemo.conflictingVersions.map(([, version]) => workspace.sources.find(source => source.title === 'social-media-guidelines.md' && source.version === version));
  workspace.activePersonId = workspace.people.find(person => person.role === 'lead' && person.department === 'Marketing').id;
  workspaceModule.updateSource(workspace, v2.id, 'approved', 40, 'Version 2 applies', v1.id);
});
test.after(() => fs.rmSync(root, { recursive: true, force: true }));

const prepare = validated => validated.map(image => image);
async function check(task, images, ocr = async () => '') {
  const calls = [];
  const result = await imageCheck.run({ workspace, task, images: imageCheck.validate(prepare(images)), ocr: async file => { calls.push(file); return ocr(file); } });
  return { result, calls };
}
const types = result => result.findings.map(f => f.type).sort();

test('image rule lines and aspect ranges parse; malformed lines are ignored', () => {
  assert.deepEqual(rules.parseImageLine('Image rule: instagram | min-width | "1080".'), { task: 'instagram', type: 'min-width', value: '1080', pixels: 1080 });
  assert.equal(rules.parseImageLine('Image rule: instagram | aspect | "4:5 to 1.91:1, 9:16".').ranges.length, 2);
  for (const bad of ['Image rule: instagram | aspect | "wide"', 'Image rule: instagram | min-width | "big"', 'Image rule: instagram | required | "photo"', 'Image rule: tiktok | required | "image"', 'Image rule: any | alt-text | "optional"']) assert.equal(rules.parseImageLine(bad), null, bad);
  const instagram = rules.parseAspect('4:5 to 1.91:1, 9:16');
  for (const [w, h] of [[1080, 1350], [1080, 1080], [1200, 627], [1080, 1920]]) assert(rules.aspectFits(w / h, instagram), `${w}x${h}`);
  for (const [w, h] of [[1000, 2000], [2000, 600], [1080, 1500]]) assert(!rules.aspectFits(w / h, instagram), `${w}x${h}`);
});

test('the approved Vamo guideline carries the image specs and no em or en dash was added', () => {
  const text = fs.readFileSync(path.join(__dirname, '..', 'demo-company', 'vamo', 'Marketing', 'social-media-guidelines-v2.md'), 'utf8');
  const images = text.slice(text.indexOf('## Images'));
  assert(images.includes('9:16') && images.includes('1080 pixels') && images.includes('alt text'));
  assert(!/[–—]/.test(images));
  assert.equal(images.split('\n').filter(line => rules.parseImageLine(line)).length, 6);
});

test('a conforming Instagram and LinkedIn image produces no finding', async () => {
  const instagram = await check('instagram', [good()]);
  assert.deepEqual(instagram.result.findings, [], JSON.stringify(instagram.result.findings));
  assert.equal(instagram.result.state, 'no-conflict');
  const reel = await check('instagram', [good({ width: 1080, height: 1920 })]);
  assert.deepEqual(reel.result.findings, []);
  const linkedin = await check('linkedin', [good({ width: 1200, height: 627 })]);
  assert.deepEqual(linkedin.result.findings, [], JSON.stringify(linkedin.result.findings));
});

test('missing image, missing alt text, wrong ratio and small width are findings that cite the exact approved line', async () => {
  const none = (await check('instagram', [])).result;
  assert.deepEqual(types(none), ['image-missing']);
  assert.equal(none.findings[0].source.quote, 'Image rule: instagram | required | "image".');
  assert.equal(none.findings[0].source.title, 'social-media-guidelines.md');
  assert.equal((await check('linkedin', [])).result.findings[0].source.quote, 'Image rule: linkedin | required | "image".');

  const alt = (await check('instagram', [good({ alt: '  ' })])).result;
  assert.deepEqual(types(alt), ['image-alt-missing']);
  assert.equal(alt.findings[0].source.quote, 'Image rule: any | alt-text | "required".');

  const tall = (await check('instagram', [good({ width: 1000, height: 2000 })])).result;
  assert.deepEqual(types(tall), ['image-aspect', 'image-too-small']);
  assert.equal(tall.findings.find(f => f.type === 'image-aspect').source.quote, 'Image rule: instagram | aspect | "4:5 to 1.91:1, 9:16".');
  assert.equal(tall.findings.find(f => f.type === 'image-too-small').source.quote, 'Image rule: instagram | min-width | "1080".');
  assert.match(tall.findings[0].suggestion, /Image 1/);

  const portraitLinkedin = (await check('linkedin', [good({ width: 1080, height: 1920 })])).result;
  assert.deepEqual(types(portraitLinkedin), ['image-aspect'], 'LinkedIn has no 9:16 and no minimum width rule');
  assert.equal(portraitLinkedin.findings[0].source.quote, 'Image rule: linkedin | aspect | "1.91:1, 1:1, 4:5".');
  assert.equal((await check('linkedin', [good({ width: 400, height: 400 })])).result.findings.length, 0, 'small LinkedIn images fit the approved rules');
  for (const finding of [...none.findings, ...tall.findings]) assert(finding.id && finding.source.id && finding.source.version);
});

test('text read from an image is checked with the caption rules: a forbidden claim cites its source, hashtags and caption-only rules do not apply', async () => {
  const flawed = await check('instagram', [good({ width: 1080, height: 1920 })], async () => 'VAMO\nWinter,\nLowest prices guaranteed\nCurated city breaks');
  assert.deepEqual(types(flawed.result), ['forbidden-claim']);
  const finding = flawed.result.findings[0];
  assert.equal(finding.source.title, 'current-brief.md');
  assert(finding.source.quote.includes('Do not claim "lowest prices guaranteed"'));
  assert.equal(finding.observedExcerpt, 'Lowest prices guaranteed');
  assert.equal(finding.imageIndex, 1);
  const fixed = await check('instagram', [good({ width: 1080, height: 1920 })], async () => 'VAMO\nWinter,\ndifferently.\nCurated city breaks\n#cheapestflights #lowestprice');
  assert.deepEqual(fixed.result.findings, [], 'hashtags and the paid partnership requirement are caption rules, not image rules');
  assert.deepEqual((await check('instagram', [good()], async () => '')).result.images[0].reading, 'no text found');
});

test('OCR text is never returned: only the matched phrase appears in a finding', async () => {
  const secret = 'INTERNAL-OCR-LINE-NOT-TO-LEAVE';
  const { result } = await check('instagram', [good()], async () => `${secret}\nLowest prices guaranteed`);
  const text = JSON.stringify(result);
  assert(!text.includes(secret)); assert(!text.includes('base64')); assert(!text.includes('dataUrl'));
});

test('each image goes to a private temp file that is deleted right after OCR, also when OCR fails', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-images-temp-'));
  const seen = [];
  try {
    const bytes = png('z');
    const ok = await imageCheck.run({ workspace, task: 'instagram', images: imageCheck.validate([good({ dataUrl: dataUrl(bytes) }), good({ dataUrl: dataUrl(bytes) })]), tempDir, ocr: async file => {
      seen.push(file);
      assert(fs.readFileSync(file).equals(bytes), 'the file holds the image bytes during OCR');
      assert.equal(fs.statSync(file).mode & 0o077, 0, 'owner only');
      assert.equal(fs.readdirSync(tempDir).length, 1, 'only the current image exists');
      return '';
    } });
    assert.equal(ok.images.length, 2); assert.equal(seen.length, 2); assert.notEqual(seen[0], seen[1]);
    for (const file of seen) assert(!fs.existsSync(file) && !fs.existsSync(path.dirname(file)));
    assert.deepEqual(fs.readdirSync(tempDir), []);
    // A failing OCR is reported on the image and the file is still gone.
    let failedFile;
    const failed = await imageCheck.run({ workspace, task: 'instagram', images: imageCheck.validate([good()]), tempDir, ocr: async file => { failedFile = file; throw new Error('The text reader failed.'); } });
    assert(failedFile && !fs.existsSync(failedFile)); assert.deepEqual(fs.readdirSync(tempDir), []);
    assert.equal(failed.images[0].reading, 'text could not be read');
    assert(failed.notes.some(note => /could not be read on this device \(The text reader failed\.\)/.test(note)), failed.notes.join('|'));
    assert.deepEqual(failed.findings, [], 'a failed read is a note, never a clean claim about the text');
    // readText itself cleans up when OCR throws synchronously.
    await assert.rejects(imageCheck.readText(png(), { tempDir, ocr: () => { throw new Error('boom'); } }), /boom/);
    assert.deepEqual(fs.readdirSync(tempDir), []);
  } finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
});

test('an image the page would not let us read sends no pixels: size and alt text are still checked and the message says so', async () => {
  const { result, calls } = await check('instagram', [{ width: 1000, height: 2000, alt: '' }, good()], async () => 'Lowest prices guaranteed');
  assert.equal(calls.length, 1, 'OCR runs only for the readable image');
  assert.deepEqual(types(result), ['forbidden-claim', 'image-alt-missing', 'image-aspect', 'image-too-small']);
  assert(result.notes.includes('Image 1 could not be read on this page, so the text inside it was not checked.'), result.notes.join('|'));
  assert.equal(result.images[0].reading, 'text not read');
});

test('input is validated: count, PNG data, signature, size, alt text', () => {
  const limit = (images) => assert.throws(() => imageCheck.validate(images));
  limit(Array(5).fill(good()));
  limit('nope');
  limit([good({ dataUrl: 'data:image/jpeg;base64,AAAA' })]);
  limit([good({ dataUrl: dataUrl(Buffer.from('not a png at all')) })]);
  limit([good({ dataUrl: dataUrl(Buffer.concat([PNG_HEAD, Buffer.alloc(imageCheck.MAX_IMAGE_BYTES)])) })]);
  limit([good({ width: 0 })]); limit([good({ height: 1.5 })]); limit([good({ alt: 'a'.repeat(301) })]);
  assert.equal(imageCheck.validate([]).length, 0);
});

test('work types other than Instagram and LinkedIn are refused', async () => {
  await assert.rejects(imageCheck.run({ workspace, task: 'email', images: [] }), /Instagram and LinkedIn/);
});

// The contextual service and the bridge.
function service(overrides = {}) {
  const lead = workspace.activePersonId;
  const state = { signedIn: true, workspace, epoch: 1, aiEnabled: false, key: '', observed: { ...observation({ personId: lead, windowId: 'browser:1', windowName: 'Draft', method: 'browser-dom', text: 'Our caption' }), fieldId: 'field-0001', revision: 0 } };
  state.observed.field = { label: 'Caption', kind: 'textarea', value: 'Our caption' };
  const ocrCalls = [];
  const review = new ContextualReview({ getState: () => state, ocr: async file => { ocrCalls.push(file); return 'Lowest prices guaranteed'; }, ...overrides });
  return { state, review, ocrCalls };
}

test('imageCheck is bound to the selected field and revision and returns no image data', async () => {
  const { state, review, ocrCalls } = service();
  const body = { task: 'instagram', fieldId: 'field-0001', revision: 0, images: [good({ width: 1080, height: 1920 })] };
  const result = await review.imageCheck(body);
  assert.equal(result.state, 'findings'); assert.equal(result.fieldId, 'field-0001'); assert.equal(result.revision, 0);
  assert.equal(ocrCalls.length, 1);
  const text = JSON.stringify(result);
  assert(!text.includes(body.images[0].dataUrl) && !text.includes('base64') && !text.includes('dataUrl') && !text.includes('textPath'));
  assert.deepEqual(Object.keys(result).sort(), ['fieldId', 'findings', 'id', 'images', 'notes', 'revision', 'scope', 'state']);
  await assert.rejects(review.imageCheck({ ...body, revision: 1 }), /changed|again/i);
  await assert.rejects(review.imageCheck({ ...body, fieldId: 'other-field' }), /changed|again/i);
  assert.equal(ocrCalls.length, 1, 'a stale request never reads any image');
  state.signedIn = false;
  await assert.rejects(review.imageCheck(body), /changed|again/i);
});

test('the field changing while images are read makes the result stale', async () => {
  let release;
  const { state, review } = service({ ocr: () => new Promise(resolve => { release = resolve; }) });
  const pending = review.imageCheck({ task: 'instagram', fieldId: 'field-0001', revision: 0, images: [good()] });
  await new Promise(resolve => setTimeout(resolve, 20));
  state.observed = { ...state.observed, revision: 1 };
  release('x');
  await assert.rejects(pending, /changed|again/i);
});

async function bridged(t) {
  const { review } = service();
  const bridge = new BrowserBridge({ onObservation: () => {}, onStop: () => {}, onRequest: payload => payload.kind === 'image-check' ? review.imageCheck(payload) : { reviewId: null } });
  t.after(() => bridge.shutdown());
  const origin = 'chrome-extension://' + 'a'.repeat(32);
  const pair = await bridge.start(workspace.activePersonId, { origin, tabId: 1, pageOrigin: 'https://draft.example' });
  const post = (payload, headers = {}) => fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Averill-Token': pair.token, 'X-Averill-Kind': 'image-check', ...headers }, body: JSON.stringify({ tabId: 1, pageOrigin: 'https://draft.example', ...payload }) });
  return { post };
}

test('the bridge accepts up to 6 MB only for image-check and rejects above it; other requests keep the 24 KB cap', async t => {
  const { post } = await bridged(t);
  const request = { kind: 'image-check', task: 'instagram', fieldId: 'field-0001', revision: 0 };
  // About 5 MB of PNG data in four images is accepted and answered without echoing it.
  const big = dataUrl(Buffer.concat([PNG_HEAD, Buffer.alloc(1.2 * 1024 * 1024, 7)]));
  assert(big.length * 3 < 6 * 1024 * 1024 && big.length * 4 > 5 * 1024 * 1024 - 1);
  const accepted = await post({ ...request, images: Array(3).fill(good({ dataUrl: big })) });
  assert.equal(accepted.status, 200);
  const answer = await accepted.text();
  assert(!answer.includes(big.slice(100, 200)) && answer.length < 5000);
  // Above 6 MB: refused with 413 and a body that says nothing.
  const over = await post({ ...request, images: Array(4).fill(good({ dataUrl: big })) });
  assert.equal(over.status, 413);
  // Without the header, or for another kind, the old limit applies.
  const wrongHeader = await post({ ...request, images: Array(3).fill(good({ dataUrl: big })) }, { 'X-Averill-Kind': '' });
  assert.equal(wrongHeader.status, 400); assert.equal(wrongHeader.headers.get('connection'), 'close', 'an oversized ordinary request cannot poison the next keep-alive request');
  assert.equal((await post({ kind: 'ask', question: 'x'.repeat(24500) })).status, 400, 'a header cannot widen another kind');
  assert.equal((await post({ kind: 'ask', question: 'x' }, { 'X-Averill-Kind': '' })).status, 200);
  // Wrong shape inside the limit is a plain refusal.
  assert.equal((await post({ ...request, images: [good({ dataUrl: 'data:text/html;base64,AAAA' })] })).status, 400);
});
