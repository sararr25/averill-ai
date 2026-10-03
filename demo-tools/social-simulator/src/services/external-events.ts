import type { SocialPost } from '../types/social';
export function notifyExternalSystem(post: SocialPost): void {
  window.dispatchEvent(new CustomEvent('demo-social-post-created', { detail: { platform: post.platform, post } }));
  console.info('[Demo Social Simulator] Post created', { platform: post.platform, id: post.id });
}
