// Canva design reader (FB-14). Reads the open Canva design from the page itself: no screenshots, no OCR.
// Structure it relies on (FB-13 spike, docs/CANVA_SPIKE_2026-10-25.md and tests/fixtures/canva-page-structure-2026-10-25.json):
// - the page frame is a div whose inline width and height equal the design size; an ancestor carries the zoom as a CSS scale;
// - every element sits in a positioned wrapper whose inline transform is translate(x, y) in design pixels, with an inline size;
// - text is real DOM (p and span) with a computed color; a second, unpositioned text layer next to the frame holds every text
//   with its font size (a visual span can be empty because Canva draws those glyphs elsewhere);
// - background pictures are img elements loaded with crossOrigin "anonymous", so their pixels can be read in a canvas.
// When the page does not look like that, read() returns { state: 'unreadable' } and never guesses.
// Only the text and numbers produced here may leave the page (see validate()); pixels never do.
(function (root) {
  'use strict';
  // Instagram post sizes Canva offers (square, 4:5 portrait, 3:4 portrait, 9:16 story). Width first.
  const DESIGN_SIZES = [[1080, 1080], [1080, 1350], [1080, 1440], [1080, 1920]];
  const MAX_ELEMENTS = 30, MAX_TEXT = 500, MAX_TOTAL_TEXT = 6000, MAX_COLORS = 4;
  const GRID = 40, CLUSTER_SHARE = 0.1, POSITION_TOLERANCE = 2, SCALE_TOLERANCE = 0.02;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const IMAGE_DATA = /data:[a-z]+\/[a-z0-9.+-]+;base64,/i;

  // ---- Colour maths (WCAG 2.x relative luminance and contrast ratio) ----
  function linear(value) { const c = value / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function luminance(rgb) { return 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]); }
  function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  // A text colour with alpha below 1 is first blended over the background it sits on.
  function over(top, alpha, bottom) { return [0, 1, 2].map(i => top[i] * alpha + bottom[i] * (1 - alpha)); }
  // The darkest and the lightest 10% of the sampled background pixels, each averaged. Worst case, not the mean.
  function clusters(pixels) {
    if (!pixels.length) return null;
    const sorted = pixels.map(p => [luminance(p), p]).sort((a, b) => a[0] - b[0]);
    const n = Math.max(1, Math.ceil(sorted.length * CLUSTER_SHARE));
    const mean = list => [0, 1, 2].map(i => list.reduce((sum, [, p]) => sum + p[i], 0) / list.length);
    return { dark: mean(sorted.slice(0, n)), light: mean(sorted.slice(-n)) };
  }
  // Lowest contrast of any text colour against either background cluster.
  function worstContrast(colors, background) {
    let worst = Infinity;
    for (const color of colors) for (const bg of [background.dark, background.light]) {
      const alpha = color.length > 3 ? color[3] : 1;
      worst = Math.min(worst, contrast(over(color, alpha, bg), bg));
    }
    return worst;
  }
  function parseColor(text) {
    const value = String(text || '').trim();
    let m = /^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)$/.exec(value);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1)];
    m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/.exec(value);
    if (m) return [Number(m[1]) * 255, Number(m[2]) * 255, Number(m[3]) * 255, m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1)];
    return null;
  }

  // ---- What may leave the page: texts and bounded numbers only ----
  function fail(message) { throw new Error(message); }
  function exactKeys(value, keys, what) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`Invalid ${what}.`);
    const own = Object.keys(value);
    if (own.length !== keys.length || own.some(key => !keys.includes(key))) fail(`Invalid ${what}.`);
  }
  function number(value, min, max, what) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(`Invalid ${what}.`);
    return Math.round(value * 1000) / 1000;
  }
  function rgb(value, alpha, what) {
    if (!Array.isArray(value) || value.length !== (alpha ? 4 : 3)) fail(`Invalid ${what}.`);
    return value.map((part, index) => number(part, 0, index === 3 ? 1 : 255, what));
  }
  // Throws on anything else: unknown keys, image data, more than 30 texts, texts over 500 characters, numbers out of range.
  function validate(input) {
    exactKeys(input, ['design', 'elements'], 'design check');
    exactKeys(input.design, ['width', 'height', 'scale'], 'design size');
    const design = { width: number(input.design.width, 100, 5000, 'design width'), height: number(input.design.height, 100, 5000, 'design height'), scale: number(input.design.scale, 0.01, 10, 'zoom') };
    if (!Array.isArray(input.elements) || input.elements.length > MAX_ELEMENTS) fail(`A design check carries at most ${MAX_ELEMENTS} texts.`);
    let total = 0;
    const elements = input.elements.map(element => {
      exactKeys(element, ['text', 'box', 'fontSize', 'fontWeight', 'colors', 'background'], 'text element');
      if (typeof element.text !== 'string' || !element.text.trim() || element.text.length > MAX_TEXT || IMAGE_DATA.test(element.text)) fail(`Each text must be 1 to ${MAX_TEXT} characters of plain text.`);
      total += element.text.length;
      exactKeys(element.box, ['x', 'y', 'width', 'height'], 'text box');
      const box = { x: number(element.box.x, -20000, 20000, 'text box'), y: number(element.box.y, -20000, 20000, 'text box'), width: number(element.box.width, 0.01, 20000, 'text box'), height: number(element.box.height, 0.01, 20000, 'text box') };
      if (!Array.isArray(element.colors) || !element.colors.length || element.colors.length > MAX_COLORS) fail('Invalid text colors.');
      exactKeys(element.background, ['dark', 'light'], 'background');
      if (!Number.isInteger(element.fontWeight) || element.fontWeight < 1 || element.fontWeight > 1000) fail('Invalid font weight.');
      return {
        text: element.text, box, fontSize: number(element.fontSize, 0.01, 2000, 'font size'), fontWeight: element.fontWeight,
        colors: element.colors.map(color => rgb(color, true, 'text color')),
        background: { dark: rgb(element.background.dark, false, 'background'), light: rgb(element.background.light, false, 'background') },
      };
    });
    if (total > MAX_TOTAL_TEXT) fail(`A design check carries at most ${MAX_TOTAL_TEXT} characters of text.`);
    return { design, elements };
  }
  function validCheckId(value) { return typeof value === 'string' && UUID.test(value); }

  // ---- Page reader ----
  class Unreadable extends Error {}
  const unreadable = message => { throw new Unreadable(message); };
  const round = (value, places = 2) => Math.round(value * 10 ** places) / 10 ** places;
  const px = value => { const m = /^(-?\d+(?:\.\d+)?(?:e-?\d+)?)px$/.exec(String(value || '').trim()); return m ? Number(m[1]) : null; };

  // Text of a paragraph with each <br> (Canva's soft line break, Shift+Enter) read as a line break; textContent drops it.
  function textOf(p) {
    let text = '';
    const walk = node => { for (const child of node.childNodes) { if (child.nodeType === 3) text += child.nodeValue; else if (child.nodeName === 'BR') text += '\n'; else if (child.nodeType === 1) walk(child); } };
    walk(p);
    return text.replace(/\u200b/g, '').trim();
  }

  function reader(doc) {
    const win = doc.defaultView;
    const styles = new Map();
    const style = el => { let s = styles.get(el); if (!s) { s = win.getComputedStyle(el); styles.set(el, s); } return s; };
    const matrix = el => { const t = style(el).transform; return !t || t === 'none' ? new win.DOMMatrixReadOnly() : new win.DOMMatrixReadOnly(t); };
    const straight = m => Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6;
    const inlineSize = el => [px(el.style.width), px(el.style.height)];
    const isDesignSize = ([w, h]) => w !== null && h !== null && DESIGN_SIZES.some(([a, b]) => Math.abs(a - w) < 0.01 && Math.abs(b - h) < 0.01);
    // Product of the x scale of el and every ancestor: how many screen pixels one CSS pixel of el covers.
    const scaleChain = el => { let s = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) s *= matrix(n).a; return s; };
    return { win, style, matrix, straight, inlineSize, isDesignSize, scaleChain };
  }

  function findFrame(doc, r) {
    const ours = el => el.closest('[data-averill-companion],[data-averill-design]');
    const frames = [...doc.querySelectorAll('div[style]')].filter(el => r.isDesignSize(r.inlineSize(el)) && !ours(el)
      && (!el.style.transform || el.style.transform === 'none') && el.querySelector('p')
      && [...el.querySelectorAll('div[style]')].some(child => /translate\(/.test(child.style.transform)));
    // At 100% zoom an outer container can have the design size too: the frame is the innermost candidate.
    const top = frames.filter(el => !frames.some(other => other !== el && el.contains(other)));
    if (!top.length) unreadable('Averill cannot find the design page on this screen.');
    if (top.length > 1) unreadable('This design shows more than one page. Averill reads one-page designs only.');
    return top[0];
  }

  function read(doc = root.document, { imageCache } = {}) {
    const started = Date.now();
    try {
      const result = readDesign(doc, imageCache || new WeakMap());
      result.ms = Date.now() - started;
      return result;
    } catch (error) {
      if (error instanceof Unreadable) return { state: 'unreadable', reason: error.message };
      // Anything unexpected is still a "cannot read", with the cause kept for the employee and the logs.
      return { state: 'unreadable', reason: `Averill could not read this page (${String(error && error.message || error).slice(0, 160)}).` };
    }
  }

  function readDesign(doc, imageCache) {
    const r = reader(doc);
    const frame = findFrame(doc, r);
    const [W, H] = r.inlineSize(frame);
    const frameRect = frame.getBoundingClientRect();
    // Zoom two ways: the transforms above the frame, and its drawn width over its inline width. They must agree.
    let chain = 1;
    for (let el = frame.parentElement; el; el = el.parentElement) { const m = r.matrix(el); if (!r.straight(m)) unreadable('The design page is rotated on screen.'); chain *= m.a; }
    const rectScale = frameRect.width / W;
    if (!(chain > 0) || !(rectScale > 0) || Math.abs(rectScale - chain) / chain > SCALE_TOLERANCE || Math.abs(frameRect.height / H - chain) / chain > SCALE_TOLERANCE) unreadable('Averill cannot work out the zoom of this design.');
    const scale = chain;
    const toDesign = rect => ({ x: (rect.left - frameRect.left) / scale, y: (rect.top - frameRect.top) / scale, width: rect.width / scale, height: rect.height / scale });

    // Text elements: every p inside the frame belongs to the innermost wrapper that has an inline size and a translate().
    const positioned = el => r.inlineSize(el).every(v => v !== null) && /translate\(/.test(el.style.transform);
    const wrappers = new Map();
    for (const p of frame.querySelectorAll('p')) {
      let wrapper = null;
      for (let el = p.parentElement; el && el !== frame; el = el.parentElement) if (el.tagName === 'DIV' && positioned(el)) { wrapper = el; break; }
      if (!wrapper) unreadable('A text on this page has no readable position.');
      if (!wrappers.has(wrapper)) wrappers.set(wrapper, []);
      wrappers.get(wrapper).push(p);
    }
    if (wrappers.size > MAX_ELEMENTS) unreadable(`This design has more than ${MAX_ELEMENTS} texts. Averill reads up to ${MAX_ELEMENTS}.`);
    const relative = el => r.scaleChain(el) / r.scaleChain(frame);
    const opacityUpTo = (el, stop) => { let o = 1; for (let n = el; n && n !== stop; n = n.parentElement) o *= Number(r.style(n).opacity); return o; };
    const visual = [];
    for (const [wrapper, paragraphs] of wrappers) {
      let x = 0, y = 0;
      for (let el = wrapper; el && el !== frame; el = el.parentElement) {
        const m = r.matrix(el);
        if (!r.straight(m) || Math.abs(m.a - 1) > 1e-3 || Math.abs(m.d - 1) > 1e-3) unreadable('A text on this page is rotated or stretched. Averill reads straight text only.');
        x += m.e; y += m.f;
      }
      const [width, height] = r.inlineSize(wrapper);
      const drawn = toDesign(wrapper.getBoundingClientRect());
      if (Math.abs(drawn.x - x) > POSITION_TOLERANCE || Math.abs(drawn.y - y) > POSITION_TOLERANCE || Math.abs(drawn.width - width) > POSITION_TOLERANCE || Math.abs(drawn.height - height) > POSITION_TOLERANCE) unreadable('The text positions on this page do not add up.');
      const opacity = opacityUpTo(paragraphs[0], frame);
      const runs = paragraphs.flatMap(p => { const spans = [...p.querySelectorAll('span')]; return spans.length ? spans : [p]; });
      const colors = runs.map(run => r.style(run).color);
      const first = runs[0];
      visual.push({
        wrapper, box: { x, y, width, height }, opacity, colors,
        text: paragraphs.map(textOf).join('\n').trim(),
        fontSize: parseFloat(r.style(first).fontSize) * relative(first), fontWeight: parseInt(r.style(first).fontWeight, 10) || 400,
      });
    }

    // The separate text layer: p elements with an inline font size next to the frame (not inside it), grouped per text.
    let scope = null;
    for (let el = frame.parentElement, steps = 0; el && steps < 3; el = el.parentElement, steps++) {
      if ([...el.querySelectorAll('p')].some(p => !frame.contains(p) && p.style.fontSize)) { scope = el; break; }
    }
    const layer = [];
    if (scope) {
      const groups = new Map();
      for (const p of scope.querySelectorAll('p')) {
        if (frame.contains(p) || !p.style.fontSize || p.closest('[data-averill-companion],[data-averill-design]')) continue;
        if (!groups.has(p.parentElement)) groups.set(p.parentElement, []);
        groups.get(p.parentElement).push(p);
      }
      for (const paragraphs of groups.values()) {
        const runs = paragraphs.flatMap(p => { const spans = [...p.querySelectorAll('span')]; return spans.length ? spans : [p]; });
        layer.push({
          text: paragraphs.map(textOf).join('\n').trim(),
          fontSize: Math.max(...paragraphs.map(p => px(p.style.fontSize) * relative(p))),
          fontWeight: parseInt(r.style(runs[0]).fontWeight, 10) || 400,
          colors: runs.map(run => r.style(run).color),
        });
      }
    }
    // Matching: by order. Both layers must hold the same number of texts, every visual text that has glyphs must equal its
    // layer text, and the layer's font size must fit the wrapper's height. Otherwise the page is unreadable.
    const norm = text => text.replace(/\s+/g, ' ').trim();
    if (layer.length === visual.length) {
      visual.forEach((item, index) => {
        const twin = layer[index];
        if (item.text && norm(item.text) !== norm(twin.text)) unreadable('The two text layers on this page do not match.');
        if (!(twin.fontSize > 0) || twin.fontSize > item.box.height * 1.2) unreadable('A font size on this page does not fit its text box.');
        item.text = item.text || twin.text; item.fontSize = twin.fontSize; item.fontWeight = twin.fontWeight;
        item.colors = item.colors.concat(twin.colors);
      });
    } else if (visual.some(item => !item.text)) unreadable('Averill cannot match every text on this page with its position.');

    // Background layers behind each text: images and solid fills inside the frame, in paint (document) order.
    const insideText = el => [...wrappers.keys()].some(w => w.contains(el));
    const layers = [];
    for (const el of [frame, ...frame.querySelectorAll('*')]) {
      if (insideText(el)) continue;
      const s = r.style(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      const isImage = el.tagName === 'IMG';
      const fill = isImage ? null : parseColor(s.backgroundColor);
      const pictured = !isImage && s.backgroundImage && s.backgroundImage !== 'none';
      if (!isImage && !(fill && fill[3] > 0) && !pictured) continue;
      let clip = { x: -Infinity, y: -Infinity, right: Infinity, bottom: Infinity }, straight = true, opacity = 1;
      for (let n = el; n; n = n.parentElement) {
        if (!r.straight(r.matrix(n))) straight = false;
        opacity *= Number(r.style(n).opacity);
        if (n !== el && r.style(n).overflow !== 'visible') {
          const c = toDesign(n.getBoundingClientRect());
          clip = { x: Math.max(clip.x, c.x), y: Math.max(clip.y, c.y), right: Math.min(clip.right, c.x + c.width), bottom: Math.min(clip.bottom, c.y + c.height) };
        }
        if (n === frame) break;
      }
      if (!(opacity > 0)) continue;
      const rect = toDesign(el.getBoundingClientRect());
      const area = { x: Math.max(rect.x, clip.x), y: Math.max(rect.y, clip.y), right: Math.min(rect.x + rect.width, clip.right), bottom: Math.min(rect.y + rect.height, clip.bottom) };
      if (area.right <= area.x || area.bottom <= area.y) continue;
      const kind = !straight || pictured || (isImage && r.style(el).objectFit !== 'fill') ? 'unknown' : isImage ? 'image' : 'fill';
      layers.push({ el, kind, rect, area, opacity, fill });
    }
    const pixelsOf = layer => {
      const img = layer.el;
      const cached = imageCache.get(img);
      if (cached && cached.src === img.currentSrc && cached.w === img.naturalWidth) return cached;
      if (!img.complete || !img.naturalWidth || !img.naturalHeight) unreadable('The design images are still loading. Averill tries again after your next edit.');
      const w = Math.min(img.naturalWidth, 1200), h = Math.max(1, Math.round(img.naturalHeight * w / img.naturalWidth));
      const canvas = doc.createElement('canvas'); canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      let data;
      try { data = ctx.getImageData(0, 0, w, h).data; } catch { unreadable('A picture in this design cannot be read by the page, so its contrast is unknown.'); }
      const entry = { src: img.currentSrc, w: img.naturalWidth, width: w, height: h, data };
      imageCache.set(img, entry);
      return entry;
    };
    const colorAt = (stack, px0, py0) => {
      let acc = [0, 0, 0], alpha = 0;
      for (let i = stack.length - 1; i >= 0 && alpha < 0.995; i--) {
        const l = stack[i];
        if (px0 < l.area.x || px0 >= l.area.right || py0 < l.area.y || py0 >= l.area.bottom) continue;
        if (l.kind === 'unknown') unreadable('Part of the background behind a text is rotated, a gradient or a pattern. Averill cannot measure its contrast.');
        let c;
        if (l.kind === 'fill') c = [l.fill[0], l.fill[1], l.fill[2], l.fill[3] * l.opacity];
        else {
          const p = pixelsOf(l);
          const u = Math.min(p.width - 1, Math.max(0, Math.floor((px0 - l.rect.x) / l.rect.width * p.width)));
          const v = Math.min(p.height - 1, Math.max(0, Math.floor((py0 - l.rect.y) / l.rect.height * p.height)));
          const o = (v * p.width + u) * 4;
          c = [p.data[o], p.data[o + 1], p.data[o + 2], p.data[o + 3] / 255 * l.opacity];
        }
        const share = (1 - alpha) * c[3];
        acc = acc.map((value, k) => value + c[k] * share); alpha += share;
      }
      if (alpha < 0.98) unreadable('Part of the background behind a text is transparent or unknown.');
      return acc.map(value => value / alpha);
    };

    const elements = [];
    for (const item of visual) {
      if (!item.text || !(item.opacity > 0)) continue;
      const stack = layers.filter(l => l.el === item.wrapper || l.el.contains(item.wrapper) || (item.wrapper.compareDocumentPosition(l.el) & 2));
      const x0 = Math.max(0, item.box.x), y0 = Math.max(0, item.box.y), x1 = Math.min(W, item.box.x + item.box.width), y1 = Math.min(H, item.box.y + item.box.height);
      const samples = [];
      if (x1 > x0 && y1 > y0) {
        const cols = Math.min(GRID, Math.max(2, Math.ceil((x1 - x0) / 6))), rows = Math.min(GRID, Math.max(2, Math.ceil((y1 - y0) / 6)));
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) samples.push(colorAt(stack, x0 + (i + 0.5) * (x1 - x0) / cols, y0 + (j + 0.5) * (y1 - y0) / rows));
      }
      if (!samples.length) unreadable('A text sits outside the design page, so its background cannot be measured.');
      const bg = clusters(samples);
      const colors = [];
      for (const css of item.colors) {
        const c = parseColor(css);
        if (!c) unreadable('A text color on this page cannot be read.');
        const value = [Math.round(c[0]), Math.round(c[1]), Math.round(c[2]), round(Math.min(1, c[3] * item.opacity), 3)];
        if (!colors.some(other => other.every((v, k) => v === value[k]))) colors.push(value);
      }
      if (colors.length > MAX_COLORS) unreadable(`A text uses more than ${MAX_COLORS} colors. Averill reads up to ${MAX_COLORS} per text.`);
      elements.push({
        text: item.text.slice(0, MAX_TEXT),
        box: { x: round(item.box.x), y: round(item.box.y), width: round(item.box.width), height: round(item.box.height) },
        fontSize: round(item.fontSize), fontWeight: Math.min(1000, Math.max(1, item.fontWeight)),
        colors, background: { dark: bg.dark.map(v => round(v, 1)), light: bg.light.map(v => round(v, 1)) },
      });
    }
    return { state: 'ok', design: { width: W, height: H, scale: round(scale, 6) }, elements };
  }

  // Where the design page is on screen, so the card can stay beside it. Null when there is no single frame.
  function frameRect(doc = root.document) {
    try { return findFrame(doc, reader(doc)).getBoundingClientRect(); } catch { return null; }
  }

  const api = { DESIGN_SIZES, MAX_ELEMENTS, MAX_TEXT, MAX_TOTAL_TEXT, luminance, contrast, clusters, worstContrast, parseColor, validate, validCheckId, read, frameRect };
  root.AverillCanvaDesign = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
