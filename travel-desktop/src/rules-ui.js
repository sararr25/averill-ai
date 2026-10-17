// AV-12: company rules in Knowledge. Proposals from Nemotron wait for a lead/admin decision; approved rules guide Review.
let rulesRenderKey = null;
const ruleKindLabels = { 'claim-forbidden': 'Forbidden claim', 'claim-approved': 'Approved claim', audience: 'Audience', date: 'Date', time: 'Time', asset: 'Asset', disclosure: 'Disclosure', 'required-text': 'Required text', procedure: 'Procedure' };

const freshnessLabels = { 'still-consistent': 'Still in line with public sources', 'may-be-outdated': 'May be outdated', unclear: 'Public sources unclear' };

function dependencyBlock(rule, freshness, canMark) {
  const box = node('div', undefined, 'rule-dependency');
  const entry = freshness?.dependencies.find(item => item.sourceId === rule.sourceId && item.quote === rule.quote);
  if (entry) {
    box.append(node('p', `Depends on a public rule: “${entry.query}”${entry.domains.length ? ` · ${entry.domains.join(', ')}` : ''}`, 'knowledge-meta'));
    if (entry.lastCheck) {
      const check = node('p', `${freshnessLabels[entry.lastCheck.verdict]} · checked against public sources on ${new Date(entry.lastCheck.at).toLocaleString()}${entry.lastCheck.explanation ? ` · ${entry.lastCheck.explanation}` : ''}`, 'knowledge-meta'); check.dataset.verdict = entry.lastCheck.verdict; box.append(check);
      if (entry.lastCheck.snippet) box.append(node('blockquote', `${entry.lastCheck.url}: “${entry.lastCheck.snippet}”`, 'rule-quote'));
    }
    if (canMark) { const remove = node('button', 'Stop checking', 'source-link'); remove.type = 'button'; remove.addEventListener('click', async () => { await window.desktop.unmarkDependency(entry.id).catch(() => {}); rulesRenderKey = null; renderRules(); }); box.append(remove); }
  } else if (canMark) {
    const details = node('details'); details.append(node('summary', 'Depends on a public rule?'));
    const form = node('form', undefined, 'workspace-form');
    const queryLabel = node('label', 'Public search (no internal details)'); const query = node('input'); query.type = 'text'; query.required = true; query.maxLength = 200; query.placeholder = 'Instagram paid partnership label requirements'; queryLabel.append(query);
    const domainLabel = node('label', 'Optional official domains, comma separated'); const domains = node('input'); domains.type = 'text'; domains.maxLength = 300; domains.placeholder = 'help.instagram.com'; domainLabel.append(domains);
    const status = node('p', '', 'knowledge-meta');
    const save = node('button', 'Save dependency', 'secondary-button'); save.type = 'submit';
    form.append(queryLabel, domainLabel, save, status);
    form.addEventListener('submit', async event => { event.preventDefault(); try { await window.desktop.markDependency({ sourceId: rule.sourceId, quote: rule.quote, query: query.value, domains: domains.value.split(',').map(item => item.trim()).filter(Boolean) }); rulesRenderKey = null; renderRules(); } catch (error) { status.textContent = error.message; } });
    details.append(form); box.append(details);
  }
  return box;
}

function ruleCard(rule, { canDecide, freshness = null, canMark = false }) {
  const card = node('article', undefined, 'knowledge-card rule-card');
  card.dataset.state = rule.status;
  card.append(node('strong', `${ruleKindLabels[rule.kind] || rule.kind} · ${rule.task === 'any' ? 'every channel' : rule.task}`, 'knowledge-state'));
  card.append(node('p', rule.value, 'rule-value'));
  const quote = node('blockquote', rule.quote, 'rule-quote');
  card.append(quote, node('p', `${rule.sourceTitle || 'Source'} · v${rule.sourceVersion}${rule.line ? ` · line ${rule.line}` : ''} · ${rule.proposedBy === 'model' ? (rule.status === 'approved' ? 'Extracted by Nemotron, approved' : 'Proposed by Nemotron') : 'Written in the approved source'}`, 'knowledge-meta'));
  if (freshness) card.append(dependencyBlock(rule, freshness, canMark));
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
  let freshness = null;
  if (canDecide) { try { freshness = await window.desktop.freshnessSnapshot(); } catch {} }
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
    const manageable = rule => me.role === 'admin' || current.workspace.sources.some(source => source.id === rule.sourceId && source.scope !== 'company' && source.department === me.department);
    for (const rule of data.active) list.append(ruleCard(rule, { canDecide: false, freshness, canMark: canDecide && manageable(rule) }));
    section.append(list);
  }
  if (freshness?.dependencies.length) {
    const fresh = node('div', undefined, 'rules-freshness');
    fresh.append(node('h3', `Public rule checks · ${freshness.dependencies.length}${freshness.queue.length ? ` · ${freshness.queue.length} may be outdated` : ''}`));
    for (const entry of freshness.queue) fresh.append(node('p', `May be outdated: ${entry.sourceTitle} — “${entry.value}”. Review the source; its approval has not changed.`, 'knowledge-meta'));
    if (me.role === 'admin') {
      const run = node('button', 'Check against public sources now', 'secondary-button'); run.type = 'button'; run.disabled = !current.services?.tavily;
      run.addEventListener('click', async () => {
        const ok = await confirmOutbound({ service: 'Tavily', title: 'Check guidance against public rules', note: 'Only these saved public searches are sent to Tavily.', items: freshness.dependencies.filter(entry => entry.current).map(entry => entry.query) });
        if (!ok?.length) return;
        run.disabled = true; status.textContent = 'Checking public sources…';
        try { await window.desktop.runFreshness(); rulesRenderKey = null; await renderRules(); } catch (error) { status.textContent = error.message; run.disabled = false; }
      });
      fresh.append(run);
    }
    section.append(fresh);
  }
  host.replaceChildren(section);
}
