# Averill

Averill is a source-grounded company agent assistant for people working across applications. The employee chooses what to share. Averill points out relevant inconsistencies after a field edit or asset selection, explains the issue, and links to the approved source. The employee decides what to change and whether to publish.

This repository contains an **Electron hackathon prototype**, its Aurelia Travel demo, an approved design system, and the handover documentation needed to continue development. Aurelia Travel is a fictional customer, not Averill's product name.

## Start here

1. [PROJECT.md](PROJECT.md) — product intent, demo story, current state, and decisions.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — components, data flow, trust boundaries, and extension plan.
3. [design system](travel-desktop/design-system/DESIGN_SYSTEM.md) — approved Petrol / Coral / Ice direction, tokens, typography, components, and implementation status.
4. [desktop app README](travel-desktop/README.md) — run and demo instructions.
5. [AGENTS.md](AGENTS.md) — rules for contributors and coding agents.

## Run

Requires Node.js 22 or newer.

```sh
cd travel-desktop
npm ci
npm start
```

Run `npm test` from `travel-desktop/` for the deterministic checks.

## Security and scope

The current demo reads **structured changes from three supplied work windows** only after explicit sharing. It does not capture arbitrary macOS windows, read screenshots, edit other applications, send email, or publish posts. Local source lookup works without an API key. Nebius is optional and must be enabled by the employee in the assistant window; when enabled, the question and four synthetic campaign documents are sent to Nebius. See [ARCHITECTURE.md](ARCHITECTURE.md) for the exact boundary.

Never commit `.env.local` or a real API key. The app currently reads the local `.env.local` in the repository root; see [travel-desktop/README.md](travel-desktop/README.md) for setup. The root `.gitignore` excludes environment files at every depth.

License: [MIT](LICENSE).
