# Averill excellence plan: understandable without a test guide

29 October 2026 · Proposal for implementation · Product copy and implementation documentation in English

Evidence: [current audit](COMPREHENSIVE_AUDIT_2026-10-29.md). This plan extends the existing assistant and quiet-visual work; it does not describe these proposed changes as delivered. No new observation, autonomous editing or publishing capability is proposed. Preserve the Companion identity and the separate Vamo demo brand.

## Product outcome

A new employee should immediately understand: what Averill can help with, what work it is using, what the answer means, what to do next, and how to recover if it cannot help. An owner-test document should measure those outcomes, never supply the missing navigation instructions.

Three connected systems must improve together:

1. Navigation indexes tasks, conversations, documents and guides.
2. AI recognizes the task, retrieves appropriate evidence and returns the right kind of answer.
3. A shared renderer presents that answer and next action consistently on desktop and inside Canva.

## 1. Desktop navigation

Use a persistent left rail at normal desktop widths and a labelled compact navigation at narrow widths. Do not hide a primary capability inside More. Provisional labels:

| Destination | Landing content | Indexed secondary views |
| --- | --- | --- |
| Home | Ask field, resume current task, at most three relevant starting actions | Assigned work and review requests; meaningful zero state |
| Assistant | New question or continue a named task | Searchable conversations, pinned tasks, company/tool/public scope |
| My work | Current shared work and its checks | Active context, recent checks, supported corrections and recovery |
| Library | Search-first document list | By topic/department, current versions, saved sources; review queue by permission |
| Learn | Resume one current activity | Guides by tool/task, practice history and current-week practice |

Settings remain in the account/connection footer. Source administration is permission-scoped inside Library/settings, rather than a competing employee starting point. Public research is an explicit action in Assistant, with its own result/history view; it must be findable without guessing More. Validate the labels with first-click tasks before locking them.

Home’s empty state must offer “Ask a question”, “Check my work” and “Learn a tool”. Do not use zero assignments as the entire product introduction. Explain each in one short line; no mandatory introductory tour.

### Assistant workspace

At wide widths: task/conversation index on the left, selected answer in the middle, optional evidence reader on the right. At narrow widths: one view at a time with a labelled Back control. This is navigation between views, not columns squeezed into a floating panel.

The composer stays reachable. Show a context chip such as “Canva · Page 2 · Selected text” only when identity is known. Offer “Change context” and show “No work shared” when needed. The user asks naturally; optional scope controls refine a question, but the user should not have to choose a provider or know which backend to invoke.

Each task has a human-readable title, last activity and result type. Scope task history to the signed-in person. Define retention and explicit clearing before persisting any conversation; start with session-only history if durable storage has not been approved. No quiet cross-person or cross-workspace memory.

### Library

Replace the default wall of previews with compact rows: human title, topic, current version, approval/authority and updated date. Preview lives in a selected-document reader. Group versions into one document family. Show superseded/conflicting material in an explicit secondary view; do not automatically change source approvals.

Keep search, result count, active filters and clear-filter action visible. Support synonyms and cross-language retrieval. A citation opens the precise passage with heading/page/line when available, preserving the user’s task and a reliable Back path. Authority comes from workspace metadata, with content contradictions flagged for review rather than silently overwritten.

## 2. Canva companion

Use one panel with a stable header and three indexed destinations: **Ask**, **Checks**, **Guide**. Keep current slide identity and Stop sharing outside the content scroll area. Minimize remains persistent; new findings update a badge rather than reopening the panel. Reuse current 0.6.0 behavior where already implemented.

| View | First screen | Detail navigation |
| --- | --- | --- |
| Ask | Short answer, one next action, follow-up field | Prior questions by task; sources open separately |
| Checks | Current page, severity summary, highest-priority actionable finding | “Text”, “Layout”, “Company rules”; previous/next finding; page 1–5 status |
| Guide | Goal, step N of M, one instruction and Back/Next/Exit | Expandable step index with descriptive titles and status |

Do not repeat full checklists, illustrations, consent prose and articles in the same scrolling view. Show an illustration only when it explains the current action. Open the exact relevant guide from a finding. Preserve unfinished questions when switching tabs.

