importScripts('end-reasons.js');
const { isReason } = globalThis.AverillEndReasons;
const CONNECT_ENDPOINT = 'http://127.0.0.1:43147/connect';
const CONTENT_FILES = ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'content.js'];
// Session-long connection (owner decision D1): 3 tries with backoff before Averill counts as closed.
const RETRY_DELAYS_MS = [500, 1500];
const RELAY_TIMEOUT_MS = 4000;
let queue = Promise.resolve();
function enqueue(task) { const run = queue.then(task); queue = run.catch(() => {}); return run; }
function validPair(pair) { return /^http:\/\/127\.0\.0\.1:\d+\/observation$/.test(pair?.endpoint || '') && /^[a-f0-9]{64}$/.test(pair?.token || ''); }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function hostOf(url) { try { return new URL(url).host; } catch { return ''; } }

// In-memory mirror of session storage. Every check-and-change happens synchronously on this
// object, so an end and an in-flight relay cannot resurrect each other's state.
let state = null;
async function load() {
  if (!state) {
    const saved = await chrome.storage.session.get(['pair', 'ended', 'connecting']);
    if (!state) state = { pair: saved.pair || null, ended: saved.ended || null, connecting: saved.connecting || null };
  }
  return state;
}
function persist() { return chrome.storage.session.set({ pair: state.pair, ended: state.ended, connecting: state.connecting }); }

async function setBadge(tabId, on) {
  // The tab may already be closed; a missing badge is cosmetic and never changes sharing state.
  try {
    await chrome.action.setBadgeText({ tabId, text: on ? 'ON' : '' });
    if (on) await chrome.action.setBadgeBackgroundColor({ tabId, color: '#2f6b3a' });
  } catch {}
}
async function tellBridge(pair, reason) {
  // Best effort: the bridge may already be gone. The local end below is authoritative.
  try { await fetch(pair.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ kind: 'stop', endReason: reason, tabId: pair.tabId, pageOrigin: pair.pageOrigin, sequence: pair.sequence + 1 }), signal: AbortSignal.timeout(3000) }); } catch {}
}
async function endPair(reason, { notifyBridge = false, notifyPage = true } = {}) {
  if (!isReason(reason)) throw new Error(`Unknown end reason: ${reason}`);
  const s = await load(); const pair = s.pair;
  if (!pair) return;
  s.pair = null; s.ended = { tabId: pair.tabId, host: hostOf(pair.pageOrigin), reason, at: Date.now() };
  await persist();
  await setBadge(pair.tabId, false);
  if (notifyBridge) await tellBridge(pair, reason);
  // The page may have navigated or closed; then there is no card left to update.
  if (notifyPage) { try { await chrome.tabs.sendMessage(pair.tabId, { kind: 'ended', reason }); } catch {} }
}
function endedFor(tabId) { return state?.ended?.tabId === tabId ? state.ended.reason : 'lost_contact'; }

async function inject(tabId) { await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES }); }
async function contentAlive(tabId) {
  try { return (await chrome.tabs.sendMessage(tabId, { kind: 'ping' }))?.alive === true; } catch { return false; }
}

async function connectTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!/^https?:/.test(tab?.url || '')) throw new Error('Open the draft in a normal HTTP/HTTPS tab first.');
  const pageOrigin = new URL(tab.url).origin;
  const s = await load();
  if (s.pair) await endPair('stopped_by_user', { notifyBridge: true });
  let pair;
  if (message.kind === 'connect-tab') {
    s.connecting = { tabId: tab.id, host: hostOf(tab.url) }; await persist();
    try {
      let response;
      try { response = await fetch(CONNECT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tabId: tab.id, pageOrigin }), signal: AbortSignal.timeout(90000) }); }
      catch { throw new Error('Averill is not reachable. Open the latest Averill app, sign in, then connect again. An older Averill version cannot connect.'); }
      pair = await response.json();
      if (!response.ok) throw new Error(pair.error || 'Connect the browser in Averill first.');
    } finally { s.connecting = null; await persist(); }
  } else pair = message.pair;
  if (!validPair(pair)) throw new Error('Start a fresh connection from Averill.');
  s.pair = { endpoint: pair.endpoint, token: pair.token, tabId: tab.id, pageOrigin, sequence: 0 }; s.ended = null;
  await persist();
  try { await inject(tab.id); }
  catch {
    await endPair('lost_contact', { notifyBridge: true, notifyPage: false });
    throw new Error('This page does not allow the companion. Choose a supported draft page.');
  }
  await setBadge(tab.id, true);
  return { connected: true };
}

async function popupStatus() {
  const s = await load();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (s.connecting) return { state: 'waiting', host: s.connecting.host };
  if (s.pair && s.pair.tabId === tab?.id) return { state: 'connected', host: hostOf(s.pair.pageOrigin) };
  const page = /^https?:/.test(tab?.url || '');
  if (s.pair) return { state: 'connected-elsewhere', host: hostOf(s.pair.pageOrigin), page };
  if (s.ended && s.ended.tabId === tab?.id) return { state: 'ended', reason: s.ended.reason, host: s.ended.host, page };
  return { state: 'not-connected', host: hostOf(tab?.url), page };
}

