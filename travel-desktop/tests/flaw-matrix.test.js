// Flaw matrix (docs/JUDGE_DEMO_FLAW_MATRIX_2026-10-24.md): every flaw planted in the simulator drafts must be
// caught by the local approved-rules check with the right citation, and the corrected draft must be clean.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const judgeDemo = require('../src/judge-demo');
const workspaceModule = require('../src/workspace');
const contextualReview = require('../src/contextual-review');

const drafts = require('../../demo-tools/social-simulator/src/data/flawed-drafts.json');
const brevo = id => drafts.brevo.find(item => item.id === id);
const social = id => drafts.social.find(item => item.id === id);
const REEL_NO_BANNED = social('vamo-ig-winter-reel-draft').text.replace(' #lowestprice', '');
const FOOTER = 'You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.';

// Field labels match the simulator's accessible names, which the browser extension reports.
const cases = [
  { name: 'Brevo launch · subject', task: 'email', label: 'Subject line', text: brevo('vamo-brevo-winter-v2').subject,
    expect: [['forbidden-claim', 'current-brief.md', 'Do not claim "lowest prices guaranteed"']],
    fixed: 'Winter Escapes 2027: discover curated winter city breaks' },
  { name: 'Brevo launch · audience', task: 'email', label: 'Audience', kind: 'select', text: brevo('vamo-brevo-winter-v2').recipients,
    expect: [['field-requirement', 'current-brief.md', 'email | audience | "Travel subscribers, Denmark"']],
    fixed: 'Travel subscribers, Denmark' },
  { name: 'Brevo launch · body', task: 'email', label: 'Email content', text: brevo('vamo-brevo-winter-v2').body,
    expect: [['forbidden-claim', 'current-brief.md', 'Do not claim "lowest prices guaranteed"'], ['missing-required-text', 'brand-and-legal.md', 'Every marketing email must include this footer']],
    fixed: `Discover curated winter city breaks. Explore Copenhagen, Vienna and Prague this winter.\n\n${FOOTER}` },
  { name: 'Brevo reminder · body', task: 'email', label: 'Email content', text: brevo('vamo-brevo-winter-reminder').body,
    expect: [['missing-required-text', 'brand-and-legal.md', 'Every marketing email must include this footer']],
    fixed: `${brevo('vamo-brevo-winter-reminder').body}\n\n${FOOTER}` },
  { name: 'Brevo Vienna teaser · body', task: 'email', label: 'Email content', text: brevo('vamo-brevo-vienna-teaser').body,
    expect: [['forbidden-claim', 'current-brief.md', 'Do not claim "lowest prices guaranteed"']],
    fixed: brevo('vamo-brevo-vienna-teaser').body.replace('Lowest prices guaranteed on every Vienna break this winter.', 'Discover curated winter city breaks.') },
  { name: 'LinkedIn winter draft', task: 'linkedin', label: 'Post text', text: social('vamo-li-winter-draft').text,
    expect: [['forbidden-claim', 'current-brief.md', 'Do not claim "lowest prices guaranteed"'], ['missing-required-text', 'linkedin-campaign.md', 'Include “Explore the winter collection”'], ['hashtag-too-many', 'social-media-guidelines.md', 'Hashtag rule: linkedin | max | "3"']],
    fixed: social('vamo-li-winter-draft').text.replace('Lowest prices guaranteed. Book before the end of October.', 'Discover curated winter city breaks. Explore the winter collection.').replace('#vamotravel #travel #citybreaks #winter #europe', '#vamotravel #travel #citybreaks') },
  { name: 'Instagram paid Reel', task: 'instagram', label: 'Caption', text: social('vamo-ig-winter-reel-draft').text,
    expect: [['missing-required-text', 'brand-and-legal.md', 'For paid creator content, include "Paid partnership with Vamo"'], ['hashtag-banned', 'social-media-guidelines.md', 'Hashtag rule: any | banned | "#lowestprice"']],
    fixed: `Paid partnership with Vamo #ad\n\n${REEL_NO_BANNED}` },
  // Disclosure present and banned tag removed, but the paid Reel still lacks #ad.
  { name: 'Instagram paid Reel without #ad', task: 'instagram', label: 'Caption', text: `Paid partnership with Vamo\n\n${REEL_NO_BANNED}`,
    expect: [['hashtag-missing', 'social-media-guidelines.md', 'Hashtag rule: instagram | paid-required | "#ad"']],
    fixed: `Paid partnership with Vamo #ad\n\n${REEL_NO_BANNED}` },
  // Brand tag missing: tags are matched case-insensitively, so #VamoTravel would pass.
  { name: 'Instagram caption without the brand tag', task: 'instagram', label: 'Caption', text: `Paid partnership with Vamo #ad\n\n${REEL_NO_BANNED.replace('#vamotravel ', '')}`,
    expect: [['hashtag-missing', 'social-media-guidelines.md', 'Hashtag rule: instagram | required | "#vamotravel"']],
    fixed: `Paid partnership with Vamo #AD\n\n${REEL_NO_BANNED.replace('#vamotravel', '#VamoTravel')}` },
];

