import type { BrevoCampaign } from '../types/brevo';
import { notifyBrevoCampaignCreated } from './brevo-events';
const STORAGE_KEY = 'demo-social-simulator:vamo-brevo-campaigns:v2';
const seed: BrevoCampaign[] = [
  { id:'vamo-brevo-winter-v2', name:'Winter Escapes 2027 · launch draft', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'All travel subscribers', subject:'Winter Escapes 2027 — lowest prices guaranteed', previewText:'Copenhagen, Vienna and Prague, through our eyes.', body:'Our lowest prices guaranteed. Explore Copenhagen, Vienna and Prague this winter.', createdAt:'2026-09-28T08:00:00Z', updatedAt:'2026-10-04T08:00:00Z' },
  // Sent and scheduled history so the account reads like an active newsletter. The winter launch draft above stays intentionally flawed for Averill's review.
  { id:'vamo-brevo-prague-guide', name:'City notes · Prague before 8', folder:'Newsletter', status:'Scheduled', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'Get a little lost in Prague 🗺️', previewText:'Side streets, early bridges and where to find your people.', body:'Hey traveller,\n\nPrague’s main square is great. Its side streets are better.\n\nOur crew’s three moves:\n01 · Cross Charles Bridge early, before the crowds\n02 · Grab coffee on the Malá Strana side and people-watch\n03 · Say yes to the hostel walking tour — that’s where the group chat starts\n\nGo for the place. Stay for the people.\n\nSee you out there ✳\nThe Vamo crew\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/prague.jpg', scheduledFor:'2026-10-22T08:00:00Z', createdAt:'2026-10-08T09:00:00Z', updatedAt:'2026-10-12T14:20:00Z' },
  { id:'vamo-brevo-vienna-48', name:'September newsletter · Vienna, slowly', folder:'Newsletter', status:'Sent', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'Coffee first. Plans later. ☕️', previewText:'48 hours in Vienna without rushing a single café.', body:'Hey traveller,\n\nVienna has one rule: never rush a café.\n\nDay one: order the second coffee, ride the tram around the Ring and hop off wherever looks interesting.\n\nDay two: pick one museum (just one), then find a beisl with a long table and see who sits down next to you.\n\nWhat’s your slow-travel city? Hit reply — we read everything.\n\nThe Vamo crew\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/vienna.jpg', scheduledFor:'2026-09-30T08:00:00Z', createdAt:'2026-09-22T09:00:00Z', updatedAt:'2026-09-30T08:00:00Z' },
  { id:'vamo-brevo-welcome-1', name:'Welcome series · Email 1', folder:'Automations', status:'Sent', senderName:'Maya from Vamo', senderEmail:'hello@vamo.example', recipients:'New subscribers', subject:'hi from vamo 👋 go somewhere good', previewText:'Who we are, what we plan, and what lands in your inbox.', body:'Hey, welcome in!\n\nI’m Maya from the Vamo crew in Copenhagen. We plan trips for people who’d rather collect stories than souvenirs — city breaks, friends of friends, and taking the long way to a good story.\n\nWhat you’ll get from us: city notes from Copenhagen, Vienna and Prague, packing hacks, the odd behind-the-scenes, and first word when something new opens up. Twice a month, max.\n\nCollect people, not things ✳\n\nMaya\nVamo, Copenhagen\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/vamo-friends-ferry.png', scheduledFor:'2026-09-15T07:00:00Z', createdAt:'2026-09-12T09:00:00Z', updatedAt:'2026-09-15T07:00:00Z' },
  { id:'vamo-brevo-packing', name:'Tip email · Winter packing list', folder:'Newsletter', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'One backpack. Three cities. 🎒', previewText:'Our crew’s carry-on list for a winter city break.', body:'Hey traveller,\n\nZero checked bags this winter. Here’s what actually makes the backpack:\n\n✓ Layers instead of one big coat\n✓ Shoes you can walk in all day\n✓ A tote for the market\n✓ A power bank. Always.\n\nAnd the one thing that never fits but always comes: room for stories.\n\nThe Vamo crew\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', createdAt:'2026-10-11T10:00:00Z', updatedAt:'2026-10-13T16:45:00Z' },
  { id:'vamo-brevo-city-notes', name:'City notes · Copenhagen', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'Copenhagen after the rush', previewText:'A canal, a longer walk, a second stop.', body:'Pick a canal, take the longer walk, leave room for a second stop.\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', createdAt:'2026-09-27T08:00:00Z', updatedAt:'2026-09-28T10:30:00Z' },
];
function readSaved(): BrevoCampaign[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is BrevoCampaign => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string');
  } catch { return []; }
}
export function getBrevoCampaigns(): BrevoCampaign[] {
  const saved = readSaved();
  const savedIds = new Set(saved.map(item => item.id));
  return [...saved, ...seed.filter(item => !savedIds.has(item.id))];
}
export function saveBrevoCampaign(campaign: BrevoCampaign): BrevoCampaign {
  const saved = readSaved();
  const index = saved.findIndex(item => item.id === campaign.id);
  if (index >= 0) saved[index] = campaign; else saved.unshift(campaign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  if (index < 0 && !seed.some(item => item.id === campaign.id)) {
    notifyBrevoCampaignCreated(campaign);
  }
  return campaign;
}
export function getBrevoCampaign(id: string): BrevoCampaign | undefined { return getBrevoCampaigns().find(item => item.id === id); }
