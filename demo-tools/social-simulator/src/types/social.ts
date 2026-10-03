export type SocialPlatform = 'instagram' | 'linkedin';
export type SocialPost = { id: string; platform: SocialPlatform; authorName: string; authorHandle?: string; authorAvatar?: string; authorHeadline?: string; text: string; imageUrl?: string; createdAt: string; likes?: number; comments?: number; reposts?: number; verified?: boolean };
