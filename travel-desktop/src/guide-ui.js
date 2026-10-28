// In-app guide: a skippable first-run offer, a "?" control per screen and short step panels.
// Steps live in GUIDE_STEPS by screen and role (admin, lead, employee, or all); progress is saved per person on this Mac.
const GUIDE_SCREENS = {
  review: { tab: 'review', label: 'Current work', anchor: '#working-now' },
  work: { tab: 'setup', label: 'Connection tools', anchor: '#work-controls' },
  knowledge: { tab: 'knowledge', label: 'Library', anchor: '[data-tab="knowledge"] .section-head' },
  learn: { tab: 'learn', label: 'Learn', anchor: '[data-tab="learn"] .section-head' },
  setup: { tab: 'setup', label: 'Workspace settings', anchor: '[data-tab="setup"] .section-head' },
};
// target: CSS selector; match: text (or list of texts) the element must contain when several share the selector.
const NOTE = 'marketing-personal-note-v1.md';
const learnSteps = [
  { target: '#learning-panel .learning-card', title: 'Your current lesson', body: 'A short Canva lesson done in Canva. Averill ticks the steps it can see in your design; you confirm grouping once at the end.' },
  { target: '#learning-panel details.learning-card summary', match: 'Start a task-based exercise', title: 'Task-based exercises', body: 'Pick a concrete result, such as a campaign visual, and work through it step by step.' },
  { target: '#practice-section', title: 'Practise company rules', body: 'Short offline questions built from the rules your company approved.' },
];
const workSteps = [
  { target: '#work-next', title: 'Where to start', body: 'This line always tells you the next thing to do while sharing work.' },
  { target: '#browser-pair', title: 'Pairing recovery', body: 'If Connect in the Averill extension does not work, pair one browser field by hand here.' },
  { target: '#choose-external', title: 'Or share an app window', body: 'Shares one app window, for example Canva. macOS asks for Screen Recording permission first. Stop sharing at any time.' },
];
const GUIDE_STEPS = {
  review: {
    employee: [
      { target: '#working-now-title', title: 'What you are working on', body: 'Averill follows the draft you connect in Chrome, such as a Brevo email or a LinkedIn post, and checks it against Vamo’s approved rules.' },
      { target: '#extension-panel > button, #working-check', title: 'Connect, then check', body: 'Install or connect the Averill extension here. With a draft open, Check now shows what to fix and the source for every finding.' },
      { target: '#review-chat > summary', title: 'Ask about company guidance', body: 'Ask a question, for example the approved launch date. Answers quote the approved source.' },
    ],
    lead: [
      { target: '#working-now-title', title: 'Review as Marketing lead', body: 'Connect any Marketing draft and check it against the rules you approved, with the source for every finding.' },
      { target: '#extension-panel > button, #working-check', title: 'Connect, then check', body: 'Install or connect the Averill extension here, then use Check now on the draft your team is working on.' },
      { target: '#review-chat > summary', title: 'Ask about company guidance', body: 'Check what the approved brief says before you approve a campaign.' },
    ],
    admin: [
      { target: '#working-now-title', title: 'Review as owner', body: 'The same check your team uses: drafts against approved rules, with the source for every finding.' },
      { target: '#extension-panel > button, #working-check', title: 'Try a check yourself', body: 'Connect a draft and press Check now to see what your team sees when a rule is broken.' },
    ],
  },
  work: { all: workSteps },
  knowledge: {
    employee: [
      { target: '#knowledge-search', title: 'Search approved documents', body: 'Find what Vamo has approved, for example the campaign brief or the brand and legal guidance.' },
      { target: '#knowledge-summary', title: 'What you can see', body: 'Approved Marketing documents, plus your own proposal while it waits for review.' },
      { target: '#rules-panel', title: 'Company rules', body: 'The rules Averill checks your drafts against, each linked to its source document.' },
    ],
    lead: [
      { target: '#knowledge-summary', title: 'One item to review', body: 'Emma proposed her practice note to Marketing. It is not used until you approve it.' },
      { target: '#knowledge-review-queue', title: 'Source approval requests', body: 'Also listed under To do. Open the proposal, read it, then approve or reject it.' },
      { target: '#knowledge-conflicts', title: 'Show conflicts', body: 'Two versions of social-media-guidelines.md are both approved. Averill uses neither until you decide.' },
    ],
    admin: [
      { target: '#knowledge-department', title: 'Every department', body: 'As owner you see Marketing, Operations and People documents. Filter by department here.' },
      { target: '#knowledge-review-queue', title: 'Approval requests', body: 'Also listed under To do. Proposals waiting for a decision across the company.' },
      { target: '#rules-panel', title: 'Company rules', body: 'Every rule Averill checks, with the document and version it comes from.' },
    ],
  },
  learn: { all: learnSteps },
  setup: {
    employee: [
      { target: '#workspace-panel .workspace-source', match: NOTE, title: 'Your proposal', body: 'Your practice note is proposed to Marketing and waits for Maya’s review.' },
      { target: '.workspace-conflict', title: 'A version conflict', body: 'Two versions of the social media guidelines are approved. Maya decides which one applies.' },
      { target: '.account-management', title: 'Your account', body: 'Change your own local password here. Accounts stay on this Mac.' },
    ],
    lead: [
      { target: '.workspace-conflict', title: 'Resolve the conflict', body: 'Versions 1 and 2 of social-media-guidelines.md are both approved.' },
      { target: '#workspace-panel .workspace-source', match: ['social-media-guidelines.md', 'v1 '], title: 'Supersede version 1', body: 'Choose Supersede on version 1 so only version 2 is used.' },
      { target: '#workspace-panel .workspace-source', match: NOTE, title: 'Emma’s proposal', body: 'Read it with Open, then Approve it for the Marketing team.' },
    ],
    admin: [
      { target: '.setup-group > summary', match: 'Team and account access', title: 'Your team', body: 'Everyone at Vamo, their role and department, and their login documents.' },
      { target: '#public-site-section', title: 'Website check', body: 'Add Vamo’s public website to compare it with approved sources. Reading the site uses Tavily and needs a Tavily key.' },
      { target: '.workspace-conflict', title: 'Open decisions', body: 'This conflict waits for the Marketing lead. You can see it, but the lead decides.' },
    ],
  },
};
let guideRun = null;
function guideRole() { return current.workspace?.people?.find(person => person.id === current.workspace.activePersonId)?.role || 'employee'; }
function guideSteps(screen) {
  const steps = GUIDE_STEPS[screen] || {};
  return (steps[guideRole()] || steps.all || []).map(step => ({ ...step, screen }));
}
function guideTarget(step) {
  const texts = [].concat(step.match || []);
  return [...document.querySelectorAll(step.target)].find(element => !element.closest('[hidden]') && texts.every(text => element.textContent.includes(text))) || null;
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
  const target = guideTarget(step) || document.querySelector(GUIDE_SCREENS[step.screen].anchor);
  if (target) {
    for (let parent = target.closest('details'); parent; parent = parent.parentElement?.closest('details')) parent.open = true;
    target.classList.add('guide-target'); target.scrollIntoView({ block: 'center' });
  }
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
