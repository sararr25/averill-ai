# Averill contextual assistance rebuild — 29 October 2026

Owner request: research comparable products before changing code; rebuild Watch/Ask/desktop around useful, visual, interactive assistance; update project and handover after each major milestone. Preserve Averill identity, company authority, person isolation and outbound preview.

Research preceded implementation: background primary-source scan identified Copilot Vision's user-invoked highlights, WalkMe/Whatfix's element-anchored steps and Scribe/Guidde's authored visual guides. See ASSISTANT_UX_RESEARCH_2026-10-29.md for sources and confidence; official capability documentation is not proof of usability or effectiveness.

1. Answer reliability: cover combined contrast/spacing; bounded larger public Nemotron output; exact evidence validation; helpful local fallback instead of raw search snippets. Keep technical state separate from answer.
2. Shared presentation: one reader for extension Ask/Watch and desktop answers, real paragraphs/lists, existing relevant illustrations, expandable sources and diagnostics. Preserve source-vs-company distinction.
3. Interactive Canva guide: explicit start, one step, Back/Next/Stop; locally resolve visible named controls, highlight only an unambiguous actual control, announce missing/ambiguous controls. No synthetic clicks, screenshot uploads or inferred mastery. Manual step navigation is never a verified design result.
4. Delivery: regression tests and actual Electron renderer/extension integration; synthetic live public provider reproduction; rebuild app/ZIP and verify integrity. Real Canva and human acceptance must be identified separately.

## Progress

- Research: core findings received before code changes; cited report being finalized.
- Plan: recorded before implementation.
- Existing unrelated working-tree changes: .gitignore, AI auto-connection/main/agent/work-assistant and verification files retained. No reset, commit, push or deployment implied.
- Baseline exact public question attempted with generated synthetic workspace; sandbox networking prevented Tavily, so it did not reproduce the model validator failure. No normal profile read or changed.

### Milestone 1 — implemented

Compound contrast/spacing and spacing routes added. Public Nemotron uses 1800 output tokens and strict bounded JSON Schema; exact evidence checks retained. Inline numbered steps are normalized before factual-number checks. Local help leads with curated actions instead of concatenated Tavily snippets; provider diagnostics moved into assistant metadata. Public-only source boundary unchanged. Targeted tests cover compound routing, inline-list validation, schema budget and invalid-evidence fallback. Real public provider verification is in progress; sandbox baseline did not reach providers.

### Milestones 2 and 3 — implemented, verification underway

Shared `browser-extension/assistant-view.js` renders semantic paragraphs/lists, existing bundled illustrations, one active Back/Next/Stop guide, collapsed answer diagnostics, and the same reader in desktop Ask. The Canva card separates Design checks and Ask Averill with a single scroll surface. Public/company evidence is expandable. Online preview is now an in-card choice with inspectable exact outbound items, not a native wall-of-text confirm dialog.

`canva-guide.js` resolves only visible, uniquely named supported controls after an explicit Show me request. It draws a nonblocking outline; never clicks, edits, captures or transmits control names. Unavailable/ambiguous controls get a recovery instruction. Moving through a guide is manual progress, distinct from existing live measured checks and practice confirmation. Stop/logout remove the outline. Extension version 0.5.0 needs a reload in Chrome.

Verification so far: 277/277 Node tests; actual Electron synthetic Canva integration 31 steps/35 relays, zero providers; shared Chromium view checks cover unique/missing/ambiguous controls, no automatic click, loaded illustrations, Stop and narrow viewport. Real public-provider synthetic checks return model answers for contrast+spacing, group and frame, with company AI off and zero company sources. The compound case now retrieves one bounded source group per sub-goal; exact quotes remain validated, including unique whitespace-only recovery. A model answer is not a proof of semantic correctness. Final native/package acceptance remains separate.

### Final reliability verification

Public output is now a strict 1–5-item `steps` array plus exact evidence, adapted to the shared answer contract. A closed retry instruction corrects unsupported actions; literal escaped newlines normalize for reading. Compound answers missing either goal are rejected in favor of useful local guidance. Duplicate official URLs validate quotes against all matching supplied excerpts. The live public-only final sample returned model mode for contrast+spacing (6.3s), grouping (2.5s), frames (1.8s), with zero company sources and company AI off. Earlier intermittent frame refusal remains useful evidence of model variability: raw unsupported content was rejected, never shown as a valid answer. The fallback and illustrated guide remain usable.

Final Node suite: **278/278**. Renderer: **6/6** Pro IPC checks, **31/31** synthetic Canva stages /35 relays, **9** shared-view checks, **7** actual extension UI checks. Native installed executable was tested on a marked synthetic profile: login, original question, semantic answer, illustration, guide steps 1/2 and navigation passed. Normal credentials/keys/source approvals unchanged; the old running instance was closed to load the updated executable. Native VoiceOver and final real-Canva extension reload/highlights remain separate. Browser URL policy blocked chrome://extensions; no workaround attempted.

### Milestone 4 — local delivery complete

Final installed app and verified ZIP agree (251 source files / 3242 bundle entries). ZIP SHA-256: `8e6b203589c0d6ef7b7eb9ac6b145a2ed0f0863a7e12fee07c8cdcbcfa3b84a4`. Final native QA and normal Maya real public Nemotron answer passed. Current app left open on that answer. Research, PROJECT, ARCHITECTURE, AGENTS, test guide and HANDOVER updated. No source/data publication. Remaining real-Canva reload/guide acceptance is explicitly open because browser policy blocks extension management.
