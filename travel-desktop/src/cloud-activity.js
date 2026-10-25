// Local, per-person record of Nebius/Tavily calls. Stores counts and purposes only, never payload text.
const MAX = 200;
const FIELDS = ['service', 'purpose', 'kind', 'model', 'ok', 'status', 'items', 'ms', 'label', 'via'];

function record(data, personId, entry, now = new Date()) {
  if (!data || !personId) return;
  data.cloudActivity ||= {};
  const list = data.cloudActivity[personId] ||= [];
  const row = { at: now.toISOString() };
  for (const field of FIELDS) if (entry[field] !== undefined) row[field] = entry[field];
  list.push(row);
  if (list.length > MAX) list.splice(0, list.length - MAX);
}

function forPerson(data, personId) { return [...(data?.cloudActivity?.[personId] || [])].reverse().slice(0, 50); }

// Admin view: totals per service, no per-person queries or purposes.
function summary(data) {
  const totals = {};
  for (const list of Object.values(data?.cloudActivity || {})) for (const row of list) {
    if (row.kind === 'summary') continue; // a one-line recap of calls that are already counted
    const item = totals[row.service] ||= { calls: 0, failed: 0 };
    item.calls += 1; if (!row.ok) item.failed += 1;
  }
  return totals;
}

module.exports = { record, forPerson, summary };
