# Averill complete-vision implementation plan

Updated 28 September 2026. This is the execution plan for the product distinction confirmed by the owner. [HANDOVER.md](HANDOVER.md) records the current verified state. The implementation status of the first three numbered milestones is recorded below; later milestones remain planned.

## Delivery status for points 1–3

The [external-work acceptance matrix](EXTERNAL_WORK_ACCEPTANCE.md) defines the synthetic cases before implementation. **Point 1:** the movable floating control persists its position, returns to an available display, shows the chosen window and last local read, opens the signed-in assistant and offers Stop. **Point 2:** a selected macOS window can be polled every six seconds, with native Accessibility text when available and visible-text OCR otherwise. The observation stays in memory and is cleared by Stop/sign-out; the selected window number and owning PID are checked on every read. **Point 3:** an employee can select a work type and compare observed text with current approved, visible, non-conflicting company sources. Exact prohibitions and required phrases have local checks. Optional Nebius suggestions require session/company consent, a separate confirmation, exact observed/source quotes and a final source-authorization check. Synthetic email correction and revocation were verified end to end.

The remaining acceptance gates are substantial: no browser DOM extension or official draft API, no field/selection-aware pause detector, no actual Substack/LinkedIn/Instagram/Canva account proof, no live Nebius request for this task engine, and no complete audience/date/asset/procedure schema. Real Chrome OCR and native TextEdit Accessibility were verified with synthetic text. Multi-monitor/full-screen, permission revocation and private-window behavior still need physical acceptance. The next work should close these gates before the full hackathon vertical slice is claimed.

## Product contract

- **Elseweek** is the fictional demonstration company. Its independent, public-facing website lives in `travel-site/`. It is not an Averill editor or employee application.
- **Averill** is the Nvidia–Nebius hackathon product. It learns approved company information and helps employees while they work in their existing browser and desktop tools. Email, LinkedIn and Instagram drafts stay in those tools. Employees own edits, sends and publication.
- The small Ask Averill control must remain reachable. A person chooses what work Averill may observe and can stop sharing immediately. If a service offers a suitable authorized integration, use it; otherwise derive context from the selected live tool through a browser or OS adapter. OCR is a fallback for visible text, not a substitute for document structure or visual proof.
- Route company guidance and tool coaching to approved, employee-visible knowledge and Nebius when the company and person have enabled it; tool instructions need vetted documentation. Route public factual research to Tavily with a preview of the exact public query. Never send company documents or a raw screenshot to Tavily. Show which source supports each actionable suggestion and when evidence is insufficient.
- The four supplied Electron work windows remain labelled synthetic fixtures for deterministic demos and regression tests. They do not define the real employee workflow.

## Historical starting point before points 1–3

At commit `e01126f`, Elseweek already has a separate local website. Averill has local accounts and approval-controlled company sources; an optional source-constrained Nebius answer; Tavily public search; a floating Ask Averill window; explicit selection of external windows; one requested OCR frame; a company question form; and a typed public fact-check. The 35-test suite and isolated Electron smoke passed. The external flow has **no continuous observation, field-aware editor integration, generalized source-grounded coaching, verified visual understanding, automatic external action, or real multi-device company service**. No real external capture or live provider request was verified in that change.

## Delivery sequence

### 0. Define the demo acceptance cases and source authority

**Build:** Specify one end-to-end Elseweek task in each of: an email marketing site such as Substack, LinkedIn, Instagram, Canva, a document/file handover, Operations, and People. For every task, record the real tool, account used for the demo, observable field or state, approved Elseweek source/version, expected guidance, correction the employee makes, and the stop-sharing outcome. Use synthetic accounts/content. Decide which marketing platform can actually be tested; do not design around an assumed API.

**Acceptance:** Each case has a falsifiable before/after check. The People case uses only the employee's authorized sources. The public-claim case has a separate external-source verdict and does not turn web results into company policy.

