# Installed Chrome, accessibility and Canva continuation

19 October 2026. Averill branch: `docs/contextual-ux-plan-2026-10-18`. No merge or public release is part of this increment.

Reading this as: a preserve redesign of a desktop productivity assistant for employees, with calm contextual help and the selected Companion design system. Design variance 3, motion intensity 2, visual density 4. The supplied design-taste skill excludes multi-step product interfaces; its landing-page composition rules are not applied to the app. The ui-ux-pro-max search informed focus, reduced-motion and semantic-control checks; its unrelated generated palette/font suggestions were discarded in favour of the owner-selected foundation.

## Installed browser evidence

Chrome's existing unpacked extension was loaded from the canonical checkout, but still ran 0.1.0. It was explicitly reloaded to 0.2.0 for the initial LinkedIn/Canva tests and finally to **0.2.1** for Instagram. No new host permission was added. The existing `activeTab` and loopback-only connection remain.

The desktop ran `scripts/manual-contextual-qa.cjs` in a temporary synthetic workspace with one approved local rule. Normal credentials, imported documents, approvals and the encrypted provider-key store were not loaded. Company AI remained off; no cloud review was requested. First connection displayed the real native Cancel/Connect dialog; Connect completed. Same-session reconnect completed without another native prompt. This is actual installed Chrome transport, distinct from the simulated transport in the regression harness.

- **Vamo LinkedIn mockup:** cited local finding, Preview, Apply and exact Undo, preserving Unicode, newline and link text. The keyboard reached the card inside the host modal. Preview and Apply restored focus to the next action. No post was saved or published.
- **Vamo Instagram mockup:** local SVG upload, synthetic caption, cited finding, Preview/Apply/Undo using the keyboard, exact caption restoration, Escape dismissed only Averill and returned focus to Caption, Stop removed the companion while preserving the draft. Actual Chrome menu zoom reached 200% (`devicePixelRatio` 4 on a 2x display; CSS viewport 707×393). Card fit and left Caption and Save visible. Zoom was restored to 100%. No post was saved or published. This is the named Vamo mockup, not Instagram account compatibility.
- **Canva web:** the existing dedicated synthetic design was used. Selected design text exposes `.ql-editor[contenteditable=true][role=textbox][aria-label="Text editor in Text"]`. A cited finding, Preview, explicit native-pipeline Apply and exact same-session Undo passed. A second Apply survived an actual page reload: Canva displayed the corrected words after loading. Canva normalizes adjacent spaces when saving. Original visible copy, `Discover curated winter city breaks`, was restored afterwards. No export or publication occurred.

Screenshots: [installed Chrome evidence](review-evidence-2026-10-19/installed-chrome/). These runs used the development desktop. They do not establish matched packaged-executable/clean-Mac acceptance.

## Supported Canva editing boundary

The adapter is restricted to Canva's named web text editor, one paragraph, uniformly formatted span runs and a unique, validated forbidden-phrase removal. It rejects mixed formatting, links, multiple paragraphs, empty/whole-element deletion, unsupported nodes, stale text, intervening typing and changed formatting. It maps character offsets across equivalent span runs and preserves the paragraph/span formatting signature. It uses Chromium native editing commands, waits for the editor update and confirms text/structure/formatting; it never assigns live design HTML.

The first trial revealed Canva's whitespace span normalization and immediate pre-normalization DOM. That trial changed synthetic text but failed confirmation. The adapter now waits for the editor frame, recognizes whitespace-only equivalent runs, and offers previous text for manual recovery after an uncertain write. It does not silently overwrite or retry. Apply/Undo are serialized; Stop/selection changes cannot attach a completed edit to another field.

