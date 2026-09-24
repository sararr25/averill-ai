# Averill

Averill is a source-grounded company agent assistant for people working across applications. The employee chooses what to share. Averill points out relevant inconsistencies after a field edit or asset selection, explains the issue, and links to the approved source. The employee decides what to change and whether to publish.

This repository contains an **Electron hackathon prototype**, a local company onboarding path, its Aurelia Travel sample campaign, an approved design system, and handover documentation. Aurelia Travel is a fictional customer, not Averill's product name.

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

## Security and scope

The supplied sample windows send **structured field state** through the app; Averill produces findings only while the employee explicitly shares a window. A selected Canva window can be captured for one OCR review after pressing Review; there is no continuous arbitrary-window observation, structural Canva API access, automatic edit, email send, or post publication. A local company workspace stores imported copies, people, department source approval, and priorities on one Mac. Role switching is a demo, not account authentication or synchronization. Local source lookup works without a key. Nebius is optional and sends relevant approved source text only after consent; Tavily receives only an explicit public web query. See [ARCHITECTURE.md](ARCHITECTURE.md) for exact boundaries.

Never commit `.env.local` or a real API key. The app reads the local `.env.local` in the repository root, and administrators can configure encrypted keys in Setup; see [travel-desktop/README.md](travel-desktop/README.md). The root `.gitignore` excludes environment files at every depth.

License: [MIT](LICENSE).
