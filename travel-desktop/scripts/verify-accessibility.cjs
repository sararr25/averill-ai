// Authenticated role/source-state and renderer accessibility matrix; VoiceOver is separate.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const workspace = require('../src/workspace'), accounts = require('../src/accounts');
const profile = fs.mkdtempSync('/tmp/averill-accessibility-');
const out = process.env.OUT || ''; if (out) fs.mkdirSync(out, { recursive: true });
const checks = [];
process.env.NEBIUS_API_KEY='';process.env.TAVILY_API_KEY='';
const localFetch=global.fetch;global.fetch=(url,options)=>{assert.equal(new URL(url).hostname,'127.0.0.1');return localFetch(url,options)};
(async () => {
  const data = workspace.create(profile, 'Synthetic accessibility matrix', 'QA Owner');
  const people = [data.people[0], workspace.addPerson(data, 'QA Lead', 'lead', 'Marketing'), workspace.addPerson(data, 'QA Writer', 'employee', 'Marketing'), workspace.addPerson(data, 'QA Operations', 'employee', 'Operations')];
  for (const [index, person] of people.entries()) await accounts.configure(data, person.id, `qa${index}@synthetic.example`, 'Synthetic-password-123', ['owner','marketing_manager','content_creator','employee'][index]);
  function source(title, state, options = {}) {
    const file = path.join(profile, `${data.sources.length}.md`); fs.writeFileSync(file, `Synthetic ${title}: approved travel guidance ${data.sources.length}.`);
    const result = workspace.importFile(profile, data, file, { title, department: 'Marketing', ...options });
    if (state !== 'pending' && options.scope !== 'private') workspace.updateSource(data, result.id, state);
    return result;
  }
  source('Approved marketing', 'approved'); source('Pending marketing', 'pending'); source('Rejected marketing', 'rejected'); source('Superseded marketing', 'superseded');
  source('Conflict', 'approved'); source('Conflict', 'approved'); source('Pending company', 'pending', { scope: 'company' });
  source('Operations evidence', 'approved', { department: 'Operations' });
  data.activePersonId = people[2].id; source('Writer private material', 'pending', { scope: 'private' }); data.activePersonId = people[0].id;
  workspace.save(profile, data); app.setPath('userData', profile); require('../main.js'); await app.whenReady();
  let win;
  for (let attempt = 0; attempt < 100; attempt++) { win = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html')); if (win && !win.webContents.isLoading() && await win.webContents.executeJavaScript('Boolean(window.desktop)')) break; await new Promise(r => setTimeout(r, 100)); }
  const run = code => win.webContents.executeJavaScript(code), pause = () => new Promise(r => setTimeout(r, 150));
  let exitCode = 0;
  try {
    win.webContents.debugger.attach('1.3');
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (let index = 0; index < people.length; index++) {
      if (index) await run('window.desktop.logout()');
      await run(`window.desktop.login('qa${index}@synthetic.example','Synthetic-password-123')`); await pause();
      await run("document.querySelector('[data-tab-button=knowledge]').click()"); await pause();
      const state = await run("({text:document.getElementById('knowledge-list').innerText,queue:document.getElementById('knowledge-decisions').innerText,forms:document.querySelectorAll('#knowledge-decisions .knowledge-approval').length})");
      assert.equal(state.text.includes('Writer private material'), index === 2);
      if (index >= 2) assert.equal(state.forms, 0);
      if (index === 1) assert(!state.queue.includes('Pending company'), 'Lead cannot decide company sources');
      if (index === 3) assert(!state.text.includes('Approved marketing'), 'Other department excluded');
      if (index === 0) for (const label of ['Approved marketing','Pending marketing','Rejected marketing','Superseded marketing','Conflict']) assert(state.text.includes(label));
      checks.push(`Authenticated ${people[index].role}/${people[index].department || 'company'}: private source visibility and approval queue scope`);
      for (const [width, height, zoom] of [[960,820,1],[520,850,1],[960,820,2]]) {
        win.setSize(width, height); win.webContents.setZoomFactor(zoom);
        for (const tab of ['review','knowledge','learn']) {
          await run(`document.querySelector('[data-tab-button=${tab}]').click()`); await pause();
          const layout = await run("({width:innerWidth,scroll:document.documentElement.scrollWidth,animations:document.getAnimations().filter(a=>a.playState==='running').length,unnamed:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.title).length})");
          assert(layout.scroll <= layout.width + 1, `${index}/${tab}/${width}/${zoom}: horizontal overflow ${JSON.stringify(layout)}`);
          assert.equal(layout.unnamed, 0, `${tab}: unnamed visible control`); assert.equal(layout.animations, 0, 'Reduced motion');
          if (out && index === 0) fs.writeFileSync(path.join(out, `${tab}-${width}-zoom${zoom}.png`), (await win.webContents.capturePage()).toPNG());
        }
      }
      checks.push(`Role ${index}: three destinations at 520/960px and 200% zoom; named buttons, no page overflow, reduced motion`);
    }
    await run('window.desktop.logout()'); assert.equal(await run("document.querySelectorAll('.knowledge-card').length"), 0); checks.push('Logout clears library material');
    console.log(checks.join('\n')); console.log(`${checks.length} accessibility matrix checks passed; native VoiceOver not asserted`);
    if (out) fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ checks, limits: ['Renderer/authenticated role matrix; native VoiceOver and physical displays are separate'] }, null, 2));
  } catch(error) { console.error(error); exitCode=1; } finally { win.webContents.debugger.detach(); win.destroy(); fs.rmSync(profile, { recursive: true, force: true }); app.exit(exitCode); }
})().catch(error => { console.error(error); app.exit(1); });
