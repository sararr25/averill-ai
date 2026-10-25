import { BREVO_FOOTER } from '../../services/brevo-campaigns';
import type { BrevoCampaign } from '../../types/brevo';
// Fictional company address for the footer. Not a real location.
const COMPANY_ADDRESS = 'Vamo ApS, Example Street 1, 1000 Copenhagen, Denmark';
const noNavigation = (event: { preventDefault: () => void }) => event.preventDefault();
type Props = { campaign: BrevoCampaign };
// Renders a campaign like a real marketing email: inbox header, logo, hero, headline, sections, one CTA, sign-off, footer.
export function BrevoEmailPreview({ campaign }: Props) {
  const structured = !!campaign.sections?.length;
  const paragraphs = campaign.body.split(/\n{2,}/).filter(block => block.trim() && block.trim() !== BREVO_FOOTER);
  const hasFooter = campaign.body.includes(BREVO_FOOTER);
  const headline = campaign.headline || campaign.subject || campaign.name;
  return <>
    <div className="br-inbox-header">
      <div className="br-inbox-avatar" aria-hidden="true">V</div>
      <div className="br-inbox-lines">
        <strong>{campaign.subject || 'No subject yet'}</strong>
        <span>{campaign.previewText || 'No preview text'}</span>
        <small>From: <b>{campaign.senderName}</b> &lt;{campaign.senderEmail}&gt;</small>
        <small>To: {campaign.recipients || 'No recipients selected'}</small>
      </div>
    </div>
    <div className="br-email-render vamo-email">
      <div className="br-email-brand"><span className="vamo-wordmark">VAMO<i>✳</i></span><small>View in browser</small></div>
      <div className="vamo-email-ticker">GOOD PEOPLE, BRIGHTER PLACES ✳ GOOD PEOPLE, BRIGHTER PLACES</div>
      {campaign.imageUrl && <img className="vamo-email-hero" src={campaign.imageUrl} alt="Campaign visual"/>}
      <h2>{headline}</h2>
      {structured ? <>
        {campaign.intro && campaign.intro.split(/\n{2,}/).map((block,index) => <p key={index}>{block}</p>)}
        {campaign.sections!.map(section => <div className="vamo-email-section" key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></div>)}
      </> : paragraphs.length ? paragraphs.map((block,index) => <p key={index}>{block}</p>) : <p>Your email content will appear here.</p>}
      {campaign.cta && <p className="vamo-email-cta"><a href={campaign.cta.url} onClick={noNavigation}>{campaign.cta.label}</a></p>}
      {structured && campaign.signOff && campaign.signOff.split(/\n{2,}/).map((block,index) => <p className="vamo-email-signoff" key={index}>{block}</p>)}
      <div className="vamo-email-sign"><span className="vamo-wordmark small">VAMO<i>✳</i></span>Go somewhere good · Copenhagen · vamo.example</div>
      {hasFooter && <footer className="vamo-email-footer">
        <p>{COMPANY_ADDRESS}</p>
        <p><strong>Why you get this email:</strong> {BREVO_FOOTER}</p>
        <p><a href="#unsubscribe" onClick={noNavigation}>Unsubscribe</a> · <a href="#preferences" onClick={noNavigation}>Manage preferences</a></p>
      </footer>}
    </div>
  </>;
}
