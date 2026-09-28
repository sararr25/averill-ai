# Averill

Averill is a source-grounded company agent assistant for people working across applications. The employee chooses what to share. Averill points out relevant inconsistencies after a field edit or asset selection, explains the issue, and links to the approved source. The employee decides what to change and whether to publish.

This repository contains an **Electron hackathon prototype**, a local company onboarding path, its Elseweek sample campaign and department source pack, a Canva tutor and weekly learning flow, the Vamo travel website, separate design systems, and handover documentation. Vamo is the fictional customer brand, never Averill's product name or style. Existing desktop fixtures still use the legacy Elseweek label.

Vamo is the independent fictional travel company with its own website. The desktop demo still carries legacy Elseweek fixture names. Employees create email, LinkedIn, Instagram, design and other work in their usual tools. Averill is the companion: its floating button opens help, shows observation status and can stop sharing. An employee can choose one external window for a local read or six-second observation, then check bounded approved company rules against the visible text. The supplied Electron editors remain hackathon test fixtures.

## Start here

1. [Handover](docs/HANDOVER.md) — current demo, verified boundary, setup, gaps, and next actions.
2. [PROJECT.md](PROJECT.md) — product intent, demo story, current state, and decisions.
3. [ARCHITECTURE.md](ARCHITECTURE.md) — components, data flow, trust boundaries, and extension plan.
4. [design system](travel-desktop/design-system/DESIGN_SYSTEM.md) — approved Petrol / Coral / Ice direction and implementation status.
5. [desktop app README](travel-desktop/README.md) — run and demo instructions.
6. [AGENTS.md](AGENTS.md) — rules for contributors and coding agents.
7. [product demo plan](docs/PRODUCT_DEMO_PLAN.md) — buyer journey, decisions, acceptance path, and remaining gates.
8. [complete vision plan](docs/COMPLETE_VISION_PLAN.md) — implementation sequence for assistance in employees' existing tools.

## Run

Requires Node.js 22 or newer.

```sh
cd travel-desktop
npm ci
npm start
```

Run `npm test` from `travel-desktop/` for the deterministic checks.

## Learn and the demo company

Open **Learn** after creating a workspace in Setup. Start the four-step Canva lesson, ask for step help, and confirm what you practised. Your week records confirmed steps and manually entered Canva/LinkedIn/newsletter activities. Weekly practice provides operation questions, source/version checks and practical reflections. It is offline and scoped to the active person; confirmation is not automatic visual assessment. See [learning plan](docs/LEARNING_IMPLEMENTATION_PLAN.md).

Review findings now lead to person-owned correction practice. Learn also has three task exercises for composition, a LinkedIn visual and newsletter export, plus bounded offline question help. Knowledge shows exact extracted passages, version/approval metadata, line comparisons, motivated approvals and private clarification requests. See [added capabilities and enterprise gates](docs/ADDITIONS_STATUS.md).

Run `npm --prefix travel-site start` from the repository root for the fictional Vamo site at `http://127.0.0.1:4173/`. The [site README](travel-site/README.md) and [Vamo handover](travel-site/docs/HANDOVER.md) cover the independent consumer design, brand rules and demo limits.

## Security and scope

The supplied sample windows send **structured field state** through the app; Averill produces fixture findings only while the employee explicitly shares a window. One selected external app/browser window can be locally observed through Accessibility text or visible-text OCR after explicit Start. The result can be checked against approved company rules; optional Nebius interpretation needs separate consent. There is no arbitrary-window surveillance, browser DOM adapter, structural platform API access, automatic edit, email send, or post publication. A local company workspace stores imported copies, people, department source approval, and priorities on one Mac. New workspaces use separate local email/password accounts; legacy role switching is disabled after owner-account activation. No cloud authentication or synchronization is provided. Tavily receives only an explicit typed public query. See [ARCHITECTURE.md](ARCHITECTURE.md) for exact boundaries.

An administrator can disable or reset another non-owner local account; people can change their own password. This is local access management, without invitation delivery or cross-device revocation. Local source copies and individual Learn history can be deleted explicitly. The company knowledge store is not application-encrypted; the macOS package remains unsigned. The [A/B plan](docs/AB_TEST_PLAN.md) is prepared, with no statistical result claimed.

Never commit `.env.local` or a real API key. The app reads the local `.env.local` in the repository root, and administrators can configure encrypted keys in Setup; see [travel-desktop/README.md](travel-desktop/README.md). The root `.gitignore` excludes environment files at every depth.

License: [MIT](LICENSE).

## Elseweek onboarding and LinkedIn

The [company pack](travel-desktop/demo-company/elseweek/README.md) provides Marketing, Operations and People documents, fictional people and explicit import/approval instructions. Setup lets administrators select the import department and source version. Department brand copies provide consistent context without claiming a company-wide authorization scope.

Open **LinkedIn Draft** in Work, then Share. Load the incoming draft to review five source-backed campaign mismatches; correct copy, audience, visual and planned date/time. Save is local only. This is an organic company-post fixture with its own [approved guidance](travel-desktop/sources/linkedin-campaign.md), not a LinkedIn integration. Supplied checks remain independent of imported workspace approval.

## Smooth onboarding and four local accounts

Use [the updated onboarding tutorial](docs/ONBOARDING_TUTORIAL.md). Create your owner account, upload the mixed-format [intake pack](travel-desktop/demo-company/elseweek-intake/README.md), optionally let Nebius interpret extracted text, review the people/scopes/versions and confirm once. This creates Marketing manager, Marketing strategy employee and Content creator accounts in bulk with generated passwords saved in local login documents. Company brand guidance supports company-wide visibility; personnel files stay private to admin. The accounts are local to one Mac, not an online/synchronized service.

## Executable and development continuation

On this Mac, open `travel-desktop/dist/Averill-darwin-arm64/Averill.app` from the repository folder. This unsigned build targets Apple Silicon macOS. Rebuild the ZIP from the current `.app` before sharing; an older archive may not include the latest observation features. Quit older running copies before launching it. Build outputs are ignored by Git.

Start future development from `docs/HANDOVER.md`, then `AGENTS.md`, `PROJECT.md`, `ARCHITECTURE.md`, `docs/ONBOARDING_AUTH_PLAN.md` and `docs/ONBOARDING_TUTORIAL.md`. Run `npm test` in travel-desktop; `npm run package:mac` rebuilds the app. The website has its own travel-site documentation.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

## Multisource onboarding update — 27 September 2026

Desktop/Finder drop, local/synced files, HTTPS links and Google Drive/OneDrive selected-file OAuth import now feed the local review. Direct cloud use requires registered OAuth clients and remains live-unverified. Company AI defaults off; owner authorization and per-file selection are required. Restricted files are blocked. Local company copies are not application-encrypted; provider confidentiality/no-training/retention settings remain unverified. See [cloud setup](docs/CLOUD_CONNECTIONS.md), [company confidentiality](docs/COMPANY_CONFIDENTIALITY.md) and [handover](docs/HANDOVER.md) for implementation, verification and remaining gates.

## Feedback and know-how library — 27 September 2026

A persistent status banner reports pending, completed, cancelled and failed explicit actions. Knowledge provides local document/text search, uploaded proposals, approved/pending/private/superseded sources, extracted-text reading and original-file access under existing role visibility. Intake is visible before onboarding confirmation. The library does not send documents to external AI. See the handover and onboarding tutorial for current verification and workflow.
