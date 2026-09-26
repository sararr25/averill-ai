# Averill execution handover

Updated 26 September 2026. Canonical entry point for continuing this repository. Read [PROJECT.md](../PROJECT.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [AGENTS.md](../AGENTS.md) and the [desktop design system](../travel-desktop/design-system/DESIGN_SYSTEM.md) before changes.

## Product, identity and agreed demo

Averill is a standalone company assistant. Elseweek is the fictional travel customer with a separate website in `travel-site/` and a department onboarding pack in `travel-desktop/demo-company/elseweek/`. Current desktop wording and approved assets now say Elseweek. The old square intentionally retains its historical Aurelia artwork. Preserve brief v1 and the old square asset because they are intentional outdated-material scenarios. Product, demo sources and developer documentation remain English.

The owner’s video direction is: company data onboarding across departments → employee learns Canva → applies learning to LinkedIn and newsletter work → weekly personalised practice. Opening with a presentation of the website was rejected. Canva should demonstrate tool learning, with campaign correction as supporting context. See [PRODUCT_DEMO_PLAN.md](PRODUCT_DEMO_PLAN.md) for the target four-minute sequence and implementation gates; that duration is not a confirmed submission limit.

## Current app areas

- **Review:** leading finding, selected/current source, inspectable source dialog and campaign question composer. Shared supplied windows use fixed campaign sources; otherwise company questions use visible approved sources.
- **Work:** Open/Share/Stop for Email Studio, LinkedIn Draft, Social Publisher and Campaign Files; approved-source marketing draft review; separately selected Canva window with explicit one-frame OCR.
- **Learn:** four-step Canva lesson (selection, Position, alignment, grouping), step help and official guide; optional linked approved company source; confirmed learning records and manual Canva/LinkedIn/newsletter practice; current-week questions, explanations and self-confirmed practical reflection.
- **Research:** explicit public Tavily query, with results separated from company policy.
- **Setup:** owner account/company, mixed-file onboarding with Nebius interpretation, bulk team accounts, people/departments, company/department import, private proposals, lead/admin approval, priority/supersession/conflicts and encrypted service keys.

## Learn behaviour and boundaries

`src/learning.js` owns sessions and quiz logic; `learning-ui.js` renders Learn. The main-process `learning:action` handler only accepts the Averill renderer and derives ownership from the active workspace person. Data is nested in the existing schema-1 workspace JSON. No destructive migration is required for older workspaces.

Sessions resume after restart. Confirmations record a specific operation and timestamp; employee confirmation is not visual verification. Manual records describe confirmed work; they are not evidence of a LinkedIn integration. Exclusion removes practice eligibility while preserving local history. Snapshots expose only the active person’s sessions and current-week quiz. Separate local credentials now identify the active employee. This is application-level isolation on one Mac, not cloud authentication or tenant isolation against direct local-file access.

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

Packaged unsigned arm64 app: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`. ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`, generated with `ditto`, not tracked by Git. Both were rebuilt after the Elseweek / LinkedIn changes. Restart an older running app to load the new code. The native checks used `/tmp/averill-learning-preview` as a separate user-data profile with synthetic records; do not import those records into the normal employee workspace.

From the repository root, `npm --prefix travel-site start` serves Elseweek at `http://127.0.0.1:4173/`; gallery at `/design-system/index.html`. No install/build is needed for the dependency-free site. It includes city filters, native details/articles, local trip-brief generation and local photos/fonts. No bookings/payments/enquiry backend. Domain/trademark clearance is not established. Internal-browser desktop/mobile checks passed; download saving was not confirmed by the browser event.

Company copies and workspace JSON live in Electron user data. Optional Nebius/Tavily environment variables are listed in [`.env.example`](../.env.example). Keys entered in Setup use encrypted local storage; never commit keys, `.env.local`, imported user material, user-data folders or build dependencies.

## Verified evidence

- **18 Node tests pass:** original campaign findings/answers/citations, workspace roles/source approval/conflicts/import, plus onboarding bulk accounts/privacy/company scope, model evidence/consent/failure/rollback, organic LinkedIn findings/resolution/citations, Elseweek department-pack approval/visibility/version persistence and learning persistence, ordered confirmations, person isolation, exclusion, stale/revoked/conflicting source evidence, Copenhagen week rollover and work reflections.
- **Native dev app:** isolated workspace creation, Learn/help, step advancement, weekly generation, wrong-answer explanation and practical-reflection completion.
- **Native packaged app:** restart resumed step 3 with two saved confirmations and earlier test answers/reflection. Manual LinkedIn activity was recorded through UI; refresh generated a prompt for that exact activity. These are synthetic test records, not proof of real employee learning or Canva operations. Final wording changes were syntax-tested and the app/ZIP rebuilt.
- **Previous packaged campaign checks:** shared old brief yields current-source finding; v2 opens; Escape closes; local version comparison cites both briefs; Stop sharing clears findings. Email/Social visuals checked and actual SVG rendered.
- **Services:** fixed campaign Nebius request previously succeeded; Tavily returned live results in the dev app. The company-source Nebius route is not live-verified; prior transfer was blocked pending specific payload consent. Real selected Canva capture/permission/Stop sharing remains unverified end to end.

No signed/notarized release, Windows proof, cloud authentication/sync, external app control, automatic edit/send/publication, certified accessibility or live website review integration is claimed.

## Delivered: Elseweek onboarding and LinkedIn — 26 September 2026

The owner first requested preparation steps 2 and 3, then a stop. Those were delivered. The later request authorizes smooth company onboarding from files and four separate local account profiles; that delivery is described below. Canva acceptance, richer weekly assessment and recording remain outside the current implementation scope.

- **Company pack:** `travel-desktop/demo-company/elseweek/README.md` defines fictional people for Marketing, Operations and People, document owners, intended approvals, priorities and exact import versions. It includes identical department brand-context copies, campaign sources, Operations procedure, People onboarding, a private employee proposal and optional archived brief v1. The older manual pack duplicates brand context per department. The newer mixed-file intake supports a real company-wide source scope. Import the four Marketing v1 documents and campaign brief v2 separately; do not import the whole root as Marketing.
- **Setup:** administrators choose import department/version; employee/lead imports are constrained to their department in workspace logic. Imported text saying APPROVED does not approve the workspace record. Existing workspace data is preserved; no demo data is silently inserted.
- **Brand migration:** current desktop chrome, footer/disclosure, sources, email/Reel assets and assistant prompt use Elseweek. Brief v1 and old square are preserved. Legacy `aurelia:<kind>` drafts remain untouched; new local drafts use `elseweek:v1:<kind>`.
- **LinkedIn Draft:** fourth supplied editor, organic company-page copy, editorial audience, landscape asset preview, planned date/time, approved-guide action and local Save. Share/Stop gates five deterministic checks: guarantee phrase, audience, wrong asset, missing CTA and slot. All cite `linkedin-campaign.md`. New synthetic LinkedIn slot: **16 October 2026, 09:00 Europe/Copenhagen**. Email remains 15 October, 10:00; paid Instagram Reel remains 17 October, 18:00. The new landscape SVG derives from the existing supplied email illustration, not a Canva-generated/exported design.
- **Boundary:** these are limited campaign checks, not general tone evaluation, LinkedIn API access, live Canva creative transfer or publication. Static supplied-window checks use the registered campaign pack independently of imported workspace approvals. Company answers/learning continue using accessible approved imported sources.
- **Verification:** 14 Node tests pass. An automated Electron harness loaded the rebuilt bundle's app resources in the installed Electron runtime with `/tmp/averill-elseweek-smoke-profile`. Actual renderers/preload/main IPC checked admin department options, imports, lead approval, employee visibility for all three departments, v2 metadata, five LinkedIn findings, cited guidance, corrections clearing findings, actual landscape rendering, local Save and Stop clearing findings. A second process checked restored approvals/visibility/v2 metadata and the saved LinkedIn draft, with no sharing on restart. Native captures were visually inspected and no horizontal document overflow occurred. The test file/folder chooser was stubbed; this does not establish a manual native-chooser onboarding rehearsal or direct launch of the final `.app`. The unsigned bundle and ZIP were rebuilt; Canva/network services were not exercised.

## Delivered: smooth file onboarding and four local accounts — 26 September 2026

- **Start:** new company creation includes owner name/email/password. Old workspaces retain their people/sources/learning and can explicitly enable owner login. After activation, passwordless role switching is rejected by main-process IPC. Restart always requires sign-in.
- **Profiles:** owner/CEO/admin; Marketing manager (lead); Marketing strategy employee; Content creator. Employees share department permissions but have separate IDs, learning and history. Imported records cannot create admins; the owner explicitly creates any further administrator. The mixed intake adds Maya/Emma/Oscar in one confirmation; owner setup provides Alex.
- **Intake:** `travel-desktop/demo-company/elseweek-intake/` has a staff XLSX, brand/company SVG, campaign v2 PDF, LinkedIn/Operations/People Markdown. Up to 30 files, 20 MB each. XLSX uses ExcelJS in a bounded subprocess (20 sheets, 2000 rows, 50 columns, no formula execution). Legacy XLS needs an XLSX/CSV export. PDFKit extracts up to 30 pages; blank scanned pages use local Vision OCR. SVG onboarding extracts text/title/description, not outlined geometry. Extraction failure/truncation is shown.
- **Nebius:** explicit per-upload confirmation sends readable extracted text (up to 12k characters/file, 60k total), never passwords/API keys/file binaries. Nemotron proposes people/company/document metadata. Person names/emails require a known source ID and a matching quote; unknown/fabricated identity suggestions are excluded. Proposed scopes/roles/versions remain reviewable. Failed requests preserve the local draft. No approval or administrative privilege is inferred from a file.
- **Apply:** owner reviews people/document summaries, edits/excludes entries, confirms sources for approval, and creates separate accounts in bulk. Existing account emails are excluded. Personnel files remain private to the owner; company-wide guidance is available to all signed-in employees only after admin approval. Leads can approve only their department. New company scope avoids department brand duplication. A failed apply rolls back new records/imported copies; the draft remains available.
- **Credentials:** async scrypt with random salts; renderer snapshots omit credentials/evidence internals. Owner and generated passwords are saved in separate local Markdown login documents at the user's explicit request. Workspace JSON retains hashes; account documents never enter snapshots or Nebius. The admin can reopen the folder from Account access. No invitation emails are sent. No password reset is implemented; use the saved login documents for retrieval. This is local authentication on one Mac; local files remain readable/editable to the OS account, so no production multi-tenant security or multi-device service is claimed.
- **Session:** login validates a distinct account. Protected IPC requires the authenticated Averill session; sender checks remain enforced. Sign-out closes supplied work windows, clears sharing/AI/external selection and visible prior-account draft/learning. Anonymous snapshots omit sources/onboarding/learning; company name and demo account directory remain visible to make the demo account picker usable. Five bad password attempts impose a one-minute delay.
- **Verified:** 18 Node tests; separate live Nebius requests returned correct mixed-file metadata/company and extracted three correctly profiled people from unstructured prose (local parser found zero), using `nvidia/nemotron-3-super-120b-a12b`. Native dev renderers/preload/main IPC verified owner bootstrap, all six files, bulk profiles, source scope/version, hidden roster, wrong password, denied role-switch bypass, denied anonymous source/administration access, restricted company approval, sign-out, creator Learn and restart with login required. File chooser was stubbed. Synthetic scan verification recovered the company and campaign from an image-only PDF. Native captures were inspected; horizontal overflow check passed. A subsequent test loaded the rebuilt bundle app resources in the installed Electron runtime and verified owner login, the packaged XLSX subprocess, PDF/SVG extraction, duplicate exclusions, v2 metadata and compact Setup. The final `.app`/ZIP are rebuilt unsigned; this is not a manual native-chooser rehearsal or a directly launched final-bundle acceptance test. Patched uuid override gives zero npm audit vulnerabilities. Normal user workspace was not seeded/reset.
- **Tutorial:** `docs/ONBOARDING_TUTORIAL.md` replaces the one-by-one onboarding path for this demo; the old manual pack remains available. Native profiles `/tmp/averill-auth-onboarding-profile` and all generated test credentials are synthetic and must not be imported into the real workspace.

## Remaining work, in order

1. Owner acceptance of the bounded Learn experience. Rehearse with actual Canva operations; separately test capture, Screen Recording denial, OCR and Stop sharing. Keep confirmation distinct from verified geometry.
2. Manually rehearse mixed-file Elseweek onboarding through the native file chooser and review the supplied LinkedIn scene in the final packaged app; automated IPC checks above are complete.
3. If needed for the target video, add validated conversational Canva guidance/export steps and content-specific campaign exercises. Weekly practice still does not evaluate audience decisions or free-text copy.
4. Rehearse the four-minute recording with resettable synthetic data and working source links. Label seeded history and supplied editors honestly; the source/version scene is an optional reliable replacement.
5. Before real-company deployment: cloud authentication/sync, tenant isolation, revocation/deletion, retention, stronger semantic conflicts and claim-to-citation checks.

## Repository map

- `travel-desktop/main.js`, `preload.js`: windows, sender checks, sharing, services, workspace and learning IPC.
- `travel-desktop/src/learning.js`, `learning-ui.js`, `tests/learning.test.js`: Learn state/UI/tests.
- `travel-desktop/src/agent.*`, `agent-theme.css`, `agent-controls.css`: assistant and tabs.
- `travel-desktop/src/work.*`, `work-theme.css`: supplied campaign editors.
- `travel-desktop/src/workspace.js`, `workspace-answer.js`: local sources, roles, approval and company answers.
- `travel-desktop/src/engine.js`, `assistant.js`, `campaign.js`: campaign rules/local answers/Nebius.
- `travel-desktop/src/web-search.js`, `scripts/extract-text.swift`: research and local extraction.
- `travel-desktop/demo-company/elseweek/`: synthetic department pack and onboarding instructions.
- `travel-desktop/sources/linkedin-campaign.md`, `assets/winter-linkedin-landscape.svg`: supplied organic LinkedIn evidence and visual.
- `travel-desktop/src/accounts.js`, `onboarding.js`, `onboarding-ui.js`: local identity, intake/Nebius evidence/apply and guided Setup.
- `travel-desktop/demo-company/elseweek-intake/`, `docs/ONBOARDING_TUTORIAL.md`: mixed-format demo and four-account tutorial.
- `travel-site/`: independent Elseweek website, design system, brand and asset provenance.
- [LEARNING_IMPLEMENTATION_PLAN.md](LEARNING_IMPLEMENTATION_PLAN.md): plan and delivered boundary.

Remote: `https://github.com/sararr25/averill-ai.git`, branch `main`. Check current Git status/remote before continuing; this file deliberately does not embed its own commit hash. `ARCHITECTURE.md` is the canonical system design; the Word copy is a convenience export.

## Local login documents — 26 September 2026

User explicitly requested retrievable demo passwords. New owner setup, legacy owner activation, manual employee accounts and bulk onboarding now save one Markdown login document per account in userData/Averill-login-documents. The owner can reopen the folder from Account access. This folder stays outside Git, company sources, snapshots and Nebius input. Existing pre-feature account hashes cannot recover passwords. Normal user workspace inspected: Aurelia Demo, one legacy administrator, no credential-bearing accounts. No existing password was reset.

## Next developer entry point

- Canonical repository: /Users/sararuffini/Documents/Hackatons/Nvidia/averill-ai. Remote sararr25/averill-ai, main. Preserve unrelated changes and inspect git status first.
- Executable: travel-desktop/dist/Averill-darwin-arm64/Averill.app. Archive: travel-desktop/dist/Averill-macOS-arm64.zip. Both are unsigned Apple Silicon macOS artifacts, ignored by Git. Quit older copies before opening the build.
- Rebuild: cd travel-desktop, npm ci, npm test, npm run package:mac. Archive with ditto -c -k --sequesterRsrc --keepParent Averill-darwin-arm64/Averill.app Averill-macOS-arm64.zip from dist. Environment keys remain local; never print or commit them.
- Latest verification: 19 Node tests pass; JS syntax and git diff whitespace checks pass. Rebuilt app includes account-documents.js and guarded account:documents IPC. The new folder-opening action has not been manually rehearsed in the final app. Prior native onboarding evidence above remains valid for the previous build.
- Pending user choice: enable four logins in existing Aurelia Demo or a separate Elseweek demo. Normal workspace has only Demo Admin without credentials. Do not export /tmp test credentials as normal app accounts, silently reset passwords, or replace user data. New account creation will automatically produce documents.
- Next acceptance: open the final app, choose workspace/account setup, upload six intake files with the real chooser, review/approve, confirm four login documents including owner, switch through four accounts and reopen documents after restart.
- Product gaps: cloud authentication/sync, password reset, invitation delivery, signed distribution, live social publication and structural Canva integration remain unimplemented. Local source data and local login documents are separate from approved company knowledge.
