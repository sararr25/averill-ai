const http = require('node:http');
const crypto = require('node:crypto');
const { observation } = require('./external-observation');

// "https://app.brevo.com" + "Email body" → "Brevo · Email body". Uses only the origin and label the extension already sends.
function fieldName(pageOrigin, label) {
  let host = '';
  try { host = new URL(pageOrigin).hostname.replace(/^(www|app|my)\./, ''); } catch {}
  const site = host.split('.')[0] || 'Browser';
  return `${site.charAt(0).toUpperCase()}${site.slice(1)} · ${label}`.slice(0, 60);
}

class BrowserBridge {
  constructor({ onObservation, onStop, onRequest, timeoutMs = 15000 }) {
    this.onObservation = onObservation; this.onStop = onStop; this.onRequest = onRequest; this.timeoutMs = timeoutMs;
  }
  stop() {
    clearTimeout(this.expiry); this.expiry = null;
    this.token = null; this.binding = null; this.extensionOrigin = null; this.sequence = -1;
    this.server?.close(); this.server?.closeIdleConnections(); this.server = null;
  }
  status() { return { ready: Boolean(this.server), connected: Boolean(this.binding) }; }
  async start(personId, binding = null) {
    this.stop(); this.personId = personId;
    if (binding) {
      if (!/^chrome-extension:\/\/[a-p]{32}$/.test(binding.origin) || !Number.isSafeInteger(binding.tabId) || binding.tabId < 0 || !/^https?:\/\/[^/]+$/.test(binding.pageOrigin)) throw new Error('Invalid browser binding');
      this.extensionOrigin = binding.origin; this.binding = `${binding.tabId}:${binding.pageOrigin}`;
    }
    this.token = crypto.randomBytes(32).toString('hex');
    const token = this.token;
    const server = http.createServer(async (request, response) => {
      const origin = request.headers.origin;
      const validOrigin = /^chrome-extension:\/\/[a-p]{32}$/.test(origin || '') && (!this.extensionOrigin || origin === this.extensionOrigin);
      const expectedHost = `127.0.0.1:${this.server?.address()?.port}`;
      if (!validOrigin || request.headers.host !== expectedHost || !['/observation', '/context'].includes(request.url)) { response.writeHead(403); response.end(); return; }
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Cache-Control', 'no-store');
      if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Methods', 'POST');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Averill-Token');
        response.writeHead(204); response.end(); return;
      }
      const supplied = String(request.headers['x-averill-token'] || '');
      if (request.method !== 'POST' || this.token !== token || !/^[a-f0-9]{64}$/.test(supplied) || supplied.length !== token.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) { response.writeHead(403); response.end(); return; }
      try {
        let bytes = 0, chunks = [];
        for await (const chunk of request) { bytes += chunk.length; if (bytes > 24000) throw new Error('Too large'); chunks.push(chunk); }
        const payload = JSON.parse(Buffer.concat(chunks).toString());
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
        if (!Number.isSafeInteger(payload.sequence) || payload.sequence <= this.sequence) throw new Error('Stale event');
        this.binding = binding; this.extensionOrigin = origin; this.sequence = payload.sequence;
        if (payload.kind === 'stop') { this.stop(); this.onStop(); response.writeHead(200); response.end('{}'); return; }
        if (!['field', 'heartbeat', 'editing'].includes(payload.kind)) throw new Error('Invalid event');
        clearTimeout(this.expiry);
        this.expiry = setTimeout(() => { this.stop(); this.onStop(); }, this.timeoutMs); this.expiry.unref();
        if (payload.kind === 'editing') this.onObservation(null);
        if (payload.kind === 'field') {
          const field = payload.field;
          if (!field || !['text', 'textarea', 'contenteditable', 'select', 'date', 'time', 'checkbox'].includes(field.kind) || typeof field.value !== 'string' || field.value.length > 6000 || !['pause', 'blur', 'selection', 'read'].includes(payload.reason)) throw new Error('Invalid field');
          const label = String(field.label || 'Selected field').slice(0, 100);
          if (/password|token|secret|card|payment|recipient|e-?mail address|phone|personal|personnel/i.test(label)) throw new Error('Sensitive field');
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
    if (this.token !== token) { server.close(); throw new Error('Pairing was cancelled.'); }
    this.expiry = setTimeout(() => { this.stop(); this.onStop(); }, 120000); this.expiry.unref();
    return { endpoint: `http://127.0.0.1:${this.server.address().port}/observation`, token };
  }
}
module.exports = { BrowserBridge };
