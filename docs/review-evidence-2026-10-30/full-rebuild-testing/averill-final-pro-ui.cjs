// QA capture only: allow SVG image repaints to settle after native theme changes.
const {app}=require('electron');
app.on('web-contents-created',(_event,wc)=>{const capture=wc.capturePage.bind(wc);wc.capturePage=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,500));return capture(...args)};});
require('/Users/sararuffini/Documents/Hackatons/Nvidia/averill-ai/travel-desktop/scripts/verify-pro-ui.cjs');
