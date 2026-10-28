// Synthetic Canva editor page rebuilt from the captured structure in tests/fixtures/canva-page-structure-2026-10-25.json
// (FB-13 spike, real canva.com, 25 October 2026). Same tags, same inline sizes and transforms, same two text layers; the
// pictures are generated PNGs in the colors the spike measured. It is served at https://www.canva.com/qa by an Electron
// protocol handler in the QA scripts only. Not real-platform proof.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// Two captures of the same design: 25 October (headline glyphs drawn elsewhere, its visual span holds only <br>) and
// 28 October (the visual span holds the two lines around a <br>; tests/fixtures/canva-page-structure-2026-10-28.json).
// The carousel capture (tests/fixtures/canva-carousel-slide-2026-10-28.json, slide 2 of 5, 1080x1350) adds rotated text
// wrappers, a group (caption plus a rotated underline picture) and a rotated polaroid with a photo.
const FIXTURES = { '2026-10-25': 'canva-page-structure-2026-10-25.json', '2026-10-28': 'canva-page-structure-2026-10-28.json', carousel: 'canva-carousel-slide-2026-10-28.json' };
const CAPTURED_ZOOM = 0.400694;
// Captured design positions (translate values) of the three texts, design pixels, per capture.
const POSITIONS = {
  '2026-10-25': { vamo: [32.0489, 16.875], headline: [64.0151, 891.786], body: [71.4707, 1276.17] },
  '2026-10-28': { vamo: [120, 120], headline: [120, 900], body: [120, 1270] },
  // Carousel: the rotated title, the caption group (its inner text wrapper sits at 0, 0 in the group), the straight time and
  // the rotated polaroid.
  carousel: { nyhavn: [108, 116], group: [106.029, 1086.59], time: [516.716, 236.626], polaroid: [267.626, 369.795] },
};
// Design height and the picture files the img nodes get, in document order, per capture.
const HEIGHTS = { '2026-10-25': 1440, '2026-10-28': 1440, carousel: 1350 };
const IMAGE_ORDER = { '2026-10-25': ['page.png', 'photo.png', 'panel.png'], '2026-10-28': ['page.png', 'photo.png', 'panel.png'], carousel: ['photo.png', 'underline.png'] };
const CAPTURED = POSITIONS['2026-10-25'];
const CAROUSEL_ZOOM = 0.433333;
const TEXT_SCALE = 1.40625;
const NEAR_BLACK = 'rgb(16, 15, 13)', CREAM = [245, 240, 229], NAVY = [27, 42, 74];

