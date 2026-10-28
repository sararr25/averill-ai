// Weekly practice page and task exercise page (T7.0 to T7.3). Loaded before learning-ui.js, which calls
// renderWeeklyPractice() and renderProjectPage(). Answers are kept in memory only until "Submit practice"; nothing is saved per question.
const practiceDraft = { key: '', answers: {}, moved: {}, tried: false };
function practiceDraftFor(quiz) {
  const key = `${quiz.id}:${quiz.attempt}`;
  if (practiceDraft.key !== key) Object.assign(practiceDraft, { key, answers: {}, moved: {}, tried: false });
  return practiceDraft;
}
const practiceSrc = picture => `../assets/learn/${picture.file}`;
function practiceImg(picture, className) {
  const img = node('img', undefined, className); img.src = practiceSrc(picture); img.alt = picture.alt; img.loading = 'lazy'; img.decoding = 'async';
  return img;
}
function practiceOrderValue(question, draft) { return draft.answers[question.id] || question.items.map(item => item.id); }
function practiceAnswered(question, draft) {
  if (question.type === 'task') return true;
  if (question.type === 'order') return Boolean(draft.moved[question.id]);
  return typeof draft.answers[question.id] === 'string';
}

// Radio group for the choose-a-picture, choose-an-answer and tap-the-spot types. Native radios: arrow keys move, Space selects.
function practiceChoices(question, draft, onChange, result) {
  const name = `practice-${question.id}`, group = node('div', undefined, `practice-options ${question.type}`);
  const mark = (label, id) => { if (!result) return; label.classList.toggle('is-yours', result.value === id); label.classList.toggle('is-right', result.right === id); };
  const radio = (id, labelText) => {
    const input = node('input', undefined, 'visually-hidden'); input.type = 'radio'; input.name = name; input.value = id; input.checked = draft.answers[question.id] === id || (result && result.value === id); input.disabled = Boolean(result);
    if (labelText) input.setAttribute('aria-label', labelText);
    input.addEventListener('change', () => { draft.answers[question.id] = id; onChange(); });
    return input;
  };
  if (question.type === 'tap') {
    const stage = node('div', undefined, 'practice-tap'); stage.append(practiceImg(question.picture, 'practice-picture'));
    for (const area of question.areas) {
      const label = node('label', undefined, 'tap-area'); Object.assign(label.style, { left: `${area.x}%`, top: `${area.y}%`, width: `${area.w}%`, height: `${area.h}%` });
      label.append(radio(area.id, area.label), node('span', undefined, 'tap-mark')); mark(label, area.id); stage.append(label);
    }
    group.append(stage); return group;
  }
  for (const option of question.options) {
    const label = node('label', undefined, question.type === 'picture' ? 'practice-pick' : 'practice-choice');
    label.append(radio(option.id, null));
    if (question.type === 'picture') { label.append(practiceImg(option.picture, 'practice-picture'), node('span', option.label, 'practice-caption')); }
    else label.append(node('span', option.label));
    mark(label, option.id); group.append(label);
  }
  return group;
}

// Put-in-order list. Every step has Move up / Move down buttons, so the order can be set with keyboard or screen reader alone.
function practiceOrder(question, draft, onChange, result) {
  const list = node('ol', undefined, 'practice-order'), live = node('p', '', 'visually-hidden'); live.setAttribute('role', 'status');
  if (result) { for (const text of result.yours.split(' → ')) list.append(node('li', text)); return list; }
  const paint = focus => {
    const order = practiceOrderValue(question, draft), label = id => question.items.find(item => item.id === id).label;
    list.replaceChildren();
    order.forEach((id, index) => {
      const item = node('li'), text = node('span', label(id), 'step-text'), actions = node('span', undefined, 'order-actions');
      for (const [direction, name] of [[-1, 'Move up'], [1, 'Move down']]) {
        const button = node('button', undefined, `order-move ${direction < 0 ? 'up' : 'down'}`); button.type = 'button'; button.innerHTML = icon('arrow-up');
        button.setAttribute('aria-label', `${name}: ${label(id)}`); button.disabled = index + direction < 0 || index + direction >= order.length;
        button.addEventListener('click', () => {
          const next = [...order]; [next[index], next[index + direction]] = [next[index + direction], next[index]];
          draft.answers[question.id] = next; draft.moved[question.id] = true; onChange();
          live.textContent = `${label(id)} moved to position ${index + direction + 1} of ${order.length}.`;
          paint({ id, direction });
        });
        actions.append(button);
      }
      item.append(text, actions); list.append(item);
    });
    if (focus) { const target = [...list.querySelectorAll('button:not(:disabled)')].find(b => b.getAttribute('aria-label') === `${focus.direction < 0 ? 'Move up' : 'Move down'}: ${question.items.find(i => i.id === focus.id).label}`) || [...list.querySelectorAll('button:not(:disabled)')].find(b => b.getAttribute('aria-label').endsWith(`: ${question.items.find(i => i.id === focus.id).label}`)); target?.focus(); }
  };
  paint(null);
  const wrap = node('div'); wrap.append(list, live); return wrap;
}

