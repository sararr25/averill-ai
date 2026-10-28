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
        for (const tab of ['todo','review','knowledge','learn']) {
          await run(`document.querySelector('[data-tab-button=${tab}]').click()`); await pause();
          const layout = await run("({width:innerWidth,scroll:document.documentElement.scrollWidth,animations:document.getAnimations().filter(a=>a.playState==='running').length,unnamed:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.title).length,tooSmall:[...document.querySelectorAll('button,summary,select,input')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('details:not([open])>:not(summary)')).filter(e=>{const r=e.getBoundingClientRect();return e.type!=='checkbox'&&e.type!=='radio'&&(r.height<24||r.width<24)}).map(e=>(e.id||e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height))})");
          assert(layout.scroll <= layout.width + 1, `${index}/${tab}/${width}/${zoom}: horizontal overflow ${JSON.stringify(layout)}`);
          assert.equal(layout.unnamed, 0, `${tab}: unnamed visible control`); assert.deepEqual(layout.tooSmall, [], `${tab}/${width}/${zoom}: WCAG 2.2 target size below 24px`); assert.equal(layout.animations, 0, 'Reduced motion');
          if (out && index === 0) fs.writeFileSync(path.join(out, `${tab}-${width}-zoom${zoom}.png`), (await win.webContents.capturePage()).toPNG());
        }
      }
      checks.push(`Role ${index}: four destinations at 520/960px and 200% zoom; named buttons, 24px minimum targets, no page overflow, reduced motion`);
    }
    await run('window.desktop.logout()'); assert.equal(await run("document.querySelectorAll('.knowledge-card').length"), 0); checks.push('Logout clears library material');
    // T7.0: every weekly practice question type can be answered with the keyboard and has roles and names a screen reader announces.
    {
      await run("window.desktop.login('qa0@synthetic.example','Synthetic-password-123')"); await pause();
      win.setSize(960, 1000); win.webContents.setZoomFactor(1);
      await run("document.querySelector('[data-tab-button=learn]').click()"); await pause();
      await run("(async()=>{current=await window.desktop.learningAction('start',{});current=await window.desktop.learningAction('finish',{sessionId:current.learning.sessions.find(s=>!s.finishedAt).id,selfConfirmAll:true});current=await window.desktop.learningAction('quiz',{});render();})()"); await pause(400);
      const dbg = win.webContents.debugger; await dbg.sendCommand('Emulation.setFocusEmulationEnabled', { enabled: true });
      const key = async (name, code) => { for (const type of ['keyDown', 'keyUp']) await dbg.sendCommand('Input.dispatchKeyEvent', { type, key: name, code: code || name, windowsVirtualKeyCode: { ArrowRight: 39, ArrowLeft: 37, ' ': 32, Enter: 13, Tab: 9 }[name], text: type === 'keyDown' ? ({ ' ': ' ', Enter: '\r' }[name]) : undefined }); await pause(80); };
      const info = await run(`(()=>{const qs=[...document.querySelectorAll('.practice-q')];const name=el=>el.getAttribute('aria-label')||(el.labels&&el.labels[0]?[...el.labels[0].querySelectorAll('img')].map(i=>i.alt).join(' ')+' '+el.labels[0].textContent.trim():'');return {types:qs.map(q=>q.dataset.type),legends:qs.map(q=>Boolean(q.querySelector('fieldset>legend')&&q.querySelector('legend').textContent.trim())),pictureNames:[...qs[0].querySelectorAll('input[type=radio]')].map(name),tapNames:[...document.querySelectorAll('.practice-q[data-type=tap] input')].map(name),textNames:[...document.querySelectorAll('.practice-q[data-type=text-picture] input')].map(name),images:[...document.querySelectorAll('.weekly-practice img')].map(i=>i.alt),orderNames:[...document.querySelectorAll('.order-move')].map(b=>b.getAttribute('aria-label')),progress:document.querySelector('.weekly-practice progress').getAttribute('aria-label'),alert:document.querySelector('.practice-error').getAttribute('role')}})()`);
      assert.deepEqual(info.types, ['picture', 'tap', 'order', 'text-picture', 'task']);
      assert(info.legends.every(Boolean), 'every question is a fieldset with a legend');
      for (const list of [info.pictureNames, info.tapNames, info.textNames]) assert(list.length >= 3 && list.every(n => n.trim().length > 3), `named radios ${JSON.stringify(list)}`);
      assert(info.pictureNames.every(n => /Post [ABC]:/.test(n)), 'picture options are named by their alt text and caption');
      assert(info.images.every(a => a.length > 10), 'every image has alt text');
      assert(info.orderNames.length === 8 && info.orderNames.every(n => /^Move (up|down): .+/.test(n)), JSON.stringify(info.orderNames));
      assert.equal(info.alert, 'alert');
      await run("document.querySelector('.practice-form').requestSubmit()"); await pause();
      assert.match(await run("document.querySelector('.practice-error').textContent"), /Answer every question before you submit: 4 left/, 'an empty page is rejected with an announced error');
      // Choose a picture: Tab into the group, arrow keys move the choice, Space confirms the focused one.
      await run("document.querySelector('.practice-q[data-type=picture] input').focus()"); await key('ArrowRight', 'ArrowRight'); await key(' ', 'Space');
      assert.equal(await run("document.querySelector('.practice-q[data-type=picture] input:checked')?.value"), 'b', 'arrow key selects the next picture');
      // Tap the spot: areas are radios in one group, so the same keys work.
      await run("document.querySelector('.practice-q[data-type=tap] input').focus()"); await key('ArrowRight', 'ArrowRight'); await key('ArrowRight', 'ArrowRight');
      assert.equal(await run("document.querySelector('.practice-q[data-type=tap] input:checked')?.value"), 'button', 'arrow keys move between tap areas');
      // Put in order: Enter on a Move button reorders and focus stays on a Move button of the same step.
      const before = await run("[...document.querySelectorAll('.practice-order .step-text')].map(e=>e.textContent)");
      await run("document.querySelector('.practice-order .order-move.down').focus()"); await key('Enter', 'Enter');
      const after = await run("({order:[...document.querySelectorAll('.practice-order .step-text')].map(e=>e.textContent),focus:document.activeElement.getAttribute('aria-label'),status:document.querySelector('.practice-q[data-type=order] [role=status]').textContent})");
      assert.equal(after.order[1], before[0], 'Move down by keyboard'); assert.match(after.focus, /^Move (up|down): /, 'focus stays on a move button'); assert.match(after.status, /moved to position 2 of 4/);
      // Choose an answer with a picture: Space selects.
      await run("document.querySelector('.practice-q[data-type=text-picture] input').focus()"); await key(' ', 'Space');
      assert.equal(await run("document.querySelector('.practice-q[data-type=text-picture] input:checked')?.value"), 'edge');
      // One page confirmation, then one submit by keyboard. An unanswered page is rejected with an announced error first.
      await run("document.querySelector('.practice-confirm input').click()");
      await run("document.querySelector('.weekly-practice .agent-primary').focus()"); await key('Enter', 'Enter'); await pause(500);
      const done = await run("({score:document.querySelector('.practice-score')?.textContent,badges:document.querySelectorAll('.practice-badge').length,heading:document.activeElement.textContent})");
      assert.match(done.score, /^\d of 4 right$/); assert.equal(done.badges, 4); assert.match(done.heading, /Weekly practice complete/);
      checks.push('Weekly practice: all four question types and the task answered by keyboard (arrows, Space, Enter); fieldset legends, named radios, alt text, Move up/down names, announced errors and result');
    }
    console.log(checks.join('\n')); console.log(`${checks.length} accessibility matrix checks passed; native VoiceOver not asserted`);
    if (out) fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify({ checks, limits: ['Renderer/authenticated role matrix; native VoiceOver and physical displays are separate'] }, null, 2));
  } catch(error) { console.error(error); exitCode=1; } finally { win.webContents.debugger.detach(); win.destroy(); fs.rmSync(profile, { recursive: true, force: true }); app.exit(exitCode); }
})().catch(error => { console.error(error); app.exit(1); });
