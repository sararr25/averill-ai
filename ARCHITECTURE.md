# Averill system design

## Purpose and status

This document describes the implemented hackathon prototype and the boundaries for extending it. The current app is an Electron desktop demo with four supplied Elseweek work windows, a local company workspace, owner-scoped guided learning and weekly practice, and explicit one-frame OCR of a selected external Canva window. General continuous external application observation remains a future milestone.

## Requirements

| Requirement | Current implementation |
| --- | --- |
| Explicit employee choice of shared work | Per-window Share/Stop controls in the Averill window |
| Feedback at a natural pause | Work windows send state after blur or selection change |
| Source-backed corrections | Deterministic findings carry a local source object |
| Campaign questions | Local lookup; optional Nebius source-constrained answer |
| Human control | No automatic edit, send, or publish route |

## Components

| Component | File | Responsibility |
| --- | --- | --- |
| Main process | `travel-desktop/main.js` | Creates windows, tracks open/shared state, computes snapshots, registers IPC handlers |
| Preload bridge | `travel-desktop/preload.js` | Exposes narrow `window.desktop` methods to sandboxed renderers |
| Averill renderer | `travel-desktop/src/agent.html`, `agent.js` | Window list, findings, question composer, source viewer, AI opt-in |
| Work renderer | `travel-desktop/src/work.html`, `work.js` | Synthetic email, social, handover fields and explicit draft save |
| Rule engine | `travel-desktop/src/engine.js` | Pure issue checks and local campaign answers |
| AI adapter | `travel-desktop/src/assistant.js` | Nebius model discovery, answer request, citation ID validation, local fallback |
| Source registry | `travel-desktop/src/campaign.js` | Maps fixed source IDs to local source files and assets |
| Design system | `travel-desktop/design-system/` and `src/agent-theme.css` | Approved visual tokens and implemented assistant styling |
| Company workspace | `travel-desktop/src/workspace.js` | Local people, role switching, imported copies, approval, priority, and conflict detection |
| Company answers | `travel-desktop/src/workspace-answer.js` | Approved-source retrieval, Nebius request, citation ID validation, local fallback |
| Learning engine | `travel-desktop/src/learning.js` | Owner-scoped sessions, ordered confirmation, weekly eligibility, practice and feedback |
| Learning UI | `travel-desktop/src/learning-ui.js` | Learn lesson/help, activity recording, weekly review and answer forms |
| Public search | `travel-desktop/src/web-search.js` | Tavily search with a user-entered public query only |
| macOS extraction | `travel-desktop/scripts/extract-text.swift` | PDF text and image OCR for imported files and selected-window frames |

## Data flow

```text
Employee edits supplied work window
  -> blur or selection change
  -> preload updateWork(kind, structured state)
  -> Electron main process validates sender and stores state
  -> if that window is shared, rule engine inspects state
  -> main process sends snapshot to Averill window
  -> finding shows cited local source

Employee asks in Review
  -> if a supplied work window is shared, use the fixed synthetic campaign pack
  -> otherwise use approved, visible company workspace sources
  -> if Nebius AI was explicitly enabled and a key exists:
       send question + relevant approved text sources to Nebius
       validate returned source IDs
       fall back to a local answer on failure or invalid citation
```

The work window calls `work:update` even when unshared; the main process stores the state but does not produce findings until the window is shared. This is a boundary of the current implementation to consider during the future external-app integration. Closing a work window removes its state and sharing status.

## IPC contracts

The preload exposes `snapshot()`, `openWork(kind)`, `share(kind, enabled)`, `aiMode(enabled)`, `ask(question)`, `askDemo(question)`, `source(id)`, `openSource(id)`, `updateWork(kind, data)`, and snapshot/sharing listeners. It also exposes narrow workspace, Tavily, and external-window methods. `kind` is limited to `email`, `linkedin`, `social`, or `handover`. Main-process `work:update` accepts only events from the corresponding open work window and a plain object payload. The bridge uses context isolation, disables Node integration, and enables renderer sandboxing.

The snapshot contains `open`, `shared`, `aiEnabled`, `findings`, `workspace`, `learning`, service availability and the selected external window. A finding has an ID, title, explanation, suggested user action, source, and work kind. Source IDs resolve only through the fixed registry; arbitrary paths are not accepted through `agent:source` or `agent:open-source`.

## Source and version model

The fixed campaign source pack is static and synthetic. `current-brief.md` is the approved v2. `old-brief.md` is v1 and intentionally superseded. `brand-and-legal.md` controls copy and disclosures. `content-calendar.md` controls dates. Approved assets are the email hero and vertical Reel; the old square creative is an intentional wrong choice. The separate company workspace has local file/folder import, status, version, owner, department, priority, and same-title conflict detection. That detection does not establish full semantic consistency.

## AI and privacy boundary

Local answers and deterministic findings need no network. Nebius uses `NEBIUS_API_KEY` from the environment/root `.env.local` or encrypted local Setup storage. The employee enables Nebius for the session. A Review question with a shared demo window can send the question and fixed synthetic text pack; a company question can send relevant approved company text. Draft or OCR text is sent only after a separate confirmation in its review flow. The API key remains in the main process. The app does not send image binaries or perform continuous capture. If the model cannot be reached, returns malformed output, or fails citation validation, a local answer is used. Citation IDs are structurally validated; model sentences are not independently checked against passages.

