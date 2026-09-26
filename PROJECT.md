# Averill project

Updated 26 September 2026. This is the canonical product brief; [docs/HANDOVER.md](docs/HANDOVER.md) is the current execution handover for the public `averill-ai` repository.

## What Averill is

Averill is a standalone company agent assistant that helps an employee keep work aligned with current, approved company information. It watches only work the employee explicitly shares, notices a relevant problem at a natural pause after an edit or selection, and gives a concise correction with a source the employee can inspect. Employees can also ask where to find files, what changed between versions, and what copy or schedule is approved.

The product identity is **Averill**. **Aurelia Travel** is the fictional travel company used in the hackathon demo. Its campaign documents and work windows are test material, not Averill branding. Product copy, demo content, and developer documentation are in English.

## Why this exists

Campaign work crosses briefs, email, social scheduling, and handovers. A superseded brief or old asset can remain plausible and cause an avoidable mistake. Averill makes the current source visible at the point of work, while preserving the employee's control over edits and publication.

## Demo narrative

The synthetic company is Aurelia Travel. The campaign is **Winter Escapes 2027**. Brief v2 was approved on 22 September 2026; brief v1 and its square creative are intentionally retained as superseded material.

| Chapter | Employee does | Averill finds | Source |
| --- | --- | --- | --- |
| Email | Opens a draft and edits subject, audience, footer | Unapproved price guarantee, broad audience, missing footer | Current brief and brand/legal guidance |
| Social | Selects Reel creative, caption, partnership label, date | Old square asset, missing paid disclosure or platform label, wrong slot | Brief, brand/legal guidance, calendar |
| Handover | Opens brief v1 from a teammate | v1 is superseded; v2 changed audience, claim, asset, and date | Both brief versions |

Approved launch email: 15 October 2026 at 10:00 Copenhagen time. Approved paid creator Instagram Reel: 17 October 2026 at 18:00 Copenhagen time. The source pack in `travel-desktop/sources/` is authoritative for demo-specific details.

## Current product state

- Learn provides four-step Canva practice, confirmed activity history and current-week questions/reflections. See the learning implementation section below.
- Elseweek has an independent local consumer website in `travel-site/`; existing Aurelia campaign sources have not yet been migrated.
- Electron opens an independent Averill window and three separate supplied work windows: Email Studio, Social Publisher, and Campaign Files.
- The employee opens and explicitly shares each work window. Work windows send structured field state via Electron IPC, but findings are produced only for shared windows. Checks run after blur or selection change. Closing or unsharing stops findings.
- Deterministic rules detect the supplied campaign problems. Findings cite real local source files that can be opened.
- Campaign questions use constrained local source lookup by default. With a demo window shared, Review uses the fixed Aurelia source pack; otherwise it uses visible approved company sources. Nebius AI is optional and user-enabled. Responses without valid source IDs fall back to a local answer.
- The assistant now applies the approved colors, font families, aperture, outline icons, focused Review hierarchy and bottom question composer. Work controls, research and setup use separate tabs. The reference image remains a visual specification; the app uses separate desktop windows.
- A live Nebius check on 23 September 2026 returned the approved assets and citations. The automated tests cover all three workflows, source existence, unsupported questions, and model citation validation. These checks do not establish behavior with arbitrary external apps.
- A local company workspace can now be created on one Mac. An administrator adds people; the role switcher demonstrates administrator, department lead, and employee permissions on that same computer. It is explicitly not authentication or multi-device synchronization.
- People can import individual files or a folder (up to 100 supported files per selection). Imported copies and workspace metadata persist under Electron user data. Private files must be proposed before a lead can approve them for a department. A lead can set priority or supersede a source. Different approved files with the same title and different hashes cause a conflict; both are excluded from company answers until resolved.
- Markdown, plain text, CSV, JSON, and SVG text is indexed locally. On macOS, PDF text and image OCR use a local Swift helper; an unreadable file is marked as such. Imported Canva exports can be opened and their extracted text reviewed. This is not structural Canva document access or full visual analysis.
- The Work tab includes a company marketing draft review path. With explicit consent, relevant approved source text and a draft are sent to Nebius. The Review composer answers questions about the shared synthetic campaign from its fixed source pack; when no demo window is shared it uses the company workspace. A separate Research tab calls Tavily for a user-entered public query only. Tavily results are not company-approved sources.
- A Canva browser/app window can be explicitly selected for a one-frame OCR review and unselected with Stop sharing. The current code does not continuously monitor an arbitrary external window or infer design geometry. macOS Screen Recording permission is required for capture.
- The Averill assistant and supplied Aurelia work windows use the approved Petrol / Coral / Ice color system and bundled Geologica, Spline Sans, and Fragment Mono font packages. The social creative preview renders the actual supplied SVG asset.

## Explicit non-goals for this prototype

No continuous arbitrary macOS window capture, external app control, background observation, automatic edit, email send, or post publication is implemented. One explicitly selected Canva window can be captured on demand for visible-text OCR. Do not present that as full app understanding. The campaign source pack is synthetic; no real customer data is required for the demo.

## Product and design decisions

| Decision | Reason and consequence |
| --- | --- |
| Averill is the agent product name; Aurelia Travel is the demo company | Keeps product identity separate from example customer branding. |
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

1. Complete native desktop verification of Canva window capture, review, and Stop sharing with a real Canva window; test image import in the running app.
2. Verify the new company-source Nebius request live after explicit approval for the synthetic test payload. The previous live check covers only the fixed Aurelia source pack.
3. Add real authentication and sync before describing the role switcher as a multi-employee product. Extend specialized checks to other departments only after their source and workflow requirements are defined.
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

## Learning implementation — 26 September 2026

The Learn area adds an offline, bounded Canva tutor (selection, Position, alignment, grouping), contextual help and official tool references. The employee performs and confirms each step. Owner-scoped sessions persist in the local company workspace. Employees can record other confirmed Canva/LinkedIn/newsletter practice and link visible approved sources. Weekly practice uses the current Europe/Copenhagen week, generates operation questions and activity reflections, and explains answers. Source/version questions require still-approved, visible, non-conflicting evidence. The practical exercise is self-confirmed, not visually assessed; no mastery score or manager evaluation is provided. This does not establish general conversational Canva tutoring or automatic activity tracking. See `docs/LEARNING_IMPLEMENTATION_PLAN.md` for plan and verification.
