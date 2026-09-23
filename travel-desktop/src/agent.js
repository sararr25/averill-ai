const kinds = [
  { id: 'email', title: 'Email Studio', detail: 'Draft, audience and footer', icon: 'mail' },
  { id: 'social', title: 'Social Publisher', detail: 'Partner Reel and schedule', icon: 'image' },
  { id: 'handover', title: 'Campaign Files', detail: 'Brief versions and handover', icon: 'folder' },
];
const iconPaths = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m4 18 5-5 3 3 3-4 5 6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  document: '<path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v5h4M8 12h7M8 16h7"/>',
  arrow: '<path d="M5 19 19 5M9 5h10v10"/>',
};
function icon(name) { return `<svg class="line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`; }
let current = { open: [], shared: [], findings: [] };
let activeSourceId = null;

const el = (id) => document.getElementById(id);

function showTab(name) {
  for (const button of document.querySelectorAll('[data-tab-button]')) {
    const active = button.dataset.tabButton === name;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  }
  for (const panel of document.querySelectorAll('[data-tab]')) panel.classList.toggle('active', panel.dataset.tab === name);
  document.querySelector('.agent-main').scrollTop = 0;
}
for (const button of document.querySelectorAll('[data-tab-button]')) button.addEventListener('click', () => showTab(button.dataset.tabButton));

function sourceButton(source) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'source-link';
  button.innerHTML = `${icon('document')}<span></span>${icon('arrow')}`;
  button.querySelector('span').textContent = source.title;
  button.addEventListener('click', () => source.kind === 'asset' ? window.desktop.openSource(source.id) : showSource(source.id));
  return button;
}

function render() {
  renderWorkspace();
  renderHero();
  el('review-external').disabled = !current.externalWindow;
  el('stop-external').disabled = !current.externalWindow;
  if (current.externalWindow) el('external-result').textContent = `Selected: ${current.externalWindow.name}. Capture occurs only when you press Review.`;
  el('answer-mode').textContent = current.aiEnabled ? 'Nebius AI enabled' : 'Local source answers';
  el('ai-toggle').textContent = current.aiEnabled ? 'Disable Nebius AI' : current.services?.nebius ? 'Enable Nebius AI' : 'Nebius key needed in Setup';
  el('ai-toggle').disabled = !current.services?.nebius && !current.aiEnabled;
  el('web-form').querySelector('button').disabled = !current.services?.tavily;
  el('shared-count').textContent = `${current.shared.length} shared`;
  el('sharing-status').textContent = current.shared.length ? 'LIVE' : 'NOT SHARING';
  el('finding-count').textContent = current.findings.length ? `${current.findings.length} to review` : 'No issues';
  const list = el('window-list');
  list.replaceChildren();
  for (const kind of kinds) {
    const row = document.createElement('div');
    row.className = 'window-row';
    const iconElement = document.createElement('div');
    iconElement.className = 'window-icon'; iconElement.innerHTML = icon(kind.icon);
    const text = document.createElement('div');
    text.className = 'window-text';
    const title = document.createElement('strong'); title.textContent = kind.title;
    const detail = document.createElement('small'); detail.textContent = kind.detail;
    text.append(title, detail);
    const button = document.createElement('button');
    button.type = 'button';
    const isOpen = current.open.includes(kind.id);
    const isShared = current.shared.includes(kind.id);
    button.className = isShared ? 'share-button shared' : 'share-button';
    button.textContent = isShared ? 'Stop sharing' : isOpen ? 'Share' : 'Open';
    button.setAttribute('aria-label', `${button.textContent} ${kind.title}`);
    button.addEventListener('click', async () => {
      if (!isOpen) current = await window.desktop.openWork(kind.id);
      else current = await window.desktop.share(kind.id, !isShared);
      render();
    });
    row.append(iconElement, text, button); list.append(row);
  }
  const findings = el('findings');
  findings.replaceChildren();
  if (!current.findings.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = current.shared.length ? 'No issues in the shared work right now. Keep editing to see live checks.' : 'Share a work window to receive feedback as you work.';
    findings.append(empty);
  }
  for (const item of current.findings) {
    const card = document.createElement('article'); card.className = 'finding-card';
    const context = document.createElement('div'); context.className = 'finding-context'; context.textContent = `${item.kind.toUpperCase()} · NEEDS ATTENTION`;
    const title = document.createElement('h3'); title.textContent = item.title;
    const body = document.createElement('p'); body.textContent = item.body;
    const source = sourceButton(item.source);
    card.append(context, title, body, source); findings.append(card);
  }
}

