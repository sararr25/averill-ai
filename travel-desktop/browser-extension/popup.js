const el = id => document.getElementById(id);
const status = el('status');
let busy = false, action = null;
// The popup reads the worker's state every time it opens, then keeps it fresh while open.
async function refresh() {
  const state = await chrome.runtime.sendMessage({ kind: 'status' });
  if (state.error) throw new Error(state.error);
  render(state);
}
function render(state) {
  const connected = state.state === 'connected', waiting = state.state === 'waiting';
  el('pill').textContent = connected ? 'Connected' : waiting ? 'Waiting' : 'Not connected';
  el('pill').className = connected ? 'pill' : 'pill off';
  el('steps').hidden = state.state !== 'not-connected';
  if (connected) {
    el('title').textContent = `Connected to ${state.host}`;
    el('detail').textContent = 'Click a draft field on this page, then Ask Averill. Sharing stays on until you stop it, sign out of Averill, close this tab or open another site in it.';
  } else if (waiting) {
    el('title').textContent = 'Waiting for approval in Averill';
    el('detail').textContent = `Averill asks whether to connect ${state.host}. Choose Connect in the Averill window.`;
  } else {
    el('title').textContent = 'Not connected';
    el('detail').textContent = state.state === 'connected-elsewhere' ? `Averill is connected to ${state.host} in another tab. Connecting here stops sharing there.`
      : state.state === 'ended' ? window.AverillEndReasons.message(state.reason)
      : state.page === false ? 'Open your draft in a normal web page first.' : 'Follow these steps to get guidance next to your draft.';
  }
  action = connected ? 'stop' : waiting ? null : 'connect';
  el('primary').hidden = !action;
  el('primary').textContent = action === 'stop' ? 'Stop sharing' : 'Connect this tab';
  el('primary').disabled = busy || (action === 'connect' && state.page === false);
}
async function connect(kind) {
  busy = true; el('primary').disabled = true; el('share').disabled = true; status.textContent = '';
  try {
    const pair = kind === 'pair-tab' ? JSON.parse(el('pair').value) : undefined;
    const value = await chrome.runtime.sendMessage({ kind, pair });
    if (value.error) throw new Error(value.error);
    el('pair').value = '';
  } catch (error) { status.textContent = error.message; }
  finally { busy = false; el('share').disabled = false; await refresh().catch(error => { status.textContent = error.message; }); }
}
el('primary').addEventListener('click', async () => {
  if (action === 'connect') return connect('connect-tab');
  if (action === 'stop') {
    const value = await chrome.runtime.sendMessage({ kind: 'stop-pair' });
    status.textContent = value.error || '';
    await refresh().catch(error => { status.textContent = error.message; });
  }
});
el('share').addEventListener('click', () => connect('pair-tab'));
refresh().catch(error => { el('title').textContent = 'Not connected'; status.textContent = error.message; });
setInterval(() => { refresh().catch(error => { status.textContent = error.message; }); }, 1000);
