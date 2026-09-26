const kind = new URLSearchParams(location.search).get('kind');
document.body.classList.add(kind || 'unknown');
const titles = { email: 'Email Studio', linkedin: 'LinkedIn Draft', social: 'Social Publisher', handover: 'Campaign Files' };
document.title = `${titles[kind] || 'Workspace'} · Elseweek`;
document.getElementById('tool-title').textContent = titles[kind] || 'Workspace';
const navigation = kind === 'handover' ? [
  ['Campaigns', () => document.getElementById('work-content').scrollTo({top:0}), true],
  ['Brand', () => window.desktop.openSource('legal')],
  ['Assets', () => window.desktop.openSource('reelAsset')],
  ['Research', () => window.desktop.openSource('calendar')],
  ['Archived', () => { state.brief = 'v1'; commit(); }],
] : [['Email Studio', () => window.desktop.openWork('email'), kind === 'email'], ['LinkedIn Draft', () => window.desktop.openWork('linkedin'), kind === 'linkedin'], ['Social Publisher', () => window.desktop.openWork('social'), kind === 'social'], ['Campaign Files', () => window.desktop.openWork('handover')]];
for (const [label, onClick, active] of navigation) {
  const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
  button.className = `sidebar-link${active ? ' active' : ''}`;
  if (active) button.setAttribute('aria-current', 'page');
  button.addEventListener('click', onClick); document.getElementById('sidebar-links').append(button);
}
if (kind === 'handover') document.querySelector('.sidebar-bottom').innerHTML = 'Sharper<br>work.<br>Brighter<br>brands.';

const defaults = {
  email: { subject: 'Winter city breaks are calling', body: 'Discover curated winter city breaks in Copenhagen, Vienna and Prague.', audience: 'Travel subscribers — Denmark', footer: true },
  linkedin: { caption: 'Discover curated winter city breaks in Copenhagen, Vienna and Prague. Explore the winter collection.', audience: 'Denmark-based professionals', asset: 'winter-linkedin-landscape.svg', date: '2026-10-16', time: '09:00' },
  social: { caption: 'Discover a quieter side of winter in Vienna. Paid partnership with Elseweek', asset: 'winter-reel-vertical.svg', date: '2026-10-17', partnershipLabel: true },
  handover: { brief: 'v2' },
};
const flawed = {
  email: { subject: 'Lowest prices guaranteed this winter', body: 'Book your next city break with Elseweek.', audience: 'All subscribers', footer: false },
  linkedin: { caption: 'Lowest prices guaranteed for everyone. Book now!', audience: 'Everyone in Europe', asset: 'winter-square-old.svg', date: '2026-10-17', time: '18:00' },
  social: { caption: 'A winter weekend in Vienna awaits ✨', asset: 'winter-square-old.svg', date: '2026-10-21', partnershipLabel: false },
  handover: { brief: 'v1' },
};

const stored = localStorage.getItem(`elseweek:v1:${kind}`);
let state;
try { state = stored ? { ...defaults[kind], ...JSON.parse(stored) } : { ...defaults[kind] }; }
catch { state = { ...defaults[kind] }; }

