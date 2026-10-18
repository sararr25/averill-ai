# Contextual UX redesign tickets — 18 October 2026

Epic/specification: [#23](https://github.com/sararr25/averill-ai/issues/23).

All thirteen tickets use `ready-for-agent`. Blocked tickets must wait for their dependencies. The label does not mean that a visual direction has already been selected or platform acceptance has passed.

## Index

| Key | Issue | Blocked by |
| --- | --- | --- |
| CX-01 | [#24 Explore and select the new Averill identity and task compositions](https://github.com/sararr25/averill-ai/issues/24) | None |
| CX-02 | [#25 Add one authority-aware contextual review and edit-proposal contract](https://github.com/sararr25/averill-ai/issues/25) | None |
| CX-03 | [#26 Guide first browser connection and remove routine pairing JSON](https://github.com/sararr25/averill-ai/issues/26) | [#25](https://github.com/sararr25/averill-ai/issues/25) |
| CX-04 | [#27 Show the anchored correction card and expandable in-page panel](https://github.com/sararr25/averill-ai/issues/27) | [#24](https://github.com/sararr25/averill-ai/issues/24), [#25](https://github.com/sararr25/averill-ai/issues/25), [#26](https://github.com/sararr25/averill-ai/issues/26) |
| CX-05 | [#28 Preview, apply and undo one validated suggestion](https://github.com/sararr25/averill-ai/issues/28) | [#25](https://github.com/sararr25/averill-ai/issues/25), [#27](https://github.com/sararr25/averill-ai/issues/27) |
| CX-06 | [#29 Support the real email correction loop in Brevo](https://github.com/sararr25/averill-ai/issues/29) | [#28](https://github.com/sararr25/averill-ai/issues/28) |
| CX-07 | [#30 Support the real organic LinkedIn post correction loop](https://github.com/sararr25/averill-ai/issues/30) | [#28](https://github.com/sararr25/averill-ai/issues/28) |
| CX-08 | [#31 Rebuild desktop navigation and current-work hierarchy](https://github.com/sararr25/averill-ai/issues/31) | [#24](https://github.com/sararr25/averill-ai/issues/24), [#25](https://github.com/sararr25/averill-ai/issues/25) |
| CX-09 | [#32 Separate the company library from source and rule approvals](https://github.com/sararr25/averill-ai/issues/32) | [#31](https://github.com/sararr25/averill-ai/issues/31) |
| CX-10 | [#33 Simplify Learn and complete accessible state design](https://github.com/sararr25/averill-ai/issues/33) | [#31](https://github.com/sararr25/averill-ai/issues/31) |
| CX-11 | [#34 Add and accept a named Instagram caption surface](https://github.com/sararr25/averill-ai/issues/34) | [#28](https://github.com/sararr25/averill-ai/issues/28) |
| CX-12 | [#35 Establish and implement the supported Canva text workflow](https://github.com/sararr25/averill-ai/issues/35) | [#28](https://github.com/sararr25/averill-ai/issues/28) |
| CX-13 | [#36 Accept the packaged contextual flow and interaction budget](https://github.com/sararr25/averill-ai/issues/36) | [#29](https://github.com/sararr25/averill-ai/issues/29), [#30](https://github.com/sararr25/averill-ai/issues/30), [#32](https://github.com/sararr25/averill-ai/issues/32), [#33](https://github.com/sararr25/averill-ai/issues/33) |

## Scoped ticket bodies

These bodies preserve the reviewable acceptance and dependency decisions published to GitHub. They are planning artifacts; the current product has not been changed.

### [CX-01] Explore and select the new Averill identity and task compositions

## Problem Statement

The current interface has weak task hierarchy and the owner requested a complete palette and typography rethink.

## Solution

Compare three distinct visual directions using identical compact-card, expanded-panel, preview, desktop-work, Knowledge and Learn states. Record owner selection before implementing tokens.

## User Stories

1. As an employee, I want to compare three distinct visual directions using identical compact-card, expanded-panel, preview, desktop-work, Knowledge and Learn states. Record owner selection before implementing tokens., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-01. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Produce comparable views on real synthetic task content, including checking, conflict, clear, insufficient evidence and error.
- Specify selected semantic colors, type scale, licensed bundled fonts, spacing, iconography and reduced-motion behavior.
- At 440x660, 520x850, 960x820 and wide desktop, the correction and next action lead; supporting chat and technical details do not compete.
- Keep Averill independent from Vamo; explicitly record which existing design-system rules the selected direction supersedes.
- Obtain selection on concrete visuals; until selected, only exploration is ready to execute.

## Testing Decisions

Visual comparison and keyboard/contrast review of all deliverables. No fabricated runtime or performance proof.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Implementing the whole app, selecting a direction without visual review, and redesigning Vamo.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: None.

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-02] Add one authority-aware contextual review and edit-proposal contract

## Problem Statement

The browser only transports field observations; the existing review entry belongs to the desktop renderer and returns descriptive suggestions.

## Solution

Reuse current review engines through main-process orchestration with a minimal bidirectional extension contract and validated optional edit proposals.

## User Stories

1. As an employee, I want to reuse current review engines through main-process orchestration with a minimal bidirectional extension contract and validated optional edit proposals., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-02. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Bind request/result/patch to person, session, tab, origin, field identity/revision, source authority and request generation.
- Use the existing local review and Nemotron agent; preserve company AI policy, exact citation validation and deterministic fallback.
- Expose only bounded findings, minimum authorized citations, checked scope, result state and exact optional patches; never snapshots, keys or the company library.
- Typing, source revocation/version change, Stop/logout/navigation/expiry invalidate advice and pending proposals; reject late replies.
- Update contributor and architecture rules for the owner-authorized preview/Apply/Undo capability while preserving all other boundaries.

## Testing Decisions

Extend bridge/review contract and high-level browser harness tests for authority changes, stale responses, sensitive-field exclusions, offline zero-network mode and fake-provider consent/fallback.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

A second review engine in the extension, whole-page capture, autonomous edits, and public transmission of internal drafts.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: None.

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-03] Guide first browser connection and remove routine pairing JSON

## Problem Statement

Employees currently copy and paste pairing JSON between applications before selecting a field.

## Solution

Provide guided authenticated connection and a short routine Ask flow using explicit tab and field permission.

## User Stories

1. As an employee, I want to provide guided authenticated connection and a short routine Ask flow using explicit tab and field permission., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-03. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Document the concrete connection protocol and permission impact; preserve loopback-only transport, short-lived credentials and activeTab authorization.
- After initial authorized connection, supported field selection plus Ask requires no JSON paste, Review/Work navigation or repeated work-type choice.
- Show in-page recovery for app unavailable, signed out, expired pairing and unsupported field; prevent reconnection from silently granting persistent access.
- Keep Stop available and distinguish dismissing UI from stopping sharing.
- Do not expose token material to the host page, logs or public snapshots.

## Testing Decisions

Exercise first connection, expiry, reconnect, restart, tab/origin mismatch and Stop through the installed extension and bridge harness. Count routine actions.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Automatic extension installation, silent all-site permissions and persistent passwordless sign-in.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-02](https://github.com/sararr25/averill-ai/issues/25).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-04] Show the anchored correction card and expandable in-page panel

## Problem Statement

Ask Averill currently opens the desktop application, interrupting the draft.

## Solution

Render a compact in-page result with an expandable panel and optional explicit app deep link.

## User Stories

1. As an employee, I want to render a compact in-page result with an expandable panel and optional explicit app deep link., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-04. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- One specific correction leads; source title/version remain visible and exact passage expands in-page.
- Show additional findings as a count/disclosure; put agent steps, chat and technical detail behind secondary actions.
- Anchor away from draft and Send/Publish controls; reposition on scroll/zoom and dock in-page when space is insufficient.
- Distinguish ready/checking/findings/clear/insufficient/failed/unsupported states; feedback within 150ms and waiting status within 300ms.
- Open the full app only through explicit Open in Averill; deep link to the authorized source/context and restore editor focus on close.
- Use isolated styles and minimum authorized citation text; host DOM is not a company-document confidentiality boundary.

## Testing Decisions

Extend browser/UI end-to-end harnesses for states, source detail, deep link, resize/scroll/200% zoom, keyboard, Escape/focus restoration and reduced motion.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Whole-document rendering in third-party DOM and automatically opening the desktop app on Ask.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-01](https://github.com/sararr25/averill-ai/issues/24), [CX-02](https://github.com/sararr25/averill-ai/issues/25), [CX-03](https://github.com/sararr25/averill-ai/issues/26).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-05] Preview, apply and undo one validated suggestion

## Problem Statement

The owner wants direct reversible correction; current suggestions cannot safely modify rich editor content.

## Solution

Add a narrow adapter write capability with exact before/after preview, explicit confirmation, verified outcome and revision-safe Undo.

## User Stories

1. As an employee, I want to add a narrow adapter write capability with exact before/after preview, explicit confirmation, verified outcome and revision-safe Undo., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-05. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Preview the exact affected passage/range, before and after; require an explicit Apply per suggestion.
- Reject stale revisions, changed source authority, wrong field/account/tab, ambiguous repeated text and unsupported rich-text mapping.
- For missing text use a validated explicit insertion point; otherwise provide explanation/manual fallback without pretending Apply succeeded.
- Confirm editor acceptance after the write; preserve links, formatting and all unrelated content.
- Undo restores exact prior content/formatting only if the applied revision still matches; never overwrite intervening typing.
- Recheck the same shared field after applying without expanding capture or performing another write.
- Never submit, send, publish, change recipients, schedule, audience or assets.

## Testing Decisions

High-level editor loop plus narrow patch/undo contract tests: repeated phrases, IME, rerenders, concurrent edits, duplicate clicks, failure-after-write, stale source and intervening typing.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Apply all, arbitrary model tool control, editing source approvals and native desktop app writeback.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-02](https://github.com/sararr25/averill-ai/issues/25), [CX-04](https://github.com/sararr25/averill-ai/issues/27).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-06] Support the real email correction loop in Brevo

## Problem Statement

Fake email editors and field transport do not prove the requested experience in an actual mail tool.

## Solution

Implement and accept a named Brevo draft editor adapter as the first email surface.

## User Stories

1. As an employee, I want to implement and accept a named Brevo draft editor adapter as the first email surface., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-06. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Record exact supported Brevo editor/view, browser and build; infer email context only where reliable.
- From the actual selected draft field show a cited finding in-page, preview, Apply, Undo and recheck.
- Preserve rich text, links and unrelated content; explicitly mark unsupported builders/frames rather than reading the whole page.
- Keep recipient/personnel fields excluded and never send the draft.
- Record real installed-extension evidence including editing invalidation, Stop, source change and app deep link.

## Testing Decisions

Reusable email fixture for deterministic automation plus a manual synthetic draft in the real Brevo editor; no send required. Integrate existing acceptance issue #3.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Gmail/Outlook/all email-builder compatibility, live campaign sending and inferred hidden schedule/audience.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-05](https://github.com/sararr25/averill-ai/issues/28).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-07] Support the real organic LinkedIn post correction loop

## Problem Statement

LinkedIn transport and synthetic company-post fixtures do not establish actual composer editing support.

## Solution

Implement the organic company-post composer adapter with the shared contextual result and reversible correction.

## User Stories

1. As an employee, I want to implement the organic company-post composer adapter with the shared contextual result and reversible correction., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0. Ticket key: CX-07. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Record exact supported real composer/account context and browser/build.
- Show card/source/preview/Apply/Undo/recheck without changing app; reject stale or replaced composer nodes.
- Preserve line breaks, links, mentions and other supported rich content; disable Apply where mapping cannot be validated.
- Use organic LinkedIn guidance; do not apply paid Instagram disclosure rules.
- Capture manual installed-extension evidence for correction, Undo, Stop and deep link; never publish.

## Testing Decisions

Rich-content fixture regression plus actual LinkedIn synthetic draft acceptance, including rerenders and intervening typing. Reference existing #3.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Ads, messaging, autonomous posting and assertions about unobserved fields.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-05](https://github.com/sararr25/averill-ai/issues/28).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-08] Rebuild desktop navigation and current-work hierarchy

## Problem Statement

Review and Work split one activity, and six similarly prominent destinations overwhelm the daily workflow.

## Solution

Implement the selected identity and a single current-work destination with Company library and Learn; separate administration/account controls.

## User Stories

1. As an employee, I want to implement the selected identity and a single current-work destination with Company library and Learn; separate administration/account controls., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P1. Ticket key: CX-08. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Unify share/check/result/recheck in one current-work view for explicit desktop use; normal browser review still stays in-page.
- Use the selected visual tokens and fonts; update the visual source of truth without applying Vamo styles.
- One dominant task action per state; reduce status repetition and default composer prominence.
- Put research, connection diagnostics and technical execution behind context-specific disclosure; preserve capabilities and role authorization.
- Deep links open the right authorized finding/source and preserve navigation context.
- Verify all empty/error/loading/source-changed/logout states at narrow and wide sizes.

## Testing Decisions

Extend current native UI harness and visual captures across employee/lead/admin; keyboard, 200% zoom, reduced motion and focus. Preserve feedback and intake regressions.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Framework migration, removal of existing capabilities and modifying the Vamo website.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-01](https://github.com/sararr25/averill-ai/issues/24), [CX-02](https://github.com/sararr25/averill-ai/issues/25).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-09] Separate the company library from source and rule approvals

## Problem Statement

Knowledge mixes finding documents with extraction, approval forms and operational controls.

## Solution

Create a reader-first library/source detail plus a distinct role-gated approval queue.

## User Stories

1. As an employee, I want to create a reader-first library/source detail plus a distinct role-gated approval queue., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P1. Ticket key: CX-09. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Search/read and source title/version/status lead the library; filters are secondary and details expand on demand.
- Contextual citations deep-link to exact approved passages with current authorization checks.
- Keep pending/rejected/private/superseded sources distinct from approved evidence.
- Approval queue shows the proposal, evidence and allowed decision clearly without crowding ordinary readers.
- Preserve lead/admin scope, reason requirements, personnel privacy and source conflict/version rules.
- Move destructive actions into a clearly separated location with existing confirmation.

## Testing Decisions

Native library/search/reader/approval flow with approved, pending, private, conflicted and superseded synthetic data; cross-person/role access and source-change regression. Reference #2.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Automatic source approval, changed confidentiality policy and wholesale source reimport.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-08](https://github.com/sararr25/averill-ai/issues/31).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-10] Simplify Learn and complete accessible state design

## Problem Statement

Learn stacks content and history while important next steps and status distinctions lose prominence.

## Solution

Show one next learning action, compact history and intentional accessible states across the redesigned shell.

## User Stories

1. As an employee, I want to show one next learning action, compact history and intentional accessible states across the redesigned shell., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P1. Ticket key: CX-10. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Make current lesson/next step primary; history, detailed explanations and repeated external guidance are secondary.
- Preserve owner-scoped records, Copenhagen week keys, explicit reflection confirmation and source eligibility.
- Keep destructive history action separate and confirmed; do not infer Canva mastery from text access.
- Inventory and design empty/loading/failed/completed/disabled states, visible focus, labels, status announcements and reduced motion.
- Capture populated states at narrow/wide layouts and test keyboard/screen-reader flow at 200% zoom.

## Testing Decisions

Existing learning unit/native harnesses plus role/person isolation, stale-source/eligibility behavior and manual accessibility evidence. Reference #5 and #6.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

New learning engine, inferred performance scores and cloud learning sync.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-08](https://github.com/sararr25/averill-ai/issues/31).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-11] Add and accept a named Instagram caption surface

## Problem Statement

The owner needs the same in-page help for Instagram, but generic field access does not prove every caption workflow.

## Solution

Implement the shared card and reversible edits in one explicitly named actual Instagram caption/composer surface.

## User Stories

1. As an employee, I want to implement the shared card and reversible edits in one explicitly named actual Instagram caption/composer surface., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P1. Ticket key: CX-11. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Record the precise product/view/account context and browser; distinguish Instagram web from third-party schedulers.
- Demonstrate cited guidance, preview, Apply, Undo, recheck and Stop in the actual supported surface.
- Apply relevant approved Instagram rules without inferring hidden publication, audience or visual state.
- Preserve caption formatting and unsupported-field detection.
- Keep this follow-up visibly pending until real acceptance passes.

## Testing Decisions

Caption fixture automation plus installed-extension manual synthetic draft evidence; no publication. Reference #3 for shared privacy acceptance.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

All Instagram surfaces, mobile apps, automatic publishing and visual creative assessment.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-05](https://github.com/sararr25/averill-ai/issues/28).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-12] Establish and implement the supported Canva text workflow

## Problem Statement

Canva design text may not be an ordinary DOM field, and text capture cannot establish layout or geometry correctness.

## Solution

First establish a supported text-selection/edit access method, then implement contextual advice and reversible text correction in that named workflow.

## User Stories

1. As an employee, I want to first establish a supported text-selection/edit access method, then implement contextual advice and reversible text correction in that named workflow., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P1. Ticket key: CX-12. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Record feasibility for exact Canva editor/text surface, selection/rich-text access and required permission changes using synthetic design content.
- If DOM access is unavailable, document a dedicated capability proposal; do not silently substitute an app-switch flow or claim support.
- When feasible, demonstrate the in-page card, citation, preview, explicit Apply, Undo and recheck on real design text.
- Preserve styling and unrelated elements; restrict Apply when the adapter cannot validate the change.
- State separately that color, alignment, typography/geometry and whole-design assessment are unimplemented unless independently specified and verified.
- A feasibility report alone does not close implementation acceptance; record a concrete blocker if the target is inaccessible.

## Testing Decisions

Selected design-text fixture where representative plus actual Canva synthetic design acceptance; prove formatting retention and no export/publication side effect. Reference #19 only for separate OCR boundaries.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Claiming OCR proves geometry, arbitrary Canva control and replacing manual design acceptance with self-confirmation.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-05](https://github.com/sararr25/averill-ai/issues/28).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.


### [CX-13] Accept the packaged contextual flow and interaction budget

## Problem Statement

Previous tests prove individual modules and synthetic flows, not the owner-requested complete in-page experience.

## Solution

Verify matched packaged desktop/installed extension versions, measured workflow efficiency and actual-platform evidence.

## User Stories

1. As an employee, I want to verify matched packaged desktop/installed extension versions, measured workflow efficiency and actual-platform evidence., so that help fits my work.
2. As the product owner, I want independently verifiable acceptance, so that completion reflects the real experience.

## Implementation Decisions

Priority: P0 gate. Ticket key: CX-13. Follow the owner-confirmed contextual review specification dated 18 October 2026.

- Run appropriate unit, browser, native UI, feedback, intake and packaged-resource regressions with isolated synthetic profiles.
- In actual Brevo and LinkedIn after setup: field selection plus one Ask produces guidance in-page, preview/Apply/Undo/recheck work and the full app opens only explicitly.
- Record action counts, zero routine app switches, feedback <=150ms, pending label <=300ms and target p95 local result <=1s on a named machine; measure cloud latency separately.
- Verify Stop/logout/expiry, source/version changes, consent cancellation, cross-tab/person isolation and stale replies over the complete seam.
- Manual keyboard/screen reader/reduced-motion/200% zoom and editor-obstruction evidence accompany captures and build identifiers.
- Stage phase-one acceptance for email/LinkedIn and desktop; keep Instagram/Canva scope open until CX-11/CX-12 pass, then record full four-platform acceptance.
- Link existing #3/#6/#7/#9/#19/#20 gates without closing or rewriting them during synthesis.

## Testing Decisions

One end-to-end extension/bridge/review/adapter seam plus targeted lifecycle/patch contracts. Synthetic tests and real-platform receipts reported separately. No recording or public release required by this ticket.

Test observable outcomes, not private implementation structure. Preserve isolated synthetic profiles and distinguish actual-platform proof.

## Out of Scope

Publishing a release, submitting Devpost, claiming four-platform readiness from two-platform evidence and modifying existing parent acceptance issues.

## Further Notes

Epic: https://github.com/sararr25/averill-ai/issues/23

Blocked by: [CX-06](https://github.com/sararr25/averill-ai/issues/29), [CX-07](https://github.com/sararr25/averill-ai/issues/30), [CX-09](https://github.com/sararr25/averill-ai/issues/32), [CX-10](https://github.com/sararr25/averill-ai/issues/33).

The owner selected in-page card/panel, preview/Apply/Undo, email and LinkedIn first, a full identity rethink, and actual-platform acceptance. This issue is planning; implementation has not been claimed.