Pointers resolve only an actually visible unique supported control. If it is absent, explain how to expose it and offer “Try locating again”. If ambiguous, ask for the necessary selection/menu state. Never invent a coordinate or count a manual Next/click as measured improvement. Current measurements remain tied to person, session, tab, design, page and revision. Historical progress must read “Previously seen”, not “Checked now”.

Changing page cancels or pauses a guide whose context no longer matches. Unreadable pages remain unverified. Carousel overview shows Checked / Needs attention / Not read, without treating partial results as design approval.

## 3. Answer types and examples

These are proposed response contracts, not claims about observed designs or real company policy. UI examples are in English to match the product.

| Question type | Expected structure | Example behavior |
| --- | --- | --- |
| Company fact | Direct answer; exact authority; one relevant next action | “The current policy requires lead approval before booking.” Then its real citation; do not infer an amount |
| Tool how-to | Goal; 2–5 relevant steps; where the control is; expected result | Frame: Elements → Frames → choose frame → drag image into frame; provide steps only when official evidence supports them |
| Design review | What was actually measured; why it matters; one fix | “I can read this page’s text contrast, but not this image.” Never claim an unseen defect |
| Draft/rewrite | Complete proposed text; assumptions/missing facts separate | Preserve supplied facts and CTA; do not turn a rewrite request into an article list |
| Summary | Short faithful synthesis; decisions/actions; source anchors | Summarize across relevant passages; reserve literal excerpts for evidence |
| Comparison | Table of relevant differences with authority per row | v1 versus v2: audience, wording, asset, dates; explicit conflicts |
| Public research | Direct conclusion; dated evidence; uncertainty | Separate independent public facts from fictional company campaign details |
| Public fact-check | Atomic claim; verdict; reason; supporting excerpt; recovery | “These pages discuss the destinations but do not verify Vamo’s offer. Check the approved campaign brief.” |
| Troubleshooting | Observed state; one plausible next diagnostic action | Ask which control/error if unknown; avoid pretending to observe the app |
| Follow-up | Resolve references within the current task | “And on Instagram?” reuses the prior goal, switches the platform, then rechecks relevant rules |

### Replace generic dead ends

- Tool help with no company policy: “Here is how to do it in Canva. I have not found an additional company requirement for this step.” Continue with useful general help.
- Missing company authority: “I can’t confirm your company’s reimbursement limit from the approved sources available to you.” Action: “Choose a source” or “Request clarification”; never search the public web for a private policy.
- Unknown visual context: “Select the text you want me to check, then choose Check selected text.” State the supported measurement.
- Conflicting sources: identify the two accessible versions, explain the conflict, offer review. Do not select the most convenient value.
- Provider failure: “Online help is temporarily unavailable. You can use these local steps or retry.” Keep a technical code in details, with no unsupported promise that local steps are current.
- Unsupported general operation: clarify the intended operation and offer official search with the actual public query preview. Do not funnel it into company lookup.

Never show raw IPC exceptions, validator jargon, raw search snippets, or a long provider explanation as the main answer. Status should describe this response: local guidance / official help / company source / online unavailable. Provider settings and diagnostics belong in supporting detail.

## 4. Intent, context and retrieval architecture

### Intent resolution

Keep deterministic safety gates. Add an explicit task representation: intent, goals[], tool, referenced artifact, requested output, language, evidence requirements and unresolved ambiguity. Support Italian/English paraphrases and common misspellings. A local rule baseline can cover frequent goals; an optional bounded model classifier may improve interpretation only within existing disclosure permissions. Do not send an arbitrary employee question through the closed public-operation route.

Prefer current verified context over a stale stored selection; allow a visible override. Tool-operation recognition should not require “how/where” wording. Summary, comparison, rewrite, troubleshooting and web research need distinct intents. Decompose multiple goals without dropping the third request. Resolve follow-ups from bounded task context; ask one specific clarification only when needed to avoid a wrong action.

### Retrieval

Company: apply person visibility, approval, confidentiality, supersession and conflict filters before retrieval. Use paragraph/heading chunks across the full eligible document, versioned stable IDs and lexical plus optional semantic retrieval under existing policy. Rerank against the actual goal and carry source coordinates. Evaluate Italian queries over English sources and relevant material beyond character 12,000.

