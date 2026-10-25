(function (root) {
  // Which page elements can be shared as "one clicked field", and how to find the same field again
  // after a single-page app replaces its node. Read and review only: writing stays in editor-adapter.js.
  const SELECTOR = 'textarea,input,select,[contenteditable="true"],[contenteditable=""],[contenteditable="plaintext-only"],[role="textbox"]';
  // Credentials, payment, recipient and phone fields stay excluded. "personal" only counts when it names
  // personal data, so a post composer called "Personal update" is not blocked.
  const SENSITIVE = /password|token|secret|card|payment|recipient|e-?mail address|phone|personal[\s_-]*(e-?mail|data|details|information|info|id|number|phone|address)|personnel/i;
  const UNSTABLE_ID = /^[:«]|^radix-|^react-|\d{3,}/;
  const EDITABLE_ATTRIBUTE = ['true', '', 'plaintext-only'];
  function isSensitive(parts) { return SENSITIVE.test(parts.join(' ')); }
  function isEditableText(element) { return Boolean(element.isContentEditable || EDITABLE_ATTRIBUTE.includes(element.getAttribute('contenteditable'))); }
  // A role=textbox that cannot be edited is a label or a widget, not a draft field.
  function isCandidate(element) {
    if (!element || element.nodeType !== 1 || !element.matches(SELECTOR)) return false;
    return !element.matches('[role="textbox"]') || element.matches('textarea,input') || isEditableText(element);
  }
  // composedPath reaches into open shadow roots; closed ones stay invisible.
  function fieldFromEvent(event) { return event.composedPath().find(isCandidate) || null; }
  function labelOf(element) { return element.getAttribute('aria-label') || element.labels?.[0]?.innerText || element.getAttribute('placeholder') || 'Selected draft field'; }
  function collect(scope, found = []) {
    for (const element of scope.querySelectorAll('*')) {
      if (isCandidate(element)) found.push(element);
      if (element.shadowRoot) collect(element.shadowRoot, found);
    }
    return found;
  }
  function sameKind(element, signature) {
    return element.tagName === signature.tag && (element.getAttribute('role') || '') === signature.role && (element.type || '') === signature.type
      && (element.getAttribute('name') || '') === signature.name && labelOf(element) === signature.label && (!signature.id || element.id === signature.id) && Boolean(element.closest('[role=dialog],dialog')) === signature.dialog;
  }
  // Identity of a field that survives a re-render: tag, role, type, name, label, a stable id, and its
  // position among identical fields. Generated ids (React, Radix) are ignored because they change on remount.
  function signature(element, scope = element.ownerDocument, accept = () => true) {
    const base = { tag: element.tagName, role: element.getAttribute('role') || '', type: element.type || '', name: element.getAttribute('name') || '', label: labelOf(element), id: UNSTABLE_ID.test(element.id) ? '' : element.id, dialog: Boolean(element.closest('[role=dialog],dialog')) };
    const same = collect(scope).filter(candidate => sameKind(candidate, base) && (candidate === element || accept(candidate)));
    return { ...base, index: Math.max(0, same.indexOf(element)), count: same.length || 1 };
  }
  // Returns the single field that matches, or null when there is none or the match is ambiguous.
  function refind(signature, scope, accept = () => true) {
    const matches = collect(scope).filter(element => sameKind(element, signature) && accept(element));
    if (matches.length === 0 || matches.length !== signature.count) return null;
    return matches[signature.index] || null;
  }
  const api = { SELECTOR, isSensitive, isEditableText, isCandidate, fieldFromEvent, labelOf, signature, refind };
  root.AverillFieldSelect = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
