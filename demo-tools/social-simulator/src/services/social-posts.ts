import type { SocialPlatform, SocialPost } from '../types/social';
import { notifyExternalSystem } from './external-events';
import flawedDrafts from '../data/flawed-drafts.json';

const KEY = 'demo-social-simulator:vamo-posts:v1';
const mark = '/vamo/avatar.svg';
const image = (name: string) => `/vamo/${name}`;
const card = (name: string) => `/vamo/posts/${name}.svg`;
export const avatar = (_name: string) => mark;
export const VAMO_HEADLINE = 'Go somewhere good. Trips for young travellers who collect people, not things.';

const ig = (id: string, imageUrl: string, createdAt: string, text: string): SocialPost => ({ id, platform: 'instagram', authorName: 'vamo.travel', authorAvatar: mark, text, imageUrl, createdAt });
const li = (id: string, imageUrl: string, createdAt: string, text: string): SocialPost => ({ id, platform: 'linkedin', authorName: 'Vamo', authorHeadline: VAMO_HEADLINE, authorAvatar: mark, text, imageUrl, createdAt });

// Seeded Vamo content in the voice of the Vamo website (travel-site/): young, social, unpolished, never luxury.
// Captions avoid price, availability and partnership claims so they never pre-empt the Winter Escapes 2027
// launch items (email 15 Oct, LinkedIn 16 Oct, Reel 17 Oct) that Averill reviews.
const publishedPosts: SocialPost[] = [
  ig('vamo-ig-good-people', card('good-people'), '2026-10-13T17:00:00Z', 'came for the city. left with a group chat. 📱✳\n\nhonestly the best souvenir. tag the person you met on a trip and still text 👇\n\n#vamotravel #collectpeoplenotthings #travelfriends #solotravel'),
  ig('vamo-ig-copenhagen', card('copenhagen-story'), '2026-10-10T16:30:00Z', 'canal days. good company. 🚲\n\ncopenhagen in winter = harbour bus at golden hour, a bakery stop every 400 metres, and someone always suggesting “one more bar”.\n\nsave for your next long weekend 📌\n📷 heino eisner / unsplash\n\n#copenhagen #københavn #citybreak #vamotravel'),
  ig('vamo-ig-carry-on', card('carry-on'), '2026-10-07T12:00:00Z', 'one backpack. three cities. zero checked bags. 🎒\n\nlayers over one big coat, shoes you can walk in all day, a tote for the market, and a power bank, always.\n\nwhat’s the one thing you never travel without? 👀\n\n#packlight #backpacking #carryononly #vamotravel'),
  ig('vamo-ig-vienna', card('vienna-story'), '2026-10-03T15:00:00Z', 'coffee first. plans later. ☕️\n\nvienna rule: never rush a café. order the second one, people-watch, let the afternoon decide itself.\n\n📷 denisa lesniaková / pexels\n\n#vienna #wien #cafeculture #slowtravel #vamotravel'),
  ig('vamo-ig-unplanned', card('unplanned'), '2026-09-30T11:00:00Z', 'leave a little unplanned. 4 ideas for trips that feel like yours ↓\n\n1 book the first night. wing the rest.\n2 say yes to the hostel quiz night.\n3 walk until you’re slightly lost.\n4 keep one evening free for new friends.\n\nwhich one are you trying first?\n\n#traveltips #digitalnomad #backpacker #vamotravel'),
  ig('vamo-ig-prague', card('prague-story'), '2026-09-26T16:00:00Z', 'get a little lost. 🗺️\n\nprague’s side streets > the main square. cross the bridge early, then follow whatever looks interesting.\n\n📷 helena jankovičová kováčová / pexels\n\n#prague #praha #citywalks #vamotravel'),
  ig('vamo-ig-manifesto', card('manifesto'), '2026-09-21T12:00:00Z', 'go for the place. stay for the people. ✳\n\nthat’s the whole vamo thing. plans with space for a surprise: a side street, a table that gets louder as the night goes on, a story you’ll keep telling.\n\n#thevamoway #travelquotes #vamotravel'),
  ig('vamo-ig-ferry', image('vamo-friends-ferry.png'), '2026-09-16T17:30:00Z', 'slower days. brighter you. ☀️\n\nsame places, different perspectives, and the people who make the ferry ride the best part of the trip.\n\n#bettertogether #islandhopping #travelwithfriends #vamotravel'),
  ig('vamo-ig-long-way', card('long-way'), '2026-09-12T10:00:00Z', 'hi, we’re vamo 👋\n\ntrips for people who’d rather collect stories than souvenirs. city breaks, friends of friends, and taking the long way to a good story.\n\nfollow along, new places soon ✳\n\n#vamotravel #newaccount #collectpeoplenotthings'),
  li('vamo-li-trip-brief', card('li-trip-brief'), '2026-10-09T08:30:00Z', 'From a wish list to a real trip: how we plan at Vamo.\n\nMost of our travellers are in their twenties, travelling with friends or on their own, often fitting a trip around work or study. So every trip starts with a brief, not a checkout: the city, the dates, who’s coming and what they actually want to do.\n\nAnything we haven’t confirmed yet is marked as exactly that. Only after someone on our Operations team has checked availability and conditions with our partners do we confirm anything together.\n\nLess “add to cart”. More “okay, where to next?”\n\n#traveltech #operations #youthtravel'),
  li('vamo-li-hiring', card('li-hiring'), '2026-10-06T07:45:00Z', 'We’re hiring: Operations coordinator, Copenhagen ✳\n\nJoin Noah and the Operations crew and turn travellers’ wish lists into trips they’ll keep telling stories about.\n\nYou might be a fit if you:\n• have backpacked, interrailed or lived somewhere new, and loved figuring it out\n• like a good checklist as much as a good conversation\n• write clearly in English (Danish is a plus)\n\nFull-time, hybrid from our Copenhagen studio. Know someone who should be here? Tag them 👇\n\n#hiring #copenhagenjobs #traveljobs'),
  li('vamo-li-crew', card('li-crew'), '2026-09-30T08:00:00Z', 'Small crew. Big group chats.\n\nWe’re a small team in Copenhagen, and every Vamo city is walked, tested and rewritten by the people who plan it: from the café we’d send a friend to, to the hostel with the best common room.\n\nOur rule for this winter in Copenhagen, Vienna and Prague: if we wouldn’t tell our own friends about it, it doesn’t go in.\n\n#teamculture #youthtravel #startuplife'),
  li('vamo-li-why', card('good-people'), '2026-09-22T08:00:00Z', 'Why we started Vamo.\n\nAsk anyone under 30 about their best trip and they rarely start with the sights. They start with who they met. That’s the gap we care about: travel that leaves room for people.\n\nSo we plan city breaks with open time built in, and we design for travellers going solo, with a friend, or with a whole group chat.\n\nCollect people, not things.\n\n#travel #genz #founderstory'),
  li('vamo-li-intro', image('vamo-friends-ferry.png'), '2026-09-12T08:00:00Z', 'Hello LinkedIn 👋 We’re Vamo.\n\nWe plan trips for young travellers who’d rather collect stories than souvenirs: city breaks, friends of friends, and taking the long way to a good story.\n\nFollow along for city notes, how we work, and what we’re building next.\n\n#travel #startup #citybreaks'),
];

