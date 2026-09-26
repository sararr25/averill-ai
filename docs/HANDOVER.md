# Averill execution handover

Updated 26 September 2026. Canonical entry point for continuing this repository. Read [PROJECT.md](../PROJECT.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [AGENTS.md](../AGENTS.md) and the [desktop design system](../travel-desktop/design-system/DESIGN_SYSTEM.md) before changes.

## Product, identity and agreed demo

Averill is a standalone company assistant. Elseweek is the proposed fictional travel customer with a separate website in `travel-site/`. The older desktop fixtures still say Aurelia Travel: that migration is pending. Preserve brief v1 and the old square asset because they are intentional outdated-material scenarios. Product, demo sources and developer documentation remain English.

The owner’s video direction is: company data onboarding across departments → employee learns Canva → applies learning to LinkedIn and newsletter work → weekly personalised practice. Opening with a presentation of the website was rejected. Canva should demonstrate tool learning, with campaign correction as supporting context. See [PRODUCT_DEMO_PLAN.md](PRODUCT_DEMO_PLAN.md) for the target four-minute sequence and implementation gates; that duration is not a confirmed submission limit.

## Current app areas

- **Review:** leading finding, selected/current source, inspectable source dialog and campaign question composer. Shared supplied windows use fixed campaign sources; otherwise company questions use visible approved sources.
- **Work:** Open/Share/Stop for Email Studio, Social Publisher and Campaign Files; approved-source marketing draft review; separately selected Canva window with explicit one-frame OCR.
- **Learn:** four-step Canva lesson (selection, Position, alignment, grouping), step help and official guide; optional linked approved company source; confirmed learning records and manual Canva/LinkedIn/newsletter practice; current-week questions, explanations and self-confirmed practical reflection.
- **Research:** explicit public Tavily query, with results separated from company policy.
- **Setup:** local company, people/departments, demo role switching, import, private proposals, lead/admin approval, priority/supersession/conflicts and encrypted service keys.

## Learn behaviour and boundaries

`src/learning.js` owns sessions and quiz logic; `learning-ui.js` renders Learn. The main-process `learning:action` handler only accepts the Averill renderer and derives ownership from the active workspace person. Data is nested in the existing schema-1 workspace JSON. No destructive migration is required for older workspaces.

Sessions resume after restart. Confirmations record a specific operation and timestamp; employee confirmation is not visual verification. Manual records describe confirmed work; they are not evidence of a LinkedIn integration. Exclusion removes practice eligibility while preserving local history. Snapshots expose only the active person’s sessions and current-week quiz. This is local demonstration isolation, not real authentication.

Weekly eligibility uses Monday-based Europe/Copenhagen weeks and confirmed activities. Sets contain up to two learned-operation questions, a source/version check when linked evidence remains valid, the latest recorded-work reflection where applicable, and a practical operation reflection. Company evidence must remain visible/approved, match its original version/hash and not be in a source conflict. Invalid evidence/excluded activity blocks affected questions; changed records offer explicit practice refresh. Answer keys are omitted from renderer snapshots. Incorrect choices receive explanations; a missed operation informs the next-practice suggestion. Reflections are self-confirmed and not automatically graded.

Learn makes no AI/network request or screenshot archive. Opening the official guide is an explicit action. General conversational Canva tutoring, automatic geometry/step assessment, export guidance, inferred mastery and automatic activity tracking are not implemented. Existing Canva OCR is a separate Work flow and does not establish these capabilities.

## Run, artifacts and storage

Node.js 22+. From `travel-desktop/`:

```sh
npm ci
npm start
npm test
npm run package:mac
```

Packaged unsigned arm64 app: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`. ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`, generated with `ditto`, not tracked by Git. Both were rebuilt after the Learn changes. Restart an older running app to load the new code. The native checks used `/tmp/averill-learning-preview` as a separate user-data profile with synthetic records; do not import those records into the normal employee workspace.

From the repository root, `npm --prefix travel-site start` serves Elseweek at `http://127.0.0.1:4173/`; gallery at `/design-system/index.html`. No install/build is needed for the dependency-free site. It includes city filters, native details/articles, local trip-brief generation and local photos/fonts. No bookings/payments/enquiry backend. Domain/trademark clearance is not established. Internal-browser desktop/mobile checks passed; download saving was not confirmed by the browser event.

Company copies and workspace JSON live in Electron user data. Optional Nebius/Tavily environment variables are listed in [`.env.example`](../.env.example). Keys entered in Setup use encrypted local storage; never commit keys, `.env.local`, imported user material, user-data folders or build dependencies.

## Verified evidence

- **12 Node tests pass:** original campaign findings/answers/citations, workspace roles/source approval/conflicts/import, plus learning persistence, ordered confirmations, person isolation, exclusion, stale/revoked/conflicting source evidence, Copenhagen week rollover and work reflections.
- **Native dev app:** isolated workspace creation, Learn/help, step advancement, weekly generation, wrong-answer explanation and practical-reflection completion.
- **Native packaged app:** restart resumed step 3 with two saved confirmations and earlier test answers/reflection. Manual LinkedIn activity was recorded through UI; refresh generated a prompt for that exact activity. These are synthetic test records, not proof of real employee learning or Canva operations. Final wording changes were syntax-tested and the app/ZIP rebuilt.
- **Previous packaged campaign checks:** shared old brief yields current-source finding; v2 opens; Escape closes; local version comparison cites both briefs; Stop sharing clears findings. Email/Social visuals checked and actual SVG rendered.
- **Services:** fixed campaign Nebius request previously succeeded; Tavily returned live results in the dev app. The company-source Nebius route is not live-verified; prior transfer was blocked pending specific payload consent. Real selected Canva capture/permission/Stop sharing remains unverified end to end.

No signed/notarized release, Windows proof, real authentication/sync, external app control, automatic edit/send/publication, certified accessibility or live website review integration is claimed.

## Next work, in order

1. Owner acceptance of the bounded Learn experience. Rehearse with an actual Canva design and perform the operations; separately test explicit capture, Screen Recording denial, OCR and Stop sharing. Keep confirmation distinct from verified geometry.
2. Create a coherent Elseweek company pack across departments and migrate desktop-company wording/assets without removing superseded fixtures. Verify person/source visibility through onboarding in the package.
3. Implement a LinkedIn-specific supplied draft/editor and approved LinkedIn campaign source. Current Social Publisher is an Instagram Reel fixture; its dates/disclosures cannot be presented as LinkedIn policy. Approved historical email: 15 October 2026, 10:00 Copenhagen; paid Reel: 17 October, 18:00.
4. If needed for the richer target video, add validated conversational Canva guidance/export steps and content-specific campaign exercises. Current weekly company question checks approval/version; it does not evaluate campaign audience or free-text copy.
5. Rehearse the actual four-minute recording with resettable synthetic data and working source links. Use the existing source/version handover as an optional reliable scene. Label seeded activity and supplied editors honestly.
6. Before real-company deployment: authentication/sync, tenant isolation, source revocation/deletion, retention, stronger semantic conflicts and claim-to-citation checks. Role switching and same-title conflict rules are limited prototypes.

## Repository map

- `travel-desktop/main.js`, `preload.js`: windows, sender checks, sharing, services, workspace and learning IPC.
- `travel-desktop/src/learning.js`, `learning-ui.js`, `tests/learning.test.js`: Learn state/UI/tests.
- `travel-desktop/src/agent.*`, `agent-theme.css`, `agent-controls.css`: assistant and tabs.
- `travel-desktop/src/work.*`, `work-theme.css`: supplied campaign editors.
- `travel-desktop/src/workspace.js`, `workspace-answer.js`: local sources, roles, approval and company answers.
- `travel-desktop/src/engine.js`, `assistant.js`, `campaign.js`: campaign rules/local answers/Nebius.
- `travel-desktop/src/web-search.js`, `scripts/extract-text.swift`: research and local extraction.
- `travel-site/`: independent Elseweek website, design system, brand and asset provenance.
- [LEARNING_IMPLEMENTATION_PLAN.md](LEARNING_IMPLEMENTATION_PLAN.md): plan and delivered boundary.

Remote: `https://github.com/sararr25/averill-ai.git`, branch `main`. Check current Git status/remote before continuing; this file deliberately does not embed its own commit hash. `ARCHITECTURE.md` is the canonical system design; the Word copy is a convenience export.
