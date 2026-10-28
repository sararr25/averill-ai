// T6: design questions in the app question box and the browser card are answered only from approved design rule lines.
// Uses the real judge-demo workspace: guidelines version 3 (typography) arrives pending and counts only after Maya approves it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const rules = require('../src/rules');
const nebius = require('../src/nebius');
const judgeDemo = require('../src/judge-demo');
const workspace = require('../src/workspace');
const designCheck = require('../src/design-check');
const { localWorkspaceAnswer, answerWorkspace, designTopics } = require('../src/workspace-answer');
const { ContextualReview } = require('../src/contextual-review');

const PACK = path.join(__dirname, '..', 'demo-company');
const V3 = path.join(PACK, 'vamo', 'Marketing', 'social-media-guidelines-v3.md');
const CANVA = 'https://www.canva.com';
const FONT_LINES = ['Design rule: instagram | font-headline | "Fraunces 400, 72 to 120 px".', 'Design rule: instagram | font-body | "DM Sans 400, at least 28 px".', 'Design rule: instagram | font-label | "DM Sans 600, 24 to 36 px".', 'Design rule: instagram | font-families | "2".'];
const NO_FONT_RULE = 'No approved rule covers fonts. Ask your lead.';
const isDesignLine = quote => Boolean(rules.parseDesignLine(quote) || rules.parseImageLine(quote));

async function demo(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-t6-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const { data } = await judgeDemo.create(root, PACK);
  const person = name => data.people.find(entry => entry.name === name);
  const guideline = version => data.sources.find(source => source.title === 'social-media-guidelines.md' && source.version === version);
  workspace.switchPerson(data, person('Maya Jensen').id);
  // Maya's existing step: supersede version 1, so version 2 applies alone.
  workspace.updateSource(data, guideline('1').id, 'superseded', 40);
  // Maya approves version 3 the way Workspace settings does, then supersedes version 2.
  const approveV3 = () => { workspace.updateSource(data, guideline('3').id, 'approved', guideline('3').priority); workspace.updateSource(data, guideline('2').id, 'superseded', 40); };
  return { data, person, guideline, approveV3 };
}

const element = (extra = {}) => ({ text: 'winter in lisbon', box: { x: 120, y: 200, width: 700, height: 120 }, fontSize: 107.2, fontWeight: 400, colors: [[16, 15, 13, 1]], background: { dark: [245, 240, 229], light: [245, 240, 229] }, ...extra });
const reading = () => ({ design: { width: 1080, height: 1350, scale: 0.4 }, elements: [element(), element({ text: 'book by 15 november', box: { x: 120, y: 1100, width: 600, height: 40 }, fontSize: 30 })] });

test('v3 parses its typography lines and keeps every v2 line; old numeric design lines parse exactly as before', () => {
  const v2 = fs.readFileSync(path.join(PACK, 'vamo', 'Marketing', 'social-media-guidelines-v2.md'), 'utf8');
  const v3 = fs.readFileSync(V3, 'utf8');
  assert.match(v3, /^Version: 3\. Owner: Maya Jensen, Marketing lead\. Synthetic demo guide, 28 October 2026\.$/m);
  for (const line of v2.split('\n').filter(line => line && !line.startsWith('Version: '))) assert(v3.includes(line), line);
  const section = v3.slice(v3.indexOf('## Typography and layout'));
  assert(section.includes('Fraunces Regular (weight 400) at 72 to 120 px') && section.includes('DM Sans Regular (weight 400) at 28 px or more') && section.includes('DM Sans SemiBold (weight 600) at 24 to 36 px') && section.includes('at most 2 font families'));
  assert(!/[–—]/.test(section));
  assert.deepEqual(section.split('\n').filter(line => rules.parseDesignLine(line)), FONT_LINES);
  assert.equal((v3.match(/safe-margin/g) || []).length, 1, 'the safe margin is not duplicated');
  assert.deepEqual(rules.parseDesignLine(FONT_LINES[0]), { task: 'instagram', type: 'font-headline', value: 'Fraunces 400, 72 to 120 px', family: 'Fraunces', weight: 400, minPx: 72, maxPx: 120 });
  assert.deepEqual(rules.parseDesignLine(FONT_LINES[1]), { task: 'instagram', type: 'font-body', value: 'DM Sans 400, at least 28 px', family: 'DM Sans', weight: 400, minPx: 28, maxPx: null });
  assert.deepEqual(rules.parseDesignLine(FONT_LINES[3]), { task: 'instagram', type: 'font-families', value: '2', number: 2 });
  assert.deepEqual(rules.parseDesignLine('Design rule: instagram | contrast-normal | "4.5".'), { task: 'instagram', type: 'contrast-normal', value: '4.5', number: 4.5 });
  assert.deepEqual(rules.parseDesignLine('Design rule: instagram | contrast-large | "3".'), { task: 'instagram', type: 'contrast-large', value: '3', number: 3 });
  assert.deepEqual(rules.parseDesignLine('Design rule: instagram | safe-margin | "108".'), { task: 'instagram', type: 'safe-margin', value: '108', number: 108 });
  for (const bad of ['Design rule: instagram | font | "Arial"', 'Design rule: instagram | font-body | "Arial"', 'Design rule: instagram | font-body | "DM Sans 450, at least 28 px"', 'Design rule: instagram | font-headline | "Fraunces 400, 120 to 72 px"', 'Design rule: instagram | font-families | "2.5"', 'Design rule: instagram | font-families | "9"', 'Design rule: instagram | safe-margin | "Fraunces 400, 72 to 120 px"']) assert.equal(rules.parseDesignLine(bad), null, bad);
});

