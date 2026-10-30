# Averill: functional, AI and UX audit

29 October 2026 · Current working tree over d17e4c7 · Research and planning only

## Verdict

Averill has a substantial tested foundation, but its current information architecture and answer contract do not yet support independent first-time use. The owner’s complaint is consistent with inspected product behavior: finding the right action requires understanding implementation categories, ordinary questions can enter an unsuitable company-lookup route, and successful provider output can still be overcomplicated or incomplete.

The next increment should redesign navigation and the answer pipeline together. Another isolated styling pass, extra accordion, or larger model budget will not address these causes.

## Evidence and boundaries

This audit combines current source inspection, native inspection of the existing packaged app, read-only inspection of the open real Canva editor, deterministic routing probes, the existing automated suites, and three fresh public-provider requests. Earlier plans were read as context, not treated as current acceptance.

The native app was already signed in to a fictional marketing employee. Inspected Current work, Company library, Learn and To do. The observed UI was at the owner’s existing window size and scroll position; no zoom preference was changed. Canva’s actual editor and toolbar were inspected without editing its design. There was no visible active Averill panel in that tab, so this audit does **not** establish current real-Canva companion/pointer acceptance. Extension management was not attempted. No normal account, company source approval, design, credential or provider setting was changed. Navigating the native app updates its last-area preference; it was left on To do.

Provider checks used a disposable synthetic workspace with company AI off, zero company sources, and the development keys through existing approved clients. Only generic public operations and official public excerpts were sent. No normal user profile was read by the scripts. Product code and existing uncommitted implementation work were preserved.

| Verification | Fresh result | What it establishes |
| --- | --- | --- |
| Node suite | 280/280 pass | Existing automated contracts; not independent usability |
| First sandboxed run | 249 pass, 31 loopback EPERM failures | Environment restriction; rerun with loopback enabled passed |
| Pro renderer/IPC | 6/6 pass, synthetic providers | Preview, tool answer, practice, partial consent, draft, logout |
| Accessibility matrix | 10 check groups pass | Four roles, visibility, four destinations, 520/960 px, 200% zoom, keyboard weekly practice; not VoiceOver certification |
| Routing probes | 17 questions × 3 context settings | Current deterministic intent selection; not model answer scoring |
| Live Nemotron + Tavily | 3/3 model answers | Three English public Canva operations on this run only |
| Native UI | Four areas inspected | Current visible state; no complete role/task acceptance |
| Real Canva | Editor observed; no active Averill panel visible | Current host controls; companion end-to-end remains open |

Receipts: [evidence directory](review-evidence-2026-10-29/comprehensive-audit/). The accessibility process exited successfully but logged Chromium temporary-cache warnings; those warnings are retained in its receipt.

## Mechanical scan interpretation

The Impeccable static detector was run once on agent.html; its raw output is retained as source-detector.json. It flags a font-family preference and repeated eyebrow headings. These are style heuristics, not demonstrated functional defects or WCAG findings. The approved Companion foundation takes precedence over generic font advice. Repeated labels can contribute to density, but navigation and answer quality have higher priority. This source scan did not inspect live computed contrast or performance; no overall numeric accessibility/performance score is asserted.

## Priority findings

Priority denotes task impact, not a measured incident rate. Native observations, code facts and hypotheses are distinguished below.

