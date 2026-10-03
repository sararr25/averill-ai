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
  createdAt: string;
  updatedAt: string;
};