let root, workspace;
test.before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-flaws-'));
  workspace = (await judgeDemo.create(root, path.join(__dirname, '..', 'demo-company'))).data;
  // The pack ships guidelines v1 and v2 as a conflict. Maya resolves it by superseding v1, which makes v2 (with the hashtag rules) current.
  const [v1, v2] = judgeDemo.conflictingVersions.map(([, version]) => workspace.sources.find(source => source.title === 'social-media-guidelines.md' && source.version === version));
  workspace.activePersonId = workspace.people.find(person => person.role === 'lead' && person.department === 'Marketing').id;
  workspaceModule.updateSource(workspace, v2.id, 'approved', 40, 'Version 2 applies', v1.id);
});
test.after(() => fs.rmSync(root, { recursive: true, force: true }));

const review = (task, text, label, kind = 'textarea') => contextualReview.reviewObserved(
  { workspace, aiEnabled: false, observed: { text, field: { kind, label, value: text } } }, task, false, () => {});

for (const item of cases) {
  test(`flaw matrix: ${item.name}`, async () => {
    const { findings } = await review(item.task, item.text, item.label, item.kind);
    assert.deepEqual(findings.map(f => f.type).sort(), item.expect.map(([type]) => type).sort(), JSON.stringify(findings));
    for (const [type, title, passage] of item.expect) {
      const finding = findings.find(f => f.type === type && f.source.title === title);
      assert.ok(finding, `${type} citing ${title}: ${JSON.stringify(findings)}`);
      assert.ok(finding.source.quote.includes(passage), `citation “${finding.source.quote}” should contain “${passage}”`);
    }
    const corrected = await review(item.task, item.fixed, item.label, item.kind);
    assert.deepEqual(corrected.findings, [], JSON.stringify(corrected.findings));
  });
}

test('flaw matrix: the unresolved v1/v2 guidelines conflict keeps hashtag rules off until Maya decides', async () => {
  const fresh = (await judgeDemo.create(fs.mkdtempSync(path.join(os.tmpdir(), 'averill-flaws-conflict-')), path.join(__dirname, '..', 'demo-company'))).data;
  const { findings } = await contextualReview.reviewObserved({ workspace: fresh, aiEnabled: false, observed: { text: 'x #lowestprice', field: { kind: 'textarea', label: 'Caption', value: 'x #lowestprice' } } }, 'instagram', false, () => {});
  assert.ok(!findings.some(f => f.type.startsWith('hashtag')), JSON.stringify(findings));
});

