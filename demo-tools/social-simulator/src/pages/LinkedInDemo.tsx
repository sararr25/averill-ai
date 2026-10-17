import { useState } from 'react';
import { Home, Users, BriefcaseBusiness, MessageSquare, Bell, Grid3X3, Search, ImagePlus, MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send, ChevronDown, Hash, ExternalLink, Plus, Globe, Building2, MapPin } from 'lucide-react';
import { CreateDialog } from '../components/shared/CreateDialog';
import { DemoEnvironmentBadge, PlatformSwitcher } from '../components/shared/DemoControls';
import { getPosts, VAMO_HEADLINE } from '../services/social-posts';
import type { SocialPost } from '../types/social';

const AVATAR = '/vamo/avatar.svg';
const nav = [{label:'Home',icon:Home},{label:'My Network',icon:Users},{label:'Jobs',icon:BriefcaseBusiness},{label:'Messaging',icon:MessageSquare},{label:'Notifications',icon:Bell}];
const tabs = ['Home','About','Posts','Jobs','People'];

function LinkedInPost({ post }: { post: SocialPost }) {
  const [liked,setLiked] = useState(false);
  const [expanded,setExpanded] = useState(false);
  const long = post.text.length > 320;
  return <article className="li-card li-post"><header><img className="li-avatar" src={AVATAR} alt=""/><div><strong>Vamo</strong><small>{VAMO_HEADLINE}</small><small>{new Date(post.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · <Globe size={11}/></small></div><button aria-label="More options" disabled title="Outside the local demo"><MoreHorizontal size={22}/></button></header><p className={long && !expanded ? 'li-text clamped' : 'li-text'}>{post.text}</p>{long && !expanded && <button className="li-see-more" onClick={() => setExpanded(true)}>…see more</button>}{post.imageUrl && <img className="li-post-image" src={post.imageUrl} alt={post.text.split('\n')[0]}/>}<div className="li-actions"><button onClick={() => setLiked(!liked)} aria-pressed={liked} className={liked ? 'liked' : ''}><ThumbsUp size={20}/>{liked?'Liked':'Like'}</button><span><MessageCircle size={20}/>Comment</span><span><Repeat2 size={20}/>Repost</span><span><Send size={20}/>Send</span></div></article>;
}

export function LinkedInDemo() {
  const [open,setOpen] = useState(false);
  const [posts,setPosts] = useState(() => getPosts('linkedin'));
  const [toast,setToast] = useState(false);
  function published(post: SocialPost) { setPosts(current => [post,...current]); setToast(true); window.setTimeout(() => setToast(false),3500); }
  return <div className="linkedin vamo-li">
    <header className="li-navbar"><div className="li-navbar-inner"><a className="li-logo" href="/" aria-label="Demo Social Simulator">in</a><div className="li-search"><Search size={17}/><input placeholder="Search" aria-label="Search" disabled title="Outside the local demo"/></div><nav>{nav.map(({label,icon:Icon}) => <button key={label} disabled title="Outside the local demo"><Icon size={23}/><span>{label}</span></button>)}<button disabled><img src={AVATAR} alt=""/><span>Me <ChevronDown size={12}/></span></button><button className="li-business" disabled><Grid3X3 size={22}/><span>For Business <ChevronDown size={12}/></span></button></nav></div></header>
    <div className="li-company">
      <main className="li-center">
        <section className="li-card li-company-head">
          <div className="li-company-cover"/>
          <div className="li-company-body">
            <img className="li-company-logo" src={AVATAR} alt="Vamo logo"/>
            <h1>Vamo</h1>
            <p className="li-company-tagline">{VAMO_HEADLINE}</p>
            <p className="li-company-meta">Travel Arrangements · Copenhagen, Capital Region of Denmark · 1,247 followers · 2–10 employees</p>
            <div className="li-company-actions"><button className="li-follow" disabled title="Outside the local demo"><Plus size={16}/> Follow</button><button className="li-outline" disabled title="Outside the local demo">Visit website <ExternalLink size={14}/></button><button className="li-outline" disabled title="Outside the local demo">Message</button></div>
          </div>
          <nav className="li-company-tabs" aria-label="Company page sections">{tabs.map(tab => <button key={tab} className={tab === 'Posts' ? 'active' : ''} disabled={tab !== 'Posts'} title={tab === 'Posts' ? undefined : 'Outside the local demo'}>{tab}</button>)}</nav>
        </section>
        <section className="li-card li-composer"><div><img className="li-avatar" src={AVATAR} alt=""/><button className="li-start" onClick={() => setOpen(true)}>Start a post as Vamo</button></div><nav><button onClick={() => setOpen(true)}><ImagePlus color="#0a66c2"/>Media</button></nav></section>
        <div className="li-sort">Page posts <strong>Recent <ChevronDown size={14}/></strong></div>
        {posts.map(p => <LinkedInPost key={p.id} post={p}/>)}
      </main>
      <aside className="li-right">
        <div className="li-card li-about">
          <h2>About</h2>
          <p>Vamo plans small-group city breaks for curious travellers who care as much about who they travel with as where they go. Our winter collection covers Copenhagen, Vienna and Prague — each city walked, mapped and rewritten by the team that plans it.</p>
          <dl><div><dt><Globe size={15}/> Website</dt><dd>vamo.example</dd></div><div><dt><Building2 size={15}/> Industry</dt><dd>Travel Arrangements</dd></div><div><dt><Users size={15}/> Company size</dt><dd>2–10 employees</dd></div><div><dt><MapPin size={15}/> Headquarters</dt><dd>Copenhagen, Denmark</dd></div><div><dt><Hash size={15}/> Specialties</dt><dd>City breaks, small-group travel, trip planning</dd></div></dl>
        </div>
        <div className="li-foot">About · Accessibility · Help Center<br/>Privacy &amp; Terms<br/><span>Demo Social Simulator © 2026</span></div>
      </aside>
    </div>
    <DemoEnvironmentBadge/><PlatformSwitcher/><CreateDialog platform="linkedin" open={open} onOpenChange={setOpen} onPublished={published}/>{toast && <div className="toast" role="status">Post saved in demo environment</div>}
    <div className="li-mobile-nav"><button disabled aria-label="Home"><Home/></button><button disabled aria-label="Network"><Users/></button><button onClick={() => setOpen(true)} aria-label="Start a post"><Plus/></button><button disabled aria-label="Notifications"><Bell/></button><button disabled><img src={AVATAR} alt="Vamo"/></button></div>
  </div>;
}
