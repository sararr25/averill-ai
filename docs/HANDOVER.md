# Feedback round, 28 October 2026: built

**State:** merged to `main` (PR #57, `f95a046`). Production updated: averill-demo-sim (new drafts) and averill-judge-ai (`POST /api/ask` answers 400 to an empty request, so the route exists; no real question sent). Release ZIP built locally only: `travel-desktop/dist/Averill-macOS-arm64.zip`, SHA-256 `a490e5eb7d0465f7227ed914903b7482e2515c0b476903433317cb47e08514d5`, `verify:release` PASS (234 files, 3224 entries). No GitHub release published (owner's word only).

**Owner test as a judge:**
1. Unzip, open `Averill.app`.
2. To see the judges' first run, quit Averill and rename `~/Library/Application Support/averill-ai-desktop` temporarily (it is already a Try-the-demo workspace; backup also in `averill-ai-desktop-backup-2026-10-28`).
3. Follow `test-averill.md`. Section 5 template link is still a placeholder: use the carousel "Copenhagen" (DAHZTPxfC5c).
4. Reload the Chrome extension from `Averill.app/Contents/Resources/app/browser-extension`.

**About the keys:** `averill-secrets.enc.json` is encrypted with the macOS keychain item of the app, so only Averill can open it; it was copied but never decrypted in a run. The demo does not need it: in the demo workspace Check now and the question box go through the judge server.

**Not tested (read before claiming anything):**
- The packaged ZIP was built and integrity-checked, but not opened and clicked through (no first run, sign-in, Learn, Canva lesson in the packaged app). The single-instance lock was tested only with dev Electron.
- The Chrome extension in real Chrome: the card's minimise, drag, light/dark, tutorial panels and design-card questions were tested only on the synthetic Canva page. The 72 px top offset was not checked against Canva's real top bar.
- Only the reader was tested live (read-only) on canva.com: all 5 carousel slides read. The full card flow (Watch my design, "Checked X of 5", Fix before you export, Export anyway) was not run on real Canva.
- No real Nemotron or Tavily call this round: `/api/ask` exists in production but no question was answered live; the app's question box was tested in outage mode only.
- Whether the copied keys decrypt (see above).
- T4 drafts: checked on the preview deploy (no broken images, no console errors, Brevo button to winter.html). The Averill image and field checks were not run against these new drafts on the live site; the flaw-matrix unit tests pass on the new files.
- Learn on the owner's real profile copy: migration checked at data level only (accounts have passwords, so no screenshot).
- VoiceOver; the card follows Chrome's `prefers-color-scheme`, which follows macOS only if Chrome is set to the system theme.
- `tests/image-check.test.js` "bridge accepts up to 6 MB" fails intermittently; it also fails on `0357f12` (before this round), so it is not caused by this work, but it is not fixed.
- Instagram image sizes were matched against search summaries, not Instagram's own help pages (JavaScript-only pages).
- Group step: the lesson text still says Command+G; Canva's help only mentions the toolbar Group button.

**Carousel:** built by the owner from a template, texts and photos replaced via the Canva connector (all Unsplash, taken in Copenhagen; credits: Ezgi Deliklitas, Jacco Rienks, nika tchokhonelidze, William V, Tanya Prodaan, Annie Spratt). Owner decision: the contrast/margin problems found on slides 1 and 2 stay as judge findings; the guide says so. The owner may set Fraunces / DM Sans fonts by hand (the connector cannot set fonts).

**Done (all verified by script, synthetic unless marked live):**
- T3 pill shows SHARING: <host> / WINDOW / NOT SHARING; single-instance lock. T1.2 AI pill states and Workspace settings copy. T2.1 to T2.3 one focus ring, solid pills, focus check in verify-phase-b.
- T1.1 (live, owner's Mac): stale 25 October Averill (pid 20011) quit; profile backed up to `averill-ai-desktop-backup-2026-10-28`; `averill-secrets.enc.json` copied from the 25 October backup. Decryption not yet confirmed: open Averill as Alex and check the AI pill; if it says "add a key", paste the keys again.
- T1.3 demo question box asks Nemotron through the judge server (`POST /api/ask`, new) after consent; local answer always shown. Route NOT deployed (deploys from main).
- T4 drafts with credited Unsplash photos (`demo-tools/social-simulator/public/vamo/photos/CREDITS.md`), live Vamo links, LinkedIn composer without duplicate image. Not deployed.
- T5.1 reader (live, read-only on canva.com): soft line breaks, rotated text, groups, SVG clip paths; carousel checked slide by slide ("Checked X of 5"). Real starting carousel DAHZTPxfC5c ("Copenhagen", built from the owner's template, photos credited Unsplash). Owner decision: its existing contrast/margin problems on slides 1 and 2 stay as findings for judges.
- T5.2/T5.3 card minimise, drag, remembered position, light/dark per macOS, "How to do this in Canva" panels from Canva help pages, question box on the design card. T2.4 canvas #ecebf1.
- T6 font rules in social-media-guidelines-v3 (pending for Maya); design questions answered only from approved Design rule lines.
- T7 one-page visual weekly practice (4 question types, one submit, retry wrong), task exercises one page, pre-D1 sessions migrated.

**Checks (last runs):** npm test 243 (one existing flaky test, `image-check.test.js` 6 MB bridge, fails on `0357f12` too); verify phase-b, phase-c, contextual 20, canva-design 28, accessibility 10, guide 28, ui-e2e 23, feedback, demo-ai 10 all pass.

**Needs the owner:**
- Reload the extension in Chrome and run the card on the real carousel (only the reader was tested live; card UI only on the synthetic page).
- Confirm the keys decrypt (above).
- Canva template link for test-averill.md (placeholder stays), push/merge/deploy (simulator, judge server /api/ask), release.
- Open the T4 drafts on a preview deploy for the spec's screenshot check.

# Feedback round, 28 October 2026: planned, not started

**State (28 October):**
- `main` holds phases A to D1 (PR #55) and the updated judge guide (PR #56).
- Release `v0.1.0-judge.20261028` is published (ZIP SHA-256 `b02aaf25…e20d`).
- The owner tested it and reported 11 problems. All of them are ticketed in `docs/FEEDBACK_SPEC_2026-10-28.md` (T1 to T7, decisions Q1 to Q5). No code has been changed for them yet. Q1 to Q5 are answered (see the spec). Next session: follow the spec's "Order of work".
- **Learn test (owner, 27 and 28 October; T7.0):** the weekly test must be interactive, multiple choice and visual. Every question has an image or illustration, answers can be pictures, and there is tap-the-spot and put-in-order. Everything is on one page with one submit and one confirmation. Show an inline mockup of 3 question types in chat before building. Text-box reflections and per-question buttons are what the owner rejected.

**Facts found while writing the spec (28 October):**
- **Nebius/Tavily "off":** the current profile `~/Library/Application Support/averill-ai-desktop` is a Try-the-demo workspace without `averill-secrets.enc.json`. The keys from before are only in `averill-ai-desktop-backup-2026-10-25/`. Keys can be added as Alex in More › Workspace settings (admin only). The question box has no judge-server route, so it says "key needed" even in the demo.
- **Two Averill copies were running:**
  - the new one (opened 28 October, holds port 43147);
  - one from 25 October (pid 20011), whose app folder had already been deleted.
  The owner should quit the old one. The app has no single-instance lock (ticket T3).
- **"NOT SHARING" while Chrome is connected:** the header pill ignores the browser connection (`agent.js:142`).
- **Learn "unchanged":** D1 changed only the Canva lesson. The weekly practice and the task exercises still confirm per question and per step. The owner's profile also has three unfinished sessions from before D1.
- **Drafts:** the editable drafts use drawn SVGs and `vamo.example` links (FB-02 asked for photos). The live Vamo site is `https://vamo-travel-site.vercel.app`.
- **Canva:** the real page fails with "The two text layers on this page do not match". The card is fixed at the top right and cannot be moved or minimised.
- **Fonts:** the Vamo pack has no typography rule, so "which font should I use" cannot be answered from approved sources. The Vamo site uses Fraunces and DM Sans.

**Lesson for whoever continues:** before building, restate each owner sentence and the screen it refers to, and check the result on the real surface. Last round, "test" meant the weekly practice, and only the Canva lesson was changed.

# Feedback round, 25 to 26 October 2026

**State (26 October):** branch `feat/feedback-blocks-a-d` pushed; pull request [#55](https://github.com/sararr25/averill-ai/pull/55) open against `main`, not merged. Release ZIP built locally only (not published). Spec: `docs/FEEDBACK_SPEC_2026-10-25.md` (FB-01 to FB-15, decisions D1 to D4). Canva spike: `docs/CANVA_SPIKE_2026-10-25.md`. Screenshots: `docs/review-evidence-2026-10-25/`.

**How it was built:** each ticket by a subagent (Sonnet for normal coding, Opus for the connection, UI and Canva work, Haiku for docs), then rechecked in this session (tests rerun, screenshots looked at) before one commit per ticket. Owner decisions: D1 connection for the whole session, D2 real Canva (simulator mock rejected), D3 local photo checks, D4 Averill only warns on real sites.

**Cleanup done 26 October:** removed 737 `averill-*` test folders from `/tmp` and the user temp folder (1.3 GB, recreated by the verify scripts when they run), the merged local branch `docs/feedback-spec-2026-10-25`, and the local copy of the replaced 24 October ZIP. The older sibling folder `../demo-social-simulator` (an out-of-date copy of `demo-tools/social-simulator`) was left in place; delete it only on the owner's word.

## What exists now
- Simulator (`demo-tools/social-simulator`): the Brevo preview looks like a real email (inbox header, logo, hero, sections, button, footer with address, Unsubscribe). All posts and drafts have images and realistic hashtags. Not deployed: averill-demo-sim.vercel.app still serves the old version until the branch is merged and deployed (owner decision).
- Desktop: new first tab **To do** (Needs your review and Your tasks, with a count badge). Judges land there after Try the demo. Demo tasks: Emma 3, Maya 2, Alex 2 (Winter Escapes 2027).
- UI: smaller buttons (primary 36 px, others 32 px and 28 px), a clearer type scale, one primary button per section.
- Extension v0.3.0 (reload needed): stays connected for the whole signed-in session (tab switch, Averill covering Chrome, idle, same-site reload). It ends on Stop, sign-out, quitting Averill, closing the tab, or moving to another site. Toolbar badge ON. Popup shows the state (Not connected with 4 steps, Waiting for approval in Averill, Connected to host, last end reason). Card shows a "Connected to Averill" pill and, when it ends, the reason and how to reconnect. Desktop Current work shows a 3-step Browser connection checklist.
- LinkedIn and Instagram composer fields are found reliably (role=textbox, plain text only, field re-found after re-render).
- Card: "Ask about this draft or company rules" box (Enter to ask), with cited answers from approved sources. Example: "Can we say lowest prices guaranteed?" cites the brand rule.
- Card: "Double-check online" after a review or question. Public statements (dates, prices, events) are ticked, then "Check with Tavily". Nothing is sent before the click. Results appear under "Public check, not company approval". In the demo it goes through the judge server (10 searches a day per client). Verdict is Unclear unless Nemotron is on. Desktop shows "Checked online with Tavily: N claims".
- Card: "Images" section with "Check images too": size, aspect ratio, alt text, and text printed in the image (macOS OCR, local). Planted: the Instagram paid Reel image shows "Lowest prices guaranteed".
- Hashtag rules (social-media-guidelines v2): #vamotravel required; Instagram max 8, LinkedIn max 3; banned #cheapestflights, #lowestprice, #bestprice; paid Reel needs #ad. Planted: LinkedIn draft has 5 hashtags; Reel draft has #lowestprice. These findings appear only after Maya supersedes guidelines v1.
- Canva (real canva.com): card "Design check" with "Watch my design" (off by default). Blocks with "Fix before you export" for contrast below 4.5:1 (3:1 for large text), text closer than 108 px to any edge (Vamo rule, same as the Canva margin guide), and forbidden phrases. "Export anyway" records an override. Averill never edits or exports. Starting design DAHZAkgeHzA "Vamo Copenhagen before 8 Instagram post", 1080x1440, texts inside margins (saved 26 October).
- Existing workspaces must re-import social-media-guidelines-v2 to get the hashtag, image and design rules. A fresh Try the demo gets them.

## Verified
All of this is synthetic: fixtures, synthetic pages, and mocked Nebius, Tavily and judge-server calls.
- npm test 207/207.
- Flaw matrix 14/14 (one run with real macOS OCR).
- verify:contextual 20/20 for default, instagram, linkedin and brevo.
- FB06: 10/10 LinkedIn and 10/10 Instagram.
- verify:browser PASS; verify:canva-adapter PASS.
- verify:canva-design 12/12 (on a synthetic page rebuilt from the captured Canva structure, not on canva.com).
- verify:accessibility 9/9; verify:ui-e2e 23/23; verify:guide 27/27.
- Simulator npm test 33/33 and build OK.

- FB-15 run, 26 October: all checks above repeated, plus verify:feedback, intake, rehearsal and demo-ai (outage mode) PASS. verify:cloud-ui first failed: its synthetic review result was not bound to a review, so the new re-render after a public check cleared it; the test now binds it like the app does and passes. verify:contextual (default) failed once at the source dialog and passed on rerun (intermittent, also seen 21 October).
- Packaged app: `npm run package:release` built `travel-desktop/dist/Averill-macOS-arm64.zip` (SHA-256 `9c4072081dc26121e70d94759c4469e09e8241d5fdd5eadf31b9c428a5e54349`, not published; the 24 October ZIP was replaced locally). Integrity check PASS. Driven over the DevTools port with temporary profiles: first run, Try the demo lands on To do, the three demo logins, and the synthetic QA owner login all pass. The bundled extension is 0.3.0 with the new files. Restart persistence, native approval and installed Chrome were not run.

## Not verified
- Installed Chrome with the real extension (v0.3.0).
- Real canva.com live check.
- Live Tavily, Nebius and judge-server calls (all mocked).
- verify:external, verify:native-window and verify:task-review were not verified, because they need Screen Recording permission.

## Open
Owner decisions:
- Confirm or revert the AGENTS.md exception added for FB-10. The card may show public statements that are exact pieces of the field text; only the ticked text is sent.
- Confirm that in-card questions use Nemotron when the session AI switch and company policy allow it, without a per-question confirmation. The README says so; the card does not.
- Push, merge and deploy: the simulator and judge server deploy from main. Owner's word only.
- Release ZIP: owner's word only.

TODOs:
- Create the Canva template link (Share > Share link > Template link) and test it with a second account. Until then, test-averill.md has a marked placeholder for it. Do not invent a URL.
- Merge and deploy so averill-demo-sim and averill-judge-ai serve the new version.
- Run the packaged app checks in FB-15.
- Existing workspaces must re-import social-media-guidelines-v2.

# Judge demo upgrade — implemented, 24 October 2026

**State:** JD-01 … JD-11 done on branch `fix/judge-demo-c-block` (pushed up to `d5a3743`; `b15de32` JD-11 and the JD-13 commit are local only). JD-12 done by the owner. JD-13: guide updated and verified; **no release published** — waits for the owner.

## What exists now
- Fixes: Learn › Start exercise (JD-01), semantic search listener (JD-02), demo AI wording (JD-03).
- Simulator: 9 Brevo campaigns with stats; LinkedIn/Instagram posts with numbers and comments; flawed drafts in `demo-tools/social-simulator/src/data/flawed-drafts.json`; flaw matrix `docs/JUDGE_DEMO_FLAW_MATRIX_2026-10-24.md` + `tests/flaw-matrix.test.js` (JD-04…06).
- Judge workspace: Emma's pending note, Maya's review queue and v1/v2 conflict, Alex's roster, Operations/People documents (JD-07).
- In-app guide: first-run offer, ? per screen, 2–3 steps per role, progress per person (JD-08/09; `npm run verify:guide`).
- Judge AI server `judge-ai-server/`, live at <https://averill-judge-ai.vercel.app> (Vercel project `averill-judge-ai`, production deployed by hand from the branch; production branch is `main`). Daily caps on Nemotron tokens and Tavily units; counters in Redis `averill_storage_REDIS_URL` (JD-10).
- App: in the demo workspace, Check approved rules also asks Nemotron through that server after consent; only verbatim-quoted findings are kept; limit/outage shown explicitly (JD-11; `npm run verify:demo-ai`, `LIVE=1` for the real server).

## Verified (24 October)
109/109 unit tests; intake, feedback, browser, cloud-ui, ui-e2e 23/23, rehearsal, contextual, canva-adapter, accessibility, guide 27/27, demo-ai 5/5 (outage and live). Release ZIP built locally and verified (SHA-256 `08548cca83f998de684c814b0804d54e051c420fa6be7a661c487eeb96731097`); its unzipped code passed the three roles, the guide and the live AI check (run with development Electron, not a manual click in the packaged app).

## Open
- `verify:external` and `verify:native-window` fail here because Electron has no Screen Recording permission on this Mac; they fail identically on `6fec662` (before this work).
- Before a release: merge the branch into `main` so `averill-demo-sim` (new drafts) and `averill-judge-ai` deploy from `main`; then rebuild the ZIP and publish only on the owner's word.
- Alex's website check needs a local Tavily key; it does not use the judge server. The extension's in-page review stays local-only (no Nemotron).

# Judge demo upgrade planning — 24 October 2026

**State:** planned and approved by the owner, not implemented. Read [the plan](JUDGE_DEMO_PLAN_2026-10-24.md), then [the tickets](JUDGE_DEMO_TICKETS_2026-10-24.md) (JD-01 … JD-13).

## What the owner found while testing the judge build
- Review says "Enable Nebius, then choose Review text for a source-backed comparison" because judges have no key.
- Learn › Start exercise appears to do nothing; only "Saving learning activity: completed." shows.
- The Brevo, LinkedIn and Instagram mock drafts look too basic to be believable.
- I also found `Uncaught ReferenceError: el is not defined` in `travel-desktop/src/semantic-ui.js:48` (script load order; present since commit `6e166f5`, also in the published release).

## Decisions (owner, 24 October)
- Judges get live NVIDIA Nemotron through a small server that holds the owner's Nebius key (separate Vercel project, strict limits). At the daily limit or on outage the app shows an explicit message and keeps the local rules check. No hidden fallback.
- The demo is free exploration with an in-app, skippable guide that changes with the screen and role (Emma, Maya, Alex).
- Order: Vamo content, guide and bug fixes first; the AI server after the owner completes JD-12.

## Next actions
1. Start with JD-01 (reproduce Learn › Start exercise on a clean profile), JD-02 and JD-03.
2. Then JD-04 … JD-07 (believable Vamo), then JD-08/09 (guide).
3. JD-10 … JD-12 need the owner: Nebius spend cap, Nebius key in Vercel environment variables, Upstash store.
4. JD-13 only when the owner asks for a release; update `test-averill.md`, not this file.

## Where things are
| What | Path |
| --- | --- |
| App as judges get it (local copy, ignored by git) | `Averill.app` in the repository root |
| Release | `v0.1.0-judge.20261024` (commit `6675d23`, ZIP SHA-256 `390bc1cd578ed381fcec0a697079120aed130149c9f1f973785962399eb3e58c`) |
| Open pull request | [#40](https://github.com/sararr25/averill-ai/pull/40) |
| Test profile used to see the judge view | `~/Library/Application Support/averill-judge-test` (separate from `averill-ai-desktop`) |
| Owner's own demo logins | `demo-login-documents/` (ignored by git; emails are `@vamo.example`) |

## Cautions
- `/loop-me` is not a command in this setup; the decisions above were taken with the brainstorming skill.
- The push approval in chat covered only branch `fix/judge-extension-and-fixtures` and the release; nothing else was published.
- Do not touch the owner's `averill-ai-desktop` profile without a backup; it holds saved Nebius and Tavily keys.

# Judge release — 24 October 2026

**State:** judge-ready build published and merged. Release [v0.1.0-judge.20261023](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-judge.20261023) is the repository's *latest* release (earlier releases were all pre-releases, so `releases/latest` used to 404). Built from `63e2922`; ZIP SHA-256 `5d1cc2559b1ac619b13c49772b1cf33b913fa647bad0734918b4cabbbcc8df27`, verified identical when downloaded through the `latest` link. PR #37 merged to `main` as `13830c5`.

## What changed
- **One-click demo:** first run shows a single **Try the demo** button; own-company setup is collapsed under "Set up your own company instead".
- **Passwordless demo accounts:** the judge workspace is marked `demoAccounts: true`; its people sign in from "Continue as …" buttons (`accounts.demoSignIn`, IPC `account:demo-login`). Non-demo workspaces still require a password and refuse passwordless sign-in.
- **Library focus fix:** a Library refresh no longer drops keyboard focus; it returns to the same control (`knowledge-ui.js`). `verify:feedback` now polls instead of a fixed 80 ms wait and asserts the refresh case (fails without the fix).
- **Screen Recording:** choosing an app window without macOS Screen Recording permission now explains the setting and offers **Open Screen Recording settings**, instead of "Failed to get sources".
- **Vercel:** Root Directory set to `demo-tools/social-simulator` (averill-demo-sim) and `travel-site` (vamo-travel-site). PR previews and production builds from `main` now pass; both live sites return 200.

## Verified
95/95 unit tests; accessibility, UI end-to-end, rehearsal, browser, feedback/library, contextual and cloud UI checks pass. A/B run against `ef833ca` showed no regressions. The unzipped release passed demo sign-in and non-demo password sign-in checks in the real app (temporary profiles; the owner's workspace untouched). The owner tested the ZIP before publishing.

## Files to test
| What | Path |
|---|---|
| Judge guide (stays in the repo) | `test-averill.md` |
| Release ZIP (as judges get it) | `travel-desktop/dist/Averill-macOS-arm64.zip` |
| Built app | `travel-desktop/dist/Averill-darwin-arm64/Averill.app` |
| Chrome extension (inside the app) | `travel-desktop/dist/Averill-darwin-arm64/Averill.app/Contents/Resources/app/browser-extension` |
| Chrome extension (source) | `travel-desktop/browser-extension` |
| Hosted email/social mocks | https://averill-demo-sim.vercel.app/brevo · /linkedin · /instagram |

To see the judge experience on a Mac that already has a workspace, move `~/Library/Application Support/averill-ai-desktop` aside first and restore it afterwards.

## Open
- `verify:task-review` needs Screen Recording permission for Electron; it is denied on the build Mac, so the app-window path is unverified end to end.
- The Chrome extension still needs Developer mode › Load unpacked. This is the main remaining friction for judges; the owner chose to keep this flow for now. An in-app sample-email path (reusing the supplied demo windows) is the simpler alternative if needed.
- The demo company is named "Vamo (judge demo)"; renaming would touch existing data.
- The operation toast still says "Finding available windows: completed." when permission is missing.
- VoiceOver, a clean-Mac install and signed/notarised distribution remain open.

# Owner readiness audit — 21 October 2026

See [the short check report and owner test plan](CHECK_REPORT_2026-10-21.md). Fresh checks: 91/91 unit tests, browser/Canva synthetic regression, nine accessibility matrix groups, offline packaged-resource rehearsal and simulator tests/build pass. `verify:feedback` fails twice on uploaded-reader return focus; default `verify:contextual` stops at the field-type selector. These require diagnosis; no fresh full contextual acceptance is claimed. Initial ZIP/app locale-resource mismatch was resolved by a local rebuild; integrity passes 171 tracked files, both helpers and 3160 archive entries, SHA-256 `eaeeeb1719d8701e2f3fc6cfb46132bf1a52e4d0e8db7d2af7ea6f5baf40c583`. No product code, normal workspace or public release changed. Final-executable/installed-browser, VoiceOver and owner acceptance stay open.

# Packaged-executable continuation - 19 October 2026

Start from [PACKAGED_ACCEPTANCE_2026-10-19.md](PACKAGED_ACCEPTANCE_2026-10-19.md). Added an explicit, marked temporary synthetic profile option for the real executable; normal authentication remains required. Added occupied-port recovery copy and loopback restart/conflict acceptance tests. 91/91 tests and final bundle integrity pass (171 tracked files, both helpers, 3160 archive entries). After the initial Mac lock cleared, CUA repeatedly timed out on the exact QA bundle; no packaged login/browser/restart/VoiceOver success is claimed. See the report for the normal signed-out window briefly opened during app lookup and the precise validation boundary. Previous installed-browser and A/B receipts remain valid within their documented scope.

# Installed Chrome, Canva and accessibility continuation - 19 October 2026

Start from [the continuation report](CONTINUATION_2026-10-19.md). Installed Chrome was updated from extension 0.1.0 to 0.2.1. Actual Vamo LinkedIn and Instagram correction/Undo worked in-page; Instagram keyboard/Escape/Stop and native browser 200% zoom passed. A narrowly guarded adapter now supports one uniformly formatted paragraph in Canva's named design-text editor; actual Canva Apply/Undo and a saved correction after reload passed on the synthetic design. Mixed/rich/multiline text and geometry remain excluded.

Fixed keyboard-only field selection, closed-shadow modal traversal, persistent status and focus through card states. Library reader focus now survives replacement of its trigger during asynchronous rendering. Four authenticated role/source-state/zoom/reduced-motion renderer matrices passed. VoiceOver was toggled on and restored off but its reading/navigation acceptance is inconclusive; do not close #6 or claim complete accessibility.

A/B technical comparison (20 scripted trials per variant, zero humans): expanded 844px/13 controls; compact 500.17px/7 controls; both pass Preview/Apply/Undo with three actions and zero routine app switches. No human simplicity/intuitiveness winner. See [the experiment plan](AB_TEST_PLAN.md). 89/89 unit tests, 18 Instagram seam checks, browser/native-feedback/Canva-adapter and four-role accessibility matrices pass. Local unsigned arm64 app/ZIP integrity passes (168 tracked source files, both helpers, 3157 archive entries). Existing acceptance parents and final-executable/clean-Mac/physical-display gates remain open. Normal workspace data and provider keys were not loaded. No message/post/export/public release was sent or published.

## Library and Learn hierarchy increment — 18 October 2026

Library reading leads with title, approval state, excerpt and Read. Metadata, originals, comparison and destructive actions expand separately. Approval forms move to a distinct queue, shown only for the authenticated person's matching `canReview` requests. Main-process role/reason/version validation is unchanged. Readers restore focus to their library or queue trigger. Private clarification/rule operations expand separately.

Learn shows one leading activity: active weekly practice, otherwise an active lesson/project/finding or the starter lesson. Other activities expand as secondary choices. Existing private records, confirmations, source eligibility, weekly history and deletion confirmation are preserved. Native regression covers upload/read/search, separate pending approval/completion, queue-reader focus, one leading lesson/next-step focus, reduced motion and logout. CX-09/CX-10 remain open for full role/source-state and manual accessibility matrices.

# Companion desktop and Vamo demo clarification — 18 October 2026

The owner selected Vamo mock pages for demo acceptance, replacing the initial requirement for real platform accounts. Averill remains the product with its independent plum/lime identity. Runtime desktop now uses Companion, three primary destinations, unified Current work and expandable connection/chat controls. [Implementation and evidence](CONTEXTUAL_IMPLEMENTATION_2026-10-18.md).

Both Vamo React editors pass 16 contextual checks each with actual Averill code/native pointer hit testing and simulated Chrome transport/approval. Desktop regression: 22/22. No post/campaign was saved, sent or published; normal accounts, sources and workspace are untouched. Installed Chrome and full keyboard/role/zoom/accessibility acceptance remain open. Previously packaged builds do not include this source increment. Earlier dated descriptions below are historical where superseded.

# Contextual browser implementation — 18 October 2026

The owner explicitly authorized push/ticket updates and continuation. Design commit `82f4377` is pushed and CX-01 / #24 is closed. Read [the implementation record](CONTEXTUAL_IMPLEMENTATION_2026-10-18.md) for the new shared review contract, guided loopback connection, actual in-page Companion UI and narrowly bounded plaintext preview/Apply/Undo. CX-02 contract is implemented; CX-03–CX-05 have source/synthetic-flow evidence but remain open for their installed-browser, placement/accessibility and editor acceptance gates. Brevo/LinkedIn origins are context hints, not validated rich-editor support. Superseded by the Companion desktop increment above.

Latest checks: 89/89 unit tests; 13 contextual end-to-end synthetic checks with zero provider calls; existing browser regression and desktop UI 22/22 pass. Actual Chrome transport/permissions and the native approval click are not proved by the contextual harness. Normal accounts/sources and Vamo are untouched. Do not claim the old public/package build has these endpoints.

# Companion identity selected — 18 October 2026

The owner selected **03 Companion** (dark plum, pale lime, rounded contours, Plus Jakarta Sans). Start new visual work from [the selected foundation](../travel-desktop/design-system/companion/FOUNDATION.md): semantic tokens, developed SVG mark, refined reading/control sizes, card/panel/source/preview/Undo contracts, full state inventory and role-aware desktop hierarchy. The review prototype now defaults to Companion. CX-01 design scope is complete; CX-04/CX-08 runtime implementation and all real-platform acceptance remain separate. Current app CSS/behavior, accounts, sources and Vamo are untouched. Earlier exploration recommendations below are historical.

# Identity exploration delivered — 18 October 2026

CX-01 / issue #24 now has [three reviewable visual directions](design-explorations/2026-10-18-identity/README.md) and a local interactive prototype with comparison, contextual card/panel, preview/Apply/Undo example, company library, Learn and result states. Editorial (Newsreader/Manrope, paper/ink-blue), Precise (Space Grotesk/IBM Plex Sans, grey/graphite/rust), Companion (Plus Jakarta Sans, plum/lime). Recommendation: refine Editorial for calm in-editor assistance. **Update: the owner selected Companion; see the selected foundation above.** Current runtime/design-system/Vamo are unchanged. Renderer and contrast receipts are in the exploration folder; real-platform and full accessibility acceptance are not claimed. Next: obtain direction choice from the concrete visuals, then refine that direction and finalize its foundation.

# Contextual UX redesign planning — 18 October 2026

The owner tested Averill and requested a full workflow/UI redesign. Start with [the contextual UX audit and delivery plan](CONTEXTUAL_UX_AUDIT_2026-10-18.md) and [the product specification](CONTEXTUAL_REVIEW_SPEC_2026-10-18.md). Confirmed: compact in-page card expanding into a side panel; individual preview/Apply/Undo; email and LinkedIn first; Instagram and Canva follow-ups; a complete palette/typography rethink; real-platform acceptance. These are planned capabilities, not shipped behavior. The new visual direction still needs selection from concrete alternatives. The planned explicit-edit capability supersedes the manual-only boundary only when implemented with its acceptance criteria. Existing runtime, credentials, approvals and Vamo identity are untouched.

Live GitHub/history inspection for this plan found PR #21 merged and issues #10–#18 closed, superseding the unmerged status in the earlier dated handover. Existing acceptance issues remain open. The new plan does not close them or prove the requested flow. See [the new ticket index](CONTEXTUAL_UX_TICKETS_2026-10-18.md) for published scope and blocking links.

# Nebius and Tavily integration — 17 October 2026

**Next session: start from [HANDOVER_2026-10-18.md](HANDOVER_2026-10-18.md)** (UI tickets #10–#18, Vamo mismatch page, weekly freshness, packaging). Earlier: [HANDOVER_NEBIUS_TAVILY_2026-10-17.md](HANDOVER_NEBIUS_TAVILY_2026-10-17.md).

Implemented the plan in [NEBIUS_TAVILY_PLAN.md](NEBIUS_TAVILY_PLAN.md) on branch `claude/charming-johnson-rhezro`: shared Nebius/Tavily clients, Nemotron rule extraction with lead/admin approval, a tool-calling Nemotron review agent with visible steps, Tavily public-statement and linked-page checks, public website vs approved sources, semantic Knowledge with Nebius embeddings, handover briefing, practice from approved rules and source freshness. See the table in [COMPANY_CONFIDENTIALITY.md](COMPANY_CONFIDENTIALITY.md) for what each feature sends.

Verified on 17 October 2026, before this live pass: `npm test` and `npm run verify:cloud-ui` with **faked** Nebius/Tavily responses on Linux.

**Live verification on the owner's Mac, 18 October 2026** (temporary profiles, Vamo fixture sources, synthetic drafts and public pages only; normal user workspace untouched; no keys or prompts recorded):

- AV-01 `npm run probe:nebius`: chat model `nvidia/nemotron-3-super-120b-a12b`, `toolCalling: true`, `jsonMode: true`, embedding model `Qwen/Qwen3-Embedding-8B`, dimension 4096. Other NVIDIA models listed: Nemotron-3-Nano-30B-A3B, Nemotron-3_5-Lightning, Nemotron-3-Ultra-550b-a55b, Nemotron-3.5-Super-VL. No guard model listed.
- `npm run verify:nebius -- --synthetic-consent` passed (now through `src/nebius.js`): one validated model finding.
- New `npm run verify:live-cloud` passed 9/9, receipt in `travel-desktop/dist/live-cloud-receipt.json` (ignored): rule extraction on `brand-and-legal.md` (5 candidates, 0 rejected by quote validation); review agent `mode: 'agent'` with recorded tool steps and 3 findings on a "Lowest prices guaranteed" draft; public check verdict `supported` with a validated snippet (Tavily search judged by Nemotron); link check of a public Wikipedia page; Tavily `/crawl` of `https://docs.tavily.com/` (3 pages, real response shape `results[].url/raw_content` matches the client); semantic index (30 chunks) and search in `semantic` mode; handover briefing v1→v2 with 3–4 Nemotron points passing quote validation; 11 of 12 practice drafts by Nemotron; one freshness run (verdict `unclear`, 3 results).
- New `npm run verify:live-ui` passed in Electron on the Mac through the app windows with real network (29 calls): Knowledge rules, search by meaning, handover briefing, Learn practice, Setup › Public website crawl/compare, the real outbound dialog before Tavily (fits without overflow at 440×660 and 960×820), a live public-check verdict, freshness and the per-person activity log. Screenshots: [review-evidence-2026-10-18](review-evidence-2026-10-18/).
- `npm test` 77/77 on the Mac (the XLSX onboarding test that failed on Linux passes here).

Fix found by the live run: Nemotron Super reasons by default, so short-budget JSON calls (briefing 900, practice 400 tokens) returned an empty answer with `finish_reason: length` and silently fell back. `src/nebius.js` now sends `chat_template_kwargs: { enable_thinking: false }` and raises an explicit error when a reply is cut off before any answer.

**Still not verified:** the Review agent on a draft actually shared from a browser field or external window (the Review UI was rendered with a drawn agent result; the live agent was verified at module level), a manual click-through by a person, and a crawl of a Vamo page with an intentional mismatch. Built later on 18 October: the scheduled freshness run, the Vamo mismatch page, `src/assistant.js` on `src/nebius.js` and local release packaging — see HANDOVER_2026-10-18.md.

Latest Finder acceptance: human real Finder drop of synthetic Markdown passed in the isolated development app. Agent verified exact extracted text, pending save without automatic approval, explicit reasoned approval and renderer-reload persistence. Zero provider requests; no product code change. [Receipt](review-evidence-2026-10-12/finder-drop/verification.json). The cross-app automation limitation no longer blocks this Finder acceptance; final-executable/whole-process gates remain open.

Latest intake continuation: native chooser rendered its successful result without resize; pending-save/reasoned rejection, source comparison/replacement and current approved lookup passed. Fixed Knowledge summary counting upload proposals as the entire review queue; it now shows pending decisions in displayed results separately. 47/47 tests pass. [Receipt](review-evidence-2026-10-12/intake-continuation/verification.json). Finder drop and actual packaged chooser remain open. Installed-browser continuation was not completed while Chrome foreground changed; unused local pairing expiry/Stop only is newly verified.

Latest continuation, 12 October: native Learn source-linked lesson/weekly practice, explicit reflection confirmation, exclusion/recovery and account isolation passed in a temporary profile. Fixed the instruction to refresh when no eligible activity remains; outdated practice no longer says complete or suggests a stale next exercise. 47/47 regression tests passed; zero provider requests. [Evidence and boundaries](review-evidence-2026-10-12/learning-continuation/verification.json). This source fix is not yet in the published preview; keep ticket #5 and final packaged/Canva acceptance open.

# Testing and review continuation — 12 October 2026

Owner-approved acceptance tickets are published as GitHub issues #1–#9 with native blocking links. [Testing plan](TESTING_PLAN_2026-10-12.md) and [short checklist](TESTING_CHECKLIST_2026-10-12.md) record fresh evidence and remaining gates. Offline source/release-resource rehearsals, native feedback/browser/task review and canonical simulator tests/build pass. Actual local Chrome media save/reload passes for Instagram, LinkedIn and Brevo; Brevo audience/Copenhagen schedule persistence and cancellation passed too.

The local app was missing 204 Electron locale resources present in the unchanged public-release ZIP. Restoring only those files resolved `verify:release`; source/native helpers and all 3109 archive entries now match. The continuation then reproduced and fixed source-dialog focus restoration (commit `e1f05cb`). Actual chooser/role visibility, installed Brevo correction/logout/person/sender-field exclusion, native 207% zoom and main-app full screen were checked. Normal credentials/approvals remain untouched. A chooser rendering stall recovered after resize and remains an open packaged-executable retest. See the checklist and manual receipt for remaining gates.

Focus-fix preview [v0.1.0-preview.20261012](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261012) is public after explicit owner authorization, built from `e1f05cb`. 47/47 tests, source/bundle feedback regression and offline packaged-resource restart rehearsal pass with zero provider requests. Bundle/ZIP integrity passes (120 tracked source files, both helpers, 3109 entries). See [build receipt](review-evidence-2026-10-12/continuation/release-verification.json). GitHub's ZIP digest matches the verified local artifact; public page/checksum access passes. The previous preview remains available. Manual acceptance gaps remain as documented above.

<!-- Current demo correction: no Brevo sign-in is needed. -->

Current status, 4 October 2026: the Guided UI release is public at [v0.1.0-preview.20261004.2](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004.2). See [PROJECT_STATUS_2026-10-04.md](PROJECT_STATUS_2026-10-04.md) and [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) for current evidence, ordered checks and pending fixes. Dated earlier sections are historical where superseded.

# Averill execution handover

## Latest publication and next actions

The Guided UI is public in `v0.1.0-preview.20261004.2`, built from `50e5c61`. Public page/checksum download returned HTTP 200; a fresh unauthenticated ZIP download matches SHA-256 `38499d6041da183209478f48a5bde3b1f363503733b761ac040da98cc91aa36b`. The previous release is retained.

Next execute [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) in order: published-app launch/restart, full fake-editor correction loop, privacy/account cases, manual role/accessibility/hardware checks, then final video and owner submission declarations. No current test proves every one of those gates. Cloud sync, production publishing and geometry assessment are future product scope.

Documentation is synchronized separately from the binary; no runtime source changed in this publication pass.

## Approved B Guided UI — 4 October 2026

Implemented the approved UI/UX audit in the existing Electron app. Work now makes the next step explicit; external checks appear in Review with observed text, correction and source. Advice clears on task/text/source/person changes and Stop. Controls, Setup/Knowledge disclosures, Learn hierarchy and B motion use the Averill design system. Read [UI_UX_AUDIT_2026-10-04.md](UI_UX_AUDIT_2026-10-04.md) for evidence and remaining manual visual checks.

Validation: 47/47 tests; native feedback/knowledge/learning/focus/reduced-motion, browser-client privacy/Stop, renderer rule review/correction/recheck/revocation/task invalidation and all six areas at 440×660, 520×850, 960×820. The actual native app was inspected through CUA with an isolated synthetic profile. Normal user data was preserved. No provider request was made for this UI pass.

The local unsigned arm64 `.app` and ZIP are rebuilt and bundle/archive verified. The new public release targets `50e5c61` and includes these UI changes. Its ZIP digest is recorded in PROJECT_STATUS_2026-10-04.md. Runtime reduced motion is tested via emulation; OS setting, full VoiceOver/200% zoom and frame profiling remain manual checks.


## Pending-work continuation — 4 October 2026

[Current acceptance record](ACCEPTANCE_2026-10-04.md) supersedes the earlier consent-UI/restart gates. 47/47 tests pass. Packaged-resource regression now verifies consent cancellation, one live generated-public-text Nebius/NVIDIA review through renderer handlers, correction, authority revocation, Stop, weekly practice, person isolation and second-process restart. Work displays the actual runtime model. The actual unsigned `.app` also launched on this Mac at the existing workspace sign-in screen; normal user data was preserved.

The public preview build is published at GitHub release `v0.1.0-preview.20261004`, targeting `3ce9e29`. Unauthenticated page/download HTTP 200 and the uploaded ZIP digest were verified. Extension installation and selected-field demo proof are complete; full manual rehearsal/hardware checks, final recording/public YouTube URL and owner submission declarations remain gates. The regression harness is distinct from installed Chrome acceptance on the local fake editors.

## Current rehearsal and submission preparation — 3 October 2026

The live generated-policy/email request passed through Nebius Token Factory with NVIDIA `nvidia/nemotron-3-super-120b-a12b`, with one validated model suggestion. Run `npm run verify:nebius -- --synthetic-consent` only when intending that generated payload to be sent; it does not read normal user data. The ignored receipt contains model/time/counts without keys or prompts. It tests the runtime model path, not the app consent UI.

Real Canva practice on a separate synthetic 1200 × 627 design verified text edit, font size 48, Position → Middle and completed PNG export. Actual selected-window OCR, changed-text observation and Stop passed in an isolated profile. No automatic Averill geometry assessment is claimed. [DEMO_REHEARSAL.md](DEMO_REHEARSAL.md) records ordered remaining acceptance. [SUBMISSION_REQUIREMENTS.md](SUBMISSION_REQUIREMENTS.md) records official event data (30 October 17:00 UTC deadline and sub-three-minute video); [submission draft](../devpost-submission.md) is prepared. Registration, final video and public build URL remain unconfirmed/open. No submission or publication was performed.

## Current release status — 3 October 2026

This section supersedes historical test totals and artifact statements below. The current suite passes **47/47**. Source native feedback, selected-window OCR and task-review smoke passed on 3 October in isolated synthetic profiles; bundled-resource feedback passed too. These are not actual email/social/Canva account acceptance.

Use `npm run package:release` from `travel-desktop` to rebuild the unsigned arm64 app and ZIP together. `npm run verify:release` compares tracked desktop source and both native helpers with the bundle, extracts the ZIP and compares its complete file/symlink inventory. Build evidence and archive SHA-256 are in ignored `travel-desktop/dist/release-verification.json`. It records the source revision at build time, not a claim that later commits are bundled.

The owner authorized pushing the five follow-up milestones on 3 October. The earlier publication block is historical; record each new milestone and its push separately in [MILESTONES_2026-10-03.md](MILESTONES_2026-10-03.md). Real-platform, permission and physical-display gates remain open.

## Current browser field adapter — 3 October 2026

The opt-in extension in `travel-desktop/browser-extension/` shares one clicked top-frame field locally after a pause, blur or selection. Pairing is ephemeral and person/tab/origin scoped; typing invalidates advice and Stop/logout/expiry revokes the connection. Work labels selected-field evidence separately from native Accessibility/OCR. Source-backed field requirements cover audience/date/time/asset/procedure/version/disclosure only when that field was observed; other requirements remain unverified. No edits or automatic provider requests exist. Read the extension README for installation, privacy and acceptance limits. Native tests use a synthetic extension client; installed Chrome selected-field acceptance is recorded in INSTALLED_EXTENSION_2026-10-04.md; full manual new-release and production-platform acceptance remain separate.

## Current email loop — 3 October 2026

Work now offers **Read and recheck locally**, which reads fresh selected-window text before exact-rule review and makes no provider request. Advice clears when person/source authority/policy or chosen work type changes. Native synthetic email correction/citation/revocation/Stop passes. The demo uses the local fake Brevo page without sign-in; extension-assisted correction acceptance remains pending. See demo-tools/social-simulator/README.md.

## Current demo migration — 3 October 2026

The shipped campaign sources, current artwork labels, four editors, tests, manual pack and mixed-format intake now use Vamo. Packs are `demo-company/vamo/` and `demo-company/vamo-intake/`; People guide v2 describes local sign-in. Newly generated fictional addresses use `vamo.example`; new draft keys use `vamo:v2`. Existing normal-profile credentials, imported copies, approvals, login documents and old drafts remain unchanged. Use a fresh isolated Vamo workspace for recording, or explicitly reimport and reapprove updated source files. Do not silently rename account emails or treat changed text as previously approved. See [DEMO_MIGRATION.md](DEMO_MIGRATION.md).

## Historical handover — 28 September 2026

Everything below is dated historical evidence. Its Elseweek/Aurelia identities and prior artifact/test totals describe previous versions; the current sections above supersede them.

The full implementation sequence and acceptance gates are in [COMPLETE_VISION_PLAN.md](COMPLETE_VISION_PLAN.md).

Vamo is the fictional travel-company brand and has an independent website in `travel-site/`. Averill is the Nvidia–Nebius hackathon product: a companion that helps company employees in the email, LinkedIn, Instagram, Canva, document and other tools they already use. The four supplied Electron editors are test fixtures, not the intended employee workspace.

Points 1–3 of the [complete-vision plan](COMPLETE_VISION_PLAN.md) now have an implemented local path. Work selects one external app/browser window, reads it through macOS Accessibility or visible-text OCR, and can poll it every six seconds after explicit Start. The movable floating control opens Averill, displays selection/observation/last-read status, and offers Stop. The main process checks the selected window ID and owning PID before each read; Stop, sign-out and account change clear transient text and prevent an in-flight read from restoring it. Captures are memory-only; temporary PNGs are deleted. The supplied Electron editors remain collapsed synthetic fixtures.

The new work-type review checks exact rules from approved, visible, non-conflicting company files. Credential-shaped text and Luhn-valid payment numbers are redacted from observations before display or review. Optional Nebius interpretation requires owner policy, session opt-in, eligible source consent and a separate observed-text confirmation; output must cite exact source and observed excerpts and is reauthorized before display. This is a bounded review, not a full understanding of hidden fields, visual layout, actual platform state or external publication. Tavily still receives only a public query typed by the employee. [EXTERNAL_WORK_ACCEPTANCE.md](EXTERNAL_WORK_ACCEPTANCE.md) records the domain cases and proof gates.

Verification: `npm test` passed 44/44; `npm run verify:feedback`, `verify:external` and `verify:task-review` passed in isolated Electron profiles. Real native TextEdit selection/Accessibility read/live edit/Stop passed with synthetic text. Real Chrome selection/OCR/live edit/Stop passed on a local synthetic editor page. The unsigned arm64 app was rebuilt with both Swift helpers; feedback and external observation smoke passed against its bundled resources. The expected private-link and post-Stop negative IPC tests log handled errors. No live Nebius request, production email/social account, actual Canva document, direct packaged-app launch, physical second monitor or permission-revocation test was performed. The existing ZIP has not been refreshed in this pass; use the `.app` or build a new archive before sharing.

Remaining for full points 1–3 acceptance: browser DOM/official draft adapter, edit-pause/field metadata, actual email/LinkedIn/Instagram/Canva account checks, fuller task schemas, live consented Nebius task review, multi-monitor/full-screen and permission-denial acceptance. The current local engine proves one source-backed email correction and revocation; it cannot justify claims about every channel. Keep later milestones in the plan untouched until these gates are closed.

Updated 28 September 2026. Canonical entry point for continuing this repository. Read [PROJECT.md](../PROJECT.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [AGENTS.md](../AGENTS.md) and the [desktop design system](../travel-desktop/design-system/DESIGN_SYSTEM.md) before changes.

## Product, identity and agreed demo

Averill is a standalone company assistant. Vamo is the fictional travel customer with a separate website in `travel-site/`. Averill and Vamo never share a name, logo, palette or interface style. The existing desktop department onboarding pack, prepared accounts, campaign sources and supplied windows still say Elseweek; they are legacy synthetic fixtures and were not migrated by the website redesign. See [Vamo website handover](../travel-site/docs/HANDOVER.md) for the current brand and migration boundary. The old square intentionally retains its historical Aurelia artwork. Preserve brief v1 and the old square asset because they are intentional outdated-material scenarios. Product, demo sources and developer documentation remain English.

The owner’s video direction is: company data onboarding across departments → employee learns Canva → applies learning to LinkedIn and newsletter work → weekly personalised practice. Opening with a presentation of the website was rejected. Canva should demonstrate tool learning, with campaign correction as supporting context. See [PRODUCT_DEMO_PLAN.md](PRODUCT_DEMO_PLAN.md) for the target four-minute sequence and implementation gates; that duration is not a confirmed submission limit.

## Brand boundary and website status — 28 September 2026

The current travel website is **Vamo**, a fictional demo customer. **Averill** is the agent-assistant product submitted to the hackathon. Their names, visual systems and interfaces must never be merged. Vamo uses warm cream, sea ink `#0E576B`, mint, pink-leaning coral and restrained fuchsia in a people-first travel editorial. Averill retains its separate Petrol / Coral / Ice desktop design system. The Vamo website was committed locally as `35228aa`; a remote `main` push was rejected by automatic review because site-building authorization did not include remote publication. The current repository state should be checked before release. The still-Elseweek-labeled desktop fixtures and account data need a planned migration; do not describe that work as finished. See [the Vamo handover](../travel-site/docs/HANDOVER.md).

## Current app areas

- **Review:** browsable findings, selected/current source, Explain/Copy/Practise/Recheck actions, inspectable source dialog and question composer. Shared supplied windows use fixed campaign sources; otherwise company questions use visible approved sources. Unsupported company questions can create a private local clarification request.
- **Work:** Select and locally observe one external window, stop from main/floating control, and run a bounded work-type check against approved company rules; optional Nebius review requires separate consent. The four supplied editors remain synthetic fixtures.
- **Learn:** four-step Canva lesson (selection, Position, alignment, grouping), bounded offline free questions, optional single selected-window OCR, three task projects and finding-linked correction exercises; optional linked approved company source; confirmed records and current-week questions/reflections. Deterministic field recheck and employee confirmation are separate.
- **Research:** explicit public Tavily query, with results separated from company policy.
- **Knowledge:** searchable local extracted text and originals, filters for status/department/type/conflicts, exact document review links, textual version comparison, approval decisions with reasons and private clarification requests.
- **Setup:** owner account/company, mixed-file onboarding with Nebius interpretation, bulk team accounts, local disable/reset/password change, people/departments, company/department import, private proposals, lead/admin approval, priority/supersession/conflicts and encrypted service keys.

## Addition pass — 28 September 2026

The requested “What I would add” section is tracked item by item in [ADDITIONS_STATUS.md](ADDITIONS_STATUS.md). Implemented locally: finding-to-practice path; composition/LinkedIn visual/newsletter export exercises; bounded free step help and one explicit selected-frame OCR; correction copy, before/target and recheck; extractive passage citations with version, approval and new-PDF page markers; bounded line comparison, manual version links, reasoned source decisions, private clarification, global knowledge filters; local account disable/reset/change; deletion of managed source copies and personal Learn history; onboarding staging cleanup. These do not establish automatic Canva geometry/export verification, semantic claim verification, email invites, hosted sync/tenant isolation, application encryption or a signed release. [AB_TEST_PLAN.md](AB_TEST_PLAN.md) records the single-variable experiment hypothesis and technical preflight; no live A/B result is claimed.

## UX continuity pass — 28 September 2026

- Review names the exact shared demo windows and offers Stop for each. A selected Canva window is labelled as selection for one-frame Review, with a separate clear action. Review distinguishes no shared context from supported checks with no findings, and lets the employee browse findings one at a time. The evidence and conversation scroll above a visible composer. Changing between company-source and demo-source answers adds a context note to the conversation.
- Company-source lookup now requires an actual query-term match before priority influences ordering. A question with no matching approved source returns uncertainty and no citation. With no demo window shared, a configured company workspace no longer falls back to the fixed campaign pack when it has zero approved sources. This is a retrieval guard, not independent claim-to-passage verification for Nebius output.
- Registered work editor windows can open another supplied editor through the narrow `agent:open-work` IPC handler; the destination kind is validated and a failed navigation shows an error in the editor. Campaign Files sidebar labels describe the local file opened.
- Setup retains its unsaved form while unrelated snapshots arrive; its local approval and cloud-browser actions force a targeted rerender. Learn moves keyboard focus to the next step or unanswered question after saving. Knowledge opens the exact uploaded proposal or pending source in Setup. Research and AI controls explain missing configuration and send an administrator to Setup.
- Supplied editor draft saves are now keyed to the signed-in local person. The former shared `elseweek:v1:<kind>` keys are preserved but not silently assigned to a person. Work editors label unsaved changes; loading the flawed demonstration draft can be undone. The assistant remembers the last visited area for each local person and resumes it after login unless onboarding is pending. These are local UX states, not cloud sync.
- A knowledge-only onboarding batch explains that zero team accounts is normal; Nebius interpretation remains optional and consent-gated.

## Learn behaviour and boundaries

`src/learning.js` owns sessions and quiz logic; `learning-ui.js` renders Learn. The main-process `learning:action` handler only accepts the Averill renderer and derives ownership from the active workspace person. Data is nested in the existing schema-1 workspace JSON. No destructive migration is required for older workspaces.

Sessions resume after restart. Confirmations record a specific operation and timestamp; employee confirmation is not visual verification. Manual records describe confirmed work; they are not evidence of a LinkedIn integration. Exclusion removes practice eligibility while preserving local history. Snapshots expose only the active person’s sessions and current-week quiz. Separate local credentials now identify the active employee. This is application-level isolation on one Mac, not cloud authentication or tenant isolation against direct local-file access.

Weekly eligibility uses Monday-based Europe/Copenhagen weeks and confirmed activities. Sets contain up to two learned-operation questions, a source/version check when linked evidence remains valid, the latest recorded-work reflection where applicable, and a practical operation reflection. Company evidence must remain visible/approved, match its original version/hash and not be in a source conflict. Invalid evidence/excluded activity blocks affected questions; changed records offer explicit practice refresh. Answer keys are omitted from renderer snapshots. Incorrect choices receive explanations; a missed operation informs the next-practice suggestion. Reflections are self-confirmed and not automatically graded.

Learn makes no AI/network request or screenshot archive. Opening the official guide is an explicit action. Its free question help is bounded, offline guidance over the four taught operations, and selected Canva OCR is one explicit frame. Automatic geometry/step assessment, visual export verification, inferred mastery and automatic activity tracking are not implemented.

## Run, artifacts and storage

Node.js 22+. From `travel-desktop/`:

```sh
npm ci
npm start
npm test
npm run package:mac
```

Packaged unsigned arm64 app: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`. ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`, generated with `ditto`, not tracked by Git. Both were rebuilt after the 28 September addition pass. Restart an older running app to load the new code. Recent native checks used separate synthetic user-data profiles; do not import those records into the normal employee workspace.

From the repository root, `npm --prefix travel-site start` serves Vamo at `http://127.0.0.1:4173/`; its design system is at `/design-system/index.html`. The dependency-free site has an editorial travel homepage, destination dialogs, creator-style editorial previews, journal dialogs and a local trip-brief generator. No booking, payment, enquiry or live social integration is present. The ferry hero is generated concept photography; city photos are credited. See [the dedicated site handover](../travel-site/docs/HANDOVER.md) for brand tokens, verified checks and next steps.

Company copies and workspace JSON live in Electron user data. Optional Nebius/Tavily environment variables are listed in [`.env.example`](../.env.example). Keys entered in Setup use encrypted local storage; never commit keys, `.env.local`, imported user material, user-data folders or build dependencies.

## Verified evidence

- **33 Node tests passed at that historical stage:** original campaign, workspace, onboarding, privacy, OAuth callback and learning tests plus local account disable/reset/change, finding/task practice, motivated version decisions and line diff, exact passage/model extraction, clarification isolation and managed-copy deletion.
- **Addition pass native preflight:** an isolated synthetic owner shared a flawed LinkedIn draft, saw five findings and opened a linked practice exercise with source and before/target text. An unsupported company-policy question returned no citation and offered private clarification. After fixing a loading defect, Knowledge displayed three documents and the owner answered the request privately; line comparison opened with both source versions. No real Canva screen, live provider account or real employee data was used. The preflight exposed and resolved the two defects documented in [AB_TEST_PLAN.md](AB_TEST_PLAN.md).
- **Bundle and extractor:** `npm run package:mac` rebuilt the unsigned arm64 app; `npm run verify:feedback` passed against its bundled resources after updating a historical assertion to the new Knowledge status wording. The suite intentionally tests that private-network import is rejected, which logs a handled error. The rebuilt Swift helper extracted `[PDF page 1]` from the synthetic campaign PDF. `git diff --check` and syntax checks passed. The ZIP was regenerated after packaging. This is bundled-resource smoke, not a direct final-app launch or signed-install test.
- **UX continuity check:** native source app with an isolated synthetic owner verified zero-citation no-evidence answers, editor-to-editor navigation, unsaved Setup input retention, undo of a loaded flawed draft, five-finding Review navigation, Stop from Review, direct Knowledge-to-Setup proposal opening and Learn focus advancement. Review was visually rechecked after giving its feed an independent scroll region. `npm run verify:feedback` passed for source and bundled app resources. The final `.app` executable was packaged but not directly launched for this pass.
- **Native dev app:** isolated workspace creation, Learn/help, step advancement, weekly generation, wrong-answer explanation and practical-reflection completion.
- **Native packaged app:** restart resumed step 3 with two saved confirmations and earlier test answers/reflection. Manual LinkedIn activity was recorded through UI; refresh generated a prompt for that exact activity. These are synthetic test records, not proof of real employee learning or Canva operations. Final wording changes were syntax-tested and the app/ZIP rebuilt.
- **Previous packaged campaign checks:** shared old brief yields current-source finding; v2 opens; Escape closes; local version comparison cites both briefs; Stop sharing clears findings. Email/Social visuals checked and actual SVG rendered.
- **Services:** fixed campaign Nebius request previously succeeded; Tavily returned live results in the dev app. The company-source Nebius route is not live-verified; prior transfer was blocked pending specific payload consent. Real selected Canva capture/permission/Stop sharing remains unverified end to end.

No signed/notarized release, Windows proof, cloud authentication/sync, external app control, automatic edit/send/publication, certified accessibility or live website review integration is claimed.

## Delivered: Elseweek onboarding and LinkedIn — 26 September 2026

The owner first requested preparation steps 2 and 3, then a stop. Those were delivered. The later request authorizes smooth company onboarding from files and four separate local account profiles; that delivery is described below. Canva acceptance, richer weekly assessment and recording remain outside the current implementation scope.

- **Company pack:** `travel-desktop/demo-company/elseweek/README.md` defines fictional people for Marketing, Operations and People, document owners, intended approvals, priorities and exact import versions. It includes identical department brand-context copies, campaign sources, Operations procedure, People onboarding, a private employee proposal and optional archived brief v1. The older manual pack duplicates brand context per department. The newer mixed-file intake supports a real company-wide source scope. Import the four Marketing v1 documents and campaign brief v2 separately; do not import the whole root as Marketing.
- **Setup:** administrators choose import department/version; employee/lead imports are constrained to their department in workspace logic. Imported text saying APPROVED does not approve the workspace record. Existing workspace data is preserved; no demo data is silently inserted.
- **Brand migration:** current desktop chrome, footer/disclosure, sources, email/Reel assets and assistant prompt use Elseweek. Brief v1 and old square are preserved. Legacy `aurelia:<kind>` drafts remain untouched; new local drafts use `elseweek:v1:<kind>`.
- **LinkedIn Draft:** fourth supplied editor, organic company-page copy, editorial audience, landscape asset preview, planned date/time, approved-guide action and local Save. Share/Stop gates five deterministic checks: guarantee phrase, audience, wrong asset, missing CTA and slot. All cite `linkedin-campaign.md`. New synthetic LinkedIn slot: **16 October 2026, 09:00 Europe/Copenhagen**. Email remains 15 October, 10:00; paid Instagram Reel remains 17 October, 18:00. The new landscape SVG derives from the existing supplied email illustration, not a Canva-generated/exported design.
- **Boundary:** these are limited campaign checks, not general tone evaluation, LinkedIn API access, live Canva creative transfer or publication. Static supplied-window checks use the registered campaign pack independently of imported workspace approvals. Company answers/learning continue using accessible approved imported sources.
- **Verification:** 14 Node tests pass. An automated Electron harness loaded the rebuilt bundle's app resources in the installed Electron runtime with `/tmp/averill-elseweek-smoke-profile`. Actual renderers/preload/main IPC checked admin department options, imports, lead approval, employee visibility for all three departments, v2 metadata, five LinkedIn findings, cited guidance, corrections clearing findings, actual landscape rendering, local Save and Stop clearing findings. A second process checked restored approvals/visibility/v2 metadata and the saved LinkedIn draft, with no sharing on restart. Native captures were visually inspected and no horizontal document overflow occurred. The test file/folder chooser was stubbed; this does not establish a manual native-chooser onboarding rehearsal or direct launch of the final `.app`. The unsigned bundle and ZIP were rebuilt; Canva/network services were not exercised.

## Delivered: smooth file onboarding and four local accounts — 26 September 2026

- **Start:** new company creation includes owner name/email/password. Old workspaces retain their people/sources/learning and can explicitly enable owner login. After activation, passwordless role switching is rejected by main-process IPC. Restart always requires sign-in.
- **Profiles:** owner/CEO/admin; Marketing manager (lead); Marketing strategy employee; Content creator. Employees share department permissions but have separate IDs, learning and history. Imported records cannot create admins; the owner explicitly creates any further administrator. The mixed intake adds Maya/Emma/Oscar in one confirmation; owner setup provides Alex.
- **Intake:** `travel-desktop/demo-company/elseweek-intake/` has a staff XLSX, brand/company SVG, campaign v2 PDF, LinkedIn/Operations/People Markdown. Up to 30 files, 20 MB each. XLSX uses ExcelJS in a bounded subprocess (20 sheets, 2000 rows, 50 columns, no formula execution). Legacy XLS needs an XLSX/CSV export. PDFKit extracts up to 30 pages; blank scanned pages use local Vision OCR. SVG onboarding extracts text/title/description, not outlined geometry. Extraction failure/truncation is shown.
- **Nebius:** explicit per-upload confirmation sends readable extracted text (up to 12k characters/file, 60k total), never passwords/API keys/file binaries. Nemotron proposes people/company/document metadata. Person names/emails require a known source ID and a matching quote; unknown/fabricated identity suggestions are excluded. Proposed scopes/roles/versions remain reviewable. Failed requests preserve the local draft. No approval or administrative privilege is inferred from a file.
- **Apply:** owner reviews people/document summaries, edits/excludes entries, confirms sources for approval, and creates separate accounts in bulk. Existing account emails are excluded. Personnel files remain private to the owner; company-wide guidance is available to all signed-in employees only after admin approval. Leads can approve only their department. New company scope avoids department brand duplication. A failed apply rolls back new records/imported copies; the draft remains available.
- **Credentials:** async scrypt with random salts; renderer snapshots omit credentials/evidence internals. Owner and generated passwords are saved in separate local Markdown login documents at the user's explicit request. Workspace JSON retains hashes; account documents never enter snapshots or Nebius. The admin can reopen the folder from Account access, disable/reset another non-owner account, and each signed-in person can change their password. No invitation emails or unauthenticated owner recovery are implemented; use the saved owner document for retrieval. This is local authentication on one Mac; local files remain readable/editable to the OS account, so no production multi-tenant security or multi-device service is claimed.
- **Session:** login validates a distinct account. Protected IPC requires the authenticated Averill session; sender checks remain enforced. Sign-out closes supplied work windows, clears sharing/AI/external selection and visible prior-account draft/learning. Anonymous snapshots omit sources/onboarding/learning; company name and demo account directory remain visible to make the demo account picker usable. Five bad password attempts impose a one-minute delay.
- **Verified:** 18 Node tests; separate live Nebius requests returned correct mixed-file metadata/company and extracted three correctly profiled people from unstructured prose (local parser found zero), using `nvidia/nemotron-3-super-120b-a12b`. Native dev renderers/preload/main IPC verified owner bootstrap, all six files, bulk profiles, source scope/version, hidden roster, wrong password, denied role-switch bypass, denied anonymous source/administration access, restricted company approval, sign-out, creator Learn and restart with login required. File chooser was stubbed. Synthetic scan verification recovered the company and campaign from an image-only PDF. Native captures were inspected; horizontal overflow check passed. A subsequent test loaded the rebuilt bundle app resources in the installed Electron runtime and verified owner login, the packaged XLSX subprocess, PDF/SVG extraction, duplicate exclusions, v2 metadata and compact Setup. The final `.app`/ZIP are rebuilt unsigned; this is not a manual native-chooser rehearsal or a directly launched final-bundle acceptance test. Patched uuid override gives zero npm audit vulnerabilities. Normal user workspace was not seeded/reset.
- **Tutorial:** `docs/ONBOARDING_TUTORIAL.md` replaces the one-by-one onboarding path for this demo; the old manual pack remains available. Native profiles `/tmp/averill-auth-onboarding-profile` and all generated test credentials are synthetic and must not be imported into the real workspace.

## Remaining work, in order

1. Owner acceptance of the bounded Learn experience. Rehearse with actual Canva operations; separately test capture, Screen Recording denial, OCR and Stop sharing. Keep confirmation distinct from verified geometry.
2. Manually rehearse mixed-file Elseweek onboarding through the native file chooser and review the supplied LinkedIn scene in the final packaged app; automated IPC checks above are complete.
3. For stronger task acceptance, validate real Canva geometry and export outcomes, and assess free-text campaign choices against reviewed evidence. Current exercises and free help are bounded local guidance; employee confirmation is labelled separately from rule checks.
4. Rehearse the four-minute recording with resettable synthetic data and working source links. Label seeded history and supplied editors honestly; the source/version scene is an optional reliable replacement.
5. Before real-company deployment: cloud authentication/sync, tenant isolation, revocation/deletion, retention, stronger semantic conflicts and claim-to-citation checks.

## Repository map

- `travel-desktop/main.js`, `preload.js`: windows, sender checks, sharing, services, workspace and learning IPC.
- `travel-desktop/src/learning.js`, `learning-ui.js`, `tests/learning.test.js`: Learn state/UI/tests.
- `travel-desktop/src/agent.*`, `app.css`: assistant and tabs. Since 27 October 2026 `app.css` is the app's only stylesheet (the old agent-controls, agent-theme, ui-refinements, guided-ui, companion-theme and todo rules merged in load order); colours come from `design-system/companion/tokens.css`, light by default and dark when macOS is dark. `scripts/verify-phase-b.cjs` checks contrast and text size in both themes.
- Current work (27 October 2026, phase C): a "Working on now" card names the connected draft, picks the check type from the site (Canva, Brevo, LinkedIn, Instagram), and has Check now, Ask about this and Disconnect; corrections follow, then Recent work (name, check type, time and correction titles per person in this Mac's localStorage). Pairing recovery and app window capture moved to Workspace settings › Connection tools. The extension posts a bodyless `/hello` to 127.0.0.1:43147 when its worker starts; Averill stores only the timestamp in `extension-seen.json` and shows Install (opens chrome://extensions and reveals the folder; nothing is installed automatically) or Connect (brings Chrome forward; never claims a connection). Verified by `scripts/verify-phase-c.cjs` with a simulated extension, not with real Chrome.
- Learn (27 October 2026, phase D1): the Canva layout lesson runs inside Canva. `src/canva-exercise.js` reads the same FB-14 design reading and ticks five steps by itself (two texts, headline 1.5x bigger, aligned edges, 60 px margin at 1080 px, readable contrast); ticks stay once seen. Grouping cannot be read and is confirmed once with "Finish lesson", which stays disabled until the five steps are seen. "I cannot connect Canva" finishes with every step recorded as employee-confirmed. The browser card lists the lesson steps under the design check. Verified with `npm test` (211/211) and `verify-canva-design` (15/15) on the synthetic Canva page only, not on real canva.com. D2 (Brevo) and D3 (LinkedIn/Instagram) are not started.
- `travel-desktop/src/work.*`, `work-theme.css`: supplied campaign editors.
- `travel-desktop/src/workspace.js`, `workspace-answer.js`: local sources, roles, approval and company answers.
- `travel-desktop/src/engine.js`, `assistant.js`, `campaign.js`: campaign rules/local answers/Nebius.
- `travel-desktop/src/web-search.js`, `scripts/extract-text.swift`: research and local extraction.
- `travel-desktop/demo-company/elseweek/`: synthetic department pack and onboarding instructions.
- `travel-desktop/sources/linkedin-campaign.md`, `assets/winter-linkedin-landscape.svg`: supplied organic LinkedIn evidence and visual.
- `travel-desktop/src/accounts.js`, `onboarding.js`, `onboarding-ui.js`: local identity, intake/Nebius evidence/apply and guided Setup.
- `travel-desktop/demo-company/elseweek-intake/`, `docs/ONBOARDING_TUTORIAL.md`: mixed-format demo and four-account tutorial.
- `travel-site/`: independent Vamo website, design system, brand and asset provenance. Its handover is `travel-site/docs/HANDOVER.md`; desktop fixtures are still Elseweek-labeled.
- [LEARNING_IMPLEMENTATION_PLAN.md](LEARNING_IMPLEMENTATION_PLAN.md): plan and delivered boundary.

Remote: `https://github.com/sararr25/averill-ai.git`, branch `main`. Check current Git status/remote before continuing; this file deliberately does not embed its own commit hash. `ARCHITECTURE.md` is the canonical system design; the Word copy is a convenience export.

## Local login documents — 26 September 2026

User explicitly requested retrievable demo passwords. New owner setup, legacy owner activation, manual employee accounts and bulk onboarding now save one Markdown login document per account in userData/Averill-login-documents. The owner can reopen the folder from Account access. This folder stays outside Git, company sources, snapshots and Nebius input. Existing pre-feature account hashes cannot recover passwords. Initial inspection found Aurelia Demo with one legacy administrator and no credentials. The later user correction is resolved by the prepared local demo section below; no existing password was reset.

## Next developer entry point

- Canonical repository: /Users/sararuffini/Documents/Hackatons/Nvidia/averill-ai. Remote sararr25/averill-ai, main. Preserve unrelated changes and inspect git status first.
- Executable: travel-desktop/dist/Averill-darwin-arm64/Averill.app. Archive: travel-desktop/dist/Averill-macOS-arm64.zip. Both are unsigned Apple Silicon macOS artifacts, ignored by Git. Quit older copies before opening the build.
- Rebuild: cd travel-desktop, npm ci, npm test, npm run package:mac. Archive with ditto -c -k --sequesterRsrc --keepParent Averill-darwin-arm64/Averill.app Averill-macOS-arm64.zip from dist. Environment keys remain local; never print or commit them.
- Historical verification for the initial account-document delivery: 19 Node tests passed. Current suite and native checks are recorded in **Verified evidence** above. The folder-opening action has not been manually rehearsed in the latest final app.
- Resolved: the user reported no usable login and missing service keys. The normal Aurelia Demo is now prepared with four working accounts and encrypted local keys; see below. Do not reset existing accounts or reuse /tmp test credentials. New account creation will automatically produce documents.
- Next acceptance: open the final app, sign in using the saved owner document, upload six intake files with the real chooser, review/approve, verify existing account email exclusions and document access, switch through four accounts and reopen documents after restart.
- Product gaps: cloud authentication/sync, unauthenticated owner recovery, invitation delivery, signed distribution, live social publication and structural Canva integration remain unimplemented. Local source data and local login documents are separate from approved company knowledge.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

### Preparation and verification

Quit Averill, then run ./node_modules/.bin/electron scripts/prepare-local-demo.cjs from travel-desktop only for a legacy workspace without credentials. The helper requires local .env.local and encrypted OS storage; it preserves company/admin identity, verifies all four generated passwords, backs up the workspace, saves documents and encrypted keys. It refuses auth-enabled/credential-bearing workspaces, so do not rerun it on the prepared normal workspace.

Verification used normal workspace data and final bundle main/preload/renderers in the installed Electron runtime with environment keys removed: four distinct logins and logout passed, employee/manager access to account documents was denied, both services loaded from encrypted storage and Setup showed configured labels. The actual final .app was directly launched through native computer use and visibly showed the login screen. Nineteen Node tests pass. The real final-bundle chooser rehearsal and company-document AI request remain separate acceptance checks.

Provider authentication checks also passed: Nebius /v1/models returned HTTP 200; Tavily returned five results for the public query Canva Position alignment tools official help. No company document content was sent by these checks. Final native login picker visibly listed all four profiles, and the owner email was prefilled for the user.

## Multisource intake and confidentiality — 27 September 2026

Implemented Desktop/Finder drag-and-drop, local picker, synced Drive/OneDrive files, HTTPS links and registered-client Google Drive/OneDrive OAuth with selected-file browsing. All inputs merge into the local review; adding files re-extracts the unapplied batch. Direct cloud authentication remains unverified and requires client registration. See [CLOUD_CONNECTIONS.md](CLOUD_CONNECTIONS.md).

Company AI defaults off. Owner policy plus explicit per-file permission is required; restricted/credential-looking files and legacy sources without permission are excluded from Nebius. Connecting a drive does not authorize AI. See [COMPANY_CONFIDENTIALITY.md](COMPANY_CONFIDENTIALITY.md) for provider terms and production storage gaps. Local copies are not application-encrypted; do not promise enterprise secrecy, NDA, zero retention or verified opt-out.

New modules: `company-privacy.js`, `remote-import.js`, `cloud-import.js`, `intake-ui.js`; IPC bridges in main/preload. Safe HTTPS resolves and pins public addresses, validates redirects, strips bearer credentials on redirect and bounds files. Cloud tokens/configuration are safeStorage encrypted, scoped to owner/workspace, read-only, expire without refresh and disconnect locally.

25 Node tests pass, including mocked providers and a real local OAuth callback. Native packaged-resource checks passed a real disk-backed File through the drop event/preload, appended a synced XLSX, imported a live public HTTPS demo document, blocked private-network links and unconfigured cloud clients, and verified Setup without horizontal overflow. No live Google/Microsoft authorization or real confidential document transfer was tested. Preserve prepared normal-profile accounts and encrypted service keys. Rebuild app/ZIP after changing sources; app artifact remains `travel-desktop/dist/Averill-darwin-arm64/Averill.app`.

Reproduce the native multisource smoke check with `npm run verify:intake` in `travel-desktop` (GUI and network required); set `AVERILL_NATIVE_APP` to bundled Resources/app to check packaged resources. It creates an isolated temporary profile and uses synthetic/public demo documents, never normal employee data.

## Visible action feedback and company knowledge — 27 September 2026

The desktop has a persistent action banner beneath navigation. Preload emits operation ID/channel/status and sanitized outcome text, with no IPC arguments, keys, tokens, passwords or document text in feedback events. Explicit IPC actions show pending, completion or failure. Local selection cancellation is identified; intake reports received/readable files and warnings, then links to Knowledge. Snapshot refreshes and automatic knowledge queries do not generate action notifications. There is no invented upload percentage: local extraction is synchronous in the main process, preceded by a renderer paint opportunity.

UI refinement: compact header and session strip remain visible in Review; the aperture shrinks for findings; source state uses muted old evidence and ice approved evidence across Review/Campaign Files. Work draft review, Learn starts and Setup onboarding confirmation have a filled primary action. Routine success banners clear after 5.5 seconds; pending, errors and onboarding approval outcomes remain dismissible. The composer document button has a state-specific accessible name. `src/ui-refinements.css` is loaded last in the agent renderer.

Knowledge is a separate tab. Uploaded proposals appear immediately for their owning admin; saved sources obey existing person/department/private visibility. Search covers extracted text and titles; status filters distinguish uploaded, approved, pending, private and superseded. Cards expose local excerpts, readable/unreadable state, version, visibility and AI permission. Full bounded extracted text opens locally in a dialog; saved originals can be opened. Saving and approving sources remain separate from AI permission. Excerpts and search are deterministic local document access, not an AI summary. Logout invalidates in-flight library requests and clears the library and search; backend queries reject unauthenticated callers.

Knowledge previews now strip simple Markdown heading/backtick markers for reading, highlight the query using text nodes, and start on the matching line where possible. The count shows matching documents against the visible total; approval/review counts remain totals for all visible documents.

Modules: knowledge.js (role-filtered local query), knowledge-ui.js and feedback-ui.js; preload operation notifications and main-process knowledge/read-upload IPC. Existing work sharing, learning and external AI boundaries are preserved. Avoid restoring the old silent callbacks or re-enabling intrinsically disabled cloud buttons after onboarding operations.

26 Node tests pass, including upload visibility, text search and exclusion of another person's private personnel evidence. `npm run verify:feedback` passes against source and rebuilt bundle resources: native pending/success/error/cancel, pre-confirmation and approved library, local text reading/search, viewport bounds and logout cleanup in an isolated synthetic profile. `AVERILL_NATIVE_APP` selects final bundle Resources/app. The 28 September source renderer was visually checked in Review (ready/finding), Work, Knowledge search, and Campaign Files v1/v2. This is not a direct launch of the final `.app` executable; the normal user profile is preserved.


## Fake platform demo — 4 October 2026 correction

The owner confirmed that Brevo, Instagram and LinkedIn are local fake pages. Real account sign-in is not a hackathon demo gate. `demo-tools/social-simulator/` now contains a reproducible source copy of the existing sibling simulator, preserving the social profile/feed layouts. Brevo uses fictional Vamo sender/audiences, an intentionally flawed Winter Escapes draft, persisted folders and separate Copenhagen date/time/timezone controls. Unsupported controls are labeled or disabled; no real send occurs.

Simulator tests: 2/2 timezone/date cases and production build pass. Actual Chrome checks passed Brevo creation/edit/preview/scheduling/reload and LinkedIn text save/reload; Instagram image upload/caption editing subsequently passed with the native Chrome picker; save/reload is still unverified. The owner explicitly authorized and completed extension installation. Actual installed extension transport passed for Brevo Email content, LinkedIn Post text and Instagram Caption. Brevo source-backed correction and native Averill Stop passed. The isolated test used fictional sources and no provider request. Full packaged story and remaining installed-browser edge cases are separate; see docs/INSTALLED_EXTENSION_2026-10-04.md.

The source-controlled simulator independently passed npm ci, 2/2 tests and build. npm reports zero vulnerabilities after removal of the unused Tailwind build dependency; its unchanged static reset and MIT license are retained. Brevo Home now uses Vamo, a current Copenhagen calendar and actual local scheduled state instead of fixed September data. This final Home cleanup was build-verified; browser checks above preceded it.

## UI/UX audit and motion proposal — 4 October 2026

The owner requested UI Pro, UI Styling and Genjutsu checks because the next action is often unclear. The actual sign-in/current renderer and an isolated six-area layout audit identified Work/Review flow separation, unclear sharing prerequisites, mixed select styles, filter density, shifting success feedback and missing purposeful motion. See [UI_UX_AUDIT_2026-10-04.md](UI_UX_AUDIT_2026-10-04.md) for precise evidence, priorities, implementation order and three motion variants. Historical audit stage: product code was unchanged at that point. The owner subsequently approved B Guided; the current implementation section at the top supersedes that gate. The Genjutsu workflow required thesis/variant validation; the temporary interactive proposal uses the existing local simulator server. Preserve normal accounts, source/consent boundaries and Averill identity when implementing.

Publication verification: a fresh unauthenticated ZIP download matches the local and GitHub-uploaded SHA-256. [Public-download receipt](review-evidence-2026-10-12/continuation/publication-verification.json).

## Local ticket-fix build — 12 October 2026

The local app and ZIP now include Learn recovery and Knowledge count fixes from `da33f51`. Release verification passes 120 tracked source files, both helpers and 3109 archive entries. SHA-256: `e48aae9bdeef98fefc31e91c7bb6f5a293ea8d90626a8ed5951db4e95966d8f3`. Offline rehearsal on packaged resources passes consent cancellation, correction/revocation, Stop, weekly practice, account isolation and separate-process restart; zero provider requests. The rejected cross-person learning action in the log is an expected assertion. [Build receipt](review-evidence-2026-10-12/ticket-build-continuation/release-verification.json), [rehearsal receipt](review-evidence-2026-10-12/ticket-build-continuation/offline-rehearsal.json).

This remains a local candidate; the public preview is unchanged. Development Electron loading packaged resources does not complete final-executable/clean-Mac/physical-device acceptance.