test('flaw matrix: published simulator posts raise no hashtag finding', async () => {
  const file = fs.readFileSync(path.join(__dirname, '..', '..', 'demo-tools', 'social-simulator', 'src', 'services', 'social-posts.ts'), 'utf8');
  const posts = [...file.matchAll(/^\s*(ig|li)\('[^']+',\s*[^,]+,\s*'[^']+',\s*('(?:[^'\\]|\\.)*')\),?$/gm)].map(match => ({ task: match[1] === 'ig' ? 'instagram' : 'linkedin', text: new Function(`return ${match[2]}`)() }));
  assert.equal(posts.length, 14);
  for (const post of posts) {
    const { findings } = await review(post.task, post.text, 'Caption');
    assert.deepEqual(findings.filter(f => f.type.startsWith('hashtag')), [], post.text);
  }
});

// FB-08: the planted image flaw. The Instagram Reel draft uses a real photo with "Lowest prices guaranteed" burned into the
// picture. The check runs the same engine on the text read from the image; the corrected cover is the same photo without the text.
const imageCheck = require('../src/image-check');
const PHOTOS = path.join(__dirname, '..', '..', 'demo-tools', 'social-simulator', 'public', 'vamo', 'photos');
const REEL_FLAWED = 'instagram-reel-cover-price-1080x1920.jpg';
const REEL_CORRECTED = 'instagram-reel-cover-1080x1920.jpg';
const LINKEDIN_DRAFT = 'linkedin-winter-draft-copenhagen-1200x627.jpg';
// Reads the pixel size from the JPEG header (the first SOF marker), with no dependency.
const jpegSize = file => {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${file} is not a JPEG`);
  for (let offset = 2; offset + 9 < bytes.length;) {
    assert.equal(bytes[offset], 0xff, `bad JPEG marker in ${file}`);
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error(`no size found in ${file}`);
};
// STAND-IN for OCR, the same on every machine: a JPEG has no <text> to read, so this map lists the words that were
// burned onto each photo when it was made. The real macOS reader runs on the real files in the last test.
const STAND_IN_WORDS = {
  [REEL_FLAWED]: 'VAMO\nWinter,\ndifferently.\nCurated city breaks\nLowest prices guaranteed',
  [REEL_CORRECTED]: 'VAMO\nWinter,\ndifferently.\nCurated city breaks',
  [LINKEDIN_DRAFT]: '',
};
const standInWords = async file => { const words = STAND_IN_WORDS[path.basename(file)]; assert.notEqual(words, undefined, `no stand-in words for ${file}`); return words; };
const PNG_HEAD = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const imageReview = (task, name, ocr, alt = 'Selected post preview') => {
  const png = 'data:image/png;base64,' + Buffer.concat([PNG_HEAD, Buffer.from(name)]).toString('base64');
  return imageCheck.run({ workspace, task, images: imageCheck.validate([{ ...jpegSize(path.join(PHOTOS, name)), alt, dataUrl: png }]), ocr: async () => ocr(path.join(PHOTOS, name)) });
};

test('flaw matrix: the draft photos have the sizes the image rules expect', () => {
  assert.deepEqual(jpegSize(path.join(PHOTOS, REEL_FLAWED)), { width: 1080, height: 1920 });
  assert.deepEqual(jpegSize(path.join(PHOTOS, REEL_CORRECTED)), { width: 1080, height: 1920 });
  assert.deepEqual(jpegSize(path.join(PHOTOS, LINKEDIN_DRAFT)), { width: 1200, height: 627 });
});

test('flaw matrix: the Instagram Reel draft uses the planted image and the image check catches "lowest prices guaranteed" with its citation', async () => {
  assert.equal(social('vamo-ig-winter-reel-draft').imageUrl, `/vamo/photos/${REEL_FLAWED}`);
  const { findings } = await imageReview('instagram', REEL_FLAWED, standInWords);
  assert.deepEqual(findings.map(f => f.type), ['forbidden-claim'], JSON.stringify(findings));
  assert.equal(findings[0].source.title, 'current-brief.md');
  assert(findings[0].source.quote.includes('Do not claim "lowest prices guaranteed"'));
  assert.equal(findings[0].observedExcerpt, 'Lowest prices guaranteed');
  assert.equal(findings[0].imageIndex, 1);
  const corrected = await imageReview('instagram', REEL_CORRECTED, standInWords);
  assert.deepEqual(corrected.findings, [], JSON.stringify(corrected.findings));
});

test('flaw matrix: the LinkedIn draft image meets the approved image rules', async () => {
  assert.equal(social('vamo-li-winter-draft').imageUrl, `/vamo/photos/${LINKEDIN_DRAFT}`);
  const { findings } = await imageReview('linkedin', LINKEDIN_DRAFT, standInWords);
  assert.deepEqual(findings, [], JSON.stringify(findings));
  const noAlt = await imageReview('linkedin', LINKEDIN_DRAFT, standInWords, '');
  assert.deepEqual(noAlt.findings.map(f => f.type), ['image-alt-missing']);
});

// The real macOS reader on the real photos. Skipped where the helper cannot run (not macOS or not built).
const OCR_BINARY = path.join(__dirname, '..', 'scripts', 'extract-text-macos-arm64');
test('flaw matrix: the macOS OCR helper reads the planted phrase out of the real photo', { skip: process.platform !== 'darwin' || !fs.existsSync(OCR_BINARY) ? 'macOS OCR helper not available' : false }, async () => {
  const flawed = await imageReview('instagram', REEL_FLAWED, file => imageCheck.defaultOcr(file));
  assert.deepEqual(flawed.findings.map(f => f.type), ['forbidden-claim'], JSON.stringify(flawed));
  const corrected = await imageReview('instagram', REEL_CORRECTED, file => imageCheck.defaultOcr(file));
  assert.deepEqual(corrected.findings, [], JSON.stringify(corrected));
});