function practiceTask(question, onChange) {
  const box = node('div', undefined, 'practice-task'), result = question.result;
  box.append(node('p', question.task.instruction), node('p', question.task.help, 'field-hint'));
  const state = node('p', undefined, `practice-task-state ${question.ticked || result?.kind === 'checked-by-averill' ? 'seen' : ''}`);
  state.textContent = result ? (result.kind === 'checked-by-averill' ? 'Done. Checked by Averill in your open design.' : 'Done. Confirmed by you.')
    : question.ticked ? 'Checked by Averill in your open design.'
    : question.task.check === 'auto' ? 'Not seen in your design yet. Averill reads the open Canva design after you click the Averill icon in Chrome, Connect this tab and turn on Watch my design.'
    : 'Averill cannot see this. You confirm it once for the whole page.';
  box.append(state);
  if (!result) {
    const open = node('button', undefined, 'secondary-button'); open.type = 'button'; open.innerHTML = icon('arrow-up-right');
    open.append(document.createTextNode(question.tool === 'Brevo' ? 'Open Brevo' : 'Open Canva'));
    open.addEventListener('click', () => window.desktop.openWeb(question.tool === 'Brevo' ? 'https://app.brevo.com/' : 'https://www.canva.com/'));
    box.append(open);
  }
  return box;
}

function practiceFeedback(question) {
  const r = question.result, box = node('div', undefined, 'practice-feedback');
  if (question.type === 'task') { box.append(node('p', question.result.explanation)); return box; }
  const badge = node('p', undefined, `practice-badge ${r.correct ? 'right' : 'wrong'}`); badge.innerHTML = icon(r.correct ? 'check-circle' : 'warning'); badge.append(document.createTextNode(r.correct ? 'Right' : 'Not quite'));
  box.append(badge, node('p', `Your answer: ${r.yours}`));
  if (!r.correct) box.append(node('p', `Right answer: ${r.right}`));
  else box.append(node('p', `Right answer: ${r.right}`, 'visually-hidden'));
  box.append(node('p', r.explanation));
  if (r.rule) {
    const cite = node('blockquote', undefined, 'practice-rule'); cite.append(node('cite', `${r.rule.title}${r.rule.version ? ` · v${r.rule.version}` : ''}`), node('span', `“${r.rule.quote}”`));
    box.append(cite);
  }
  return box;
}

async function practiceAction(kind, payload, errorBox, after) {
  const status = el('learning-status'); status.textContent = 'Saving…';
  try { current = await window.desktop.learningAction(kind, payload); render(); status.textContent = 'Saved on this computer.'; after?.(); }
  catch (error) { status.textContent = ''; errorBox.textContent = error.message; }
}

