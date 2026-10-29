// A local instance of the real capped server code, real providers, and the keyless desktop client contract.
// No production deploy or user profile; only bundled fictional sources and generated text are sent.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), http = require('node:http');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });
const workspace = require('../src/workspace'), judge = require('../src/judge-server'), { WorkAssistant } = require('../src/work-assistant');
const { createHandlers } = require('../../judge-ai-server/lib/handlers');
const { createLimiter } = require('../../judge-ai-server/lib/limits');
const { memoryStore } = require('../../judge-ai-server/lib/store');
(async () => {
  if (!process.argv.includes('--synthetic-consent')) throw new Error('Use --synthetic-consent for bundled fictional sources and public tool queries only.');
  const production = process.argv.includes('--production');
  if (!production && (!process.env.NEBIUS_API_KEY || !process.env.TAVILY_API_KEY)) throw new Error('Local development provider keys are unavailable.');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'averill-pro-demo-live-'));
  let server;
  try {
    const data = workspace.create(root, 'Synthetic Vamo demo verification', 'Synthetic owner'); data.demoAccounts = true;
    for (const name of ['current-brief.md', 'brand-and-legal.md']) { const s = workspace.importFile(root, data, path.join(__dirname, '../demo-company/vamo/Marketing', name), { department: 'Marketing', version: '2' }); workspace.updateSource(data, s.id, 'approved'); }
    if (!production) {
    const limiter = createLimiter({ store: memoryStore(), limits: { nebius: { global: 50000, client: 25000, ip: 25000 }, tavily: { global: 10, client: 5, ip: 5 } } });
    const handlers = createHandlers({ limiter, ask: async messages => { const result = await require('../../judge-ai-server/lib/providers').nemotronAsk(messages, process.env.AVERILL_SYNTHETIC_DEBUG === '1' ? { fetcher: async (url, options) => { const response=await global.fetch(url,options);if(url.endsWith('/chat/completions'))fs.writeFileSync('/tmp/averill-lead-checklist-synthetic-raw.json',JSON.stringify(await response.clone().json()));return response;} } : {}); if (process.env.AVERILL_SYNTHETIC_DEBUG === '1') fs.writeFileSync('/tmp/averill-pro-demo-synthetic-reply.json', JSON.stringify(result)); return result; } });
    server = http.createServer(async (req, res) => {
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 30000) { res.writeHead(413); res.end(); return; } }
      const handler = req.url === '/api/ask' ? handlers.ask : req.url === '/api/search' ? handlers.search : null;
      if (!handler) { res.writeHead(404); res.end(); return; }
      try { req.body = JSON.parse(body); } catch { res.writeHead(400); res.end(); return; }
      const adapter = { status(code) { res.statusCode = code; return this; }, json(value) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); } };
      await handler(req, adapter);
    });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    }
    const endpoint = production ? judge.ENDPOINT : `http://127.0.0.1:${server.address().port}`, assistant = new WorkAssistant(), results = [];
    const cases = process.argv.includes('--lead-checklist') ? [['Prepare a checklist of current approved campaign requirements, source versions and decisions that need my review.', undefined]] : [['Write a truthful marketing email with at least 200 body characters and one CTA.', 'email'], ['How do I group elements in Canva?', 'canva']];
    for (const [question, task] of cases) {
      const providerFetch = process.env.AVERILL_SYNTHETIC_DEBUG === '1' ? async (url, options) => { const response = await global.fetch(url, options); if(url.endsWith('/api/ask')) fs.writeFileSync('/tmp/averill-lead-checklist-synthetic-response.json',JSON.stringify(await response.clone().json()));return response; } : undefined;
      const options = { task, fetcher: providerFetch, modelTransport: (request, fetcher) => judge.assist(data, request, { endpoint, fetcher }), searchTransportFactory: fetcher => judge.searchTransport(data, { endpoint, fetcher }) };
      const preview = await assistant.answer(data, question, options);
      if (!preview.consentRequired || !preview.service.includes('demo server')) throw new Error('Keyless demo consent is missing.');
      const at = Date.now(), result = await assistant.answer(data, question, { ...options, consent: true });
      results.push({ question, intent: result.assistant.intent, task, mode: result.mode, via: result.assistant.via, sourceCount: result.sources.length, characters: result.text.length, notice: result.mode === 'local' ? result.text.split('\n')[0] : undefined, ms: Date.now() - at });
    }
    const receipt = { verifiedAt: new Date().toISOString(), liveProviders: true, server: production ? judge.ENDPOINT : 'local instance of judge-ai-server code; not the production deployment', payload: 'Bundled fictional Vamo brief/legal guidance and public Canva grouping query', results, passed: results.every(r => r.mode === 'model' && r.sourceCount > 0) };
    fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true }); fs.writeFileSync(path.join(__dirname, '../dist/pro-demo-live-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log(JSON.stringify(receipt, null, 2)); if (!receipt.passed) process.exitCode = 1;
  } finally { if (server) { server.close(); server.closeIdleConnections(); } fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
