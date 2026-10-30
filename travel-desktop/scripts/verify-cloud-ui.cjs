// Electron smoke for the Nebius/Tavily features with FAKE network responses. No key, company file or user data leaves
// this machine: global fetch and DNS checks are replaced before main.js loads.
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = process.env.AVERILL_NATIVE_APP || path.resolve(__dirname, '..');
const workspace = require(path.join(root, 'src/workspace'));
const remote = require(path.join(root, 'src/remote-import'));

const out = process.env.AVERILL_SCREENSHOTS || '';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-cloud-ui-'));
const sources = path.join(root, 'sources');
const company = workspace.create(profile, 'Vamo', 'Demo Owner');
const imported = {};
for (const [name, version] of [['old-brief.md', '1'], ['current-brief.md', '2'], ['brand-and-legal.md', '1'], ['content-calendar.md', '1'], ['linkedin-campaign.md', '1']]) {
  const source = workspace.importFile(profile, company, path.join(sources, name), { department: 'Marketing', version, title: name === 'old-brief.md' || name === 'current-brief.md' ? 'Winter Escapes brief' : name });
  Object.assign(source, { aiAllowed: true, confidentiality: 'internal' });
  imported[name] = source;
}
workspace.updateSource(company, imported['old-brief.md'].id, 'approved');
for (const name of ['brand-and-legal.md', 'content-calendar.md', 'linkedin-campaign.md']) workspace.updateSource(company, imported[name].id, 'approved');
workspace.updateSource(company, imported['current-brief.md'].id, 'approved', 0, 'Brief v2', imported['old-brief.md'].id);
company.privacy = { companyAI: true, updatedBy: company.activePersonId, updatedAt: new Date().toISOString() };
workspace.save(profile, company);

