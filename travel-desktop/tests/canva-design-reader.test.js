// FB-14: the real Canva design reader (browser-extension/canva-design.js) on a page rebuilt from the captured Canva structure
// (tests/fixtures/canva-page-structure-2026-10-25.json). jsdom is not a dependency and cannot lay out or paint, so the reader
// runs in Chromium through Electron (scripts/canva-reader-harness.cjs) and this test checks what it returned.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const electron = require('electron');
const canva = require('../browser-extension/canva-design');

const CAPTURED = { vamo: [32.0489, 16.875, 117.373, 53.4285], headline: [64.0151, 891.786, 875.836, 354.722], body: [71.4707, 1276.17, 763.083, 37.9622] };
const TEXTS = ['vamo', 'copenhagen before 8', 'finish this line: what makes the city good before 8?'];
let results;
test.before(() => {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const run = spawnSync(electron, [path.join(__dirname, '..', 'scripts', 'canva-reader-harness.cjs')], { encoding: 'utf8', timeout: 90000, env });
  const line = String(run.stdout).split('\n').find(text => text.startsWith('READER_RESULTS '));
  assert(line, `The reader harness failed: ${run.stdout}\n${run.stderr}`);
  results = JSON.parse(line.slice('READER_RESULTS '.length));
});

function assertCaptured(result, scale) {
  assert.equal(result.state, 'ok', JSON.stringify(result));
  assert.deepEqual([result.design.width, result.design.height], [1080, 1440]);
  assert(Math.abs(result.design.scale - scale) < 0.0001, `scale ${result.design.scale}`);
  assert.deepEqual(result.elements.map(e => e.text), TEXTS, 'three texts; the headline text comes from the text layer because its visual span holds only <br>');
  Object.values(CAPTURED).forEach((expected, index) => {
    const box = result.elements[index].box;
    [box.x, box.y, box.width, box.height].forEach((value, k) => assert(Math.abs(value - expected[k]) <= 1, `${TEXTS[index]} box ${JSON.stringify(box)} vs ${expected}`));
  });
  assert.deepEqual(result.elements.map(e => Math.round(e.fontSize * 10) / 10), [32.2, 119.3, 23.1], 'font sizes in design px from the text layer');
  assert.deepEqual(result.elements[0].colors, [[16, 15, 13, 0.9]], 'the wordmark wrapper opacity 0.9 is part of its colour');
  assert.deepEqual(result.elements[2].background, { dark: [245, 240, 229], light: [245, 240, 229] }, 'body sits on the cream panel pixels');
  assert.equal(canva.worstContrast(result.elements[2].colors, result.elements[2].background).toFixed(2), '16.86');
  assert.doesNotThrow(() => canva.validate({ design: result.design, elements: result.elements }), 'the reader output is exactly what the bridge accepts');
}

test('the captured page at 40% zoom: 3 texts, design boxes within 1 px of the captured translate values, scale 0.4007', () => assertCaptured(results.captured, 0.4007));
test('the same design at 100% zoom with the page partly off screen reads the same numbers', () => assertCaptured(results.zoom100, 1));

test('28 October capture: a soft line break in the visual headline matches the text layer (real canva.com structure)', () => {
  const result = results['captured-1028'];
  assert.equal(result.state, 'ok', JSON.stringify(result));
  assert.deepEqual(result.elements.map(e => e.text), ['vamo', 'copenhagen\nbefore 8', 'finish this line: what makes the city good before 8?']);
  assert.deepEqual(result.elements.map(e => [e.box.x, e.box.y]), [[120, 120], [120, 900], [120, 1270]], 'captured translate values');
  assert.deepEqual(result.elements.map(e => Math.round(e.fontSize * 10) / 10), [32.2, 106.7, 23.1], 'font sizes from the text layer');
  assert.doesNotThrow(() => canva.validate({ design: result.design, elements: result.elements }));
  assert.equal(results['text-mismatch-1028'].state, 'unreadable');
  assert.match(results['text-mismatch-1028'].reason, /two text layers on this page do not match/);
});

