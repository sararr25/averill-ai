// Live Nemotron sentence rewrite on generated text only, never normal userData.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });
const workspace = require('../src/workspace'), rewrite = require('../src/sentence-rewrite');
(async () => {
  if (!process.argv.includes('--synthetic-consent')) throw new Error('Use --synthetic-consent for generated synthetic text only.');
  if (!process.env.NEBIUS_API_KEY) throw new Error('Local development provider key is unavailable.');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-pro-sentence-'));
  try {
    const data = workspace.create(root, 'Synthetic rewrite QA', 'Synthetic owner'), file = path.join(root, 'policy.md');
    fs.writeFileSync(file, 'Approved lead: "Discover curated winter city breaks".\nDo not claim "lowest prices guaranteed".\n');
    const source = workspace.importFile(root, data, file, { department: 'Marketing', version: '2' }); workspace.updateSource(data, source.id, 'approved'); source.aiAllowed = true; data.privacy = { companyAI: true };
    const text = 'Hello traveller. Our lowest prices guaranteed. Explore: https://example.com\nUnsubscribe anytime.';
    const result = await rewrite.propose(data, { type: 'forbidden-claim', observedExcerpt: 'lowest prices guaranteed' }, { field: { kind: 'textarea', value: text } }, [{ source, text: fs.readFileSync(source.textPath, 'utf8') }], { key: process.env.NEBIUS_API_KEY, fetcher: async (url, options) => { const response = await fetch(url, options); if (process.env.AVERILL_SYNTHETIC_DEBUG === '1' && url.endsWith('/chat/completions')) fs.writeFileSync('/tmp/averill-sentence-synthetic-reply.json', JSON.stringify(await response.clone().json())); return response; } });
    const output = result ? text.slice(0, result.start) + result.after + text.slice(result.end) : '';
    const preserved = output.startsWith('Hello traveller. ') && output.endsWith(' Explore: https://example.com\nUnsubscribe anytime.');
    const receipt = { verifiedAt: new Date().toISOString(), live: true, payload: 'Generated synthetic policy and sentence only', method: result?.method, before: result?.before, after: result?.after, preservedSurroundingText: preserved, passed: result?.method === 'nemotron-proposal' && preserved && !result.after.includes('guaranteed') };
    fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true }); fs.writeFileSync(path.join(__dirname, '../dist/pro-sentence-live-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt, null, 2)); if (!receipt.passed) process.exitCode = 1;
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