process.env.NEBIUS_API_KEY = 'fake-nebius';
process.env.TAVILY_API_KEY = 'fake-tavily';
remote.target = async value => { const url = new URL(value); if (url.protocol !== 'https:') throw new Error('Use an HTTPS link.'); return { url, address: { address: '93.184.216.34', family: 4 } }; };
const ok = body => ({ ok: true, status: 200, json: async () => body });
const calls = [];
globalThis.fetch = async (url, options = {}) => {
  const body = options.body ? JSON.parse(options.body) : {};
  calls.push({ url: String(url), purpose: body.messages?.[0]?.content?.slice(0, 40) || body.query || '' });
  if (String(url).endsWith('/models')) return ok({ data: [{ id: 'nvidia/nemotron-3-super-120b-a12b' }, { id: 'nvidia/embed-test' }] });
  if (String(url).endsWith('/embeddings')) return ok({ data: body.input.map((text, index) => ({ index, embedding: [/price|guarantee|promise/i.test(text) ? 1 : 0, /footer|unsubscribe/i.test(text) ? 1 : 0, 0.1] })) });
  if (String(url).includes('tavily.com/crawl')) return ok({ results: [{ url: 'https://vamo.example/winter', raw_content: 'Winter escapes from Vamo. Lowest prices guaranteed on every city break.' }] });
  if (String(url).includes('tavily.com/search')) return ok({ answer: '', results: [{ title: 'Visit Copenhagen', url: 'https://visit.example/markets', content: 'The Tivoli Christmas market opens on 15 November 2026.' }] });
  const system = body.messages?.[0]?.content || '';
  const user = body.messages?.[1]?.content || '';
  let content = '{}';
  if (system.startsWith('Extract company content rules')) content = JSON.stringify({ rules: [{ kind: 'claim-approved', task: 'any', value: 'Discover curated winter city breaks.', quote: 'Approved lead: "Discover curated winter city breaks."' }] });
  else if (system.startsWith('Write a short handover briefing')) content = JSON.stringify({ points: [{ text: 'The audience changed to Denmark-based subscribers.', old_quote: '', new_quote: user.match(/Field requirement: email \| audience \| "[^"]+"/)?.[0] || '' }] });
  else if (system.startsWith('Write one multiple-choice')) content = '{}';
  else if (system.startsWith('Compare PUBLIC PAGE')) content = JSON.stringify({ findings: [] });
  else if (system.startsWith('You compare one public claim')) content = JSON.stringify({ verdict: 'contradicted', url: 'https://visit.example/markets', snippet: 'opens on 15 November 2026', explanation: 'The public page gives 15 November.' });
  return ok({ choices: [{ message: { content } }] });
};

app.setPath('userData', profile);
require(path.join(root, 'main.js'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

app.whenReady().then(async () => {
  const errors = [];
  try {
    let agent;
    for (let attempt = 0; attempt < 100; attempt++) {
      agent = BrowserWindow.getAllWindows().find(window => window.webContents.getURL().includes('agent.html'));
      if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break;
      await pause(100);
    }
    agent.webContents.on('console-message', (_event, level, message) => { if (level >= 3) errors.push(message); });
    const run = script => agent.webContents.executeJavaScript(script);
    const shot = async name => { if (!out) return; fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, `${name}.png`), (await agent.webContents.capturePage()).toPNG()); };
    // The outbound dialog resolves as if the employee pressed "Send selected".
    await run("window.__autoSend=true;const __confirm=confirmOutbound;confirmOutbound=async options=>{window.__lastOutbound=options;const p=__confirm(options);el('outbound-send').click();return p;};0");
    await run('window.desktop.aiMode(true).then(s=>{current=s;render();})');
    agent.setSize(960, 900); await pause(300);

    // Rules: extract, approve, see them in Knowledge.
    await run("showTab('knowledge')"); await pause(400);
    assert.ok(await run("el('rules-panel').textContent.includes('Company rules')"), 'rules panel renders');
    const extracted = await run(`window.desktop.extractRules(${JSON.stringify(imported['brand-and-legal.md'].id)}, true)`);
    assert.equal(extracted.added, 1);
    const pending = extracted.rules.pending[0];
    await run(`window.desktop.decideRule(${JSON.stringify(pending.id)}, 'approved', null, '')`);
    await run('rulesRenderKey=null;renderRules()'); await pause(300);
    assert.ok(await run("el('rules-panel').textContent.includes('Rules in use')"));
    await run("document.querySelector('.rules-section').open=true;document.querySelectorAll('.rules-section details').forEach(d=>d.open=true)"); await pause(100);
    await shot('knowledge-rules');

    // Semantic index and search by meaning.
    const built = await run('window.desktop.buildKnowledgeIndex()');
    assert.ok(built.chunks > 0);
    const found = await run("window.desktop.semanticSearch('Can I promise the cheapest deal?')");
    assert.equal(found.mode, 'semantic');
    await run("el('knowledge-search').value='Can I promise the cheapest deal?';renderSemantic()"); await pause(400);
    assert.ok(await run("el('knowledge-semantic').textContent.includes('Best matching passages')"));
    await shot('knowledge-semantic');

    // Handover briefing for the superseded brief.
    const briefing = await run(`window.desktop.versionBriefing(${JSON.stringify(imported['old-brief.md'].id)}, true)`);
    assert.equal(briefing.replacement.id, imported['current-brief.md'].id);
    assert.ok(briefing.changes.some(change => change.kind === 'audience' && change.type === 'stated'), JSON.stringify(briefing.changes));
    assert.equal(briefing.points.length, 1);

    // Practice: draft, approve, answer.
    const drafted = await run('window.desktop.generatePractice(false)');
    assert.ok(drafted.added > 0);
    for (const item of drafted.pending) await run(`window.desktop.decidePractice(${JSON.stringify(item.id)}, 'approved')`);
    await run("practiceRenderKey=null;showTab('learn');renderPractice()"); await pause(400);
    assert.ok(await run("el('practice-section').querySelectorAll('.rule-card').length>0"));
    await shot('learn-practice');

    // Public website vs approved sources.
    await run("showTab('setup')"); await pause(200);
    await run("window.desktop.configureSite('https://vamo.example/').then(s=>{current=s;render();})"); await pause(200);
    const crawled = await run('window.desktop.crawlSite()');
    assert.ok(crawled.publicSite.findings.some(item => /lowest prices guaranteed/i.test(item.pageQuote)));
    await run('current=' + JSON.stringify(crawled) + ';siteRenderKey=null;render()'); await pause(300);
    assert.ok(await run("el('public-site-section').textContent.includes('Website disagrees')"));
    await run("el('public-site-section').scrollIntoView()"); await shot('setup-public-site');

    // Review result with agent steps and a public check.
    await run("showTab('review')"); await pause(200);
    const synthetic = { mode: 'agent', provider: 'Nebius Token Factory', model: 'nvidia/nemotron-3-super-120b-a12b', findings: [], uncheckedFields: [], status: 'No exact rule conflict found.', steps: [{ label: 'Checked approved rules locally' }, { label: 'Read 12 approved rules for this work type' }, { label: 'Nemotron proposed 0 findings · 0 passed exact-quote validation' }], publicClaims: ['Copenhagen Christmas markets open on 14 November.'] };
    // Bind the result to a review like the app does, so the re-render after the public check (activity log) keeps it.
    await run(`(()=>{const out=el('review-work-result')||el('external-task-result');const result=${JSON.stringify(synthetic)};if(out.id==='review-work-result'){externalReview={identity:workIdentity(),result};render();}else drawTaskReview(out,result);out.querySelector('.agent-steps').open=true;})()`); await pause(200);
    const target = await run("el('review-work-result')?'review-work-result':'external-task-result'");
    assert.ok(await run(`el('${target}').textContent.includes('How Averill checked this')`));
    assert.ok(await run(`el('${target}').textContent.includes('PUBLIC CHECK')`));
    await run(`el('${target}').querySelector('.public-check button').click()`);
    for (let i = 0; i < 40 && !(await run(`el('${target}').textContent.includes('Public sources contradict this')`)); i++) await pause(100);
    assert.ok(await run(`el('${target}').textContent.includes('Public sources contradict this')`));
    const publicCard = await run(`el('${target}').querySelector('.public-verdict').textContent`);
    assert(publicCard.includes('The public page gives 15 November.'), publicCard);
    assert(publicCard.includes('opens on 15 November 2026'), publicCard);
    assert(!publicCard.includes('line is not defined'), publicCard);
    assert.ok(await run(`document.querySelector('.online-check-list').textContent.includes('The public page gives 15 November.')`), 'last public check retains the same explanation');

    await pause(800);
    await shot('review-public-check');

    // Freshness: mark a rule, run, see the queue entry.
    const rulesNow = await run('window.desktop.listRules()');
    const disclosure = rulesNow.active.find(rule => rule.value && rule.kind === 'claim-forbidden');
    await run(`window.desktop.markDependency({sourceId:${JSON.stringify(disclosure.sourceId)},quote:${JSON.stringify(disclosure.quote)},query:'EU price claim advertising rules'})`);
    const fresh = await run('window.desktop.runFreshness()');
    assert.equal(fresh.dependencies.length, 1);
    assert.ok(fresh.dependencies[0].lastCheck);
    // Weekly opt-in: the checkbox renders for the admin and saves the schedule.
    await run("showTab('knowledge');rulesRenderKey=null;renderRules()"); await pause(500);
    assert.ok(await run("Boolean(document.querySelector('.rules-weekly input'))"), 'weekly checkbox renders');
    await run("document.querySelector('.rules-weekly input').click()"); await pause(500);
    assert.equal((await run('window.desktop.freshnessSnapshot()')).schedule.enabled, true, 'weekly schedule saved');
    assert.ok(await run("document.querySelector('.rules-weekly input').checked"));

    const snapshot = await run('window.desktop.snapshot()');
    assert.ok(snapshot.cloudActivity.mine.length > 0, 'cloud calls are logged for this person');
    assert.ok(!JSON.stringify(snapshot.cloudActivity).includes('Copenhagen'), 'activity log has no payload text');
    assert.ok(calls.every(call => !call.purpose.includes('fake-')), 'keys never appear in payloads');
    assert.deepEqual(errors, [], `renderer errors: ${errors.join(' | ')}`);
    console.log(`PASS rules, semantic Knowledge, handover briefing, practice, public website, Review agent steps and public check, freshness and activity log (${calls.length} faked network calls)`);
    app.quit();
  } catch (error) { console.error(error.stack, errors); app.exit(1); }
});
