import * as Dialog from '@radix-ui/react-dialog';
import { Mail, X } from 'lucide-react';
import { useState } from 'react';
import { saveBrevoCampaign } from '../../services/brevo-campaigns';
import type { BrevoCampaign } from '../../types/brevo';
type Props = { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (campaign: BrevoCampaign) => void };
export function BrevoCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [folder,setFolder] = useState('All campaigns'); const [name,setName] = useState(''); const [step,setStep] = useState<'type'|'name'>('type'); const [error,setError] = useState('');
  function close(openState: boolean) { onOpenChange(openState); if (!openState) { setStep('type'); setName(''); setFolder('All campaigns'); setError(''); } }
  function create() {
    if (!name.trim()) { setError('Give this campaign a name.'); return; }
    const now = new Date().toISOString();
    const campaign: BrevoCampaign = { id: crypto.randomUUID(), name: name.trim(), status:'Draft', folder, senderName:'Vamo', senderEmail:'hello@vamo.example', recipients:'', subject:'', previewText:'', body:'', createdAt:now, updatedAt:now };
    try { saveBrevoCampaign(campaign); onCreated(campaign); close(false); } catch { setError('Unable to save this campaign.'); }
  }
  return <Dialog.Root open={open} onOpenChange={close}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="br-create-dialog" aria-describedby={undefined}><div className="br-dialog-head"><Dialog.Title>{step === 'type' ? 'Create a campaign' : 'Create an email campaign'}</Dialog.Title><Dialog.Close aria-label="Close"><X size={20}/></Dialog.Close></div>{step === 'type' ? <div className="br-type-list"><p>Choose a channel</p><button onClick={() => setStep('name')}><span><Mail size={23}/></span><span><strong>Email</strong><small>Design an email campaign for your contacts</small></span><span className="br-type-arrow">›</span></button><div className="br-type-muted">SMS <span>Demo setup available for Email</span></div><div className="br-type-muted">WhatsApp <span>Demo setup available for Email</span></div></div> : <div className="br-name-form"><p><strong>Regular email</strong> · A/B testing is outside this demo.</p><p>Give your campaign a name to find it in your list. Only you can see this name.</p><label htmlFor="br-campaign-name">Campaign name</label><input id="br-campaign-name" autoFocus maxLength={120} placeholder="e.g. Winter Escapes 2027" value={name} onChange={event => {setName(event.target.value);setError('');}} onKeyDown={event => {if (event.key === 'Enter') create();}}/><label htmlFor="br-folder">Folder <span>(optional)</span></label><select id="br-folder" value={folder} onChange={e => setFolder(e.target.value)}><option>All campaigns</option><option>Newsletters</option></select>{error && <p className="br-form-error" role="alert">{error}</p>}<div className="br-dialog-actions"><button className="br-outline-button" onClick={() => setStep('type')}>Back</button><button className="br-dark-button" onClick={create}>Create campaign</button></div></div>}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
