export type BrevoCampaignStatus = 'Draft' | 'Scheduled' | 'Sent';
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
  scheduledFor?: string;
  stats?: { recipients: number; opens: number; clicks: number; unsubscribed: number };
  createdAt: string;
  updatedAt: string;
};
