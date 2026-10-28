// Canva design reader (FB-14). Reads the open Canva design from the page itself: no screenshots, no OCR.
// Structure it relies on (FB-13 spike, docs/CANVA_SPIKE_2026-10-25.md and tests/fixtures/canva-page-structure-2026-10-25.json):
// - the page frame is a div whose inline width and height equal the design size; an ancestor carries the zoom as a CSS scale;
// - every element sits in a positioned wrapper whose inline transform is translate(x, y), optionally followed by rotate(deg)
//   (carousel capture tests/fixtures/canva-carousel-slide-2026-10-28.json), with an inline size; groups nest wrappers. Positions
//   are composed from the computed transform, transform-origin and layout offset of every element up to the frame (DOMMatrix),
//   and checked against the drawn bounding box, so a rotated text gets its real corners and its background is sampled under
//   the rotated box, also on rotated pictures (through the inverse matrix);
// - text is real DOM (p and span) with a computed color; a second, unpositioned text layer next to the frame holds every text
//   with its font size (a visual span can be empty because Canva draws those glyphs elsewhere);
// - background pictures are img elements loaded with crossOrigin "anonymous", so their pixels can be read in a canvas;
// - the editor shows one page (slide) at a time: the open one carries div[role=group][aria-label="Page N"], the page strip has
//   one aria-label="Page N" thumbnail per page and the page bar reads "N / M". When these do not agree, slide is null.
// When the page does not look like that, read() returns { state: 'unreadable' } and never guesses.
// Only the text and numbers produced here may leave the page (see validate()); pixels never do.
(function (root) {
  'use strict';
  // Instagram post sizes Canva offers (square, 4:5 portrait, 3:4 portrait, 9:16 story). Width first.
  const DESIGN_SIZES = [[1080, 1080], [1080, 1350], [1080, 1440], [1080, 1920]];
  const MAX_ELEMENTS = 30, MAX_TEXT = 500, MAX_TOTAL_TEXT = 6000, MAX_COLORS = 4, MAX_SLIDES = 100;
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
    // slide is optional: { index, count } of the open carousel page, or null when Averill cannot tell which page it is.
    exactKeys(input, 'slide' in Object(input) ? ['design', 'elements', 'slide'] : ['design', 'elements'], 'design check');
    let slide;
    if ('slide' in input) {
      if (input.slide === null) slide = null;
      else {
        exactKeys(input.slide, ['index', 'count'], 'slide');
        const { index, count } = input.slide;
        if (!Number.isInteger(count) || count < 1 || count > MAX_SLIDES || !Number.isInteger(index) || index < 1 || index > count) fail('Invalid slide.');
        slide = { index, count };
      }
    }
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
    return slide === undefined ? { design, elements } : { design, elements, slide };
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
    // Product of the x scale of el and every ancestor (rotation removed): how many screen pixels one CSS pixel of el covers.
    const scaleChain = el => { let s = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const m = matrix(n); s *= Math.hypot(m.a, m.b); } return s; };
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

  // Which page of a carousel is open. null when the markers are missing or disagree: the reading still runs, but cannot count
  // towards "every slide checked".
  function slideOf(doc) {
    const page = el => { const m = /^Page (\d{1,3})$/.exec(el.getAttribute('aria-label') || ''); return m ? Number(m[1]) : null; };
    const open = [...new Set([...doc.querySelectorAll('div[role="group"][aria-label^="Page "]')].map(page).filter(n => n !== null))];
    if (open.length !== 1) return null;
    const index = open[0];
    const thumbs = [...new Set([...doc.querySelectorAll('[role="button"][aria-label^="Page "], button[aria-label^="Page "]')].map(page).filter(n => n !== null))].sort((a, b) => a - b);
    let count = thumbs.length && thumbs.every((n, i) => n === i + 1) ? thumbs.length : null;
    const bars = [...new Set([...doc.querySelectorAll('button')].map(b => /^(\d{1,3}) \/ (\d{1,3})$/.exec(b.textContent.trim())).filter(Boolean).map(m => `${m[1]}/${m[2]}`))];
    if (bars.length > 1) return null;
    if (bars.length) {
      const [shown, total] = bars[0].split('/').map(Number);
      if (shown !== index || (count !== null && total !== count)) return null;
      count = total;
    }
    if (!count || index < 1 || index > count || count > MAX_SLIDES) return null;
    return { index, count };
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

    // Where an element is in design pixels: its layout offset in its parent, then its own transform around its transform-origin,
    // composed for every element up to the frame. Layout offsets ignore transforms, so they come from offsetLeft/offsetTop.
    const placed = new Map();
    const offsetIn = (el, parent) => {
      if (el.offsetParent === parent) return [el.offsetLeft + parent.clientLeft, el.offsetTop + parent.clientTop];
      if (el.offsetParent && el.offsetParent === parent.offsetParent) return [el.offsetLeft - parent.offsetLeft, el.offsetTop - parent.offsetTop];
      return unreadable('The positions on this page cannot be worked out.');
    };
    const toFrame = el => {
      if (el === frame) return new r.win.DOMMatrixReadOnly();
      let m = placed.get(el);
      if (m) return m;
      const parent = el.parentElement;
      if (!parent || !frame.contains(el) || !(el instanceof r.win.HTMLElement)) unreadable('The positions on this page cannot be worked out.');
      const own = r.matrix(el);
      if (!own.is2D) unreadable('A part of this design is turned in 3D. Averill cannot read it.');
      const [dx, dy] = offsetIn(el, parent);
      let local = new r.win.DOMMatrix().translate(dx, dy);
      if (!own.isIdentity) {
        const origin = r.style(el).transformOrigin.split(' ').map(px);
        if (origin.length < 2 || origin[0] === null || origin[1] === null) unreadable('The positions on this page cannot be worked out.');
        local = local.translate(origin[0], origin[1]).multiply(own).translate(-origin[0], -origin[1]);
      }
      m = toFrame(parent).multiply(local);
      placed.set(el, m);
      return m;
    };
    const corners = (m, w, h) => [[0, 0], [w, 0], [w, h], [0, h]].map(([x, y]) => m.transformPoint(new r.win.DOMPoint(x, y)));
    const bounds = points => { const xs = points.map(p => p.x), ys = points.map(p => p.y); return { x: Math.min(...xs), y: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) }; };

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
      const m = toFrame(wrapper);
      // Rotation (any angle) and moves are read; stretching, skewing and mirroring are not.
      if (Math.abs(Math.hypot(m.a, m.b) - 1) > 1e-3 || Math.abs(Math.hypot(m.c, m.d) - 1) > 1e-3 || Math.abs(m.a * m.c + m.b * m.d) > 1e-3 || m.a * m.d - m.b * m.c < 0) unreadable('A text on this page is stretched, skewed or mirrored. Averill reads straight and rotated text only.');
      const [width, height] = r.inlineSize(wrapper);
      const b = bounds(corners(m, width, height));
      const box = { x: b.x, y: b.y, width: b.right - b.x, height: b.bottom - b.y };
      const drawn = toDesign(wrapper.getBoundingClientRect());
      if (Math.abs(drawn.x - box.x) > POSITION_TOLERANCE || Math.abs(drawn.y - box.y) > POSITION_TOLERANCE || Math.abs(drawn.width - box.width) > POSITION_TOLERANCE || Math.abs(drawn.height - box.height) > POSITION_TOLERANCE) unreadable('The text positions on this page do not add up.');
      const opacity = opacityUpTo(paragraphs[0], frame);
      const runs = paragraphs.flatMap(p => { const spans = [...p.querySelectorAll('span')]; return spans.length ? spans : [p]; });
      const colors = runs.map(run => r.style(run).color);
      const first = runs[0];
      visual.push({
        wrapper, paragraphs, matrix: m, width, height, box, opacity, colors,
        text: paragraphs.map(textOf).join('\n').trim(),
        fontSize: parseFloat(r.style(first).fontSize) * relative(first), fontWeight: parseInt(r.style(first).fontWeight, 10) || 400,
      });
    }

    // The separate text layer: p elements with an inline font size next to the frame (not inside it), grouped per text.
    // Only p elements count: the layer also holds accessibility labels in divs ("2 elements, To start navigating ..."), not text.
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
    // layer text, and the layer's font size must fit the wrapper's own (unrotated) height. Otherwise the page is unreadable.
    const norm = text => text.replace(/\s+/g, ' ').trim();
    if (layer.length === visual.length) {
      visual.forEach((item, index) => {
        const twin = layer[index];
        if (item.text && norm(item.text) !== norm(twin.text)) unreadable('The two text layers on this page do not match.');
        if (!(twin.fontSize > 0) || twin.fontSize > item.height * 1.2) unreadable('A font size on this page does not fit its text box.');
        item.text = item.text || twin.text; item.fontSize = twin.fontSize; item.fontWeight = twin.fontWeight;
        item.colors = item.colors.concat(twin.colors);
      });
    } else if (visual.some(item => !item.text)) unreadable('Averill cannot match every text on this page with its position.');

    // Background layers behind each text: images and solid fills inside the frame, in paint (document) order. Each keeps the
    // inverse of its composed matrix, so a sample point is tested inside the real (possibly rotated) box, and so are the boxes
    // of ancestors that clip it.
    const localBox = el => { const m = toFrame(el), inv = m.inverse(); if (!Number.isFinite(inv.a) || !Number.isFinite(inv.e)) unreadable('The positions on this page cannot be worked out.'); return { inv, w: el.offsetWidth, h: el.offsetHeight, bounds: bounds(corners(m, el.offsetWidth, el.offsetHeight)) }; };
    const contains = (box, x, y) => { const p = box.inv.transformPoint(new r.win.DOMPoint(x, y)); return p.x >= 0 && p.x < box.w && p.y >= 0 && p.y < box.h ? p : null; };
    // Canva cuts shapes and photos (a polaroid frame, a cropped photo) with clip-path: url(#id) pointing at an SVG clipPath of
    // plain paths in the element's own pixels. A point is inside when it is inside the element's box and in the fill of one of
    // those paths (SVGGeometryElement.isPointInFill). Any other clip (other units, transforms, basic shapes) stays unknown.
    function svgClip(el, value) {
      const m = /^url\("?#([^")]+)"?\)$/.exec(value);
      const clip = m && doc.getElementById(m[1]);
      if (!clip || clip.tagName.toLowerCase() !== 'clippath' || (clip.getAttribute('clipPathUnits') || 'userSpaceOnUse') !== 'userSpaceOnUse' || clip.getAttribute('transform') || r.style(clip).clipPath !== 'none') return null;
      const paths = [...clip.children];
      if (!paths.length || paths.some(p => !(p instanceof r.win.SVGGeometryElement) || p.getAttribute('transform') || r.style(p).clipRule !== r.style(p).fillRule || r.style(p).transform !== 'none')) return null;
      return { box: localBox(el), paths };
    }
    function inShape(shape, x, y) {
      const p = contains(shape.box, x, y);
      return Boolean(p) && shape.paths.some(path => path.isPointInFill(new r.win.DOMPoint(p.x, p.y)));
    }
    // SVG shapes (a text's highlight box, a drawn shape) are painted layers too: a sample point is mapped into the shape's own
    // user space through getScreenCTM() and tested with isPointInFill / isPointInStroke. Gradients, patterns, SVG pictures and
    // SVG text are unknown. Clip paths, masks and other definitions are not painted.
    const SVG_DEFS = 'clipPath,defs,mask,pattern,symbol,marker,linearGradient,radialGradient,filter';
    const paint = value => { if (!value || value === 'none') return null; const c = parseColor(value); if (!c) return 'unknown'; return c[3] > 0 ? c : null; };
    const svgLayer = (el, s, opacity, masked) => {
      if (el.closest(SVG_DEFS) || !(el instanceof r.win.SVGGraphicsElement) || el.tagName.toLowerCase() === 'svg' || el.tagName.toLowerCase() === 'g') return null;
      const rect = el.getBoundingClientRect(), d = toDesign(rect);
      const pad = (parseFloat(s.strokeWidth) || 0) * 2 / scale;
      const area = { x: d.x - pad, y: d.y - pad, right: d.x + d.width + pad, bottom: d.y + d.height + pad };
      if (!(area.right > area.x) || !(area.bottom > area.y)) return null;
      if (!(el instanceof r.win.SVGGeometryElement)) return { el, kind: 'unknown', area, clips: [], shapes: [], opacity };
      const fill = paint(s.fill), stroke = s.strokeWidth && parseFloat(s.strokeWidth) > 0 ? paint(s.stroke) : null;
      if (!fill && !stroke) return null;
      const ctm = el.getScreenCTM();
      if (masked || fill === 'unknown' || stroke === 'unknown' || !ctm) return { el, kind: 'unknown', area, clips: [], shapes: [], opacity };
      return { el, kind: 'svg', area, clips: [], shapes: [], opacity, inv: new r.win.DOMMatrix([ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f]).inverse(), fill: fill && [fill[0], fill[1], fill[2], fill[3] * Number(s.fillOpacity)], stroke: stroke && [stroke[0], stroke[1], stroke[2], stroke[3] * Number(s.strokeOpacity)] };
    };
    const layers = [];
    for (const el of [frame, ...frame.querySelectorAll('*')]) {
      const s = r.style(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      if (!(el instanceof r.win.HTMLElement)) {
        if (el.closest(SVG_DEFS)) continue;
        let opacity = 1, masked = false;
        for (let n = el; n; n = n.parentElement) { opacity *= Number(r.style(n).opacity); if (n !== el && r.style(n).clipPath && r.style(n).clipPath !== 'none') masked = true; if (n === frame) break; }
        const layer = opacity > 0 ? svgLayer(el, s, opacity, masked || (s.clipPath && s.clipPath !== 'none')) : null;
        if (layer) layers.push(layer);
        continue;
      }
      const isImage = el.tagName === 'IMG';
      const fill = isImage ? null : parseColor(s.backgroundColor);
      const pictured = !isImage && s.backgroundImage && s.backgroundImage !== 'none';
      if (!isImage && !(fill && fill[3] > 0) && !pictured) continue;
      const rect = el.getBoundingClientRect();
      if (!(rect.width > 0) || !(rect.height > 0)) continue;
      let opacity = 1, masked = false;
      const clips = [], shapes = [];
      for (let n = el; n; n = n.parentElement) {
        opacity *= Number(r.style(n).opacity);
        const clipPath = r.style(n).clipPath;
        if (clipPath && clipPath !== 'none') { const shape = svgClip(n, clipPath); if (shape) shapes.push(shape); else masked = true; }
        if (n !== el && r.style(n).overflow !== 'visible') clips.push(localBox(n));
        if (n === frame) break;
      }
      if (!(opacity > 0)) continue;
      // Anything that is not a plain picture or a flat colour (a pattern, a gradient, a cropped or masked picture, an SVG part)
      // is "unknown": a text over it fails closed.
      const kind = masked || pictured || (isImage && s.objectFit !== 'fill') ? 'unknown' : isImage ? 'image' : 'fill';
      const own = localBox(el);
      const area = own.bounds;
      layers.push({ el, kind, own, area, clips, shapes, opacity, fill });
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
        // HTML layers test their own (possibly rotated) box here; SVG shapes test their own geometry below.
        const local = l.own ? contains(l.own, px0, py0) : true;
        if (!local || l.clips.some(box => !contains(box, px0, py0)) || l.shapes.some(shape => !inShape(shape, px0, py0))) continue;
        if (l.kind === 'unknown') unreadable('Part of the background behind a text is a gradient, a pattern, a masked picture or a shape. Averill cannot measure its contrast.');
        let c;
        if (l.kind === 'svg') {
          const p = l.inv.transformPoint(new r.win.DOMPoint(frameRect.left + px0 * scale, frameRect.top + py0 * scale));
          const paintAt = l.stroke && l.el.isPointInStroke(p) ? l.stroke : l.fill && l.el.isPointInFill(p) ? l.fill : null;
          if (!paintAt) continue;
          c = [paintAt[0], paintAt[1], paintAt[2], paintAt[3] * l.opacity];
        } else if (l.kind === 'fill') c = [l.fill[0], l.fill[1], l.fill[2], l.fill[3] * l.opacity];
        else {
          const p = pixelsOf(l);
          const u = Math.min(p.width - 1, Math.max(0, Math.floor(local.x / l.own.w * p.width)));
          const v = Math.min(p.height - 1, Math.max(0, Math.floor(local.y / l.own.h * p.height)));
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
      // Behind a text: everything painted before its wrapper, and what its wrapper draws before the text itself (Canva's text
      // highlight box). Anything the wrapper paints inside or after the text is an effect Averill cannot place: fail closed.
      const firstP = item.paragraphs[0];
      const own = layers.filter(l => item.wrapper.contains(l.el) && l.el !== item.wrapper);
      if (own.some(l => l.el.contains(firstP) || !(firstP.compareDocumentPosition(l.el) & 2))) unreadable('A text on this page has an effect drawn over it. Averill cannot measure its contrast.');
      const stack = layers.filter(l => l.el === item.wrapper || l.el.contains(item.wrapper) || own.includes(l) || (item.wrapper.compareDocumentPosition(l.el) & 2));
      // Sample a grid over the text's own (possibly rotated) box, keeping the points that fall on the page.
      const samples = [];
      const cols = Math.min(GRID, Math.max(2, Math.ceil(item.width / 6))), rows = Math.min(GRID, Math.max(2, Math.ceil(item.height / 6)));
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const p = item.matrix.transformPoint(new r.win.DOMPoint((i + 0.5) * item.width / cols, (j + 0.5) * item.height / rows));
        if (p.x >= 0 && p.x < W && p.y >= 0 && p.y < H) samples.push(colorAt(stack, p.x, p.y));
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
    return { state: 'ok', design: { width: W, height: H, scale: round(scale, 6) }, elements, slide: slideOf(doc) };
  }

  // Where the design page is on screen, so the card can stay beside it. Null when there is no single frame.
  function frameRect(doc = root.document) {
    try { return findFrame(doc, reader(doc)).getBoundingClientRect(); } catch { return null; }
  }

  const api = { DESIGN_SIZES, MAX_ELEMENTS, MAX_TEXT, MAX_TOTAL_TEXT, luminance, contrast, clusters, worstContrast, parseColor, validate, validCheckId, read, frameRect };
  root.AverillCanvaDesign = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
