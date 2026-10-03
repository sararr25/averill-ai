# Averill execution handover

## Current release status — 3 October 2026

This section supersedes historical test totals and artifact statements below. The current suite passes **44/44**. Source native feedback, selected-window OCR and task-review smoke passed on 3 October in isolated synthetic profiles; bundled-resource feedback passed too. These are not actual email/social/Canva account acceptance.

Use `npm run package:release` from `travel-desktop` to rebuild the unsigned arm64 app and ZIP together. `npm run verify:release` compares tracked desktop source and both native helpers with the bundle, extracts the ZIP and compares its complete file/symlink inventory. Build evidence and archive SHA-256 are in ignored `travel-desktop/dist/release-verification.json`. It records the source revision at build time, not a claim that later commits are bundled.

The owner authorized pushing the five follow-up milestones on 3 October. The earlier publication block is historical; record each new milestone and its push separately in [MILESTONES_2026-10-03.md](MILESTONES_2026-10-03.md). Real-platform, permission and physical-display gates remain open.

## Current demo migration — 3 October 2026

The shipped campaign sources, current artwork labels, four editors, tests, manual pack and mixed-format intake now use Vamo. Packs are `demo-company/vamo/` and `demo-company/vamo-intake/`; People guide v2 describes local sign-in. Newly generated fictional addresses use `vamo.example`; new draft keys use `vamo:v2`. Existing normal-profile credentials, imported copies, approvals, login documents and old drafts remain unchanged. Use a fresh isolated Vamo workspace for recording, or explicitly reimport and reapprove updated source files. Do not silently rename account emails or treat changed text as previously approved. See [DEMO_MIGRATION.md](DEMO_MIGRATION.md).

## Historical handover — 28 September 2026

Everything below is dated historical evidence. Its Elseweek/Aurelia identities and prior artifact/test totals describe previous versions; the current sections above supersede them.

The full implementation sequence and acceptance gates are in [COMPLETE_VISION_PLAN.md](COMPLETE_VISION_PLAN.md).

Vamo is the fictional travel-company brand and has an independent website in `travel-site/`. Averill is the Nvidia–Nebius hackathon product: a companion that helps company employees in the email, LinkedIn, Instagram, Canva, document and other tools they already use. The four supplied Electron editors are test fixtures, not the intended employee workspace.

Points 1–3 of the [complete-vision plan](COMPLETE_VISION_PLAN.md) now have an implemented local path. Work selects one external app/browser window, reads it through macOS Accessibility or visible-text OCR, and can poll it every six seconds after explicit Start. The movable floating control opens Averill, displays selection/observation/last-read status, and offers Stop. The main process checks the selected window ID and owning PID before each read; Stop, sign-out and account change clear transient text and prevent an in-flight read from restoring it. Captures are memory-only; temporary PNGs are deleted. The supplied Electron editors remain collapsed synthetic fixtures.

The new work-type review checks exact rules from approved, visible, non-conflicting company files. Credential-shaped text and Luhn-valid payment numbers are redacted from observations before display or review. Optional Nebius interpretation requires owner policy, session opt-in, eligible source consent and a separate observed-text confirmation; output must cite exact source and observed excerpts and is reauthorized before display. This is a bounded review, not a full understanding of hidden fields, visual layout, actual platform state or external publication. Tavily still receives only a public query typed by the employee. [EXTERNAL_WORK_ACCEPTANCE.md](EXTERNAL_WORK_ACCEPTANCE.md) records the domain cases and proof gates.

Verification: `npm test` passed 44/44; `npm run verify:feedback`, `verify:external` and `verify:task-review` passed in isolated Electron profiles. Real native TextEdit selection/Accessibility read/live edit/Stop passed with synthetic text. Real Chrome selection/OCR/live edit/Stop passed on a local synthetic editor page. The unsigned arm64 app was rebuilt with both Swift helpers; feedback and external observation smoke passed against its bundled resources. The expected private-link and post-Stop negative IPC tests log handled errors. No live Nebius request, production email/social account, actual Canva document, direct packaged-app launch, physical second monitor or permission-revocation test was performed. The existing ZIP has not been refreshed in this pass; use the `.app` or build a new archive before sharing.

