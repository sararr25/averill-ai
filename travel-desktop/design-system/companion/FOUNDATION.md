# Averill Companion — selected visual foundation

**Owner selected direction 03 Companion on 18 October 2026.** This is the visual target for CX-04 and CX-08. The existing product still renders the legacy petrol/coral/ice identity until those implementation tickets land. This document and its scoped tokens supersede the old visual direction for new design work; they do not claim a runtime migration.

## Identity

A quiet companion, visibly separate from the tool and company it supports. Dark plum creates a contained, calm surface; pale lime identifies the next action. Round contours soften the utility without turning it into a chat toy. The employee's draft is the working surface; Averill makes one intervention at a time.

- Product name and wordmark: **Averill**, set in locally bundled Plus Jakarta Sans 600 with tracking −0.045em. Keep the capital A; do not introduce a different product name.
- Mark: the local [vector mark](mark.svg), a lowercase a drawn as a bowl and stem inside a lime rounded square. Use upright geometry for clarity at small size; no font dependency, sparkle or animated idle glow. This is the developed mark for this foundation, not a claim of trademark clearance.
- Mark sizes: 24px in a contextual card, 28px in desktop navigation, 40px minimum in brand presentations. Allow at least one-quarter of the mark width as surrounding clear space. At 16px use the bowl/stem silhouette without additional strokes.
- Wordmark and mark stay quiet; a large product logo must never precede the correction.
- Averill's identity is independent from Vamo. No Vamo palette, Fraunces/DM Sans pairing, logo or navigation is reused.

## Semantic color and type

Use [tokens.css](tokens.css); avoid scattering new hex values through feature CSS. Sources use normal readable text, a document icon, approval status and version. Lime identifies action, selected navigation, keyboard focus or a labelled success, not every link. Warm peach means a finding needs attention. Pink-red is reserved for a labelled error. Do not equate a model suggestion with source approval.

| Role | Token | Value |
| --- | --- | --- |
| Canvas / host-independent surround | `--av-canvas` | `#211F2A` |
| Card / principal surface | `--av-surface` | `#2B2835` |
| Source object / selected grouping | `--av-surface-raised` | `#35313F` |
| Hover | `--av-surface-hover` | `#403A4C` |
| Primary text | `--av-text` | `#F3F1F8` |
| Supporting text | `--av-text-secondary` | `#B8B2C6` |
| Decorative divider | `--av-border` | `#484351` |
| Input/control boundary | `--av-control-border` | `#8E879B` |
| Primary action / focus | `--av-accent` | `#D6EF91` |
| Action text | `--av-on-accent` | `#242A1B` |
| Finding text / surface | `--av-warning` / `--av-warning-soft` | `#FFC794` / `#44362E` |
| Error text / surface | `--av-error` / `--av-error-soft` | `#FFB8BF` / `#492E38` |

Only Plus Jakarta Sans is required for the selected identity. Its variable font and OFL license are already bundled in the design study. Runtime implementation must copy the licensed font into its normal bundled assets; never make a network font request.

| Job | Size / line-height | Weight |
| --- | --- | --- |
| Card finding / preview title | 24px / 31px | 600 |
| Desktop page title | 32px / 40px | 600 |
| Section heading | 18px / 26px | 600 |
| Advice, draft excerpt and source passage | 14px / 22px | 400 |
| Button / source title | 13px / 20px | 600 |
| Metadata and state label | 12px / 18px | 500 |
| Wordmark | 23px / 29px | 600 |

Long finding titles wrap naturally. Do not shrink them to fit one line. Avoid uppercase sentences; uppercase may appear only in short secondary state labels. Use at least 14px for actual advice and source passages even though the initial comparison study used smaller text to fit presentation boards.

## Geometry and hierarchy

Base spacing 4px; normal steps 8, 12, 16, 20, 24, 32px. A contextual card is normally 360px wide, within a 320–400px range, with 20px padding and 22px corners. It expands into a 400–440px in-page panel with 18px corners. Controls use 12px corners; the one primary action can use a full pill. Use a 44px minimum action hit area, including icon-only Close. Keep content readable on a 440px viewport without horizontal scrolling. At 200% zoom, dock rather than overlap the draft and its controls.

Reading order: quiet context → correction title → short reason → exact observed text → primary action → cited source → secondary app link / Stop. One action is visually dominant. Stop stays labelled and available, even though it is not a second filled CTA. More findings use a count and a disclosure. The complete company document stays in Averill, with only minimum authorized citation text in the host page.

## Component contract

### Compact contextual card

Header: small mark/wordmark, shared-field indicator and labelled Close. Main: one useful correction, short reason and observed phrase. Primary: Preview change. Footer: source title, approved version, in-page exact passage expansion; explicit Open in Averill; Stop sharing. Closing the card only dismisses it. Stop ends sharing and clears advice.

