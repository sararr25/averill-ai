# Averill project

Updated 23 September 2026. This is the canonical handover for the public `averill-ai` repository.

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

- Electron opens an independent Averill window and three separate supplied work windows: Email Studio, Social Publisher, and Campaign Files.
- The employee opens and explicitly shares each work window. A shared window sends structured field state via Electron IPC. Checks run after blur or selection change. Closing or unsharing stops its findings.
- Deterministic rules detect the supplied campaign problems. Findings cite real local source files that can be opened.
- Campaign questions use constrained local source lookup by default. Nebius AI is optional and user-enabled. The prompt includes the question and four synthetic source documents; responses without valid source IDs fall back to the local answer.
- The reference image and design system are approved specifications. The current running assistant UI has **not yet been restyled** to the approved design system.
- A live Nebius check on 23 September 2026 returned the approved assets and citations. The automated tests cover all three workflows, source existence, unsupported questions, and model citation validation. These checks do not establish behavior with arbitrary external apps.

## Explicit non-goals for this prototype

No arbitrary macOS window capture, screenshot reading, external app control, background observation, automatic edit, email send, or post publication is implemented. Do not present those as current capabilities. The company source pack is synthetic; no real customer data is required for the demo.

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
| Geologica, Spline Sans, Fragment Mono | Approved typography; font files and licenses still need bundling before the UI restyle. |
| Keep old brief v1 and old square creative | They are intentional fixtures that make version and asset checks demonstrable. |

## Next work

1. Implement the approved design system in the Averill window, bundle the specified fonts and licenses, and verify responsive width, keyboard focus, contrast, and reduced motion.
2. Replace the supplied demo bridge with explicit macOS window selection and permission-aware observation of real external applications. Test stop-sharing behavior.
3. Ground perception and retrieval in selected company folders and versioned documents. Preserve exact citations and uncertainty when evidence is insufficient.
4. Rehearse the complete demo, including issue resolution, source opening, offline behavior, AI fallback, and restart.
5. Confirm official hackathon submission requirements before recording or publishing the final entry.

## Where to look

- `travel-desktop/main.js` and `preload.js`: Electron windows, IPC, sharing, AI opt-in, source opening.
- `travel-desktop/src/engine.js`: deterministic findings and local answers.
- `travel-desktop/src/assistant.js`: Nebius request, source-constrained parsing, fallback.
- `travel-desktop/src/campaign.js`: source registry.
- `travel-desktop/src/work.js`: synthetic workspaces and field update timing.
- `travel-desktop/design-system/`: visual specification, CSS tokens, reference and preview.
- `ARCHITECTURE.md`: data flow, boundaries, API contracts, and operational notes.
