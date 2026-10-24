let queue = Promise.resolve();
const CONNECT_ENDPOINT = 'http://127.0.0.1:43147/connect';
function validPair(pair) { return /^http:\/\/127\.0\.0\.1:\d+\/observation$/.test(pair?.endpoint || '') && /^[a-f0-9]{64}$/.test(pair?.token || ''); }
async function stopPair() {
  const { pair } = await chrome.storage.session.get('pair');
  await chrome.storage.session.remove('pair');
  if (!pair) return;
  try { await fetch(pair.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ kind: 'stop', tabId: pair.tabId, pageOrigin: pair.pageOrigin, sequence: pair.sequence + 1 }), signal: AbortSignal.timeout(3000) }); } catch {}
  try { await chrome.tabs.sendMessage(pair.tabId, { kind: 'stop' }); } catch {}
}
async function connectTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!/^https?:/.test(tab?.url || '')) throw new Error('Open the draft in a normal HTTP/HTTPS tab first.');
  await stopPair();
  let pair;
  if (message.kind === 'connect-tab') {
    let response;
    try { response = await fetch(CONNECT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tabId: tab.id, pageOrigin: new URL(tab.url).origin }), signal: AbortSignal.timeout(90000) }); }
    catch { throw new Error('Averill is not reachable. Open the latest Averill app, sign in, then connect again. An older Averill version cannot connect.'); }
    pair = await response.json();
    if (!response.ok) throw new Error(pair.error || 'Connect the browser in Averill first.');
  } else pair = message.pair;
  if (!validPair(pair)) throw new Error('Start a fresh connection from Averill.');
  await chrome.storage.session.set({ pair: { endpoint: pair.endpoint, token: pair.token, tabId: tab.id, pageOrigin: new URL(tab.url).origin, sequence: 0 } });
  try { await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['editor-adapter.js', 'content.js'] }); }
  catch { await stopPair(); throw new Error('This page does not allow the companion. Choose a supported draft page.'); }
  return { connected: true };
}
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (['connect-tab', 'pair-tab', 'stop-pair'].includes(message.kind)) {
    if (sender.tab || sender.id !== chrome.runtime.id) { reply({ error: 'Extension control required.' }); return; }
    queue = queue.then(() => message.kind === 'stop-pair' ? stopPair().then(() => ({ stopped: true })) : connectTab(message));
    queue.then(reply, error => reply({ error: error.message })); queue = queue.catch(() => {}); return true;
  }
  const contextual = ['review', 'proposal', 'open'].includes(message.kind);
  const relay = async () => {
    const { pair } = await chrome.storage.session.get('pair');
    if (!validPair(pair) || sender.tab?.id !== pair.tabId || sender.frameId !== 0 || sender.origin !== pair.pageOrigin) return { stopped: true };
    if (!contextual && !['field', 'heartbeat', 'editing', 'stop'].includes(message.kind)) return { error: 'Unsupported action.' };
    const payload = contextual
      ? { kind: message.kind, task: message.task, fieldId: message.fieldId, revision: message.revision, reviewId: message.reviewId, findingId: message.findingId, useAI: message.useAI === true, consent: message.consent === true }
      : { kind: message.kind, sequence: ++pair.sequence, field: message.field, reason: message.reason };
    if (!contextual) await chrome.storage.session.set({ pair });
    try {
      const response = await fetch(contextual ? pair.endpoint.replace('/observation', '/context') : pair.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ ...payload, tabId: pair.tabId, pageOrigin: pair.pageOrigin }), signal: AbortSignal.timeout(contextual ? 45000 : 4000) });
      const latest = (await chrome.storage.session.get('pair')).pair;
      if (latest?.token !== pair.token) return { stopped: true };
      if (!response.ok) {
        if (contextual && response.status === 400) return { error: 'The draft or company guidance changed. Review this field again.' };
        throw new Error('Disconnected');
      }
      if (message.kind === 'stop') { await chrome.storage.session.remove('pair'); return { stopped: true }; }
      return await response.json();
    } catch {
      // A slow review must not block editing/heartbeats or erase a healthy local connection.
      if (contextual) return { error: 'The check could not finish. Try again.' };
      if ((await chrome.storage.session.get('pair')).pair?.token === pair.token) await chrome.storage.session.remove('pair');
      return { stopped: true };
    }
  };
  // Reviews can wait for the provider while ordered observation events invalidate them immediately.
  if (contextual) relay().then(reply, () => reply({ error: 'Try a fresh review.' }));
  else { queue = queue.then(relay); queue.then(reply, () => reply({ stopped: true })); queue = queue.catch(() => {}); }
  return true;
});
chrome.tabs.onRemoved.addListener(async id => { if ((await chrome.storage.session.get('pair')).pair?.tabId === id) await stopPair(); });
