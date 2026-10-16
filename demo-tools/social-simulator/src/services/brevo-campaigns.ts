import type { BrevoCampaign } from '../types/brevo';
import { notifyBrevoCampaignCreated } from './brevo-events';
const STORAGE_KEY = 'demo-social-simulator:vamo-brevo-campaigns:v2';
const seed: BrevoCampaign[] = [
  { id:'vamo-brevo-winter-v2', name:'Winter Escapes 2027 · launch draft', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'All travel subscribers', subject:'Winter Escapes 2027 — lowest prices guaranteed', previewText:'Copenhagen, Vienna and Prague, through our eyes.', body:'Our lowest prices guaranteed. Explore Copenhagen, Vienna and Prague this winter.', createdAt:'2026-09-28T08:00:00Z', updatedAt:'2026-10-04T08:00:00Z' },
  // Sent and scheduled history so the account reads like an active newsletter. The winter launch draft above stays intentionally flawed for Averill's review.
  { id:'vamo-brevo-prague-guide', name:'City notes · Prague before 8', folder:'Newsletter', status:'Scheduled', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'Prague is a different city before 8 am', previewText:'Three early-morning moments worth setting an alarm for.', body:'Hi there,\n\nThe same bridge at 7 am and at noon are two different places. Before the city wakes up, Prague belongs to bakers, tram drivers and anyone curious enough to set an alarm.\n\n01 · Charles Bridge before the crowds\n02 · Coffee on the Malá Strana side\n03 · The walk up to the castle, slowly\n\nSave this one for your next trip — and let us know which moment you try first.\n\nSee you out there,\nThe Vamo team\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/prague.jpg', scheduledFor:'2026-10-22T08:00:00Z', createdAt:'2026-10-08T09:00:00Z', updatedAt:'2026-10-12T14:20:00Z' },
  { id:'vamo-brevo-vienna-48', name:'September newsletter · Vienna, slowly', folder:'Newsletter', status:'Sent', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'48 hours in Vienna, at the right speed', previewText:'A long breakfast, the Ring by tram, and one museum chosen carefully.', body:'Hi there,\n\nVienna rewards people who don’t rush it. Here’s how our team spends 48 hours there.\n\nDay one: start with a long breakfast — the kind where the second coffee arrives before you ask. Then ride the Ring by tram and get off wherever looks interesting.\n\nDay two: choose one museum, carefully. Spend the afternoon somewhere you didn’t plan.\n\nWhat’s your favourite slow city? Hit reply — we read every answer.\n\nThe Vamo team\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/vienna.jpg', scheduledFor:'2026-09-30T08:00:00Z', createdAt:'2026-09-22T09:00:00Z', updatedAt:'2026-09-30T08:00:00Z' },
  { id:'vamo-brevo-welcome-1', name:'Welcome series · Email 1', folder:'Automations', status:'Sent', senderName:'Maya from Vamo', senderEmail:'hello@vamo.example', recipients:'New subscribers', subject:'Welcome to Vamo — go somewhere good', previewText:'Who we are, what we plan, and what to expect from us.', body:'Hi, and welcome!\n\nI’m Maya, and I look after marketing at Vamo. We’re a small team in Copenhagen planning city breaks for curious people — trips with room in the day and good company along the way.\n\nHere’s what you’ll get from us: city notes from Copenhagen, Vienna and Prague, the occasional behind-the-scenes story, and first word when a new collection opens. Usually twice a month, never more than that.\n\nThanks for being here.\n\nMaya\nVamo, Copenhagen\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', imageUrl:'/vamo/vamo-friends-ferry.png', scheduledFor:'2026-09-15T07:00:00Z', createdAt:'2026-09-12T09:00:00Z', updatedAt:'2026-09-15T07:00:00Z' },
  { id:'vamo-brevo-packing', name:'Tip email · Winter packing list', folder:'Newsletter', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'Travel subscribers — Denmark', subject:'What we actually pack for a winter city break', previewText:'Five things, one of which isn’t a thing at all.', body:'Hi there,\n\nAfter a lot of winter weekends, our team’s packing list has shrunk to five things:\n\n· A coat you actually like\n· Shoes that forgive cobblestones\n· One small bag for the day\n· Room in the plan\n· Someone to share it with\n\nThe last two matter most.\n\nThe Vamo team\n\nYou are receiving this email because you subscribed to Vamo. Unsubscribe anytime.', createdAt:'2026-10-11T10:00:00Z', updatedAt:'2026-10-13T16:45:00Z' },
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
