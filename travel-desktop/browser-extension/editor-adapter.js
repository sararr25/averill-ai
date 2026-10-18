(function (root) {
  function patchValue(value, proposal) {
    if (!proposal || !Number.isSafeInteger(proposal.start) || !Number.isSafeInteger(proposal.end) || proposal.start < 0 || proposal.end < proposal.start || proposal.end > value.length || typeof proposal.before !== 'string' || typeof proposal.after !== 'string' || !proposal.before || value.slice(proposal.start, proposal.end) !== proposal.before) throw new Error('This edit no longer matches the selected text.');
    if (value.indexOf(proposal.before) !== proposal.start || value.indexOf(proposal.before, proposal.start + 1) >= 0) throw new Error('This phrase appears more than once. Edit it manually.');
    const next = value.slice(0, proposal.start) + proposal.after + value.slice(proposal.end);
    if (next.length > 6000) throw new Error('This change is too large for a selected-field edit.');
    return next;
  }
  function supported(element) { return Boolean(element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' && element.type === 'text') && !element.readOnly && !element.disabled); }
  function write(element, value) {
    const win = element.ownerDocument.defaultView;
    const prototype = element.tagName === 'TEXTAREA' ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
    if (!element.isConnected || element.value !== value) throw new Error('The editor did not confirm this change. Inspect your draft before continuing.');
  }
  function same(a, b) { return a && b && a.id === b.id && a.revision === b.revision && a.value === b.value; }
  class PlainTextAdapter {
    constructor(element, identity) { this.element = element; this.identity = identity; }
    apply(proposal, expected) {
      const element = this.element;
      if (!supported(element) || !element.isConnected || !same(this.identity(), expected)) throw new Error('The selected field changed. Review it again.');
      const before = element.value, after = patchValue(before, proposal);
      const selection = { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection };
      write(element, after);
      return { before, after, selection, appliedIdentity: { ...this.identity() } };
    }
    undo(record) {
      if (!record || !supported(this.element) || !this.element.isConnected || !same(this.identity(), record.appliedIdentity) || this.element.value !== record.after) throw new Error('Your draft changed after this edit. Undo will not overwrite your newer work.');
      write(this.element, record.before);
      this.element.focus();
      this.element.setSelectionRange(record.selection.start, record.selection.end, record.selection.direction);
    }
  }
  const api = { patchValue, supported, PlainTextAdapter };
  root.AverillEditorAdapter = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