test('unrecognised structures fail closed with a reason, never a guess', () => {
  for (const [name, reason] of [['no-frame', /cannot find the design page/], ['layer-mismatch', /cannot match every text/], ['foreign-image', /cannot be read by the page/], ['two-pages', /more than one page/], ['carousel-skewed', /stretched, skewed or mirrored/], ['carousel-mirrored', /stretched, skewed or mirrored/], ['carousel-masked', /masked picture/], ['carousel-effect-over', /effect drawn over it/]]) {
    assert.equal(results[name].state, 'unreadable', name);
    assert.match(results[name].reason, reason, name);
    assert.deepEqual(Object.keys(results[name]).sort(), ['reason', 'state'], 'nothing else is returned');
  }
});

test('pistachio body text and a moved body box are measured from the page', () => {
  const pale = results.pistachio.elements[2];
  assert.deepEqual(pale.colors, [[147, 197, 114, 1]]);
  assert.equal(canva.worstContrast(pale.colors, pale.background).toFixed(2), '1.76');
  assert.equal(results.moved.elements[2].box.x, 40);
});

test('a rotated text is read with the real corners of its rotated box (owner decision, 28 October 2026)', () => {
  const body = results['rotated-text'].elements[2];
  // 763.083 x 37.9622 turned 4 degrees around its centre (867.97 + 71.47 ... ): bounding box of the four corners.
  const [w, h, a] = [763.083, 37.9622, 4 * Math.PI / 180], cx = 71.4707 + w / 2, cy = 1276.17 + h / 2;
  const hw = Math.abs(Math.cos(a)) * w / 2 + Math.abs(Math.sin(a)) * h / 2, hh = Math.abs(Math.sin(a)) * w / 2 + Math.abs(Math.cos(a)) * h / 2;
  [[body.box.x, cx - hw], [body.box.y, cy - hh], [body.box.width, 2 * hw], [body.box.height, 2 * hh]].forEach(([got, want]) => assert(Math.abs(got - want) < 0.05, `${got} vs ${want}`));
  assert.equal(results['rotated-text'].elements[2].fontSize, results.captured.elements[2].fontSize, 'font size from the text layer, not the rotated box');
});

