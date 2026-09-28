# Averill project

Updated 28 September 2026. This is the canonical product brief; [docs/HANDOVER.md](docs/HANDOVER.md) is the current execution handover for the public `averill-ai` repository.

## What Averill is

Averill is a standalone company agent assistant that helps an employee keep work aligned with current, approved company information. It watches only work the employee explicitly shares, notices a relevant problem at a natural pause after an edit or selection, and gives a concise correction with a source the employee can inspect. Employees can also ask where to find files, what changed between versions, and what copy or schedule is approved.

The product identity is **Averill**. **Vamo** is the fictional travel-company brand used on the independent website. Their names, logos, visual styles and interfaces must never be shared. The current desktop campaign documents, accounts and work windows still carry the legacy **Elseweek** label; they are test fixtures, not Averill branding or proof of a completed Vamo migration. Product copy, demo content, and developer documentation are in English.

**Product boundary, corrected 28 September:** employees create and edit email, LinkedIn, Instagram, design and other work in the tools they already use. Averill is a separate companion with a floating button. A person chooses one external window for a local read or six-second observation; a bounded task review compares its text with approved company sources, with optional consented Nebius suggestions. Public fact-checks use Tavily with only the public question the employee types. Vamo has its own website in `travel-site/`; it is the example company, not an Averill work app. The supplied desktop work windows remain Elseweek-labeled legacy fixtures. The four built-in editors remain reproducible hackathon fixtures, not the main employee workflow.

## Why this exists

Campaign work crosses briefs, email, social scheduling, and handovers. A superseded brief or old asset can remain plausible and cause an avoidable mistake. Averill makes the current source visible at the point of work, while preserving the employee's control over edits and publication.

## Demo narrative

The current website brand is Vamo. The still-unmigrated synthetic desktop company is Elseweek. Its campaign is **Winter Escapes 2027**. Brief v2 was approved on 22 September 2026; brief v1 and its square creative are intentionally retained as superseded material.

| Chapter | Employee does | Averill finds | Source |
| --- | --- | --- | --- |
| Email | Opens a draft and edits subject, audience, footer | Unapproved price guarantee, broad audience, missing footer | Current brief and brand/legal guidance |
| LinkedIn | Drafts an organic company post | Wrong claim, editorial audience, creative, missing CTA and planned slot | LinkedIn campaign guidance |
| Social | Selects Reel creative, caption, partnership label, date | Old square asset, missing paid disclosure or platform label, wrong slot | Brief, brand/legal guidance, calendar |
| Handover | Opens brief v1 from a teammate | v1 is superseded; v2 changed audience, claim, asset, and date | Both brief versions |

Approved launch email: 15 October 2026 at 10:00 Copenhagen time. Approved paid creator Instagram Reel: 17 October 2026 at 18:00 Copenhagen time. The source pack in `travel-desktop/sources/` is authoritative for demo-specific details.

## Current product state

- Work can locally observe a selected external window and check exact current approved rules for email, organic LinkedIn, paid Instagram, Canva text, Operations and People. The exact-rule coverage is currently narrow; optional Nebius task suggestions require source and observed-excerpt validation, with no live request verified. See the [acceptance matrix](docs/EXTERNAL_WORK_ACCEPTANCE.md) and [handover](docs/HANDOVER.md).
- Review findings can open explanation context, copy the suggested correction, start a person-owned practice exercise and recheck supported fields after a human edit. Learn also has composition, LinkedIn visual and newsletter export exercises with ordered self-confirmed steps and a linked company source/version where selected. Offline free questions are limited to the bounded Canva lesson; selected Canva OCR remains a separate explicit one-frame action.
- Knowledge exposes exact matching passages with source version, approval metadata and line/page when available. Reviewers can compare extracted lines, explicitly link a replacement across different titles, decide with a reason, and answer local private requests for missing evidence. Search filters include department, type, status and conflicts.
- Admins can disable/reset another non-owner local account; a signed-in person can change their password. Eligible local source copies and personal Learn history can be deleted. Temporary onboarding files are cleaned after replacement or successful application. These controls do not provide a hosted identity system, encrypted company knowledge store or signed distribution.

