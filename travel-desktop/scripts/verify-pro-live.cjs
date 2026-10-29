// Live smoke uses generated synthetic policy/draft only. Never reads userData or imported company content.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });
const workspace = require('../src/workspace');
const { WorkAssistant } = require('../src/work-assistant');
const nebius = require('../src/nebius'), tavily = require('../src/tavily');
(async () => {
  if (!process.argv.includes('--synthetic-consent')) throw new Error('Use --synthetic-consent for generated synthetic text and public tool queries only.');
  const nebiusKey = process.env.NEBIUS_API_KEY, tavilyKey = process.env.TAVILY_API_KEY;
  if (!nebiusKey || !tavilyKey) throw new Error('Live provider keys are unavailable in the local development configuration.');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-pro-live-'));
  try {
    const data = workspace.create(root, 'Synthetic Vamo verification', 'Synthetic owner');
    const file = path.join(root, 'synthetic-brief.md');
    fs.writeFileSync(file, 'Approved lead: "Discover curated winter city breaks".\nWinter Escapes 2027 covers Copenhagen, Vienna and Prague.\nDo not claim "lowest prices guaranteed".\nAudience: Travel subscribers, Denmark.\nCTA: Explore the winter collection.\n');
    const source = workspace.importFile(root, data, file, { department: 'Marketing', version: '2' });
    workspace.updateSource(data, source.id, 'approved'); source.aiAllowed = true; data.privacy = { companyAI: true };
    const assistant = new WorkAssistant(), calls = [];
    const liveFetch=global.fetch; const debugReplies=[];
    const fetcher=process.env.AVERILL_SYNTHETIC_DEBUG==='1'?async(url,options)=>{const response=await liveFetch(url,options);if(url.includes('/chat/completions')){const value=await response.clone().json();debugReplies.push(value.choices?.[0]?.message?.content);fs.writeFileSync('/tmp/averill-design-basics-synthetic-replies.json',JSON.stringify(debugReplies,null,2));}return response;}:undefined;
    const a = nebius.onCall(entry => calls.push(entry)), b = tavily.onCall(entry => calls.push(entry));
    const results = [];
    for (const [question, task, context] of [
      ['Write a truthful marketing email for Winter Escapes 2027 with at least 200 body characters and one CTA.', 'email', 'Our lowest prices guaranteed.'],
      ['How do I group elements in Canva?', 'canva', ''],
      ['How do I align two text elements in Canva?', 'canva', ''],
      ['How do I create a frame in Canva?', 'canva', ''],
    ]) {
      if(process.argv.includes('--design-basics')&&!/frame/.test(question))continue;
      if(/frame/.test(question))data.sources=[]; // Prove public help works without any company source.
      if(process.argv.includes('--public-help'))data.privacy={companyAI:false};
      const options = { task, context, nebiusKey: process.argv.includes('--public-help') ? '' : nebiusKey, publicNebiusKey: process.argv.includes('--public-help') ? nebiusKey : '', tavilyKey, fetcher };
      const preview = await assistant.answer(data, question, options);
      if (!preview.consentRequired) throw new Error('Outbound consent was not offered.');
      const before = calls.length, started = Date.now();
      const result = await assistant.answer(data, question, { ...options, consent: true });
      results.push({ question, companySources: data.sources.length, task, companyAI: data.privacy.companyAI, publicOnly: result.assistant.publicOnly, intent: result.assistant.intent, mode: result.mode, sourceCount: result.sources.length, publicSources: result.sources.filter(s => s.kind === 'public-help').length, characters: result.text.length, ms: Date.now() - started, calls: calls.slice(before).map(({ service, purpose, ok, status, model }) => ({ service, purpose, ok, status, model })) });
    }
    a(); b();
    const receipt = { verifiedAt: new Date().toISOString(), payload: 'Generated synthetic company brief/draft; generic public Canva help queries only', live: true, results, passed: results.every(r => r.mode === 'model' && r.sourceCount > 0) };
    fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../dist/pro-live-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt, null, 2));
    if (!receipt.passed) process.exitCode = 1;
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
