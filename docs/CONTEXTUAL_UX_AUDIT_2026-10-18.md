# Averill contextual UX audit and delivery plan — 18 October 2026

## Owner clarification — Vamo demo acceptance, 18 October 2026

The owner chose the existing Vamo mock social/email pages as the hackathon demonstration environment. Averill remains the product; Vamo is the independent fictional customer. The first milestone uses `demo-tools/social-simulator` at `/brevo` and `/linkedin`, with synthetic drafts and no sending or publishing. This replaces the earlier requirement to obtain real platform accounts for this milestone. Installed-Chrome transport/permissions, manual accessibility and packaging remain separate checks. Older real-platform acceptance issues stay open.

## Outcome and decisions

The owner tested Averill and found that asking for help takes too many steps, interrupts the current tool, and gives too many controls equal prominence. This is a product-flow redesign, including a new visual identity, rather than another isolated styling pass.

Owner decisions confirmed in the chat on 18 October:

1. Ask Averill opens a compact card beside the selected draft, expandable into an in-page side panel.
2. Each actionable suggestion has a preview, an explicit Apply action, and Undo.
3. Deliver email and LinkedIn first; Instagram and Canva have separate follow-up tickets.
4. Reconsider palette and typography completely. Retaining the current petrol/coral system is not a requirement. A new identity still belongs exclusively to Averill, separate from Vamo.
5. Acceptance starts in a real platform field, shows guidance and a source in the page, invalidates advice when work changes, and opens the full app only on an explicit Open in Averill action. Automated coverage must be supplemented by manual platform acceptance.

These decisions authorize the planned single-suggestion editing capability, superseding the current manual-edit-only product boundary for this future feature. They do not enable automatic editing, sending or publication. Existing runtime behavior remains unchanged in this planning increment. Visual direction selection remains a design-ticket deliverable, not an assumed choice of new colors.

## Evidence and limits

- Inspected the clean canonical checkout, origin `sararr25/averill-ai`, branch `docs/vamo-employee-test-guide`, HEAD `e72b1fe` before this documentation increment.
- Read AGENTS, PROJECT, ARCHITECTURE, the Averill design system, main and dated handovers, earlier UI audits and the issue-tracker policy.
- Inspected the browser extension, loopback bridge, companion, desktop renderer, review engine, and existing UI verification harness.
- Visually inspected the captured conflict/first-run states from 17 October and Knowledge/rule and Learn/answer states from 18 October. The older conflict wording has already been improved in current code; it is not reported as an unfixed copy defect.
- Read live GitHub issue states: #10–#18 are closed, while #2, #3, #5, #6, #7, #9, #19 and #20 remain open. Current history includes the merge of PR #21; the dated handover's statement that it is unmerged is stale.
- This audit did not launch the user's normal workspace, change sources or credentials, perform provider calls, or execute a new manual real-platform test. It does not assert pixel inspection of the current running binary. Previously recorded test counts are historical evidence only.

## Diagnosis

| Priority | Finding | Evidence / consequence | Required change |
| --- | --- | --- | --- |
| P0 | Ask Averill promises contextual help but opens the full app | The companion's click invokes companion:open. The browser content script sends field events and renders no answer. | Return results into the working page; opening the app is secondary. |
| P0 | Sharing and reviewing are separate destinations | Review routes to Work for pairing/capture; results return to Review. The user must understand internal product areas to finish one task. | One foreground flow: select draft → Ask → suggestion → preview → Apply → recheck, in the page. |
| P0 | Pairing is an implementation task exposed as a daily workflow | Copy JSON in the app, paste in extension, share tab, click field, select work type, check, read elsewhere. | Guided first connection; routine use after connection must need only draft selection and Ask. Keep explicit tab permission and Stop. |
| P0 | Suggestions are descriptive, not safe edit proposals | Review results contain prose and excerpts, not a validated patch with an editor revision. | Introduce bounded patches and adapter-confirmed writes, preview and conflict-aware Undo. |
| P1 | Six navigation areas still compete | Current HTML has Review, Work, Learn, Knowledge, Research and Setup. Secondary styling does not eliminate the conceptual split. | Consolidate Review/Work into one current-work area; move setup/account controls away from the daily task. |
| P1 | Supporting UI competes with the correction | Captures show header, navigation, session treatment, explanatory text and persistent question composer around the result. Narrow layouts reserve substantial vertical space for chrome. | Make the suggested change the focal point; context stays one quiet line, chat and execution details expand on demand. Stop remains discoverable. |
| P1 | Knowledge mixes reading with administration | Rules, extraction, approval forms, document search and source state occupy one stream. | Reader-first library and source detail; a separate role-gated approval queue, one decision at a time. |
| P1 | Learn is a long secondary workflow inside the same shell | Latest captures show stacked explanations, repeated guide links and quiz history. | One clear next lesson, compact history, detail on demand. Preserve eligibility and explicit confirmation. |
| P1 | The visual system needs recomposition and identity exploration | Owner explicitly rejected the current UI and requested palette and typography reconsideration. Existing palette contrast alone cannot fix attention or task flow. | Compare three distinct Averill directions using the same real task and states; choose one before token implementation. |
| P1 | A generic selected-field reader does not establish platform support | Current extension handles top-frame textarea/input/contenteditable only. No rich-editor write adapters exist. | Named platform/editor acceptance and explicit unsupported states; Canva text and design geometry are separate capabilities. |
| P1 | Synthetic proofs cannot close the requested experience | Existing browser/UI scripts use synthetic fields and extension clients. The live agent has not been proven over the complete actual-platform loop. | Real installed-extension manual tests in addition to deterministic and fake-provider end-to-end checks. |

