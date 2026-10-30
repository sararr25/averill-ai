# Quiet, visual assistance — owner screenshot correction, 29 October 2026

Supersedes the earlier visual acceptance claim: owner screenshots show two overlapping Canva cards, repeated no-conflict interruptions, plain fallback help with no illustrations, dense scope notes, misaligned select/disclosure indicators and an underused maximized desktop.

1. One quiet Canva panel. Suppress the separate field card while the Canva panel exists. Minimize is sticky, including new findings. No automatic clean-result popup. Bundle the shared view with content code so partial extension updates cannot silently fall back to a paragraph.
2. Visual coach. Default tool help to one illustrated action, larger reading text, local numbered pointer and progression from an actual user click on a uniquely resolved control. Summarize slide progress and results visually; source/scope explanations expand on request. Keep measured and manual completion distinct.
3. Desktop. Adaptive wide grids and narrow single-column mode, larger reading/control text, aligned disclosure/select affordances. Replace repetitive empty-match copy with a useful next action. Present public search results as scannable cards.
4. Company demo. Add explicitly fictional company-wide self-service docs (posting rhythm, leave/absence, expenses, remote work, security, escalation). Approved fixtures only in the fictional judge workspace; keep real workspaces/imported files/permissions unchanged. Local company Q&A should answer common English/Italian questions using exact approved passages.
5. Verify screenshots' actual flows, source/role isolation, narrow/wide layouts, bundle integrity and native build. Update handover after each block; distinguish synthetic and installed-browser evidence.

Status: implemented and delivered locally. Existing working-tree changes retained; no reset or publication.

## Milestone 1 implemented

Canva's field-selection card is suppressed while the design panel exists. Minimization stays in place across new findings. The content entry now bundles the shared view and pointer, so an older worker injecting `content.js` cannot omit them. Manifest 0.6.0; no new permissions. `content-ui.js` is the editable UI source; `npm run build:extension` regenerates the content entry before test/start/package.

## Milestones 2–4 implemented, verification underway

Tool help leads with an illustration and one-step coach; full instructions expand. Numbered host pointer and true user-click advancement added without clicking controls. Check scope, policy caveats and lesson inventory expand; carousel progress uses numbered slide status. Desktop uses wide columns for Work/Learn/setup, cards for library/web results and single-column sidebar layouts. Task-exercise selects now stay inside their labels (the old code appended each select a second time, moving it out).

Six explicitly fictional company-wide policy files cover weekly posting, leave/absence, expenses/travel, remote work/meetings, access/security and handovers. An additive guarded migration seeds only the named fictional judge workspace; existing source titles are never changed or overwritten. Real workspaces are refused. English/Italian retrieval aliases support demo questions; bundled policy answers quote an approved passage directly without an unnecessary model round trip. Source permissions remain enforced.

## Verification before final packaging

- Node suite: 280/280. General policy tests also cover English time-off phrasing.
- Complete synthetic Canva bridge/reader: 31 stages, 35 relays. New-finding minimization remains quiet.
- Bundled extension view: 10 checks, including genuine host-control click advancement, repeated text-selection clicks, no second card, minimization and Stop. Uses only the old worker’s file list plus the generated content entry.
- Desktop: 8 checks at 440/1440/1920 px, full-width wide layouts, labels/selects, company-policy cards and sidebar answers.
- Accessibility: 10 matrix checks across admin, lead, Marketing and Operations employees, 200% zoom, keyboard, reduced motion and no overflow. Native VoiceOver separate.
- Pro IPC: 6/6; outbound preview, explicit consent/decline, drafts, personal practice and logout retained.
- Visual checks opened actual rendered screenshots, corrected old small select style precedence, and removed repeated coach titles. Policy cards display only values that occur verbatim in the approved answer passage.

The screenshots’ real Canva design has not been edited. Installed Chrome extension refresh and real-site pointer placement remain a separate acceptance step; no extension-management policy workaround is used. Final local app/ZIP and native normal-demo policy checks are recorded below.

## Final local delivery

Final packaged desktop verification: 8 PASS. Installed `travel-desktop/dist/Averill.app` matches the final package inventory, 3253 entries. Release integrity: 261 source files, both native helpers, ZIP SHA-256 `7b1fcbcc5edb2abe7bc67462bf1874da684943e24ccb167c19e6798033141fdc`. The normal native Maya demo shows 15 approved visible documents; Italian posting and leave questions produced source-backed schedule/process cards. Maximized Learn uses available width. Existing credentials, encrypted keys and approvals retained; only the six requested fictional company references were added.

[Final receipt](review-evidence-2026-10-29/quiet-visual/delivery.json). No deployment, Git push or release. Extension 0.6.0 reload/reconnect and actual Canva pointer/quietness acceptance remain manual, due the browser extension-management security boundary. Synthetic checks do not substitute for that gate.
