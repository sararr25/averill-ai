importScripts('end-reasons.js', 'canva-design.js');
const { isReason } = globalThis.AverillEndReasons;
const CanvaDesign = globalThis.AverillCanvaDesign;
const CONNECT_ENDPOINT = 'http://127.0.0.1:43147/connect';
// Tells Averill on this Mac that the extension is installed, so the app can offer Connect instead of Install.
// Sends no data; runs each time Chrome starts this worker. Averill not running is normal, so a failure is ignored.
fetch('http://127.0.0.1:43147/hello', { method: 'POST' }).catch(() => {});
const CONTENT_FILES = ['end-reasons.js', 'editor-adapter.js', 'field-select.js', 'content.js'];
// FB-14: the Canva design reader is injected before content.js on canva.com only. No new permission: same activeTab grant.
const CANVA_HOST = /(^|\.)canva\.com$/;
function isCanva(url) { try { const target = new URL(url); return target.protocol === 'https:' && CANVA_HOST.test(target.hostname); } catch { return false; } }
function contentFiles(url) { return isCanva(url) ? [...CONTENT_FILES.slice(0, -1), 'canva-design.js', 'content.js'] : CONTENT_FILES; }
// Session-long connection (owner decision D1): 3 tries with backoff before Averill counts as closed.
const RETRY_DELAYS_MS = [500, 1500];
const RELAY_TIMEOUT_MS = 4000;
const MAX_CLAIMS = 5, MAX_CLAIM_LENGTH = 300;
// FB-08: the only request allowed to be large. Averill rejects more than 6 MB of body, so the worker refuses first.
const MAX_IMAGES = 4, MAX_IMAGE_BODY_BYTES = 6 * 1024 * 1024, MAX_ALT_LENGTH = 300, PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;
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

async function inject(tabId, url) { await chrome.scripting.executeScript({ target: { tabId }, files: contentFiles(url) }); }
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
  try { await inject(tab.id, tab.url); }
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
  if (message.kind === 'ask') {
    // Only the typed question and, if a field is selected, its id and revision. The bridge holds the field text.
    const question = typeof message.question === 'string' ? message.question.slice(0, 500) : '';
    if (!question.trim()) return { error: 'Type a question first.' };
    Object.assign(payload, { question });
  }
  if (message.kind === 'public-check') {
    // FB-10: only the statements the employee ticked in the card, at most 5 of 300 characters, bound to one field revision.
    // Averill checks them against the field text again and applies its own outbound guards before anything is searched.
    const list = Array.isArray(message.claims) ? message.claims : [];
    if (!list.length || list.length > MAX_CLAIMS || list.some(claim => typeof claim !== 'string' || !claim.trim() || claim.length > MAX_CLAIM_LENGTH)) return { error: `Choose 1 to ${MAX_CLAIMS} statements of up to ${MAX_CLAIM_LENGTH} characters.` };
    Object.assign(payload, { claims: list.map(claim => claim.trim()) });
  }
  if (message.kind === 'image-check') {
    // FB-08: sizes, alt text and downscaled PNGs of the images in the shared field's post editor, collected only after the
    // employee pressed "Check images too". Everything is validated here; the pixels go to Averill on this device and nowhere else.
    const list = Array.isArray(message.images) ? message.images : null;
    const valid = list && list.length <= MAX_IMAGES && list.every(image => image && Number.isSafeInteger(image.width) && Number.isSafeInteger(image.height) && image.width > 0 && image.height > 0
      && (image.alt === undefined || (typeof image.alt === 'string' && image.alt.length <= MAX_ALT_LENGTH)) && (image.dataUrl === undefined || (typeof image.dataUrl === 'string' && PNG_DATA_URL.test(image.dataUrl))));
    if (!valid) return { error: `Averill can check up to ${MAX_IMAGES} images. Check the images again.` };
    Object.assign(payload, { images: list.map(image => ({ width: image.width, height: image.height, alt: image.alt || '', ...(image.dataUrl ? { dataUrl: image.dataUrl } : { unreadable: true }) })) });
  }
  try {
    const headers = { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token };
    const body = JSON.stringify({ ...payload, tabId: pair.tabId, pageOrigin: pair.pageOrigin });
    if (message.kind === 'image-check') {
      if (body.length > MAX_IMAGE_BODY_BYTES) return { error: 'The images are too large to check (limit 6 MB). Use smaller images.' };
      headers['X-Averill-Kind'] = 'image-check';
    }
    const response = await fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', headers, body, signal: AbortSignal.timeout(message.kind === 'public-check' ? 120000 : message.kind === 'image-check' ? 90000 : 45000) });
    if (state.pair?.token !== pair.token) return { stopped: true, reason: endedFor(pair.tabId) };
    if (response.status === 400 && message.kind === 'ask') return { error: 'The question could not be answered. Check it and try again.' };
    if (response.status === 413) return { error: 'The images are too large to check (limit 6 MB). Use smaller images.' };
    if (response.status === 400 && message.kind === 'image-check') return { error: 'The images or the draft changed. Check the images again.' };
    if (response.status === 400 && message.kind === 'public-check') return { error: 'The draft changed. Check the statements again.' };
    if (response.status === 400) return { error: 'The draft or company guidance changed. Review this field again.' };
    if (!response.ok) return { error: 'The check could not finish. Try again.' };
    return await response.json();
  } catch {
    // A slow review must not block editing/heartbeats or erase a healthy local connection.
    return { error: 'The check could not finish. Try again.' };
  }
}

