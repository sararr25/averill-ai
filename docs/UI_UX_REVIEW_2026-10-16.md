# Averill UI/UX review and improvement plan — 16 October 2026

Scope: full review of the Averill desktop app ahead of the Nebius x NVIDIA submission (deadline 30 October 2026, 17:00 UTC). Inputs: README, PROJECT, ARCHITECTURE, UI_UX_AUDIT_2026-10-04, PRODUCT_DEMO_PLAN, RECORDING_SCRIPT, SUBMISSION_REQUIREMENTS, TESTING_CHECKLIST_2026-10-12 and the native screenshots in `review-evidence-2026-10-12/`. No code was changed and the app was not relaunched for this review; findings come from the most recent native captures plus the documented state after the 4 October Guided UI pass.

Judging includes **design** and **potential impact**, and judges mostly see the app through a sub-three-minute video. The plan therefore puts what shows up on camera first.

## What already works

- The Petrol / Coral / Ice palette has good text contrast (15.4:1 primary, 7.5:1 muted). Controls are 40px with visible focus.
- Privacy is honest and explicit: Share/Stop, consent, local-only labels.
- The 4 October audit fixes landed: Review has a start action, external results show up in Review, filters are behind a disclosure, and Setup is grouped.

## Findings

Severity: **P0** hurts the demo/video or causes misunderstanding · **P1** clear usability cost · **P2** polish.

| # | Sev | Where | Problem | Proposed change |
| --- | --- | --- | --- | --- |
| 1 | P0 | Review, clean result | "Rule check completed." then "Use the evidence below to edit…", but nothing is below it, then "No exact rule conflict found… This is not a full content, layout or publication check." The success state reads like a warning, and the copy contradicts itself. | A dedicated **All clear** state: ice check icon, "No conflicts with approved rules", one line about *what was checked* (field, source, version) and one about *what wasn't*. Only show the "evidence below" copy when findings exist. |
| 2 | P0 | Review header area | Sharing status appears three times (OBSERVING pill, "Shared browser field · Marketing email", status banner), while **Stop sharing** is a small outlined button. The most important privacy control has the least visual weight. | One **session bar**: live dot + "Sharing: Brevo · email body" + a clearly visible Stop button. The pill in the title bar shows only state. Remove the duplicates. |
| 3 | P0 | Status banner | "Checking approved work rules: completed." repeats the headline below it. The 40px × button takes up a full row. | Hide the banner when the result is already visible in the area itself. Keep it for errors, cancellations and work in other tabs. Use a small dismiss icon. |
| 4 | P0 | Composer / Nebius | **NVIDIA Nemotron, the feature required by the hackathon, is hidden** behind a small "Enable Nebius AI" link at the bottom. The model is never named until after a review. | An "AI assist" toggle next to the composer: "Nemotron via Nebius · off". When it's on, it states what gets sent. Every AI suggestion gets a "Nemotron suggestion · validated against [source]" chip, visually separate from local rules. |
| 5 | P0 | Wide window (≈2000px) | Text runs to ~1000px per line, tabs are spread across the full width, the aperture floats alone in the centre, and the lower half of the screen is empty. On video the app looks unfinished. | Content max-width ~720px, centred. Tabs grouped on the left. Aperture next to the "Averill" wordmark, not in the content. Set a recording window size (e.g. 520×850 or 960×820, already tested). |
| 6 | P1 | Navigation | Six tabs with the same weight for every role. Research/Knowledge/Setup are rare or admin-only tasks, yet employees see them as equals to Review/Work. | Primary: **Review · Work · Learn**. Secondary (smaller, or in a menu): Knowledge, Research, and Setup (admin only). Optional badge on Knowledge when approvals are pending. |
| 7 | P1 | Review + Work | Review = results, Work = sharing controls. The user has to bounce between two tabs for one flow (share → check → fix → recheck). | Treat it as one flow: when nothing is shared, Review shows the 3-step start inline (choose window/field → check → fix). Work stays for advanced options (OCR, pairing, task type). |
| 8 | P1 | Learn | "Delete my local learning history" sits right under the primary CTA with almost the same weight. A wrong answer has no clear right/wrong marker. "Open official Canva guide" repeats on every question. | Move the destructive action to the bottom of History, styled as a danger action with confirmation. Each answer gets a status (✓ correct / ↺ try again) with an icon and colour. One guide link per lesson. |
| 9 | P1 | Knowledge | The counter line is jargon ("0 upload proposals · 0 awaiting your decision in these results · 4 approved"). "Delete local source copy" has the same weight as "Read". Approval details expanded by default are noisy. | Status chips: `4 approved · 0 to review`. Actions: primary Read, secondary Open original, Delete in an overflow menu. Approval details collapsed. |
| 10 | P1 | Copy (whole app) | Limitation disclaimers are written differently on every screen ("not a full content, layout…", "not an employee performance or mastery score…"). Honest, but it reads as anxious and wordy. | One reusable **"What Averill checked"** component (Checked / Not checked) with the same wording everywhere. Copy rules: one sentence, active voice, no double negatives. |
| 11 | P1 | Findings (conflict state) | Not captured in a native screenshot (the 4 Oct audit warns that `review-finding-520.png` is not a finding). It's the core of the demo but has no fresh visual proof. | Capture and review the conflict state: observed text (coral highlight) → approved rule (ice citation with version) → suggested correction → Copy / Recheck. Check it at 520 and 960. |
| 12 | P2 | Floating companion | Separate style, documented but never seen in recent screenshots. On video it's the "always there" point. | Check consistency with the session bar (#2): same live dot, same Stop. |
| 13 | P2 | Accessibility | VoiceOver, full keyboard traversal and OS Reduce Motion still unverified (already open in the checklist). | Do them after the visual changes, before the final recording. |
| 14 | P2 | Motion | B Guided is approved; the result entry is the moment that matters on video. | Make sure the conflict → recheck → all-clear transition is readable on camera (no change to timings). |

