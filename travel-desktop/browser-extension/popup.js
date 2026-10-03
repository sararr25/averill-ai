const status = document.getElementById('status');
document.getElementById('share').addEventListener('click', async () => {
 try {
  const pair = JSON.parse(document.getElementById('pair').value);
  if (!/^http:\/\/127\.0\.0\.1:\d+\/observation$/.test(pair.endpoint) || !/^[a-f0-9]{64}$/.test(pair.token)) throw new Error('Copy current pairing details from Averill.');
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!/^https?:/.test(tab?.url || '')) throw new Error('Choose a normal HTTP/HTTPS draft page.');
  await chrome.runtime.sendMessage({kind:'stop-pair'});
  await chrome.storage.session.set({pair:{...pair,tabId:tab.id,pageOrigin:new URL(tab.url).origin,sequence:0}});
  await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});
  document.getElementById('pair').value='';status.textContent='Click the draft field to share. Stop in Averill or here ends local sharing.';
 } catch(error){status.textContent=error.message;}
});
document.getElementById('stop').addEventListener('click',async()=>{await chrome.runtime.sendMessage({kind:'stop-pair'});status.textContent='Sharing stopped.';});
