# Averill

Averill is a source-grounded company agent assistant for people working across applications. The employee chooses what to share. Averill points out relevant inconsistencies after a field edit or asset selection, explains the issue, and links to the approved source. The employee decides what to change and whether to publish.

This repository contains an **Electron hackathon prototype**, a local company onboarding path, its Elseweek sample campaign and department source pack, a Canva tutor and weekly learning flow, the Elseweek travel website, approved design systems, and handover documentation. Elseweek is a fictional customer, not Averill's product name.

## Start here

1. [Handover](docs/HANDOVER.md) — current demo, verified boundary, setup, gaps, and next actions.
2. [PROJECT.md](PROJECT.md) — product intent, demo story, current state, and decisions.
3. [ARCHITECTURE.md](ARCHITECTURE.md) — components, data flow, trust boundaries, and extension plan.
4. [design system](travel-desktop/design-system/DESIGN_SYSTEM.md) — approved Petrol / Coral / Ice direction and implementation status.
5. [desktop app README](travel-desktop/README.md) — run and demo instructions.
6. [AGENTS.md](AGENTS.md) — rules for contributors and coding agents.
7. [product demo plan](docs/PRODUCT_DEMO_PLAN.md) — buyer journey, decisions, acceptance path, and remaining gates.

## Run

Requires Node.js 22 or newer.

```sh
cd travel-desktop
npm ci
npm start
```

Run `npm test` from `travel-desktop/` for the deterministic checks.

## Learn and Elseweek

Open **Learn** after creating a workspace in Setup. Start the four-step Canva lesson, ask for step help, and confirm what you practised. Your week records confirmed steps and manually entered Canva/LinkedIn/newsletter activities. Weekly practice provides operation questions, source/version checks and practical reflections. It is offline and scoped to the active person; confirmation is not automatic visual assessment. See [learning plan](docs/LEARNING_IMPLEMENTATION_PLAN.md).

Run `npm --prefix travel-site start` from the repository root for the fictional Elseweek site at `http://127.0.0.1:4173/`. The [site README](travel-site/README.md) covers the independent consumer design and demo limits.

## Security and scope

The supplied sample windows send **structured field state** through the app; Averill produces findings only while the employee explicitly shares a window. A selected Canva window can be captured for one OCR review after pressing Review; there is no continuous arbitrary-window observation, structural Canva API access, automatic edit, email send, or post publication. A local company workspace stores imported copies, people, department source approval, and priorities on one Mac. New workspaces use separate local email/password accounts; legacy role switching is disabled after owner-account activation. No cloud authentication or synchronization is provided. Local source lookup works without a key. Nebius is optional and sends relevant approved source text only after consent; Tavily receives only an explicit public web query. See [ARCHITECTURE.md](ARCHITECTURE.md) for exact boundaries.

Never commit `.env.local` or a real API key. The app reads the local `.env.local` in the repository root, and administrators can configure encrypted keys in Setup; see [travel-desktop/README.md](travel-desktop/README.md). The root `.gitignore` excludes environment files at every depth.

License: [MIT](LICENSE).

## Elseweek onboarding and LinkedIn

The [company pack](travel-desktop/demo-company/elseweek/README.md) provides Marketing, Operations and People documents, fictional people and explicit import/approval instructions. Setup lets administrators select the import department and source version. Department brand copies provide consistent context without claiming a company-wide authorization scope.

Open **LinkedIn Draft** in Work, then Share. Load the incoming draft to review five source-backed campaign mismatches; correct copy, audience, visual and planned date/time. Save is local only. This is an organic company-post fixture with its own [approved guidance](travel-desktop/sources/linkedin-campaign.md), not a LinkedIn integration. Supplied checks remain independent of imported workspace approval.

## Smooth onboarding and four local accounts

Use [the updated onboarding tutorial](docs/ONBOARDING_TUTORIAL.md). Create your owner account, upload the mixed-format [intake pack](travel-desktop/demo-company/elseweek-intake/README.md), optionally let Nebius interpret extracted text, review the people/scopes/versions and confirm once. This creates Marketing manager, Marketing strategy employee and Content creator accounts in bulk with generated passwords saved in local login documents. Company brand guidance supports company-wide visibility; personnel files stay private to admin. The accounts are local to one Mac, not an online/synchronized service.
