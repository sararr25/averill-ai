// In-app guide progress: which screens a person finished and whether the first-run tour was offered.
// Stored in the local workspace file per person; never sent anywhere.
const screens = ['review', 'work', 'knowledge', 'learn', 'setup'];
function store(data) { data.guideProgress ||= {}; return data.guideProgress; }
function mine(data) {
  if (!data?.activePersonId) throw new Error('Sign in first.');
  return store(data)[data.activePersonId] ||= { offered: false, done: [] };
}
function snapshot(data) {
  if (!data?.activePersonId) return null;
  const entry = store(data)[data.activePersonId] || { offered: false, done: [] };
  return { offered: entry.offered, done: [...entry.done], screens };
}
function update(data, action, screen) {
  const entry = mine(data);
  if (action === 'offered') entry.offered = true;
  else if (action === 'done') {
    if (!screens.includes(screen)) throw new Error('Unknown guide screen.');
    entry.offered = true;
    if (!entry.done.includes(screen)) entry.done.push(screen);
  } else throw new Error('Unknown guide action.');
  return snapshot(data);
}
function clearMine(data) { if (data?.activePersonId && data.guideProgress) delete data.guideProgress[data.activePersonId]; }
module.exports = { screens, snapshot, update, clearMine };
