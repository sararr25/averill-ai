const test = require('node:test');
const assert = require('node:assert/strict');
const { patchValue } = require('../browser-extension/editor-adapter');

test('a single exact edit preserves whitespace, line breaks and every unrelated character', () => {
 const value = '  Hello 🌍\nOur lowest prices guaranteed.\nKeep this link: https://example.test  ';
 const start = value.indexOf('lowest prices guaranteed');
 assert.equal(patchValue(value, { start, end: start + 24, before: 'lowest prices guaranteed', after: '' }), '  Hello 🌍\nOur .\nKeep this link: https://example.test  ');
});
test('stale, ambiguous, invalid-range and invented-text patches never rewrite a draft', () => {
 const p = { start: 0, end: 5, before: 'Hello', after: 'Hi' };
 for (const [text, proposal] of [['Changed',p],['Hello Hello',p],['Hello',{...p,start:-1}],['Hello',{...p,end:500}],['Hello',{...p,before:''}],['Hello',{...p,after:'x'.repeat(6001)}]]) assert.throws(()=>patchValue(text,proposal));
});