function renderWeeklyPractice(quiz, data, refreshInstruction) {
  const draft = practiceDraftFor(quiz), card = node('article', undefined, 'learning-card weekly-practice');
  const title = node('h3', quiz.outdated ? 'Weekly practice needs updating' : quiz.finishedAt ? 'Weekly practice complete' : 'Weekly practice'); title.tabIndex = -1;
  card.append(title, node('p', 'Feedback supports learning. It is not an employee performance or mastery score.'));
  const questions = quiz.questions, needAnswer = questions.filter(q => q.type !== 'task' && !q.result);
  const total = questions.filter(q => q.type !== 'task').length;
  const progress = node('div', undefined, 'practice-progress'), progressText = node('p', undefined, 'practice-progress-text'), bar = node('progress'); bar.max = total || 1; bar.setAttribute('aria-label', 'Questions answered');
  progress.append(progressText, bar);
  const form = node('form', undefined, 'practice-form'); form.noValidate = true;
  const error = node('p', '', 'practice-error'); error.setAttribute('role', 'alert');
  const submit = node('button', 'Submit practice', 'agent-primary'); submit.type = 'submit';
  const openTasks = questions.filter(q => q.type === 'task' && !q.result && !q.ticked);
  const update = () => {
    const done = total - needAnswer.filter(q => !practiceAnswered(q, draft)).length;
    progressText.textContent = `${done} of ${total} answered`; bar.value = done; error.textContent = '';
  };
  card.append(progress);
  const list = node('ol', undefined, 'practice-list');
  questions.forEach((question, index) => {
    const item = node('li', undefined, `practice-q${question.result ? (question.result.correct === false ? ' wrong' : ' right') : ''}`); item.dataset.type = question.type;
    const set = node('fieldset', undefined, 'practice-set'), legend = node('legend', undefined, 'practice-legend');
    legend.append(node('span', `${index + 1} · ${question.typeLabel}`, 'practice-type'), node('span', question.prompt, 'practice-prompt'));
    set.append(legend);
    if (!question.available) { set.append(node('p', `This activity or source changed. ${refreshInstruction}`)); item.append(set); list.append(item); return; }
    if (question.type !== 'picture' && question.type !== 'tap') set.append(practiceImg(question.picture, 'practice-picture wide'));
    if (question.type === 'tap') set.append(practiceChoices(question, draft, update, question.result && { value: question.result.value, right: question.result.answer }));
    else if (question.type === 'order') set.append(practiceOrder(question, draft, update, question.result));
    else if (question.type === 'task') set.append(practiceTask(question, update));
    else set.append(practiceChoices(question, draft, update, question.result && { value: question.result.value, right: question.result.answer }));
    item.append(set); if (question.result) item.append(practiceFeedback(question)); list.append(item);
  });
  form.append(list);
  if (!quiz.finishedAt || needAnswer.length || openTasks.length) {
    if (openTasks.length) {
      const confirm = node('label', undefined, 'practice-confirm'), box = node('input'); box.type = 'checkbox'; box.checked = draft.tried;
      box.addEventListener('change', () => { draft.tried = box.checked; error.textContent = ''; });
      confirm.append(box, document.createTextNode(' I tried these myself.')); form.append(confirm);
    }
    submit.disabled = quiz.outdated; form.append(submit, error);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const missing = needAnswer.filter(q => !practiceAnswered(q, draft));
      if (missing.length) { error.textContent = `Answer every question before you submit: ${missing.length} left.`; return; }
      if (openTasks.length && !draft.tried) { error.textContent = 'Confirm that you tried these tasks yourself.'; return; }
      const answers = Object.fromEntries(needAnswer.map(q => [q.id, q.type === 'order' ? practiceOrderValue(q, draft) : draft.answers[q.id]]));
      practiceAction('quiz-submit', { quizId: quiz.id, answers, tried: draft.tried }, error, () => el('learning-panel').querySelector('.weekly-practice h3')?.focus());
    });
    update();
  } else progress.hidden = true;
  card.append(form);
  if (quiz.finishedAt && !quiz.outdated) {
    const wrong = questions.filter(q => q.result?.correct === false).length, summary = node('div', undefined, 'practice-summary');
    summary.append(node('p', quiz.score ? `${quiz.score.right} of ${quiz.score.total} right` : 'Submitted', 'practice-score'));
    if (wrong) {
      const retry = node('button', 'Retry wrong answers', 'secondary-button'); retry.type = 'button'; retry.innerHTML = icon('arrow-clockwise'); retry.append(document.createTextNode('Retry wrong answers'));
      const retryError = node('p', '', 'practice-error'); retryError.setAttribute('role', 'alert');
      retry.addEventListener('click', () => practiceAction('quiz-retry', { quizId: quiz.id }, retryError, () => el('learning-panel').querySelector('.weekly-practice .practice-q:not(.right):not(.wrong) input,.weekly-practice .practice-q:not(.right):not(.wrong) button')?.focus()));
      summary.append(retry, retryError);
    }
    const topic = questions.find(q => q.result?.correct === false && q.stepId); const step = data.steps.find(s => s.id === topic?.stepId);
    if (step) summary.append(node('p', `Next practice: ${step.title}. Try it again in a new layout and consult the guide.`, 'learning-feedback'));
    const note = node('details', undefined, 'practice-note'); note.open = Boolean(quiz.note); note.append(node('summary', 'Add an optional note'));
    const noteForm = node('form', undefined, 'workspace-form'), noteLabel = node('label', 'A note for yourself. It is not graded.'), noteText = node('textarea'); noteText.maxLength = 1000; noteText.rows = 3; noteText.value = quiz.note || ''; noteLabel.append(noteText);
    const noteError = node('p', '', 'practice-error'); noteError.setAttribute('role', 'alert');
    const save = node('button', 'Save note', 'secondary-button'); save.type = 'submit'; noteForm.append(noteLabel, save, noteError);
    noteForm.addEventListener('submit', event => { event.preventDefault(); practiceAction('quiz-note', { quizId: quiz.id, note: noteText.value }, noteError); });
    note.append(noteForm); summary.append(note); card.append(summary);
  }
  return card;
}

