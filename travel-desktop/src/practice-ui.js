// AV-50 – AV-53: handover briefing in Knowledge, practice from approved rules in Learn, and a link from Review findings.
let practiceRenderKey = null, practiceFocusQuote = null;
const practiceKindLabels = { 'claim-forbidden': 'Forbidden claim', 'claim-approved': 'Approved wording', audience: 'Audience', date: 'Date', time: 'Time', asset: 'Creative', disclosure: 'Disclosure', 'required-text': 'Required text' };

function briefingButton(file) {
  const button = node('button', 'What changed in the newer version?', 'secondary-button'); button.type = 'button';
  button.addEventListener('click', async () => {
    const useAI = Boolean(current.aiEnabled && current.privacy?.companyAI && file.aiAllowed);
    if (useAI && !(await confirmOutbound({ service: 'Nebius', title: 'Summarise the changes', note: 'Both versions are sent to NVIDIA Nemotron for a short summary. The structured change list is computed on this Mac either way.', items: [`${file.name} v${file.version}`, 'Its newer approved version'] }))?.length) return;
    button.disabled = true;
    try {
      const result = await window.desktop.versionBriefing(file.id, useAI);
      const lines = [];
      if (!result.replacement) lines.push('No newer version you can see is linked to this document.');
      else {
        lines.push(`${result.older.title} v${result.older.version} → ${result.replacement.title} v${result.replacement.version}`, '');
        for (const point of result.points) lines.push(`• ${point.text}`, `   New: “${point.newer.quote}”${point.older ? `\n   Old: “${point.older.quote}”` : ''}`);
        if (result.points.length) lines.push('', result.model ? `Summary by NVIDIA Nemotron (${result.model}); every point quotes the documents.` : '', '');
        lines.push('Rule changes:');
        const verbs = { added: 'New', removed: 'Removed', stated: 'Now required' };
        for (const change of result.changes) lines.push(change.type === 'changed' ? `• ${practiceKindLabels[change.kind] || change.kind} (${change.task}): “${change.from}” → “${change.value}”` : `• ${verbs[change.type]} ${practiceKindLabels[change.kind] || change.kind} (${change.task}): “${change.value}”`);
        if (result.changes.some(change => change.type === 'stated')) lines.push('  “Now required” means the older version did not state this as a rule; read it to see what it said instead.');
        if (!result.changes.length) lines.push('• No structured rule changed. Compare the full text before acting.');
      }
      activeSourceId = result.replacement?.id || null; el('open-source').hidden = !result.replacement;
      el('source-title').textContent = 'What you need to know'; el('source-content').textContent = lines.join('\n');
      openSourceDialog(button);
    } catch (error) { button.textContent = error.message; }
    finally { button.disabled = false; }
  });
  return button;
}

function appendPracticeLink(card, quote) {
  const button = node('button', 'Practise this rule', 'secondary-button'); button.type = 'button';
  button.addEventListener('click', () => { practiceFocusQuote = quote; practiceRenderKey = null; showTab('learn'); renderPractice().then(() => el('practice-section').scrollIntoView({ block: 'start' })); });
  card.append(button);
}

function practiceItem(item, status) {
  const card = node('article', undefined, 'knowledge-card rule-card');
  card.append(node('strong', `${practiceKindLabels[item.kind] || item.kind} · ${item.task === 'any' ? 'every channel' : item.task}`, 'knowledge-state'), node('p', item.prompt, 'rule-value'));
  const result = node('p', item.answered ? (item.answered.correct ? 'You answered this correctly before.' : 'Try it again.') : '', 'knowledge-meta'); result.setAttribute('aria-live', 'polite');
  const options = node('div', undefined, 'finding-actions');
  item.options.forEach((option, index) => {
    const button = node('button', option, 'secondary-button'); button.type = 'button';
    button.addEventListener('click', async () => { try { const answer = await window.desktop.answerPractice(item.id, index); result.textContent = answer.feedback; } catch (error) { result.textContent = error.message; } });
    options.append(button);
  });
  card.append(options, result, node('p', `${item.sourceTitle} · v${item.sourceVersion}${item.origin === 'nemotron' ? ' · written with NVIDIA Nemotron, approved by your lead' : ''}`, 'knowledge-meta'));
  return card;
}

async function renderPractice() {
  const host = el('practice-section');
  if (!current.workspace?.configured || current.auth?.enabled && !current.auth.signedIn) { host.replaceChildren(); practiceRenderKey = null; return; }
  const me = current.workspace.people.find(person => person.id === current.workspace.activePersonId);
  const key = JSON.stringify([me?.id, current.workspace.sources, practiceFocusQuote]);
  if (key === practiceRenderKey) return;
  practiceRenderKey = key;
  let data;
  try { data = await window.desktop.practiceSnapshot(practiceFocusQuote); } catch { return; }
  const head = node('div', undefined, 'section-head'); head.append(node('h2', 'Practise company rules'), node('span', 'Works offline'));
  const status = node('p', '', 'knowledge-meta'); status.setAttribute('aria-live', 'polite');
  host.replaceChildren(head, node('p', 'Short questions built from approved rules. Your answers stay private to you.', 'section-note'));
  if (practiceFocusQuote) { const all = node('button', 'Show all practice', 'source-link'); all.type = 'button'; all.addEventListener('click', () => { practiceFocusQuote = null; practiceRenderKey = null; renderPractice(); }); host.append(all); }
  if (!data.items.length) host.append(node('p', practiceFocusQuote ? 'No approved practice for this rule yet.' : 'No approved practice yet. Your lead prepares it from approved rules.'));
  for (const item of data.items) host.append(practiceItem(item, status));
  if (['admin', 'lead'].includes(me?.role)) {
    const useAI = Boolean(current.aiEnabled && current.privacy?.companyAI && current.services?.nebius);
    const generate = node('button', useAI ? 'Draft practice with NVIDIA Nemotron' : 'Draft practice from approved rules', 'secondary-button'); generate.type = 'button';
    generate.addEventListener('click', async () => {
      if (useAI && !(await confirmOutbound({ service: 'Nebius', title: 'Draft practice questions', note: 'For each approved rule, only its value and quote are sent to Nemotron. Drafts come back for your approval.', items: ['Approved rules you manage (value and quote)'] }))?.length) return;
      generate.disabled = true;
      try { const result = await window.desktop.generatePractice(useAI); status.textContent = `${result.added} draft questions to review.`; practiceRenderKey = null; await renderPractice(); }
      catch (error) { status.textContent = error.message; generate.disabled = false; }
    });
    host.append(generate);
    if (data.pending.length) host.append(node('h3', `Drafts waiting for approval · ${data.pending.length}`));
    for (const item of data.pending) {
      const card = node('article', undefined, 'knowledge-card rule-card');
      card.append(node('strong', `${practiceKindLabels[item.kind] || item.kind} · draft`, 'knowledge-state'), node('p', item.prompt, 'rule-value'));
      const list = node('ol'); item.options.forEach((option, index) => list.append(node('li', `${option}${index === item.correct ? ' ✓ correct' : ''}`))); card.append(list, node('blockquote', item.quote, 'rule-quote'));
      for (const [action, label] of [['approved', 'Approve question'], ['rejected', 'Discard']]) {
        const button = node('button', label, 'secondary-button'); button.type = 'button';
        button.addEventListener('click', async () => { button.disabled = true; try { await window.desktop.decidePractice(item.id, action); practiceRenderKey = null; await renderPractice(); } catch (error) { status.textContent = error.message; button.disabled = false; } });
        card.append(button);
      }
      host.append(card);
    }
  }
  host.append(status);
}
