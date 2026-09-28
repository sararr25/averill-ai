const test = require('node:test');
const assert = require('node:assert/strict');
const { searchPublicWeb, factCheckPublic } = require('../src/web-search');

test('public fact-check asks Tavily for a summary and keeps source URLs', async () => {
  const original = global.fetch;
  let request;
  global.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return { ok: true, json: async () => ({ answer: 'The public evidence is mixed.', results: [{ title: 'Official record', url: 'https://example.org/record', content: 'A dated public record.' }] }) };
  };
  try {
    const result = await factCheckPublic('Is this claim current?', 'test-key');
    assert.equal(request.include_answer, true);
    assert.equal(request.query, 'Is this claim current?');
    assert.equal(result.answer, 'The public evidence is mixed.');
    assert.equal(result.results[0].url, 'https://example.org/record');
    const search = await searchPublicWeb('public topic', 'test-key');
    assert.equal(request.include_answer, false);
    assert.equal(search.length, 1);
  } finally { global.fetch = original; }
});

test('fact-check does not present a summary without a linked result', async () => {
  const original = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ answer: 'Unsupported claim', results: [] }) });
  try { assert.equal((await factCheckPublic('claim', 'test-key')).answer, ''); }
  finally { global.fetch = original; }
});
