const test = require('node:test');
const assert = require('node:assert/strict');
const FS = require('../browser-extension/field-select');

// Minimal DOM stand-in: enough for selector matching, labels and "find the field again".
function el(tag, attrs = {}, { children = [], editable = false, type = '' } = {}) {
  const node = { nodeType: 1, tagName: tag.toUpperCase(), attrs, children, parent: null, isContentEditable: editable, type, id: attrs.id || '', labels: attrs.labelText ? [{ innerText: attrs.labelText }] : undefined };
  node.getAttribute = name => (name in attrs ? String(attrs[name]) : null);
  const one = selector => {
    const attr = selector.match(/^\[([\w-]+)(?:=(?:"([^"]*)"|(\w+)))?\]$/);
    if (attr) return attr[1] in attrs && (attr[2] === undefined && attr[3] === undefined || String(attrs[attr[1]]) === (attr[2] ?? attr[3]));
    return node.tagName === selector.toUpperCase();
  };
  node.matches = selector => selector.split(',').some(one);
  node.closest = selector => { for (let n = node; n; n = n.parent) if (n.matches(selector)) return n; return null; };
  children.forEach(child => { child.parent = node; });
  node.querySelectorAll = () => { const all = []; (function walk(n) { for (const c of n.children) { all.push(c); walk(c); } })(node); return all; };
  node.ownerDocument = node;
  return node;
}
const page = (...children) => { const root = el('html', {}, { children }); return root; };
const ok = () => true;

test('role=textbox and contenteditable plaintext-only are shareable; a read-only textbox is not', () => {
  const rich = el('div', { role: 'textbox', contenteditable: 'true' }, { editable: true });
  const plain = el('div', { contenteditable: 'plaintext-only' }, { editable: true });
  const empty = el('div', { contenteditable: '' }, { editable: true });
  const widget = el('div', { role: 'textbox' });
  for (const field of [rich, plain, empty, el('textarea'), el('input', {}, { type: 'text' })]) assert.equal(FS.isCandidate(field), true);
  assert.equal(FS.isCandidate(widget), false);
  assert.equal(FS.isCandidate(el('div', {})), false);
  const fromEvent = target => FS.fieldFromEvent({ composedPath: () => { const path = []; for (let n = target; n; n = n.parent) path.push(n); return path; } });
  const inner = el('span'); rich.children.push(inner); inner.parent = rich;
  assert.equal(fromEvent(inner), rich);
});

test('a field inside an open shadow root is found through the event path', () => {
  const textarea = el('textarea');
  const path = [textarea, el('div'), el('section')];
  assert.equal(FS.fieldFromEvent({ composedPath: () => path }), textarea);
});

test('post and caption composers are not excluded, even with the word personal', () => {
  for (const label of ['Post text', 'Write a caption...', 'Text editor for creating content', 'What do you want to talk about?', 'Personal update', 'Share a personal story', 'My personal brand'])
    assert.equal(FS.isSensitive([label, 'postText', 'composer', '']), false, label);
});

test('password, token, card, payment, recipient email and phone fields stay excluded', () => {
  for (const parts of [['Password'], ['API token'], ['Card number'], ['Payment details'], ['Recipient'], ['Recipient email'], ['Your email address'], ['Phone number'], ['Mobile phone'], ['Personal email'], ['Personal data'], ['Personal ID number'], ['Personal phone'], ['Personnel notes'], ['x', 'user_password'], ['x', 'cardNumber', 'id']])
    assert.equal(FS.isSensitive(parts), true, parts.join('|'));
});

test('a replaced field is found again by label, role and position', () => {
  const make = () => el('div', { role: 'textbox', contenteditable: 'true', 'aria-label': 'Write a caption...' }, { editable: true });
  const first = make(), other = el('textarea', { 'aria-label': 'Alt text' });
  const doc = page(first, other);
  const signature = FS.signature(first, doc, ok);
  assert.equal(signature.count, 1);
  const replacement = make(), fresh = page(replacement, other);
  assert.equal(FS.refind(signature, fresh, ok), replacement);
});

test('generated ids are ignored, stable ids are kept', () => {
  const a = el('textarea', { id: ':r5:', 'aria-label': 'Post text' }), b = el('textarea', { id: 'composer', 'aria-label': 'Post text' });
  assert.equal(FS.signature(a, page(a), ok).id, '');
  assert.equal(FS.signature(b, page(b), ok).id, 'composer');
  const remountedA = el('textarea', { id: ':r9:', 'aria-label': 'Post text' });
  assert.equal(FS.refind(FS.signature(a, page(a), ok), page(remountedA), ok), remountedA);
  const otherId = el('textarea', { id: 'other', 'aria-label': 'Post text' });
  assert.equal(FS.refind(FS.signature(b, page(b), ok), page(otherId), ok), null);
});

test('among identical fields the same position is picked; a changed count or a different label is not guessed', () => {
  const field = text => el('textarea', { 'aria-label': text });
  const [one, two] = [field('Comment'), field('Comment')];
  const signature = FS.signature(two, page(one, two), ok);
  assert.equal(signature.index, 1);
  const [n1, n2] = [field('Comment'), field('Comment')];
  assert.equal(FS.refind(signature, page(n1, n2), ok), n2);
  assert.equal(FS.refind(signature, page(field('Comment')), ok), null);
  assert.equal(FS.refind(signature, page(field('Reply'), field('Reply')), ok), null);
  assert.equal(FS.refind(signature, page(), ok), null);
});

test('a field that is hidden or refused by the caller is not re-found', () => {
  const field = el('textarea', { 'aria-label': 'Post text' });
  const signature = FS.signature(field, page(field), ok);
  assert.equal(FS.refind(signature, page(el('textarea', { 'aria-label': 'Post text' })), () => false), null);
});

test('a composer inside a dialog is not matched by a similar field outside it', () => {
  const inDialog = el('textarea', { 'aria-label': 'Post text' });
  const dialog = el('div', { role: 'dialog' }, { children: [inDialog] });
  const signature = FS.signature(inDialog, page(dialog), ok);
  assert.equal(signature.dialog, true);
  assert.equal(FS.refind(signature, page(el('textarea', { 'aria-label': 'Post text' })), ok), null);
});