const content = document.getElementById('work-content');
const templates = {
  email: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / EMAIL</div><h1>Launch email</h1><p>Prepare the subscriber launch for Winter Escapes 2027.</p></div><span class="draft-badge">DRAFT</span></div><div class="work-card"><div class="card-heading"><div><h2>Message</h2><p>Changes are observed when you leave a field.</p></div><button id="load-flawed" class="text-button">Load incoming draft ${icon("arrow-up-right")}</button></div><label for="subject">Subject line</label><input id="subject" type="text" maxlength="160"><label for="body">Email body</label><textarea id="body" rows="8"></textarea><div class="field-grid"><div><label for="audience">Audience segment</label><select id="audience"><option>Travel subscribers — Denmark</option><option>All subscribers</option><option>Travel subscribers — Germany</option></select></div><div><label>Required footer</label><label class="check-row"><input id="footer" type="checkbox"> Include approved unsubscribe footer</label></div></div></div><div class="work-actions"><button id="save" class="primary-button">Save draft</button><span id="save-status">Your edits are local to this demo.</span></div>`,
  linkedin: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / LINKEDIN</div><h1>Company LinkedIn post</h1><p>Organic company-page draft · supplied demo editor.</p></div><span class="draft-badge">DRAFT</span></div><div class="work-card"><div class="card-heading"><div><h2>Message and creative</h2><p>Changes are reviewed after you leave a field or choose a value.</p></div><button id="load-flawed" class="text-button">Load incoming draft ${icon("arrow-up-right")}</button></div><div class="asset-chooser"><div><label for="asset">Creative asset</label><select id="asset"><option value="winter-linkedin-landscape.svg">LinkedIn landscape · 1200 × 627</option><option value="winter-reel-vertical.svg">Instagram partner Reel · 1080 × 1920</option><option value="winter-square-old.svg">Superseded square · 1080 × 1080</option></select><p class="field-hint">Use the approved campaign visual or recreate it in Canva. This editor does not import a Canva design automatically.</p></div><div id="asset-preview" class="asset-preview"></div></div><label for="caption">Post copy</label><textarea id="caption" rows="6" maxlength="3000"></textarea><label for="audience">Editorial audience</label><select id="audience"><option>Denmark-based professionals</option><option>Everyone in Europe</option></select><p class="field-hint">Writing context, not a LinkedIn advertising targeting control.</p><div class="field-grid"><div><label for="date">Planned date</label><input id="date" type="date"></div><div><label for="time">Planned time · Europe/Copenhagen</label><input id="time" type="time"></div></div><button id="open-linkedin-guide" class="text-button" type="button">Open approved LinkedIn guidance ${icon("arrow-up-right")}</button><p class="field-hint">An organic Elseweek post. Paid Instagram Reel labels are not required by this fixture. Checks cover the listed campaign requirements, not a full tone or copy assessment.</p></div><div class="work-actions"><button id="save" class="primary-button">Save draft</button><span id="save-status">Local demo draft; no LinkedIn connection or publication.</span></div>`,
  social: `<div class="content-top"><div><div class="eyebrow">CAMPAIGN / SOCIAL</div><h1>Partner Reel</h1><p>Prepare the paid creator post for Instagram.</p></div><span class="draft-badge">DRAFT</span></div><div class="work-card"><div class="card-heading"><div><h2>Publishing details</h2><p>Choose the asset, caption and scheduled date.</p></div><button id="load-flawed" class="text-button">Load incoming draft ${icon("arrow-up-right")}</button></div><div class="asset-chooser"><div><label for="asset">Creative asset</label><select id="asset"><option value="winter-reel-vertical.svg">Vertical Reel · 1080 × 1920</option><option value="winter-square-old.svg">Square image · 1080 × 1080 (old)</option></select><p class="field-hint">The preview updates with your selection.</p></div><div id="asset-preview" class="asset-preview"></div></div><label for="caption">Caption</label><textarea id="caption" rows="6"></textarea><label class="check-row"><input id="partnershipLabel" type="checkbox"> Use Instagram paid partnership label</label><label for="date">Publish date</label><input id="date" type="date"><p class="field-hint">The approved time is 18:00 Copenhagen time.</p></div><div class="work-actions"><button id="save" class="primary-button">Save draft</button><span id="save-status">Your edits are local to this demo.</span></div>`,
  handover: `<div class="file-breadcrumb">Campaigns ${icon("caret-right")} Winter Escapes 2027</div><div class="file-heading"><h1>Winter Escapes 2027</h1><p>A warmer way out.</p></div><div class="version-stage"><div class="version-column"><div class="eyebrow">SUPERSEDED</div><button id="brief-v1" class="brief-file" type="button"><i class="file-fold" aria-hidden="true"></i><span>Brief</span><strong>v1</strong><small>12 Sep 2026</small><em>Initial brief<br>and concepts.</em></button></div><div class="version-connection"><svg viewBox="0 0 260 90" aria-hidden="true"><path d="M4 51 C54 9 91 24 132 50 S218 75 251 42" fill="none" stroke="currentColor" stroke-width="2"/><path d="m239 35 12 7-6 13" fill="none" stroke="currentColor" stroke-width="2"/></svg><div>REFINED<br>AND APPROVED</div></div><div class="version-column"><div class="eyebrow approved-label">APPROVED</div><button id="brief-v2" class="brief-file" type="button"><i class="file-fold" aria-hidden="true"></i><span>Brief</span><strong>v2</strong><small>22 Sep 2026</small><em>Final brief<br>for production.</em></button></div></div><div class="file-actions"><button id="load-flawed" class="text-button" type="button">Open handed-over brief v1 ${icon("arrow-up-right")}</button><div id="brief-preview" class="brief-preview"></div></div><div class="other-files"><h2>Other files</h2><button id="open-email-art" type="button">${icon("folder")}<span>Approved email hero<small>Current campaign artwork</small></span>${icon("caret-right")}</button><button id="open-reel-art" type="button">${icon("folder")}<span>Partner Reel artwork<small>Approved vertical creative</small></span>${icon("caret-right")}</button></div>`,
};
content.innerHTML = templates[kind] || '<p>Unknown workspace.</p>';

