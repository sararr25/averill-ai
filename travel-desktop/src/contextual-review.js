const crypto = require('node:crypto');
const taskReview = require('./task-review');
const reviewAgent = require('./review-agent');
const rules = require('./rules');
const fs = require('node:fs');
const privacy = require('./company-privacy');
const tavily = require('./tavily');
const publicClaims = require('./public-claims');
const { internalTexts } = require('./public-check');
const { approvedSources } = require('./workspace');
const imageCheck = require('./image-check');
const designCheck = require('./design-check');

const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ASK_MAX = 500, ASK_CONTEXT_MAX = 1500;
const VERDICTS = ['supported', 'contradicted', 'unclear'];
const clip = (value, max) => String(value ?? '').slice(0, max);
function refused(message) { return { id: crypto.randomUUID(), state: 'refused', message, claims: [] }; }
function stale() { return new Error('The work, session or approved guidance changed. Review the selected field again.'); }

// Both the desktop renderer and the browser capability call this orchestration.
async function reviewObserved(state, task, useAI, validate, { fetcher = global.fetch } = {}) {
  validate();
  const result = useAI === true && state.aiEnabled
    ? await reviewAgent.reviewWithAgent(state.workspace, task, state.observed.text, state.key, state.observed.field, {
      fetcher: (...args) => { validate(); return fetcher(...args); },
    })
    : taskReview.localReview(state.workspace, task, state.observed.text, state.observed.field);
  validate();
  return result;
}

function identity(state, task) {
  if (!state?.signedIn || !state.workspace || !state.observed || state.observed.personId !== state.workspace.activePersonId) throw stale();
  if (!taskReview.tasks[task]) throw new Error('Choose a supported work type.');
  const sources = taskReview.currentSources(state.workspace, task);
  return digest({
    person: state.workspace.activePersonId, epoch: state.epoch, field: { id: state.observed.fieldId, revision: state.observed.revision, window: state.observed.windowId, hash: state.observed.contentHash, text: state.observed.text, value: state.observed.field },
    aiEnabled: state.aiEnabled, privacy: state.workspace.privacy,
    // Include actual text, all relevant visibility/consent metadata, and approved model rules.
    sources: sources.map(({ source, text }) => ({ source, text })), rules: rules.active(state.workspace, task),
  });
}

function exactProposal(finding, observed) {
  const before = finding.observedExcerpt;
  const text = observed.field?.value;
  if (observed.sensitiveRedacted || finding.type !== 'forbidden-claim' || !['textarea', 'text', 'contenteditable'].includes(observed.field?.kind) || typeof text !== 'string' || typeof before !== 'string' || !before) return null;
  const start = text.indexOf(before);
  if (start < 0 || text.indexOf(before, start + 1) >= 0) return null;
  // Prose/model suggestions are never interpreted as executable edits.
  return { id: crypto.randomUUID(), start, end: start + before.length, before, after: '' };
}

