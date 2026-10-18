// Screenshots of Learn answer states and Knowledge chips with real data (#18), in a temporary profile.
// Run: OUT=<dir> npx electron scripts/capture-learn-knowledge.cjs
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const workspace = require('../src/workspace');
const learning = require('../src/learning');

const out = process.env.OUT;
if (!out) throw new Error('Set OUT to a screenshot folder.');
fs.mkdirSync(out, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-learn-knowledge-'));
const sources = path.join(__dirname, '..', 'sources');
const data = workspace.create(profile, 'Vamo', 'Demo Owner');
const imported = ['brand-and-legal.md', 'content-calendar.md', 'linkedin-campaign.md'].map(name => workspace.importFile(profile, data, path.join(sources, name), { department: 'Marketing', version: '1', title: name }));
workspace.updateSource(data, imported[0].id, 'approved');
workspace.updateSource(data, imported[1].id, 'approved');
// imported[2] stays pending, so Knowledge shows approved and to-review chips together.

// Confirm every lesson step this week, then answer the quiz: first choice correct, second wrong.
const session = learning.start(data, imported[0].id);
for (const step of learning.snapshot(data).steps) learning.confirm(data, session.id, step.id);
const quiz = learning.beginQuiz(data);
quiz.questions.forEach((question, index) => {
  if (question.type === 'choice' || question.type === 'source') learning.answer(data, quiz.id, question.id, index === 0 ? question.correct : (question.correct + 1) % question.options.length);
  else learning.answer(data, quiz.id, question.id, { text: 'I aligned the headline and grouped the images.', confirmed: true });
});
workspace.save(profile, data);

app.setPath('userData', profile);
require('../main.js');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  try {
    let agent;
    for (let i = 0; i < 100; i++) {
      agent = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('agent.html'));
      if (agent && !agent.webContents.isLoading() && await agent.webContents.executeJavaScript('Boolean(window.desktop)')) break;
      await pause(100);
    }
    const run = script => agent.webContents.executeJavaScript(script);
    const shot = async (name, width, height, focus) => { agent.setSize(width, height); await pause(450); if (focus) { await run(`[...document.querySelectorAll('#learning-panel *')].find(n=>n.children.length===0&&n.textContent.includes(${JSON.stringify(focus)}))?.scrollIntoView({block:'center'})`); await pause(200); } fs.writeFileSync(path.join(out, name), (await agent.webContents.capturePage()).toPNG()); };
    await run("document.querySelector('[data-tab-button=learn]').click()"); await pause(400);
    const badges = await run("document.getElementById('learning-panel').innerText");
    assert.ok(/Correct/.test(badges) && /Not quite/.test(badges), 'both answer badges render');
    await shot('learn-answers-520.png', 520, 850, 'Not quite'); await shot('learn-answers-960.png', 960, 820, 'Not quite');
    await shot('learn-delete-520.png', 520, 850, 'Delete my local learning history');
    await run("document.querySelector('[data-tab-button=knowledge]').click()"); await pause(400);
    const chips = await run("[...document.querySelectorAll('.count-chip')].map(c=>c.textContent)");
    assert.ok(chips.some(c => /2 approved/.test(c)) && chips.some(c => /1 to review/.test(c)), JSON.stringify(chips));
    await shot('knowledge-chips-520.png', 520, 850); await shot('knowledge-chips-960.png', 960, 820);
    console.log(`PASS answer badges and Knowledge chips (${chips.join(', ')})`);
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { fs.rmSync(profile, { recursive: true, force: true }); app.quit(); }
});
