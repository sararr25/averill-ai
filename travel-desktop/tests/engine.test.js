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
  const fixed = { caption: 'Winter in Vienna. Paid partnership with Elseweek', asset: 'winter-reel-vertical.svg', date: '2026-10-17', partnershipLabel: true };
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


test('LinkedIn uses its own organic campaign rules and all corrections clear findings', () => {
  const incoming = { caption: 'Lowest prices guaranteed. Book now!', audience: 'Everyone in Europe', asset: 'winter-square-old.svg', date: '2026-10-17', time: '18:00' };
  const issues = inspect('linkedin', incoming);
  assert.deepEqual(issues.map(item => item.id), ['linkedin-claim', 'linkedin-audience', 'linkedin-asset', 'linkedin-cta', 'linkedin-slot']);
  for (const item of issues) {
    assert.equal(item.source.id, 'linkedin');
    assert.ok(fs.existsSync(item.source.path));
  }
  const fixed = { caption: 'Discover curated winter city breaks. Explore the winter collection.', audience: 'Denmark-based professionals', asset: 'winter-linkedin-landscape.svg', date: '2026-10-16', time: '09:00', partnershipLabel: false };
  assert.deepEqual(inspect('linkedin', fixed), []);
  assert.equal(inspect('linkedin', { ...fixed, time: '18:00' })[0].id, 'linkedin-slot');
  assert.equal(inspect('linkedin', { ...fixed, asset: 'winter-reel-vertical.svg' })[0].id, 'linkedin-asset');
  const response = answer('Which LinkedIn asset and date are approved?');
  assert.match(response.text, /16 October 2026 at 09:00/);
  assert.match(response.text, /winter-linkedin-landscape/);
  assert.deepEqual(response.sources.map(item => item.id), ['linkedin', 'linkedinAsset']);
});