// FB-14: a Canva design check. Only texts and numbers, validated here before anything is sent: at most 30 texts of up to
// 500 characters, bounded numbers, no unknown keys, no image data, and the open carousel slide (index and count) or null. "Export anyway" sends only the id of the last check.
async function relayDesign(message, sender) {
  const { pair } = await load();
  if (!validPair(pair) || sender.tab?.id !== pair.tabId || sender.frameId !== 0 || sender.origin !== pair.pageOrigin) return { stopped: true, reason: endedFor(sender.tab?.id) };
  if (!isCanva(pair.pageOrigin)) return { error: 'Design checks work on canva.com only.' };
  let payload;
  if (message.action === 'override') {
    if (!CanvaDesign.validCheckId(message.checkId)) return { error: 'Check the design again first.' };
    payload = { kind: 'design-check', action: 'override', checkId: message.checkId };
  } else {
    try { payload = { kind: 'design-check', ...CanvaDesign.validate('slide' in message ? { design: message.design, elements: message.elements, slide: message.slide } : { design: message.design, elements: message.elements }) }; }
    catch (error) { return { error: `Averill cannot read this design. ${error.message}` }; }
  }
  try {
    const response = await fetch(pair.endpoint.replace('/observation', '/context'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Averill-Token': pair.token }, body: JSON.stringify({ ...payload, tabId: pair.tabId, pageOrigin: pair.pageOrigin }), signal: AbortSignal.timeout(20000) });
    if (state.pair?.token !== pair.token) return { stopped: true, reason: endedFor(pair.tabId) };
    if (response.status === 400) return { error: message.action === 'override' ? 'The design or session changed. Check the design again.' : 'Averill could not check this design. Try again after your next edit.' };
    if (!response.ok) return { error: 'The design check could not finish. Try again.' };
    return await response.json();
  } catch {
    return { error: 'The design check could not finish. Try again.' };
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
  if (message.kind === 'design-check') { relayDesign(message, sender).then(reply, () => reply({ error: 'The design check could not finish. Try again.' })); return true; }
  if (['review', 'proposal', 'open', 'ask', 'public-check', 'image-check'].includes(message.kind)) { relayContext(message, sender).then(reply, () => reply({ error: 'Try a fresh review.' })); return true; }
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
    try { await inject(tabId, tab.url); }
    catch { await endPair('lost_contact', { notifyBridge: true, notifyPage: false }); return; }
  }
  await setBadge(tabId, true);
}
chrome.tabs.onUpdated.addListener((tabId, info, tab) => { if (info.status === 'complete') enqueue(() => reattach(tabId, tab)); });
chrome.tabs.onRemoved.addListener(tabId => { enqueue(async () => { if ((await load()).pair?.tabId === tabId) await endPair('tab_closed', { notifyBridge: true, notifyPage: false }); }); });
