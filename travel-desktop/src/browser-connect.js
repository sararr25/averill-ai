const http = require('node:http');
const EXTENSION = /^chrome-extension:\/\/[a-p]{32}$/;
const CONNECT_PORT = 43147;

// A loopback rendezvous, never a source/observation API. Trust lasts only for the signed-in session.
class BrowserConnect {
  constructor({ getSession, approve, connect, onChange = () => {}, onSeen = () => {}, seenAt = null, port = CONNECT_PORT }) {
    this.getSession = getSession; this.approve = approve; this.connect = connect; this.onChange = onChange; this.onSeen = onSeen; this.seenAt = seenAt; this.port = port;
    this.trusted = new Map(); this.pending = false;
  }
  revoke() { this.trusted.clear(); }
  // Desktop checklist step 1: an extension was approved for this signed-in session.
  status(session) { return { approved: Boolean(session) && [...this.trusted.values()].includes(session), pending: this.pending, extensionSeenAt: this.seenAt }; }
  stop() { this.revoke(); this.server?.close(); this.server?.closeIdleConnections(); this.server = null; }
  async start() {
    this.server = http.createServer(async (request, response) => {
      const origin = request.headers.origin;
      if (!EXTENSION.test(origin || '') || request.headers.host !== `127.0.0.1:${this.server?.address()?.port}` || !['/connect', '/hello'].includes(request.url)) { response.writeHead(403); response.end(); return; }
      response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin');
      response.setHeader('Content-Type', 'application/json'); response.setHeader('Cache-Control', 'no-store');
      if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Methods', 'POST'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.writeHead(204); response.end(); return; }
      if (request.method !== 'POST') { response.writeHead(405); response.end('{}'); return; }
      // "The extension is installed": a bodyless announcement. It grants no trust and needs no sign-in.
      if (request.url === '/hello') { this.seenAt = Date.now(); this.onSeen(this.seenAt); this.onChange(); response.writeHead(204); response.end(); return; }
      const session = this.getSession();
      if (!session) { response.writeHead(401); response.end('{"error":"Sign in to Averill, then connect again."}'); return; }
      if (this.pending) { response.writeHead(409); response.end('{"error":"Finish the connection request already open in Averill."}'); return; }
      let held = false;
      try {
        let size = 0, parts = [];
        for await (const part of request) { size += part.length; if (size > 1024) throw new Error('Invalid request'); parts.push(part); }
        const payload = JSON.parse(Buffer.concat(parts).toString());
        if (!Number.isSafeInteger(payload.tabId) || payload.tabId < 0 || !/^https?:\/\/[^/]+$/.test(payload.pageOrigin || '')) throw new Error('Invalid tab');
        // Lock before any approval await; there is at most one prompt/replacement in progress.
        if (this.pending) throw new Error('Busy'); this.pending = true; held = true; this.onChange();
        if (this.trusted.get(origin) !== session) {
          const approved = await this.approve({ origin, pageOrigin: payload.pageOrigin });
          if (!approved || this.getSession() !== session) { response.writeHead(403); response.end('{"error":"Connection cancelled. No field was shared."}'); return; }
          this.trusted.set(origin, session);
        }
        if (this.getSession() !== session) throw new Error('Session changed');
        const pair = await this.connect({ origin, tabId: payload.tabId, pageOrigin: payload.pageOrigin });
        if (this.getSession() !== session) throw new Error('Session changed');
        response.writeHead(200); response.end(JSON.stringify(pair));
      } catch { response.writeHead(400); response.end('{"error":"The connection changed. Connect the selected tab again."}'); }
      finally { if (held) { this.pending = false; this.onChange(); } }
    });
    this.server.requestTimeout = 5000; this.server.headersTimeout = 5000;
    await new Promise((resolve, reject) => { this.server.once('error', reject); this.server.listen(this.port, '127.0.0.1', resolve); });
    return this.server.address().port;
  }
}
module.exports = { BrowserConnect, CONNECT_PORT };