The public repository must never contain `.env.local` or credentials. `.env.example` lists variable names only. Do not log request headers, keys, or sensitive prompt content.

## Persistence and operations

The supplied work windows save draft form state in renderer `localStorage` only when the employee selects **Save draft**. There is no authenticated account, cloud database, migration, or deployment pipeline. The app runs locally with `npm ci` and `npm start`; `npm test` runs Node's test runner. `npm run package:mac` builds an unsigned arm64 demo `.app` with the Swift OCR helper. The current prototype has no telemetry or crash reporting. Distribution for real company content still needs signing, updates, permissions, and data retention design.

The company workspace is now stored as JSON in Electron's user-data directory, with imported copies and extracted text in an adjacent private local folder. Role switching is a one-computer demonstration of authorization rules, not account authentication. The assistant main process enforces file visibility and source approval before answering. An administrator or department lead can approve proposed department sources. Private files remain visible only to their owner until proposed. The conflict detector currently catches different approved files sharing the same department and title; it cannot detect all semantic contradictions.

Nebius receives only a question/draft and relevant approved text sources after session opt-in; draft and OCR review also prompt before sending. Tavily receives only the explicit web query and returns external URLs. The new Nebius company-source path has not passed a live request in this session because automated computer-use approval rejected that data transfer. Do not infer success from the older fixed-source Nebius check.

Electron `desktopCapturer` lists windows. The user chooses a Canva-titled window; pressing Review captures one thumbnail frame, extracts visible text locally, and deletes the temporary PNG. Stop sharing clears the selected window. No continuous capture runs. A screenshot can miss hidden text or visual issues; the app labels the review as OCR.

## Known gaps and tradeoffs

- Deterministic checks make the demo repeatable but cover only explicit campaign errors.
- Structured work-window state is reliable but does not prove real desktop perception.
- Static local sources enable transparent citations but do not handle company-wide retrieval or live document changes.
- AI citations are checked for known IDs, not full factual entailment. Claims remain reviewable by the employee.
- The assistant and supplied Elseweek work windows use Petrol / Coral / Ice, bundled fonts and matching outline icons. The Review pane has a focused finding and source hierarchy; operational controls are in Work.

## Extension sequence

Verify the existing one-frame macOS Canva selection, permission handling, OCR, and Stop sharing end to end. Rehearse the packaged app and approved company-source Nebius path. Then add authentication/synchronization, stronger source-conflict and citation checks, and deletion/revocation behavior. Keep work actions human-owned unless the product decision changes explicitly. See [docs/HANDOVER.md](docs/HANDOVER.md) for the current checks and their evidence boundaries.

## Learning state and IPC

`learningAction(action, payload)` invokes `learning:action`. Only the Averill renderer is accepted. The main process derives the active person from the workspace; payloads cannot choose another owner. Allowed actions: start, record, confirm, exclude, quiz and answer. The engine validates source eligibility, step order and answer shape before persistence and snapshot publication.

State lives in the `learning` field of the existing schema-1 workspace: sessions and quizzes, each owner-scoped. Sessions carry creation time, confirmed operation timestamps/week keys, optional source ID/title/version/hash and exclusion/completion state. Manual work records contain a confirmed employee description. Quizzes persist prompts, deterministic answer keys and feedback; snapshots omit answer keys. Practical reflections are explicitly self-confirmed, not model-graded.

Week keys are Monday-based in Europe/Copenhagen. Only confirmed current-week sessions are eligible. Company evidence must remain visible, approved, hash/version-matching and outside same-title conflicts. Excluding activity or invalidating evidence blocks affected questions. A fingerprint detects changed records so explicit refresh can create an updated set. Previous answers remain in local history; only the current person/current week is exposed by the learning snapshot.

Learn is offline and stores no screenshots. The official guide opens only on an employee action. It neither connects to Canva’s document API nor proves element alignment. Existing Work capture is a separate explicit one-frame OCR route. Local role switching provides demonstration isolation, not authenticated security across devices.

## Elseweek department pack and organic LinkedIn — 26 September 2026

`demo-company/elseweek/` is a synthetic manual-onboarding pack. Brand context is duplicated identically per department because source scope remains private/department. Admin imports accept a chosen department and version. Main-process workspace logic rejects non-admin imports to another department. Textual APPROVED does not approve an imported source. Imported company source records still drive workspace answers and learning evidence; they do not control static supplied-window findings.

`linkedin` is a fourth work kind, validated by the same sender/Share boundary as email/social/handover. Its source ID `linkedin` resolves to `linkedin-campaign.md`; `linkedinAsset` resolves to `winter-linkedin-landscape.svg`. Its deterministic rules check the campaign's specific claim, editorial audience, visual, CTA and planned date/time. No Instagram disclosure/partnership rule is used for that organic fixture. Source-guidance tone needs human review beyond those checks. The visual derives from the existing supplied illustration. Local drafts now use `elseweek:v1:<kind>`; legacy `aurelia:<kind>` data is left untouched. External-window selection excludes LinkedIn Draft as another supplied window.
