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
  for (const [name, reason] of [['no-frame', /cannot find the design page/], ['layer-mismatch', /cannot match every text/], ['rotated-text', /rotated or stretched/], ['foreign-image', /cannot be read by the page/], ['two-pages', /more than one page/]]) {
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
