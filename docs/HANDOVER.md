# Averill handover

Updated 26 September 2026. Start here when continuing the desktop product demo. Read [PROJECT.md](../PROJECT.md) for product decisions, [ARCHITECTURE.md](../ARCHITECTURE.md) for implementation boundaries, and the [design system](../travel-desktop/design-system/DESIGN_SYSTEM.md) before changing the UI.

## Product and current demo

Averill is a standalone desktop assistant for company work. Aurelia Travel and Winter Escapes 2027 are fictional fixtures. The product demo is focused on marketing, while local onboarding models company administrators, department leads, employees, source approval, and private proposals. Role switching on one Mac demonstrates permissions; it is not authentication or multi-device collaboration.

The packaged app has four areas:

- **Review:** one prominent finding, selected file, approved source, and a question composer. Questions about a shared Aurelia work window use its fixed local source pack. Without a shared demo window, questions use visible approved company sources.
- **Work:** explicit Open / Share / Stop sharing controls for the three supplied windows, company marketing draft review, one-frame Canva-window OCR review, and the finding list.
- **Research:** a user-entered public Tavily search. Results are external and never automatically become approved company sources.
- **Setup:** create the local workspace, add demo people, switch role, import a file or folder, propose/approve/supersede sources, set priority, and configure service keys.

Campaign Files has brief v1 and approved v2. Email Studio and Social Publisher have deliberately flawed incoming drafts. Findings come from deterministic rules after a field is completed or a selection changes, and they cite local files. The employee edits and saves; Averill never sends or publishes work. The design uses the approved Petrol / Coral / Ice palette, bundled fonts, outline SVGs, and the actual supplied Reel SVG in its preview.

## Run and package

Use Node.js 22 or newer. From `travel-desktop/`:

```sh
npm ci
npm start
npm test
npm run package:mac
```

The macOS packaging script builds the Swift PDF/image text extractor and creates `travel-desktop/dist/Averill-darwin-arm64/Averill.app`. The local ZIP at `travel-desktop/dist/Averill-macOS-arm64.zip` is generated separately with `ditto`; neither artifact is tracked by Git. This is an unsigned arm64 demo package, not a notarized release. Restart a previously running app after rebuilding it.

Optional `NEBIUS_API_KEY`, `NEBIUS_MODEL`, and `TAVILY_API_KEY` are listed in [`.env.example`](../.env.example). Use a local root `.env.local` or enter Nebius/Tavily keys in Setup. Setup stores encrypted values under Electron user data using macOS secure storage. Never put keys, imported company files, Electron user data, or generated artifacts in Git.

## Verified boundary

- `npm test`: eight passing deterministic tests for supplied findings, source-backed and unsupported answers, model citation IDs, local roles/source approval/conflict persistence, and folder import.
- Native Electron review: Campaign Files v1 selected and shared produced the out-of-date finding with a link to v2. The packaged app answered “What changed from v1 to v2?” locally with citations to both brief versions. Email Studio and Social Publisher were opened and visually checked after the latest UI revision; Social rendered the supplied SVG asset.
- A prior live Nebius request succeeded only for the fixed Aurelia source pack. Tavily returned live public search results in the dev app. The newer company-source Nebius request has **not** been verified live; automatic review blocked transmission of the test brief. A real Canva browser-window capture and Stop sharing path have **not** been verified end to end.
- The demo package was launched and restarted on macOS. These checks do not prove a signed installer, Windows support, multi-device access, or arbitrary external app understanding.

## Known gaps and next actions

1. Rehearse fresh setup, import, lead approval, employee switch, company draft review, restart, and offline/error behavior in the packaged app.
2. Test a real Canva window with macOS Screen Recording permission, one-frame OCR, and Stop sharing. OCR inspects visible text only; it cannot read hidden design layers or geometry.
3. Obtain specific approval for the synthetic company-source payload before a live Nebius test. Keep source-backed citations and the local fallback visible.
4. Add genuine authentication and synchronization before describing the role switcher as a multi-employee deployment. Define tenant isolation, revoke/delete behavior, and retention before using real company data.
5. Expand conflict detection and independently check model claims against cited passages. Current conflicts detect different approved files with the same department and title; priority does not settle a contradiction.
6. Review the updated native UI with the owner. The 26 September reference pass uses locally bundled Phosphor Light icons, cooler reference-derived colors, Spline Sans display typography, folded brief cards, and a six-blade custom aperture. Source/action/composer visibility was checked in the native 520 × 850 assistant and 930 × 850 Campaign Files windows. Exact generated-image font metadata and pixel parity are unavailable; the independent-window architecture remains.

## Repository map

- `travel-desktop/main.js`, `preload.js`: windows, session sharing, IPC, secure keys, capture, and service calls.
- `travel-desktop/src/agent.*`, `agent-theme.css`, `agent-controls.css`: desktop assistant UI.
- `travel-desktop/src/work.*`, `work-theme.css`: supplied demo work windows.
- `travel-desktop/src/workspace.js`, `workspace-answer.js`: persisted onboarding, sources, roles, conflicts, and company answers.
- `travel-desktop/src/engine.js`, `assistant.js`, `campaign.js`: fixed campaign rules, local answers, Nebius adapter, and source registry.
- `travel-desktop/src/web-search.js`: Tavily adapter.
- `travel-desktop/scripts/extract-text.swift`: local PDF/image text extraction.
- `travel-desktop/design-system/`: approved reference, tokens, and implementation guidance.

Repository remote: `https://github.com/sararr25/averill-ai.git`, branch `main`. Check `git status` and the latest remote commit before starting new work; this document deliberately does not freeze a commit hash.

## UI and UX reference pass — 26 September 2026

Native packaged checks: Campaign Files v1 and v2 selection expose pressed state; Archived selects v1; explicit Share produces the out-of-date finding; Open approved brief displays actual v2 content; Escape closes the source dialog; the local version question returns v1/v2 citations; Stop sharing clears the finding. The question composer no longer overlays the source action, rejects empty submissions, exposes waiting/error feedback, and preserves a failed question. The attachment-shaped control opens current evidence rather than suggesting an unsupported upload. All eight existing tests pass. Rebuilt the unsigned macOS arm64 app and ZIP.

Icon assets and MIT license are in `travel-desktop/assets/icons/`; the shared renderer is `src/icons.js`. The image determines visual treatment; file labels describe real fixture assets rather than invented folders or counts. No external AI/OCR/service request was used for this UI check. Other widths, actual macOS Canva capture and company-source AI retain the verification boundaries above.