const CAROUSEL_TEXTS = ['Nyhavn', 'The painted houses before the tour boats wake up.\nBring a coffee: the quay is yours.', 'at 7:30'];
function rotatedBounds(x, y, w, h, deg) {
  const a = deg * Math.PI / 180, hw = Math.abs(Math.cos(a)) * w / 2 + Math.abs(Math.sin(a)) * h / 2, hh = Math.abs(Math.sin(a)) * w / 2 + Math.abs(Math.cos(a)) * h / 2;
  return [x + w / 2 - hw, y + h / 2 - hh, 2 * hw, 2 * hh];
}
function assertCarousel(result) {
  assert.equal(result.state, 'ok', JSON.stringify(result));
  assert.deepEqual([result.design.width, result.design.height], [1080, 1350]);
  assert.deepEqual(result.slide, { index: 2, count: 5 }, 'open page from div[role=group][aria-label="Page 2"], count from 5 thumbnails and the "2 / 5" bar');
  assert.deepEqual(result.elements.map(e => e.text), CAROUSEL_TEXTS, 'three texts; the accessibility label "2 elements, ..." in the text layer is not a text');
  const expected = [rotatedBounds(108, 116, 710.172, 76.2, -7.23673), [106.029, 1086.59, 864, 105.733], [516.716, 236.626, 333.638, 76.2]];
  result.elements.forEach((element, index) => [element.box.x, element.box.y, element.box.width, element.box.height].forEach((value, k) => assert(Math.abs(value - expected[index][k]) < 0.05, `${CAROUSEL_TEXTS[index]} ${JSON.stringify(element.box)} vs ${expected[index]}`)));
  assert.deepEqual(result.elements.map(e => e.fontSize), [64, 41.33, 64], 'font sizes from the text layer');
  assert.deepEqual(result.elements[0].background, { dark: [245, 240, 229], light: [245, 240, 229] }, 'the rotated title sits on the cream page');
  // The caption crosses the rotated polaroid: its white frame and the photo's water under the rotated box, read through the
  // inverse of the polaroid's composed matrix (not its bounding box).
  assert.deepEqual(result.elements[1].background.light, [255, 255, 255]);
  assert(result.elements[1].background.dark.every((v, k) => Math.abs(v - [52, 86, 104][k]) < 4), JSON.stringify(result.elements[1].background));
  assert.doesNotThrow(() => canva.validate({ design: result.design, elements: result.elements, slide: result.slide }));
}
test('carousel slide 2 of 5 (real capture): rotated title, grouped caption and straight time, slide index and count', () => assertCarousel(results.carousel));
test('carousel at 100% zoom reads the same numbers', () => assertCarousel(results['carousel-zoom100']));
test('carousel: the turned polaroid moved off the page leaves the texts on the cream page (and the turned underline)', () => {
  const result = results['carousel-polaroid-away'];
  assert.equal(result.state, 'ok');
  for (const index of [0, 2]) assert.deepEqual(result.elements[index].background, { dark: [245, 240, 229], light: [245, 240, 229] }, result.elements[index].text);
  // The underline (inside the caption group) is turned 4.76 degrees around its centre, so its left end rises into the bottom
  // of the caption box: a few navy samples darken the darkest 10%, the lightest 10% is the cream page.
  const caption = result.elements[1].background;
  assert.deepEqual(caption.light, [245, 240, 229]);
  assert(caption.dark[0] < 240 && caption.dark[0] > 27, JSON.stringify(caption));
});
test('carousel: page markers that disagree or are missing still read the slide, with slide null', () => {
  for (const name of ['carousel-bar-disagrees', 'carousel-no-markers']) {
    assert.equal(results[name].state, 'ok', name);
    assert.equal(results[name].slide, null, name);
    assert.doesNotThrow(() => canva.validate({ design: results[name].design, elements: results[name].elements, slide: null }));
  }
});
test('the slide field is validated strictly', () => {
  const base = { design: results.carousel.design, elements: results.carousel.elements };
  for (const slide of [{ index: 0, count: 5 }, { index: 6, count: 5 }, { index: 1.5, count: 5 }, { index: 1, count: 101 }, { index: 1, count: 5, extra: 1 }, { index: '1', count: 5 }, 'Page 2', []]) assert.throws(() => canva.validate({ ...base, slide }), /Invalid slide/, JSON.stringify(slide));
  assert.deepEqual(canva.validate({ ...base, slide: { index: 5, count: 5 } }).slide, { index: 5, count: 5 });
  assert.equal('slide' in canva.validate(base), false, 'a reading without the field stays without it');
});

test('carousel: a shape cut by an SVG clipPath of plain paths (Canva polaroid frames) is sampled inside the path only', () => {
  const result = results['carousel-svg-clip'];
  assert.equal(result.state, 'ok', JSON.stringify(result));
  const caption = result.elements[1].background;
  assert.notDeepEqual(caption.light, [255, 255, 255], 'the white frame below the clip path is not under the caption any more');
  assert.deepEqual(results.carousel.elements[1].background.light, [255, 255, 255]);
});

test('carousel: a text highlight drawn as an SVG path before the text is the text background (isPointInFill)', () => {
  const result = results['carousel-highlight'];
  assert.equal(result.state, 'ok', JSON.stringify(result));
  assert.deepEqual(result.elements[2].background, { dark: [228, 199, 207], light: [228, 199, 207] });
});
