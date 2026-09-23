const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { inspect, answer } = require('../src/engine');
const { parseModelAnswer } = require('../src/assistant');

test('email findings appear for an incoming draft and disappear after correction', () => {
  const incoming = { subject: 'Lowest prices guaranteed', body: 'Book now', audience: 'All subscribers', footer: false };
  assert.deepEqual(inspect('email', incoming).map((item) => item.id), ['unapproved-claim', 'wrong-audience', 'missing-footer']);
  const fixed = { subject: 'Discover curated winter city breaks', body: 'Explore Vienna', audience: 'Travel subscribers — Denmark', footer: true };
  assert.deepEqual(inspect('email', fixed), []);
});

test('social findings cover asset, disclosure and date and disappear after correction', () => {
  const incoming = { caption: 'Winter in Vienna', asset: 'winter-square-old.svg', date: '2026-10-21', partnershipLabel: false };
  assert.deepEqual(inspect('social', incoming).map((item) => item.id), ['wrong-format', 'missing-disclosure', 'calendar-conflict']);
  const fixed = { caption: 'Winter in Vienna. Paid partnership with Aurelia Travel', asset: 'winter-reel-vertical.svg', date: '2026-10-17', partnershipLabel: true };
  assert.deepEqual(inspect('social', fixed), []);
});

test('handover identifies the superseded brief and cites the current one', () => {
  const issues = inspect('handover', { brief: 'v1' });
  assert.equal(issues[0].id, 'superseded-brief');
  assert.equal(issues[0].source.file, 'current-brief.md');
  assert.deepEqual(inspect('handover', { brief: 'v2' }), []);
});

test('file question returns existing approved source files', () => {
  const response = answer('Where are the files for this campaign?');
  assert.match(response.text, /winter-email-hero\.svg/);
  assert.match(response.text, /winter-reel-vertical\.svg/);
  assert.ok(response.sources.length);
  for (const source of response.sources) assert.ok(fs.existsSync(source.path));
});

test('unknown questions do not fabricate a source-backed answer', () => {
  const response = answer('What is the CEO telephone number?');
  assert.match(response.text, /cannot verify/);
  assert.deepEqual(response.sources, []);
});

test('model output must cite a connected source', () => {
  assert.equal(parseModelAnswer('{"answer":"Unsupported claim","source_ids":[]}'), null);
  const parsed = parseModelAnswer('{"answer":"Use the current brief.","source_ids":["brief","missing"]}');
  assert.equal(parsed.sources.length, 1);
  assert.equal(parsed.sources[0].id, 'brief');
});
