// Feedback round 27 October, phase B: one stylesheet, light and dark themes, readable contrast and sizes.
// PHASE_B_CAPTURE=<dir> only writes per-tab screenshots (used to prove a refactor renders identically).
const {app,BrowserWindow,dialog}=require('electron');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const profile=fs.mkdtempSync('/tmp/averill-phase-b-');app.setPath('userData',profile);
const capture=process.env.PHASE_B_CAPTURE;const shots=capture||path.resolve(root,'../docs/screenshots/2026-10-27');fs.mkdirSync(shots,{recursive:true});
const fixture=path.join(profile,'company-guide.txt');fs.writeFileSync(fixture,'Company knowledge: cobalt palette and weekly planning.');
dialog.showOpenDialog=async()=>({canceled:false,filePaths:[fixture]});
require(path.join(root,'main.js'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const TABS=['todo','review','knowledge','learn','research','setup'];
// Every visible text node: its rendered colour against the first opaque background behind it, and its font size.
const AUDIT=`(()=>{const parse=c=>{const m=c.match(/[\\d.]+/g);return m?m.map(Number):[0,0,0,0]};const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};const lum=([r,g,b])=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b);
 const bg=e=>{const stack=[];for(let n=e;n;n=n.parentElement){const c=parse(getComputedStyle(n).backgroundColor);const a=c.length>3?c[3]:1;if(a>0)stack.push([c,a]);if(a>=1)break;}let out=[255,255,255];for(const [c,a] of stack.reverse())out=out.map((v,i)=>c[i]*a+v*(1-a));return out};
 const out=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 for(let t;t=walker.nextNode();){const e=t.parentElement;if(!t.textContent.trim()||!e.checkVisibility({contentVisibilityAuto:true,opacityProperty:true,visibilityProperty:true}))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(e.closest('[aria-hidden=true],button:disabled,.visually-hidden'))continue;
  const s=getComputedStyle(e);let fg=parse(s.color);const b=bg(e);if(fg.length>3)fg=fg.slice(0,3).map((v,i)=>v*fg[3]+b[i]*(1-fg[3]));const L1=lum(fg),L2=lum(b);const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  out.push({text:t.textContent.trim().slice(0,40),size:parseFloat(s.fontSize),weight:+s.fontWeight,ratio:Math.round(ratio*100)/100});}
 return out})()`;
app.whenReady().then(async()=>{try{
 let win;for(let i=0;i<100;i++){win=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('agent.html'));if(win&&!win.webContents.isLoading()&&await win.webContents.executeJavaScript('Boolean(window.desktop)'))break;await pause(100);}
 const run=js=>win.webContents.executeJavaScript(js);const shot=async name=>fs.writeFileSync(path.join(shots,name),(await win.webContents.capturePage()).toPNG());
 await run("window.desktop.createWorkspace('Phase B Test','Owner','owner@example.test','Synthetic-password-123')");await pause(300);
 await run("(async()=>{current=await window.desktop.snapshot();render();})()");await pause(200);
 await run("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Skip'&&b.offsetParent)?.click()");
 await run("(async()=>{current=await window.desktop.learningAction('start',{});current=await window.desktop.importSources({department:'Marketing',version:'1'});render();document.getElementById('operation-dismiss').click()})()");await pause(300);
 win.setSize(560,900);await pause(200);
 win.webContents.debugger.attach('1.3');
 const report=[];
 for(const scheme of ['light','dark']){
  await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:scheme},{name:'prefers-reduced-motion',value:'reduce'}]});await pause(150);
  for(const tab of TABS){
   await run(`showTab('${tab}');document.querySelector('.agent-main').scrollTop=0`);await pause(150);await shot(`${scheme}-${tab}.png`);
   await run("document.querySelector('.agent-main').scrollTop=1e6");await pause(80);await shot(`${scheme}-${tab}-end.png`);
   if(capture)continue;
   for(const item of await run(AUDIT)){const large=item.size>=18.66||(item.size>=14&&item.weight>=700);const need=large?4.5:item.size>=15?7:4.5;
    if(item.ratio<need)report.push(`${scheme}/${tab}: contrast ${item.ratio} < ${need} for "${item.text}" (${item.size}px)`);
    if(item.size<13)report.push(`${scheme}/${tab}: ${item.size}px text "${item.text}"`);}
  }
 }
 // Every tab is fully inside the window and no two tabs overlap, at the narrowest supported width.
 for(const width of [440,560]){win.setSize(width,900);await pause(200);const nav=await run("(()=>{const els=[...document.querySelectorAll('.agent-nav>button,.agent-nav>.nav-more>summary')].map(e=>[e.textContent.trim(),e.getBoundingClientRect()]);const bad=[];for(const[t,r]of els)if(r.left<0||r.right>innerWidth+0.5)bad.push(t+' clipped');for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i][1],b=els[j][1];if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)bad.push(els[i][0]+' overlaps '+els[j][0]);}return bad})()");
  for(const problem of nav)report.push(`nav at ${width}px: ${problem}`);}
 win.webContents.debugger.detach();
 if(capture){console.log('CAPTURED '+shots);app.quit();return;}
 assert.deepEqual(report,[],'Readability problems:\n'+report.join('\n'));
 console.log('PASS phase B: every visible text in light and dark is at least 13px and meets 7:1 body / 4.5:1 small and large contrast. Screenshots in '+shots);app.quit();
}catch(error){console.error(error.stack);app.exit(1);}});
