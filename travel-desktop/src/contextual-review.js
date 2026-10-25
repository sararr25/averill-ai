const crypto = require('node:crypto');
const taskReview = require('./task-review');
const reviewAgent = require('./review-agent');
const rules = require('./rules');
const fs = require('node:fs');
const privacy = require('./company-privacy');
const { approvedSources } = require('./workspace');

const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ASK_MAX = 500, ASK_CONTEXT_MAX = 1500;
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
  constructor({ getState, openSource = () => {}, fetcher, answer = null }) {
    this.getState = getState; this.openSource = openSource; this.fetcher = fetcher; this.answer = answer;
    this.generation = 0; this.last = null;
  }
  invalidate() { this.generation++; this.last = null; }
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
    this.last = { value, identity: expected, task, generation };
    return value;
  }
  // FB-07: a typed question from the in-page card. Same answer path as the desktop Ask, but the
  // reply is rebuilt from validated citations only: approved, visible, not restricted, no credentials,
  // and every quote must appear exactly in the stored source text.
  async ask({ question, fieldId, revision }) {
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
    if (!citations.length) return { id: crypto.randomUUID(), state: 'no-source', message: 'No approved source answers this.', text: '', citations: [], mode: 'local', usedField: Boolean(context) };
    // If any cited source was removed, the original prose may quote it. Rebuild from what survived.
    const model = !stripped && raw.mode === 'model' && typeof raw.text === 'string';
    // A local answer is only an extract, so the citation carries the quote and the prose does not repeat it.
    const text = model ? raw.text.slice(0, 1500) : `Closest approved wording, from ${citations[0].title}. This is an extract, not an inferred answer.`;
    return { id: crypto.randomUUID(), state: 'answered', text, citations, mode: model ? 'model' : 'local', usedField: Boolean(context) };
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
module.exports = { ContextualReview, identity, reviewObserved };
