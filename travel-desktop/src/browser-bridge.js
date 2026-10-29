const http = require('node:http');
const crypto = require('node:crypto');
const { observation } = require('./external-observation');
const endReasons = require('../browser-extension/end-reasons');

function closeServer(server) { server.close(); server.closeIdleConnections(); }

// "https://app.brevo.com" + "Email body" → "Brevo · Email body". Uses only the origin and label the extension already sends.
function fieldName(pageOrigin, label) {
  let host = '';
  try { host = new URL(pageOrigin).hostname.replace(/^(www|app|my)\./, ''); } catch {}
  const site = host.split('.')[0] || 'Browser';
  return `${site.charAt(0).toUpperCase()}${site.slice(1)} · ${label}`.slice(0, 60);
}

// Session-long connection (owner decision D1, 25 October 2026). Liveness is heartbeat based:
// a visible page reports every few seconds, a hidden page reports "paused" and gets a longer
// window. Only Stop, sign-out, quit, tab close, another site or lost contact end it.
const LIVENESS_MS = 2 * 60 * 1000;
const PAUSED_LIVENESS_MS = 30 * 60 * 1000;
const TOMBSTONE_MS = 10 * 60 * 1000;
// Requests are small (24 KB) except an image check (FB-08), which carries downscaled PNGs and may be 6 MB. The raised limit
// applies only when the extension declares that kind in a header and the body then proves to be that kind.
const BODY_LIMIT = 24000, IMAGE_BODY_LIMIT = 6 * 1024 * 1024;
const EXTENSION_END_REASONS = ['stopped_by_user', 'tab_closed', 'other_site', 'lost_contact'];

