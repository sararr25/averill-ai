# Averill UI pass and self-test — 17 October 2026

Follows [UI_UX_REVIEW_2026-10-16.md](UI_UX_REVIEW_2026-10-16.md). Every check below ran in a temporary isolated profile with synthetic data; normal accounts, sources and keys were not touched. No AI or Tavily request was sent. Screenshots and the test script are in [review-evidence-2026-10-17/](review-evidence-2026-10-17/).

## What changed

| Area | Change |
| --- | --- |
| Review headline | Focus still moves to the headline after a check (screen readers announce it), but no outline box is drawn. |
| Header | Aperture moved next to the "Averill" name; the floating aperture in Review is gone. Sign out is a quiet text link. The NOT SHARING / OBSERVING pill hides in Review while the coral live bar shows. |
| Composer | The meaningless document icon is now a labelled "Choose work" (or "Source") button. The "Company sources · no demo window shared" jargon line is removed. |
| Review states | New **Ready to check** state: after the employee edits shared text, Review says the latest text is connected and offers "Check approved rules" directly, instead of falling back to "Ready when you are". |
| First run | Until the company has an approved source, Review shows "Add and approve company files" as step 1 and the main button opens Setup. Employees are told to ask their admin. |
| Disabled controls | Disabled buttons now look disabled (42% opacity). Before, Stop sharing and both check buttons looked active with nothing shared. |
| Banner noise | Success banners for the rule check and window sharing are no longer repeated; the result is already visible. |
| Copy | Learn, Knowledge and Research boundary paragraphs replaced with the shared Checked / Not checked block. Monospace section subtitles became small uppercase labels. Review idle copy no longer repeats the steps. |
| Setup | File-format note moved under "Add company files"; empty containers hidden; tab top padding reduced. |

## Test results

| Check | Result |
| --- | --- |
| `npm test` | **47/47 pass** |
| `verify:feedback`, `verify:browser`, `verify:intake` | **Pass** |
| End-to-end UI script (real approved source → browser field with "lowest prices guaranteed" → check → edit → recheck → Stop) | **15/15 pass**: conflict lands in Review with observed text, source and version; editing invalidates it; Review offers the recheck; the fixed draft is all clear; Stop clears observation, pairing and advice |
| First run, empty workspace with real sign-in | **Pass**: four steps with "Add" first; button opens Setup; Sign out is the text link |
| Layout 6 areas × 440×660 / 520×850 / 960×820 | **18/18**, no horizontal overflow |
| Keyboard tab order in Review | Visible focus on every control: Sign out → areas → start → Choose work → question → Nemotron toggle |
| Emulated reduced motion | Transitions compute to 0s |
| Floating companion | Turns live when a field is shared, clears on Stop |
| `package:release` + `verify:rehearsal` | **Pass**: 120 files, both helpers, 3109 entries, local ZIP SHA-256 `07436b44b3f03049422fa875cbab94e51f17ea93685c9306bdbbfcd021278c16`; packaged-resource rehearsal passes |
| `verify:task-review`, `verify:external` | **Not run successfully**: "Failed to get sources", because this session has no macOS Screen Recording permission (same result before these changes) |

Not verified by me: VoiceOver, the real OS Reduce Motion setting, the window-capture (OCR) path, Nemotron in the new UI, and the manual 2:50 story on the final executable. The public GitHub release is unchanged.

## Still not satisfying

These are drafted as tickets below for the owner's review. Nothing has been filed on GitHub yet.

### Draft tickets

**T1 — Reword the conflict result copy** · UX copy · small
The status line reads "Exact company rules matched the visible text. Check the surrounding editor state before acting." and the footer finding starts "Check whether this required text belongs in the draft". Both sound like system output. Acceptance: one plain sentence per finding ("Remove the price guarantee", "Add the required footer"), same evidence underneath; the e2e script still passes.

**T2 — Show how many corrections there are and keep them in view** · UX · small
At 520px the second finding sits under the composer, with nothing saying there is more than one. Acceptance: "2 corrections" count under the headline; the first finding fully visible at 520×850; the list scrolls without hiding the composer.

**T3 — Name the real site and field in the live bar and companion** · UX · medium
Both say "Shared browser field · Marketing email"; the companion truncates to "Watching Shared browser field · r…". Acceptance: show page origin and field label from the browser bridge (e.g. "Brevo · Email body"); companion text fits 208px; no new data leaves the main process.

**T4 — Prove the missing-footer finding explicitly** · test coverage · small
The e2e assertion for the footer passed by matching "unsubscribe", which also appears in the source quote. Acceptance: assert a footer finding exists before the fix and is gone after it.

**T5 — Simplify Work actions** · UX · medium
Work still shows browser pairing, app window, captured text, task type, "Read and recheck locally" and "Check approved rules" in one long page. The two check buttons look interchangeable. Acceptance: one primary check action per state; the local recheck appears only after a result; Work's height at 520px drops noticeably; the browser and task-review checks still pass.

**T6 — Hide unconfigured cloud imports from first-time admins** · UX · small
Setup lists "Google Drive · Client setup needed" and "Microsoft OneDrive · Client setup needed", which read as broken features to a judge. Acceptance: group them under "More import options" (collapsed), or show them only when a client ID exists; the intake check still passes.

**T7 — Plain-language Learn copy** · UX copy · small
"use Work for explicit OCR capture", "Week beginning 2026-10-12 · Europe/Copenhagen" and "Ask about a Canva lesson step or inspect selected visible text" are technical. Acceptance: copy rewritten for an employee ("This week", no OCR jargon); learning tests pass.

**T8 — Smaller banner dismiss button** · UI · trivial
The banner's × sits in a 36px bordered square that dominates the row. Acceptance: borderless icon button with a ≥32px hit area and visible focus.

**T9 — Capture Learn answer states and Knowledge chips with real data** · verification · small
The ✓ Correct / ↺ Not quite badges, the moved history-delete link and the Knowledge chips with approved/pending items were never seen on screen. Acceptance: screenshots from an isolated profile with a completed weekly quiz and a mixed library; fix anything that looks wrong.

**T10 — Screen Recording path and OCR in the new UI** · verification · medium · relates to #7
Rerun `verify:task-review` and `verify:external` with Screen Recording granted; check that the Ready to check state and live bar behave the same for an app window as for a browser field.

**T11 — Owner-only acceptance** · verification · relates to #6, #9
VoiceOver pass, the real OS Reduce Motion setting, the Nemotron consent flow in the new composer toggle, and the 2:50 rehearsal on the final executable. These need the owner's Mac and permissions.

Suggested order: T1–T4 before recording (on camera), then T5–T8, then T9–T11.
