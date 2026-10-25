// Why a browser connection ended. Shared by the extension (popup, worker, in-page card)
// and the desktop main process so every surface uses the same plain-English message.
(function (root) {
  const MESSAGES = {
    stopped_by_user: 'Sharing stopped. You chose Stop sharing or connected another tab.',
    signed_out: 'You signed out of Averill, so sharing ended.',
    app_closed: 'Averill closed or stopped responding, so sharing ended.',
    tab_closed: 'The shared tab was closed.',
    other_site: 'This tab moved to another site, so sharing ended.',
    lost_contact: 'Averill lost contact with the page.',
    approval_revoked: 'Averill no longer accepts this connection. Approve it again when you reconnect.',
  };
  // activeTab access comes from clicking the toolbar icon, so reconnecting always starts there.
  const RECONNECT = 'To reconnect, click the Averill icon in the Chrome toolbar, then choose Connect this tab.';
  const REASONS = Object.freeze(Object.keys(MESSAGES));
  function isReason(reason) { return typeof reason === 'string' && Object.hasOwn(MESSAGES, reason); }
  function message(reason) {
    if (!isReason(reason)) throw new Error(`Unknown browser connection end reason: ${reason}`);
    return MESSAGES[reason];
  }
  const api = { REASONS, RECONNECT, isReason, message };
  root.AverillEndReasons = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
