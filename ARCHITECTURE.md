# Averill system design

## Purpose and status

This document describes the implemented hackathon prototype and the boundaries for extending it. The current app is an Electron desktop demo with three supplied Aurelia Travel work windows, a local company workspace, and explicit one-frame OCR of a selected external Canva window. General continuous external application observation remains a future milestone.

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

Employee asks a campaign question
  -> local source lookup by default
  -> if Nebius AI was explicitly enabled and key exists:
       send question + four synthetic text sources to Nebius
       validate returned source IDs
       fall back to local answer on failure or invalid citation
```

The work window calls `work:update` even when unshared; the main process stores the state but does not produce findings until the window is shared. This is a boundary of the current implementation to consider during the future external-app integration. Closing a work window removes its state and sharing status.

## IPC contracts

The preload exposes `snapshot()`, `openWork(kind)`, `share(kind, enabled)`, `aiMode(enabled)`, `ask(question)`, `source(id)`, `openSource(id)`, `updateWork(kind, data)`, `onSnapshot(callback)`, and `onSharing(callback)`. `kind` is limited to `email`, `social`, or `handover`. Main-process `work:update` accepts only events from the corresponding open work window and a plain object payload. The bridge uses context isolation, disables Node integration, and enables renderer sandboxing.

The snapshot contains `open`, `shared`, `aiEnabled`, and `findings`. A finding has an ID, title, explanation, suggested user action, source, and work kind. Source IDs resolve only through the fixed registry; arbitrary paths are not accepted through `agent:source` or `agent:open-source`.

## Source and version model

The source pack is static and synthetic. `current-brief.md` is the approved v2. `old-brief.md` is v1 and intentionally superseded. `brand-and-legal.md` controls copy and disclosures. `content-calendar.md` controls dates. Approved assets are the email hero and vertical Reel; the old square creative is an intentional wrong choice. Future folder ingestion needs an explicit version model, conflict handling, and provenance rather than assuming that a filename implies approval.

## AI and privacy boundary

Local answers and deterministic findings need no network. Nebius mode requires `NEBIUS_API_KEY` supplied through the environment or a local `.env.local` in the repository root. The employee enables Nebius in the UI; the app then sends their question and the four synthetic text documents to the Nebius API. The API key remains in the main process. The app does not send image assets, saved drafts, or arbitrary desktop content. If the model cannot be reached, returns malformed output, or fails citation validation, the local answer is used. A cited ID is structurally validated against the registry; the current implementation does not perform independent semantic verification of each model sentence.

The public repository must never contain `.env.local` or credentials. `.env.example` lists variable names only. Do not log request headers, keys, or sensitive prompt content.

## Persistence and operations

The supplied work windows save draft form state in renderer `localStorage` only when the employee selects **Save draft**. There is no account, cloud database, migration, or deployment pipeline. The app is run locally with `npm ci` and `npm start`; `npm test` runs Node's test runner. The current prototype has no telemetry or crash reporting. Any future packaging and distribution must define update, signing, permissions, and data retention behavior before use with real company content.

The company workspace is now stored as JSON in Electron's user-data directory, with imported copies and extracted text in an adjacent private local folder. Role switching is a one-computer demonstration of authorization rules, not account authentication. The assistant main process enforces file visibility and source approval before answering. An administrator or department lead can approve proposed department sources. Private files remain visible only to their owner until proposed. The conflict detector currently catches different approved files sharing the same department and title; it cannot detect all semantic contradictions.

Nebius receives only a question/draft and relevant approved text sources after session opt-in; draft and OCR review also prompt before sending. Tavily receives only the explicit web query and returns external URLs. The new Nebius company-source path has not passed a live request in this session because automated computer-use approval rejected that data transfer. Do not infer success from the older fixed-source Nebius check.

Electron `desktopCapturer` lists windows. The user chooses a Canva-titled window; pressing Review captures one thumbnail frame, extracts visible text locally, and deletes the temporary PNG. Stop sharing clears the selected window. No continuous capture runs. A screenshot can miss hidden text or visual issues; the app labels the review as OCR.

## Known gaps and tradeoffs

- Deterministic checks make the demo repeatable but cover only explicit campaign errors.
- Structured work-window state is reliable but does not prove real desktop perception.
- Static local sources enable transparent citations but do not handle company-wide retrieval or live document changes.
- AI citations are checked for known IDs, not full factual entailment. Claims remain reviewable by the employee.
- The assistant and supplied Aurelia work windows use Petrol / Coral / Ice, bundled fonts and matching outline icons. The Review pane has a focused finding and source hierarchy; operational controls are in Work.

## Extension sequence

Implement the design system in the Averill window first. Next add explicit macOS window selection, OS permission handling, capture/accessibility adapters, and stop-sharing tests. Then add selected-folder indexing with source identity, version/approval metadata, citation verification, and deletion/revocation behavior. Keep work actions human-owned unless the product decision changes explicitly.
