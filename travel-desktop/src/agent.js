const kinds = [
  { id: 'email', title: 'Email Studio', detail: 'Draft, audience and footer', icon: '✉' },
  { id: 'social', title: 'Social Publisher', detail: 'Partner Reel and schedule', icon: '▣' },
  { id: 'handover', title: 'Campaign Files', detail: 'Brief versions and handover', icon: '▤' },
];
let current = { open: [], shared: [], findings: [] };
let activeSourceId = null;

const el = (id) => document.getElementById(id);

function sourceButton(source) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'source-link';
  button.textContent = `${source.title} ↗`;
  button.addEventListener('click', () => source.kind === 'asset' ? window.desktop.openSource(source.id) : showSource(source.id));
  return button;
}

function render() {
  el('answer-mode').textContent = current.aiEnabled ? 'Nebius AI enabled' : 'Local source answers';
  el('ai-toggle').textContent = current.aiEnabled ? 'Disable Nebius AI' : 'Enable Nebius AI';
  el('shared-count').textContent = `${current.shared.length} shared`;
  el('sharing-status').textContent = current.shared.length ? 'LIVE' : 'NOT SHARING';
  el('finding-count').textContent = current.findings.length ? `${current.findings.length} to review` : 'No issues';
  const list = el('window-list');
  list.replaceChildren();
  for (const kind of kinds) {
    const row = document.createElement('div');
    row.className = 'window-row';
    const icon = document.createElement('div');
    icon.className = 'window-icon'; icon.textContent = kind.icon;
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
    button.textContent = isShared ? 'Sharing ✓' : isOpen ? 'Share window' : 'Open';
    button.setAttribute('aria-label', `${button.textContent} ${kind.title}`);
    button.addEventListener('click', async () => {
      if (!isOpen) current = await window.desktop.openWork(kind.id);
      else current = await window.desktop.share(kind.id, !isShared);
      render();
    });
    row.append(icon, text, button); list.append(row);
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
}

el('ask-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = el('question').value.trim();
  if (!question) return;
  addMessage(question, 'user');
  el('question').value = '';
  const response = await window.desktop.ask(question);
  addMessage(response.text, 'assistant', response.sources);
});
el('close-source').addEventListener('click', () => el('source-dialog').close());
el('ai-toggle').addEventListener('click', async () => { current = await window.desktop.aiMode(!current.aiEnabled); render(); });
el('open-source').addEventListener('click', () => { if (activeSourceId) window.desktop.openSource(activeSourceId); });
window.desktop.onSnapshot((value) => { current = value; render(); });
window.desktop.snapshot().then((value) => { current = value; render(); });
