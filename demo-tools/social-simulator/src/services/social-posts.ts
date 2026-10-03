import type { SocialPlatform, SocialPost } from '../types/social';
import { notifyExternalSystem } from './external-events';

const KEY = 'demo-social-simulator:vamo-posts:v1';
const mark = '/vamo/mark.svg';
const image = (name: string) => `/vamo/${name}`;
export const avatar = (_name: string) => mark;

// Fictional editorial posts. No live account, partnership, or engagement data.
export const seedPosts: SocialPost[] = [
  { id: 'vamo-ig-1', platform: 'instagram', authorName: 'vamo.travel', authorAvatar: mark, text: 'Go for the place. Stay for the people. A ferry, a late sunset, and the kind of story you keep telling. ✳\n\nGreece, through our eyes. / Editorial concept', imageUrl: image('vamo-friends-ferry.png'), createdAt: '2026-09-28T16:00:00Z' },
  { id: 'vamo-ig-2', platform: 'instagram', authorName: 'vamo.travel', authorAvatar: mark, text: 'Copenhagen after the rush. Pick a canal, take the longer walk, leave room for a second stop.\n\nCity notes / Copenhagen', imageUrl: image('copenhagen.jpg'), createdAt: '2026-09-27T16:00:00Z' },
  { id: 'vamo-ig-3', platform: 'instagram', authorName: 'vamo.travel', authorAvatar: mark, text: 'One more coffee. One more street. No hurry to get to the next thing.\n\nCity notes / Vienna', imageUrl: image('vienna.jpg'), createdAt: '2026-09-26T16:00:00Z' },
  { id: 'vamo-ig-4', platform: 'instagram', authorName: 'vamo.travel', authorAvatar: mark, text: 'The scenic way is usually the good way. Cross the bridge, then see where the day goes.\n\nCity notes / Prague', imageUrl: image('prague.jpg'), createdAt: '2026-09-25T16:00:00Z' },
  { id: 'vamo-li-1', platform: 'linkedin', authorName: 'Vamo', authorHeadline: 'Fictional travel collective · Go somewhere good', authorAvatar: mark, text: 'Introducing Vamo: a travel concept built around the stories people bring home.\n\nWe start with a simple thought: the best part of a trip is often who you share it with. Our editorial demo explores Copenhagen, Vienna and Prague through small discoveries, open time and good company.\n\nThis page is part of a fictional product demonstration. The journeys and posts shown here are concepts, not bookable departures.', imageUrl: image('vamo-friends-ferry.png'), createdAt: '2026-09-28T09:00:00Z' },
  { id: 'vamo-li-2', platform: 'linkedin', authorName: 'Vamo', authorHeadline: 'Fictional travel collective · Go somewhere good', authorAvatar: mark, text: 'Our city edit starts with a little room in the plan.\n\nCopenhagen: a canal walk after sunset. Vienna: coffee before the itinerary. Prague: a detour across the bridge. Three places, three ways to make the day your own.\n\nWhich small ritual makes a city feel like yours?', imageUrl: image('copenhagen.jpg'), createdAt: '2026-09-27T09:00:00Z' },
  { id: 'vamo-li-3', platform: 'linkedin', authorName: 'Vamo', authorHeadline: 'Fictional travel collective · Go somewhere good', authorAvatar: mark, text: 'A note on how we tell travel stories.\n\nPeople and places come first. We use credited city photography and label generated concept imagery clearly. We do not present editorial previews as real customer journeys, creator partnerships or performance results.\n\nFor this demo, the invitation is simple: go somewhere good, and leave space for a story you did not plan.', imageUrl: image('vienna.jpg'), createdAt: '2026-09-26T09:00:00Z' },
];

function storedPosts(): SocialPost[] { try { const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(parsed) ? parsed.filter((p): p is SocialPost => !!p && typeof p === 'object' && typeof p.id === 'string' && (p.platform === 'instagram' || p.platform === 'linkedin')) : []; } catch { return []; } }
export function getPosts(platform: SocialPlatform): SocialPost[] { return [...storedPosts().filter(p => p.platform === platform), ...seedPosts.filter(p => p.platform === platform)]; }
export function createPost(post: SocialPost): SocialPost { localStorage.setItem(KEY, JSON.stringify([post, ...storedPosts()])); notifyExternalSystem(post); return post; }
export function imageFileToDataUrl(file: File): Promise<string> { return new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Image could not be read')); reader.readAsDataURL(file); }); }
