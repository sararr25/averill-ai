import { Home, ContactRound, Send, Workflow, ArrowLeftRight, MessagesSquare, ShoppingBag, ChevronDown, Mail, MessageSquare, Smartphone, LayoutDashboard } from 'lucide-react';
type Section = 'home' | 'campaigns';
type Props = { section: Section; onSectionChange: (section: Section) => void };
export function BrevoSidebar({ section, onSectionChange }: Props) {
  return <aside className="br-sidebar"><div className="br-brand">Brevo <span>Demo</span></div><nav aria-label="Brevo navigation">
    <button className={section === 'home' ? 'br-nav-active' : ''} onClick={() => onSectionChange('home')}><Home size={18}/>Home</button>
    <button disabled title="Outside this local email demo"><ContactRound size={18}/>CRM</button>
    <button className={section === 'campaigns' ? 'br-nav-active' : ''} onClick={() => onSectionChange('campaigns')}><Send size={18}/>Marketing <ChevronDown className="br-nav-caret" size={14}/></button>
    {section === 'campaigns' && <div className="br-subnav"><button className="br-subnav-heading"><LayoutDashboard size={16}/>Campaigns</button><button className="br-subnav-current"><Mail size={15}/>Email</button><button disabled title="Outside this local email demo"><MessageSquare size={15}/>SMS</button><button disabled title="Outside this local email demo"><Smartphone size={15}/>WhatsApp</button></div>}
    <button disabled title="Outside this local email demo"><Workflow size={18}/>Automations</button><button disabled title="Outside this local email demo"><ArrowLeftRight size={18}/>Transactional</button><button disabled title="Outside this local email demo"><MessagesSquare size={18}/>Conversations</button><button disabled title="Outside this local email demo"><ShoppingBag size={18}/>Commerce</button>
  </nav><div className="br-sidebar-foot">Demo workspace<br/><strong>Vamo</strong></div></aside>;
}
