// A quote's existence alone does not authorize a new commercial benefit.
// This catches common unsupported offer embellishments; proposals still require human factual review.
function unsupportedCommercial(text, quotes) {
  const positive = quotes.filter(q => typeof q === 'string' && !/do not|must not|not approved|unapproved|never|avoid|no price|cannot claim/i.test(q)).map(q => q.toLowerCase());
  const claims = String(text).match(/\b(?:pric(?:e|es|ing)|costs?|cheap(?:er|est)?|affordable|discounts?|free|complimentary|competitive|lowest|guarantee(?:d)?|exclusive|tailored|personalised|personalized)\b/gi) || [];
  return claims.some(term => !positive.some(q => q.includes(term.toLowerCase())));
}
module.exports = { unsupportedCommercial };