**Why first:** The current `src/engine.js` checks fixed supplied fields and imported company sources do not drive those fixture findings. A matrix prevents another demo that looks complete while the real tools remain untouched.

### 1. Make the companion dependable on the desktop

**Build:** Refine `main.js`, `preload.js` and the floating UI for multi-monitor placement, full-screen apps, login/logout, minimize/reopen, window closure, screen-permission denial and restart. Show selected tool, whether observation is active, last capture time and an obvious Stop control in both companion and main window. Verify the selected window still belongs to the same live application before each read; suspend if it disappears or changes. Keep the assistant reachable without covering important controls and allow the employee to move the button.

**Acceptance:** In a real browser and a native app, the button opens the correct signed-in Averill session; Stop halts capture, clears transient content and leaves no stale suggestion. A different employee cannot see the previous employee's context. Screen Recording denied/revoked/offline states are understandable.

### 2. Build an observation adapter layer

**Build:** Add a common `Observation` event shape: person, selected tool/window, field or region, observed text, capture method, timestamp, content hash and confidence. Implement adapters in this order: (a) opt-in browser extension or equivalent browser integration for editable DOM fields and selection/blur events; (b) macOS accessibility for native controls where permission and readable structure are available; (c) consented window OCR for unsupported apps and visual text. Prefer a documented official API only where it actually exposes the needed draft state with appropriate scopes. Do not treat a posting API as draft observation. Exclude password fields, payment details, private notifications and nonselected windows; check sensitive text before any provider call. Keep captures ephemeral; store only the minimal evidence needed for the current review, with an explicit retention rule.

**Acceptance:** Substack or the chosen email site, LinkedIn and Instagram each expose a real draft or selected text through at least one adapter. Averill can identify a meaningful pause after editing without repeatedly interrupting typing. A screenshot-only result is labelled as OCR with uncertainty; hidden text, asset geometry and publication status are never inferred from it. Cross-origin, private-window and OS permission limitations are tested explicitly.

### 3. Replace the fixture-only checker with a source-grounded task engine

**Build:** In `src/workspace.js`, `workspace-answer.js` and a new task-review module, separate (1) approved company requirements, (2) observed work, (3) public facts and (4) tool instructions. Retrieve by department, person, status, version and task; exclude pending, revoked, conflicting, restricted or non-consented AI sources. Define task schemas for claims, audience, CTA, dates, creative, disclosure, file version and procedure steps. Use deterministic checks where an exact rule exists, and Nebius for interpretation/coaching with a structured response that identifies the observed excerpt, proposed change, exact company citation and uncertainty. Validate citations against source text and recheck source authorization immediately before display. Do not pass OCR text into a generic company Q&A prompt and treat the returned extract as a complete review.

**Acceptance:** A supported wrong claim in a real email draft produces a relevant suggestion and exact current Elseweek citation. Correcting it clears or updates the suggestion. An unsupported claim receives uncertainty, not a fabricated citation. Revoking or superseding the source invalidates the suggestion. A model failure falls back to an honest local result.

### 4. Deliver the employee interaction loop

**Build:** Let the employee ask from the persistent button in any supported tool: “Is this aligned with our brief?”, “What should I change?”, “Teach me how to do this,” or “Fact-check this public claim.” Show the captured excerpt before it is used, the chosen route, evidence, a concise suggested action and a one-click way to copy advice if useful. Keep drafts and editing in the external tool; never write into it, send mail or publish without a separately specified and authorized action. Support follow-up questions against the same scoped context and explain when the context is stale.

**Acceptance:** In a real external editor, an employee can ask, receive a cited answer, make the correction in that editor and request a recheck. Averill accurately distinguishes observed evidence, company rule, public web evidence and an AI suggestion. The assistant does not claim to have made the change.

### 5. Make public fact-checking a real claim workflow

