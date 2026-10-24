// In-app guide: a skippable first-run offer, a "?" control per screen and short step panels.
// Steps live in GUIDE_STEPS by screen and role (admin, lead, employee, or all); progress is saved per person on this Mac.
const GUIDE_SCREENS = {
  review: { tab: 'review', label: 'Review', anchor: '.review-hero' },
  work: { tab: 'review', label: 'Work', anchor: '#work-controls' },
  knowledge: { tab: 'knowledge', label: 'Library', anchor: '[data-tab="knowledge"] .section-head' },
  learn: { tab: 'learn', label: 'Learn', anchor: '[data-tab="learn"] .section-head' },
  setup: { tab: 'setup', label: 'Setup', anchor: '[data-tab="setup"] .section-head' },
};
const GUIDE_STEPS = {
  review: { all: [{ target: '.review-hero', title: 'Your review', body: 'Averill checks the work you share against your company’s approved rules and shows the source for every finding.' }] },
  work: { all: [{ target: '#work-controls', title: 'Share your work', body: 'Open Connection and review tools to share one draft field or one app window. You can stop sharing at any time.' }] },
  knowledge: { all: [{ target: '#knowledge-search', title: 'Company library', body: 'Search the documents your company approved. Only approved sources are used in answers and checks.' }] },
  learn: { all: [{ target: '#learning-panel', title: 'Learn while you work', body: 'Practise in your own tools and confirm each step yourself. Your learning record stays private.' }] },
  setup: { all: [{ target: '#workspace-panel', title: 'Company setup', body: 'See your department’s sources, who approved them, and your account.' }] },
};
let guideRun = null;
function guideRole() { return current.workspace?.people?.find(person => person.id === current.workspace.activePersonId)?.role || 'employee'; }
function guideSteps(screen) {
  const steps = GUIDE_STEPS[screen] || {};
  return (steps[guideRole()] || steps.all || []).map(step => ({ ...step, screen }));
}
function guideShowScreen(screen) {
  const info = GUIDE_SCREENS[screen];
  const button = document.querySelector(`[data-tab-button="${info.tab}"]`);
  if (document.body.dataset.area !== info.tab && button) button.click();
  if (screen === 'work') el('work-controls').open = true;
}
function guideClear() {
  document.querySelectorAll('.guide-target').forEach(target => target.classList.remove('guide-target'));
  document.getElementById('guide-panel')?.remove();
}
function guideClose(completed) {
  if (!guideRun) return;
  const { opener, screens } = guideRun;
  guideRun = null;
  guideClear();
  const save = completed ? Promise.all(screens.map(screen => window.desktop.guideUpdate('done', screen))) : window.desktop.guideUpdate('offered');
  save.then(results => { const latest = Array.isArray(results) ? results.at(-1) : results; if (latest) { current = latest; render(); } })
    .catch(error => { const status = el('operation-feedback'); if (status) { status.hidden = false; status.textContent = error.message; } });
  if (opener?.isConnected) opener.focus();
}
function guideShowStep() {
  guideClear();
  const { steps, index } = guideRun;
  const step = steps[index];
  guideShowScreen(step.screen);
  const target = document.querySelector(step.target) || document.querySelector(GUIDE_SCREENS[step.screen].anchor);
  if (target) { target.classList.add('guide-target'); target.scrollIntoView({ block: 'center' }); }
  const panel = node('section', undefined, 'guide-panel'); panel.id = 'guide-panel';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'guide-title');
  const count = node('p', `${GUIDE_SCREENS[step.screen].label} · Step ${index + 1} of ${steps.length}`, 'guide-count');
  const title = node('h2', step.title); title.id = 'guide-title'; title.tabIndex = -1;
  const actions = node('div', undefined, 'guide-actions');
  const skip = node('button', 'Skip tour', 'text-button'); skip.type = 'button'; skip.addEventListener('click', () => guideClose(false));
  const back = node('button', 'Back', 'secondary-button'); back.type = 'button'; back.disabled = index === 0;
  back.addEventListener('click', () => { guideRun.index--; guideShowStep(); });
  const last = index === steps.length - 1;
  const next = node('button', last ? 'Done' : 'Next', 'agent-primary'); next.type = 'button';
  next.addEventListener('click', () => { if (last) guideClose(true); else { guideRun.index++; guideShowStep(); } });
  actions.append(skip, back, next);
  panel.append(count, title, node('p', step.body), actions);
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); guideClose(false); } });
  document.body.append(panel);
  title.focus();
}
function guideStart(screens, opener) {
  const steps = screens.flatMap(guideSteps);
  if (!steps.length) return;
  document.getElementById('guide-offer')?.remove();
  guideRun = { steps, index: 0, screens, opener: opener || document.activeElement };
  guideShowStep();
}
function guideHelpButton(screen) {
  const button = node('button', '?', 'guide-help'); button.type = 'button'; button.dataset.guide = screen;
  button.setAttribute('aria-label', `Guide for ${GUIDE_SCREENS[screen].label}`); button.title = `Guide for ${GUIDE_SCREENS[screen].label}`;
  button.addEventListener('click', () => guideStart([screen], button));
  return button;
}
function renderGuide() {
  const signedIn = Boolean(current.auth?.signedIn && current.guide);
  document.querySelectorAll('.guide-help').forEach(button => { button.hidden = !signedIn; });
  if (!signedIn) { document.getElementById('guide-offer')?.remove(); if (guideRun) { guideRun = null; guideClear(); } return; }
  for (const screen of Object.keys(GUIDE_SCREENS)) {
    if (document.querySelector(`.guide-help[data-guide="${screen}"]`)) continue;
    const anchor = document.querySelector(GUIDE_SCREENS[screen].anchor);
    if (!anchor) continue;
    if (screen === 'work') anchor.before(guideHelpButton(screen)); else anchor.append(guideHelpButton(screen));
  }
  if (current.guide.offered || guideRun || document.getElementById('guide-offer')) return;
  const offer = node('section', undefined, 'guide-offer'); offer.id = 'guide-offer'; offer.setAttribute('aria-labelledby', 'guide-offer-title');
  const heading = node('h2', 'New to Averill?'); heading.id = 'guide-offer-title';
  const take = node('button', '1-minute tour', 'agent-primary'); take.type = 'button';
  take.addEventListener('click', () => guideStart(Object.keys(GUIDE_SCREENS), take));
  const skip = node('button', 'Skip', 'secondary-button'); skip.type = 'button';
  skip.addEventListener('click', () => { offer.remove(); window.desktop.guideUpdate('offered').then(next => { current = next; render(); }).catch(error => { el('operation-feedback').hidden = false; el('operation-feedback').textContent = error.message; }); });
  const actions = node('div', undefined, 'guide-actions'); actions.append(skip, take);
  offer.append(heading, node('p', 'A short tour of each screen. You can skip it now and open it later with the ? button.'), actions);
  document.body.append(offer);
}
renderGuide();