Public tool help: construct a sanitized task-specific public query; restrict to official tool documentation and match desktop/mobile/language where possible. Retrieve per goal, deduplicate and extract a bounded relevant section if snippets are insufficient. Official domain membership is necessary but does not establish that an instruction is relevant. Do not put private drafts, personnel data or internal sources into Tavily queries.

Public claims: distinguish public facts, company claims, subjective language and instructions. Split a confirmed public sentence into checkable claims, preserving qualifiers such as date/location. Show the actual outbound queries before transmission; changing them invalidates the earlier consent. Use same-entity evidence and explain when public search cannot establish a fictional/private offer. Not found, contradicted and source unavailable are different outcomes.

### Generation and validation

Use intent-specific schemas and budgets through src/nebius.js. Public help already has strict schema: extend rather than duplicate it. Pin or explicitly record the selected canonical model and verify its supported schema behavior; do not silently switch model based only on discovery order.

Proposed shared response envelope: intent, contextIdentity, answer, sections[], steps[], claims[], evidence[], coverage[], nextAction, status, limitations. Derive authority and checked-state locally. Only locally allowlisted actions may render buttons; model content never becomes executable UI or a patch.

Validate schema, exact evidence, claim/step support, mandatory policy preservation, numbers/negations, conditional applicability, requested-goal coverage and context freshness. An exact quote is retained for provenance; the user-facing answer may be a faithful paraphrase. Do not use another unvalidated model as the sole judge of support. Maintain deterministic high-risk checks and adversarial evaluations. Reject unsupported claims and return a useful partial answer with explicit missing coverage.

One bounded repair is appropriate for malformed output. Retrieval repair is appropriate for irrelevant/incomplete evidence. These are different failure paths. Keep total request/time budgets, cancellation, Stop/logout revocation, source-version invalidation and no hidden network after the user declines.

## 5. Sequenced implementation backlog

Effort is relative (S/M/L), not a delivery-date promise. Dependencies are explicit. Each ticket needs automated evidence plus the appropriate real workflow receipt.

| Ticket | Priority / size | Dependency | Deliverable and completion gate |
| --- | --- | --- | --- |
| EX-01 | P1 / S | None | Reproduce A01/A02/A04 using synthetic states. Confirm email tool inference, stale error lifecycle and approval/content disagreement; never mutate real approvals automatically |
| EX-02 | P1 / M | None | Baseline evaluation corpus and result rubric. Every failure categorized; include natural Italian, English, typos and follow-ups |
| EX-03 | P1 / M | EX-02 | Intent/context model with goals[]. Corpus detects summary, review, how-to, draft, comparison and multi-goal continuation; missing context prompts a specific recovery |
| EX-04 | P1 / M | EX-03 | Unified permission-filtered chunk retrieval. Find a relevant passage beyond 12,000 characters and across languages; conflicts and inaccessible sources never enter generation |
| EX-05 | P1 / L | EX-03/04 | Shared typed answer and intent-specific prompts/validators. Faithful summary works; unsupported conditions and numbers fail; all requested goals accounted for |
| EX-06 | P1 / M | EX-02/03 | Public claim decomposition and evidence relevance. Fictional campaign sentence is not validated by unrelated travel offers; changed query requires renewed preview |
| EX-07 | P1 / S | EX-05/06 | Preserve explanations and evidence across desktop/browser summaries. Same claim shows same reason and scope from every entry |
| EX-08 | P1 / M | EX-02 | Navigable prototype for desktop IA. First-time users can locate Ask, research, source and connection without a script; refine labels before runtime migration |
| EX-09 | P1 / L | EX-05/08 | Desktop navigation, task index and stable composer. Empty Home offers actions; primary capability within two intentional navigation actions from Home |
| EX-10 | P1 / M | EX-04/08 | Search-first Library with document families, selected reader, authority and version view; Back restores selection and focus |
| EX-11 | P1 / L | EX-05 | Canva Ask/Checks/Guide panel and step index. View switching preserves draft question; Stop remains reachable; minimization never reopens on findings |
| EX-12 | P1 / M | EX-01/11 | Unified current measurement/guide/practice state. Stale design readings cannot unlock current completion; historical progress and manual confirmation clearly separated |
| EX-13 | P2 / M | EX-05/11 | Relevant guide catalogue with entry/resume and missing-target recovery. No conditional exception shown as a mandatory normal step |
| EX-14 | P1 / M | EX-09/10/11 | Accessibility/error resilience: keyboard, screen reader, 200% zoom, narrow/wide, reduced motion, selection/focus recovery, plain-language errors |
| EX-15 | P2 / S | EX-05/06 | Content-free diagnostics: stage, latency, model/version, status, coverage failure category. Feedback remains private; no automatic document/query logging |
| EX-16 | P1 / M | EX-01–15 | Fresh provider corpus + packaged real Canva/Brevo rehearsal + unassisted usability study. Release only after separate evidence gates pass |

