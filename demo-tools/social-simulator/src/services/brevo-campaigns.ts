import type { BrevoCampaign } from '../types/brevo';
import { notifyBrevoCampaignCreated } from './brevo-events';
// Planted flawed drafts are shared with the Averill flaw-matrix test (travel-desktop/tests/flaw-matrix.test.js).
import flawedDrafts from '../data/flawed-drafts.json';
const flawed = flawedDrafts as { brevo: BrevoCampaign[] };
const STORAGE_KEY = 'demo-social-simulator:vamo-brevo-campaigns:v2';
// Approved footer sentence (brand-and-legal.md). The preview shows the footer block only when the body carries it.
export const BREVO_FOOTER = 'You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.';
const DENMARK = 'Travel subscribers, Denmark';
type Layout = Pick<BrevoCampaign, 'intro' | 'sections' | 'cta' | 'signOff'>;
// Builds the plain-text body from the structured layout so the editor and the rendered preview never disagree.
function bodyOf({ intro, sections = [], cta, signOff }: Layout): string {
  return [intro, ...sections.map(section => `${section.heading}\n${section.body}`), cta && `${cta.label}: ${cta.url}`, signOff, BREVO_FOOTER].filter(Boolean).join('\n\n');
}
function campaign(base: Omit<BrevoCampaign, 'body'> & Layout): BrevoCampaign { return { ...base, body: bodyOf(base) }; }
const seed: BrevoCampaign[] = [
  flawed.brevo[0],
  // Planted flaws (see docs): launch draft above has a price guarantee, the full list and no footer; reminder has no footer; Vienna teaser has a price guarantee.
  // Sent and scheduled history so the account reads like an active newsletter. The winter launch draft above stays intentionally flawed for Averill's review.
  campaign({ id:'vamo-brevo-prague-guide', name:'City notes · Prague before 8', folder:'Newsletter', status:'Scheduled', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:DENMARK, subject:'Get a little lost in Prague 🗺️', previewText:'Side streets, early bridges and where to find your people.', headline:'Prague before 8', intro:'Hey traveller,\n\nPrague’s main square is great. Its side streets are better. Here are our crew’s three moves.', sections:[{ heading:'Cross Charles Bridge early', body:'Get there before the crowds and the bridge is yours, plus a few photographers and a lot of fog.' },{ heading:'Coffee on the Malá Strana side', body:'Grab a window seat and people-watch. The best stories start with a stranger and a second cup.' },{ heading:'Say yes to the hostel walking tour', body:'That is where the group chat starts.' }], cta:{ label:'Plan your Prague weekend', url:'https://vamo.example/prague' }, signOff:'Go for the place. Stay for the people.\n\nSee you out there ✳\nThe Vamo crew', imageUrl:'/vamo/prague.jpg', scheduledFor:'2026-10-22T08:00:00Z', createdAt:'2026-10-08T09:00:00Z', updatedAt:'2026-10-12T14:20:00Z' }),
  campaign({ id:'vamo-brevo-vienna-48', name:'September newsletter · Vienna, slowly', folder:'Newsletter', status:'Sent', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:DENMARK, subject:'Coffee first. Plans later. ☕️', previewText:'48 hours in Vienna without rushing a single café.', headline:'Vienna, slowly', intro:'Hey traveller,\n\nVienna has one rule: never rush a café.', sections:[{ heading:'Day one', body:'Order the second coffee, ride the tram around the Ring and hop off wherever looks interesting.' },{ heading:'Day two', body:'Pick one museum (just one), then find a beisl with a long table and see who sits down next to you.' }], cta:{ label:'See the Vienna guide', url:'https://vamo.example/vienna' }, signOff:'What’s your slow-travel city? Hit reply, we read everything.\n\nThe Vamo crew', imageUrl:'/vamo/vienna.jpg', scheduledFor:'2026-09-30T08:00:00Z', stats:{ recipients:1842, opens:771, clicks:118, unsubscribed:4 }, createdAt:'2026-09-22T09:00:00Z', updatedAt:'2026-09-30T08:00:00Z' }),
  campaign({ id:'vamo-brevo-welcome-1', name:'Welcome series · Email 1', folder:'Automations', status:'Sent', senderName:'Maya from Vamo', senderEmail:'hello@vamo.example', recipients:'New subscribers', subject:'hi from vamo 👋 go somewhere good', previewText:'Who we are, what we plan, and what lands in your inbox.', headline:'Welcome to Vamo', intro:'Hey, welcome in!\n\nI’m Maya from the Vamo crew in Copenhagen.', sections:[{ heading:'Who we are', body:'We plan trips for people who’d rather collect stories than souvenirs: city breaks, friends of friends, and taking the long way to a good story.' },{ heading:'What you’ll get from us', body:'City notes from Copenhagen, Vienna and Prague, packing hacks, the odd behind-the-scenes, and first word when something new opens up. Twice a month, max.' }], cta:{ label:'Meet the crew', url:'https://vamo.example/about' }, signOff:'Collect people, not things ✳\n\nMaya\nVamo, Copenhagen', imageUrl:'/vamo/vamo-friends-ferry.png', scheduledFor:'2026-09-15T07:00:00Z', stats:{ recipients:236, opens:142, clicks:39, unsubscribed:1 }, createdAt:'2026-09-12T09:00:00Z', updatedAt:'2026-09-15T07:00:00Z' }),
  campaign({ id:'vamo-brevo-packing', name:'Tip email · Winter packing list', folder:'Newsletter', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:DENMARK, subject:'One backpack. Three cities. 🎒', previewText:'Our crew’s carry-on list for a winter city break.', headline:'One backpack, three cities', intro:'Hey traveller,\n\nZero checked bags this winter. Here’s what actually makes the backpack.', sections:[{ heading:'Layers instead of one big coat', body:'Three thin layers beat one heavy coat, and they fit in a tote when the train gets warm.' },{ heading:'Shoes you can walk in all day', body:'Pick one pair and break them in before the trip.' },{ heading:'The small stuff', body:'A tote for the market and a power bank. Always.' }], cta:{ label:'Get the full packing list', url:'https://vamo.example/packing' }, signOff:'And the one thing that never fits but always comes: room for stories.\n\nThe Vamo crew', imageUrl:'/vamo/posts/carry-on.svg', createdAt:'2026-10-11T10:00:00Z', updatedAt:'2026-10-13T16:45:00Z' }),
  campaign({ id:'vamo-brevo-city-notes', name:'City notes · Copenhagen', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:DENMARK, subject:'Copenhagen after the rush', previewText:'A canal, a longer walk, a second stop.', headline:'Copenhagen after the rush', intro:'Hey traveller,\n\nWhen the weekend crowds leave, Copenhagen gets its pace back.', sections:[{ heading:'Pick a canal', body:'Walk it end to end, no map needed.' },{ heading:'Take the longer walk', body:'The detour is usually the best part.' },{ heading:'Leave room for a second stop', body:'There is always a bakery you did not plan for.' }], cta:{ label:'Read the Copenhagen notes', url:'https://vamo.example/copenhagen' }, signOff:'The Vamo crew', imageUrl:'/vamo/copenhagen.jpg', createdAt:'2026-09-27T08:00:00Z', updatedAt:'2026-09-28T10:30:00Z' }),
  flawed.brevo[1],
  flawed.brevo[2],
  campaign({ id:'vamo-brevo-cph-after-dark', name:'October newsletter · Copenhagen after dark', folder:'Newsletter', status:'Sent', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:DENMARK, subject:'Copenhagen after 4 pm 🌙', previewText:'When the light goes early, the city gets better.', headline:'Copenhagen after dark', intro:'Hey traveller,\n\nIn October the sun is gone by five. Copenhagen does not mind. Here is our crew’s after-dark list.', sections:[{ heading:'The harbour bus at blue hour', body:'Same ride, different city. Bring a hat.' },{ heading:'A candle-lit bakery that stays open late', body:'Cinnamon buns taste better when it is dark outside.' },{ heading:'A street-food hall with shared tables', body:'Every table ends up shared, and that is the point.' }], cta:{ label:'Plan a Copenhagen evening', url:'https://vamo.example/copenhagen' }, signOff:'Go for the place. Stay for the people.\n\nThe Vamo crew', imageUrl:'/vamo/copenhagen.jpg', scheduledFor:'2026-10-08T08:00:00Z', stats:{ recipients:1866, opens:812, clicks:131, unsubscribed:3 }, createdAt:'2026-10-02T10:00:00Z', updatedAt:'2026-10-08T08:00:00Z' }),
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
