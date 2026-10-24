// AV-43: search by meaning in Knowledge when company AI is on and the index is built.
let semanticTimer, semanticRequest = 0, indexRenderKey = null;

async function renderKnowledgeIndex() {
  const host = el('knowledge-index');
  const me = current.workspace?.people?.find(person => person.id === current.workspace.activePersonId);
  const ready = current.workspace?.configured && (!current.auth?.enabled || current.auth.signedIn) && current.aiEnabled && current.privacy?.companyAI && current.services?.nebius;
  if (!ready) { host.replaceChildren(); el('knowledge-semantic').replaceChildren(); indexRenderKey = null; return; }
  const key = JSON.stringify([me?.id, current.workspace.sources]);
  if (key === indexRenderKey) return;
  indexRenderKey = key;
  let status;
  try { status = await window.desktop.knowledgeIndexStatus(); } catch { return; }
  const line = node('p', status.sources ? `Search by meaning · ${status.sources} sources indexed${status.pending ? ` · ${status.pending} not yet indexed` : ''}` : 'Search by meaning is not set up yet.', 'knowledge-meta');
  host.replaceChildren(line);
  if (['admin', 'lead'].includes(me?.role) && (status.pending || !status.sources)) {
    const build = node('button', status.sources ? 'Index new sources' : 'Set up search by meaning', 'secondary-button'); build.type = 'button';
    build.addEventListener('click', async () => {
      const ok = await confirmOutbound({ service: 'Nebius', title: 'Index approved sources', note: 'Paragraphs of approved sources that have Nebius consent are sent once to a Nebius embedding model. The resulting vectors are stored only on this Mac.', items: [`${status.pending} approved sources with Nebius consent`] });
      if (!ok?.length) return;
      build.disabled = true; line.textContent = 'Indexing…';
      try { const result = await window.desktop.buildKnowledgeIndex(); line.textContent = `Indexed ${result.chunks} passages with ${result.model}.`; indexRenderKey = null; renderKnowledgeIndex(); }
      catch (error) { line.textContent = error.message; build.disabled = false; }
    });
    host.append(build);
  }
}

async function renderSemantic() {
  const host = el('knowledge-semantic');
  const query = el('knowledge-search').value.trim();
  const request = ++semanticRequest;
  if (query.length < 4 || !current.aiEnabled || !current.privacy?.companyAI) { host.replaceChildren(); return; }
  let found;
  try { found = await window.desktop.semanticSearch(query); } catch (error) { if (request === semanticRequest) host.textContent = error.message; return; }
  if (request !== semanticRequest) return;
  if (found.mode !== 'semantic' || !found.results.length) { host.replaceChildren(); return; }
  const box = node('section', undefined, 'knowledge-card');
  box.append(node('strong', 'Best matching passages', 'knowledge-state'));
  for (const hit of found.results.slice(0, 4)) {
    const item = node('div', undefined, 'answer-evidence');
    item.append(node('p', `“${hit.quote}”`), node('p', `${hit.title} · v${hit.version}${hit.page ? ` · page ${hit.page}` : ''}${hit.line ? ` · line ${hit.line}` : ''} · ${hit.match === 'semantic' ? 'Semantic match' : 'Keyword match'}`, 'knowledge-meta'), sourceButton({ id: hit.sourceId, title: hit.title, kind: 'workspace' }));
    box.append(item);
  }
  host.replaceChildren(box);
}

document.getElementById('knowledge-search').addEventListener('input', () => { clearTimeout(semanticTimer); semanticTimer = setTimeout(renderSemantic, 450); });