Suggested slices: (A) context/error correctness and evaluation; (B) answer quality and retrieval; (C) desktop navigation and Library; (D) Canva/Learn continuity; (E) real acceptance. Prototype IA can run alongside pipeline work, but the final UI must consume the shared answer contract. Do not estimate a fixed release date until the current failure baseline and EX-08 are reviewed.

## 6. Acceptance: correctness and usefulness

Proposed targets, not current measurements:

| Gate | Target and method |
| --- | --- |
| Routing | At least 95% on an independently reviewed held-out intent set; no general how-to blocked solely for absent company policy |
| Completeness | Every requested goal answered or explicitly marked missing; no silent third-goal omission |
| Evidence | Zero unsupported company requirement/price/date in the release corpus; exact citation trace plus claim-level support review |
| Relevance | No third-party-app download workaround for ordinary grouping without that condition; desktop question does not rely on mobile-only steps |
| Recovery | Every missing source/context/provider case has an accurate explanation and at least one available next action |
| Discoverability | Primary task entry within two intentional navigation actions from Home; measure first click without suggesting the label |
| Canva | One panel, stable footer, one active guide step, no reopening after minimize, no false completion on Next |
| History | A previous answer and source can be found without scrolling the entire transcript |
| Latency | Measure p50/p95 by task and retrieval path; provisional p95 first useful response ≤15s for simple online help, with visible progress and cancel. Three current samples are insufficient for a percentile |
| Human usability | At least 5 first-time participants spanning relevant roles, 8 task prompts, ≥90% task success without intervention, median ease rating ≥5/7; report count and individual failures, not statistical certainty |
| Accessibility | Keyboard complete, meaningful focus recovery, 200% and narrow/wide layouts, VoiceOver walkthrough; automated pass alone insufficient |
| Context safety | Stop/logout/context change invalidates in-flight result and pointer; no cross-person/design/source-version reuse |

Build a minimum 80-case evaluation set: company Q&A 10, tool help 12, visual review 8, drafts 8, summaries/comparisons 10, web research/fact-check 10, follow-ups 10, failure/privacy/context 12. Include Italian/English variants, misspellings, no tool name, long sources, no sources, conflicting versions and consent refusal. Reserve at least 20 unseen paraphrases for holdout evaluation; do not tune the full set into keyword rules. The saved 17-question routing probes are a diagnostic starter, not this complete benchmark.

Human task prompts describe outcomes only: “Find the approved campaign schedule”; “Put an image inside a shape”; “Improve the readability of this text”; “Get a faithful brief summary”; “Find what changed”; “Check this public assertion”; “Return to your previous answer”; “Stop sharing and continue locally”. The facilitator must not name the tab/button. Record first click, completion, hesitation, wrong turns and assistance; ask participants to explain what Averill actually checked.

## 7. Release boundary

Require four independent receipts: automated contracts; fresh live provider answer quality; current packaged app with installed extension on real supported workflows; human usability/accessibility. A provider success is not a UI success; a pointer click is not mastery; a clean text check is not whole-design approval.

Keep credentials, approvals, person isolation, exact evidence provenance, explicit outbound preview, restricted-source exclusion, bounded DOM-only Canva observation, current Apply/Undo adapters and employee control of publication. New task persistence or analytics must define visibility/retention and receive its own implementation review. No deployment, source migration or release is part of this research deliverable.
