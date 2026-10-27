// Canva layout essentials (feedback round 27 October, D1): which lesson steps the open Canva design already shows.
// Input is the validated design reading from the browser card (browser-extension/canva-design.js): each text, its design
// box, font size and weight, its colours and the darkest and lightest background under it. Nothing else is inspected.
// Selection and grouping are not in the page reading, so the group step is never decided here.
const { worstContrast } = require('../browser-extension/canva-design');
const { BASE_WIDTH, isLarge } = require('./design-check');

// Lesson guidance, not a company rule: 60 px from every edge of a 1080 px post, and a 1.5x headline.
const LESSON_MARGIN = 60, EDGE_TOLERANCE = 0.5, HIERARCHY_RATIO = 1.5, ALIGN_SHARE = 0.01;
const AUTO_STEPS = ['hierarchy', 'size', 'align', 'margin', 'contrast'];

function evaluate({ design, elements }) {
  const texts = [...elements].sort((a, b) => b.fontSize - a.fontSize);
  const [headline, support] = texts;
  const tolerance = ALIGN_SHARE * design.width;
  const edges = box => [box.x, box.x + box.width / 2, box.x + box.width];
  const aligned = Boolean(support) && edges(headline.box).some((edge, i) => Math.abs(edge - edges(support.box)[i]) <= tolerance);
  const margin = LESSON_MARGIN * design.width / BASE_WIDTH - EDGE_TOLERANCE;
  const inside = ({ box }) => box.x >= margin && box.y >= margin && design.width - (box.x + box.width) >= margin && design.height - (box.y + box.height) >= margin;
  const readable = element => worstContrast(element.colors, element.background) >= (isLarge(element, design) ? 3 : 4.5);
  return {
    hierarchy: texts.length >= 2,
    size: Boolean(support) && headline.fontSize >= HIERARCHY_RATIO * support.fontSize,
    align: aligned,
    margin: texts.length > 0 && texts.every(inside),
    contrast: texts.length > 0 && texts.every(readable),
  };
}

module.exports = { LESSON_MARGIN, HIERARCHY_RATIO, AUTO_STEPS, evaluate };