class ContextualReview {
  // checkOnline(claims, task) runs the public check (Tavily). online() says whether it is available and how it is routed.
  // ocr(filePath) reads the text of one temporary image file; tempDir is where those files live (FB-08, local only).
  constructor({ getState, openSource = () => {}, fetcher, answer = null, checkOnline = null, online = () => ({ available: false }), ocr = undefined, tempDir = undefined }) {
    this.ocr = ocr; this.tempDir = tempDir;
    this.getState = getState; this.openSource = openSource; this.fetcher = fetcher; this.answer = answer;
    this.checkOnline = checkOnline; this.online = online;
    this.generation = 0; this.last = null; this.offered = null;
    this.clearDesign();
  }
  invalidate() { this.generation++; this.last = null; this.offered = null; }
  // FB-10: public statements the employee may double-check online. They are exact pieces of the selected field, which the
  // card already holds. Nothing is sent from here: the card sends only what the employee ticks and confirms.
  offer(state, observed, task, modelClaims = []) {
    this.offered = null;
    const online = this.online();
    const field = observed.field?.value;
    if (!online?.available || observed.sensitiveRedacted || typeof field !== 'string' || !taskReview.tasks[task] || privacy.credentials(field)) return null;
    const internal = internalTexts(state.workspace, task);
    const text = publicClaims.normalize(field);
    const safe = claim => { try { tavily.outbound(claim, { max: publicClaims.MAX_LENGTH, internalTexts: internal }); return true; } catch { return false; } };
    const seen = new Set();
    let claims = (Array.isArray(modelClaims) ? modelClaims : []).map(claim => publicClaims.normalize(claim))
      .filter(claim => claim.length >= 10 && claim.length <= publicClaims.MAX_LENGTH && text.includes(claim) && safe(claim) && !seen.has(claim.toLowerCase()) && seen.add(claim.toLowerCase()));
    if (!claims.length) claims = publicClaims.candidates(field, { internalTexts: internal, ruleValues: rules.active(state.workspace, task).map(rule => rule.value) }).filter(safe);
    claims = claims.slice(0, publicClaims.MAX_CLAIMS);
    this.offered = { fieldId: observed.fieldId, revision: observed.revision, task, claims };
    return { claims, nemotron: Boolean(online.nemotron), quota: online.quota || null };
  }
  // Only the claims the employee confirmed in the card reach Tavily. Each must be text of the current field (or of the claim shown),
  // and each passes the same credential and internal-text guards as every other Tavily call.
  async publicCheck({ task, fieldId, revision, claims }) {
    const state = this.getState();
    if (!state?.signedIn || !state.workspace || typeof this.checkOnline !== 'function') throw stale();
    const observed = state.observed;
    if (!observed?.fieldId || observed.fieldId !== fieldId || observed.revision !== revision || observed.personId !== state.workspace.activePersonId) throw stale();
    if (!taskReview.tasks[task]) throw new Error('Choose a supported work type.');
    if (!this.online()?.available) return refused('Online checks are not set up. Ask an administrator to add a Tavily key.');
    const list = (Array.isArray(claims) ? claims : []).map(claim => typeof claim === 'string' ? publicClaims.normalize(claim) : '');
    if (!list.length || list.length > publicClaims.MAX_CLAIMS || list.some(claim => !claim || claim.length > publicClaims.MAX_LENGTH)) return refused(`Choose 1 to ${publicClaims.MAX_CLAIMS} statements of up to ${publicClaims.MAX_LENGTH} characters.`);
    const internal = internalTexts(state.workspace, task);
    for (const claim of list) {
      try { tavily.outbound(claim, { max: publicClaims.MAX_LENGTH, internalTexts: internal }); }
      catch (error) { return refused(error.message); }
    }
    const field = observed.sensitiveRedacted ? '' : publicClaims.normalize(observed.field?.value);
    const shown = this.offered && this.offered.fieldId === fieldId && this.offered.revision === revision ? this.offered.claims.map(publicClaims.normalize) : [];
    if (!field || list.some(claim => !field.includes(claim) && !shown.some(offered => offered.includes(claim)))) return refused('Only text from your draft can be checked online. Use the shown statement or a part of it.');
    const personId = state.workspace.activePersonId, epoch = state.epoch;
    let raw;
    try { raw = await this.checkOnline([...new Set(list)], task); }
    catch (error) {
      if (error.limit) return { id: crypto.randomUUID(), state: 'limit', message: error.message, claims: [] };
      if (error.expose) return { id: crypto.randomUUID(), state: 'error', message: error.message, claims: [] };
      if (typeof error.status === 'number') return { id: crypto.randomUUID(), state: 'error', message: `The online search failed (${error.status}). Try again later.`, claims: [] };
      console.error('Online check failed:', error.message);
      return { id: crypto.randomUUID(), state: 'error', message: 'The online check could not finish. Try again.', claims: [] };
    }
    const now = this.getState();
    if (!now?.signedIn || now.workspace?.activePersonId !== personId || now.epoch !== epoch) throw stale();
    return shapeChecked(raw);
  }
  // FB-08: the images the employee asked the card to check. Pixels are read on this device and never leave it; the reply
  // carries findings and short per-image facts only. Bound to the same field revision as the review.
  async imageCheck({ task, fieldId, revision, images }) {
    const state = this.getState();
    if (!state?.signedIn || !state.workspace) throw stale();
    const observed = state.observed;
    if (!observed?.fieldId || observed.fieldId !== fieldId || observed.revision !== revision || observed.personId !== state.workspace.activePersonId) throw stale();
    if (!taskReview.tasks[task]) throw new Error('Choose a supported work type.');
    const list = imageCheck.validate(images);
    const personId = state.workspace.activePersonId, epoch = state.epoch;
    const result = await imageCheck.run({ workspace: state.workspace, task, images: list, ocr: this.ocr, tempDir: this.tempDir });
    const now = this.getState();
    if (!now?.signedIn || now.workspace?.activePersonId !== personId || now.epoch !== epoch || now.observed?.fieldId !== fieldId || now.observed.revision !== revision) throw stale();
    return { ...result, fieldId, revision };
  }
  // FB-14: a Canva design check from the in-page card. Only texts and numbers arrive (validated again here); the page must be
  // canva.com. The result is not bound to a selected field: it describes the whole open design at the time of the check.
  designCheck(payload) {
    const state = this.getState();
    if (!state?.signedIn || !state.workspace) throw stale();
    if (!/^https:\/\/([a-z0-9-]+\.)*canva\.com$/.test(String(payload?.pageOrigin || ''))) throw new Error('Design checks run on canva.com only.');
    const personId = state.workspace.activePersonId;
    if (payload.action === 'override') {
      // "Export anyway": recorded for this signed-in session only, for the last check this person ran, if it had findings.
      const last = this.lastDesign;
      if (!last || last.id !== payload.checkId || last.personId !== personId || last.epoch !== state.epoch || !last.findingCount) throw stale();
      const entry = { checkId: last.id, at: new Date().toISOString(), findingCount: last.findingCount, types: last.types, personId };
      this.designOverrides.push(entry);
      return { state: 'override-recorded', checkId: entry.checkId, at: entry.at };
    }
    const result = designCheck.evaluate({ workspace: state.workspace, payload: { design: payload.design, elements: payload.elements } });
    this.lastDesign = { id: result.id, personId, epoch: state.epoch, at: new Date().toISOString(), findingCount: result.findings.length, elementCount: result.elementCount, types: [...new Set(result.findings.map(f => f.type))] };
    return result;
  }
  designStatus(personId) {
    const mine = entry => entry && entry.personId === personId;
    const last = mine(this.lastDesign) ? this.lastDesign : null;
    return { last: last && { at: last.at, findingCount: last.findingCount, elementCount: last.elementCount, types: last.types }, overrides: this.designOverrides.filter(mine).map(({ at, findingCount, types }) => ({ at, findingCount, types })) };
  }
  clearDesign() { this.lastDesign = null; this.designOverrides = []; }
  validate(expected, task, generation) {
    if (generation !== this.generation || identity(this.getState(), task) !== expected) throw stale();
  }
  current(reviewId) {
    const last = this.last;
    if (!last || last.value.id !== reviewId) throw stale();
    this.validate(last.identity, last.task, last.generation);
    return last;
  }
  status() {
    try { if (this.last) return { reviewId: this.current(this.last.value.id).value.id }; } catch { this.invalidate(); }
    return { reviewId: null };
  }
  async review({ task, fieldId, revision, useAI = false, consent = false }) {
    const state = this.getState(), observed = state?.observed;
    if (!observed?.fieldId || observed.fieldId !== fieldId || observed.revision !== revision) throw stale();
    if (useAI && consent !== true) throw new Error('Confirm this review before sending selected text to Nebius.');
    const expected = identity(state, task), generation = ++this.generation;
    this.last = null;
    const validate = () => this.validate(expected, task, generation);
    const result = await reviewObserved(state, task, useAI, validate, { fetcher: this.fetcher });
    const sources = new Map(taskReview.currentSources(state.workspace, task).filter(entry => entry.source.confidentiality !== 'restricted' && !entry.source.containsCredentials).map(entry => [entry.source.id, entry]));
    const findings = [];
    for (const item of (result.findings || []).slice(0, 8)) {
      const source = sources.get(item.source?.id);
      if (!source || typeof item.source.quote !== 'string' || !item.source.quote || item.source.quote.length > 600 || !source.text.includes(item.source.quote)) continue;
      if (item.observedExcerpt && !observed.text.includes(item.observedExcerpt)) continue;
      findings.push({
        id: crypto.randomUUID(), type: String(item.type).slice(0, 60),
        observedExcerpt: String(item.observedExcerpt || '').slice(0, 600),
        suggestion: String(item.suggestion || '').slice(0, 600),
        source: { id: source.source.id, title: String(source.source.title).slice(0, 160), version: String(source.source.version || ''), quote: item.source.quote },
        proposal: exactProposal(item, observed),
      });
    }
    validate();
    const suppressed = (result.findings || []).length > findings.length;
    const value = {
      id: crypto.randomUUID(), fieldId, revision, state: findings.length ? 'findings' : sources.size && !suppressed ? 'no-conflict' : 'insufficient-evidence',
      mode: ['agent', 'model'].includes(result.mode) ? result.mode : 'local', findings,
      scope: { task, field: String(observed.field.label).slice(0, 100), sourceCount: sources.size, uncheckedFields: (result.uncheckedFields || []).filter(key => typeof key === 'string').slice(0, 8) },
    };
    const publicCheck = this.offer(state, observed, task, result.publicClaims);
    if (publicCheck) value.publicCheck = publicCheck;
    this.last = { value, identity: expected, task, generation };
    return value;
  }
  // FB-07: a typed question from the in-page card. Same answer path as the desktop Ask, but the
  // reply is rebuilt from validated citations only: approved, visible, not restricted, no credentials,
  // and every quote must appear exactly in the stored source text.
  async ask({ question, fieldId, revision, task }) {
    const state = this.getState();
    if (!state?.signedIn || !state.workspace || typeof this.answer !== 'function') throw stale();
    const input = typeof question === 'string' ? question.trim() : '';
    if (!input || input.length > ASK_MAX) throw new Error('Ask a question of 1 to 500 characters.');
    if (privacy.credentials(input)) return { id: crypto.randomUUID(), state: 'refused', message: 'Take credentials out of the question. Averill does not process them.', text: '', citations: [], mode: 'local', usedField: false };
    const personId = state.workspace.activePersonId, epoch = state.epoch;
    // The selected field is context only while it is still the exact field and revision the card showed.
    const observed = state.observed;
    let context = '';
    if (fieldId !== undefined && observed?.fieldId === fieldId && observed.revision === revision && observed.personId === personId && typeof observed.field?.value === 'string') {
      const value = observed.field.value.slice(0, ASK_CONTEXT_MAX);
      if (!privacy.credentials(value)) context = value;
    }
    const raw = await this.answer(input, context);
    const now = this.getState();
    if (!now?.signedIn || now.workspace?.activePersonId !== personId || now.epoch !== epoch) throw stale();
    const allowed = new Map(approvedSources(now.workspace).filter(source => source.confidentiality !== 'restricted' && !source.containsCredentials).map(source => [source.id, source]));
    const citations = [];
    for (const item of (raw?.sources || []).slice(0, 5)) {
      const source = allowed.get(item?.id);
      if (!source || typeof item.quote !== 'string' || !item.quote || item.quote.length > 600 || !source.textPath) continue;
      let text = ''; try { text = fs.readFileSync(source.textPath, 'utf8'); } catch { continue; }
      if (!text.includes(item.quote)) continue;
      citations.push({ id: source.id, title: String(source.title).slice(0, 160), version: String(source.version || ''), quote: item.quote });
    }
    const stripped = (raw?.sources || []).length > citations.length;
    // The same draft statements are offered for an online double-check after an answer, never sent from here.
    const publicCheck = context && now.observed?.fieldId === fieldId && now.observed.revision === revision ? this.offer(now, now.observed, task, []) : null;
    const offer = publicCheck ? { publicCheck } : {};
    if (!citations.length) return { id: crypto.randomUUID(), state: 'no-source', message: 'No approved source answers this.', text: '', citations: [], mode: 'local', usedField: Boolean(context), ...offer };
    // If any cited source was removed, the original prose may quote it. Rebuild from what survived.
    const model = !stripped && raw.mode === 'model' && typeof raw.text === 'string';
    // A local answer is only an extract, so the citation carries the quote and the prose does not repeat it.
    const text = model ? raw.text.slice(0, 1500) : `Closest approved wording, from ${citations[0].title}. This is an extract, not an inferred answer.`;
    return { id: crypto.randomUUID(), state: 'answered', text, citations, mode: model ? 'model' : 'local', usedField: Boolean(context), ...offer };
  }
  proposal({ reviewId, findingId }) {
    const last = this.current(reviewId);
    const item = last.value.findings.find(entry => entry.id === findingId);
    if (!item?.proposal) throw new Error('This suggestion requires a manual edit.');
    return { reviewId, fieldId: last.value.fieldId, revision: last.value.revision, proposal: { ...item.proposal } };
  }
  open({ reviewId, findingId }) {
    const last = this.current(reviewId);
    const finding = last.value.findings.find(item => item.id === findingId);
    if (!finding) throw stale();
    this.openSource(finding.source.id);
    return { opened: true };
  }
}
// Rebuilds a public check result from validated parts only. A supported or contradicted verdict keeps its snippet only when
// the snippet appears in the content Tavily returned for that source; anything else becomes unclear. Content is not passed on.
function shapeChecked(raw) {
  const claims = (Array.isArray(raw?.claims) ? raw.claims : []).slice(0, publicClaims.MAX_CLAIMS).map(item => {
    const results = (Array.isArray(item?.results) ? item.results : []).filter(entry => typeof entry?.url === 'string' && /^https:\/\//.test(entry.url) && entry.url.length <= 500).slice(0, 3);
    const sources = results.map(entry => ({ title: clip(entry.title || entry.url, 160), url: entry.url, snippet: clip(entry.snippet, 240) }));
    let verdict = VERDICTS.includes(item?.verdict) ? item.verdict : 'unclear', evidence = null;
    if (verdict !== 'unclear') {
      const source = results.find(entry => entry.url === item.url);
      const snippet = typeof item.snippet === 'string' ? item.snippet.trim() : '';
      if (source && snippet.length >= 12 && typeof source.content === 'string' && source.content.includes(snippet)) evidence = { title: clip(source.title || source.url, 160), url: source.url, snippet: clip(snippet, 400) };
      else verdict = 'unclear';
    }
    const explanation = verdict === 'unclear' && !evidence && !sources.length ? 'No public source answered this.' : clip(item?.explanation, 300);
    return { claim: clip(item?.claim, 300), verdict, explanation, ...(evidence ? { evidence } : {}), sources };
  });
  return { id: crypto.randomUUID(), state: 'checked', checkedAt: new Date().toISOString(), method: clip(raw?.method, 80), via: raw?.via === 'demo-server' ? 'demo-server' : 'local-key', claims };
}
module.exports = { ContextualReview, identity, reviewObserved, shapeChecked };
