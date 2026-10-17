// LIVE check of the Nebius/Tavily features on Vamo fixture text and public pages only. It uses a temporary workspace,
// never the normal user data. Keys come from ../.env.local and are never printed. The receipt in dist/ records counts,
// model ids and verdicts; no keys and no prompts.
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local'), quiet: true });
const workspace = require('../src/workspace');
const rules = require('../src/rules');
const reviewAgent = require('../src/review-agent');
const publicCheck = require('../src/public-check');
const publicSite = require('../src/public-site');
const semantic = require('../src/semantic-index');
const briefing = require('../src/version-briefing');
const exercises = require('../src/rule-exercises');
const freshness = require('../src/source-freshness');

const nebiusKey = process.env.NEBIUS_API_KEY;
const tavilyKey = process.env.TAVILY_API_KEY;
if (!nebiusKey || !tavilyKey) throw new Error('NEBIUS_API_KEY and TAVILY_API_KEY must be set in .env.local.');
const site = process.argv[2] || 'https://docs.tavily.com/';

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-live-cloud-'));
const sources = path.join(__dirname, '..', 'sources');
const data = workspace.create(profile, 'Vamo', 'Demo Owner');
const imported = {};
for (const [name, version] of [['old-brief.md', '1'], ['current-brief.md', '2'], ['brand-and-legal.md', '1'], ['content-calendar.md', '1'], ['linkedin-campaign.md', '1']]) {
  const source = workspace.importFile(profile, data, path.join(sources, name), { department: 'Marketing', version, title: name.endsWith('brief.md') ? 'Winter Escapes brief' : name });
  Object.assign(source, { aiAllowed: true, confidentiality: 'internal' });
  imported[name] = source;
}
for (const name of ['old-brief.md', 'brand-and-legal.md', 'content-calendar.md', 'linkedin-campaign.md']) workspace.updateSource(data, imported[name].id, 'approved');
workspace.updateSource(data, imported['current-brief.md'].id, 'approved', 0, 'Brief v2', imported['old-brief.md'].id);
data.privacy = { companyAI: true, updatedBy: data.activePersonId, updatedAt: new Date().toISOString() };

const receipt = { verifiedAt: new Date().toISOString(), live: true, payload: 'Vamo fixture sources, synthetic draft, public pages', checks: {} };
let failed = 0;
async function check(name, fn) {
  try { receipt.checks[name] = { pass: true, ...(await fn()) }; console.log(`PASS ${name}`, JSON.stringify(receipt.checks[name])); }
  catch (error) { failed++; receipt.checks[name] = { pass: false, error: error.message }; console.error(`FAIL ${name}: ${error.stack}`); }
}
const must = (condition, message) => { if (!condition) throw new Error(message); };

(async () => {
  await check('ruleExtraction', async () => {
    const source = imported['brand-and-legal.md'];
    const text = fs.readFileSync(path.join(sources, 'brand-and-legal.md'), 'utf8');
    const { candidates, rejected } = await rules.extract(data, source, { key: nebiusKey });
    const invalid = candidates.filter(candidate => !rules.validCandidate(candidate, text));
    must(candidates.length > 0, `no valid candidates (${rejected} rejected)`);
    must(invalid.length === 0, `${invalid.length} candidates failed quote validation`);
    rules.propose(data, source, candidates);
    for (const rule of rules.pending(data)) rules.decide(data, rule.id, 'approved');
    return { candidates: candidates.length, rejectedByValidation: rejected, invalid: invalid.length, active: rules.active(data).length };
  });

  await check('reviewAgent', async () => {
    const draft = 'Subject: Winter Escapes\nDiscover winter city breaks with Vamo. Lowest prices guaranteed on every trip!';
    const result = await reviewAgent.reviewWithAgent(data, 'email', draft, nebiusKey);
    must(result.mode === 'agent', `mode was ${result.mode}: ${result.status}`);
    return { mode: result.mode, model: result.model, steps: result.steps.length, findings: result.findings.length, publicClaims: result.publicClaims.length };
  });

  await check('publicClaim', async () => {
    const result = await publicCheck.checkClaims(data, 'email', ['The Tivoli Gardens Christmas market in Copenhagen opens in November 2026.'], { tavilyKey, nebiusKey });
    const claim = result.claims[0];
    must(claim.results.length > 0, 'Tavily returned no results');
    return { method: result.method, verdict: claim.verdict, validatedSnippet: Boolean(claim.snippet), model: claim.model, results: claim.results.length };
  });

  await check('linkCheck', async () => {
    const url = 'https://en.wikipedia.org/wiki/Tivoli_Gardens';
    const result = await publicCheck.checkLinks(data, 'email', `Read more: ${url}`, [url], { tavilyKey });
    must(result[0].status !== 'unreachable', 'page unreachable');
    return { status: result[0].status, findings: result[0].findings.length };
  });

  await check('crawlAndCompare', async () => {
    await publicSite.configure(data, site);
    const pages = await publicSite.crawl(data, { key: tavilyKey, limit: 3 });
    must(pages > 0, 'crawl returned no pages');
    await publicSite.compare(data, { key: nebiusKey });
    return { site, pages, findings: data.publicSite.findings.length };
  });

  await check('semanticSearch', async () => {
    const built = await semantic.build(profile, data, { key: nebiusKey });
    const found = await semantic.search(profile, data, 'Can I promise the cheapest deal?', { key: nebiusKey });
    must(built.chunks > 0, 'no chunks indexed');
    must(found.mode === 'semantic' && found.results.length > 0, `search mode ${found.mode}`);
    return { chunks: built.chunks, model: built.model, mode: found.mode, results: found.results.length };
  });

  await check('handoverBriefing', async () => {
    const result = await briefing.brief(data, imported['old-brief.md'].id, { key: nebiusKey, useModel: true });
    must(result.replacement?.id === imported['current-brief.md'].id, 'wrong replacement');
    must(result.points.length > 0, 'no Nemotron points passed quote validation');
    return { changes: result.changes.length, nemotronPoints: result.points.length, model: result.model };
  });

  await check('practiceDrafts', async () => {
    const added = await exercises.generate(data, { key: nebiusKey, useModel: true });
    const byNemotron = added.filter(item => item.origin === 'nemotron').length;
    must(byNemotron > 0, `no Nemotron practice drafts (${added.length} template drafts)`);
    return { added: added.length, byNemotron };
  });

  await check('freshness', async () => {
    const rule = rules.active(data).find(item => item.kind === 'claim-forbidden') || rules.active(data)[0];
    must(rule, 'no active rule to mark');
    freshness.mark(data, { sourceId: rule.sourceId, quote: rule.quote, query: 'EU rules on price claims in advertising' });
    const count = await freshness.run(data, { tavilyKey, nebiusKey });
    const last = freshness.snapshot(data).dependencies[0]?.lastCheck;
    must(last && !/could not finish/.test(last.explanation), last?.explanation || 'no check recorded');
    return { checked: count, verdict: last.verdict, results: last.results.length, method: last.method };
  });

  fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'dist', 'live-cloud-receipt.json'), JSON.stringify(receipt, null, 2));
  fs.rmSync(profile, { recursive: true, force: true });
  console.log(`${failed ? 'FAILED' : 'PASSED'}: ${Object.keys(receipt.checks).length - failed}/${Object.keys(receipt.checks).length} live checks. Receipt: dist/live-cloud-receipt.json`);
  process.exit(failed ? 1 : 0);
})();