function renderHero() {
  const item = current.findings?.[0];
  el('hero-label').textContent = item ? 'FINDING' : 'READY';
  el('hero-title').textContent = item ? item.title : 'Ready when you are.';
  el('hero-body').textContent = item ? item.body : 'Share a work window or review a marketing draft to see source-backed guidance here.';
  const selected = el('hero-selected'); selected.replaceChildren();
  if (item?.kind === 'handover') selected.append(node('div', 'SELECTED FILE', 'eyebrow'), node('div', 'Winter Escapes 2027 / brief v1', 'selected-file'), node('small', '12 Sep 2026 · Superseded'));
  const source = el('hero-source'); source.replaceChildren();
  if (item?.source) {
    source.append(node('div', 'CURRENT SOURCE', 'eyebrow'), sourceButton(item.source));
  } else {
    source.append(node('p', current.shared?.length ? 'No issues found in the shared work right now.' : 'No work window is shared. Open Work to choose a window, then select Share.'));
  }
}

function node(tag, content, className) {
  const element = document.createElement(tag);
  if (content !== undefined) element.textContent = content;
  if (className) element.className = className;
  return element;
}

function action(label, callback) {
  const button = node('button', label, 'secondary-button');
  button.type = 'button';
  button.addEventListener('click', async () => {
    try { current = await callback(); el('workspace-feedback').textContent = ''; render(); }
    catch (error) { el('workspace-feedback').textContent = error.message; }
  });
  return button;
}