test('design questions are recognised; wording questions are not, even when they name an image', () => {
  for (const question of ['Which font should I use?', 'What typeface for headlines?', 'What colour can the text be?', 'How big should the text be?', 'What margin do I need?', 'How should I lay out the spacing?', 'Which photo works?']) assert(designTopics(question), question);
  assert.deepEqual(designTopics('Which font should I use?').words, ['fonts']);
  assert.deepEqual(designTopics('What color and margin?').words, ['colors', 'margins']);
  for (const question of ['Can we say lowest prices guaranteed?', 'Can the image say "best price"?', 'Which hashtags do I need?', 'When is the Reel published?']) assert.equal(designTopics(question), null, question);
});

test('app question box: v3 pending gives "No approved rule covers fonts"; after Maya approves it the answer cites the Fraunces/DM Sans lines', async t => {
  const { data, person, guideline, approveV3 } = await demo(t);
  assert.equal(guideline('3').status, 'pending');
  const before = localWorkspaceAnswer(data, 'Which font should I use?');
  assert.deepEqual([before.text, before.sources], [NO_FONT_RULE, []]);
  approveV3();
  for (const name of ['Maya Jensen', 'Emma Larsen']) {
    workspace.switchPerson(data, person(name).id);
    const after = localWorkspaceAnswer(data, 'Which font should I use?');
    assert.match(after.text, /^Approved design rules for fonts, from social-media-guidelines\.md \(version 3\)\. Instagram: headlines Fraunces 400, 72 to 120 px; body text DM Sans 400, at least 28 px; labels and the wordmark DM Sans 600, 24 to 36 px; at most 2 font families per design\.$/);
    assert.deepEqual(after.sources.map(source => source.quote), FONT_LINES);
    assert(after.sources.every(source => source.title === 'social-media-guidelines.md' && source.version === '3' && source.kind === 'workspace' && source.approvedBy === 'Maya Jensen' && Number.isInteger(source.line)));
  }
});

test('a design question never cites a wording or claim rule; a wording question still gets its wording passage', async t => {
  const { data, approveV3 } = await demo(t);
  approveV3();
  for (const question of ['Which font should I use?', 'What colour should text be?', 'How far from the edge should text sit?', 'What size should images be?', 'Which font and colour should I use?']) {
    const answer = localWorkspaceAnswer(data, question);
    assert(answer.sources.length && answer.sources.every(source => isDesignLine(source.quote)), `${question}: ${JSON.stringify(answer.sources.map(s => s.quote))}`);
  }
  assert.match(localWorkspaceAnswer(data, 'What margin do I need?').text, /every text box at least 108 px from every edge/);
  const wording = localWorkspaceAnswer(data, 'Can we say lowest prices guaranteed?');
  assert.equal(wording.design, undefined);
  assert.match(wording.sources[0].quote, /lowest prices guaranteed/i);
});