- Learn provides four-step Canva practice, confirmed activity history and current-week questions/reflections. See the learning implementation section below.
- Vamo has an independent local consumer website in `travel-site/`; desktop fixture wording and assets still use Elseweek. The old square remains deliberately historical.
- Electron opens an independent Averill window and four separate supplied work windows: Email Studio, LinkedIn Draft, Social Publisher, and Campaign Files.
- The employee opens and explicitly shares each work window. Work windows send structured field state via Electron IPC, but findings are produced only for shared windows. Checks run after blur or selection change. Closing or unsharing stops findings.
- Deterministic rules detect the supplied campaign problems. Findings cite real local source files that can be opened.
- Campaign questions use constrained local source lookup by default. With a demo window shared, Review uses the fixed Elseweek source pack; otherwise it uses visible approved company sources. Nebius AI is optional and user-enabled. Responses without valid source IDs fall back to a local answer.
- The assistant now applies the approved colors, font families, aperture, outline icons, focused Review hierarchy and bottom question composer. Work controls, research and setup use separate tabs. The reference image remains a visual specification; the app uses separate desktop windows.
- A live Nebius check on 23 September 2026 returned the approved assets and citations. The automated tests cover all four supplied workflows, source existence, unsupported questions, and model citation validation. These checks do not establish behavior with arbitrary external apps.
- A local company workspace can now be created on one Mac. An administrator adds people; the role switcher demonstrates administrator, department lead, and employee permissions on that same computer. It is retained only for legacy workspaces until owner login is activated. New workspaces use distinct local accounts; no multi-device synchronization is provided.
- People can import individual files or a folder (up to 100 supported files per selection). Imported copies and workspace metadata persist under Electron user data. Private files must be proposed before a lead can approve them for a department. A lead can set priority or supersede a source. Different approved files with the same title and different hashes cause a conflict; both are excluded from company answers until resolved.
- Markdown, plain text, CSV, JSON, and SVG text is indexed locally. On macOS, PDF text and image OCR use a local Swift helper; an unreadable file is marked as such. Imported Canva exports can be opened and their extracted text reviewed. This is not structural Canva document access or full visual analysis.
- The Work tab includes a company marketing draft review path. With explicit consent, relevant approved source text and a draft are sent to Nebius. The Review composer answers questions about the shared synthetic campaign from its fixed source pack; when no demo window is shared it uses the company workspace. A separate Research tab calls Tavily for a user-entered public query only. Tavily results are not company-approved sources.
- One external browser/app window can be selected for an Accessibility or OCR read, then polled locally every six seconds until Pause/Stop. The current code does not infer design geometry or inspect hidden fields. macOS Screen Recording permission is required for OCR.
- The Averill assistant and supplied Elseweek work windows use the approved Petrol / Coral / Ice color system and bundled Geologica, Spline Sans, and Fragment Mono font packages. The social creative preview renders the actual supplied SVG asset.

## Explicit non-goals for this prototype

No arbitrary-window surveillance, external app control, automatic edit, email send, or post publication is implemented. Observation runs only for the selected window after explicit Start; it is a six-second local poll, not field-aware editor integration. Do not present visible text as full app understanding. The campaign source pack is synthetic; no real customer data is required for the demo.

## Product and design decisions

| Decision | Reason and consequence |
| --- | --- |
| Averill is the agent product; Vamo is the fictional travel brand; Elseweek is a legacy desktop fixture label | Names, logos, palettes and UI styles stay separate. Desktop renaming requires a coordinated migration. |
| Standalone desktop window | The employee can see the agent beside the work, across multiple work contexts. |
| Explicit per-window sharing | Sharing is visible and reversible; no implied background surveillance. |
| Feedback after completed field edit or selection | Corrections arrive at a useful moment without interrupting typing. |
| Evidence before intervention | Every finding links to a local approved source; unsupported questions state uncertainty. |
| Human-owned edits and publishing | Averill advises; the employee changes work and makes final decisions. |
| Deterministic demo checks with optional Nebius answers | The supplied scenarios remain reliable offline, while AI answers are a controlled opt-in. |
| Petrol / Coral / Ice design direction | Petrol keeps the workspace calm; coral marks attention; ice marks verified evidence. See the design system for exact tokens. |
| Spline Sans display/body; Fragment Mono metadata | The assistant loads local font files from the three `@fontsource` packages, which include their licenses. |
| Keep old brief v1 and old square creative | They are intentional fixtures that make version and asset checks demonstrable. |

## Next work

The implementation and external gates for every requested addition are tracked in [docs/ADDITIONS_STATUS.md](docs/ADDITIONS_STATUS.md). The A/B design and technical preflight are in [docs/AB_TEST_PLAN.md](docs/AB_TEST_PLAN.md); there is no live randomized result.

1. Complete the real-platform acceptance matrix with disposable Substack/email, LinkedIn, Instagram and Canva accounts; verify field boundaries, permission denial, full-screen and second-monitor behavior. Add a browser DOM adapter for editable fields.
2. Verify the new company-source Nebius request live after explicit approval for the synthetic test payload. The previous live check covers only the fixed historical Aurelia source pack.
3. Add cloud authentication and sync before describing the local account demo as a multi-device employee product. Extend specialized checks to other departments only after their source and workflow requirements are defined.
4. Improve conflict detection beyond different files sharing one title, and independently verify model claims against cited passages.
5. Rehearse permission denial, offline fallback, and the full demo on the packaged macOS app. The package includes the macOS text-extraction helper.

## Where to look