// Minimal PNG encoder (RGB, filter 0) so the page images are real raster pictures read through a canvas.
function crcTable() { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t.push(c >>> 0); } return t; }
const CRC = crcTable();
function crc(buffer) { let c = 0xffffffff; for (const byte of buffer) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(td)); return Buffer.concat([len, td, sum]); }
function png(width, height, colorAt) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1); raw[row] = 0;
    for (let x = 0; x < width; x++) { const [r, g, b] = colorAt(x, y); const o = row + 1 + x * 3; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; }
  }
  const head = Buffer.alloc(13); head.writeUInt32BE(width, 0); head.writeUInt32BE(height, 4); head[8] = 8; head[9] = 2; head[10] = 0; head[11] = 0; head[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
// Page background (cream), the canal photo (sky, rooftops, water) and the cream panel, at their design sizes.
const IMAGES = {
  'page.png': () => png(1080, 1440, () => CREAM),
  'photo.png': () => png(1080, 882, (x, y) => y < 470 ? [156 + Math.round(y / 40), 196, 226] : y < 640 ? ((Math.floor(x / 90) % 2) ? [168, 92, 64] : [214, 170, 92]) : [52 + (x % 7), 86, 104]),
  'panel.png': () => png(1080, 577, () => CREAM),
  'underline.png': () => png(282, 37, () => NAVY),
};
const imageCache = {};
function image(name) { if (!IMAGES[name]) return null; imageCache[name] ||= IMAGES[name](); return imageCache[name]; }

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const styleText = s => Object.entries(s || {}).map(([k, v]) => `${k}:${v}`).join(';');
const fixture = (name = '2026-10-25') => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tests', 'fixtures', FIXTURES[name]), 'utf8'));
const translateOf = node => /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(node.s?.transform || '');

// options: zoom (default the captured 0.400694), left/top of the zoom root on screen, positions { vamo|headline|body: [x, y, width?] },
// imageBase (URL prefix of the PNGs), mutate(tree) for unreadable variants, fixture ('2026-10-25' default, '2026-10-28' or
// 'carousel'), slide { index, count } for the editor's page markers (default 1 of 1; false leaves them out).
function build(options = {}) {
  const name0 = options.fixture || '2026-10-25', carousel = name0 === 'carousel', designHeight = HEIGHTS[name0];
  const zoom = options.zoom ?? (carousel ? CAROUSEL_ZOOM : CAPTURED_ZOOM);
  const captured = POSITIONS[name0];
  const textScale = carousel ? 1 : TEXT_SCALE;
  const tree = fixture(name0).tree;
  const visualFont = [], innerWidth = {};
  // Mark the three text wrappers and apply requested design positions.
  const walk = (node, fn, parent = null) => { fn(node, parent); for (const child of node.c || []) walk(child, fn, node); };
  walk(tree, node => {
    const t = translateOf(node);
    if (!t) return;
    const name = Object.keys(captured).find(key => Math.abs(captured[key][0] - Number(t[1])) < 0.001 && Math.abs(captured[key][1] - Number(t[2])) < 0.001);
    if (!name) return;
    node.qa = name;
    const wanted = options.positions?.[name];
    if (wanted) {
      node.s.transform = node.s.transform.replace(/^translate\([^)]*\)/, `translate(${wanted[0]}px, ${wanted[1]}px)`);
      if (wanted[2]) { node.s.width = `${wanted[2]}px`; node.c[0].s.width = `${wanted[2] / textScale}px`; }
    }
    innerWidth[name] = parseFloat(node.s.width) / textScale;
  });
  if (carousel) {
    // The colors the capture did not keep: a cream page, a white polaroid frame and its photo cropped by its box.
    walk(tree, node => { if (node.s?.width === '1080px' && node.s.height === '1350px' && !node.s.transform) node.s['background-color'] = `rgb(${CREAM.join(', ')})`; });
    walk(tree, node => {
      if (node.qa !== 'polaroid') return;
      const shapes = node.c[0].c[0].c;
      shapes[0].s['background-color'] = 'rgb(255, 255, 255)';
      shapes[1].s.overflow = 'hidden';
    });
  }
  const zoomBox = tree.c[0];
  zoomBox.s.transform = `scale(${zoom})`;
  tree.s.width = `${1080 * zoom}px`; tree.s.height = `${designHeight * zoom}px`;
  zoomBox.c[1].qaLayer = true;
  // Font sizes of the layer, in the same order, give the visual paragraphs their glyph size (cosmetic only).
  walk(zoomBox.c[1], node => { if (node.t === 'p' && node.s?.['font-size']) visualFont.push(parseFloat(node.s['font-size']) / textScale); });
  if (options.mutate) options.mutate(tree);
  let imageIndex = 0, visualIndex = 0;
  const images = IMAGE_ORDER[name0];
  const render = (node, inLayer, owner) => {
    if (node.t === 'br') return '<br>';
    if (node.t === '#text') return escape(node.x);
    if (node.t === 'img') return `<img${options.crossOrigin === false ? '' : ' crossorigin="anonymous"'} alt="" src="${escape((options.imageBase || '/qa/img/') + images[imageIndex++ % images.length])}">`;
    const style = { ...(node.s || {}) };
    const attrs = [];
    if (node.qa) attrs.push(`data-qa-text="${node.qa}"`);
    if (node.qaLayer) { attrs.push('data-qa-layer=""'); style.opacity = '0'; style['pointer-events'] = 'none'; }
    if (node === tree) { style.position = 'absolute'; style.left = `${options.left ?? 380}px`; style.top = `${options.top ?? 96}px`; }
    if (node.t === 'p' && !inLayer && visualFont[visualIndex] !== undefined && !style['font-size']) style['font-size'] = `${visualFont[visualIndex++]}px`;
    let inner = node.x !== undefined ? escape(node.x) : '';
    for (const child of node.c || []) inner += render(child, inLayer || node.qaLayer, node.qa || owner);
    // The headline's visual span holds only a <br>: Canva draws those glyphs elsewhere. Draw them beside it for screenshots.
    if (node.t === 'p' && !inLayer && (node.c || []).length === 1 && node.c[0].c?.[0]?.t === 'br') {
      return `<p${attrs.length ? ' ' + attrs.join(' ') : ''} style="${escape(styleText(style))}">${inner}</p><div data-qa-glyphs="" style="width:${innerWidth[owner] || 0}px;font-size:${style['font-size']};line-height:${style['line-height']};color:${NEAR_BLACK};white-space:normal">copenhagen before 8</div>`;
    }
    return `<${node.t}${attrs.length ? ' ' + attrs.join(' ') : ''} style="${escape(styleText(style))}">${inner}</${node.t}>`;
  };
  const body = render(tree, false, null);
  // The editor's page markers outside the design (real canva.com): the open page group, one thumbnail per page, the page bar.
  const slide = options.slide === undefined ? { index: 1, count: 1 } : options.slide;
  const markers = slide ? `<div class="qa-pages"><div role="group" aria-label="Page ${slide.index}"></div>${Array.from({ length: slide.count }, (_, i) => `<div role="button" aria-label="Page ${i + 1}"></div>`).join('')}<button type="button">${slide.index} / ${slide.count}</button></div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>Vamo Copenhagen before 8 - Instagram Post (synthetic Canva QA)</title><style>
html,body{margin:0;height:100%;overflow:hidden;background:#ebecf0;font-family:"Helvetica Neue",Arial,sans-serif}
.qa-top{position:fixed;left:0;top:0;right:0;height:56px;background:#7d2ae8;color:#fff;font:600 15px/56px "Helvetica Neue",Arial,sans-serif;padding:0 20px}
.qa-side{position:fixed;left:0;top:56px;bottom:0;width:72px;background:#fff;border-right:1px solid #ddd}
#stage div{position:absolute;left:0;top:0;transform-origin:0 0}
#stage div[style*="translate("]{transform-origin:50% 50%}
#stage p{margin:0;white-space:nowrap}
.qa-pages{position:fixed;left:80px;bottom:0;height:24px;font:12px Arial}
.qa-pages div{display:none}
#stage img{display:block;width:100%;height:100%}
#stage [style*="864px"]{outline:1px dashed rgba(125,42,232,.55)}
</style></head><body><div class="qa-top">Synthetic Canva editor (QA) · Vamo Copenhagen before 8 · Instagram Post (3:4)</div><div class="qa-side"></div><div id="stage">${body}</div>${markers}</body></html>`;
}

// Inside the 108 px safe area (Vamo's margin): the captured starting post has all three texts outside it (see the FB-14 report).
const SAFE_POSITIONS = { vamo: [120, 120], headline: [120, 891.786, 820], body: [120, 1276.17] };

module.exports = { FIXTURES, POSITIONS, CAPTURED, CAPTURED_ZOOM, CAROUSEL_ZOOM, CREAM, NAVY, SAFE_POSITIONS, NEAR_BLACK, build, image };