Remaining for full points 1–3 acceptance: browser DOM/official draft adapter, edit-pause/field metadata, actual email/LinkedIn/Instagram/Canva account checks, fuller task schemas, live consented Nebius task review, multi-monitor/full-screen and permission-denial acceptance. The current local engine proves one source-backed email correction and revocation; it cannot justify claims about every channel. Keep later milestones in the plan untouched until these gates are closed.

Updated 28 September 2026. Canonical entry point for continuing this repository. Read [PROJECT.md](../PROJECT.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [AGENTS.md](../AGENTS.md) and the [desktop design system](../travel-desktop/design-system/DESIGN_SYSTEM.md) before changes.

## Product, identity and agreed demo

Averill is a standalone company assistant. Vamo is the fictional travel customer with a separate website in `travel-site/`. Averill and Vamo never share a name, logo, palette or interface style. The existing desktop department onboarding pack, prepared accounts, campaign sources and supplied windows still say Elseweek; they are legacy synthetic fixtures and were not migrated by the website redesign. See [Vamo website handover](../travel-site/docs/HANDOVER.md) for the current brand and migration boundary. The old square intentionally retains its historical Aurelia artwork. Preserve brief v1 and the old square asset because they are intentional outdated-material scenarios. Product, demo sources and developer documentation remain English.

The owner’s video direction is: company data onboarding across departments → employee learns Canva → applies learning to LinkedIn and newsletter work → weekly personalised practice. Opening with a presentation of the website was rejected. Canva should demonstrate tool learning, with campaign correction as supporting context. See [PRODUCT_DEMO_PLAN.md](PRODUCT_DEMO_PLAN.md) for the target four-minute sequence and implementation gates; that duration is not a confirmed submission limit.

## Brand boundary and website status — 28 September 2026

The current travel website is **Vamo**, a fictional demo customer. **Averill** is the agent-assistant product submitted to the hackathon. Their names, visual systems and interfaces must never be merged. Vamo uses warm cream, sea ink `#0E576B`, mint, pink-leaning coral and restrained fuchsia in a people-first travel editorial. Averill retains its separate Petrol / Coral / Ice desktop design system. The Vamo website was committed locally as `35228aa`; a remote `main` push was rejected by automatic review because site-building authorization did not include remote publication. The current repository state should be checked before release. The still-Elseweek-labeled desktop fixtures and account data need a planned migration; do not describe that work as finished. See [the Vamo handover](../travel-site/docs/HANDOVER.md).

## Current app areas

- **Review:** browsable findings, selected/current source, Explain/Copy/Practise/Recheck actions, inspectable source dialog and question composer. Shared supplied windows use fixed campaign sources; otherwise company questions use visible approved sources. Unsupported company questions can create a private local clarification request.
- **Work:** Select and locally observe one external window, stop from main/floating control, and run a bounded work-type check against approved company rules; optional Nebius review requires separate consent. The four supplied editors remain synthetic fixtures.
- **Learn:** four-step Canva lesson (selection, Position, alignment, grouping), bounded offline free questions, optional single selected-window OCR, three task projects and finding-linked correction exercises; optional linked approved company source; confirmed records and current-week questions/reflections. Deterministic field recheck and employee confirmation are separate.
- **Research:** explicit public Tavily query, with results separated from company policy.
- **Knowledge:** searchable local extracted text and originals, filters for status/department/type/conflicts, exact document review links, textual version comparison, approval decisions with reasons and private clarification requests.
- **Setup:** owner account/company, mixed-file onboarding with Nebius interpretation, bulk team accounts, local disable/reset/password change, people/departments, company/department import, private proposals, lead/admin approval, priority/supersession/conflicts and encrypted service keys.

## Addition pass — 28 September 2026

The requested “What I would add” section is tracked item by item in [ADDITIONS_STATUS.md](ADDITIONS_STATUS.md). Implemented locally: finding-to-practice path; composition/LinkedIn visual/newsletter export exercises; bounded free step help and one explicit selected-frame OCR; correction copy, before/target and recheck; extractive passage citations with version, approval and new-PDF page markers; bounded line comparison, manual version links, reasoned source decisions, private clarification, global knowledge filters; local account disable/reset/change; deletion of managed source copies and personal Learn history; onboarding staging cleanup. These do not establish automatic Canva geometry/export verification, semantic claim verification, email invites, hosted sync/tenant isolation, application encryption or a signed release. [AB_TEST_PLAN.md](AB_TEST_PLAN.md) records the single-variable experiment hypothesis and technical preflight; no live A/B result is claimed.

## UX continuity pass — 28 September 2026

- Review names the exact shared demo windows and offers Stop for each. A selected Canva window is labelled as selection for one-frame Review, with a separate clear action. Review distinguishes no shared context from supported checks with no findings, and lets the employee browse findings one at a time. The evidence and conversation scroll above a visible composer. Changing between company-source and demo-source answers adds a context note to the conversation.
- Company-source lookup now requires an actual query-term match before priority influences ordering. A question with no matching approved source returns uncertainty and no citation. With no demo window shared, a configured company workspace no longer falls back to the fixed campaign pack when it has zero approved sources. This is a retrieval guard, not independent claim-to-passage verification for Nebius output.
- Registered work editor windows can open another supplied editor through the narrow `agent:open-work` IPC handler; the destination kind is validated and a failed navigation shows an error in the editor. Campaign Files sidebar labels describe the local file opened.
- Setup retains its unsaved form while unrelated snapshots arrive; its local approval and cloud-browser actions force a targeted rerender. Learn moves keyboard focus to the next step or unanswered question after saving. Knowledge opens the exact uploaded proposal or pending source in Setup. Research and AI controls explain missing configuration and send an administrator to Setup.
- Supplied editor draft saves are now keyed to the signed-in local person. The former shared `elseweek:v1:<kind>` keys are preserved but not silently assigned to a person. Work editors label unsaved changes; loading the flawed demonstration draft can be undone. The assistant remembers the last visited area for each local person and resumes it after login unless onboarding is pending. These are local UX states, not cloud sync.
- A knowledge-only onboarding batch explains that zero team accounts is normal; Nebius interpretation remains optional and consent-gated.

## Learn behaviour and boundaries

`src/learning.js` owns sessions and quiz logic; `learning-ui.js` renders Learn. The main-process `learning:action` handler only accepts the Averill renderer and derives ownership from the active workspace person. Data is nested in the existing schema-1 workspace JSON. No destructive migration is required for older workspaces.

Sessions resume after restart. Confirmations record a specific operation and timestamp; employee confirmation is not visual verification. Manual records describe confirmed work; they are not evidence of a LinkedIn integration. Exclusion removes practice eligibility while preserving local history. Snapshots expose only the active person’s sessions and current-week quiz. Separate local credentials now identify the active employee. This is application-level isolation on one Mac, not cloud authentication or tenant isolation against direct local-file access.

Weekly eligibility uses Monday-based Europe/Copenhagen weeks and confirmed activities. Sets contain up to two learned-operation questions, a source/version check when linked evidence remains valid, the latest recorded-work reflection where applicable, and a practical operation reflection. Company evidence must remain visible/approved, match its original version/hash and not be in a source conflict. Invalid evidence/excluded activity blocks affected questions; changed records offer explicit practice refresh. Answer keys are omitted from renderer snapshots. Incorrect choices receive explanations; a missed operation informs the next-practice suggestion. Reflections are self-confirmed and not automatically graded.

Learn makes no AI/network request or screenshot archive. Opening the official guide is an explicit action. Its free question help is bounded, offline guidance over the four taught operations, and selected Canva OCR is one explicit frame. Automatic geometry/step assessment, visual export verification, inferred mastery and automatic activity tracking are not implemented.

## Run, artifacts and storage

Node.js 22+. From `travel-desktop/`:

```sh
npm ci
npm start
npm test
npm run package:mac
```

Packaged unsigned arm64 app: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`. ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`, generated with `ditto`, not tracked by Git. Both were rebuilt after the 28 September addition pass. Restart an older running app to load the new code. Recent native checks used separate synthetic user-data profiles; do not import those records into the normal employee workspace.

From the repository root, `npm --prefix travel-site start` serves Vamo at `http://127.0.0.1:4173/`; its design system is at `/design-system/index.html`. The dependency-free site has an editorial travel homepage, destination dialogs, creator-style editorial previews, journal dialogs and a local trip-brief generator. No booking, payment, enquiry or live social integration is present. The ferry hero is generated concept photography; city photos are credited. See [the dedicated site handover](../travel-site/docs/HANDOVER.md) for brand tokens, verified checks and next steps.

Company copies and workspace JSON live in Electron user data. Optional Nebius/Tavily environment variables are listed in [`.env.example`](../.env.example). Keys entered in Setup use encrypted local storage; never commit keys, `.env.local`, imported user material, user-data folders or build dependencies.

## Verified evidence

- **33 Node tests passed at that historical stage:** original campaign, workspace, onboarding, privacy, OAuth callback and learning tests plus local account disable/reset/change, finding/task practice, motivated version decisions and line diff, exact passage/model extraction, clarification isolation and managed-copy deletion.
- **Addition pass native preflight:** an isolated synthetic owner shared a flawed LinkedIn draft, saw five findings and opened a linked practice exercise with source and before/target text. An unsupported company-policy question returned no citation and offered private clarification. After fixing a loading defect, Knowledge displayed three documents and the owner answered the request privately; line comparison opened with both source versions. No real Canva screen, live provider account or real employee data was used. The preflight exposed and resolved the two defects documented in [AB_TEST_PLAN.md](AB_TEST_PLAN.md).
- **Bundle and extractor:** `npm run package:mac` rebuilt the unsigned arm64 app; `npm run verify:feedback` passed against its bundled resources after updating a historical assertion to the new Knowledge status wording. The suite intentionally tests that private-network import is rejected, which logs a handled error. The rebuilt Swift helper extracted `[PDF page 1]` from the synthetic campaign PDF. `git diff --check` and syntax checks passed. The ZIP was regenerated after packaging. This is bundled-resource smoke, not a direct final-app launch or signed-install test.
- **UX continuity check:** native source app with an isolated synthetic owner verified zero-citation no-evidence answers, editor-to-editor navigation, unsaved Setup input retention, undo of a loaded flawed draft, five-finding Review navigation, Stop from Review, direct Knowledge-to-Setup proposal opening and Learn focus advancement. Review was visually rechecked after giving its feed an independent scroll region. `npm run verify:feedback` passed for source and bundled app resources. The final `.app` executable was packaged but not directly launched for this pass.
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
- **Credentials:** async scrypt with random salts; renderer snapshots omit credentials/evidence internals. Owner and generated passwords are saved in separate local Markdown login documents at the user's explicit request. Workspace JSON retains hashes; account documents never enter snapshots or Nebius. The admin can reopen the folder from Account access, disable/reset another non-owner account, and each signed-in person can change their password. No invitation emails or unauthenticated owner recovery are implemented; use the saved owner document for retrieval. This is local authentication on one Mac; local files remain readable/editable to the OS account, so no production multi-tenant security or multi-device service is claimed.
- **Session:** login validates a distinct account. Protected IPC requires the authenticated Averill session; sender checks remain enforced. Sign-out closes supplied work windows, clears sharing/AI/external selection and visible prior-account draft/learning. Anonymous snapshots omit sources/onboarding/learning; company name and demo account directory remain visible to make the demo account picker usable. Five bad password attempts impose a one-minute delay.
- **Verified:** 18 Node tests; separate live Nebius requests returned correct mixed-file metadata/company and extracted three correctly profiled people from unstructured prose (local parser found zero), using `nvidia/nemotron-3-super-120b-a12b`. Native dev renderers/preload/main IPC verified owner bootstrap, all six files, bulk profiles, source scope/version, hidden roster, wrong password, denied role-switch bypass, denied anonymous source/administration access, restricted company approval, sign-out, creator Learn and restart with login required. File chooser was stubbed. Synthetic scan verification recovered the company and campaign from an image-only PDF. Native captures were inspected; horizontal overflow check passed. A subsequent test loaded the rebuilt bundle app resources in the installed Electron runtime and verified owner login, the packaged XLSX subprocess, PDF/SVG extraction, duplicate exclusions, v2 metadata and compact Setup. The final `.app`/ZIP are rebuilt unsigned; this is not a manual native-chooser rehearsal or a directly launched final-bundle acceptance test. Patched uuid override gives zero npm audit vulnerabilities. Normal user workspace was not seeded/reset.
- **Tutorial:** `docs/ONBOARDING_TUTORIAL.md` replaces the one-by-one onboarding path for this demo; the old manual pack remains available. Native profiles `/tmp/averill-auth-onboarding-profile` and all generated test credentials are synthetic and must not be imported into the real workspace.

## Remaining work, in order

1. Owner acceptance of the bounded Learn experience. Rehearse with actual Canva operations; separately test capture, Screen Recording denial, OCR and Stop sharing. Keep confirmation distinct from verified geometry.
2. Manually rehearse mixed-file Elseweek onboarding through the native file chooser and review the supplied LinkedIn scene in the final packaged app; automated IPC checks above are complete.
3. For stronger task acceptance, validate real Canva geometry and export outcomes, and assess free-text campaign choices against reviewed evidence. Current exercises and free help are bounded local guidance; employee confirmation is labelled separately from rule checks.
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
- `travel-site/`: independent Vamo website, design system, brand and asset provenance. Its handover is `travel-site/docs/HANDOVER.md`; desktop fixtures are still Elseweek-labeled.
- [LEARNING_IMPLEMENTATION_PLAN.md](LEARNING_IMPLEMENTATION_PLAN.md): plan and delivered boundary.

Remote: `https://github.com/sararr25/averill-ai.git`, branch `main`. Check current Git status/remote before continuing; this file deliberately does not embed its own commit hash. `ARCHITECTURE.md` is the canonical system design; the Word copy is a convenience export.

## Local login documents — 26 September 2026

User explicitly requested retrievable demo passwords. New owner setup, legacy owner activation, manual employee accounts and bulk onboarding now save one Markdown login document per account in userData/Averill-login-documents. The owner can reopen the folder from Account access. This folder stays outside Git, company sources, snapshots and Nebius input. Existing pre-feature account hashes cannot recover passwords. Initial inspection found Aurelia Demo with one legacy administrator and no credentials. The later user correction is resolved by the prepared local demo section below; no existing password was reset.

## Next developer entry point

- Canonical repository: /Users/sararuffini/Documents/Hackatons/Nvidia/averill-ai. Remote sararr25/averill-ai, main. Preserve unrelated changes and inspect git status first.
- Executable: travel-desktop/dist/Averill-darwin-arm64/Averill.app. Archive: travel-desktop/dist/Averill-macOS-arm64.zip. Both are unsigned Apple Silicon macOS artifacts, ignored by Git. Quit older copies before opening the build.
- Rebuild: cd travel-desktop, npm ci, npm test, npm run package:mac. Archive with ditto -c -k --sequesterRsrc --keepParent Averill-darwin-arm64/Averill.app Averill-macOS-arm64.zip from dist. Environment keys remain local; never print or commit them.
- Historical verification for the initial account-document delivery: 19 Node tests passed. Current suite and native checks are recorded in **Verified evidence** above. The folder-opening action has not been manually rehearsed in the latest final app.
- Resolved: the user reported no usable login and missing service keys. The normal Aurelia Demo is now prepared with four working accounts and encrypted local keys; see below. Do not reset existing accounts or reuse /tmp test credentials. New account creation will automatically produce documents.
- Next acceptance: open the final app, sign in using the saved owner document, upload six intake files with the real chooser, review/approve, verify existing account email exclusions and document access, switch through four accounts and reopen documents after restart.
- Product gaps: cloud authentication/sync, unauthenticated owner recovery, invitation delivery, signed distribution, live social publication and structural Canva integration remain unimplemented. Local source data and local login documents are separate from approved company knowledge.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

### Preparation and verification

Quit Averill, then run ./node_modules/.bin/electron scripts/prepare-local-demo.cjs from travel-desktop only for a legacy workspace without credentials. The helper requires local .env.local and encrypted OS storage; it preserves company/admin identity, verifies all four generated passwords, backs up the workspace, saves documents and encrypted keys. It refuses auth-enabled/credential-bearing workspaces, so do not rerun it on the prepared normal workspace.

Verification used normal workspace data and final bundle main/preload/renderers in the installed Electron runtime with environment keys removed: four distinct logins and logout passed, employee/manager access to account documents was denied, both services loaded from encrypted storage and Setup showed configured labels. The actual final .app was directly launched through native computer use and visibly showed the login screen. Nineteen Node tests pass. The real final-bundle chooser rehearsal and company-document AI request remain separate acceptance checks.

Provider authentication checks also passed: Nebius /v1/models returned HTTP 200; Tavily returned five results for the public query Canva Position alignment tools official help. No company document content was sent by these checks. Final native login picker visibly listed all four profiles, and the owner email was prefilled for the user.

## Multisource intake and confidentiality — 27 September 2026

Implemented Desktop/Finder drag-and-drop, local picker, synced Drive/OneDrive files, HTTPS links and registered-client Google Drive/OneDrive OAuth with selected-file browsing. All inputs merge into the local review; adding files re-extracts the unapplied batch. Direct cloud authentication remains unverified and requires client registration. See [CLOUD_CONNECTIONS.md](CLOUD_CONNECTIONS.md).

Company AI defaults off. Owner policy plus explicit per-file permission is required; restricted/credential-looking files and legacy sources without permission are excluded from Nebius. Connecting a drive does not authorize AI. See [COMPANY_CONFIDENTIALITY.md](COMPANY_CONFIDENTIALITY.md) for provider terms and production storage gaps. Local copies are not application-encrypted; do not promise enterprise secrecy, NDA, zero retention or verified opt-out.

New modules: `company-privacy.js`, `remote-import.js`, `cloud-import.js`, `intake-ui.js`; IPC bridges in main/preload. Safe HTTPS resolves and pins public addresses, validates redirects, strips bearer credentials on redirect and bounds files. Cloud tokens/configuration are safeStorage encrypted, scoped to owner/workspace, read-only, expire without refresh and disconnect locally.

25 Node tests pass, including mocked providers and a real local OAuth callback. Native packaged-resource checks passed a real disk-backed File through the drop event/preload, appended a synced XLSX, imported a live public HTTPS demo document, blocked private-network links and unconfigured cloud clients, and verified Setup without horizontal overflow. No live Google/Microsoft authorization or real confidential document transfer was tested. Preserve prepared normal-profile accounts and encrypted service keys. Rebuild app/ZIP after changing sources; app artifact remains `travel-desktop/dist/Averill-darwin-arm64/Averill.app`.

Reproduce the native multisource smoke check with `npm run verify:intake` in `travel-desktop` (GUI and network required); set `AVERILL_NATIVE_APP` to bundled Resources/app to check packaged resources. It creates an isolated temporary profile and uses synthetic/public demo documents, never normal employee data.

## Visible action feedback and company knowledge — 27 September 2026

The desktop has a persistent action banner beneath navigation. Preload emits operation ID/channel/status and sanitized outcome text, with no IPC arguments, keys, tokens, passwords or document text in feedback events. Explicit IPC actions show pending, completion or failure. Local selection cancellation is identified; intake reports received/readable files and warnings, then links to Knowledge. Snapshot refreshes and automatic knowledge queries do not generate action notifications. There is no invented upload percentage: local extraction is synchronous in the main process, preceded by a renderer paint opportunity.

UI refinement: compact header and session strip remain visible in Review; the aperture shrinks for findings; source state uses muted old evidence and ice approved evidence across Review/Campaign Files. Work draft review, Learn starts and Setup onboarding confirmation have a filled primary action. Routine success banners clear after 5.5 seconds; pending, errors and onboarding approval outcomes remain dismissible. The composer document button has a state-specific accessible name. `src/ui-refinements.css` is loaded last in the agent renderer.

Knowledge is a separate tab. Uploaded proposals appear immediately for their owning admin; saved sources obey existing person/department/private visibility. Search covers extracted text and titles; status filters distinguish uploaded, approved, pending, private and superseded. Cards expose local excerpts, readable/unreadable state, version, visibility and AI permission. Full bounded extracted text opens locally in a dialog; saved originals can be opened. Saving and approving sources remain separate from AI permission. Excerpts and search are deterministic local document access, not an AI summary. Logout invalidates in-flight library requests and clears the library and search; backend queries reject unauthenticated callers.

Knowledge previews now strip simple Markdown heading/backtick markers for reading, highlight the query using text nodes, and start on the matching line where possible. The count shows matching documents against the visible total; approval/review counts remain totals for all visible documents.

Modules: knowledge.js (role-filtered local query), knowledge-ui.js and feedback-ui.js; preload operation notifications and main-process knowledge/read-upload IPC. Existing work sharing, learning and external AI boundaries are preserved. Avoid restoring the old silent callbacks or re-enabling intrinsically disabled cloud buttons after onboarding operations.

26 Node tests pass, including upload visibility, text search and exclusion of another person's private personnel evidence. `npm run verify:feedback` passes against source and rebuilt bundle resources: native pending/success/error/cancel, pre-confirmation and approved library, local text reading/search, viewport bounds and logout cleanup in an isolated synthetic profile. `AVERILL_NATIVE_APP` selects final bundle Resources/app. The 28 September source renderer was visually checked in Review (ready/finding), Work, Knowledge search, and Campaign Files v1/v2. This is not a direct launch of the final `.app` executable; the normal user profile is preserved.
