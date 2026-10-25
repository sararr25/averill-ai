# Feedback spec — 25 October 2026

Source: owner test feedback, 25 October 2026 (written in Italian, translated here). "Tavoli" in the feedback means Tavily. Each ticket is done only when its acceptance list is met and verified by running the app or the tests, not by reading code.

Paths: `demo-tools/social-simulator` is the simulator, `travel-desktop` is the desktop app, and `travel-desktop/browser-extension` is the browser extension.

Order: A and D first (no owner decision needed), then B after D1, then C, then E, then F last.

## What the feedback means

| # | Feedback (plain English) | Cause found in code |
| --- | --- | --- |
| 1 | The demo email does not look like a real email. | `demo-tools/social-simulator/src/components/brevo/BrevoCampaignSetup.tsx:39` renders a brand row, subject heading, paragraphs and sign-off. There is no button, no unsubscribe link and no footer address. The preheader appears only in the inbox preview (line 34). |
| 2 | The extension disconnects at random. | `travel-desktop/browser-extension/content.js:95` treats a hidden tab (switching tab, or Averill covering Chrome) as Stop. `content.js:96` treats `pagehide` (reload or navigation) as Stop. `travel-desktop/src/browser-bridge.js:14` sets a 15 second idle timeout. `travel-desktop/browser-extension/background.js:54-58` deletes the pair after one failed 4 second request, with no retry. Trust is kept in memory only (`travel-desktop/src/browser-connect.js:9`), so an app restart or sign-out ends it. `travel-desktop/browser-extension/README.md` line 18 says that hiding the window stops sharing on purpose. |
| 3 | There is no clear sign that the connection works. | The popup does not reload its state, so it is blank when reopened. The in-page card disappears silently when the connection drops (`content.js` calls `host.remove()` on stop). The desktop shows the same "No external work shared." message for every end reason. |
| 4 | LinkedIn and Instagram do not always connect. | Sharing works only in the top frame (`background.js:25,38`). The selector misses `role=textbox`, plain-text-only editors and shadow roots. The exclusion regex at `content.js:23` includes "personal". If the single-page app replaces the node, `content.js:104` stops sharing. Only the Vamo simulator has been tested. Real sites are unverified. It is also unverified whether the simulator fields are textarea or contenteditable. |
| 5 | Ask Averill only checks things, and you cannot type a question. | The card has no input box (`content.js:81`). `background.js:30-38` allows only `review`, `proposal` and `open`. `travel-desktop/main.js:71-78` rejects everything else. The desktop already has Q&A: `travel-desktop/src/workspace-answer.js` (`answerWorkspace`), called from `main.js` around line 642 through `agent:ask`. |
| 6 | There is no check of photos. | The extension reads only the text of one field (`content.js:16-26`). There is no vision model (`nebius.js:30-33` picks text models only, such as Nemotron). macOS OCR already exists (`travel-desktop/scripts/extract-text.swift`). |
| 7 | There is no check of hashtags. | There is no hashtag rule kind (`rules.js:9`). The Vamo pack has no hashtag guidance (a search for "hashtag" finds nothing). |
| 8 | The copy uses AI-style dashes. | Em dashes appear in `social-posts.ts` (7), `brevo-campaigns.ts` (8 in copy), `flawed-drafts.json` (6) and the three story SVGs (1 each). |
| 9 | Tavily is barely visible and is not in the extension. | The contextual review path does not call Tavily (`contextual-review.js:12-16`). The judge server endpoint `/api/search` exists but nothing calls it. Public claims appear only in the desktop app (`agent.js` around line 591). |
| 10 | The UI is messy, with no hierarchy, oversized buttons and uneven spacing. | `agent.html:2` loads 7 stylesheets, and the same selectors appear in 3 to 5 files. `guided-ui.css:5` sets a minimum height of 40px on every button. Primary buttons are 44px. Extension buttons are 44px, full width, pill-shaped. No companion `--av-space` tokens are used, and there are about 420 hard-coded spacing values in pixels. |
| 11 | Review items should sit in a "To do" section with my open tasks. | There is no To do or inbox section. Items are spread across Current work, Library (approval and clarification requests) and Learn. `judge-demo.js` seeds no task list. |
| 12 | The Canva part is missing from the test. | There is no Canva route or fixture in the simulator, and no half-finished Instagram design. Nothing checks contrast or safe zones. The Canva adapter (`travel-desktop/browser-extension/editor-adapter.js`) reads and edits one paragraph of text only. |

## Decisions for the owner

