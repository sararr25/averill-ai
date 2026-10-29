# Averill enterprise foundation RFC

Date: 29 October 2026. Status: design proposal; this is not deployed enterprise infrastructure.
Related: [Pro plan](PRO_PLAN_2026-10-28.md), [research](PRO_RESEARCH_2026-10-28.md), [confidentiality](COMPANY_CONFIDENTIALITY.md).

## Decision

Keep the local hackathon application usable as a task assistant while introducing production foundations in a separate delivery. The current local accounts, JSON store, unsigned build and browser adapter do not constitute an enterprise service. Do not expand departments or actions on the strength of a prompt template alone.

## Trust boundaries and data flow

`employee/tool → explicit selected-work grant → local context and redaction → authenticated task service → permission-filtered source retrieval / public-help retrieval → bounded model proposal → evidence validation → employee decision`

- The operating system, source systems, public web, assistant service and model providers are distinct trust boundaries.
- Every request derives tenant/person from the authenticated session. Never accept a tenant/person ID as authorization from a renderer, extension or model.
- Role playbooks suggest tasks; they never grant document, connector, source-approval or publication rights.
- Source authorization is checked at ingestion, retrieval and response delivery. Revocation increments an authority epoch and cancels pending answers, proposals and cached private retrievals.
- Public documentation is untrusted evidence for tool instructions. It cannot supply company authority, instructions to execute tools or a reason to transmit internal data.
- A model response can propose a sentence/checklist. It cannot issue database, filesystem, browser or publication commands.

## Storage and identity

| Concern | Proposed production requirement | Rollout evidence required |
| --- | --- | --- |
| Tenants | Tenant-bound storage keys and database policies; server-derived tenant context | Cross-tenant adversarial tests and independent review |
| Authentication | OIDC/SAML SSO through a supported identity provider; short-lived sessions and managed revocation | Login/logout, disabled employee, IdP outage and recovery exercises |
| Source permissions | Connector scopes and per-document ACLs; recheck before returning private results | Removed group/document access stops retrieval and pending output |
| Encryption | Managed encryption at rest and in transit, secret-manager keys and rotation | Restore/rotation exercise; no credentials in logs or desktop distribution |
| Retention | Customer-controlled document retention, source removal and personal learning deletion | Deletion propagates through raw extracts, indexes, caches and backups according to documented policy |
| Audit | Actor, purpose, source IDs/versions, permission decision, provider call metadata and action result | Audit events are useful without recording raw drafts, passwords or unrestricted prompt content |
| Learning | Person-owned practice; team learning content separated from individual scores | Manager cannot retrieve private quiz answers or use them as hidden employee evaluation |

Do not migrate the existing local profile silently. Provide a previewed export/import with explicit destination and an independently tested rollback. Keep credential migration out of knowledge indexing.

## Connectors and actions

Each connector must declare separately: read scope, supported fields, update scope, observation freshness, supported undo and acceptance status. Request the least scope needed for a concrete task. Tokens stay in a protected vault, not the extension or model context. Token revocation invalidates both connectivity and pending work.

Future sending/publishing requires an action-specific approval containing the final content, account, destination, audience, schedule/timezone and attachments. Approval is bound to their hash; edits invalidate it. Use idempotency keys and an operation ledger so retries do not duplicate publication. Record provider acknowledgement separately from actual publication, and offer cancellation only when the provider supports it. No such autonomous action is introduced in the Pro increment.

## Canva integration decision

Near term: keep the bounded Chrome reader and visible unknown/unsupported states. It reads the open slide, not the entire editor state. Do not add screenshot or observation permissions to compensate for an unrecognized page.

Production official integration: **NO-GO for implementation until a bounded read-only prototype is accepted.** Official Selection and Design Editing APIs are documented, but their existence does not prove account availability, supported group/layout reads, full-carousel inspection or distribution approval for Averill. This is an evidence-based hold, not a claim that the API is unavailable.

Prototype evaluation:

| Scenario | Required observation | Failure behaviour |
| --- | --- | --- |
| Select text and rich text | Stable selected content and supported formatting with declared read permission | Explicit unsupported state |
| Group and ungroup | Documented group relation or an explicit inability to observe it | Human confirmation; no inferred automatic tick |
| Carousel | Stable design/page identity and current-page content | Incomplete until every supported page is read |
| Rotated/masked/image-backed text | Supported geometry/background evidence | No contrast/geometry verdict without readable evidence |
| Revoke permission or switch design | Immediate cancellation and reset of prior results | No inherited clean state |
| Distribution | Account entitlement, app review/private distribution and update path verified | No production commitment before availability is demonstrated |

No authorized Canva developer app or new read grant has been created in this implementation. The live Chrome extension reload is also a separate gate. Complete the prototype before choosing whether to retain the DOM adapter, add an official adapter or keep both with explicit capability negotiation.

## Evaluation and rollout

Proposed service objectives, to be measured before commitment: acknowledge an interactive request within 1 second; ordinary help within 10 seconds at p95; stop/cancel immediately revokes result delivery; no help request exceeds its 30-second wall-clock budget. Current direct synthetic provider runs are evidence for those requests only, not a production latency percentile.

Evaluate answer relevance, claim support, task completion, time to useful help, recovery from failures, unprompted interruptions and accessibility. The pilot target from the Pro plan remains at least 80% completion over five representative employees, without developer coaching. Do not fabricate a pilot result from automation.

| Department/connector | Concrete first workflow | Acceptance owner to assign before rollout | Required evaluation |
| --- | --- | --- | --- |
| Marketing / Brevo | Improve a supported launch draft, retain footer and CTA | Marketing lead + application owner | Real draft flow, correct audience/claim/format boundaries, no send |
| Marketing / Canva | Ask an unscripted tool question, complete a layout step and record relevant practice | Content lead + accessibility reviewer | Real editor, unknown-state recovery, carousel, keyboard and VoiceOver |
| Marketing / LinkedIn | Prepare an organic post with its own rules | Social lead | Real draft composer and source/channel separation |
| Marketing / Instagram | Prepare a paid creator draft with visible disclosure guidance | Social lead | Real draft and explicit unobserved partnership-setting state |
| Operations | Turn an approved handover into an actionable checklist | Operations lead | Positive and missing-evidence cases, department isolation, real employee review |
| People / Sales / Support | Discover one task with its actual owners before adding a connector | Department owner, not yet assigned | A representative task/evidence set, privacy review and an acceptance owner |

Rollout stages: local synthetic verification → designated real draft accounts → employee pilot → one tenant with read-only scopes → additional tenants → separately approved write actions. Each stage has a go/no-go ledger. Stop expansion on critical permission, stale-answer or unsupported-action defects.

Rollback: retain the previous signed desktop version and extension protocol compatibility matrix; pause new connector grants; disable the new server feature flag; keep read-only fallback available; revoke in-flight grants and revert service deployment if needed. Do not roll back source approvals, learning history or published external work as a side effect.

## Cost and operations assumptions

- Reuse the existing capped demo server for synthetic judge workflows; never distribute provider keys in the app. This is not a tenant authentication service.
- Charge/measure separately: model tokens, public search calls, indexing/storage and connector traffic. Reserve quota before remote work and settle actual usage afterward. Keep global, client and IP limits on the demo server.
- Production pricing requires measured workload and provider contracts; no unsupported fixed cost or availability promise is made here.
- Add sanitized metrics and alerts for permission failures, queue/latency, validation fallback, provider errors, quota exhaustion and version mismatch. A content-validation fallback is not a successful model answer.
- Signing/notarization, update recovery, provider retention terms, data residency, SSO and operational support remain prerequisites for enterprise rollout.