// Observation events stay ordered. Each attempt takes a fresh sequence number, so a retry after a
// slow reply can never be rejected as stale.
async function relayEvent(message, sender) {
  const s = await load(); const pair = s.pair;
  if (!validPair(pair) || sender.tab?.id !== pair.tabId || sender.frameId !== 0 || sender.origin !== pair.pageOrigin) return { stopped: true, reason: endedFor(sender.tab?.id) };
  if (message.kind === 'stop') { await endPair('stopped_by_user', { notifyBridge: true, notifyPage: false }); return { stopped: true, reason: 'stopped_by_user' }; }
  const event = { kind: message.kind, field: message.field, reason: message.reason, paused: message.kind === 'heartbeat' && message.paused === true };
  for (let attempt = 0; ; attempt++) {
    if (s.pair?.token !== pair.token) return { stopped: true, reason: endedFor(pair.tabId) };
    const sequence = ++s.pair.sequence; persist();
    let response = null;
    try { response = await fetch(pair.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ ...event, sequence, tabId: pair.tabId, pageOrigin: pair.pageOrigin }), signal: AbortSignal.timeout(RELAY_TIMEOUT_MS) }); }
    catch { response = null; } // Network error or timeout: transient, retried below.
    if (s.pair?.token !== pair.token) return { stopped: true, reason: endedFor(pair.tabId) };
    if (response?.ok) return await response.json();
    if (response && (response.status === 401 || response.status === 403)) { await endPair('approval_revoked'); return { stopped: true, reason: 'approval_revoked' }; }
    if (response?.status === 410) {
      const body = await response.json().catch(() => ({}));
      const reason = isReason(body.ended) ? body.ended : 'lost_contact';
      await endPair(reason); return { stopped: true, reason };
    }
    if (response && response.status < 500) { await endPair('lost_contact', { notifyBridge: true }); return { stopped: true, reason: 'lost_contact' }; }
    if (attempt >= RETRY_DELAYS_MS.length) { await endPair('app_closed'); return { stopped: true, reason: 'app_closed' }; }
    await wait(RETRY_DELAYS_MS[attempt]);
  }
}

async function relayContext(message, sender) {
  const { pair } = await load();
  if (!validPair(pair) || sender.tab?.id !== pair.tabId || sender.frameId !== 0 || sender.origin !== pair.pageOrigin) return { stopped: true, reason: endedFor(sender.tab?.id) };
  const payload = { kind: message.kind, task: message.task, fieldId: message.fieldId, revision: message.revision, reviewId: message.reviewId, findingId: message.findingId, useAI: message.useAI === true, consent: message.consent === true };
  try {
    const response = await fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ ...payload, tabId: pair.tabId, pageOrigin: pair.pageOrigin }), signal: AbortSignal.timeout(45000) });
    if (state.pair?.token !== pair.token) return { stopped: true, reason: endedFor(pair.tabId) };
    if (response.status === 400) return { error: 'The draft or company guidance changed. Review this field again.' };
    if (!response.ok) return { error: 'The check could not finish. Try again.' };
    return await response.json();
  } catch {
    // A slow review must not block editing/heartbeats or erase a healthy local connection.
    return { error: 'The check could not finish. Try again.' };
  }
}

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (['connect-tab', 'pair-tab', 'stop-pair', 'status'].includes(message.kind)) {
    if (sender.tab || sender.id !== chrome.runtime.id) { reply({ error: 'Extension control required.' }); return; }
    if (message.kind === 'status') { popupStatus().then(reply, error => reply({ error: error.message })); return true; }
    // Stop never waits behind a retrying relay; the relay notices the missing pair and returns.
    const task = message.kind === 'stop-pair' ? endPair('stopped_by_user', { notifyBridge: true }).then(() => ({ stopped: true })) : enqueue(() => connectTab(message));
    task.then(reply, error => reply({ error: error.message }));
    return true;
  }
  if (['review', 'proposal', 'open'].includes(message.kind)) { relayContext(message, sender).then(reply, () => reply({ error: 'Try a fresh review.' })); return true; }
  if (!['field', 'heartbeat', 'editing', 'stop'].includes(message.kind)) { reply({ error: 'Unsupported action.' }); return; }
  (message.kind === 'stop' ? relayEvent(message, sender) : enqueue(() => relayEvent(message, sender))).then(reply, () => reply({ stopped: true, reason: 'lost_contact' }));
  return true;
});

// Same-origin reload keeps the pair: the existing activeTab grant re-injects the companion.
// Chrome withdraws activeTab on a move to another site, so tab.url is then unreadable: that ends sharing.
async function reattach(tabId, tab) {
  const { pair } = await load();
  if (!pair || pair.tabId !== tabId) return;
  let origin = null; try { origin = new URL(tab?.url).origin; } catch {}
  if (origin !== pair.pageOrigin) { await endPair('other_site', { notifyBridge: true, notifyPage: false }); return; }
  if (!await contentAlive(tabId)) {
    try { await inject(tabId); }
    catch { await endPair('lost_contact', { notifyBridge: true, notifyPage: false }); return; }
  }
  await setBadge(tabId, true);
}
chrome.tabs.onUpdated.addListener((tabId, info, tab) => { if (info.status === 'complete') enqueue(() => reattach(tabId, tab)); });
chrome.tabs.onRemoved.addListener(tabId => { enqueue(async () => { if ((await load()).pair?.tabId === tabId) await endPair('tab_closed', { notifyBridge: true, notifyPage: false }); }); });
