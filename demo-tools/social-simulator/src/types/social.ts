export type SocialPlatform = 'instagram' | 'linkedin';
export type SocialComment = { author: string; text: string };
export type SocialPost = { id: string; platform: SocialPlatform; authorName: string; authorHandle?: string; authorAvatar?: string; authorHeadline?: string; text: string; imageUrl?: string; createdAt: string; likes?: number; comments?: number; reposts?: number; verified?: boolean; topComments?: SocialComment[]; status?: 'draft'; scheduledFor?: string; paidPartner?: string; draftNote?: string };
