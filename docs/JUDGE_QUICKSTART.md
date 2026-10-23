# Try Averill in 3 steps (about 3 minutes)

Everything is fictional: the company (Vamo), the people and the email tools. Nothing is sent or posted.

**No time to install anything?** Watch the demo video instead (link in the submission).

> Maintainer note: the one-click **Judge demo** button exists in the source from commit `9c35e36`. The published release ZIP predates it, so run `npm run package:release` and publish a new release before sending this guide to judges.

## Requirements

A Mac with Apple Silicon (M1 or newer) and Google Chrome. No Node.js, no terminal, no localhost.

## 1. Open Averill and start the judge demo

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest) and unzip it.
2. Right-click `Averill.app` › **Open** › **Open** (the app is unsigned, so macOS asks once).
3. Click **Try the demo**. You are signed in as Emma, a Vamo marketing employee, with the company rules already approved. After a restart, pick any person on the sign-in screen: demo accounts need no password.

## 2. Open the online email tool

Open <https://averill-demo-sim.vercel.app/brevo> in Chrome and open the **Winter Escapes 2027 · launch draft**. It is wrong on purpose ("lowest prices guaranteed", no required footer).

Also available: <https://averill-demo-sim.vercel.app/linkedin> and <https://averill-demo-sim.vercel.app/instagram>.

## 3. Let Averill check the draft

1. Chrome › Extensions › turn on **Developer mode** › **Load unpacked** › choose the `browser-extension` folder inside the app (right-click `Averill.app` › Show Package Contents › `Contents/Resources/app/browser-extension`).
2. On the email tab click the Averill extension › **Connect this tab**, approve the prompt in Averill, then click the email body. If asked for the work type, choose **Email**.
3. Averill shows **2 corrections**, each with the approved company passage that backs it. Fix the text yourself and the findings disappear.

Press **Stop** in Averill at any time to end sharing.

## If something does not work

- The Judge demo button only appears on a fresh install. If Averill already has a company, it asks you to sign in instead; to start over, quit Averill, delete the folder `~/Library/Application Support/averill-ai-desktop` and reopen it.
- Without the extension: in Averill › Work, choose the Chrome window and **Check approved rules** (needs Screen Recording permission).