## Plan

Constraint: no new dependencies, and keep the existing Electron HTML/CSS/JS plus `design-system/tokens.css`. Don't touch IPC, consent or invalidation. Run `npm test` (47/47) and the existing verify scripts after every phase.

### Phase 1 — Video blockers (P0) · target 20 Oct
1. Clean-result state and copy (#1), plus the shared "What Averill checked" component (#10).
2. Unified session bar with prominent Stop; slim down the banner (#2, #3).
3. Visible Nemotron toggle and AI suggestion chip (#4).
4. Content max-width, grouped tabs, aperture in the header (#5).
5. Fresh native captures: all-clear, conflict (#11), AI suggestion, Stop — at the recording size.

### Phase 2 — Flow clarity (P1) · target 24 Oct
6. Primary/secondary navigation by role (#6).
7. Inline start in Review; Work as the advanced area (#7).
8. Learn: destructive action moved, answer states (#8).
9. Knowledge: chips, action hierarchy, details collapsed (#9).

### Phase 3 — Polish and verification · target 27 Oct
10. Companion aligned with the session bar (#12); check motion on camera (#14).
11. Keyboard, VoiceOver, Reduce Motion (#13); layouts at 440/520/960.
12. Rebuild with `npm run package:release` and run a manual rehearsal of the 2:50 script on the final executable, then record. The video then has 3 days of slack before the 30 Oct deadline.

### Verification for each phase
- `npm test`, `verify:feedback`, `verify:task-review`, `verify:browser`.
- Native screenshots in an isolated profile, compared with the previous ones.
- No new claim beyond what is actually verified (AGENTS.md rules).

## Phase 1 status — 16 October

Implemented #1–#5 and #10: all-clear state, a shared Checked / Not checked block, a live session bar with a coral Stop, the success banner hidden when the result is already visible, a "Nemotron AI: on/off" toggle plus a "Nemotron suggestion" chip, a 760px content column and left-grouped tabs. `npm test` 47/47; `verify:feedback` and `verify:browser` pass (one earlier `verify:feedback` timing flake did not reproduce in two reruns). `verify:task-review` and `verify:external` fail with "Failed to get sources" both before and after this change: the session lacks macOS Screen Recording permission, so they were not verified here. Screenshots were taken in an isolated profile using the browser-field path. The findings layout was checked with a synthetic renderer-only result, not a real rule match or a live Nemotron call. Native capture of a real conflict (#11) remains open.

## Phase 2 status — 16 October

Implemented #6–#9: Review · Work · Learn as primary areas with Knowledge · Research · Setup visually secondary after a divider (all still reachable for every role, so access is unchanged); a numbered Share → Check → Fix start in Review that replaces the old one-line instructions; Learn answers marked "✓ Correct" / "↺ Not quite" and the history deletion turned into a separated danger link (confirmation unchanged); Knowledge counts shown as chips, with an attention style when items need review, and the source deletion styled as a danger link. Approval details were already collapsed by default. `npm test` 47/47; `verify:feedback` and `verify:browser` pass. Review idle, Knowledge and Learn were checked at 520px in an isolated profile. The Learn answer badges and the deletion link were not captured on screen (that needs a completed weekly quiz); the Knowledge chips were only seen with an empty library. A role-based Knowledge badge for pending approvals was not added.

## Phase 3 status — 16 October

- #12: the floating companion now matches the session bar. While work is shared it shows a coral live dot, the coral Stop becomes the main button and Ask Averill steps back. Checked in an isolated profile: it turns on when a browser field is shared and clears after Stop.
- Layout: 18 samples (six areas × 440×660, 520×850, 960×820) with no horizontal overflow in the document, the main area or the navigation.
- Keyboard: tabbing through Review gives a visible focus indicator on every focused control, in a logical order (Sign out → areas → start → composer → Nemotron toggle).
- Reduced motion: under an emulated `prefers-reduced-motion: reduce`, button and feedback transitions compute to 0s.
- `npm test` 47/47; `verify:feedback`, `verify:browser` and `verify:intake` pass. `npm run package:release` rebuilt the local unsigned arm64 app/ZIP and verified 120 tracked files, both helpers and 3109 entries (SHA-256 `00fe52cd53a8767488add5a1162f8db8a2c70a7829d3658a6ce31a03210f61e2`). `verify:rehearsal` passes on packaged resources.

Not done, needing a person or permissions this session lacks: VoiceOver, the real OS Reduce Motion setting, Screen Recording-dependent checks (`verify:task-review`, `verify:external`), the manual 2:50 rehearsal on the final executable, and the recording. The public GitHub release was not changed; the new ZIP is a local candidate only.

## Follow-up — 17 October

A further UI pass and self-test, with draft tickets for what is still open, is in [UI_TEST_REPORT_2026-10-17.md](UI_TEST_REPORT_2026-10-17.md).
