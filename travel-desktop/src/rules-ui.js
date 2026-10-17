// AV-12: company rules in Knowledge. Proposals from Nemotron wait for a lead/admin decision; approved rules guide Review.
let rulesRenderKey = null;
const ruleKindLabels = { 'claim-forbidden': 'Forbidden claim', 'claim-approved': 'Approved claim', audience: 'Audience', date: 'Date', time: 'Time', asset: 'Asset', disclosure: 'Disclosure', 'required-text': 'Required text', procedure: 'Procedure' };

function ruleCard(rule, { canDecide }) {
  const card = node('article', undefined, 'knowledge-card rule-card');
  card.dataset.state = rule.status;
  card.append(node('strong', `${ruleKindLabels[rule.kind] || rule.kind} · ${rule.task === 'any' ? 'every channel' : rule.task}`, 'knowledge-state'));
  card.append(node('p', rule.value, 'rule-value'));
  const quote = node('blockquote', rule.quote, 'rule-quote');
  card.append(quote, node('p', `${rule.sourceTitle || 'Source'} · v${rule.sourceVersion}${rule.line ? ` · line ${rule.line}` : ''} · ${rule.proposedBy === 'model' ? (rule.status === 'approved' ? 'Extracted by Nemotron, approved' : 'Proposed by Nemotron') : 'Written in the approved source'}`, 'knowledge-meta'));
  if (canDecide) {
    const form = node('div', undefined, 'knowledge-approval');
    const valueLabel = node('label', 'Value'); const value = node('input'); value.type = 'text'; value.maxLength = 200; value.value = rule.value; valueLabel.append(value);
    const reasonLabel = node('label', 'Reason (required to reject)'); const reason = node('input'); reason.type = 'text'; reason.maxLength = 300; reasonLabel.append(reason);
    const status = node('p', '', 'knowledge-meta'); status.setAttribute('aria-live', 'polite');
    const decide = (action) => async (event) => {
      if (action === 'rejected' && !reason.value.trim()) { reason.focus(); status.textContent = 'Add a reason before rejecting.'; return; }
      event.currentTarget.disabled = true;
      try { await window.desktop.decideRule(rule.id, action, value.value !== rule.value ? value.value : null, reason.value); rulesRenderKey = null; await renderRules(); }
      catch (error) { status.textContent = error.message; event.currentTarget.disabled = false; }
    };
    const approve = node('button', 'Approve rule', 'secondary-button'); approve.type = 'button'; approve.addEventListener('click', decide('approved'));
    const reject = node('button', 'Reject', 'secondary-button'); reject.type = 'button'; reject.addEventListener('click', decide('rejected'));
    form.append(valueLabel, reasonLabel, approve, reject, status); card.append(form);
  }
  return card;
}

async function extractRulesFor(source, status) {
  const ok = await confirmOutbound({ service: 'Nebius', title: `Extract rules from ${source.title}`, note: 'The extracted text of this approved source is sent to NVIDIA Nemotron on Nebius Token Factory. Rules come back as proposals; each quote is checked against the source and nothing applies until you approve it.', items: [`${source.title} · v${source.version} (extracted text)`] });
  if (!ok?.length) return;
  status.textContent = 'Nemotron is reading the source…';
  try { const result = await window.desktop.extractRules(source.id, true); status.textContent = `${result.added} new rule proposals${result.rejected ? ` · ${result.rejected} discarded because their quote was not in the source` : ''}.`; rulesRenderKey = null; await renderRules(); }
  catch (error) { status.textContent = error.message; }
}

async function renderRules() {
  const host = el('rules-panel');
  if (!host) return;
  if (!current.workspace?.configured || current.auth?.enabled && !current.auth.signedIn) { host.replaceChildren(); rulesRenderKey = null; return; }
  const me = current.workspace.people.find(person => person.id === current.workspace.activePersonId);
  const key = JSON.stringify([me?.id, current.workspace.sources, current.privacy?.companyAI, current.services?.nebius]);
  if (key === rulesRenderKey) return;
  rulesRenderKey = key;
  let data;
  try { data = await window.desktop.listRules(); } catch (error) { host.replaceChildren(node('p', `Could not load rules: ${error.message}`)); return; }
  const canDecide = me && ['admin', 'lead'].includes(me.role);
  const section = node('details', undefined, 'knowledge-details rules-section');
  section.open = Boolean(data.pending.length || data.conflicts.length);
  section.append(node('summary', `Company rules · ${data.active.length} in use${data.pending.length ? ` · ${data.pending.length} to review` : ''}${data.conflicts.length ? ` · ${data.conflicts.length} possible conflicts` : ''}`));
  section.append(node('p', 'Review checks shared work against these rules. Each one quotes an approved source.', 'section-note'));
  const status = node('p', '', 'knowledge-meta'); status.setAttribute('aria-live', 'polite');
  if (canDecide && current.privacy?.companyAI && current.services?.nebius) {
    const sources = current.workspace.sources.filter(source => source.status === 'approved' && source.aiAllowed && (me.role === 'admin' || source.scope !== 'company' && source.department === me.department));
    if (sources.length) {
      const label = node('label', 'Extract rules with NVIDIA Nemotron'); const select = node('select');
      for (const source of sources) select.append(new Option(`${source.title} · v${source.version}`, source.id));
      label.append(select);
      const run = node('button', 'Extract rules', 'secondary-button'); run.type = 'button';
      run.addEventListener('click', async () => { run.disabled = true; await extractRulesFor(sources.find(source => source.id === select.value), status); run.disabled = false; });
      section.append(label, run);
    }
  }
  section.append(status);
  if (data.conflicts.length) {
    section.append(node('h3', 'Possible conflicts between sources'));
    for (const conflict of data.conflicts) {
      const card = node('article', undefined, 'knowledge-card rule-card'); card.dataset.state = 'conflict';
      card.append(node('strong', `${ruleKindLabels[conflict.kind] || 'Claim'} · ${conflict.task}`, 'knowledge-state'));
      for (const rule of conflict.rules) card.append(node('blockquote', `${rule.value} — ${rule.sourceTitle} v${rule.sourceVersion}${rule.line ? `, line ${rule.line}` : ''}`, 'rule-quote'));
      card.append(node('p', 'Neither source is excluded automatically. Resolve it by approving the right source version or rejecting one rule.', 'knowledge-meta'));
      section.append(card);
    }
  }
  if (data.pending.length) { section.append(node('h3', 'Proposed by Nemotron · waiting for your decision')); for (const rule of data.pending) section.append(ruleCard(rule, { canDecide })); }
  if (data.active.length) {
    const list = node('details', undefined, 'knowledge-details'); list.append(node('summary', `Rules in use · ${data.active.length}`));
    for (const rule of data.active) list.append(ruleCard(rule, { canDecide: false }));
    section.append(list);
  }
  host.replaceChildren(section);
}
