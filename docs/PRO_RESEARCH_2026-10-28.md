# Averill Pro: owner feedback, source audit and research

Date: 28 October 2026 (Europe/Copenhagen). Planning evidence at checkout `4316a0d`.
Status: research and proposed changes; no product implementation or release in this pass.

## Owner intent

Make Averill a simple company assistant for individual roles and departments: help people complete their work, use their tools and learn while working. Company files supply context; they must not define the entire assistant experience. Initial workflows remain Canva, Brevo, LinkedIn and Instagram. The existing explicit sharing boundary remains; “always ready” means ready during the employee's connected session.

| Owner feedback | Evidence inspected | Consequence |
| --- | --- | --- |
| Removing a bad claim leaves half a sentence | `travel-desktop/src/contextual-review.js`, `exactProposal`: a unique observed forbidden fragment becomes a patch with `after: ''` | A passing exact-removal test does not establish a coherent correction. Replace at sentence level, with a distinct validated rewrite proposal. |
| Explain first, then use Nemotron to reformulate | Same module deliberately refuses to execute model prose; `src/nebius.js` already provides a purpose-labelled client | Add an explicit rewrite schema and validation path; do not start treating arbitrary model suggestions as patches. |
| A meaningful, truthful marketing email of at least 200 characters | `demo-tools/social-simulator/src/data/flawed-drafts.json`: the current body already exceeds 200 characters, but contains a guarantee and unsupported descriptions such as snow and crew experience | Length alone is already insufficient. Require supported claims, audience, coherent value proposition and CTA. Keep a separate intentional-error draft for the demo. |
| Help with Canva itself, during real work | `src/workspace-answer.js` routes design questions to exact approved rule lines, bypassing the model; `learning-ui.js` help matches a bounded offline lesson; extension `content.js` embeds fixed how-to panels | A new functional-help intent must retrieve current official tool documentation and synthesize task-specific guidance. No company typography rule should be needed to explain grouping. |
| Check the requested test | `src/learning.js:beginQuiz`, `src/practice-bank.js`, `src/practice-page.js` | Four visual answer formats, single submission and wrong-answer retry exist. But `general` questions fill gaps, Brevo footer practice is manual, and source practice can ask only whether a document is current. This is partial compliance, not a fully relevant work-based assessment. |
| Social and Canva functions must work | Latest section of `docs/HANDOVER.md` | Real Canva found contrast/margin findings, but carousel aggregate failed. Extension-version mismatch is a hypothesis, not a proven cause. Real social platform acceptance and complete packaged flows are still unproven. |

The latest handover must take precedence over its historical sections. It contains conflicting older “not deployed”, “not started” and success statements. The top live-test section is the latest evidence for the carousel failure. None of those records establishes current production provider health.

## Research: relevant product patterns

These are vendor-documented patterns, not independent usability benchmarks. Sources consulted on 28 October 2026; availability and account entitlements need checking before implementation.

| Reference | Documented pattern | Proposed lesson for Averill |
| --- | --- | --- |
| [Microsoft Copilot overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-overview) | Work/web grounding, application integration and agents scoped by user permissions | Organize around tasks and role context, with knowledge behind the answer. |
| [Glean: permissions in Search, Assistant and Agents](https://community.glean.com/en/public/resources/how-does-glean-keep-sensitive-data-secure-while-still-using-ai-2026-04-23) | Source-system access controls continue to govern assistant retrieval | A department profile must never become a new way to expose another person's documents. |
| [Whatfix Cues](https://support.whatfix.com/studio/docs/what-are-cues) | Contextual in-app guidance, triggered by defined visibility rules, with a short message and limited actions; documented as beta | Give one useful next action in the current tool. Avoid turning help into another dashboard or interrupting every edit. |

Recommendation (our inference): combine task assistance, contextual tool guidance and personal learning. Averill's useful differentiator is the loop “help me finish this → explain how → check what can actually be observed → practise what I learned”. Adding another document chat does not close the observed gaps.

## Provider and integration research

- [Nebius function calling](https://docs.tokenfactory.nebius.com/ai-models-inference/function-calling) and [structured output](https://docs.tokenfactory.nebius.com/ai-models-inference/json) provide building blocks for typed proposals. [Nebius's Nemotron announcement](https://nebius.com/blog/posts/nemotron3-super-now-available) describes text inference and tool-oriented reasoning. Actual model IDs and supported features must be discovered for the configured account; do not infer visual observation from a text model.
- [Tavily Search](https://docs.tavily.com/documentation/api-reference/endpoint/search) supports domain filtering. Search official Canva/Brevo/LinkedIn/Instagram documentation using public functional queries, then validate the supporting page. Send no drafts, internal rules or employee data to Tavily. A search result is guidance evidence, never a company approval.
- [Canva Selection API](https://www.canva.dev/docs/apps/selection/) exposes supported selected content with declared permissions. [Design Editing API](https://www.canva.dev/docs/apps/design-editing/) is a separate official integration surface worth evaluating. Neither source proves that the existing Chrome DOM reader gains those capabilities automatically. A Canva app requires its own feasibility work, supported-design matrix and distribution/permission decisions.
- Keep the existing DOM reader as a bounded near-term adapter. Evaluate an official read-only Canva integration as a production track; do not promise arbitrary control or full editor-state knowledge. Tool help must work even when a design cannot be measured: explain the procedure and label the check as unavailable.

## Verification performed in this pass

`node --test tests/learning.test.js tests/contextual-review.test.js tests/workspace-answer.test.js` in `travel-desktop`: **23 passed, 0 failed**. The first sandbox run was 22 passed / 1 blocked by local loopback `listen EPERM`; rerunning with loopback access passed all 23. No provider calls, real-platform interactions, user-profile changes or publishing occurred.

These tests verify their current contracts, including exact deletion and generic practice fallback. They do not demonstrate that those contracts satisfy this feedback. Full `npm test`, packaged acceptance, live provider responses and real-platform acceptance were not rerun for this documentation-only task.

## Reviewable email reference

Use as the clean comparison draft, not as a claim that a real travel offer has been externally verified. Evidence: `travel-desktop/sources/current-brief.md` (approved lead, three cities, audience) and `brand-and-legal.md` (claim restriction and required footer). CTA destination is the existing Vamo demo URL. Do not invent discounts, availability, group size, weather, testimonials or booking guarantees. The dates in the fixture remain historical campaign data.

Subject: Discover your next winter city break with Vamo

Body:

> Hello traveller,
>
> Discover curated winter city breaks with Vamo. Explore our Winter Escapes 2027 collections for Copenhagen, Vienna and Prague, and find inspiration for your next short European break. Start with the city that interests you, explore the collection and choose what you would like to discover next.
>
> Explore the winter collection: https://vamo-travel-site.vercel.app/winter.html
>
> The Vamo team
>
> You are receiving this email because you subscribed to Vamo. Unsubscribe anytime.

The body exceeds 200 characters without counting the subject, footer or URL. In the rendered email, retain the actual visible unsubscribe control and supported company-address source; do not invent an address to make a check pass. Quality acceptance also requires human review of clarity, relevance and commercial usefulness.
