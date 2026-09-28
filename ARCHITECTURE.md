# Averill system design

## Purpose and status

This document describes the implemented hackathon prototype and the boundaries for extending it. Elseweek is a separate demo company with a standalone website in `travel-site/`. Averill is the Electron companion for employees working in their usual tools. A floating Ask Averill button opens the assistant; the user can select one external app or browser window for a one-time read or explicit six-second local observation. macOS Accessibility text is preferred, with visible-text OCR fallback. The four supplied Elseweek editor windows remain synthetic fixtures. Browser DOM fields and platform APIs remain future adapters.

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
| Floating companion | `travel-desktop/src/companion.html`, `src/companion-position.js` | Movable always-on-top entry point, selected-window/last-read status and Stop |
| Work renderer | `travel-desktop/src/work.html`, `work.js` | Synthetic email, social, handover fields and explicit draft save |
| Rule engine | `travel-desktop/src/engine.js` | Pure issue checks and local campaign answers |
| AI adapter | `travel-desktop/src/assistant.js` | Nebius model discovery, answer request, citation ID validation, local fallback |
| Source registry | `travel-desktop/src/campaign.js` | Maps fixed source IDs to local source files and assets |
| Design system | `travel-desktop/design-system/` and `src/agent-theme.css` | Approved visual tokens and implemented assistant styling |
| Company workspace | `travel-desktop/src/workspace.js` | Local people, role switching, imported copies, approval, priority, and conflict detection |
| Company answers | `travel-desktop/src/workspace-answer.js` | Approved-source retrieval, Nebius request, citation ID validation, local fallback |
| External observation | `travel-desktop/src/external-observation.js`, `scripts/window-context.swift` | Selected-window ID/PID check, bounded Accessibility text and OCR fallback |
| External task review | `travel-desktop/src/task-review.js` | Exact approved-rule checks and optional bounded Nebius suggestions |
| Evidence extraction | `travel-desktop/src/evidence.js` | Exact matching lines and PDF page markers for new imports |
| Source comparison | `travel-desktop/src/source-review.js` | Bounded line diff of two visible extracted documents |
| Learning engine | `travel-desktop/src/learning.js` | Owner-scoped sessions, ordered confirmation, weekly eligibility, practice and feedback |
| Learning UI | `travel-desktop/src/learning-ui.js` | Learn lesson/help, activity recording, weekly review and answer forms |
| Public search | `travel-desktop/src/web-search.js` | Tavily search with a user-entered public query only |
| macOS extraction | `travel-desktop/scripts/extract-text.swift` | PDF text and image OCR for imported files and selected-window frames |

## Data flow

The 28 September additions keep `main.js` as the trust boundary. `learning:action` resolves a selected finding from current shared work in the main process before starting a person-owned exercise; completing it checks only whether that deterministic finding remains in current shared fields. The renderer cannot assert visual verification. Company answer citations now include an exact extracted line plus approval/version metadata. Model output must contain an exact source quote and an answer contained in that quote or it falls back to local extraction. New PDF extraction inserts `[PDF page N]` markers; existing imported PDF text gains page numbers only after reimport.

`workspace:update-source` accepts a reviewer reason and optional ID of an approved predecessor in the same department/scope. The predecessor is superseded when the new document is approved. `source-review.js` compares at most 250 lines per document and 200 changes; this is a textual diff, not an automatic semantic conflict judgement. Clarification requests are local workspace records visible to the requester and authorised reviewer. Document decision reasons are withheld from ordinary employee snapshots after approval.

Local account disabling takes effect at the next authentication; there is no remote session revocation. Password reset creates a new local login document. Source deletion removes only managed original copies and extracted text from the current profile, not the outside original or OS backups. Applied onboarding staging copies are removed; only counts/timestamps remain in the batch record. The workspace JSON, source copies and login documents are not application-encrypted. See [company-readiness gates](docs/ADDITIONS_STATUS.md) before real-company use.

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

The supplied work window calls `work:update` even when unshared; the main process stores the state but does not produce findings until the window is shared. Closing a work window removes its state and sharing status. External-window observation is a separate path: the selected source ID and native owner PID are rechecked before each local read, the latest bounded text/hash/timestamp stay in memory for the signed-in person, and Stop increments an epoch so in-flight reads cannot restore cleared context. The employee chooses a task type and requests a review; no automatic provider request occurs during polling.

## IPC contracts

The preload exposes `snapshot()`, `openWork(kind)`, `share(kind, enabled)`, `aiMode(enabled)`, `ask(question)`, `askDemo(question)`, `source(id)`, `openSource(id)`, `updateWork(kind, data)`, and snapshot/sharing listeners. It also exposes narrow workspace, Tavily, and external-window methods. `kind` is limited to `email`, `linkedin`, `social`, or `handover`. Main-process `work:update` accepts only events from the corresponding open work window and a plain object payload. The bridge uses context isolation, disables Node integration, and enables renderer sandboxing.

