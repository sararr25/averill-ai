export type BrevoCampaignStatus = 'Draft' | 'Scheduled' | 'Sent';
export type BrevoSection = { heading: string; body: string; imageUrl?: string };
export type BrevoCta = { label: string; url: string };
export type BrevoCampaign = {
  id: string;
  name: string;
  folder?: string;
  status: BrevoCampaignStatus;
  senderName: string;
  senderEmail: string;
  recipients: string;
  subject: string;
  previewText: string;
  body: string;
  imageUrl?: string;
  // Optional structured layout for the rendered preview. The plain `body` stays the editable source of truth.
  headline?: string;
  intro?: string;
  sections?: BrevoSection[];
  cta?: BrevoCta;
  signOff?: string;
  scheduledFor?: string;
  stats?: { recipients: number; opens: number; clicks: number; unsubscribed: number };
  createdAt: string;
  updatedAt: string;
};
