import type { BrevoCampaign } from '../types/brevo';
export function notifyBrevoCampaignCreated(campaign: BrevoCampaign): void {
  window.dispatchEvent(new CustomEvent('demo-brevo-campaign-created', { detail: { platform:'brevo', campaign } }));
  console.info('[Demo Social Simulator] Brevo campaign created', { id:campaign.id });
}
export function notifyBrevoCampaignStatusChanged(campaign: BrevoCampaign): void {
  window.dispatchEvent(new CustomEvent('demo-brevo-campaign-status-changed', { detail: { platform:'brevo', campaign } }));
  console.info('[Demo Social Simulator] Brevo campaign status changed', { id:campaign.id, status:campaign.status });
}