function renderWorkspace() {
  const panel = el('workspace-panel');
  panel.replaceChildren();
  const data = current.workspace || { configured: false };
  if (!data.configured) {
    const form = node('form'); form.className = 'workspace-form';
    const company = node('input'); company.placeholder = 'Company name'; company.required = true; company.maxLength = 120;
    const admin = node('input'); admin.placeholder = 'Administrator name'; admin.required = true; admin.maxLength = 120;
    const submit = node('button', 'Create company workspace', 'secondary-button'); submit.type = 'submit';
    form.append(company, admin, submit);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try { current = await window.desktop.createWorkspace(company.value, admin.value); render(); }
      catch (error) { el('workspace-feedback').textContent = error.message; }
    });
    panel.append(node('p', 'Create a company workspace to add people and approved sources.'), form);
    return;
  }
  const active = data.people.find((entry) => entry.id === data.activePersonId);
  panel.append(node('strong', data.company));
  panel.append(node('p', `Departments: ${data.departments.join(', ')}. Marketing review is the implemented workflow; other departments can have people and sources but no specialized checks yet.`));
  const select = node('select'); select.setAttribute('aria-label', 'Demo role');
  for (const person of data.people) {
    const option = node('option', `${person.name} · ${person.role}${person.department ? ` · ${person.department}` : ''}`);
    option.value = person.id; option.selected = person.id === data.activePersonId; select.append(option);
  }
  select.addEventListener('change', async () => { current = await window.desktop.switchPerson(select.value); render(); });
  panel.append(node('p', 'Switching roles on this computer demonstrates permissions. It is not user authentication.'), select);
  if (data.conflicts?.length) panel.append(node('p', `${data.conflicts.length} source conflict(s) need a lead decision. Averill will not use either conflicting version for answers.`, 'workspace-conflict'));
  if (active.role === 'admin') {
    const form = node('form'); form.className = 'workspace-form';
    const name = node('input'); name.placeholder = 'Person name'; name.required = true;
    const role = node('select'); for (const value of ['employee', 'lead', 'admin']) { const option = node('option', value); option.value = value; role.append(option); }
    const department = node('input'); department.value = 'Marketing'; department.placeholder = 'Department';
    const add = node('button', 'Add person', 'secondary-button'); add.type = 'submit';
    form.append(name, role, department, add);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try { current = await window.desktop.addPerson(name.value, role.value, department.value); render(); }
      catch (error) { el('workspace-feedback').textContent = error.message; }
    });
    panel.append(form);
    const keySection = node('div'); keySection.className = 'workspace-keys';
    keySection.append(node('h3', 'Service keys'), node('p', `Nebius: ${current.services?.nebius ? 'configured' : 'missing'} · Tavily: ${current.services?.tavily ? 'configured' : 'missing'}. Keys are stored with macOS Keychain protection when entered here.`));
    for (const [service, label] of [['nebius', 'Nebius'], ['tavily', 'Tavily']]) {
      const keyForm = node('form'); keyForm.className = 'workspace-form';
      const input = node('input'); input.type = 'password'; input.placeholder = `${label} API key`; input.autocomplete = 'off'; input.required = true;
      const save = node('button', `Save ${label} key`, 'secondary-button'); save.type = 'submit';
      keyForm.append(input, save);
      keyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try { current = await window.desktop.saveApiKey(service, input.value); input.value = ''; el('workspace-feedback').textContent = `${label} key saved securely.`; render(); }
        catch (error) { el('workspace-feedback').textContent = error.message; }
      });
      keySection.append(keyForm);
    }
    panel.append(keySection);
  }
  const importRow = node('div'); importRow.className = 'workspace-actions';
  const scope = node('select'); scope.setAttribute('aria-label', 'Import visibility');
  for (const [value, label] of [['private', 'Private until proposed'], ['department', 'Propose to department']]) { const option = node('option', label); option.value = value; scope.append(option); }
  if (active.role === 'admin') scope.value = 'department';
  importRow.append(scope, action('Import file or Canva export', () => window.desktop.importSources({ scope: scope.value, department: active.department || 'Marketing' })));
  const folderButton = node('button', 'Import folder', 'secondary-button'); folderButton.type = 'button';
  folderButton.addEventListener('click', async () => {
    try {
      const result = await window.desktop.importFolder({ scope: scope.value, department: active.department || 'Marketing' });
      current = result; render();
      if (result.importSummary) el('workspace-feedback').textContent = `Imported ${result.importSummary.imported} of ${result.importSummary.scanned} supported files${result.importSummary.limited ? ' (100-file limit reached)' : ''}. Review and approve them before use.`;
    } catch (error) { el('workspace-feedback').textContent = error.message; }
  });
  importRow.append(folderButton);
  panel.append(importRow);
  const list = node('div'); list.className = 'workspace-sources';
  if (!data.sources.length) list.append(node('p', 'No sources yet. Import a file, then approve it as a department lead or administrator.'));
  for (const source of data.sources) {
    const row = node('div'); row.className = 'workspace-source';
    row.append(node('strong', source.title), node('small', `${source.department} · ${source.status} · v${source.version} · priority ${source.priority} · ${source.extractionStatus}`));
    row.append(action('Open', () => window.desktop.openWorkspaceSource(source.id).then(() => current)));
    if (source.scope === 'private' && source.ownerId === active.id) row.append(action('Propose to department', () => window.desktop.proposeSource(source.id)));
    if (source.extractionStatus === 'text available') row.append(action('Review text', async () => {
      const file = await window.desktop.readWorkspaceFile(source.id);
      if (!file.text) { el('workspace-feedback').textContent = 'No readable text was extracted.'; return current; }
      if (!current.aiEnabled) { el('workspace-feedback').textContent = 'Enable Nebius, then choose Review text for a source-backed comparison.'; return current; }
      if (!window.confirm(`Send extracted text from ${file.title} and relevant approved sources to Nebius for review?`)) return current;
      const response = await window.desktop.ask(`Review this marketing work for conflicts with approved sources. Cite the exact source. If unsupported, say so.\n\nWORK TEXT:\n${file.text.slice(0, 4000)}`);
      addMessage(`${response.mode === 'local' ? 'Local fallback: ' : ''}${response.text}`, 'assistant', response.sources);
      return current;
    }));
    if (active.role === 'admin' || (active.role === 'lead' && active.department === source.department)) {
      if (source.status !== 'approved') row.append(action('Approve', () => window.desktop.updateSource(source.id, 'approved', source.priority)));
      if (source.status === 'approved') row.append(action('Supersede', () => window.desktop.updateSource(source.id, 'superseded', source.priority)));
      if (source.status === 'approved') {
        const priority = node('input'); priority.type = 'number'; priority.min = '0'; priority.max = '100'; priority.value = String(source.priority); priority.setAttribute('aria-label', `Priority for ${source.title}`); priority.className = 'priority-input';
        row.append(priority, action('Set priority', () => window.desktop.updateSource(source.id, 'approved', priority.value)));
      }
    }
    list.append(row);
  }
  panel.append(list);
}

async function showSource(id) {
  const item = await window.desktop.source(id);
  if (!item) return;
  activeSourceId = id;
  el('source-title').textContent = item.title;
  el('source-content').textContent = item.content;
  el('source-dialog').showModal();
}

function addMessage(text, role, sources = []) {
  const message = document.createElement('div');
  message.className = role === 'user' ? 'user-message' : 'assistant-message';
  const paragraph = document.createElement('p'); paragraph.textContent = text;
  message.append(paragraph);
  for (const source of sources) message.append(sourceButton(source));
  el('conversation').append(message);
  el('conversation').scrollTop = el('conversation').scrollHeight;
  document.querySelector('.agent-main').scrollTop = document.querySelector('.agent-main').scrollHeight;
}

