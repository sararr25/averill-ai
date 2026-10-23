(function (root) {
  function patchValue(value, proposal) {
    if (!proposal || !Number.isSafeInteger(proposal.start) || !Number.isSafeInteger(proposal.end) || proposal.start < 0 || proposal.end < proposal.start || proposal.end > value.length || typeof proposal.before !== 'string' || typeof proposal.after !== 'string' || !proposal.before || value.slice(proposal.start, proposal.end) !== proposal.before) throw new Error('This edit no longer matches the selected text.');
    if (value.indexOf(proposal.before) !== proposal.start || value.indexOf(proposal.before, proposal.start + 1) >= 0) throw new Error('This phrase appears more than once. Edit it manually.');
    const next = value.slice(0, proposal.start) + proposal.after + value.slice(proposal.end);
    if (next.length > 6000) throw new Error('This change is too large for a selected-field edit.');
    return next;
  }
  function plainSupported(element) { return Boolean(element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' && element.type === 'text') && !element.readOnly && !element.disabled); }
  // Named Canva web text surface only. Mixed runs, links, multiline text and
  // geometry are deliberately outside this adapter's write contract.
  function canvaRun(element) {
    if (!element?.isConnected || element.getAttribute('aria-readonly') === 'true' || element.getAttribute('aria-disabled') === 'true' || !/(^|\.)canva\.com$/.test(element.ownerDocument.location.hostname) || !element.matches('.ql-editor[contenteditable="true"][role="textbox"][aria-label="Text editor in Text"]')) return null;
    const paragraph = element.firstElementChild;
    if (element.childNodes.length !== 1 || paragraph?.tagName !== 'P' || !paragraph.children.length || paragraph.childNodes.length !== paragraph.children.length) return null;
    const attributes = node => [...node.attributes].map(a => [a.name, a.name === 'class' ? a.value.split(/\s+/).filter(c => c !== 'white-space-prewrap' || /\S/.test(node.textContent)).sort().join(' ') : a.value]).sort(([a],[b]) => a.localeCompare(b));
    const spans = [...paragraph.children], signature = JSON.stringify(attributes(spans[0]));
    if (spans.some(span => span.tagName !== 'SPAN' || span.childNodes.length !== 1 || span.firstChild.nodeType !== 3 || JSON.stringify(attributes(span)) !== signature)) return null;
    const text = spans.map(span => span.textContent).join('');
    if (!text || /[\r\n]/.test(text) || element.innerText !== text) return null;
    return { leaves: spans.map(span => span.firstChild), signature: JSON.stringify([attributes(paragraph), signature]) };
  }
  function supported(element) { return plainSupported(element) || Boolean(canvaRun(element)); }
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
      if (!plainSupported(element) || !element.isConnected || !same(this.identity(), expected)) throw new Error('The selected field changed. Review it again.');
      const before = element.value, after = patchValue(before, proposal);
      const selection = { start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection };
      write(element, after);
      return { before, after, selection, appliedIdentity: { ...this.identity() } };
    }
    undo(record) {
      if (!record || !plainSupported(this.element) || !this.element.isConnected || !same(this.identity(), record.appliedIdentity) || this.element.value !== record.after) throw new Error('Your draft changed after this edit. Undo will not overwrite your newer work.');
      write(this.element, record.before);
      this.element.focus();
      this.element.setSelectionRange(record.selection.start, record.selection.end, record.selection.direction);
    }
  }
  function formatting(element) { return canvaRun(element)?.signature; }
  class CanvaTextAdapter {
    constructor(element, identity) { this.element = element; this.identity = identity; }
    async replace(start, end, text, expectedText, expectedFormat) {
      const element = this.element, run = canvaRun(element), doc = element.ownerDocument;
      if (!run || formatting(element) !== expectedFormat) throw new Error('Canva text or formatting changed. Review it again.');
      element.focus();
      const point = offset => { for (const leaf of run.leaves) { if (offset <= leaf.length) return [leaf, offset]; offset -= leaf.length; } throw new Error('Canva selection changed.'); };
      const range = doc.createRange(); range.setStart(...point(start)); range.setEnd(...point(end));
      const selection = doc.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      // Chromium's native editing pipeline updates Canva's editor model and undo
      // buffer. Never assign innerHTML/textContent to the live design.
      const command = text ? 'insertText' : 'delete';
      if (!doc.queryCommandEnabled(command)) throw new Error('Canva editing command is unavailable.');
      doc.execCommand(command, false, text);
      await new Promise(resolve => doc.defaultView.requestAnimationFrame(resolve));
      if ( !canvaRun(element) || element.innerText !== expectedText || formatting(element) !== expectedFormat) throw new Error('Canva did not confirm '+(!canvaRun(element)?'the supported text structure':element.innerText!==expectedText?'the resulting text':'unchanged formatting')+'. Inspect the design before continuing.');
    }
    async apply(proposal, expected) {
      if (!canvaRun(this.element) || !same(this.identity(), expected)) throw new Error('The selected Canva text changed. Review it again.');
      const before = this.element.innerText, after = patchValue(before, proposal), signature = formatting(this.element);
      if (!after.trim()) throw new Error('Removing a whole Canva text element is not supported. Edit it manually.');
      try { await this.replace(proposal.start, proposal.end, proposal.after, after, signature); } catch (error) { if (this.element.innerText !== before) error.recovery = { before }; throw error; }
      return { before, after, start: proposal.start, removed: proposal.before, inserted: proposal.after, signature, appliedIdentity: { ...this.identity() } };
    }
    async undo(record) {
      if (!record || !canvaRun(this.element) || !same(this.identity(), record.appliedIdentity) || this.element.innerText !== record.after || formatting(this.element) !== record.signature) throw new Error('Your Canva text or formatting changed. Undo will not overwrite your newer work.');
      await this.replace(record.start, record.start + record.inserted.length, record.removed, record.before, record.signature);
    }
  }
  const api = { patchValue, supported, PlainTextAdapter, CanvaTextAdapter, create: (element, identity) => canvaRun(element) ? new CanvaTextAdapter(element, identity) : new PlainTextAdapter(element, identity) };
  root.AverillEditorAdapter = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