### Expanded panel

Same card hierarchy, with additional findings, Why this matters and What was checked sections behind explicit expansion. Details do not require opening the desktop app. Restore focus to the expansion control on close/Escape. Never cover Send/Publish or the selected passage; choose a different anchor/dock position when necessary.

### Preview, applied state and Undo

Preview: precise Before/After text and scope, then Apply change. Keep Back to suggestion secondary. After a verified write: Change applied, Nothing was sent, Undo and Recheck. Undo is visually prominent until used or invalidated. If the editor has changed, block restoration and explain the conflict; the design must never suggest that old advice is still safe to apply.

### Source object

One raised, rounded object with a consistent document icon, title, approval status, version and disclosure. Expansion shows the exact passage, not an invented summary. No source means a distinct insufficient-evidence state. Unknown, revoked and superseded sources cannot use approved wording.

### Desktop app

Quiet sidebar with Current work, Company library and Learn. Account, connections, research and administration are contextual or secondary destinations. Current work unifies sharing/capture, check, result and recheck. Library opens with search and approved sources; source/rule approvals live in a separate role-gated queue. Learn shows one next activity, with history and destructive controls secondary. Preserve all roles and authorization checks.

## State inventory and copy

| State | Leading copy | Available next action |
| --- | --- | --- |
| Disconnected | Connect Averill to this draft. | Guided connection; no raw token/JSON |
| No field selected | Choose the text you want to review. | Select supported field |
| Ready | Ready to check this text. | Ask Averill |
| Checking | Checking your draft. | Stop; labelled waiting state |
| Finding | Remove the price guarantee. | Preview change; source expansion |
| Several findings | 3 suggestions for this draft. | First finding + expand remaining |
| Preview | Review this change. | Apply change; Back |
| Applying | Applying this change. | Pending action disabled; no duplicate write |
| Applied | Change applied. Nothing was sent. | Undo; Recheck |
| Undo completed | Previous text restored. | Recheck |
| Draft changed | Ready for a fresh check. | Recheck; stale Apply unavailable |
| Source changed | The company guidance changed. | Review against current source |
| Edit / Undo conflict | Your draft changed after this suggestion. | Fresh review; explicit manual recovery |
| No conflict | No conflicts found in checked text. | Check another selection; checked scope |
| Insufficient evidence | No approved source yet. | Company library; no green all-clear |
| Unsupported editor | This editor is not supported yet. | Explain supported path; no fake clean result |
| Connection / provider error | The check could not finish. | Retry; local fallback where available |
| AI consent needed | Review what will be sent to Nebius. | Confirm or cancel inside the page |
| Stopped | Sharing stopped. | Start a new explicit sharing session |
| Empty library | No approved documents yet. | Role-appropriate next action |
| Empty search | No documents match that search. | Clear/search again |
| Empty Learn | No practice ready yet. | Eligible next step; no invented progress |

Error, checking, success and insufficient-evidence states have explicit labels and are not communicated by color alone. Disabled actions retain readable text and explain their prerequisite nearby. Source approval remains a human decision.

## Interaction and accessibility

Use semantic buttons, inputs, dialogs and labelled disclosures in the existing HTML/CSS/JavaScript stack. Keyboard order follows reading order; focus is a 3px lime outline with at least 3px separation. Announce review/apply/undo results with a polite live region without stealing focus. Escape collapses detail/panel and returns to its opener. Never trap focus in an in-page card that is not modal.

Hover and immediate feedback use 140ms; panel reveal uses 220ms, the scoped ease token, opacity and a maximum 4px translate. No bounce, persistent pulse, gradient atmosphere or idle animation. Under reduced motion, remove transforms/spinner animation and retain text status. Never delay an actionable result for an entrance sequence.

Calculated core Companion contrast from the study: primary text 12.86:1, secondary 7.01:1, primary action 11.68:1, observed phrase 7.64:1. New error/control pairs and all rendered small states need their own checks in implementation. A calculation is not full screen-reader or platform acceptance.

## Scope and implementation handoff

The owner selected the visual direction; the initial preview remains a synthetic design artifact. The refined typography, vector mark and complete state inventory here are the implementation foundation. CX-01 covers the design specification; runtime migration belongs to CX-04/CX-08. Browser contract, connection, safe write/Undo and real-platform adapters retain their own dependencies and acceptance. Do not close those tickets on the basis of these mockups.

Read the [interactive study and visual evidence](../../../docs/design-explorations/2026-10-18-identity/README.md) alongside this specification. Retain the old petrol/coral documents as implementation history; new UI work targets Companion. No normal account, source approval, credential or Vamo asset is changed by adopting this specification.
