// Canva design check (FB-14). The browser card reads the open Canva design in the page (browser-extension/canva-design.js)
// and sends only texts and numbers: each text, its design box, font size and weight, its colors and the averaged darkest and
// lightest 10% of the background under it. No image or pixel reaches this module. It checks, against approved source lines:
// (a) WCAG AA contrast, (b) that every text box sits inside Vamo's safe area, (c) the approved copy rules (forbidden claims).
// Averill only warns: it never edits, exports or shares the design.
const crypto = require('node:crypto');
const canva = require('../browser-extension/canva-design');
const taskReview = require('./task-review');
const rules = require('./rules');

// The Canva sizes the reader accepts are all Instagram posts, so design rules are looked up for the instagram work type.
const FORMAT = 'instagram';
// Large text in WCAG is at least 18 pt (24 CSS px), or 14 pt (18.66 CSS px) when bold. Averill maps that onto a design by
// counting one design pixel of a 1080 pixel wide post as one CSS pixel (a narrower or wider design is scaled to 1080 first).
// This is Averill's documented simplification: WCAG defines the size at viewing size, which a social post does not fix.
const BASE_WIDTH = 1080, LARGE_PX = 24, LARGE_BOLD_PX = 18.66, BOLD_WEIGHT = 700;
const EDGE_TOLERANCE = 0.5;
const GENERAL_CONTRAST = { source: { id: 'general-contrast', title: 'General readability · WCAG contrast', kind: 'general-guidance', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' }, quote: 'General readability guidance: contrast at least 4.5:1 for normal text and 3:1 for large text. Social-image viewing size still needs human review.' };
const GENERAL_MARGIN = { source: { id: 'general-margin', title: 'General layout · suggested inset', kind: 'general-guidance' }, quote: 'Averill suggests a 60 px text inset on a 1080 px design as a starting point. This is a layout recommendation, not a company or platform requirement.' };
const clip = (value, max) => String(value ?? '').slice(0, max);
const floor2 = value => (Math.floor(value * 100) / 100).toFixed(2);

function isLarge(element, design) {
  const size = element.fontSize * BASE_WIDTH / design.width;
  return size >= LARGE_PX || (element.fontWeight >= BOLD_WEIGHT && size >= LARGE_BOLD_PX);
}

// Distances from each edge of the design to the text box, in design pixels. A box exactly on the safe line is inside.
function safeZone(box, design, margin) {
  const need = margin * design.width / BASE_WIDTH;
  const gaps = { left: box.x, top: box.y, right: design.width - (box.x + box.width), bottom: design.height - (box.y + box.height) };
  const worst = Object.entries(gaps).filter(([, gap]) => gap < need - EDGE_TOLERANCE).sort((a, b) => a[1] - b[1])[0];
  return { need, gaps, inside: !worst, edge: worst ? worst[0] : null, gap: worst ? worst[1] : null };
}

// Approved design lines for this format, each with the exact line to cite.
function designRules(sources) {
  const found = [];
  for (const { source, text } of sources) {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      const rule = rules.parseDesignLine(line);
      if (rule && (rule.task === FORMAT || rule.task === 'any')) found.push({ ...rule, source, quote: line });
    }
  }
  return found;
}
const citation = entry => ({ id: entry.source.id, title: clip(entry.source.title, 160), version: String(entry.source.version || ''), quote: entry.quote, ...(entry.source.kind ? { kind: entry.source.kind, url: entry.source.url } : {}) });

function evaluate({ workspace, payload }) {
  const { design, elements } = canva.validate(payload);
  const eligible = taskReview.currentSources(workspace, FORMAT).filter(entry => entry.source.confidentiality !== 'restricted' && !entry.source.containsCredentials);
  const byId = new Map(eligible.map(entry => [entry.source.id, entry]));
  const found = designRules(eligible);
  const first = type => found.find(rule => rule.type === type) || null;
  const normal = first('contrast-normal'), large = first('contrast-large'), margin = first('safe-margin');
  const findings = [], notes = [];
  const add = (type, index, element, problem, measured, entry) => findings.push({ id: crypto.randomUUID(), type, element: index + 1, text: clip(element.text.replace(/\s+/g, ' ').trim(), 120), problem: clip(problem, 300), measured: clip(measured, 200), source: citation(entry) });

  elements.forEach((element, index) => {
    if (normal) {
      const big = isLarge(element, design);
      // Without an approved large-text line, large text is held to the normal (stricter) line.
      const rule = big && large ? large : normal;
      const measuredRatio = canva.worstContrast(element.colors, element.background);
      if (measuredRatio < rule.number) add('contrast', index, element, 'This text is hard to read on its background.', `contrast ${floor2(measuredRatio)}:1, needs ${rule.value}:1${big && large ? ' for large text' : ''}`, rule);
    }
    if (margin) {
      const zone = safeZone(element.box, design, margin.number);
      if (!zone.inside) {
        const gap = Math.round(zone.gap), need = Math.round(zone.need);
        const measured = gap < 0 ? `${-gap} px past the ${zone.edge} edge, needs at least ${need} px from every edge` : `${gap} px from the ${zone.edge} edge, needs at least ${need} px from every edge`;
        add('safe-zone', index, element, 'This text sits outside the safe area.', measured, margin);
      }
    }
    // General design guidance is useful even when the company has supplied no design policy.
    // A company threshold remains mandatory; only add a distinct baseline warning when it is uncovered.
    const big = isLarge(element, design), baseline = big ? 3 : 4.5;
    const companyContrast = normal ? (big && large ? large : normal) : null;
    if ((!companyContrast || companyContrast.number < baseline) && canva.worstContrast(element.colors, element.background) < baseline) {
      add('contrast', index, element, 'Increase text/background contrast: try a solid background panel or a more contrasting text color.', `contrast ${floor2(canva.worstContrast(element.colors, element.background))}:1; general readability target ${baseline}:1`, GENERAL_CONTRAST);
    }
    if (!margin || margin.number < 60) {
      const zone = safeZone(element.box, design, 60);
      if (!zone.inside) add('safe-zone', index, element, 'Move this text inward and check the intended crop. This is a general layout suggestion.', `${Math.round(zone.gap)} px from the ${zone.edge} edge; suggested inset ${Math.round(zone.need)} px`, GENERAL_MARGIN);
    }
    // The same engine as captions, limited to claims: hashtags and caption-only requirements do not apply to a design.
    for (const f of taskReview.localReview(workspace, FORMAT, element.text, null).findings.filter(item => item.type === 'forbidden-claim')) {
      const entry = byId.get(f.source?.id);
      if (!entry || typeof f.source.quote !== 'string' || !f.source.quote || !entry.text.includes(f.source.quote) || !element.text.includes(f.observedExcerpt)) continue;
      add('forbidden-claim', index, element, `Remove “${f.observedExcerpt}”. The approved rules don’t allow it.`, '', { source: entry.source, quote: f.source.quote });
    }
  });
  // Say what was not checked, so a missing rule is never read as a clean result.
  if (!normal) notes.push('Contrast uses general readability guidance. No company-specific contrast requirement is available.');
  else if (!large) notes.push('No approved large-text contrast rule applies, so large text was held to the normal contrast rule.');
  if (!margin) notes.push('The text inset is a general layout suggestion. No company-specific safe-margin requirement is available.');
  notes.push('These are measured text checks, not approval of the whole composition. Review visual hierarchy, image crop and readability at the final viewing size.');
  const checked = [normal && 'contrast', margin && 'safe area', byId.size && 'approved wording'].filter(Boolean);
  if (!normal) checked.push('general contrast');
  if (!margin) checked.push('suggested text inset');
  const state = findings.length ? 'findings' : 'clean';
  return { id: crypto.randomUUID(), state, findings: findings.slice(0, 30), checked, notes, lessonConstraints: { margin: Math.max(60, margin?.number || 0), normal: Math.max(4.5, normal?.number || 0), large: Math.max(3, (large || normal)?.number || 0) }, elementCount: elements.length, design: { width: design.width, height: design.height } };
}

// T6: the open design's own numbers, added to a design question asked in the Canva card. Only what the reader measured
// (font sizes, box positions, contrast), in design pixels; the reader cannot see font families, so no fact names one.
// reading: { design, elements } as returned by canva.validate. types: the design rule types the question is about.
function facts(reading, types) {
  const { design, elements } = reading, out = [];
  const wants = prefix => types.some(type => type.startsWith(prefix));
  if (!elements.length) return out;
  if (wants('font-')) {
    const sizes = elements.map(element => element.fontSize).sort((a, b) => b - a);
    out.push(`Your headline (largest text) uses ${Math.round(sizes[0])} px${design.width === BASE_WIDTH ? '' : ` on a ${Math.round(design.width)} px wide design`}.`);
    if (sizes.length > 1) out.push(`Your smallest text uses ${Math.round(sizes.at(-1))} px.`);
    out.push('Averill cannot see which font your design uses.');
  }
  if (wants('contrast-')) out.push(`Your lowest text contrast is ${floor2(Math.min(...elements.map(element => canva.worstContrast(element.colors, element.background))))}:1.`);
  if (wants('safe-margin')) {
    const [edge, gap] = elements.flatMap(element => Object.entries(safeZone(element.box, design, 0).gaps)).sort((a, b) => a[1] - b[1])[0];
    const px = Math.round(gap);
    out.push(px < 0 ? `Your closest text box is ${-px} px past the ${edge} edge.` : `Your closest text box is ${px} px from the ${edge} edge.`);
  }
  return out;
}

module.exports = { FORMAT, BASE_WIDTH, LARGE_PX, LARGE_BOLD_PX, isLarge, safeZone, designRules, evaluate, facts };