const c = (author: string, text: string) => ({ author, text });
// Fictional engagement so the feeds read like an active page. Commenters are invented handles, not real people.
const engagement: Record<string, Partial<SocialPost>> = {
  'vamo-ig-good-people': { likes: 412, comments: 38, topComments: [c('liv.rejser', '@jonas_kbh this is literally us after lisbon 😂'), c('marta.goes', 'met my best friend on a hostel walking tour, still texting 4 years later')] },
  'vamo-ig-copenhagen': { likes: 287, comments: 19, topComments: [c('andreasbikes', 'harbour bus at golden hour is so underrated'), c('noemi.travels', 'saving this for december ✨')] },
  'vamo-ig-carry-on': { likes: 198, comments: 44, topComments: [c('backpack.bea', 'earplugs. always earplugs.'), c('tomasz.on.trains', 'a tote bag saved my life in prague markets')] },
  'vamo-ig-vienna': { likes: 341, comments: 22, topComments: [c('sofie.wien', 'second coffee is mandatory, correct'), c('kasper_k', 'which café is this??')] },
  'vamo-ig-unplanned': { likes: 156, comments: 27, topComments: [c('ida.on.tour', 'number 4 is how I ended up in a karaoke bar in vienna')] },
  'vamo-ig-prague': { likes: 233, comments: 15, topComments: [c('pavla.praha', 'locals approve the side streets advice 👌')] },
  'vamo-ig-manifesto': { likes: 129, comments: 9 },
  'vamo-ig-ferry': { likes: 305, comments: 21, topComments: [c('emil.sails', 'the ferry is always the best part')] },
  'vamo-ig-long-way': { likes: 88, comments: 12 },
  'vamo-li-trip-brief': { likes: 64, comments: 7, reposts: 3, topComments: [c('Freja Holm · Product designer', 'Love that unconfirmed items are labelled as unconfirmed. More travel companies should do this.')] },
  'vamo-li-hiring': { likes: 112, comments: 18, reposts: 14, topComments: [c('Jakob Andersen · Student at CBS', 'Shared with my interrail group chat 🙌'), c('Lea Nørgaard · Operations at a hostel group', 'Applied! The checklist line is very me.')] },
  'vamo-li-crew': { likes: 57, comments: 4, reposts: 2 },
  'vamo-li-why': { likes: 143, comments: 21, reposts: 9, topComments: [c('Mikkel Sørensen · Founder, small travel podcast', '“They start with who they met”. So true.')] },
  'vamo-li-intro': { likes: 96, comments: 11, reposts: 5 },
};

// Unpublished drafts for the Winter Escapes 2027 launch. They are intentionally flawed so Averill can review them
// against the approved Marketing sources; the expected findings are listed in the flaw matrix (ticket JD-06).
export const draftPosts = flawedDrafts.social as SocialPost[];
export const seedPosts: SocialPost[] = publishedPosts.map(post => ({ ...post, ...engagement[post.id] }));

function storedPosts(): SocialPost[] { try { const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(parsed) ? parsed.filter((p): p is SocialPost => !!p && typeof p === 'object' && typeof p.id === 'string' && (p.platform === 'instagram' || p.platform === 'linkedin')) : []; } catch { return []; } }
export function getDrafts(platform: SocialPlatform): SocialPost[] { return draftPosts.filter(p => p.platform === platform); }
export function getPosts(platform: SocialPlatform): SocialPost[] { return [...storedPosts().filter(p => p.platform === platform), ...seedPosts.filter(p => p.platform === platform)]; }
export function createPost(post: SocialPost): SocialPost { localStorage.setItem(KEY, JSON.stringify([post, ...storedPosts()])); notifyExternalSystem(post); return post; }
export function imageFileToDataUrl(file: File): Promise<string> { return new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Image could not be read')); reader.readAsDataURL(file); }); }