**Build:** Extract a proposed public claim from selected text or let the employee type it; show the exact Tavily query before sending. Search for timely primary sources where available, preserve URLs, publication dates and the claim being checked, and compare evidence rather than presenting a search summary as a verdict. If Nebius synthesizes retrieved public snippets, constrain it to those snippets and validate the cited excerpts. Return supported / contradicted / mixed / insufficient evidence with a short rationale. Keep this path separate from company approval and show freshness when a claim is time-sensitive.

**Acceptance:** A claim about a current destination, price or external fact cites inspectable public pages with dates; conflicting or missing evidence yields mixed/insufficient. No company draft or imported document is sent to Tavily merely because the user clicked Fact-check. A typed query containing secrets is rejected or edited before dispatch.

### 6. Cover the work domains with one engine and specific adapters

**Marketing:** Email marketing copy and audience, organic LinkedIn, paid Instagram creative/disclosure/schedule, Canva design guidance. Keep platform rules separate from Elseweek campaign rules and verify current platform rules against official sources when needed.

**Operations:** Trip brief handover, current procedure/version, approved destination facts and required steps. Guidance appears in the employee's document or workflow tool; it does not turn Elseweek's consumer site into an operations app.

**People:** Onboarding and internal questions from employee-visible People sources; prevent access to private personnel material. Provide process help without making employment decisions or revealing another person's records.

**Expansion rule:** A new domain supplies a task schema, source authority, observation adapter, examples and acceptance tests. It should not require a new Averill draft editor. Start with the three marketing channels plus one Operations and one People task, then extend based on observed needs.

### 7. Make learning depend on observed practice, with honest evidence levels

**Build:** Connect contextual help to `src/learning.js`: suggest a lesson from a real task, guide one step at a time in Canva or another tool, let the employee confirm practice, and record whether an adapter verified an outcome or the employee self-reported it. Add visual verification only after a reliable method for geometry/export state is implemented and tested. Weekly practice should use authorized current sources and real, consented activity records; allow employees to correct or exclude records. Keep learning private to the person unless a separate sharing product decision is made.

**Acceptance:** A lesson resumes, cites the right approved company source, distinguishes “observed”, “employee confirmed” and “verified”, and excludes revoked or conflicting evidence from a quiz. No mastery score is inferred from OCR or a button click.

### 8. Build the real-company foundation after the hackathon path works

**Build:** Replace one-Mac local accounts with tenant-scoped identity, invitations, revocation and synchronization; encrypt company source copies and workspace metadata; define retention, backup, deletion and audit behavior. Verify Nebius/Tavily provider terms, region, training/retention options and per-file consent. Register and test any required Google/Microsoft or platform OAuth clients with least-privilege scopes. Sign and notarize the macOS app, then test installation and update behavior. Keep demo credentials and local-only fixtures out of this migration.

**Acceptance:** Two devices see the same approved source state without cross-tenant or cross-department leaks; revocation takes effect; backup/deletion behavior is demonstrated; live integrations are tested with synthetic data and documented scopes. Passing local tests alone is insufficient for this milestone.

## Release gates and order of proof

1. **Hackathon vertical slice:** Elseweek website shown as company context; admin approves sources; an employee writes in a real external email tool; Averill observes the selected work after a pause, gives one cited correction; the employee fixes it; public fact-check runs through Tavily; Stop sharing clears context. Repeat a smaller scene in LinkedIn or Instagram and Canva.
2. **Generalization:** Add the remaining marketing channel, Operations and People cases through the same task engine. Test account and source visibility, conflicts, offline/permission failures, source revocation, prompt injection in observed pages and no-send boundaries.
3. **Production readiness:** Complete milestone 8 and real-device/provider verification. Do not describe the hackathon slice as secure multi-company deployment.

For each milestone, require a code-level test of the logic, a native UI check in an isolated profile, and a manual acceptance check in the real target tool. Package/build success proves bundling; only the last check proves the employee workflow. Keep [HANDOVER.md](HANDOVER.md), [PROJECT.md](../PROJECT.md), [ARCHITECTURE.md](../ARCHITECTURE.md) and the demo plan aligned with each verified delivery.
