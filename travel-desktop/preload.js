const { contextBridge, ipcRenderer, webUtils } = require('electron');

let operationId=0;
const operationListeners=new Set();
const operationLabels={
 'account:login':'Signing in', 'account:logout':'Signing out', 'account:enable':'Saving owner login', 'account:create':'Creating account', 'account:documents':'Opening login documents', 'account:disable':'Disabling account', 'account:recover':'Recovering account', 'account:change-password':'Changing password',
 'onboarding:drop':'Reading dropped files', 'onboarding:upload':'Selecting and reading company files', 'onboarding:synced':'Reading synced files', 'onboarding:links':'Downloading and reading linked files', 'onboarding:analyze':'Interpreting selected files with Nebius', 'onboarding:apply':'Saving company onboarding', 'onboarding:read-file':'Opening uploaded text',
 'company:privacy':'Saving company AI policy', 'cloud:configure':'Saving cloud configuration', 'cloud:connect':'Waiting for cloud sign-in', 'cloud:cancel':'Cancelling cloud sign-in', 'cloud:disconnect':'Disconnecting cloud account', 'cloud:list':'Loading cloud folder', 'cloud:import':'Downloading selected cloud files',
 'workspace:create':'Creating company workspace', 'workspace:add-person':'Adding person', 'workspace:import':'Importing sources', 'workspace:import-folder':'Importing folder', 'workspace:update-source':'Saving source status and priority', 'workspace:remove-source':'Deleting local source copy', 'workspace:request-clarification':'Requesting private clarification', 'workspace:resolve-clarification':'Answering private clarification', 'workspace:propose-source':'Proposing source', 'workspace:open-source':'Opening source file', 'workspace:read-file':'Opening source text', 'workspace:save-key':'Saving service key securely',
 'agent:source':'Opening source text', 'agent:open-work':'Opening work window', 'agent:copy-finding':'Copying suggested correction', 'agent:share':'Updating sharing', 'agent:ask':'Preparing answer', 'agent:ask-demo':'Preparing demo answer', 'agent:ai-mode':'Updating AI mode', 'agent:open-source':'Opening file', 'agent:open-web':'Opening browser', 'agent:web-search':'Searching public web', 'agent:fact-check':'Checking public claim', 'agent:external-windows':'Finding available windows', 'agent:external-share':'Updating selected window', 'agent:external-review':'Reading selected window', 'learning:action':'Saving learning activity', 'companion:open':'Opening Averill'
};
function announce(value){for(const listener of operationListeners)try{listener(value);}catch{}}
async function invoke(channel,...args){
 const label=operationLabels[channel];if(!label)return ipcRenderer.invoke(channel,...args);
 const id=++operationId;announce({id,channel,state:'pending',message:label+'…'});
 // Give the renderer a chance to paint before synchronous local extraction begins.
 await new Promise(resolve=>setTimeout(resolve,30));
 try{
  const result=await ipcRenderer.invoke(channel,...args);let message=result?.operationNotice||`${label}: completed.`;
  const intake=['onboarding:drop','onboarding:upload','onboarding:synced','onboarding:links','cloud:import'].includes(channel);
  if(intake&&!result?.operationNotice){const files=result?.onboarding?.files||[];message=`Files received: ${files.length}. Text extracted from ${files.filter(f=>f.readable).length}; ${files.filter(f=>!f.readable).length} need a readable export. Review the proposal before saving. Nothing was sent to Nebius.${result.onboarding.warnings?.length?' Check: '+result.onboarding.warnings.slice(0,3).join(' '):''}`;}
  if(channel==='onboarding:apply')message=`Saved ${result.documentsAdded} documents and created ${result.peopleAdded} accounts. Company knowledge is available in Knowledge; approval controls its use.`;
  if(channel==='onboarding:analyze')message='Nebius interpretation completed. Review the proposed people and company knowledge before saving.';
  if(channel==='cloud:list')message=`Folder loaded: ${result.items.length} items${result.cursor?' · more available':''}.`;
  if(channel==='agent:ask'||channel==='agent:ask-demo')message=`Answer ready · ${result.mode==='local'?'local processing':'Nebius'}.`;
  const failed=result===false||(channel==='agent:source'&&!result);announce({id,channel,state:failed?'error':'success',message:failed?'The action did not complete. Check access and try again.':message,intake});return result;
 }catch(error){announce({id,channel,state:'error',message:String(error.message||'The action failed. Try again.').replace(/^Error invoking remote method '[^']+': (?:Error: )?/,'')});throw error;}
}

contextBridge.exposeInMainWorld('desktop', {
  onOperation: callback => { operationListeners.add(callback); },
  listKnowledge: (query,status,filters) => invoke('workspace:knowledge',query,status,filters),
  readOnboardingFile: id => invoke('onboarding:read-file',id),
  login: (email, password) => invoke('account:login', email, password),
  logout: () => invoke('account:logout'),
  enableAccounts: (email, password) => invoke('account:enable', email, password),
  createAccount: (id, email, profile) => invoke('account:create', id, email, profile),
  openAccountDocuments: () => invoke('account:documents'),
  disableAccount: id => invoke('account:disable',id),
  recoverAccount: id => invoke('account:recover',id),
  changePassword: (currentPassword,nextPassword) => invoke('account:change-password',currentPassword,nextPassword),
  dropOnboarding: (files) => invoke('onboarding:drop', Array.from(files).map(file=>webUtils.getPathForFile(file))),
  linkOnboarding: (links) => invoke('onboarding:links', links),
  syncedOnboarding: () => invoke('onboarding:synced'),
  companyPrivacy: (enabled) => invoke('company:privacy', enabled),
  cloudConfigure: (provider,id,secret) => invoke('cloud:configure',provider,id,secret),
  cloudConnect: (provider) => invoke('cloud:connect',provider),
  cloudCancel: () => invoke('cloud:cancel'),
  cloudDisconnect: (provider) => invoke('cloud:disconnect',provider),
  cloudList: (provider,folder,cursor) => invoke('cloud:list',provider,folder,cursor),
  cloudImport: (provider,ids) => invoke('cloud:import',provider,ids),
  uploadOnboarding: () => invoke('onboarding:upload'),
  analyzeOnboarding: (consent, selections) => invoke('onboarding:analyze', consent, selections),
  applyOnboarding: (review) => invoke('onboarding:apply', review),
  learningAction: (action, payload) => invoke('learning:action', action, payload),
  snapshot: () => invoke('agent:snapshot'),
  openCompanion: () => invoke('companion:open'),
  onOpenContext: (callback) => { ipcRenderer.on('agent:open-context', () => callback()); },
  openWork: (kind) => invoke('agent:open-work', kind),
  copyFinding: (kind,id) => invoke('agent:copy-finding',kind,id),
  share: (kind, enable) => invoke('agent:share', kind, enable),
  ask: (question) => invoke('agent:ask', question),
  askDemo: (question) => invoke('agent:ask-demo', question),
  aiMode: (enabled) => invoke('agent:ai-mode', enabled),
  source: (id) => invoke('agent:source', id),
  openSource: (id) => invoke('agent:open-source', id),
  updateWork: (kind, data) => ipcRenderer.send('work:update', kind, data),
  onSnapshot: (callback) => { ipcRenderer.on('agent:snapshot', (_, value) => callback(value)); },
  onSharing: (callback) => { ipcRenderer.on('work:sharing', (_, value) => callback(value)); },
  createWorkspace: (company, adminName, email, password) => invoke('workspace:create', company, adminName, email, password),
  addPerson: (name, role, department) => invoke('workspace:add-person', name, role, department),
  switchPerson: (id) => invoke('workspace:switch-person', id),
  importSources: (options) => invoke('workspace:import', options),
  importFolder: (options) => invoke('workspace:import-folder', options),
  updateSource: (id, action, priority, reason, supersedesId) => invoke('workspace:update-source', id, action, priority, reason, supersedesId),
  compareSources: (newId,oldId) => invoke('workspace:compare-sources',newId,oldId),
  removeSource: id => invoke('workspace:remove-source',id),
  requestClarification: question => invoke('workspace:request-clarification',question),
  resolveClarification: (id,reply,sourceId) => invoke('workspace:resolve-clarification',id,reply,sourceId),
  proposeSource: (id) => invoke('workspace:propose-source', id),
  openWorkspaceSource: (id) => invoke('workspace:open-source', id),
  readWorkspaceFile: (id) => invoke('workspace:read-file', id),
  saveApiKey: (service, value) => invoke('workspace:save-key', service, value),
  searchPublicWeb: (query) => invoke('agent:web-search', query),
  factCheckPublic: (query) => invoke('agent:fact-check', query),
  openWeb: (url) => invoke('agent:open-web', url),
  externalWindows: () => invoke('agent:external-windows'),
  shareExternal: (id, name) => invoke('agent:external-share', id, name),
  reviewExternal: () => invoke('agent:external-review'),
});
