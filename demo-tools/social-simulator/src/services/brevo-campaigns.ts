import type { BrevoCampaign } from '../types/brevo';
import { notifyBrevoCampaignCreated } from './brevo-events';
const STORAGE_KEY = 'demo-social-simulator:vamo-brevo-campaigns:v2';
const seed: BrevoCampaign[] = [
  { id:'vamo-brevo-winter-v2', name:'Winter Escapes 2027 · launch draft', status:'Draft', senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'All travel subscribers', subject:'Winter Escapes 2027 — lowest prices guaranteed', previewText:'Copenhagen, Vienna and Prague, through our eyes.', body:'Our lowest prices guaranteed. Explore Copenhagen, Vienna and Prague this winter.', createdAt:'2026-09-28T08:00:00Z', updatedAt:'2026-10-04T08:00:00Z' },
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
