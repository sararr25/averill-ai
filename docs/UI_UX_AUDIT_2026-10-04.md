# Averill UI/UX audit — 4 October 2026

Status: audit and interaction proposal completed; product implementation awaits the Genjutsu thesis/variant gate. The existing Petrol / Coral / Ice identity remains the foundation. No React/shadcn/Tailwind migration or animation dependency is proposed: the desktop uses plain Electron HTML, JavaScript and CSS.

## Verification boundary

Inspected the actual packaged app sign-in screen and the current source renderer in an isolated synthetic workspace. The renderer layout audit covered Review, Work, Learn, Research, Knowledge and Setup at window widths 440, 520 and 960, height 820. All 18 DOM layout samples had no document horizontal overflow. Native pointer navigation and screenshots confirmed Review and Work; Learning active-step and approved Knowledge states were also captured. The isolated audit workspace used legacy local identity so session-strip/account-role variants are not claimed fully tested. Normal accounts, sources and credentials were preserved. No AI, public research or publication was requested.

Native evidence and metrics are saved outside Git in the parent workspace's averill-ui-audit-2026-10-04/. Screenshots are 2x display pixels. Some rapid automated captures lagged a navigation repaint; review-native.png and work-native.png are the reliable native captures. The file named review-finding-520.png shows the supported-fields-clear state, not a finding, and must not be presented as finding evidence.

## Prioritized findings and exact replacements

| Priority | Location and evidence | Issue and impact | Concrete replacement |
| --- | --- | --- | --- |
| High | Review empty state; agent.js renderHero, agent.html Review | Instructions say to switch to Work, but the only direct shortcut is a document-shaped composer icon. Repeated ready messages and aperture take the place of an obvious start action. | Add one visible Choose what to review CTA; show a compact 3-step path. Keep the aperture as a small static brand mark, remove the idle glow and repeated instructions. |
| High | Work controls; agent.html external-controls/browser-adapter/context-form | Choose, read, observe, Stop, pairing, recheck and rules appear together. Disabled controls have no nearby prerequisite explanation. | Present Browser field / App window methods, then the next action for the selected state. Keep Stop visible while sharing. Explain why a control is unavailable next to the current step. |
| High | agent.js renderTaskReview vs renderHero | External rule results are rendered only in Work; Review's headline/findings follow supplied-demo state. The two areas do not form a coherent real-work flow. | Route actual source-backed external results to Review through a bounded result state; clearly identify observed field, exact source and current/revoked context. Preserve invalidation on typing, source/person/work-type change and Stop. |
| High | agent.html #external-task; Knowledge department/type controls | Several selects remain browser-white while adjacent controls use dark tokens. Knowledge's heading and descriptor become cramped at compact width. | One consistent select/input treatment using Averill tokens; separate heading and description into vertical lines at compact width. |
| High | Knowledge screenshot and knowledge-filters | Four filters precede the first document. Document status, approval timestamp and decision text repeat before the useful excerpt. | Search + compact summary first, advanced filters in a disclosure, then title/status/version/excerpt/actions. Keep permission and decision detail available on expansion. |
| High | feedback-ui.js showOperation; operation-feedback CSS | Routine success occupies a full layout row and disappears after 5.5 seconds, changing available content height. Generic Completed plus operation wording repeats the same fact. | Reserved compact status area or anchored non-obscuring feedback; one outcome sentence. Pending/errors/actionable import outcomes retain context and dismissal; announce via live region. |
| Medium | Work #context-form; agent.js external actions | Check approved rules and Check company guidance both look primary; Read and recheck locally overlaps conceptually with Read visible text. | One main rule-check action after capture, contextual Recheck after my edit after results. Put optional questions and public research into separate secondary entry points; preserve explicit cloud consent. |
| Medium | Learn active/initial state; learning-ui.js | Canva lesson, task exercise, free help, activity recording, week and history share one vertical stream. Next-step hierarchy becomes unclear after starting practice. | Active step first with progress and one continue action; task selection when idle; Your week and History separated below. Keep employee confirmation and assessment limits attached to the action. |
| Medium | Setup; renderWorkspace/onboarding-ui.js/intake-ui.js | Initial onboarding, account administration, service keys and advanced imports live in a long page. Legacy content is additionally visible in the audit fixture. | Group Company files, Team access, AI/services and Advanced. Show a setup readiness summary and next incomplete step; distinguish initial intake from later management. |
| Medium | agent.js manual account form; companion.html | Advanced account fields rely on placeholders; floating button uses a separate system-font/hard-coded style and 32px controls. | Visible labels, named field errors, shared offline Averill tokens/font; comfortable pointer targets and clear sharing status in the floating control. |
| Medium | agent-theme.css 119; agent.js showTab; feedback-ui.js | Color transitions exist, but tab/result/feedback changes are abrupt and there is no consistent pressed treatment. Existing reduced-motion CSS is present. | Native CSS/WAAPI states per the selected thesis: short press/release, tab enter/exit, source-backed result enter, feedback exit; animate opacity/transform, preserve focus and reduced motion. |
| Medium | Design tokens / ui-refinements.css | The default outline is only 1.92:1 against the window. Some helper/service text is 10–11px and secondary actions are 30–32px high. | Stronger interactive boundaries where needed, 13–14px task guidance, minimum 40px pointer targets, visible ice focus. Keep fine decorative separators subdued. |

