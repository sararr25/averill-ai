const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  snapshot: () => ipcRenderer.invoke('agent:snapshot'),
  openWork: (kind) => ipcRenderer.invoke('agent:open-work', kind),
  share: (kind, enable) => ipcRenderer.invoke('agent:share', kind, enable),
  ask: (question) => ipcRenderer.invoke('agent:ask', question),
  aiMode: (enabled) => ipcRenderer.invoke('agent:ai-mode', enabled),
  source: (id) => ipcRenderer.invoke('agent:source', id),
  openSource: (id) => ipcRenderer.invoke('agent:open-source', id),
  updateWork: (kind, data) => ipcRenderer.send('work:update', kind, data),
  onSnapshot: (callback) => { ipcRenderer.on('agent:snapshot', (_, value) => callback(value)); },
  onSharing: (callback) => { ipcRenderer.on('work:sharing', (_, value) => callback(value)); },
});
