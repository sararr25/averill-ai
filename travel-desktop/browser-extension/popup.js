const status = document.getElementById('status');
async function connect(kind) {
  const button = document.getElementById(kind === 'connect-tab' ? 'connect' : 'share'); button.disabled = true;
  status.textContent = 'Connecting… Approve the first connection in Averill if prompted.';
  try {
    const pair = kind === 'pair-tab' ? JSON.parse(document.getElementById('pair').value) : undefined;
    const result = await chrome.runtime.sendMessage({ kind, pair });
    if (result.error) throw new Error(result.error);
    document.getElementById('pair').value = '';
    status.textContent = 'Connected. Choose a draft field, then Ask Averill in the page.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
}
document.getElementById('connect').addEventListener('click', () => connect('connect-tab'));
document.getElementById('share').addEventListener('click', () => connect('pair-tab'));
document.getElementById('stop').addEventListener('click', async () => { await chrome.runtime.sendMessage({ kind: 'stop-pair' }); status.textContent = 'Sharing stopped.'; });
