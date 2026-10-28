// AV-30 – AV-33: admin view of the public website compared with approved sources.
let siteRenderKey = null;
const siteActions = [['fix-site', 'Website needs fixing'], ['source-wrong', 'Approved source is wrong'], ['ignore', 'Ignore']];

function renderPublicSite() {
  const host = el('public-site-section');
  const me = current.workspace?.people?.find(person => person.id === current.workspace.activePersonId);
  const visible = Boolean(current.workspace?.configured && (!current.auth?.enabled || current.auth.signedIn) && me?.role === 'admin');
  host.hidden = !visible;
  if (!visible) { host.replaceChildren(); siteRenderKey = null; return; }
  const key = JSON.stringify([current.publicSite, current.services?.tavily, current.aiEnabled]);
  if (key === siteRenderKey) return;
  siteRenderKey = key;
  const site = current.publicSite;
  const head = node('div', undefined, 'section-head'); head.append(node('h2', 'Public website'), node('span', 'Is it still true?'));
  const note = node('p', 'Tavily reads your public website. Averill then shows where it disagrees with approved sources. Website pages are never treated as approved.', 'section-note');
  const status = node('p', '', 'knowledge-meta'); status.setAttribute('aria-live', 'polite');
  const run = async (button, action, message) => { button.disabled = true; status.textContent = message; try { current = await action(); siteRenderKey = null; render(); } catch (error) { status.textContent = error.message; button.disabled = false; } };
  const form = node('form', undefined, 'workspace-form');
  const label = node('label', 'Website address (HTTPS)'); const input = node('input'); input.type = 'url'; input.required = true; input.placeholder = 'https://www.example.com'; input.value = site?.url || ''; label.append(input);
  const save = node('button', site?.url ? 'Change website' : 'Save website', 'secondary-button'); save.type = 'submit';
  form.append(label, save);
  form.addEventListener('submit', event => { event.preventDefault(); run(save, () => window.desktop.configureSite(input.value), 'Checking the address…'); });
  host.replaceChildren(head, note, form);
  if (site?.url) {
    const read = node('button', site.crawledAt ? 'Read the website again' : 'Read the website with Tavily', 'secondary-button'); read.type = 'button'; read.disabled = !current.services?.tavily;
    read.addEventListener('click', async () => {
      const ok = await confirmOutbound({ service: 'Tavily', title: 'Read the public website', note: current.aiEnabled ? 'Tavily opens up to 30 public pages on this site. NVIDIA Nemotron then compares page text with approved rules that have Nebius consent.' : 'Tavily opens up to 30 public pages on this site. Averill compares them locally with approved rules.', items: [site.url] });
      if (ok?.length) run(read, () => window.desktop.crawlSite(), 'Reading public pages…');
    });
    host.append(read);
    if (!current.services?.tavily) host.append(node('p', 'Add a Tavily key in Workspace settings › AI and services to read the website.', 'knowledge-meta'));
    if (site.crawledAt) host.append(node('p', `${site.pages.length} pages read ${new Date(site.crawledAt).toLocaleString()}${site.comparedAt ? ` · compared ${new Date(site.comparedAt).toLocaleString()}` : ''}`, 'knowledge-meta'));
    if (site.crawledAt && !site.findings?.length) host.append(node('p', 'No disagreement with approved rules found on the pages read. This is not a full content review.'));
    for (const item of site.findings || []) {
      const card = node('article', undefined, 'knowledge-card rule-card'); card.dataset.state = item.decision ? 'decided' : 'conflict';
      card.append(node('strong', item.decision ? `Decided · ${siteActions.find(([value]) => value === item.decision.action)?.[1]}` : 'Website disagrees with an approved source', 'knowledge-state'), node('p', item.summary));
      card.append(node('blockquote', `Website: “${item.pageQuote}”`, 'rule-quote'), node('p', item.url, 'knowledge-meta'), sourceButton(item.source), node('small', `Source v${item.source.version}: “${item.source.quote}”`), node('p', item.method === 'model-validated' ? 'Found by NVIDIA Nemotron · both quotes verified' : 'Exact rule match', 'knowledge-meta'));
      if (!item.decision) {
        const decision = node('div', undefined, 'knowledge-approval');
        const reasonLabel = node('label', 'Reason'); const reason = node('input'); reason.type = 'text'; reason.maxLength = 300; reasonLabel.append(reason); decision.append(reasonLabel);
        for (const [value, text] of siteActions) {
          const button = node('button', text, 'secondary-button'); button.type = 'button';
          button.addEventListener('click', () => { if (!reason.value.trim()) { reason.focus(); status.textContent = 'Add a reason before deciding.'; return; } run(button, () => window.desktop.decideSiteFinding(item.id, value, reason.value), 'Saving…'); });
          decision.append(button);
        }
        card.append(decision);
      }
      host.append(card);
    }
  }
  host.append(status);
}