| ID | Priority | Evidence | Finding and consequence |
| --- | --- | --- | --- |
| A01 | P1 | Native Current work | An Email content context was configured as “Canva design text”. A user can unknowingly request the wrong rule set. Root cause of that persisted selection is not yet reproduced. |
| A02 | P1 | Native Learn | “4 of 5 steps seen” coexisted with a raw learning:action error saying two measured steps were missing. The error may be historical, but the current screen does not explain that. Completion, current measurement and previous observation need separate state. |
| A03 | P1 | Native Library | Fifteen documents are presented as substantial cards, with nested source controls. Two social-media-guidelines.md versions have indistinguishable titles at the list level. Finding an authoritative answer requires repeated reading and opening. |
| A04 | P1 | Native Library | “Approved department knowledge” appears on a personal note whose text says “Private draft: not approved campaign policy”. This is authority ambiguity, not proof of a permission leak. Investigate actual metadata and intended use without automatically changing approval. |
| A05 | P1 | Routing probes | “Voglio mettere una foto dentro una forma” and “È leggibile questo testo?” route to company even with Canva task/prior Canva context. Natural Italian descriptions are not covered by the keyword rules. |
| A06 | P1 | Routing + prompts | “Riassumi il documento” and “Summarize the brief” route to company. Both company model paths require the answer itself to be an exact contiguous quote. That contract cannot deliver normal synthesis or a concise explanatory answer across passages. |
| A07 | P1 | Routing probes | “E invece su Instagram?” changes the tool but routes to company, losing the intended continuation. The stored previous tool/topic is insufficient conversational state. |
| A08 | P1 | Code + native result | Public claim checking searches the whole confirmed statement. In the visible case, a fictional campaign sentence produced travel-package links and an Unclear verdict. Its general subject overlaps; those pages do not establish the fictional company’s campaign. Atomic claim separation and correct evidence type are missing. |
| A09 | P1 | main.js runPublicCheck | The desktop recent-check summary retains claim/verdict and two titles/URLs, dropping the judge explanation and supporting snippet. A richer answer is reduced to “unclear” plus links when viewed from another surface. |
| A10 | P1 | Live provider receipt | Grouping answer adds downloading/re-uploading third-party-app content as an ordinary step, without evidence the user selected such content. A valid citation is insufficient to establish relevance or conditional applicability. It also cites a tap-oriented ungroup excerpt for desktop instructions. |
| A11 | P2 | Live provider receipt | Frame answer ends with “Add the image or video…” rather than explaining clearly how to put it into the frame. Transport success and exact evidence validation do not guarantee task completeness. Actual user completion was not tested. |
| A12 | P1 | Native + agent.html | Public research is under More, while Ask lives inside Current work. To do can be entirely empty and offers no productive first action. The main AI capabilities are harder to discover than their importance warrants. |
| A13 | P2 | Native Current work | Nemotron connection status is repeated in the accessibility tree, alongside prominent provider/permission explanations. Connected means model discovery succeeded, not that this answer used the model or is useful. |
| A14 | P2 | Code | Compound handling has a contrast-spacing special case and picks one topic elsewhere. A three-goal question resolves to contrast-spacing, with no explicit third-goal coverage contract. |
| A15 | P2 | Code | Generic retrieval reads the first 12,000 characters, ranks substring term matches and returns four sources. Semantic retrieval exists in the fallback path, but is not uniformly used before WorkAssistant company answers. Long-document and cross-language misses are plausible, not quantified here. |
| A16 | P2 | Code | Desktop, extension answer reader, design checks, task review and public research carry overlapping presentation logic. A shared visual reader exists, but there is no complete shared task/answer state across them. |

Owning code: travel-desktop/src/work-assistant.js (classify, answer, source selection and validation); src/workspace-answer.js (designAnswer, relevantSources, answerWorkspace); src/evidence.js (terms, passage); src/public-check.js (checkClaims, judge); main.js (assistCompany, answerCompany, runPublicCheck); src/agent.js (showTab, addMessage); src/learning-ui.js; src/knowledge-ui.js; browser-extension/content-ui.js and assistant-view.js.

## Why the company-evidence message is a product problem

Averill must distinguish at least these situations:

- A tool question needs general operational help, even when the company has no rule about it.
- A company-policy question needs approved accessible authority; the web cannot substitute for a missing policy.
- A draft needs useful proposed wording supported by approved facts, with unknowns explicitly marked.
- A summary needs faithful synthesis rather than a pasted matching passage.
- A visual assessment needs a current readable selection/slide, and must explain precisely what was measured.
- A web fact-check needs a public, checkable claim and relevant evidence; “no search match” is not a contradiction.
- A provider outage needs a retry/local path, not a false claim that documents are missing.

“No company evidence” collapses these different states into a dead end. The remedy is correct intent handling plus specific recovery, while retaining truthful limits.

## Functional coverage map

| Area | Evidence this turn | Remaining acceptance and plan implication |
| --- | --- | --- |
| Sign-in, roles, person isolation | Existing unit suite + fresh four-role renderer matrix | Normal-account restart and owner recovery not exercised; keep person-bound state and distinguish unimplemented cloud features |
| To do and role tasks | Native empty state + Pro renderer | Give first action and contextual continuation even with no assigned tasks |
| Company imports, review, versioning | Code, unit tests, library visibility matrix | No real files imported; validate long/multilingual documents and replacement/conflict usability |
| Library and source reader | Native listing + automated matrix | Human find/open/back tasks, authority contradiction triage and reader focus restoration remain |
| Ask, drafts, summaries, follow-ups | Routing, prompts, Pro synthetic renderer, public live requests | New representative corpus must cover paraphrases, follow-ups and non-demo documents |
| External/browser context | Unit bridge coverage, visible context mismatch | Real pairing, tab changes, stale content, Stop, relaunch and cross-surface task binding need end-to-end rehearsal |
| Text checking and Apply/Undo | Existing automated suite | Real supported adapters and revision conflicts not rerun this turn; no general rich-editor support implied |
| Canva measurement, tutorial and carousel | Current code and real host observation | Real 0.6.0 companion, target resolution, five slides, minimization, unreadable designs and regression remain |
| Tavily tool help and public claims | Three live help requests, public-check code, native recent result | Claim decomposition, relevance, time/place constraints, same-entity evidence and useful Unclear recovery |
| Learn and practice | Native stale/conflicting state + unit/accessibility checks | Independent current-step completion and person/session/design consistency |
| Cloud intake/site/freshness helpers | Unit suite and existing architecture | Not live-tested this turn; keep explicit admin review and source provenance |
| Distribution and packaging | Existing bundle inspected | No rebuild/signing/install/release integrity repeated; current source-to-bundle parity not independently asserted |