test('with Nemotron on, design questions never reach the model and still cite only design rules', async t => {
  const { data, approveV3 } = await demo(t);
  approveV3();
  const original = nebius.chat, calls = [];
  nebius.chat = async (...args) => { calls.push(args); throw new Error('The model must not be called for a design question'); };
  t.after(() => { nebius.chat = original; });
  const answer = await answerWorkspace(data, 'Which font should I use?', 'test-key-not-real');
  assert.equal(calls.length, 0);
  assert.equal(answer.mode, 'local');
  assert.deepEqual(answer.sources.map(source => source.quote), FONT_LINES);
});

test('browser card: the answer carries the citation and, for this tab, the measured headline size but never a font family', async t => {
  const { data, approveV3 } = await demo(t);
  const state = { signedIn: true, workspace: data, epoch: 1, aiEnabled: false, key: '', observed: null };
  const review = new ContextualReview({ getState: () => state, answer: question => localWorkspaceAnswer(data, question) });
  const ask = extra => review.ask({ question: 'Which font should I use?', task: 'canva', tabId: 7, pageOrigin: CANVA, ...extra });
  // Before any design reading: the plain answer only.
  const pending = await ask();
  assert.deepEqual([pending.state, pending.message, pending.facts], ['no-source', NO_FONT_RULE, []]);
  review.designCheck({ ...reading(), tabId: 7, pageOrigin: CANVA, kind: 'design-check' });
  const withFacts = await ask();
  assert.equal(withFacts.message, `${NO_FONT_RULE} Your headline (largest text) uses 107 px. Your smallest text uses 30 px. Averill cannot see which font your design uses.`);
  approveV3();
  const answered = await ask();
  assert.equal(answered.state, 'answered');
  assert.deepEqual(answered.citations.map(c => [c.title, c.version, c.quote]), FONT_LINES.map(quote => ['social-media-guidelines.md', '3', quote]));
  assert(answered.text.startsWith('Approved design rules for fonts, from social-media-guidelines.md (version 3).'));
  assert(answered.text.endsWith('Your headline (largest text) uses 107 px. Your smallest text uses 30 px. Averill cannot see which font your design uses.'));
  assert(answered.facts.every(fact => !/Fraunces|DM Sans/.test(fact)));
  // Another tab, page or person gets no facts from this reading.
  assert.deepEqual((await ask({ tabId: 8 })).facts, []);
  assert.deepEqual((await ask({ pageOrigin: 'https://www.canva.com.evil.example' })).facts, []);
  state.epoch = 2;
  assert.deepEqual((await ask()).facts, []);
  // A wording question in the card is unchanged: no design facts, wording citation.
  state.epoch = 1;
  const wording = await review.ask({ question: 'Can we say lowest prices guaranteed?', task: 'canva', tabId: 7, pageOrigin: CANVA });
  assert.equal(wording.facts, undefined);
  assert.match(wording.citations[0].quote, /lowest prices guaranteed/i);
});

test('design facts: contrast and margin questions use the reader numbers; the existing design check is unchanged by v3', async t => {
  assert.deepEqual(designCheck.facts(reading(), ['contrast-normal']), ['Your lowest text contrast is 16.85:1.']);
  assert.deepEqual(designCheck.facts(reading(), ['safe-margin']), ['Your closest text box is 120 px from the left edge.']);
  assert.deepEqual(designCheck.facts({ design: { width: 1080, height: 1350 }, elements: [element({ box: { x: -12, y: 200, width: 700, height: 120 } })] }, ['safe-margin']), ['Your closest text box is 12 px past the left edge.']);
  assert.deepEqual(designCheck.facts(reading(), ['image-aspect']), []);
  const { data, approveV3 } = await demo(t);
  const pistachio = { ...reading(), elements: [element({ colors: [[147, 197, 114, 1]], fontSize: 20 }), element({ box: { x: 40, y: 1100, width: 600, height: 40 } })] };
  const shape = result => [result.state, result.checked, result.notes, result.findings.map(({ type, element, problem, measured, source }) => [type, element, problem, measured, source.quote])];
  const withV2 = designCheck.evaluate({ workspace: data, payload: pistachio });
  approveV3();
  const withV3 = designCheck.evaluate({ workspace: data, payload: pistachio });
  assert.deepEqual(shape(withV3), shape(withV2));
  assert.deepEqual(withV3.findings.map(f => f.source.version), ['3', '3']);
});