Owner answer, 25 October 2026: D1, D3 and D4 approved as recommended. D2 mock rejected; use the real Canva editor (see D2).

**D1. Connection length: "Stay on until I turn it off". APPROVED: recommended option.**
Current rules (AGENTS.md): sharing is ephemeral, trust is kept in memory only, it is revoked on logout or restart, the tab and origin are bound exactly, and only activeTab is used.
Recommended: "On for the whole signed-in session". It stays connected across tab switches, Averill covering Chrome, idle time, reloads of the same page and transient errors. It ends only on Stop, sign-out, Averill quit, closing the tab, or navigating to another site. This fits the rules except that it changes the documented "hiding stops" behavior, so AGENTS.md and the extension README must be updated with owner approval.
Alternative: keep trust across Averill and Chrome restarts too. This needs persisted trust and broader host permissions, breaks two AGENTS.md rules, and is not recommended.

**D2. Canva test: how to test the design step. DECIDED: real Canva (owner, 25 October 2026). The simulator mock is rejected.**
Research of 25 October 2026 (official docs, re-check before building):
- The Canva Apps SDK can read the real page (text, text color, font size, position, page size, background fill) through `openDesign`, but that API is preview and "may change without warning" (https://www.canva.dev/docs/apps/api/beta/design-open-design). It cannot read the photo pixels under a text box, it has no documented change events (only polling, 10 calls per 10 seconds), it cannot block export, and it cannot call `127.0.0.1`, only HTTPS (https://www.canva.dev/docs/apps/content-security-policy). A development app is likely visible only to our own account or team (unconfirmed), so judges on their own Canva could not use it.
- The Canva Connect API reads only design metadata and exports, not elements. It can import a PDF or PPTX into a design (https://www.canva.dev/docs/connect/api-reference/design-imports/).
- The Chrome extension can take a screenshot of the visible Canva tab with `chrome.tabs.captureVisibleTab` under the existing `activeTab` permission, after the user clicks the extension (https://developer.chrome.com/docs/extensions/reference/api/tabs), at most 2 per second.
Recommended: the extension route. Judges already install the extension, it works on any Canva account and plan, and the check stays local: the screenshot goes to the Averill desktop app over the existing loopback bridge, the existing macOS OCR finds the text and its boxes, and code computes the contrast between text and background pixels and the position against the Instagram safe zones. Averill warns with a blocking card in the page (per D4 it cannot stop Canva's own export or share). This changes two AGENTS.md rules (screenshots of the shared tab, and visual-geometry checks on Canva), which the owner approves with this decision.
Stretch (only if time allows): a Canva app in development preview that reads exact text and colors with `openDesign`, as a second opinion for solid backgrounds.

**D3. Photo check: how to check images. APPROVED: recommended option.**
Recommended: local checks first. Check that an image is present, that it has alt text, its aspect ratio and size for each platform, and the text inside it (read with the existing macOS OCR and checked against approved rules). A vision model description is optional, and only if Nebius offers one (verify first).
Alternative: none needed now. The vision option stays out unless approved.

**D4. Blocking: what "block" means. APPROVED: recommended option.**
Recommended: Averill shows a blocking card and disables Export and Schedule only inside our own simulator pages. On real sites it can only warn. It never submits, publishes or edits without approval.
Alternative: none needed now.

## Index

| Key | Title | Block | Blocked by |
| --- | --- | --- | --- |
| FB-01 | Real-looking Brevo email | A | none |
| FB-02 | Realistic social posts with images | A | none |
| FB-03 | No AI-typical dashes | A | none |
| FB-04 | Extension stays connected for the signed-in session | B | D1 |
| FB-05 | Clear connection status and onboarding | B | D1 |
| FB-06 | LinkedIn and Instagram reliability | B | none |
| FB-07 | Type a question in Ask Averill | C | none |
| FB-08 | Photo check | C | D3 |
| FB-09 | Hashtag rules | C | none |
| FB-10 | Tavily double check in the extension | C | none |
| FB-11 | To do section | D | none |
| FB-12 | UI hierarchy, button sizes and spacing | D | none |
| FB-13 | Real Canva: starting post and capture spike | E | none |
| FB-14 | Live Canva design checks with a blocking card | E | FB-13, FB-04 |
| FB-15 | Update judge guide and release | F | FB-01 to FB-14 as shipped |

## FB-01 — Real-looking Brevo email

Files: `demo-tools/social-simulator/src/components/brevo/BrevoCampaignSetup.tsx`, `demo-tools/social-simulator/src/services/brevo-campaigns.ts`, `demo-tools/social-simulator/src/types/brevo.ts`.

The preview shows an inbox header (sender name and address, recipient, subject, preheader), a logo header, a hero image, a headline, two or three sections with subheadings, one call-to-action button, a sign-off, and a footer with a company address, a "Why you get this email" line, and Unsubscribe and Manage preferences links. All roughly 8 campaigns get sections and a call-to-action. The planted flaws from JD-06 (`flawed-drafts.json`) stay in place and are still caught by the flaw-matrix test.

Accept:
- The simulator build passes.
- The existing Brevo schedule test passes.
- A screenshot of the `/brevo` preview taken in the browser.
- The flaw-matrix test passes.

## FB-02 — Realistic social posts with images

Files: `demo-tools/social-simulator/src/services/social-posts.ts`, `demo-tools/social-simulator/src/data/flawed-drafts.json`, and the LinkedIn and Instagram components.

Every published post and every draft shows an image. Use a photo style where possible, and use the existing `public/vamo` assets or new royalty-free or locally generated images with a credit. Captions use realistic hashtags: 3 to 8 on Instagram and 1 to 3 on LinkedIn. Drafts in the composer show the attached image.

Accept:
- Each post renders with its image at `/linkedin` and `/instagram` (screenshots).
- No broken image requests appear in the console.

## FB-03 — No AI-typical dashes

Files: `demo-tools/social-simulator/src/services/social-posts.ts`, `demo-tools/social-simulator/src/services/brevo-campaigns.ts`, `demo-tools/social-simulator/src/data/flawed-drafts.json`, the three story SVGs, and any Vamo source pack text shown in the demo or in Averill copy shown to judges.

Replace every em dash, en dash and spaced hyphen used as a dash with commas, periods, colons or parentheses.

Accept:
- A new test fails if an em dash or en dash appears in the demo copy files, and it passes.
- A grep for dashes in the listed files returns 0.

## FB-04 — Extension stays connected for the signed-in session

Files: `travel-desktop/browser-extension/content.js` (lines 95 to 96), `travel-desktop/browser-extension/background.js` (lines 54 to 58), `travel-desktop/src/browser-bridge.js` (line 14), and the bridge setup in `travel-desktop/main.js`.

Depends on D1. A hidden tab pauses sharing and it resumes when the tab is visible again, with no Stop. The idle timeout is raised (for example to 10 minutes with a heartbeat), or the connection lasts the whole session. Transient relay failures are retried (for example 3 tries with backoff) before the connection is dropped. Reloading the same tab on the same origin, or a single-page navigation, reconnects without a new approval. If activeTab requires a click on the extension icon, document that exactly. The connection ends only on Stop, sign-out, quit, closing the tab, or navigating to another origin. Update the AGENTS.md ephemeral rule and `travel-desktop/browser-extension/README.md` line 18 after owner approval. Keep the token, tab, origin and sequence checks, memory-only trust, and add no new host permissions.

Accept:
- Unit tests cover pause and resume, retry and idle timeout.
- Manual run in installed Chrome: connect, switch tabs for 2 minutes, cover Chrome with Averill, come back, and the connection is still active.
- Reloading reconnects.
- Stop ends the connection.
- Screenshots of each step.

## FB-05 — Clear connection status and onboarding

Files: the extension popup, the in-page card in `travel-desktop/browser-extension/content.js`, and the Current work screen in the desktop app.

The popup reads the current state every time it opens and shows one of: "Connected to <site>", "Not connected", or "Waiting for approval in Averill", with one primary action. The extension icon badge shows ON or is empty. The in-page card header shows a status pill "Connected to Averill". When the connection ends, the card shows why (stopped by you, signed out, Averill closed, page changed) with a Reconnect action, instead of disappearing. The desktop Current work screen shows a 3-step checklist: 1 extension installed, 2 tab connected, 3 field selected. The checklist ticks live and shows the end reason.

Accept:
- Every end reason has its own message, covered by unit tests.
- A manual run shows the badge and the status pill.
- A first-time tester connects by following only the judge guide steps.

## FB-06 — LinkedIn and Instagram reliability

Files: the sharing and field selector code in `travel-desktop/browser-extension/content.js` (including the exclusion regex at line 23 and the self-stop at line 104).

First reproduce the problem on `averill-demo-sim.vercel.app/linkedin` and `/instagram`, and record which step fails: field type, selector, exclusion regex, or node replacement. Then fix it. Support `role=textbox` and `contenteditable="plaintext-only"`. Narrow the "personal" exclusion so post fields are not excluded. When the single-page app replaces the node, find the selected field again by a stable identity instead of stopping. Testing on real linkedin.com or instagram.com is read-only, and only if the owner agrees. Never claim support without evidence.

Accept:
- The connection succeeds 10 out of 10 times on each simulator page in installed Chrome, with a log.
- Unit tests cover the new field kinds.
- Evidence screenshots.

## FB-07 — Type a question in Ask Averill

Files: `travel-desktop/browser-extension/content.js`, `travel-desktop/browser-extension/background.js` (whitelist and payload), `travel-desktop/main.js` (`onRequest`), `travel-desktop/src/workspace-answer.js` (`answerWorkspace`).

Add a question box to the in-page card ("Ask about this draft or company rules"). Add a new bridge kind `ask` to the background whitelist and payload, and route it in `main.js` onRequest to `answerWorkspace`. The selected field is passed as optional context. Keep the credential block, exact-quote citation validation, the 24000-byte cap, and plain-text rendering. Every answer shows its source citation.

Accept:
- A unit test for the `ask` kind: allowed, credential request refused, citation validated.
- Manual check: ask "Can we say lowest prices guaranteed?" on the LinkedIn draft and get a cited answer.

## FB-08 — Photo check

Files: the extension (`travel-desktop/browser-extension/`), the simulator images, and the flaw matrix from JD-06.

Depends on D3. The extension reads images attached to the shared field's composer (source URL, alt text, natural size) only after the employee clicks "Check images too". Local checks: the image is present, it has alt text, its aspect ratio fits the platform (Instagram 4:5, 1:1 or 9:16; LinkedIn 1.91:1), and the text inside the image is read by OCR and checked against approved rules. Image bytes stay on the device unless the D3 vision option is approved. Plant one flawed image in the simulator, for example a winter graphic with "lowest prices guaranteed" printed on it.

Accept:
- The flaw matrix is extended with the image flaw, and its test passes.
- A manual run shows the image finding with its source citation.

## FB-09 — Hashtag rules

Files: the Vamo pack (Marketing social-media guidelines v2), `travel-desktop/rules.js` (rule kinds), and `travel-desktop/src/contextual-review.js`.

Add approved hashtag guidance to the Vamo pack: a required brand tag, a maximum count per platform, banned tags, and a rule that a paid Reel must carry #ad or the paid-partnership label. Add a rule kind, or extend the required-text and claim checks, so that hashtags are parsed from captions. Plant a hashtag flaw in a draft.

Accept:
- The flaw-matrix test covers the hashtag flaw.
- The corrected draft produces no finding.

## FB-10 — Tavily double check in the extension

Files: the extension card, `judge-demo` server endpoint `/api/search` (already exists, not used), and `travel-desktop/src/tavily.js`.

After a review, the card lists the public claims it found (price, date, event) with a "Double-check online (Tavily)" button. The card shows the exact text that will leave the device. The user can untick items, then confirms. The request goes through the judge server `/api/search` in the demo workspace, or through the local key otherwise. Keep the `outbound()` guards in `tavily.js`. Results are labelled "Public check, not company approval", with a source link and a snippet. The snippet must appear in the returned content, otherwise the result shows "Unclear". Make Tavily use visible in the desktop app too, as an activity entry "Checked online with Tavily".

Accept:
- Unit tests for the confirm gate and the snippet validation.
- A manual run on the Brevo draft shows at least one Tavily result with a link.
- The server usage counter goes up.

## FB-11 — To do section

Files: `travel-desktop/src/agent.html` (navigation), `travel-desktop/src/judge-demo.js` (seed tasks), and the guide steps in `guide-ui.js`.

A new first tab "To do" in the navigation, with a count badge. It is one place, grouped in two parts. "Needs your review" holds current findings, source approval requests, clarification requests and private proposals waiting for you. "Your tasks" holds work assigned to the signed-in person. Seed tasks per role in `judge-demo.js` for Emma, Maya and Alex. Each item shows a title, its origin, a due date or age, and one action button that opens it. Done items leave the list. The list is scoped to the signed-in person.

Accept:
- Tests for per-person scoping.
- The judge demo test is extended with tasks.
- A manual check with each of the three demo logins.
- The guide steps in `guide-ui.js` point to To do.

## FB-12 — UI hierarchy, button sizes and spacing

Files: the stylesheets used by the desktop app and the extension popup and card, including `guided-ui.css` (line 5).

Use the tokens in `travel-desktop/design-system/companion/FOUNDATION.md`. Each section has one primary button. Other actions are secondary buttons or text links. Button sizes: default 32px, small 28px, primary 36px. No full-width buttons, except the extension card's single main action (36px, not pill-shaped). Remove the global 40px minimum height at `guided-ui.css:5`. Use a clear type scale: page title, section title, field label, help text. Group fields in cards with consistent `--av-space` spacing. Consolidate duplicate selectors so that each control is styled in one file. The popup and the in-page card use the same sizes.

Accept:
- `verify:accessibility` passes, and the WCAG 2.2 minimum target size of 24px is kept.
- Before and after screenshots of To do, Current work, Library, Learn, Setup and the extension card, at 520 and 960 pixel widths.
- `npm test` passes.

## FB-13 — Real Canva: starting post and capture spike

Files: none in code yet. Output: a short note in `docs/` with findings and screenshots.

Two parts.
1. Starting design. Make a half-finished Instagram post (1080 by 1350) in the owner's real Canva account: Vamo photo, finished headline, an empty body text box to complete. Share it as a Canva template link so each judge gets their own copy. If a file is needed instead, export it as PDF or PPTX, which Canva imports. Use Vamo brand assets only, not Averill ones.
2. Spike in installed Chrome on that design, before any build: confirm `captureVisibleTab` works after one click on the extension with only `activeTab`; find how to locate the design page frame on screen (a stable DOM element and its rectangle, or a fallback such as the user dragging a frame once) at normal zoom and after zoom changes; run the macOS OCR on a capture and check that text boxes line up; measure how long one capture plus analysis takes.

Accept:
- The template link opens a fresh copy for a second Canva account (tested).
- The spike note states, with evidence, which parts work and which do not. If the page frame cannot be found reliably, the note proposes the fallback and FB-14 is updated before coding.

## FB-14 — Live Canva design checks with a blocking card

Files: `travel-desktop/browser-extension/background.js`, `content.js`, `manifest.json` (no new permissions), the bridge in `travel-desktop/src/browser-bridge.js` and `travel-desktop/main.js`, a new local design-check module in `travel-desktop/src/`, `travel-desktop/scripts/extract-text.swift` if text boxes are needed, and a Vamo brand or social guideline in `travel-desktop/demo-company/vamo/Marketing/` (imported and approved in the workspace; not the Vamo website design system).

Depends on FB-13 and FB-04. After the employee clicks Connect on the Canva tab and turns on "Watch my design", the extension captures the visible tab after an edit pause (at most once every 2 seconds, never while Averill is not connected) and sends it over the authenticated loopback bridge. Averill checks, locally: text contrast against the background (WCAG AA: 4.5:1 for normal text, 3:1 for large text; pistachio green on a light background fails), whether text sits inside the Instagram safe zone, and the approved-copy rules on the OCR text. Use Instagram's published safe margins (confirm the exact values before coding) and cite the approved Vamo guideline, instead of guessing pixel values. Add the contrast and safe-zone rules to that guideline so every finding cites an approved source. On a failure the in-page card shows a blocking warning ("Fix before you export") with the source, and stays until the problem is fixed or the employee chooses "Export anyway". Averill never edits, exports or shares the design. Screenshots stay on the device, are not stored, and are dropped after the check.

Accept:
- Unit tests for the contrast calculation, the safe-zone bounds and the mapping from screen pixels to design pixels.
- Bridge tests: capture refused when not connected, when the tab or origin does not match, or after Stop.
- Manual run in installed Chrome on the FB-13 copy: pistachio text on the light area triggers the block, dark text clears it; text dragged outside the guides triggers the block; a forbidden claim typed in the text box triggers a finding with its source. Screenshots of each.
- AGENTS.md and `travel-desktop/browser-extension/README.md` updated to describe the approved screenshot and geometry check, and its limits (visible area only, accuracy depends on OCR).

## FB-15 — Update judge guide and release

Files: `test-averill.md` (permanent judge guide), `docs/HANDOVER.md`.

Update `test-averill.md` with the new connection steps, To do, typed questions, image and hashtag checks, the Tavily double check, and the Canva step. Update `docs/HANDOVER.md`. Run the full `npm test`, the simulator build, and a packaged app run.

Accept:
- Every step in `test-averill.md` is run once on a clean demo profile, with screenshots.
- Any failures are listed, not hidden.

## Out of scope and risks

- Real LinkedIn, Instagram and Canva support stays unverified until it is tested. Never claim it.
- No automatic publishing, sending or editing beyond the existing Apply rules.
- Vision model availability on Nebius is unverified.
