# Test Averill as a Vamo employee — mini guide (18 October 2026)

You play a Vamo marketing employee who writes a winter campaign email and lets
Averill check it against the approved company rules. About 20 minutes. Everything is
fictional and local: no real email is sent, nothing is posted.

## 0. Before you start (once)

- Quit any Averill already running (Cmd+Q). Old copies like `dist/Averill 3.app` are stale: ignore them.
- Give your terminal app and Averill **Screen Recording** permission
  (System Settings › Privacy & Security › Screen Recording). Without it, window sharing fails
  with "Failed to get sources".
- Chrome with the Averill extension already installed (Extensions page shows "Selected-field
  browser companion"). On another Mac: Developer mode › Load unpacked ›
  `travel-desktop/browser-extension/`.

## 1. Open Averill

Packaged app (what a jury sees):

```bash
open ~/Documents/Hackatons/Nvidia/averill-ai/travel-desktop/dist/Averill-darwin-arm64/Averill.app
```

If macOS blocks it (unsigned app): right-click the app in Finder › Open › Open.

Developer version instead (always current code):

```bash
cd ~/Documents/Hackatons/Nvidia/averill-ai/travel-desktop && npm start
```

## 2. Sign in

Passwords are in `averill-ai/demo-login-documents/` (git-ignored, never share them). Open the
file for the person you want to be and copy Email + Password into the sign-in screen.

| Who | File | Role |
| --- | --- | --- |
| Demo Admin | `alex@vamo.example.md` | Owner / admin |
| Maya Jensen | `maya@vamo.example.md` | Marketing manager |
| Emma Larsen | `emma@vamo.example.md` | Marketing strategy employee |
| Oscar Lind | `oscar@vamo.example.md` | Content creator |

Note: this prepared workspace is still called **Aurelia Demo** (legacy name); the content and
documents inside are Vamo. For a clean "Vamo" company follow `docs/ONBOARDING_TUTORIAL.md`
(creates a fresh company from `travel-desktop/demo-company/vamo-intake/`).

Start as **Emma** (a normal employee).

## 3. Open the fake Brevo (the email tool)

```bash
cd ~/Documents/Hackatons/Nvidia/demo-social-simulator && npm install && npm run dev
```

In Chrome open `http://localhost:5173/brevo`. Open the **Winter Escapes** draft. It is wrong
on purpose: it says "lowest prices guaranteed", targets a too-broad audience and has no Vamo footer.

## 4. Let Averill check the email

1. Averill › **Work** › **Share one browser draft field** › **Start browser pairing** › **Copy pairing details**.
2. In the Brevo tab click the extension icon, paste, **Share this tab**, then click the email body.
3. Expect: the live bar shows "Brevo · Email body" and Review says something like
   "2 corrections. Edit in your own tool, then recheck." Each finding starts with one plain
   sentence and links to the approved source.
4. Click a finding's source: you see the exact approved passage.

Alternative without the extension: Work › choose the Chrome window › read › **Check approved rules**.

## 5. Fix it yourself and recheck

1. In Brevo replace "lowest prices guaranteed" with "Discover curated winter city breaks" and add the
   required footer text shown in the finding.
2. Pause typing ~1 second (or "Read and recheck locally" for windows). The fixed findings disappear.
3. Do **not** press Send now / Schedule (it is fake anyway, but stay clean for the demo).
4. Press **Stop** (in Averill, the floating button or the extension). Sharing and observation clear.

## 6. NVIDIA / Nebius part (live AI)

With company AI on (admin setting), the review can ask NVIDIA Nemotron via Nebius. Averill asks
for consent first and shows the model name on the result. Say No once: it must stay local.
Proof without the UI:

```bash
cd ~/Documents/Hackatons/Nvidia/averill-ai && npm --prefix travel-desktop run verify:nebius -- --synthetic-consent
```

## 7. Learn and Knowledge

- **Learn**: start the Canva lesson, ask for help on a step, confirm a step. "Your week" records it.
- **Knowledge**: open approved sources, see version/approval, search a phrase.

## 8. Check the roles (switch people)

Sign out › sign in as **Maya**: she can approve Marketing sources, cannot see the people roster.
Sign out › **Demo Admin**: Setup, Account access, Knowledge › Company rules › Public rule checks
("Check automatically once a week" is off by default). Setup › Public website should flag the
price guarantee on Vamo's public page `https://vamo-travel-site.vercel.app/winter.html`
(local copy: `npm --prefix travel-site start`, `http://127.0.0.1:4173/`). Don't expect the "all European subscribers" audience to be flagged by AI.

Sign out › Emma again: her Learn history is hers only. Quit and reopen: you must sign in again.

## What counts as a bug

Write down: what you did, what you expected, what happened, a screenshot. Typical things to
watch: text that is jargon, buttons that do nothing, a finding that does not go away after the
fix, sharing that keeps running after Stop, another person's data visible.

## Automatic checks (optional, developer)

```bash
cd ~/Documents/Hackatons/Nvidia/averill-ai/travel-desktop && npm test && npm run verify:ui-e2e
```
