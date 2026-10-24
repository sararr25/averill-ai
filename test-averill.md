# Test Averill (about 5 minutes)

Averill checks your work against your company's approved rules and shows you the source. Everything here is fictional (the company Vamo, its people and its tools). Nothing is sent or posted.

**You need:** a Mac with Apple Silicon (M1 or newer) and Google Chrome.

## 1. Open Averill

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest) and unzip it.
2. Right-click `Averill.app` › **Open** › **Open**. The app is unsigned, so macOS asks once.
3. Click **Try the demo**. You are signed in as Emma from Marketing. No password is needed.

## 2. Add the Chrome extension

1. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose the `browser-extension` folder inside the app. To find it, right-click `Averill.app` › **Show Package Contents** › `Contents/Resources/app/browser-extension`.

## 3. Check a draft

1. In Chrome, open <https://averill-demo-sim.vercel.app/brevo> and open **Winter Escapes 2027 · launch draft**. It is wrong on purpose.
2. Click the Averill extension › **Connect this tab**, then approve the connection in Averill.
3. Click the email text, then **Ask Averill**. If asked what you are working on, choose **Email**.
4. Averill flags "lowest prices guaranteed" and the missing footer, and shows the approved company rule behind each one. Fix the text yourself and the warnings go away.

Press **Stop** in Averill at any time to end sharing.

**Also try:** <https://averill-demo-sim.vercel.app/linkedin> and <https://averill-demo-sim.vercel.app/instagram>.

## If something goes wrong

- **No "Try the demo" button:** Averill already has a company on this Mac. Quit Averill, move the folder `~/Library/Application Support/averill-ai-desktop` to the Trash, then reopen Averill.
- **After a restart:** pick any person on the sign-in screen. Demo accounts need no password.
- **Extension says "Averill is not reachable":** make sure the Averill you just downloaded is open (quit any older copy), then click **Connect this tab** again.