## Design assessment

Provisional expert assessment of the reviewed artifacts, not a usability study or a score for an uninspected running build: typography 5/10; composition 3/10; interaction 3/10; color 6/10; detail 5/10. Using top-design weights, **4.25/10**. Brand consistency and readable contrast are strengths; task visibility and hierarchy are the main weaknesses. Motion performance was not profiled.

The path toward a 10/10 craft target is a recognisable new Averill identity, an immediately understandable contextual card, deliberate reading order, reliable editor interaction, and complete loading/error/empty/focus states. Do not import landing-page devices such as oversized hero typography, scroll hijacking, magnetic controls or decorative parallax into a drafting tool. A 10/10 result cannot be claimed before visual review and real task acceptance.

Concept brief for the new identity:

- Brand essence: clarity.
- Visual tension: a precise intervention inside someone else's busy editor.
- Signature moment: the draft and a small before/after suggestion visible together, followed by an explicit reversible edit without losing place.
- Technical ambition: correct anchoring and state across changing rich editors, rather than expensive visual effects.

Apply ui-styling's semantic controls, focus, token and disclosure principles in the existing Electron/extension HTML/CSS/JavaScript stack. A React/Tailwind/shadcn migration is not necessary for this scope. The ui-ux-pro-max generated recommendation was screened: its generic conversion funnel, wellness fonts and gold palette do not fit the inspected product and are not adopted. Relevant guidance is progressive disclosure, explicit loading, semantic headings and consistent type scale. top-design informs intentional composition and craft without compromising work efficiency.

## Target experience

After installation, sign-in and an explicit connection, the employee selects a draft and clicks Ask Averill. A compact anchored card answers with the most useful correction first. Example copy: **Remove “lowest prices guaranteed”.** Supporting copy explains the reason briefly. A source title/version remains visible; the exact supporting passage expands inside the card/panel. Findings that contain a safe patch offer **Preview change**; preview offers **Apply change**. **Undo** follows a confirmed write. Additional findings expand within a side panel. **Open in Averill** is a secondary action for full source/company exploration.

The card must not cover the selected passage, editor controls, Send or Publish. It repositions on scroll/zoom and becomes a docked in-page panel if there is insufficient space. Opening the panel restores focus on close. The host editor's formatting and content stay intact.

State model: disconnected → choose field → ready → checking → findings / no conflict / insufficient evidence / failed → preview → applying → applied / edit conflict → rechecking. Editing, source authority change, Stop, logout, expiry or navigation clears stale advice and disables stale previews. Dismissing the card and stopping sharing have distinct semantics.

AI use remains conditional on existing company policy and eligible-source/file consent. Where request-specific consent is required, it is presented in the contextual surface. Ordinary local review cannot require an app switch. Tavily never receives an internal draft to implement this flow.

## Delivery sequence and ticket breakdown

No calendar promise is inferred from this breakdown. Each ticket needs its own acceptance proof. Blocking relationships belong in GitHub as well as the ticket body.

