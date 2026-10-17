// LIVE Electron run of the Nebius/Tavily features through the app windows, in a temporary profile with Vamo fixture
// sources only. Real requests go to Nebius Token Factory and Tavily. Screenshots go to AVERILL_SCREENSHOTS if set.
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');

const out = process.env.AVERILL_SCREENSHOTS || '';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-cloud-ui-'));
const sources = path.join(__dirname, '..', 'sources');
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

// Real keys come from ../.env.local through main.js. Network calls are counted, never logged.
let calls = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = (...args) => { calls++; return realFetch(...args); };
const site = process.argv.find(arg => arg.startsWith('https://')) || 'https://docs.tavily.com/';

app.setPath('userData', profile);
require('../main.js');
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
    // window.__hold keeps the next dialog open so its real text and layout can be captured.
    await run("window.__hold=false;const __confirm=confirmOutbound;confirmOutbound=async options=>{window.__lastOutbound=options;const p=__confirm(options);if(!window.__hold)el('outbound-send').click();return p;};0");
    await run('window.desktop.aiMode(true).then(s=>{current=s;render();})');
    agent.setSize(960, 900); await pause(300);

    // Rules: extract, approve, see them in Knowledge.
    await run("showTab('knowledge')"); await pause(400);
    assert.ok(await run("el('rules-panel').textContent.includes('Company rules')"), 'rules panel renders');
    const extracted = await run(`window.desktop.extractRules(${JSON.stringify(imported['brand-and-legal.md'].id)}, true)`);
    assert.ok(extracted.added > 0, 'Nemotron proposed validated rules');
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
    assert.ok(briefing.points.length > 0, 'Nemotron briefing points passed quote validation');

    // Practice: draft, approve, answer.
    const drafted = await run('window.desktop.generatePractice(true)');
    assert.ok(drafted.added > 0);
    assert.ok(drafted.pending.some(item => item.origin === 'nemotron'), 'some practice drafted by Nemotron');
    for (const item of drafted.pending) await run(`window.desktop.decidePractice(${JSON.stringify(item.id)}, 'approved')`);
    await run("practiceRenderKey=null;showTab('learn');renderPractice()"); await pause(400);
    assert.ok(await run("el('practice-section').querySelectorAll('.rule-card').length>0"));
    await shot('learn-practice');

    // Public website vs approved sources.
    await run("showTab('setup')"); await pause(200);
    await run(`window.desktop.configureSite(${JSON.stringify(site)}).then(s=>{current=s;render();})`); await pause(200);
    const crawled = await run('window.desktop.crawlSite()');
    assert.ok(crawled.publicSite.pages.length > 0, 'Tavily crawl returned pages');
    await run('current=' + JSON.stringify(crawled) + ';siteRenderKey=null;render()'); await pause(300);
    assert.ok(await run("el('public-site-section').textContent.length > 0"));
    await run("el('public-site-section').scrollIntoView()"); await shot('setup-public-site');

    // Review result with agent steps and a public check.
    await run("showTab('review')"); await pause(200);
    const synthetic = { mode: 'agent', provider: 'Nebius Token Factory', model: 'nvidia/nemotron-3-super-120b-a12b', findings: [], uncheckedFields: [], status: 'No exact rule conflict found.', steps: [{ label: 'Checked approved rules locally' }, { label: 'Read 12 approved rules for this work type' }, { label: 'Nemotron proposed 0 findings · 0 passed exact-quote validation' }], publicClaims: ['Copenhagen Christmas markets open on 14 November.'] };
    await run(`(()=>{const out=el('review-work-result')||el('external-task-result');drawTaskReview(out,${JSON.stringify(synthetic)});out.querySelector('.agent-steps').open=true;})()`); await pause(200);
    const target = await run("el('review-work-result')?'review-work-result':'external-task-result'");
    assert.ok(await run(`el('${target}').textContent.includes('How Averill checked this')`));
    assert.ok(await run(`el('${target}').textContent.includes('PUBLIC CHECK')`));
    await run('window.__hold=true');
    await run(`el('${target}').querySelector('.public-check button').click()`); await pause(400);
    assert.ok(await run("el('outbound-dialog').open"), 'outbound dialog opens before Tavily');
    assert.ok(await run("[...el('outbound-items').querySelectorAll('label, textarea')].some(node=>(node.value||node.textContent).includes('Copenhagen Christmas markets'))"), 'dialog lists the exact claim');
    for (const [width, height] of [[440, 660], [960, 820]]) {
      agent.setSize(width, height); await pause(400);
      const overflow = await run("(()=>{const d=el('outbound-dialog').getBoundingClientRect();return d.right>innerWidth+1||d.bottom>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1})()");
      assert.ok(!overflow, `outbound dialog fits at ${width}x${height}`);
      await shot(`outbound-${width}x${height}`);
    }
    await run("window.__hold=false;el('outbound-send').click()");
    const verdicts = ['Public sources support this', 'Public sources contradict this', 'Public sources are unclear'];
    const hasVerdict = () => run(`${JSON.stringify(verdicts)}.some(text=>el('${target}').textContent.includes(text))`);
    for (let i = 0; i < 600 && !(await hasVerdict()); i++) await pause(100);
    assert.ok(await hasVerdict(), 'live public-check verdict shown');
    await pause(800);
    await shot('review-public-check');

    // Freshness: mark a rule, run, see the queue entry.
    const rulesNow = await run('window.desktop.listRules()');
    const disclosure = rulesNow.active.find(rule => rule.value && rule.kind === 'claim-forbidden');
    await run(`window.desktop.markDependency({sourceId:${JSON.stringify(disclosure.sourceId)},quote:${JSON.stringify(disclosure.quote)},query:'EU price claim advertising rules'})`);
    const fresh = await run('window.desktop.runFreshness()');
    assert.equal(fresh.dependencies.length, 1);
    assert.ok(fresh.dependencies[0].lastCheck);

    const snapshot = await run('window.desktop.snapshot()');
    assert.ok(snapshot.cloudActivity.mine.length > 0, 'cloud calls are logged for this person');
    assert.ok(!JSON.stringify(snapshot.cloudActivity).includes('Copenhagen'), 'activity log has no payload text');
    assert.deepEqual(errors, [], `renderer errors: ${errors.join(' | ')}`);
    console.log(`PASS LIVE rules, semantic Knowledge, handover briefing, practice, public website, Review agent steps and public check, freshness and activity log (${calls} live network calls)`);
    app.quit();
  } catch (error) { console.error(error.stack, errors); app.exit(1); }
});
