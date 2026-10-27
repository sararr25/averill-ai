// FB-10: public statements in a draft field that the employee may double-check online with Tavily.
// Deterministic and offline: it only picks sentences that contain a price, number, date, named event or place.
// Nothing here calls a provider. The employee confirms exactly which text leaves the device.
const privacy = require('./company-privacy');
const tavily = require('./tavily');

const MAX_CLAIMS = 5, MAX_LENGTH = 300, MIN_LENGTH = 10;
const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const EVENT_NOUNS = ['festival', 'summit', 'expo', 'conference', 'fair', 'marathon', 'carnival', 'parade', 'games', 'cup', 'championship', 'concert', 'market', 'markets', 'week', 'weekend', 'biennale', 'fest', 'tournament', 'exhibition']
  .map(noun => `[${noun[0].toUpperCase()}${noun[0]}]${noun.slice(1)}`).join('|');
const KINDS = [
  ['price', /[€$£]\s?\d|\d[\d.,]*\s?(?:€|\$|£|EUR\b|USD\b|GBP\b|DKK\b|kr\b|euros?\b|dollars?\b|pounds?\b)/u, 3],
  ['date', new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?${MONTH}\\b|\\b${MONTH}\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?\\b|\\b${MONTH}\\s+20\\d\\d\\b|\\b\\d{1,2}[/.]\\d{1,2}(?:[/.]\\d{2,4})?\\b`, 'u'), 3],
  ['year', /\b20\d\d\b/, 1],
  ['event', new RegExp(`(?:\\p{Lu}[\\p{L}'’-]*\\s+){1,4}(?:${EVENT_NOUNS})\\b`, 'u'), 3],
  ['number', /\b\d+(?:[.,]\d+)?\s?(?:%|nights?\b|days?\b|hours?\b|minutes?\b|km\b|miles?\b|°C|degrees\b|people\b|guests\b|rooms?\b|flights?\b|stars?\b)/u, 2],
  ['place', /\b(?:in|at|near|to|from|[Vv]isit|[Ee]xplore)\s+\p{Lu}[\p{L}'’-]+(?:\s+\p{Lu}[\p{L}'’-]+){0,2}/u, 1],
];

const normalize = text => String(text || '').replace(/\s+/g, ' ').trim();

function sentences(text) {
  const out = [];
  for (const line of String(text || '').split(/\r?\n/)) {
    for (const part of line.split(/(?<=[.!?])\s+/u)) {
      const value = normalize(part.replace(/^[\s>*•\-–—\d.)]+(?=\p{L})/u, ''));
      if (value) out.push(value);
    }
  }
  return out;
}

// internalTexts: approved internal source text. ruleValues: values of active approved rules (internal facts, not public claims).
function candidates(text, { internalTexts = [], ruleValues = [], max = MAX_CLAIMS } = {}) {
  const values = ruleValues.map(value => String(value || '').toLowerCase()).filter(value => value.length > 3);
  const seen = new Set(), scored = [];
  sentences(text).forEach((sentence, order) => {
    const key = sentence.toLowerCase();
    if (sentence.length < MIN_LENGTH || sentence.length > MAX_LENGTH || seen.has(key) || /^https?:\/\/\S+$/i.test(sentence)) return;
    const score = KINDS.reduce((total, [, pattern, weight]) => total + (pattern.test(sentence) ? weight : 0), 0);
    if (!score) return;
    if (privacy.credentials(sentence) || tavily.leaksInternal(sentence, internalTexts, 40) || values.some(value => key.includes(value))) return;
    seen.add(key); scored.push({ sentence, score, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, max).sort((a, b) => a.order - b.order).map(item => item.sentence);
}

module.exports = { candidates, normalize, MAX_CLAIMS, MAX_LENGTH };
