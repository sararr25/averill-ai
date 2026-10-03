const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { localReview, reviewTask } = require('../src/task-review');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-task-review-'));
const policy = path.join(root, 'marketing.txt');
fs.writeFileSync(policy, 'Do not claim "lowest prices guaranteed".\nEvery marketing email must include this footer: "You are receiving this email because you subscribed to Vamo. Unsubscribe anytime."\n');
const data = {
  people: [{ id: 'owner', role: 'admin', department: null }, { id: 'staff', role: 'employee', department: 'People' }],
  activePersonId: 'owner',
  sources: [{ id: 'marketing-v2', title: 'Marketing policy', department: 'Marketing', scope: 'department', status: 'approved', version: '2', approvedAt: '2026-09-28', ownerId: 'owner', priority: 10, textPath: policy }],
};

test('review cites exact approved rules and updates when the employee corrects the external draft', () => {
  const before = localReview(data, 'email', 'Our lowest prices guaranteed.');
  assert.ok(before.findings.some(item => item.type === 'forbidden-claim' && item.source.id === 'marketing-v2'));
  assert.ok(before.findings.some(item => item.type === 'missing-required-text'));
  assert.ok(before.findings.every(item => fs.readFileSync(policy, 'utf8').includes(item.source.quote)));
  const after = localReview(data, 'email', 'Discover curated winter city breaks. You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.');
  assert.equal(after.findings.length, 0);
});

test('pending, revoked, conflicting and other-department sources cannot guide work', () => {
  data.sources[0].status = 'pending';
  assert.equal(localReview(data, 'email', 'lowest prices guaranteed').findings.length, 0);
  data.sources[0].status = 'approved';
  data.activePersonId = 'staff';
  assert.equal(localReview(data, 'email', 'lowest prices guaranteed').findings.length, 0);
  data.activePersonId = 'owner';
  data.sources.push({ ...data.sources[0], id: 'marketing-conflict', sha256: 'different' });
  data.sources[0].sha256 = 'original';
  assert.equal(localReview(data, 'email', 'lowest prices guaranteed').findings.length, 0);
  data.sources.pop();
  data.sources[0].status = 'superseded';
  assert.equal(localReview(data, 'email', 'lowest prices guaranteed').findings.length, 0);
  data.sources[0].status = 'approved';
});

test('model path refuses to send observed credentials', async () => {
  data.privacy = { companyAI: true };
  await assert.rejects(() => reviewTask(data, 'email', 'api_key=example-secret-value lowest prices guaranteed', 'test-key', true), /Remove credentials/);
});

test('Nebius suggestions require exact observed and approved source excerpts', async () => {
  data.privacy = { companyAI: true };
  data.sources[0].aiAllowed = true;
  data.sources[0].confidentiality = 'internal';
  const oldModel = process.env.NEBIUS_MODEL;
  const oldFetch = global.fetch;
  process.env.NEBIUS_MODEL = 'synthetic-nemotron';
  global.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ findings: [
    { observed_excerpt: 'lowest prices guaranteed', source_id: 'marketing-v2', source_quote: 'Do not claim "lowest prices guaranteed".', suggestion: 'Remove the guarantee.' },
    { observed_excerpt: 'imaginary discount', source_id: 'marketing-v2', source_quote: 'Do not claim "lowest prices guaranteed".', suggestion: 'Invent a discount.' },
  ] }) } }] }) });
  try {
    const result = await reviewTask(data, 'email', 'Our lowest prices guaranteed.', 'test-key', true);
    assert.equal(result.mode, 'model');
    assert.equal(result.findings.filter(item => item.type === 'model-suggestion').length, 1);
  } finally {
    global.fetch = oldFetch;
    if (oldModel === undefined) delete process.env.NEBIUS_MODEL; else process.env.NEBIUS_MODEL = oldModel;
  }
});

test.after(() => fs.rmSync(root, { recursive: true, force: true }));