class BrowserBridge {
  constructor({ onObservation, onStop, onRequest, onState = () => {}, livenessMs = LIVENESS_MS, pausedLivenessMs = PAUSED_LIVENESS_MS, tombstoneMs = TOMBSTONE_MS }) {
    this.onObservation = onObservation; this.onStop = onStop; this.onRequest = onRequest; this.onState = onState;
    this.livenessMs = livenessMs; this.pausedLivenessMs = pausedLivenessMs; this.tombstoneMs = tombstoneMs;
    this.paused = false; this.lastEnd = null; this.tombstone = null;
  }
  // A reasoned end keeps the old port answering 410 + reason for a while, so the extension can
  // tell the employee why sharing ended. It never accepts observations again.
  stop(reason = null) {
    if (reason !== null && !endReasons.isReason(reason)) throw new Error(`Unknown end reason: ${reason}`);
    clearTimeout(this.expiry); this.expiry = null;
    if (this.server) {
      if (reason && this.token) this.entomb(this.server, this.token, reason);
      else closeServer(this.server);
      if (reason) this.lastEnd = { reason, at: Date.now() };
    }
    this.token = null; this.binding = null; this.extensionOrigin = null; this.sequence = -1; this.paused = false;
    this.server = null;
  }
  entomb(server, token, reason) {
    this.closeTombstone();
    const timer = setTimeout(() => this.closeTombstone(), this.tombstoneMs); timer.unref();
    this.tombstone = { server, token, reason, timer };
  }
  closeTombstone() {
    if (!this.tombstone) return;
    clearTimeout(this.tombstone.timer); closeServer(this.tombstone.server); this.tombstone = null;
  }
  shutdown() { this.stop(); this.closeTombstone(); }
  end(reason) { this.stop(reason); this.onStop(reason); }
  arm(ms) {
    clearTimeout(this.expiry);
    this.expiry = setTimeout(() => this.end('lost_contact'), ms); this.expiry.unref();
  }
  status() {
    let pageHost = '';
    if (this.binding) { try { pageHost = new URL(this.binding.slice(this.binding.indexOf(':') + 1)).host; } catch {} }
    return { ready: Boolean(this.server), connected: Boolean(this.binding), paused: Boolean(this.binding) && this.paused, pageHost, lastEnd: this.lastEnd ? { reason: this.lastEnd.reason, message: endReasons.message(this.lastEnd.reason), at: this.lastEnd.at } : null };
  }
  async start(personId, binding = null) {
    this.stop(); this.closeTombstone(); this.lastEnd = null; this.personId = personId;
    if (binding) {
      if (!/^chrome-extension:\/\/[a-p]{32}$/.test(binding.origin) || !Number.isSafeInteger(binding.tabId) || binding.tabId < 0 || !/^https?:\/\/[^/]+$/.test(binding.pageOrigin)) throw new Error('Invalid browser binding');
      this.extensionOrigin = binding.origin; this.binding = `${binding.tabId}:${binding.pageOrigin}`;
    }
    this.token = crypto.randomBytes(32).toString('hex');
    const token = this.token;
    const server = http.createServer(async (request, response) => {
      const origin = request.headers.origin;
      const ended = this.tombstone?.token === token ? this.tombstone.reason : null;
      const validOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(origin || '') && (ended || !this.extensionOrigin || origin === this.extensionOrigin);
      const expectedHost = `127.0.0.1:${server.address()?.port}`;
      if (!validOrigin || request.headers.host !== expectedHost || !['/observation', '/context'].includes(request.url)) { response.writeHead(403); response.end(); return; }
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Cache-Control', 'no-store');
      if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Methods', 'POST');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Averill-Token, X-Averill-Kind');
        response.writeHead(204); response.end(); return;
      }
      const supplied = String(request.headers['x-averill-token'] || '');
      if (request.method !== 'POST' || (this.token !== token && !ended) || !/^[a-f0-9]{64}$/.test(supplied) || supplied.length !== token.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) { response.writeHead(403); response.end(); return; }
      if (ended) { request.resume(); response.setHeader('Content-Type', 'application/json'); response.writeHead(410); response.end(JSON.stringify({ ended })); return; }
      try {
        const imageCheck = request.url === '/context' && request.headers['x-averill-kind'] === 'image-check';
        const limit = imageCheck ? IMAGE_BODY_LIMIT : BODY_LIMIT;
        if (Number(request.headers['content-length']) > limit) {
          // Finish a bounded drain before closing: replying and closing mid-upload can reset the
          // client's socket before it receives the refusal. Never buffer a rejected body.
          let dropped = 0;
          for await (const chunk of request) { dropped += chunk.length; if (dropped > 4 * IMAGE_BODY_LIMIT) { request.destroy(); return; } }
          response.setHeader('Connection', 'close');
          response.writeHead(imageCheck ? 413 : 400); response.end('{}'); return;
        }
        let bytes = 0, chunks = [];
        for await (const chunk of request) { bytes += chunk.length; if (bytes > limit) throw new Error('Too large'); chunks.push(chunk); }
        const payload = JSON.parse(Buffer.concat(chunks).toString());
        if (imageCheck && payload.kind !== 'image-check') throw new Error('Wrong request kind');
        if (this.token !== token) throw new Error('Sharing stopped');
        if (!Number.isSafeInteger(payload.tabId) || payload.tabId < 0 || !/^https?:\/\/[^/]+$/.test(payload.pageOrigin || '')) throw new Error('Invalid tab');
        const binding = `${payload.tabId}:${payload.pageOrigin}`;
        if (this.binding && this.binding !== binding) throw new Error('Another tab');
        if (request.url === '/context') {
          if (!this.binding || !this.extensionOrigin || !this.onRequest) throw new Error('Select a field first');
          const result = await this.onRequest(payload);
          if (this.token !== token) throw new Error('Sharing stopped');
          response.setHeader('Content-Type', 'application/json'); response.writeHead(200); response.end(JSON.stringify(result)); return;
        }
        // Stop only removes access, so it is accepted out of order (an in-flight retry may hold the next number).
        if (payload.kind === 'stop') {
          const reason = payload.endReason === undefined ? 'stopped_by_user' : payload.endReason;
          if (!EXTENSION_END_REASONS.includes(reason)) throw new Error('Invalid end reason');
          this.stop(); this.closeTombstone(); this.lastEnd = { reason, at: Date.now() }; this.onStop(reason); response.writeHead(200); response.end('{}'); return;
        }
        if (!Number.isSafeInteger(payload.sequence) || payload.sequence <= this.sequence) throw new Error('Stale event');
        if (!['field', 'heartbeat', 'editing'].includes(payload.kind)) throw new Error('Invalid event');
        this.binding = binding; this.extensionOrigin = origin; this.sequence = payload.sequence;
        const paused = payload.kind === 'heartbeat' && payload.paused === true;
        this.arm(paused ? this.pausedLivenessMs : this.livenessMs);
        if (paused !== this.paused) { this.paused = paused; this.onState(); }
        if (payload.kind === 'editing') this.onObservation(null);
        if (payload.kind === 'field') {
          const field = payload.field;
          if (!field || !['text', 'textarea', 'contenteditable', 'select', 'date', 'time', 'checkbox'].includes(field.kind) || typeof field.value !== 'string' || field.value.length > 6000 || !['pause', 'blur', 'selection', 'read'].includes(payload.reason)) throw new Error('Invalid field');
          const label = String(field.label || 'Selected field').slice(0, 100);
          // Same policy as browser-extension/field-select.js: "personal" only counts when it names personal data.
          if (/password|token|secret|card|payment|recipient|e-?mail address|phone|personal[\s_-]*(e-?mail|data|details|information|info|id|number|phone|address)|personnel/i.test(label)) throw new Error('Sensitive field');
          const result = observation({ personId, windowId: `browser:${payload.tabId}`, windowName: fieldName(payload.pageOrigin, label), method: 'browser-dom', text: field.value });
          // Only one employee-selected field is represented; never infer the rest of a draft.
          result.field = { label, kind: field.kind, value: result.sensitiveRedacted ? result.text : field.value };
          if (field.id !== undefined) {
            if (!/^[a-zA-Z0-9_-]{8,80}$/.test(field.id) || !Number.isSafeInteger(field.revision) || field.revision < 0) throw new Error('Invalid field identity');
            result.fieldId = field.id; result.revision = field.revision;
          }
          result.contentHash = crypto.createHash('sha256').update(JSON.stringify(result.field)).digest('hex');
          result.reason = payload.reason; result.pageOrigin = payload.pageOrigin;
          this.onObservation(result);
        }
        response.setHeader('Content-Type', 'application/json'); response.writeHead(200); response.end(JSON.stringify(this.onRequest ? await this.onRequest({ kind: 'status' }) : {}));
      } catch { response.writeHead(400); response.end('{}'); }
    });
    server.requestTimeout = 5000; server.headersTimeout = 5000;
    this.server = server;
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    if (this.token !== token) { closeServer(server); throw new Error('Pairing was cancelled.'); }
    // The first event must arrive within the liveness window; an unused pairing secret expires.
    this.arm(this.livenessMs);
    return { endpoint: `http://127.0.0.1:${this.server.address().port}/observation`, token };
  }
}
module.exports = { BrowserBridge, LIVENESS_MS, PAUSED_LIVENESS_MS, TOMBSTONE_MS };
