// Runs the real browser-extension/canva-design.js reader in Chromium (Electron) on synthetic Canva pages rebuilt from the
// captured fixture, and prints one JSON line with every result. Used by tests/canva-design-reader.test.js (npm test).
// Pages are served at https://www.canva.com/qa from a private in-memory session; nothing is fetched from the network.
const { app, BrowserWindow, session } = require('electron');
const fs = require('node:fs'), path = require('node:path');
const qa = require('./canva-qa-page.cjs');

const READER = fs.readFileSync(path.join(__dirname, '../browser-extension/canva-design.js'), 'utf8');
const SHOT = process.env.SHOT || '';
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.whenReady().then(async () => {
  const out = {};
  let win;
  try {
    const pages = new Map();
    const ses = session.fromPartition('canva-reader-qa');
    ses.protocol.handle('https', request => {
      const url = new URL(request.url);
      if (url.hostname === 'www.canva.com' && url.pathname.startsWith('/qa/img/')) {
        const bytes = qa.image(path.basename(url.pathname));
        return bytes ? new Response(bytes, { headers: { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': 'https://www.canva.com' } }) : new Response('', { status: 404 });
      }
      // A second host without CORS headers: its pictures can be shown but never read into a canvas.
      if (url.hostname === 'media.example' && url.pathname.startsWith('/img/')) return new Response(qa.image(path.basename(url.pathname)), { headers: { 'Content-Type': 'image/png' } });
      if (url.hostname === 'www.canva.com' && pages.has(url.pathname)) return new Response(pages.get(url.pathname), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      return new Response('', { status: 404 });
    });
    win = new BrowserWindow({ width: 1400, height: 900, show: false, webPreferences: { session: ses, contextIsolation: true, sandbox: true } });
    const variant = async (name, html, prepare = '') => {
      pages.set('/qa/' + name, html);
      await win.loadURL('https://www.canva.com/qa/' + name);
      await win.webContents.executeJavaScript(`Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})))`);
      await win.webContents.executeJavaScript(READER + ';void 0');
      if (prepare) await win.webContents.executeJavaScript(prepare + ';void 0');
      out[name] = await win.webContents.executeJavaScript('AverillCanvaDesign.read(document)');
      if (SHOT) fs.writeFileSync(path.join(SHOT, `reader-${name}.png`), (await win.webContents.capturePage()).toPNG());
    };
    // 1. The captured structure as it is: 40% zoom, captured positions.
    await variant('captured', qa.build());
    // 2. The same design at 100% zoom, page partly off screen (top at minus 285 px, as in the spike).
    await variant('zoom100', qa.build({ zoom: 1, left: 60, top: -285 }));
    // 2b. The 28 October capture: the headline's visual span holds 'copenhagen<br>before 8', the text layer 'copenhagen before 8'.
    await variant('captured-1028', qa.build({ fixture: '2026-10-28' }));
    // A visual text that really differs from its layer text still fails closed.
    await variant('text-mismatch-1028', qa.build({ fixture: '2026-10-28' }), "document.querySelector('[data-qa-text=headline] span').firstChild.nodeValue='stockholm'");
    // 3. Unreadable variants: fail closed, never guess.
    await variant('no-frame', qa.build(), "document.querySelectorAll('div[style]').forEach(d=>{if(d.style.width==='1080px'&&d.style.height==='1440px'&&!d.style.transform)d.style.width='1000px'})");
    await variant('layer-mismatch', qa.build(), "document.querySelector('[data-qa-layer] p:last-of-type').closest('div').remove()");
    await variant('rotated-text', qa.build(), "document.querySelector('[data-qa-text=body]').style.transform='translate(71.4707px, 1276.17px) rotate(4deg)'");
    await variant('foreign-image', qa.build({ imageBase: 'https://media.example/img/', crossOrigin: false }));
    await variant('two-pages', qa.build(), "const s=document.getElementById('stage');const c=s.firstElementChild.cloneNode(true);c.style.top='700px';s.append(c)");
    // 4. Pistachio body text and the body box moved to x = 40 (numbers only: the rules are applied in Averill).
    await variant('pistachio', qa.build(), "document.querySelectorAll('[data-qa-text=body] span').forEach(s=>s.style.color='rgb(147, 197, 114)');[...document.querySelectorAll('[data-qa-layer] span')].at(-1).style.color='rgb(147, 197, 114)'");
    await variant('moved', qa.build(), "document.querySelector('[data-qa-text=body]').style.transform='translate(40px, 1276.17px)'");
    process.stdout.write('\nREADER_RESULTS ' + JSON.stringify(out) + '\n');
  } catch (error) {
    process.stdout.write('\nREADER_ERROR ' + JSON.stringify(String(error && error.stack || error)) + '\n');
    process.exitCode = 1;
  } finally { win?.destroy(); app.quit(); }
});
