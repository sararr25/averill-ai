const { sourceFor } = require('./campaign');

const approved = {
  audience: 'Travel subscribers — Denmark',
  emailFooter: 'You are receiving this email because you subscribed to Aurelia Travel. Unsubscribe anytime.',
  reelAsset: 'winter-reel-vertical.svg',
  reelDate: '2026-10-17',
  disclosure: 'Paid partnership with Aurelia Travel',
  brief: 'v2',
};

function finding(id, title, body, sourceId, action) {
  return { id, title, body, source: sourceFor(sourceId), action };
}

function inspectEmail(state = {}) {
  const issues = [];
  if (/lowest\s+prices?\s+guaranteed/i.test(`${state.subject || ''} ${state.body || ''}`)) {
    issues.push(finding('unapproved-claim', 'Unapproved price claim', '“Lowest prices guaranteed” is not approved. Use “Discover curated winter city breaks” instead.', 'legal', 'Revise the claim'));
  }
  if (state.audience && state.audience !== approved.audience) {
    issues.push(finding('wrong-audience', 'Wrong audience selected', 'This campaign is approved for Denmark-based travel subscribers, not the full list.', 'brief', 'Select the Denmark segment'));
  }
  if (state.footer === false) {
    issues.push(finding('missing-footer', 'Required footer is missing', `Add the approved subscription and unsubscribe text: “${approved.emailFooter}”`, 'legal', 'Add the footer'));
  }
  return issues;
}

function inspectSocial(state = {}) {
  const issues = [];
  if (state.asset && state.asset !== approved.reelAsset) {
    issues.push(finding('wrong-format', 'Wrong asset for the Reel', 'The selected square image is from the superseded brief. The approved partner Reel uses the vertical asset.', 'brief', 'Choose the vertical asset'));
  }
  if (state.caption !== undefined && (!state.caption.toLowerCase().includes(approved.disclosure.toLowerCase()) || state.partnershipLabel === false)) {
    issues.push(finding('missing-disclosure', 'Paid partnership disclosure is missing', `Add “${approved.disclosure}” to the caption and use the platform partnership label.`, 'legal', 'Add disclosure'));
  }
  if (state.date && state.date !== approved.reelDate) {
    issues.push(finding('calendar-conflict', 'Publish date conflicts with the calendar', 'The approved partner Reel slot is 17 October 2026 at 18:00 Copenhagen time.', 'calendar', 'Choose the approved slot'));
  }
  return issues;
}

function inspectHandover(state = {}) {
  if (state.brief !== 'v1') return [];
  return [finding('superseded-brief', 'This brief is out of date', 'Brief v2 changes the audience to Denmark, removes the price guarantee, replaces the square asset, and moves the Reel to 17 October.', 'brief', 'Open brief v2')];
}

function inspect(kind, state) {
  if (kind === 'email') return inspectEmail(state);
  if (kind === 'social') return inspectSocial(state);
  if (kind === 'handover') return inspectHandover(state);
  return [];
}

function answer(question) {
  const q = (question || '').toLowerCase();
  if (!q.trim()) return { text: 'Ask me about the campaign files, approved copy, audience, publishing date, or what changed in the brief.', sources: [] };
  if (/where|file|asset|image|visual|folder|find/.test(q)) {
    return { text: 'The approved campaign files are in the shared Winter Escapes 2027 source pack. Use winter-email-hero.svg for email and winter-reel-vertical.svg for the paid creator Reel. The square asset belongs to the superseded plan.', sources: [sourceFor('brief'), sourceFor('emailAsset'), sourceFor('reelAsset')] };
  }
  if (/chang|latest|current|old|version|handover|brief/.test(q)) {
    return { text: 'Brief v2 is current. It narrows the audience to Denmark, removes the price guarantee, changes the Reel asset to vertical, and moves the Reel from 21 to 17 October 2026.', sources: [sourceFor('brief'), sourceFor('oldBrief')] };
  }
  if (/claim|price|copy|headline|guarantee/.test(q)) {
    return { text: 'Use “Discover curated winter city breaks.” The price guarantee was not approved and must not appear in campaign copy.', sources: [sourceFor('legal'), sourceFor('brief')] };
  }
  if (/when|date|schedule|publish|calendar|slot/.test(q)) {
    return { text: 'The launch email is approved for 15 October 2026 at 10:00. The paid creator Reel is approved for 17 October 2026 at 18:00, Copenhagen time.', sources: [sourceFor('calendar')] };
  }
  if (/audience|segment|target/.test(q)) {
    return { text: 'The approved email audience is Denmark-based travel subscribers interested in short European winter breaks.', sources: [sourceFor('brief')] };
  }
  if (/disclos|legal|footer|unsubscribe|partnership/.test(q)) {
    return { text: 'Emails need the subscription and unsubscribe footer. The paid creator Reel needs “Paid partnership with Aurelia Travel” in its caption and the platform partnership label.', sources: [sourceFor('legal')] };
  }
  return { text: 'I cannot verify that from the connected campaign sources. Try asking about the brief, approved assets, audience, copy, legal requirements, or content calendar.', sources: [] };
}

module.exports = { approved, inspect, answer };
