// AV-04: one confirmation for anything sent to Nebius or Tavily that the employee did not type directly.
// Resolves with the items the person kept (optionally edited), or null when cancelled.
function confirmOutbound({ service, title, note, items, editable = false }) {
  const dialog = el('outbound-dialog'), list = el('outbound-items'), send = el('outbound-send'), cancel = el('outbound-cancel');
  el('outbound-service').textContent = `SENT TO ${service.toUpperCase()}`;
  el('outbound-title').textContent = title;
  el('outbound-note').textContent = note || 'Only the checked items below leave this Mac. Nothing else from your work or company sources is sent.';
  list.replaceChildren();
  const rows = items.map((item, index) => {
    const row = node('li', undefined, 'outbound-item');
    const box = node('input'); box.type = 'checkbox'; box.checked = true; box.id = `outbound-${index}`;
    const label = node('label'); label.htmlFor = box.id;
    let field = null;
    if (editable) { field = node('textarea'); field.value = item; field.rows = 2; field.maxLength = 400; field.setAttribute('aria-label', `Item ${index + 1}`); label.append(field); }
    else label.textContent = item;
    row.append(box, label); list.append(row);
    return { box, field, item };
  });
  const update = () => { send.disabled = !rows.some(row => row.box.checked && (!row.field || row.field.value.trim())); };
  for (const row of rows) { row.box.addEventListener('change', update); row.field?.addEventListener('input', update); }
  update();
  return new Promise(resolve => {
    const finish = value => { send.onclick = cancel.onclick = dialog.oncancel = null; dialog.close(); resolve(value); };
    send.onclick = () => finish(rows.filter(row => row.box.checked).map(row => row.field ? row.field.value.trim() : row.item).filter(Boolean));
    cancel.onclick = () => finish(null);
    dialog.oncancel = event => { event.preventDefault(); finish(null); };
    dialog.showModal();
    (rows[0]?.box || cancel).focus();
  });
}