el('ask-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = el('question').value.trim();
  if (!question) return;
  addMessage(question, 'user');
  el('question').value = '';
  const response = current.shared?.length ? await window.desktop.askDemo(question) : await window.desktop.ask(question);
  addMessage(response.text, 'assistant', response.sources);
});
el('web-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = el('web-query').value.trim();
  if (!query) return;
  const results = el('web-results'); results.replaceChildren(node('p', 'Searching public web…'));
  try {
    const items = await window.desktop.searchPublicWeb(query);
    results.replaceChildren();
    if (!items.length) results.append(node('p', 'No public results found.'));
    for (const item of items) {
      const row = node('div'); row.className = 'workspace-source';
      const link = node('button', item.title, 'source-link'); link.type = 'button'; link.addEventListener('click', () => window.desktop.openWeb(item.url));
      row.append(link, node('small', item.content)); results.append(row);
    }
  } catch (error) { results.replaceChildren(node('p', error.message)); }
});
el('review-draft').addEventListener('click', async () => {
  const draft = el('company-draft').value.trim();
  const result = el('draft-result'); result.replaceChildren();
  if (!draft) { result.textContent = 'Enter a draft first.'; return; }
  if (!current.workspace?.configured) { result.textContent = 'Create a company workspace and approve sources first.'; return; }
  if (!current.aiEnabled) { result.textContent = 'Enable Nebius to review the draft against approved sources.'; return; }
  if (!window.confirm('Send this draft and relevant approved company sources to Nebius for review?')) return;
  result.textContent = 'Checking the draft against approved sources…';
  try {
    const response = await window.desktop.ask(`Check this marketing draft for conflicts with approved company sources. Cite exact sources, quote the conflicting draft text, and propose a human edit. If evidence is insufficient, say so.\n\nDRAFT:\n${draft.slice(0, 4000)}`);
    result.replaceChildren(node('p', `${response.mode === 'local' ? 'Local fallback; no AI review completed. ' : ''}${response.text}`));
    for (const source of response.sources || []) result.append(sourceButton(source));
  } catch (error) { result.textContent = error.message; }
});
el('choose-external').addEventListener('click', async () => {
  const list = el('external-list'); list.replaceChildren(node('p', 'Finding windows…'));
  try {
    const result = await window.desktop.externalWindows();
    list.replaceChildren();
    if (result.permission !== 'granted') list.append(node('p', `Screen Recording permission: ${result.permission}. macOS may require permission and an app restart.`));
    const canva = result.windows.filter((entry) => /canva/i.test(entry.name));
    if (!canva.length) list.append(node('p', 'No Canva window found. Open Canva in a separate browser or app window, then try again.'));
    for (const item of canva) list.append(action(`Share ${item.name}`, () => window.desktop.shareExternal(item.id, item.name)));
  } catch (error) { list.replaceChildren(node('p', error.message)); }
});
el('review-external').addEventListener('click', async () => {
  const result = el('external-result'); result.textContent = 'Reading visible text from the selected window…';
  try {
    const review = await window.desktop.reviewExternal();
    result.replaceChildren(node('strong', `Visible text in ${review.window}`), node('pre', review.text || 'No readable text detected in this frame.'));
    if (review.text && current.aiEnabled && window.confirm('Send the extracted visible text and relevant approved sources to Nebius for a source-backed review?')) {
      const response = await window.desktop.ask(`Review this Canva text for conflicts with approved sources. Quote the observed conflicting text and cite the exact source. If no conflict is supported, say so.\n\nVISIBLE TEXT:\n${review.text.slice(0, 4000)}`);
      result.append(node('p', `${response.mode === 'local' ? 'Local fallback; no AI review completed. ' : ''}${response.text}`));
      for (const source of response.sources || []) result.append(sourceButton(source));
    }
  } catch (error) { result.textContent = error.message; }
});
el('stop-external').addEventListener('click', async () => { current = await window.desktop.shareExternal(null, null); el('external-result').textContent = 'Window sharing stopped.'; el('external-list').replaceChildren(); render(); });
el('close-source').addEventListener('click', () => el('source-dialog').close());
el('ai-toggle').addEventListener('click', async () => {
  if (!current.aiEnabled && !window.confirm('Enable Nebius for this session? Your questions and relevant approved company text sources will be sent to Nebius. Images and window captures are not sent by this control.')) return;
  current = await window.desktop.aiMode(!current.aiEnabled); render();
});
el('open-source').addEventListener('click', () => { if (activeSourceId) window.desktop.openSource(activeSourceId); });
window.desktop.onSnapshot((value) => { current = value; render(); });
window.desktop.snapshot().then((value) => { current = value; render(); showTab(value.workspace?.configured ? 'review' : 'setup'); });
