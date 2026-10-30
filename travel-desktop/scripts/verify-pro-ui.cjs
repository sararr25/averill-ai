// Actual renderer/IPC/orchestration on disposable synthetic data; provider transport is mocked.
const { app, BrowserWindow, nativeTheme } = require('electron');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
const APP = process.env.AVERILL_NATIVE_APP || path.resolve(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-pro-ui-'));
app.setPath('userData', profile); process.env.AVERILL_CONNECT_PORT = '0';
process.env.NEBIUS_API_KEY = 'synthetic-ui-key'; process.env.TAVILY_API_KEY = 'synthetic-ui-key';
const workspace = require(APP + '/src/workspace');
const data = workspace.create(profile, 'Synthetic Vamo Pro QA', 'Synthetic owner');
data.privacy = { companyAI: true };
const file = path.join(profile, 'synthetic-brief.md');
fs.writeFileSync(file, 'Approved lead: "Discover curated winter city breaks".\nWinter Escapes 2027 covers Copenhagen, Vienna and Prague.\nDo not claim "lowest prices guaranteed".\nAudience: Travel subscribers, Denmark.\n');
const source = workspace.importFile(profile, data, file, { department: 'Marketing', version: '2' });
workspace.updateSource(data, source.id, 'approved'); source.aiAllowed = true;
const tailQuote='Reimbursement deadline: Submit receipts within seven business days.';
const handbook=path.join(profile,'handbook.md');
fs.writeFileSync(handbook,'# Employee handbook\n\n'+'Neutral reference material.\n'.repeat(700)+'\n[PDF page 7]\n## Expenses\n'+tailQuote);
const handbookSource=workspace.importFile(profile,data,handbook,{title:'Employee handbook',department:'Marketing',version:'1'});
workspace.updateSource(data,handbookSource.id,'approved');handbookSource.aiAllowed=true;handbookSource.purpose='company-reference';
workspace.save(profile, data);
let calls = 0, healthCalls = 0;
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  const u = new URL(url);
  if (u.hostname === '127.0.0.1') return originalFetch(url, options);
  if (!u.pathname.endsWith('/models')) calls++;
  if (u.hostname === 'api.tavily.com') {
    const body = JSON.parse(options.body); assert(!body.query.includes('Synthetic Vamo'));
    return new Response(JSON.stringify({ results: [{ title: 'Canva official grouping help', url: 'https://www.canva.com/help/group/', content: 'Select both elements, then choose Group in the editor toolbar. Choose Ungroup to separate them.' }] }));
  }
  assert.equal(u.hostname, 'api.tokenfactory.nebius.com');
  if (u.pathname.endsWith('/models')) { healthCalls++;return new Response(JSON.stringify({ data: [{ id: 'nvidia/Nemotron-ui' }] })); }
  const input = JSON.parse(JSON.parse(options.body).messages.at(-1).content), s = input.sources[0];
  if(input.intent?.kind==='company-answer')return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({answer:tailQuote,evidence:[{source_id:handbookSource.id,quote:tailQuote}]})}}]}));
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ answer: (input.intent?.kind === 'tool-help' || input.question?.startsWith('Explain how to')) ? 'Select both elements, then choose Group in the editor toolbar. Move them together to check the result yourself. Averill cannot verify grouping from this reading.' : 'Hello traveller,\n\nDiscover curated winter city breaks in Copenhagen, Vienna and Prague with Winter Escapes 2027. Explore the collection, consider the destination that interests you and find inspiration for your next short break. Read the collection details and choose what you would like to discover next.\n\nExplore the winter collection.\n\nThe team', evidence: [{ source_id: s.id, quote: s.text.slice(0, 500) }] }) } }] }));
};
require(APP + '/main.js');
const pause = ms => new Promise(r => setTimeout(r, ms));
const checks = [], out = process.env.OUT || '';
if (out) fs.mkdirSync(out, { recursive: true });
app.whenReady().then(async () => {
  try {
    let win;
    for (let i = 0; i < 100; i++) { win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html')); if (win && !win.webContents.isLoading() && await win.webContents.executeJavaScript('Boolean(window.desktop)')) break; await pause(100); }
    const run = js => win.webContents.executeJavaScript(js), errors = [];
    win.webContents.on('console-message', (_e, level, message) => { if (level >= 3) errors.push(message); });
    await run("window.desktop.enableAccounts('owner@synthetic.example','Synthetic-password-123')");
    assert.equal((await run('window.desktop.snapshot()')).services.connection.status,'connected');assert.equal(healthCalls,1);
    await run("(async()=>{current=await window.desktop.snapshot();render();showTab('review');})()");
    await run("showTab('todo');void 0");
    assert.equal(await run("document.querySelectorAll('.todo-start-actions button').length"),3);
    assert.equal(await run("document.querySelector('[data-tab-button=research]').closest('.nav-more')"),null);
    await run("[...document.querySelectorAll('.todo-start-actions button')].find(b=>b.textContent==='Ask a question').click();void 0");
    assert(await run("document.activeElement===document.getElementById('question')"));
    await run("showTab('todo');[...document.querySelectorAll('.todo-start-actions button')].find(b=>b.textContent==='Check my work').click();void 0");
    assert(await run("document.body.dataset.area==='setup'&&document.getElementById('work-controls').open"));
    await run("showTab('todo');[...document.querySelectorAll('.todo-start-actions button')].find(b=>b.textContent==='Learn a tool').click();void 0");
    assert(await run("document.body.dataset.area==='learn'"));
    if(out){await run("showTab('todo');void 0");await pause(300);fs.writeFileSync(path.join(out,'home-start-actions.png'),(await win.webContents.capturePage()).toPNG());}
    await run("showTab('review');void 0");
    checks.push('Home provides Ask, Check and Learn starting actions; Public research is visible in primary navigation');
    await run("document.querySelector('#guide-offer button')?.click();void 0");
    assert(await run("document.getElementById('review-chat').open"));
    assert(await run("document.querySelectorAll('#role-playbooks button').length >= 2"));
    checks.push('Current work opens help and role task choices without library navigation');
    const submit = async question => { await run(`document.getElementById('question').value=${JSON.stringify(question)};updateSend();document.getElementById('ask-form').requestSubmit();void 0`); };
    const until = async expression => { for (let i = 0; i < 100; i++) { if (await run(expression)) return; await pause(60); } throw new Error('Timeout: ' + expression); };
    await submit('How do I group elements in Canva?');
    await until("document.getElementById('outbound-dialog').open");
    const preview = await run("document.getElementById('outbound-items').textContent");
    assert(preview.includes('Canva group and ungroup elements desktop official help')); assert(!preview.includes('[object Object]')); assert.equal(calls, 0);
    await run("document.getElementById('outbound-send').click();void 0");
    await until("[...document.querySelectorAll('#conversation button')].some(b=>b.textContent==='I tried this · save to my practice')");
    assert.match(await run("document.getElementById('conversation').textContent"), /Group in the editor toolbar/);
    assert.match(await run("document.getElementById('conversation').textContent"), /Official tool help/);
    checks.push('Outbound preview shows exact public query and actual text, then a sourced functional answer appears');
    win.setSize(620, 900);
    for (const theme of ['light', 'dark']) { nativeTheme.themeSource = theme; await pause(100); if (out) fs.writeFileSync(path.join(out, `pro-help-${theme}.png`), (await win.webContents.capturePage()).toPNG()); }
    await run("[...document.querySelectorAll('#conversation button')].find(b=>b.textContent==='I tried this · save to my practice').click();void 0");
    await until("document.getElementById('conversation').textContent.includes('Saved as your confirmed practice')");
    const beforeLearn = calls;
    await run("window.desktop.learningAction('quiz')");
    const quiz = await run("(async()=>{const s=await window.desktop.snapshot();return s.learning.quiz})()");
    assert.equal(quiz.questions.length, 1); assert.match(quiz.questions[0].prompt, /groups them in Canva/); assert(!JSON.stringify(quiz).includes('correct'));
    await run("(async()=>{current=await window.desktop.snapshot();render();showTab('learn');})()");
    for (const theme of ['light', 'dark']) { nativeTheme.themeSource = theme; await pause(100); if (out) fs.writeFileSync(path.join(out, `pro-practice-${theme}.png`), (await win.webContents.capturePage()).toPNG()); }
    assert.equal(calls, beforeLearn); checks.push('One explicit confirmation records own grouping practice; offline quiz contains only the relevant visual question');
    await run("showTab('review');void 0");
    const beforePartial = calls;
    await submit('How do I align text in Canva?'); await until("document.getElementById('outbound-dialog').open");
    await run("document.querySelector('#outbound-items input').checked=false;document.getElementById('outbound-send').click();void 0");
    await until("!asking"); assert.equal(calls, beforePartial); checks.push('Partial outbound selection keeps assistance local; unchecked inputs never leave');
    await submit('Write a truthful marketing email with at least 200 main body characters.'); await until("document.getElementById('outbound-dialog').open");
    await run("document.getElementById('outbound-send').click();void 0"); await until('!asking');
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"), /Discover curated winter city breaks/);
    checks.push('Marketing draft reaches the real renderer with exact source evidence and complete supported copy');
    const keepLocal = async question => {
      await submit(question); await until("document.getElementById('outbound-dialog').open");
      await run("document.getElementById('outbound-cancel').click();void 0"); await until('!asking');
      return run("document.getElementById('conversation').lastElementChild.textContent");
    };
    const beforeNatural = calls;
    assert.match(await keepLocal('Voglio mettere una foto dentro una forma in Canva'), /Drag an image into the frame/);
    assert.match(await keepLocal('È leggibile questo testo?'), /readable against the background/);
    assert.equal(calls, beforeNatural);
    checks.push('Natural Italian frame and readability goals use local tool help after declining the outbound preview');
    await submit('Riassumi il documento'); await until('!asking');
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"), /Which document/);
    await submit('Come cambio il colore?'); await until('!asking');
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"), /Which tool/);
    assert.equal(calls, beforeNatural);
    checks.push('Summary requests ask for their document; missing tool offers a specific choice without online calls');
    if(out)fs.writeFileSync(path.join(out,'intent-recovery.png'),(await win.webContents.capturePage()).toPNG());
    await submit('What is the reimbursement deadline?');await until("document.getElementById('outbound-dialog').open");
    const tailPreview=await run("document.getElementById('outbound-items').textContent");
    assert(tailPreview.includes(tailQuote));assert(!tailPreview.includes('Neutral reference material'));
    await run("document.getElementById('outbound-send').click();void 0");await until('!asking');
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"),/Submit receipts within seven business days/);
    checks.push('Company question previews and answers the relevant passage after 12000 characters rather than the document prefix');
    const beforeSummary=calls;await submit('Summarize Employee handbook');await until('!asking');
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"),/Expenses:/);
    assert.match(await run("document.getElementById('conversation').lastElementChild.textContent"),/Submit receipts within seven business days/);
    assert.equal(calls,beforeSummary);
    checks.push('Source overview retains late document sections and clearly labelled exact excerpts without a provider call');
    if(process.env.AB_VARIANT==='A')await run("document.getElementById('conversation').lastElementChild.scrollIntoView({block:'start'});void 0");
    await pause(350);
    assert(await run("(()=>{const r=document.getElementById('conversation').lastElementChild.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0})()"));
    if(out)fs.writeFileSync(path.join(out,'long-source-summary.png'),(await win.webContents.capturePage()).toPNG());
    const metrics=await run("({visibleMessages:[...document.querySelectorAll('#conversation>.user-message,#conversation>.assistant-message')].filter(e=>e.getClientRects().length).length,indexedQuestions:document.querySelectorAll('#conversation-links button').length,workViews:document.querySelectorAll('button[data-work-view]').length})");
    if(await run("Boolean(document.getElementById('conversation-links'))")){
      await run("document.querySelector('#conversation-links button').click();void 0");
      assert(await run("!document.querySelector('#conversation>.user-message').hidden"));
      checks.push('Indexed prior question reopens its answer without displaying the entire transcript');
    }
    await run("showTab('knowledge');void 0");await until("document.querySelectorAll('#knowledge-list>.knowledge-card').length>=2");
    metrics.libraryHeight=await run("document.getElementById('knowledge-list').getBoundingClientRect().height");
    if(out)fs.writeFileSync(path.join(out,'technical-metrics.json'),JSON.stringify({variant:process.env.AB_VARIANT||'B',scope:'Synthetic task/DOM measures, not human task speed',metrics},null,2));
    await run('window.desktop.logout()'); assert.equal(await run("document.querySelectorAll('#role-playbooks button').length"), 0); if(await run("Boolean(document.getElementById('conversation-links'))"))assert.equal(await run("document.querySelectorAll('#conversation-links button').length"),0);checks.push('Logout clears role tasks and private conversation');
    assert.deepEqual(errors, []);
    console.log(checks.map(s => 'PASS ' + s).join('\n')); console.log(`${checks.length} Pro renderer checks passed; synthetic provider transport, not real-platform acceptance.`);
    app.exit(0);
  } catch (error) { console.error(error.stack || error); app.exit(1); }
});