## Comparative research: mechanics, layout and answer behavior

These are current official documentation observations, including documented UI descriptions and images where supplied. No paid competitor account was logged into or experimentally benchmarked. They establish available patterns, not proof of superior usability or feature parity.

| Product | Entry and layout | Response behavior | Specific Averill application |
| --- | --- | --- | --- |
| Notion Enterprise Search | Search with source picker, result grouping and filters; research mode available from composer | Answer overview with sources; deeper research can combine workspace and web | Source scope visible near the question; direct answer above evidence; searchable result list instead of document-card wall. [Official guide](https://www.notion.com/en-gb/help/guides/find-answers-and-generate-reports-with-enterprise-search) |
| Glean | Company search/assistant with source selection; citation navigation | Permission-aware direct answers; citations distinguish retrieved sources from model-only responses | Show readable answer, then exact source location. Keep company/public/general authority explicit. [AI Answers](https://docs.glean.com/user-guide/assistant/ai-answers), [citations](https://docs.glean.com/user-guide/assistant/glean-chat/glean-chat-citations/glean-citations) |
| Microsoft Copilot | Distinguishes Search from conversational work; source filters and result filters | Search finds information; Chat develops answers and content; web sources can expose the query used | Separate Find a file from Ask/compose without making users understand providers. Expose public query in sources. [Search FAQ](https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-search-faq), [web search](https://support.microsoft.com/en-us/microsoft-365-copilot/how-web-search-works-in-microsoft-365-copilot-chat-and-agents) |
| Claude Projects | Projects and chats, starred entries and project membership | Related conversations and knowledge grouped under an identifiable task context | Named work sessions, history search and pinned tasks; preserve active-person isolation. [Projects](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects) |
| Canva Help Assistant | Same help entry available from editor/home/settings | Question-answer help; relevant app-related answers can offer an Apps-tab quick action | Put action beside answer and retain editor context. Averill’s pointer remains bounded and user-driven. [Help Assistant](https://www.canva.com/en_au/help/ai-powered-assistant/) |
| WalkMe | Authored step list with a single current balloon; explicit start points | Resume mid-process, advance on defined triggers, distinguish milestones and goals | Guide index and current-step view; choose entry based on observed supported state; never count Next as measured design improvement. [Walk-Thru guide](https://support.walkme.com/knowledge-base/smart-walkthru-getting-started-guide/) |
| Whatfix | Page/role-contextual self help, grouped content and search keywords | Repository-backed summaries plus links/flows; relevance depends on correct segmentation | Small contextual help catalogue with synonyms and task grouping. Avoid transplanting its suggested attention animations into quiet Averill. [Best practices](https://support.whatfix.com/docs/self-help-best-practices) |
| Intercom Fin | Answer debugging in a separate side view for authorized operators | Insufficient information can trigger disambiguation; operator can inspect retrieved content and repair coverage | Separate user recovery from diagnostic explanation; collect issue categories and improve coverage deliberately. Do not assume automatic learning or vendor accuracy claims transfer. [FAQs](https://www.intercom.com/help/en/articles/7837535-fin-ai-agent-faqs), [debugging](https://www.intercom.com/help/en/articles/8403222-debug-fin-ai-agent-answers) |

## Provider architecture findings

Nemotron is the model; Nebius Token Factory hosts inference; Tavily retrieves public information. Retrieval, generation, local validation and rendering can each fail independently. A global “connected” indicator does not identify which stage served an answer.

Current public tutoring already uses a closed operation allowlist, official sources and strict JSON schema. Therefore “add structured output” is not a sufficient new plan. Extend and unify the answer contract, check selected-model compatibility, and evaluate usefulness. Nebius documents schema output and notes model-dependent support: [Structured output](https://docs.tokenfactory.nebius.com/ai-models-inference/json).

Tavily search currently disables raw content; tool help uses a small official result set, while public claims use advanced search on the full confirmed sentence. Add focused subqueries, platform/version relevance checks and bounded extraction when snippets do not cover the action. Tavily itself documents subqueries, depth choices and filtering; measure benefit before changing defaults: [Search best practices](https://docs.tavily.com/documentation/best-practices/best-practices-search).

Exact quotes are valuable provenance checks, but do not prove that an instruction follows from the quote, that a conditional exception applies, or that the answer covers the question. Keep exact evidence validation and add claim/action-level support, condition checks and coverage scoring. Never solve poor output by removing company authority or disclosure boundaries.

## Recommended decision

Adopt the companion as a task-oriented assistant: one visible question entry, indexed destinations, an explicit current task, a short answer tailored to the question, and a direct next action. Implement the linked [plan](AVERILL_EXCELLENCE_PLAN_2026-10-29.md) in gated increments. Existing green checks remain necessary; unassisted completion by new users becomes a separate acceptance gate.