function readForm() {
  if (kind === 'email') return { subject: document.getElementById('subject').value, body: document.getElementById('body').value, audience: document.getElementById('audience').value, footer: document.getElementById('footer').checked };
  if (kind === 'linkedin') return { caption: document.getElementById('caption').value, audience: document.getElementById('audience').value, asset: document.getElementById('asset').value, date: document.getElementById('date').value, time: document.getElementById('time').value };
  if (kind === 'social') return { caption: document.getElementById('caption').value, asset: document.getElementById('asset').value, date: document.getElementById('date').value, partnershipLabel: document.getElementById('partnershipLabel').checked };
  return { brief: state.brief };
}

function preview() {
  if (kind === 'linkedin') {
    const asset = ['winter-linkedin-landscape.svg', 'winter-reel-vertical.svg', 'winter-square-old.svg'].includes(state.asset) ? state.asset : 'winter-linkedin-landscape.svg';
    const image = document.createElement('img'); image.className = 'asset-image'; image.src = `../assets/${asset}`;
    image.alt = asset === 'winter-linkedin-landscape.svg' ? 'Approved Elseweek LinkedIn campaign visual' : 'Different campaign material: not approved for this LinkedIn post';
    document.getElementById('asset-preview').replaceChildren(image);
  }
  if (kind === 'social') {
    const isOld = state.asset === 'winter-square-old.svg';
    document.getElementById('asset-preview').innerHTML = `<img class="asset-image ${isOld ? 'square' : 'vertical'}" src="../assets/${isOld ? 'winter-square-old.svg' : 'winter-reel-vertical.svg'}" alt="${isOld ? 'Superseded square creative' : 'Approved vertical Reel creative'}">`;
  }
  if (kind === 'handover') {
    document.getElementById('brief-v1').classList.toggle('selected', state.brief === 'v1');
    document.getElementById('brief-v1').setAttribute('aria-pressed', String(state.brief === 'v1'));
    document.getElementById('brief-v2').classList.toggle('selected', state.brief === 'v2');
    document.getElementById('brief-v2').setAttribute('aria-pressed', String(state.brief === 'v2'));
    document.getElementById('brief-preview').innerHTML = state.brief === 'v1' ? '<div class="preview-status old">SELECTED · SUPERSEDED</div><p>Brief v1 proposes the full list, a price guarantee, and the square creative.</p>' : '<div class="preview-status">SELECTED · APPROVED</div><p>Brief v2 is the current production source for this campaign.</p>';
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
content.addEventListener('change', (event) => { if (event.target.matches('select,input[type="checkbox"],input[type="date"],input[type="time"]')) commit(); });
document.getElementById('load-flawed').addEventListener('click', () => { state = { ...flawed[kind] }; fill(); commit(); });
if (kind === 'handover') {
  for (const version of ['v1', 'v2']) document.getElementById(`brief-${version}`).addEventListener('click', () => { state.brief = version; commit(); });
  document.getElementById('open-email-art').addEventListener('click', () => window.desktop.openSource('emailAsset'));
  document.getElementById('open-reel-art').addEventListener('click', () => window.desktop.openSource('reelAsset'));
}
if (kind === 'linkedin') document.getElementById('open-linkedin-guide').addEventListener('click', () => window.desktop.openSource('linkedin'));
const save = document.getElementById('save');
if (save) save.addEventListener('click', () => { commit(); localStorage.setItem(`elseweek:v1:${kind}`, JSON.stringify(state)); document.getElementById('save-status').textContent = 'Draft saved on this computer.'; });
window.desktop.onSharing((isShared) => {
  const indicator = document.getElementById('share-indicator');
  indicator.textContent = isShared ? '● Shared with assistant' : 'Not shared with assistant';
  indicator.classList.toggle('active', isShared);
});