The snapshot contains `open`, `shared`, `aiEnabled`, `findings`, `workspace`, `learning`, service availability and the selected external window. A finding has an ID, title, explanation, suggested user action, source, and work kind. Source IDs resolve only through the fixed registry; arbitrary paths are not accepted through `agent:source` or `agent:open-source`.

## Source and version model

The fixed campaign source pack is static and synthetic. `current-brief.md` is the approved v2. `old-brief.md` is v1 and intentionally superseded. `brand-and-legal.md` controls copy and disclosures. `content-calendar.md` controls dates. Approved assets are the email hero and vertical Reel; the old square creative is an intentional wrong choice. The separate company workspace has local file/folder import, status, version, owner, department, priority, and same-title conflict detection. That detection does not establish full semantic consistency.

## AI and privacy boundary

Local answers and deterministic findings need no network. Nebius uses `NEBIUS_API_KEY` from the environment/root `.env.local` or encrypted local Setup storage. The employee enables Nebius for the session. A Review question with a shared demo window can send the question and fixed synthetic text pack; a company question can send relevant approved company text. External task review sends bounded observed text and only AI-eligible approved company sources after owner policy and a separate employee confirmation; credential-shaped text is rejected. The model must return exact source and observed excerpts, and the main process rechecks authorization and current observation before display. Interpretive suggestions are still model suggestions, not independently proven entailment. Image binaries are never sent. If the model fails validation, a local rule result remains.

The public repository must never contain `.env.local` or credentials. `.env.example` lists variable names only. Do not log request headers, keys, or sensitive prompt content.

## Persistence and operations

The supplied work windows save draft form state in renderer `localStorage` under a key scoped to the signed-in local person only when the employee selects **Save draft**. The previous unscoped keys remain untouched and are not silently loaded into another account. There are local email/password accounts; no cloud database, tenant service or deployment pipeline is provided. The app runs locally with `npm ci` and `npm start`; `npm test` runs Node's test runner. `npm run package:mac` builds an unsigned arm64 demo `.app` with the Swift OCR helper. The current prototype has no telemetry or crash reporting. Distribution for real company content still needs signing, updates, permissions, and data retention design.

The company workspace is now stored as JSON in Electron's user-data directory, with imported copies and extracted text in an adjacent private local folder. Separate local credentials protect the application routes on one computer; legacy role switching is available only before activation. The assistant main process enforces file visibility and source approval before answering. An administrator or department lead can approve proposed department sources. Private files remain visible only to their owner until proposed. The conflict detector currently catches different approved files sharing the same department and title; it cannot detect all semantic contradictions.

Nebius receives only a question/draft and relevant approved text sources after session opt-in; draft and OCR review also prompt before sending. Tavily receives only the explicit web query and returns external URLs. The new Nebius company-source path has not passed a live request in this session because automated computer-use approval rejected that data transfer. Do not infer success from the older fixed-source Nebius check.

Electron `desktopCapturer` lists windows, excluding Averill-owned window IDs. The user chooses one external window; Read captures once, while Start polls every six seconds. A Swift helper resolves the native window number/owner PID and reads accessible text where available, excluding secure fields and browser chrome outside the active web area. OCR of a selected-window thumbnail is the fallback; the temporary PNG is deleted immediately. Pause/Stop clear observed text; Stop also clears the selection. OCR can miss hidden text, assets, layout and publication state, and is labelled accordingly.

## Known gaps and tradeoffs

- Deterministic checks make the demo repeatable but cover only explicit campaign errors.
- Structured work-window state is reliable but does not prove real desktop perception.
- Static local sources enable transparent citations but do not handle company-wide retrieval or live document changes.
- AI citations are checked for known IDs, not full factual entailment. Claims remain reviewable by the employee.
- The assistant and supplied Elseweek work windows use Petrol / Coral / Ice, bundled fonts and matching outline icons. The Review pane has a focused finding and source hierarchy; operational controls are in Work.

## Extension sequence

Add a browser DOM/field adapter and test actual email, LinkedIn, Instagram and Canva draft accounts. Verify permission revocation, full-screen/second-monitor behavior and a consented live Nebius task-review request. Expand task schemas beyond exact phrase rules, then tackle company deployment and stronger semantic evidence checks. Keep work actions human-owned. See [docs/HANDOVER.md](docs/HANDOVER.md) for current checks and limits.

## Learning state and IPC

`learningAction(action, payload)` invokes `learning:action`. Only the Averill renderer is accepted. The main process derives the active person from the workspace; payloads cannot choose another owner. Allowed actions: start, record, confirm, exclude, quiz and answer. The engine validates source eligibility, step order and answer shape before persistence and snapshot publication.

State lives in the `learning` field of the existing schema-1 workspace: sessions and quizzes, each owner-scoped. Sessions carry creation time, confirmed operation timestamps/week keys, optional source ID/title/version/hash and exclusion/completion state. Manual work records contain a confirmed employee description. Quizzes persist prompts, deterministic answer keys and feedback; snapshots omit answer keys. Practical reflections are explicitly self-confirmed, not model-graded.

