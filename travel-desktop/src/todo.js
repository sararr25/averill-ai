// To do list for the signed-in person only. Computed from workspace state; no person ID is ever accepted from the renderer.
// "Needs your review": shared findings, source proposals this person may decide, and clarification requests waiting for them.
// "Your tasks": open tasks assigned to this person.
const workspace = require('./workspace');

function canDecide(data, source) {
  return source.scope === 'company' ? workspace.person(data).role === 'admin' : workspace.canManage(data, source.department);
}

function list(data, findings = []) {
  const active = workspace.person(data);
  if (!active) throw new Error('Sign in first.');
  const nameOf = (personId) => data.people.find((entry) => entry.id === personId)?.name || 'a colleague';
  const review = [];
  for (const finding of findings) {
    review.push({ id: `finding:${finding.kind}:${finding.id}`, type: 'finding', title: finding.title, origin: `Shared ${finding.kind} work`, dueDate: null, since: null, action: { label: 'Review finding', area: 'review', findingKey: `${finding.kind}:${finding.id}` } });
  }
  for (const source of data.sources) {
    if (source.status !== 'pending' || source.scope === 'private' || !canDecide(data, source)) continue;
    review.push({ id: `source:${source.id}`, type: 'source', title: `Decide on ${source.title}`, origin: `Source approval request from ${nameOf(source.ownerId)}, ${source.scope === 'company' ? 'company-wide' : source.department}`, dueDate: null, since: source.createdAt, action: { label: 'Open request', area: 'knowledge', target: 'source-review' } });
  }
  for (const item of workspace.visibleClarifications(data)) {
    if (item.status !== 'pending' || item.requesterId === active.id) continue;
    if (!(active.role === 'admin' || active.role === 'lead' && active.department === item.department)) continue;
    review.push({ id: `clarification:${item.id}`, type: 'clarification', title: item.question, origin: `Private clarification request from ${nameOf(item.requesterId)}, ${item.department}`, dueDate: null, since: item.createdAt, action: { label: 'Open request', area: 'knowledge', target: 'clarifications' } });
  }
  const tasks = (data.tasks || []).filter((task) => task.assigneeId === active.id && task.status === 'open')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.createdAt.localeCompare(b.createdAt))
    .map((task) => ({ id: `task:${task.id}`, taskId: task.id, type: 'task', title: task.title, origin: task.origin, dueDate: task.dueDate, since: task.createdAt, action: task.link ? { label: 'Open', area: task.link.area } : null }));
  return { review, tasks, count: review.length + tasks.length };
}

module.exports = { list };
