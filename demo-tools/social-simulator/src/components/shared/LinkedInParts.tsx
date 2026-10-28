import { useState } from 'react';
// Shared LinkedIn pieces: the "…see more" cut and the link preview card (image, title, domain).
const URL_PATTERN = /https?:\/\/[^\s]+/;
// A half-typed address is not a link yet, so it gets no card.
export function firstUrl(text: string): string | undefined {
  const found = text.match(URL_PATTERN)?.[0].replace(/[.,)]+$/, '');
  return found && URL.canParse(found) ? found : undefined;
}
// LinkedIn shows about three lines (roughly 210 characters) of a post before "…see more".
export function cutText(text: string): string | null {
  const head = text.split('\n').slice(0, 3).join('\n');
  const cut = head.length > 210 ? head.slice(0, 210).replace(/\s+\S*$/, '') : head;
  return cut.length < text.trim().length ? cut.trimEnd() : null;
}
// The Vamo site page titles, shown the way a link preview shows them.
function linkTitle(url: URL): string { return url.pathname.endsWith('/winter.html') ? 'Winter escapes · Vamo' : 'Vamo | Go somewhere good.'; }
export function LinkPreviewCard({ url, imageUrl }: { url: string; imageUrl?: string }) {
  const parsed = new URL(url);
  return <a className="li-linkcard" href={parsed.href} target="_blank" rel="noreferrer">{imageUrl && <img src={imageUrl} alt=""/>}<span><strong>{linkTitle(parsed)}</strong><small>{parsed.hostname}</small></span></a>;
}
export function LinkedInText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const cut = cutText(text);
  return <p className="li-text">{cut && !expanded ? <>{cut}<button className="li-see-more" onClick={() => setExpanded(true)}>…see more</button></> : text}</p>;
}