- `travel-desktop/main.js` and `preload.js`: Electron windows, IPC, sharing, AI opt-in, source opening.
- `travel-desktop/src/engine.js`: deterministic findings and local answers.
- `travel-desktop/src/assistant.js`: Nebius request, source-constrained parsing, fallback.
- `travel-desktop/src/campaign.js`: source registry.
- `travel-desktop/src/work.js`: synthetic workspaces and field update timing.
- `travel-desktop/design-system/`: visual specification, CSS tokens, reference and preview.
- `ARCHITECTURE.md`: data flow, boundaries, API contracts, and operational notes.

The 26 September UI pass prioritizes the supplied image: deeper petrol, cooler ice, Spline Sans display reconstruction, genuine Phosphor Light assets and clearer selected/current source hierarchy. Native source viewing, local campaign answers and Stop sharing were checked after rebuilding the app. See the design-system verification section for exact parity limits.

The 28 September UX pass makes the shared demo context explicit in Review, adds Stop and finding navigation there, routes Knowledge items to their specific Setup controls, preserves unrelated Setup inputs and moves Learn focus after a confirmation. Editors can open one another within the registered app and save local drafts per signed-in person. Company lookup requires a real query match; priority alone no longer creates a citation. The remaining model limitation is claim-level evidence verification.

## Learning implementation — 26 September 2026

The Learn area adds an offline, bounded Canva tutor (selection, Position, alignment, grouping), contextual help and official tool references. The employee performs and confirms each step. Owner-scoped sessions persist in the local company workspace. Employees can record other confirmed Canva/LinkedIn/newsletter practice and link visible approved sources. Weekly practice uses the current Europe/Copenhagen week, generates operation questions and activity reflections, and explains answers. Source/version questions require still-approved, visible, non-conflicting evidence. The practical exercise is self-confirmed, not visually assessed; no mastery score or manager evaluation is provided. This does not establish general conversational Canva tutoring or automatic activity tracking. See `docs/LEARNING_IMPLEMENTATION_PLAN.md` for plan and verification.

## Elseweek and LinkedIn delivery — 26 September 2026

The coherent synthetic company pack is in `travel-desktop/demo-company/elseweek/`, with Marketing, Operations and People, shared brand copies, owners, versions, a private proposal and an archived v1. Follow its README for imports: current campaign brief at metadata version 2, other documents at version 1. An admin selects department/version; non-admin imports are limited to their own department. Review and approval remain explicit.

LinkedIn Draft is a fourth supplied window with organic company-post copy, editorial audience, asset, date/time, source action and local Save. Explicit Share enables checks for the unapproved price phrase, wrong audience, wrong creative, missing CTA and incorrect campaign slot. Planned LinkedIn slot is 16 October 2026, 09:00 Europe/Copenhagen. Guidance is synthetic company policy, not platform rules. Existing email and paid Instagram dates remain as previously approved. Current asset branding is Elseweek; the superseded square remains unchanged. Old Aurelia local draft keys are preserved and not loaded into the new Elseweek draft namespace.

Imported sources do not drive the supplied deterministic editor findings. The four fixtures cite the static pack; unshared company questions use visible approved workspace sources. No external LinkedIn connection, Canva export integration, full tone assessment or publishing was added.

## File-based onboarding and separate local logins

The later owner request adds an owner email/password account, batch file intake, explicit Nebius interpretation and four profiles: owner/CEO/admin, Marketing manager, Marketing strategy employee and Content creator. Marketing manager maps to lead; the latter two are distinct employees. Read `docs/ONBOARDING_TUTORIAL.md` for the demo. Local roster extraction and review remove one-by-one entry. Company-wide brand sources and private personnel files have distinct visibility. Owner and generated credentials are saved in separate local login documents, accessible to the owner from Account access. A live Nemotron check extracted three people from unstructured prose with exact evidence; a separate mixed-file check validated company/document assignments. Admin reset of another non-owner local account and self-service password change are available; no hosted identity or sync is claimed.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

## Multisource onboarding update — 27 September 2026

Desktop/Finder drop, local/synced files, HTTPS links and Google Drive/OneDrive selected-file OAuth import now feed the local review. Direct cloud use requires registered OAuth clients and remains live-unverified. Company AI defaults off; owner authorization and per-file selection are required. Restricted files are blocked. Local company copies are not application-encrypted; provider confidentiality/no-training/retention settings remain unverified. See [cloud setup](docs/CLOUD_CONNECTIONS.md), [company confidentiality](docs/COMPANY_CONFIDENTIALITY.md) and [handover](docs/HANDOVER.md) for implementation, verification and remaining gates.

## Feedback and know-how library — 27 September 2026

A persistent status banner reports pending, completed, cancelled and failed explicit actions. Knowledge provides local document/text search, uploaded proposals, approved/pending/private/superseded sources, extracted-text reading and original-file access under existing role visibility. Intake is visible before onboarding confirmation. The library does not send documents to external AI. See the handover and onboarding tutorial for current verification and workflow.
