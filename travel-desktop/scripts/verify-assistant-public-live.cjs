// Explicit --public-consent sends generic operations/public excerpts only. No user profile access.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });
const workspace = require('../src/workspace'), { WorkAssistant } = require('../src/work-assistant');
(async () => {
 if (!process.argv.includes('--public-consent')) throw new Error('Pass --public-consent for generic public operations only.');
 const publicNebiusKey = process.env.NEBIUS_API_KEY, tavilyKey = process.env.TAVILY_API_KEY;
 if (!publicNebiusKey || !tavilyKey) throw new Error('Local development provider keys unavailable.');
 const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-public-guide-'));
 try {
  const data = workspace.create(root, 'Synthetic verification', 'Synthetic owner'); data.privacy = { companyAI: false };
  const assistant = new WorkAssistant(), replies = [];
  const fetcher = async (url, options) => { const response = await fetch(url, options); if (url.includes('/chat/completions')) { const body = await response.clone().json(); replies.push({ finish: body.choices?.[0]?.finish_reason, content: body.choices?.[0]?.message?.content }); } return response; };
  const results = [];
  for (const question of ['How do I improve contrast and spacing in Canva?', 'How do I group elements in Canva?', 'How do I add a frame in Canva?']) {
   const options = { task: 'canva', publicNebiusKey, tavilyKey, fetcher }, start = Date.now(), before = replies.length;
   const preview = await assistant.answer(data, question, options); assert(preview.consentRequired);
   const value = await assistant.answer(data, question, { ...options, consent: true });
   results.push({ question, mode: value.mode, status: value.assistant.providerStatus, guide: value.assistant.guide, ms: Date.now() - start, sources: value.sources, text: value.text, attempts: replies.slice(before) });
  }
  const passed = results.every(r => r.mode === 'model');
  const receipt = { at: new Date().toISOString(), passed, companyAI: false, companySourceCount: 0, results };
  const out = path.resolve(__dirname, '../../docs/review-evidence-2026-10-29/assistant-rebuild'); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'public-providers.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2)); if (!passed) process.exitCode = 1;
 } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