// T7.3: a task exercise is one page. Steps Averill can see in the Canva design tick themselves; one confirmation finishes the page.
function renderProjectPage(session, data) {
  const project = node('article', undefined, 'learning-card project-exercise'); project.dataset.projectId = session.project.id;
  const earlier = new Set(session.confirmed.map(c => c.id)), autos = session.project.auto || [], checks = session.project.checks || {};
  const autoSteps = session.project.steps.map((text, index) => ({ index, auto: autos[index] || null })).filter(step => step.auto && !earlier.has(`project:${step.index}`));
  const seen = autoSteps.filter(step => checks[step.auto]).length;
  project.append(node('h3', session.title), node('p', autoSteps.length ? `${seen} of ${autoSteps.length} steps seen in your Canva design · ${session.project.tool}` : `${session.project.steps.length} steps · ${session.project.tool} · you confirm them once at the end`, 'section-note'));
  if (session.source) { project.append(node('p', `${session.source.title} · v${session.source.version}${session.sourceAvailable ? '' : ' · approval/version changed; verify the current source'}`)); if (session.sourceAvailable) { const read = node('button', 'Read linked source', 'source-link'); read.type = 'button'; read.addEventListener('click', () => showSource(session.source.id, read)); project.append(read); } }
  if (session.project.demoSource) { const demo = node('button', 'Read supplied demo guidance', 'source-link'); demo.type = 'button'; demo.addEventListener('click', () => showSource(session.project.demoSource, demo)); project.append(demo); } else project.append(guideLink(data.guide));
  const list = node('ol', undefined, 'lesson-steps');
  session.project.steps.forEach((text, index) => {
    const auto = autos[index] || null, earlierDone = earlier.has(`project:${index}`), done = earlierDone || Boolean(auto && checks[auto]), kind = done ? 'done' : auto ? 'todo' : 'confirm';
    const li = node('li', undefined, `lesson-step ${kind}`), mark = node('span', undefined, 'lesson-mark'); mark.innerHTML = icon(kind === 'done' ? 'check-circle' : kind === 'confirm' ? 'pencil-simple-line' : 'seal-check');
    const body = node('div'); body.append(node('h4', text), node('small', earlierDone ? 'Confirmed by you earlier' : done ? 'Checked by Averill in your design' : auto ? 'Not seen in your design yet' : 'Averill cannot see this. You confirm it below.'));
    li.append(mark, body); list.append(li);
  });
  project.append(list);
  const form = node('form', undefined, 'lesson-finish'), noteLabel = node('label', 'Optional note: what you made or checked, for example the file name.'), note = node('textarea'); note.maxLength = 1000; note.rows = 3; noteLabel.append(note);
  const agree = node('label'), box = node('input'); box.type = 'checkbox'; box.required = true; agree.append(box, document.createTextNode(autoSteps.length ? ' I did the steps Averill cannot see myself.' : ' I did these steps myself and checked the results.'));
  const submit = node('button', 'Finish exercise', 'agent-primary'); submit.type = 'submit'; submit.disabled = seen < autoSteps.length;
  form.append(noteLabel, agree, submit);
  if (seen < autoSteps.length) form.append(node('p', 'Finish unlocks when Averill has seen the Canva steps in your design.', 'field-hint'));
  form.addEventListener('submit', event => { event.preventDefault(); learnAction('project-finish', { sessionId: session.id, note: note.value }); });
  project.append(form);
  if (autoSteps.length) {
    const open = node('button', undefined, 'secondary-button'); open.type = 'button'; open.innerHTML = icon('arrow-up-right'); open.append(document.createTextNode('Open Canva')); open.addEventListener('click', () => window.desktop.openWeb('https://www.canva.com/'));
    project.append(node('p', 'In Canva, open an Instagram post design, click the Averill icon in Chrome, Connect this tab, then turn on Watch my design.', 'field-hint'), open);
    const self = node('details'); self.append(node('summary', 'I cannot connect Canva'));
    const selfForm = node('form'), selfAgree = node('label'), selfBox = node('input'); selfBox.type = 'checkbox'; selfBox.required = true; selfAgree.append(selfBox, document.createTextNode(' I did every step myself. Record them as confirmed by me, not checked by Averill.'));
    const selfSubmit = node('button', 'Finish with my own confirmation', 'secondary-button'); selfSubmit.type = 'submit'; selfForm.append(selfAgree, selfSubmit);
    selfForm.addEventListener('submit', event => { event.preventDefault(); learnAction('project-finish', { sessionId: session.id, note: note.value, selfConfirmAll: true }); });
    self.append(selfForm); project.append(self);
  }
  return project;
}
