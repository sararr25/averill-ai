const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'sources');
const ASSETS = path.join(__dirname, '..', 'assets');
const sources = {
  brief: { title: 'Campaign brief · v2', file: 'current-brief.md', section: 'Audience, message, launch and approved assets' },
  oldBrief: { title: 'Campaign brief · v1 (superseded)', file: 'old-brief.md', section: 'Original plan' },
  legal: { title: 'Brand & legal guidance', file: 'brand-and-legal.md', section: 'Claims, email footer and partner disclosure' },
  calendar: { title: 'Content calendar', file: 'content-calendar.md', section: 'Approved publishing slots' },
  linkedin: { title: 'Elseweek LinkedIn campaign guidance · v1', file: 'linkedin-campaign.md', section: 'Organic company post: audience, message, CTA, visual and slot' },
  linkedinAsset: { title: 'Approved LinkedIn campaign visual', file: 'winter-linkedin-landscape.svg', section: 'Organic LinkedIn artwork', kind: 'asset' },
  emailAsset: { title: 'Approved email hero', file: 'winter-email-hero.svg', section: 'Email artwork', kind: 'asset' },
  reelAsset: { title: 'Approved vertical Reel artwork', file: 'winter-reel-vertical.svg', section: 'Partner Reel artwork', kind: 'asset' },
};

function sourceFor(id) {
  const item = sources[id];
  return item ? { id, ...item, path: path.join(item.kind === 'asset' ? ASSETS : ROOT, item.file) } : null;
}

module.exports = { sources, sourceFor };