| Key | Priority | Deliverable | Depends on |
| --- | --- | --- | --- |
| CX-01 | P0 | Three visual directions; selected card/panel and desktop compositions; new Averill token specification | — |
| CX-02 | P0 | Shared contextual review contract and authority-aware request lifecycle | — |
| CX-03 | P0 | Guided browser connection without manual JSON in the routine flow | CX-02 |
| CX-04 | P0 | Anchored card, expandable in-page panel, citations and explicit app deep link | CX-01, CX-02, CX-03 |
| CX-05 | P0 | Validated edit proposals, preview, explicit Apply and conflict-aware Undo | CX-02, CX-04 |
| CX-06 | P0 | Real email editor adapter and full correction loop | CX-05 |
| CX-07 | P0 | Real LinkedIn composer adapter and full correction loop | CX-05 |
| CX-08 | P1 | Desktop information architecture and selected visual system implementation | CX-01, CX-02 |
| CX-09 | P1 | Reader-first Knowledge, cited source detail and separate approval queue | CX-08 |
| CX-10 | P1 | Learn hierarchy and complete accessible UI state inventory | CX-08 |
| CX-11 | P1 | Instagram caption adapter and explicit supported-surface matrix | CX-05 |
| CX-12 | P1 | Canva text adapter feasibility, supported workflow and explicit geometry boundary | CX-05 |
| CX-13 | P0 gate | Packaged/installed acceptance and measured interaction budget | CX-06, CX-07, CX-09, CX-10; follow-ups CX-11/CX-12 for full four-platform scope |

Email means first supporting the established Brevo workflow; record the exact real editor/view and browser. Gmail, Outlook and additional email builders remain separate compatibility additions unless subsequently selected. LinkedIn means an organic company-post composer, not ads or messaging. These scope choices follow existing project vocabulary rather than asserting compatibility with every mail or social tool.

The phase-one release gate is contextual email and LinkedIn plus the redesigned desktop library/learning shell. Instagram and Canva remain explicit unfinished follow-ups until their own acceptance passes; a two-platform release must never be described as four-platform support. Canva visual/layout checking is not included in text acceptance. A non-DOM editor may need a dedicated access method with a separately reviewed capability proposal; do not silently replace in-page help with an app-switch flow.

## Acceptance and test seams

The owner confirmed a complete in-page flow plus real-platform manual proof. Prefer one primary end-to-end seam: installed extension ↔ authenticated local bridge ↔ real review orchestration ↔ visible contextual result ↔ adapter edit ↔ recheck. Extend existing browser and UI verification harnesses with deterministic synthetic sources and fake network responses; retain their explicit proof limits. Add narrow unit/contract coverage only for patch applicability, exact restoration, authority boundaries and lifecycle races that are difficult to exercise at the high seam.

- After setup, supported draft selection plus one Ask action produces a local result in-page; no Review/Work navigation, JSON paste or extra work-type prompt on a recognized supported editor.
- Action feedback appears within 150ms; a pending label appears within 300ms if still waiting. Target p95 local-review result ≤1s on the recorded test machine; record real provider latency separately without a fixed cloud-response promise.
- Display one correction prominently; other findings are count + disclosure. Source title/version is visible and the exact passage opens in-page.
- Preview shows before/after with the precise affected scope. Apply writes only the validated single patch; it never submits, clicks Send/Publish or changes recipients/audience/schedule/assets.
- Apply rejects changed text, changed selection/editor, changed source approval/version, account/session mismatch, ambiguous repeated passages and unsupported rich-text mapping.
- Undo restores the previous selected content and formatting if the editor still matches the applied revision. If the user has typed since, do not overwrite it; explain the conflict and offer a manual recovery option that does not copy data until requested.
- No conflicts means only that checked text matched available approved rules. Insufficient evidence and unsupported editor remain distinct outcomes.
- Verify restricted/personnel/source visibility, request-consent cancellation, no network on local-only mode, Stop/logout/navigation/expiry, late replies, IME, host-editor rerenders and multiple tabs.
- At 440×660, 520×850, 960×820 and wide desktop, plus browser zoom to 200%, the correction is visible and editor actions remain reachable. Keyboard, focus restoration, screen reader labels, contrast and reduced motion are acceptance criteria.
- Manual evidence names platform, exact composer/editor view, browser/extension/build version, synthetic draft/source, before/after/Undo/recheck/Stop and observed limitations. Fake editor success cannot substitute.

## Existing backlog and handoff

Keep existing acceptance tickets open and unmodified by synthesis. Reference #3 for browser correction/Stop, #6 for accessibility, #7/#19 for native permissions/displays/OCR, #2 for roles and Knowledge, #5 for learning, and #9/#20 for rehearsal and owner acceptance. #10–#18 are earlier completed fixes, not proof that this new flow exists.

For implementation, update AGENTS and architecture when adding the explicit Apply capability and when adopting the selected identity. Until then the existing code and design system describe the shipped implementation. Preserve local workspaces, secrets, approvals, Vamo identity, historical fixtures and the old storage namespace.

Technical references checked on 18 October: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [activeTab permission](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [GitHub issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies). Content scripts support DOM interaction; this establishes a feasible general approach, not acceptance for any named platform. Text inserted into a host page is not a confidentiality boundary from that page: send only the minimum authorized citation to the contextual surface, never the company library or credentials.
