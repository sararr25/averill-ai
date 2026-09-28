const test = require('node:test');
const assert = require('node:assert/strict');
const { windowNumber, observation } = require('../src/external-observation');

test('external window IDs are accepted only in desktop capture format', () => {
  assert.equal(windowNumber('window:1234:0'), '1234');
  assert.equal(windowNumber('screen:1234:0'), null);
  assert.equal(windowNumber('window:1234:0/../../secret'), null);
});

test('observation is bounded, attributed and distinguishes accessibility from OCR', () => {
  const result = observation({ personId: 'p1', windowId: 'window:1:0', windowName: 'Draft', method: 'ocr', text: '  A claim  ', timestamp: new Date('2026-09-28T10:00:00Z') });
  assert.equal(result.text, 'A claim');
  assert.equal(result.confidence, 'visible-text-only');
  assert.equal(result.capturedAt, '2026-09-28T10:00:00.000Z');
  assert.equal(result.contentHash.length, 64);
  assert.equal(observation({ ...result, method: 'accessibility' }).confidence, 'structured-text');
});

test('observation redacts credential-shaped text and payment numbers before display', () => {
  const result = observation({ personId: 'p1', windowId: 'window:1:0', windowName: 'Draft', method: 'ocr', text: 'password: secret-value-123 card 4111 1111 1111 1111' });
  assert.equal(result.sensitiveRedacted, true);
  assert.doesNotMatch(result.text, /secret-value|4111 1111/);
});