Native editing commands are a deliberately narrow compatibility dependency, not a general rich-editor API. [MDN's execCommand reference](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) documents their deprecation and undo-buffer behavior. Every new browser/editor version requires acceptance. Canva rich/multiline editing, typography/color/alignment assessment, whole-design review and geometry remain unsupported.

## Accessibility changes and checks

- Keyboard focus can select a draft field; it no longer requires a pointer click.
- The closed-shadow host is keyboard reachable inside host modal focus scopes. Tab stays usable and returns to the draft at card boundaries. Escape is handled before host document capture handlers.
- Card rerenders preserve the current control or move to the next primary action when the old control disappears. A persistent polite status region announces state changes.
- Library source-dialog return focus resolves a stable reader/proposal/compare identity if an asynchronous library refresh replaced the old trigger. If its source disappeared, the search field is the safe fallback. Regression deliberately replaces the original read button before closing.
- Four authenticated synthetic profiles (owner, Marketing lead, Marketing employee, Operations employee) passed source/approval visibility checks. Private employee material remained hidden from the owner and other users. Approved/pending/rejected/superseded/conflicting sources were present for the owner. Each role passed Current work/Library/Learn at 520×850 and 960×820, plus 200% renderer zoom: no page horizontal overflow, no unnamed visible buttons, reduced-motion animations absent. Logout cleared library material. [Receipt](review-evidence-2026-10-19/accessibility/verification.json).

**VoiceOver is still open.** The macOS VoiceOver switch was observed off, turned on for testing and restored off. A conclusive spoken-output/navigation result was not obtained. AX trees and renderer assertions are not a substitute. No complete screen-reader acceptance is claimed. Broader states, all input contrast/target-size checks, OS reduced-motion propagation, physical monitors and full-screen hardware acceptance remain separate gates.

## A/B technical comparison

Only the initial disclosure of findings varied: A opens all three; B shows the first and offers an explicit expansion. Identical engine, approved rules, draft, actions, fonts and palette. This is a scripted QA comparison, **0 human participants**, not a randomized usability result.

| Measure | A: expanded | B: compact |
| --- | ---: | ---: |
| Scripted local review trials, after 3 warmups | 20 | 20 |
| Card height | 844px | 500.17px |
| Initial controls | 13 | 7 |
| Initially visible findings | 3 | 1 |
| First correction: Preview/Apply/Undo | Pass, 3 actions | Pass, 3 actions |
| Routine desktop app switches | 0 | 0 |
| Harness median / p95 | 32.13 / 32.99ms | 32.62 / 33.18ms |

The compact card is about 41% shorter and has 46% fewer initial controls in this scenario. Harness latency includes polling/automation overhead and must not be used as a product p95 or a statistical speed comparison. Both variants preserve the tested correction. B remains the existing default on that technical basis; **simplicity, intuitiveness, perceived trust and human task success are inconclusive**. [A receipt](review-evidence-2026-10-19/ab-expanded/benchmark.json), [B receipt](review-evidence-2026-10-19/ab-compact/benchmark.json). See the updated [experiment plan](AB_TEST_PLAN.md) for the required human study.

## Ticket boundaries

| Scope | New progress | Remaining gate |
| --- | --- | --- |
| CX-03 / #26 | Installed first approval, guided connection and same-session reconnect | Matched packaged restart, expiry/port-conflict lifecycle |
| CX-04 / #27; CX-05 / #28 | Keyboard/focus/Escape fixes; installed edit/Undo/Stop; Instagram 200% capture | Full screen-reader/state/obstruction matrix, matched package |
| CX-06 / #29; CX-07 / #30 | Installed LinkedIn seam; existing Brevo regression retained | Complete installed Brevo and packaged mockup acceptance |
| CX-08 / #31; CX-09 / #32; CX-10 / #33 | Four-role/zoom/source matrix; reader focus fix | Full state/VoiceOver/owner acceptance |
| CX-11 / #34 | Vamo Instagram installed flow and 18-check regression | Final packaged gate; real Instagram remains unverified |
| CX-12 / #35 | Named real Canva adapter, native guards and actual edit/Undo/reload proof | Full failure/formatting/platform matrix and packaged gate; richer text excluded |
| CX-13 / #36 | A/B technical receipts, regression and verified local app/ZIP | Matched packaged-executable story, interaction budget, owner acceptance |

Existing parent acceptance issues remain open. No automatic closure is inferred from a narrower receipt. Human study, clean install, physical displays and owner acceptance cannot be invented by the agent.


## Final local validation

- `npm test`: 89/89.
- `VAMO_PAGE=instagram npm run verify:contextual`: 18 complete-flow checks, zero provider requests; simulated Chrome transport (installed Chrome receipts are separate above).
- `npm run verify:browser`: pass, synthetic extension-client privacy/typing/Stop/logout regression.
- `npm run verify:feedback`: pass, including deliberately replaced Library reader trigger, native source reader/queue/Learn/focus/reduced motion.
- `npm run verify:canva-adapter`: pass, native editing events/Apply/Undo/style, mixed-format/multiline/whole-element/readonly guards and uncertain-write manual recovery; representative DOM, not platform proof.
- `npm run verify:accessibility`: 9 matrix groups covering four authenticated profiles and 36 role/destination/size combinations, plus logout; no complete VoiceOver assertion.
- Both A/B scripted variants pass; no human sample.
- `npm run package:release`: local unsigned arm64 app and ZIP rebuilt; integrity passed for 168 tracked source files, both native helpers and 3157 archive entries. ZIP SHA-256: `916b9fec0af13694eded002831d5d0096569414e7f1126d5978231bc66433c87`.

Packaged-resource `verify:feedback` also passed against the rebuilt resource directory. Resource-level success does not prove launching the final executable with installed Chrome, restart/expiry/port conflicts, a clean Mac or physical monitor/full-screen behavior. No public release was created.
