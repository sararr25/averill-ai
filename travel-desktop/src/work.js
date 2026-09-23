const kind = new URLSearchParams(location.search).get('kind');
const titles = { email: 'Email Studio', social: 'Social Publisher', handover: 'Campaign Files' };
document.title = `${titles[kind] || 'Workspace'} · Aurelia Travel`;
document.getElementById('tool-title').textContent = titles[kind] || 'Workspace';
document.getElementById('sidebar-links').innerHTML = `<div class="sidebar-link ${kind === 'email' ? 'active' : ''}">✉ &nbsp; Email Studio</div><div class="sidebar-link ${kind === 'social' ? 'active' : ''}">▣ &nbsp; Social Publisher</div><div class="sidebar-link ${kind === 'handover' ? 'active' : ''}">▤ &nbsp; Campaign Files</div>`;

const defaults = {
  email: { subject: 'Winter city breaks are calling', body: 'Discover curated winter city breaks in Copenhagen, Vienna and Prague.', audience: 'Travel subscribers — Denmark', footer: true },
  social: { caption: 'Discover a quieter side of winter in Vienna. Paid partnership with Aurelia Travel', asset: 'winter-reel-vertical.svg', date: '2026-10-17', partnershipLabel: true },
  handover: { brief: 'v2' },
};
const flawed = {
  email: { subject: 'Lowest prices guaranteed this winter', body: 'Book your next city break with Aurelia Travel.', audience: 'All subscribers', footer: false },
  social: { caption: 'A winter weekend in Vienna awaits ✨', asset: 'winter-square-old.svg', date: '2026-10-21', partnershipLabel: false },
  handover: { brief: 'v1' },
};

const stored = localStorage.getItem(`aurelia:${kind}`);
let state;
try { state = stored ? { ...defaults[kind], ...JSON.parse(stored) } : { ...defaults[kind] }; }
catch { state = { ...defaults[kind] }; }

const content = document.getElementById('work-content');
const templates = {
  email: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / EMAIL</div><h1>Launch email</h1><p>Prepare the subscriber launch for Winter Escapes 2027.</p></div><span class="draft-badge">DRAFT</span></div><div class="work-card"><div class="card-heading"><div><h2>Message</h2><p>Changes are observed when you leave a field.</p></div><button id="load-flawed" class="text-button">Load incoming draft ↗</button></div><label for="subject">Subject line</label><input id="subject" type="text" maxlength="160"><label for="body">Email body</label><textarea id="body" rows="8"></textarea><div class="field-grid"><div><label for="audience">Audience segment</label><select id="audience"><option>Travel subscribers — Denmark</option><option>All subscribers</option><option>Travel subscribers — Germany</option></select></div><div><label>Required footer</label><label class="check-row"><input id="footer" type="checkbox"> Include approved unsubscribe footer</label></div></div></div><div class="work-actions"><button id="save" class="primary-button">Save draft</button><span id="save-status">Your edits are local to this demo.</span></div>`,
  social: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / SOCIAL</div><h1>Partner Reel</h1><p>Prepare the paid creator post for Instagram.</p></div><span class="draft-badge">DRAFT</span></div><div class="work-card"><div class="card-heading"><div><h2>Publishing details</h2><p>Choose the asset, caption and scheduled date.</p></div><button id="load-flawed" class="text-button">Load incoming draft ↗</button></div><div class="asset-chooser"><div><label for="asset">Creative asset</label><select id="asset"><option value="winter-reel-vertical.svg">Vertical Reel · 1080 × 1920</option><option value="winter-square-old.svg">Square image · 1080 × 1080 (old)</option></select><p class="field-hint">The preview updates with your selection.</p></div><div id="asset-preview" class="asset-preview"></div></div><label for="caption">Caption</label><textarea id="caption" rows="6"></textarea><label class="check-row"><input id="partnershipLabel" type="checkbox"> Use Instagram paid partnership label</label><label for="date">Publish date</label><input id="date" type="date"><p class="field-hint">The approved time is 18:00 Copenhagen time.</p></div><div class="work-actions"><button id="save" class="primary-button">Save draft</button><span id="save-status">Your edits are local to this demo.</span></div>`,
  handover: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / FILES</div><h1>Campaign handover</h1><p>Pick up the launch from the documents left by your teammate.</p></div><span class="draft-badge">HANDOVER</span></div><div class="work-card"><div class="card-heading"><div><h2>Working brief</h2><p>The assistant checks which version you open.</p></div><button id="load-flawed" class="text-button">Open handed-over file ↗</button></div><label for="brief">Select document</label><select id="brief"><option value="v2">Winter Escapes 2027 · Brief v2 · Current</option><option value="v1">Winter Escapes 2027 · Brief v1 · Old</option></select><div id="brief-preview" class="brief-preview"></div></div>`,
};
content.innerHTML = templates[kind] || '<p>Unknown workspace.</p>';

function readForm() {
  if (kind === 'email') return { subject: document.getElementById('subject').value, body: document.getElementById('body').value, audience: document.getElementById('audience').value, footer: document.getElementById('footer').checked };
  if (kind === 'social') return { caption: document.getElementById('caption').value, asset: document.getElementById('asset').value, date: document.getElementById('date').value, partnershipLabel: document.getElementById('partnershipLabel').checked };
  return { brief: document.getElementById('brief').value };
}

function preview() {
  if (kind === 'social') {
    const isOld = state.asset === 'winter-square-old.svg';
    document.getElementById('asset-preview').innerHTML = `<div class="asset-art ${isOld ? 'square' : 'vertical'}"><span>AURELIA TRAVEL</span><strong>${isOld ? 'WINTER CITY BREAKS' : 'WINTER, DIFFERENTLY'}</strong><small>${isOld ? 'OLD SQUARE CREATIVE' : 'PARTNER REEL · VERTICAL'}</small></div>`;
  }
  if (kind === 'handover') {
    document.getElementById('brief-preview').innerHTML = state.brief === 'v1' ? '<div class="preview-status old">SUPERSEDED · 22 SEP 2026</div><h3>Campaign brief v1</h3><p>Audience: all European subscribers</p><p>Headline: lowest prices guaranteed</p><p>Social: square image, 21 October</p>' : '<div class="preview-status">APPROVED · 22 SEP 2026</div><h3>Campaign brief v2</h3><p>Audience: Denmark-based travel subscribers</p><p>Headline: curated winter city breaks</p><p>Social: vertical Reel, 17 October</p>';
  }
}

function fill() {
  for (const [key, value] of Object.entries(state)) {
    const input = document.getElementById(key);
    if (input) { if (input.type === 'checkbox') input.checked = value; else input.value = value; }
  }
  preview();
}

function commit() {
  state = readForm();
  preview();
  window.desktop.updateWork(kind, state);
}

fill();
window.desktop.updateWork(kind, state);
content.addEventListener('focusout', (event) => { if (event.target.matches('input,textarea')) commit(); });
content.addEventListener('change', (event) => { if (event.target.matches('select,input[type="checkbox"],input[type="date"]')) commit(); });
document.getElementById('load-flawed').addEventListener('click', () => { state = { ...flawed[kind] }; fill(); commit(); });
const save = document.getElementById('save');
if (save) save.addEventListener('click', () => { commit(); localStorage.setItem(`aurelia:${kind}`, JSON.stringify(state)); document.getElementById('save-status').textContent = 'Draft saved on this computer.'; });
window.desktop.onSharing((isShared) => {
  const indicator = document.getElementById('share-indicator');
  indicator.textContent = isShared ? '● Shared with assistant' : 'Not shared with assistant';
  indicator.classList.toggle('active', isShared);
});
