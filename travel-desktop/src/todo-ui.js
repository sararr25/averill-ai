// To do: what needs this person's review, plus tasks assigned to them. The main process computes the list for the signed-in person only.
function todoWhen(item) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = (value) => Math.round((new Date(value).setHours(0, 0, 0, 0) - today) / 86400000);
  if (item.dueDate) {
    const left = days(`${item.dueDate}T00:00:00`);
    if (left < 0) return `Overdue by ${-left} day${left === -1 ? '' : 's'}`;
    return left === 0 ? 'Due today' : `Due in ${left} day${left === 1 ? '' : 's'}`;
  }
  if (!item.since) return 'Open now';
  const age = -days(item.since);
  return age <= 0 ? 'Waiting since today' : `Waiting ${age} day${age === 1 ? '' : 's'}`;
}
function todoOpen(item) {
  const { area, findingKey, target } = item.action;
  if (findingKey) { selectedFindingId = findingKey; showTab('review'); renderHero(); el('hero-title').focus(); return; }
  showTab(area);
  const panel = target === 'source-review' ? el('knowledge-review-queue') : target === 'clarifications' ? document.querySelector('.library-governance') : null;
  if (panel) { panel.open = true; panel.scrollIntoView({ block: 'start' }); panel.querySelector('summary').focus(); }
}
function todoGroup(title, empty, items, note) {
  const section = node('section', undefined, 'section'); section.setAttribute('aria-label', title);
  const head = node('div', undefined, 'section-head'); head.append(node('h2', title), node('span', String(items.length)));
  section.append(head, node('p', note, 'section-note'));
  if (!items.length) { section.append(node('div', empty, 'empty-state')); return section; }
  for (const item of items) {
    const card = node('article', undefined, 'knowledge-card todo-item'); card.dataset.todoId = item.id;
    card.append(node('h3', item.title), node('p', `${item.origin} · ${todoWhen(item)}`, 'knowledge-meta'));
    const actions = node('div', undefined, 'finding-actions');
    if (item.action) {
      const open = node('button', item.action.label, 'secondary-button'); open.type = 'button';
      open.setAttribute('aria-label', `${item.action.label}: ${item.title}`);
      open.addEventListener('click', () => todoOpen(item));
      actions.append(open);
    }
    if (item.taskId) {
      const done = node('button', 'Mark done', 'text-button'); done.type = 'button';
      done.setAttribute('aria-label', `Mark done: ${item.title}`);
      done.addEventListener('click', async () => {
        done.disabled = true;
        try { current = await window.desktop.completeTask(item.taskId); render(); }
        catch (error) { done.disabled = false; el('todo-status').textContent = error.message; }
      });
      actions.append(done);
    }
    card.append(actions); section.append(card);
  }
  return section;
}
function renderTodo() {
  const host = el('todo-content'), badge = el('todo-badge'), list = current.auth?.signedIn ? current.todo : null;
  if (!list) { host.replaceChildren(); delete host.dataset.key; badge.hidden = true; return; }
  badge.textContent = String(list.count); badge.hidden = list.count === 0;
  document.querySelector('[data-tab-button=todo]').setAttribute('aria-label', list.count ? `To do, ${list.count} open` : 'To do');
  const key = JSON.stringify(list);
  if (host.dataset.key === key) return;
  host.dataset.key = key;
  host.replaceChildren(
    todoGroup('Needs your review', 'Nothing needs your review right now.', list.review, 'Shared findings, source approval requests and clarification requests waiting for you.'),
    todoGroup('Your tasks', 'You have no open tasks.', list.tasks, 'Work assigned to you. Done tasks leave this list.'),
  );
}