## Color and interaction evidence

Computed WCAG luminance ratios against #002129: #F4F5F3 15.37:1; #BDD5DF 11.00:1; #91B2BF 7.46:1; #8ACFE3 9.70:1; #FF705E 6.19:1; #20515F 1.92:1. Text colors are strong; muted borders are not a sufficient sole control boundary. Disabled-state compositing and every rendered error/selection combination remain to be checked after implementation.

Visible focus rules are present in agent-theme.css, account forms and intake disclosures. They should be retained and extended to summary controls. No full screen-reader/200%-zoom audit or performance profiler pass was performed. Existing reduced-motion guards disable CSS transitions/animations, but new WAAPI motion will need the same preference guard.

## Implementation order after validation

1. Work/Review state model and next-step guidance; shared, selected, editing, captured, checking, result and stopped states. Preserve all IPC/security/source validity boundaries.
2. Component normalization: form controls, headings, primary/secondary actions, feedback, source/result presentation and floating control.
3. Learn, Knowledge and Setup grouping/empty states; role-aware configuration guidance.
4. Motion from the selected variant; no new dependency. Keep interactions usable before, during and after transitions.
5. Verify existing tests, meaningful native renderer behavior, width 440/520/960 and shorter window, keyboard focus, source invalidation, reduced motion and no duplicate action during pending operations. Rebuild/package only after the product change, then keep local artifact and public release status separate.

## Interaction proposal — not yet validated

Interaction thesis: after the employee shares a field, checks a rule or corrects text, motion connects action to evidence and outcome: brief button press/release, light area transition, source-backed result entry and short feedback exit. Reduced motion removes translation and duration while preserving textual feedback.

Allowed patterns: static brand aperture; hairline grouping separators; coral for primary action/conflict; ice for citations/selection/focus; restrained vertical translation; short source-version metadata. No decorative looping/glow, automatic capture, AI request or publication.

| Variant | Press / release | Area | Result | Exit |
| --- | --- | --- | --- | --- |
| A — Essential | 60 / 100ms | 160ms opacity | 220ms / 4px | 100ms opacity |
| B — Guided (recommended) | 80 / 140ms | 220ms / 6px | 320ms / 8px | 140ms opacity |
| C — Expressive | 100 / 180ms | 280ms / 8px | 360ms / 12px | 160ms opacity |

Curve: cubic-bezier(.22, 1, .36, 1). Hover uses the existing fast 140ms color treatment. A temporary interactive proposal is available at http://127.0.0.1:5175/averill-ui-motion-proposal.html while the existing local simulator runs; its source is saved outside the canonical repo in averill-ui-audit-2026-10-04/proposal.html. The preview has simulated connection/check/recheck/Stop, three synchronized result replays, individual replay/exit and a reduced-motion toggle. Prototype checks passed simulated connection/check/recheck/Stop, replay and reduced-motion toggle. DOM overflow checks passed at 375/768/1024/1440; this is proposal responsiveness, separate from native app support. It is not a product implementation and must not be ported as the implementation. Remove the served preview after validation unless retained by request.

The Genjutsu cast guide explicitly says “WAIT for validation before coding” and “Wait for the user to pick before implementing.” The requested skill requires a user choice here; no product code changed in this audit. The preview-mode preference was requested asynchronously; the rendered proposal was prepared using the existing server while audit work continued. If the owner prefers an inline or native preview, present the same thesis there.

Genjutsu pipeline modules loaded: none (SCAN/THESIS preview stage).
Genjutsu pipeline modules not loaded yet: motion-principles, tells/web, desktop-principles, design-audit, ui-ux-pro-max, css-native; load after thesis/variant validation. UI Pro playbook and UI Styling skill/accessibility patterns informed this audit.

Unverified delivery gates for the later implementation: Electron animation profiling (no frame over 16.7ms), whole-view keyboard/pointer traversal, actual OS reduce-motion path, source/dialog transition focus restoration and authenticated employee/lead/admin variants. The app has a native minimum width of 440; this pass does not claim mobile support.