Week keys are Monday-based in Europe/Copenhagen. Only confirmed current-week sessions are eligible. Company evidence must remain visible, approved, hash/version-matching and outside same-title conflicts. Excluding activity or invalidating evidence blocks affected questions. A fingerprint detects changed records so explicit refresh can create an updated set. Previous answers remain in local history; only the current person/current week is exposed by the learning snapshot.

Learn is offline and stores no screenshots. The official guide opens only on an employee action. It neither connects to Canva’s document API nor proves element alignment. Work can read once or poll a selected window locally; this is separate from verified Canva learning. Separate local accounts provide application-level person isolation; they do not provide synchronized authenticated accounts across devices.

## Elseweek department pack and organic LinkedIn — 26 September 2026

`demo-company/elseweek/` is a synthetic manual-onboarding pack. Brand context is duplicated identically per department because source scope remains private/department. Admin imports accept a chosen department and version. Main-process workspace logic rejects non-admin imports to another department. Textual APPROVED does not approve an imported source. Imported company source records still drive workspace answers and learning evidence; they do not control static supplied-window findings.

`linkedin` is a fourth work kind, validated by the same sender/Share boundary as email/social/handover. Its source ID `linkedin` resolves to `linkedin-campaign.md`; `linkedinAsset` resolves to `winter-linkedin-landscape.svg`. Its deterministic rules check the campaign's specific claim, editorial audience, visual, CTA and planned date/time. No Instagram disclosure/partnership rule is used for that organic fixture. Source-guidance tone needs human review beyond those checks. The visual derives from the existing supplied illustration. Local drafts now use `elseweek:v1:<kind>`; legacy `aurelia:<kind>` data is left untouched. External-window selection excludes LinkedIn Draft as another supplied window.

## Account and onboarding architecture

`accounts.js` uses async scrypt credentials and distinct account profiles. `main.js` holds the authenticated person only in memory; restart is logged out. All protected IPC routes check session/sender. `account:login/logout/enable/create` are narrow handlers; `workspace:switch-person` is denied after auth activation. Existing workspace schema 1 is extended additively; credentials are omitted from renderer snapshots. Local OS file access remains outside this application boundary.

`onboarding.js` stores an owner-only staged batch with extracted text, file hashes and provenance. `onboarding:upload/analyze/apply` require admin. XLSX subprocess and local Swift PDF/OCR provide text. Optional Nebius analysis sends capped text after explicit consent and validates identity evidence. The review payload can edit assignments but must reference known people/files; imported owner/admin profiles are rejected. Apply works on a cloned workspace, then saves and swaps state, removing new imported copies on failure. The workspace JSON and public snapshots contain no plaintext passwords. At the user's explicit request, account-documents.js saves owner and generated passwords in separate local Markdown files under userData/Averill-login-documents (0600 files, 0700 directory). An authenticated admin can open this folder through account:documents; it is outside source ingestion and Nebius prompts. Personnel documents remain private, company sources require admin approval and are visible across departments after approval. No invitation emails are sent.

`onboarding-ui.js` keeps editable review drafts during rendering, collapses optional edits and supports explicit collective approval. Anonymous UI shows only login/company/demo account names, and protected snapshots omit sources/learning/intake. Staff account passwords and keys are never sent to Nebius. Admin reset of another non-owner local account and self-service password change are available; unauthenticated owner recovery, cloud synchronization, production tenant security and external provider login remain unimplemented.

## Prepared local demo provisioning

The normal Aurelia Demo workspace was explicitly prepared after the user reported no usable login and missing keys. scripts/prepare-local-demo.cjs runs under Electron on this Mac, only against a legacy workspace without credentials. It preserves the existing admin ID/company, creates four accounts, validates generated passwords, backs up the old workspace and exports local login documents. It encrypts existing .env.local Nebius/Tavily keys with safeStorage into userData/averill-secrets.enc.json, which main.js already loads. Keys are never embedded in the distributable. An already authenticated workspace is refused; there is no password-reset mechanism. See HANDOVER.md for exact normal-workspace and provider verification.

## Multisource onboarding update — 27 September 2026

Desktop/Finder drop, local/synced files, HTTPS links and Google Drive/OneDrive selected-file OAuth import now feed the local review. Direct cloud use requires registered OAuth clients and remains live-unverified. Company AI defaults off; owner authorization and per-file selection are required. Restricted files are blocked. Local company copies are not application-encrypted; provider confidentiality/no-training/retention settings remain unverified. See [cloud setup](docs/CLOUD_CONNECTIONS.md), [company confidentiality](docs/COMPANY_CONFIDENTIALITY.md) and [handover](docs/HANDOVER.md) for implementation, verification and remaining gates.

## Feedback and know-how library — 27 September 2026

A persistent status banner reports pending, completed, cancelled and failed explicit actions. Knowledge provides local document/text search, uploaded proposals, approved/pending/private/superseded sources, extracted-text reading and original-file access under existing role visibility. Intake is visible before onboarding confirmation. The library does not send documents to external AI. See the handover and onboarding tutorial for current verification and workflow.
