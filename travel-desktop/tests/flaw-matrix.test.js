// Flaw matrix (docs/JUDGE_DEMO_FLAW_MATRIX_2026-10-24.md): every flaw planted in the simulator drafts must be
// caught by the local approved-rules check with the right citation, and the corrected draft must be clean.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const judgeDemo = require('../src/judge-demo');
const contextualReview = require('../src/contextual-review');

const drafts = require('../../demo-tools/social-simulator/src/data/flawed-drafts.json');
const brevo = id => drafts.brevo.find(item => item.id === id);
const social = id => drafts.social.find(item => item.id === id);
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
    expect: [['forbidden-claim', 'current-brief.md', 'Do not claim "lowest prices guaranteed"'], ['missing-required-text', 'linkedin-campaign.md', 'Include “Explore the winter collection”']],
    fixed: social('vamo-li-winter-draft').text.replace('Lowest prices guaranteed. Book before the end of October.', 'Discover curated winter city breaks. Explore the winter collection.') },
  { name: 'Instagram paid Reel', task: 'instagram', label: 'Caption', text: social('vamo-ig-winter-reel-draft').text,
    expect: [['missing-required-text', 'brand-and-legal.md', 'For paid creator content, include "Paid partnership with Vamo"']],
    fixed: `Paid partnership with Vamo\n\n${social('vamo-ig-winter-reel-draft').text}` },
];

let root, workspace;
test.before(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-flaws-'));
  workspace = (await judgeDemo.create(root, path.join(__dirname, '..', 'demo-company'))).data;
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
