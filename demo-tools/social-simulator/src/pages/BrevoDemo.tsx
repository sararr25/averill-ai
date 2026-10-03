import { useState } from 'react';
import { BrevoSidebar } from '../components/brevo/BrevoSidebar';
import { BrevoTopbar } from '../components/brevo/BrevoTopbar';
import { BrevoCampaignList } from '../components/brevo/BrevoCampaignList';
import { BrevoCampaignSetup } from '../components/brevo/BrevoCampaignSetup';
import { BrevoCreateDialog } from '../components/brevo/BrevoCreateDialog';
import { BrevoHome } from '../components/brevo/BrevoHome';
import { DemoEnvironmentBadge, PlatformSwitcher } from '../components/shared/DemoControls';
import { getBrevoCampaigns } from '../services/brevo-campaigns';
import type { BrevoCampaign } from '../types/brevo';
export function BrevoDemo() {
  const [section,setSection] = useState<'home'|'campaigns'>('campaigns');
  const [campaigns,setCampaigns] = useState(() => getBrevoCampaigns());
  const [selected,setSelected] = useState<BrevoCampaign | null>(null);
  const [createOpen,setCreateOpen] = useState(false);
  const [toast,setToast] = useState('');
  function showToast(message: string) { setToast(message); window.setTimeout(() => setToast(''),3500); }
  function updateCampaign(next: BrevoCampaign) { setSelected(next); setCampaigns(current => current.map(item => item.id === next.id ? next : item)); }
  function created(campaign: BrevoCampaign) { setCampaigns(current => [campaign,...current]); setSelected(campaign); setSection('campaigns'); showToast('Campaign created in demo environment'); }
  function select(campaign: BrevoCampaign) { setSelected(campaign); setSection('campaigns'); }
  function changeSection(next: 'home'|'campaigns') { setSection(next); setSelected(null); }
  return <div className="brevo"><BrevoSidebar section={section} onSectionChange={changeSection}/><div className="br-shell"><BrevoTopbar/>{selected ? <BrevoCampaignSetup key={selected.id} campaign={selected} onChange={updateCampaign} onBack={() => setSelected(null)} onToast={showToast}/> : section === 'home' ? <BrevoHome campaigns={campaigns} onCampaigns={() => setSection('campaigns')} onCreate={() => setCreateOpen(true)} onSelect={select}/> : <BrevoCampaignList campaigns={campaigns} onCreate={() => setCreateOpen(true)} onSelect={select}/>}</div><DemoEnvironmentBadge/><PlatformSwitcher/><BrevoCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={created}/>{toast && <div className="toast" role="status">{toast}</div>}</div>;
}
