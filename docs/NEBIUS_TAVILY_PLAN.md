# Nebius and Tavily integration plan

Status, 18 October 2026: **implemented; live Nebius/Tavily runs verified on the owner's Mac with fixture data** (`verify:live-cloud` 9/9, `verify:live-ui`). See `docs/HANDOVER.md` for exact receipts and gaps.

| Tickets | State |
| --- | --- |
| AV-01 | Done: `nvidia/nemotron-3-super-120b-a12b`, tool calling and JSON mode true; embeddings `Qwen/Qwen3-Embedding-8B` (4096) |
| AV-02 – AV-05 | Done: `src/nebius.js`, `src/tavily.js`, outbound confirmation, `src/cloud-activity.js` |
| AV-10 – AV-14 | Done: `src/rules.js`, Knowledge rules panel, Review uses approved extracted rules |
| AV-20 – AV-26 | Done: `src/review-agent.js`, `src/public-check.js`, Review steps and public checks |
| AV-30 – AV-33 | Done: `src/public-site.js`, Setup › Public website. The intentional Vamo site mismatch page is not added |
| AV-40 – AV-43 | Done: `src/semantic-index.js`, Knowledge search by meaning |
| AV-50 – AV-53 | Done: `src/version-briefing.js`, `src/rule-exercises.js`, Learn practice |
| AV-60 – AV-63 | Done except the optional scheduled run: `src/source-freshness.js` |
| AV-70 – AV-72 | Done: `verify:cloud-ui` (faked), `verify:live-cloud` and `verify:live-ui` (live) pass |
| AV-73 | Not started: live checks now pass; release packaging remains |

## Product thesis

Averill checks shared work on two axes:

- **Is it approved?** Internal axis. NVIDIA Nemotron on Nebius Token Factory reads, structures and reasons over approved company sources and the work the employee explicitly shares.
- **Is it still true?** External axis. Tavily brings in public facts: the company's own public website, public claims in a draft, landing pages and external platform rules that internal guidance depends on.

The model proposes; local validation (exact quotes, approval, version, conflict, role visibility) decides what is shown. The employee owns every edit and the admin owns every approval.

## Non-negotiable constraints (from AGENTS.md)

These apply to every ticket and are part of every acceptance check.

1. Nebius receives only excerpts allowed by the owner AI policy and per-file consent. Restricted and credential-bearing content is excluded. No credentials, keys or file binaries.
2. Tavily receives only public text the employee has seen and confirmed (or a public URL the admin entered). Never a full draft, internal source text or personnel data.
3. Model output is a proposal. Rules, conflicts and source freshness need human approval with the existing owner/admin/lead hierarchy. Department leads still cannot approve company-wide sources.
4. Every Nebius path has a deterministic offline fallback. Learn keeps working offline.
5. Learning records and private proposals stay scoped to the active person; no owner ID from IPC.
6. Do not bypass HTTPS address/redirect checks. Do not claim platform acceptance, geometry understanding or external app control.
7. Run `npm test` from `travel-desktop/` after every ticket and state what was actually verified.

## Phases and order

| Phase | Tickets | Outcome |
| --- | --- | --- |
| 0. Foundations | AV-01 – AV-05 | Shared, tested Nebius and Tavily clients, policy gates, model discovery, telemetry for the user |
| 1. Rule extraction | AV-10 – AV-14 | Averill works on any imported company, not only hand-written Vamo rules |
| 2. Review agent | AV-20 – AV-26 | Nemotron tool-calling reviewer with visible steps and the "still true?" axis |
| 3. Public site vs brief | AV-30 – AV-33 | Tavily crawl of the public website compared with approved sources |
| 4. Knowledge | AV-40 – AV-43 | Semantic search and cited multi-source answers |
| 5. Handover and Learn | AV-50 – AV-53 | v1→v2 briefing, exercises generated from approved rules |
| 6. Source freshness | AV-60 – AV-63 | Admin-run check that external rules behind guidance are still current |
| 7. Docs and release | AV-70 – AV-73 | Documentation, confidentiality notes, verification scripts, release |

Critical path: AV-01 → AV-02 → AV-10 → AV-11 → AV-20 → AV-21 → AV-23. Phases 3, 4 and 6 can run in parallel after Phase 0.

Size: S ≤ ½ day, M ≈ 1 day, L ≈ 2 days.

---

## Phase 0 — Foundations

### AV-01 Verify Token Factory capabilities with the real key — S
- Extend `scripts/verify-nebius.cjs` to list models and record: Nemotron Super/Nano ids, whether `tools`/`tool_choice` work, whether JSON/structured output is accepted, available embedding models (NVIDIA first), any NVIDIA safety/guard model, the reasoning on/off switch for Nemotron.
- Output a local report (not committed if it contains account details) and a sanitized summary in `docs/HANDOVER.md`.
- **Acceptance:** the summary lists the model ids each later ticket will use, with a fallback when a capability is missing (for example JSON-in-text parsing if native tool calling is unavailable).
- Blocks: AV-02, AV-20, AV-40, AV-14.

### AV-02 Shared Nebius client `src/nebius.js` — M
- One module replaces the duplicated fetch/model-discovery code in `task-review.js`, `onboarding.js`, `workspace-answer.js`.
- API: `models()` (cached per session), `chat({ purpose, messages, tools, json })`, `embed(texts)`. Timeouts, one retry on 5xx/429, abort support.
- Every call takes a `purpose` (`rule-extraction`, `review`, `answer`, …) and passes through `company-privacy.js` before sending.
- **Acceptance:** existing task-review/onboarding/answer tests pass unchanged; new `tests/nebius.test.js` covers model selection, retry, timeout and the privacy refusal with a mocked `fetch`.

### AV-03 Shared Tavily client `src/tavily.js` — M
- Wraps `/search` (basic/advanced, `include_answer`, domain filters), `/extract` and `/crawl` (or `/map` + `/extract` if crawl is unavailable on the plan).
- `web-search.js` keeps its exported functions and delegates to it.
- Outbound guard: `privacy.credentials()`, length caps, refuse text that matches any internal source passage over N characters (prevents leaking internal text by accident). URLs only `https://`, existing address/redirect checks reused.
- **Acceptance:** `tests/web-search.test.js` still passes; new tests for the outbound guard, URL checks and response sanitization.

### AV-04 Outbound review gate in the UI — M
- One reusable confirmation component: "This text will be sent to Nebius / Tavily" listing the exact strings or URLs, with Send / Edit / Cancel.
- Used by every ticket that sends anything the employee has not typed directly.
- **Acceptance:** no Tavily call from Review, Handover or Freshness happens without the gate; keyboard accessible; Averill tokens only.

### AV-05 Activity log for cloud calls — S
- Per person, local: time, service, purpose, number of items sent, result count. No payload content.
- Visible in Settings; admin sees counts per service, not other people's queries.
- **Acceptance:** log entries appear for every call; another person's log is not exposed through IPC.

---

## Phase 1 — Rule extraction at import (Nemotron)

### AV-10 Rule schema and storage — M
- Define a structured rule: `{ id, sourceId, sourceVersion, kind (claim-forbidden | claim-approved | audience | date | time | asset | disclosure | required-text | procedure), task (email | linkedin | instagram | canva | operations | people | any), value, quote, line/page, status (proposed | approved | rejected | superseded), proposedBy (model | person), approvedBy, approvedAt }`.
- Store with the source in the workspace; rules of a superseded source become superseded automatically.
- Existing `Field requirement:` lines are parsed into the same schema so the hand-written Vamo rules keep working.
- **Acceptance:** `tests/workspace.test.js` covers migration of existing sources without changing their approvals or credentials.

### AV-11 Nemotron rule extraction — L
- After file-text consent in onboarding/import, send consented source text in chunks with a JSON schema; Nemotron returns candidate rules with `quote`.
- Validation: `quote` must occur exactly in the source text, kind/task must be valid enums, value length caps; failing candidates are dropped and counted.
- Offline fallback: the existing deterministic patterns.
- **Acceptance:** on the Vamo pack, rules found for brief v2, brand/legal and calendar include the price-guarantee ban, audience, footer, paid disclosure and both launch dates; nothing is extracted from files without consent; restricted files are never sent.

### AV-12 Rule review UI for admins/leads — M
- In Knowledge/Sources: list proposed rules grouped by source, each with its quote highlighted in context; Approve / Edit value / Reject with reason.
- Company-wide rules need admin; department rules follow the existing department lead permissions.
- **Acceptance:** a lead cannot approve a company-wide rule (test); only approved rules affect Review.

### AV-13 Review uses approved structured rules — M
- `localReview` in `task-review.js` reads approved rules instead of re-parsing text each time; findings cite rule → source → line.
- **Acceptance:** all existing task-review tests pass; a newly imported non-Vamo test company gets findings without any hand-written rule lines.

### AV-14 Cross-source conflict detection — M
- After extraction, compare approved/proposed rules across current sources. Deterministic comparison applies only to single-valued kinds (`audience`, `date`, `time`, `asset`, `disclosure` per task and campaign): different values are a candidate conflict. Additive kinds (`claim-forbidden`, `required-text`, `procedure`) never conflict just because values differ; only `claim-approved` vs `claim-forbidden` on the same claim is a candidate. Nemotron is only used to judge whether two differently worded claims contradict, with both quotes validated.
- A candidate conflict is a rule-level proposal and must not exclude whole sources from Review until an admin confirms it.
- Conflicts enter the existing conflict workflow; never auto-resolved.
- **Acceptance:** a seeded fixture where the calendar says 19:00 and brief v2 says 18:00 produces one conflict citing both lines; two different `claim-forbidden` rules in different sources produce no conflict and both stay active in Review.

---

## Phase 2 — Review agent

### AV-20 Agent loop `src/review-agent.js` — L
- Nemotron Super with tool calling (or JSON-action fallback from AV-01). Max steps (e.g. 6), max tokens, total timeout.
- Tools, all local and read-only:
  - `search_sources(query, task)` — approved, visible sources only (uses AV-41 when available, keyword search before).
  - `get_rules(task)` — approved rules from AV-10.
  - `compare_versions(sourceId)` — existing `source-review.js` compare.
  - `check_field(label, value)` — deterministic field check.
  - `propose_public_claims(texts)` — returns candidates; does **not** call Tavily (see AV-22).
- The agent never sees sources the person cannot see and never receives an owner ID from IPC.
- **Acceptance:** unit tests with a scripted fake model cover tool dispatch, step limit, invalid tool names, prompt-injection text inside work or sources (ignored as data), and fallback to `localReview` on any error.

### AV-21 Finding validation for agent output — M
- Reuse and extend current checks: observed excerpt must be in the observed text, source quote must be in an approved current source the person can see, suggestion length cap, dedupe with deterministic findings, deterministic findings always win on conflict.
- **Acceptance:** tests for each rejection reason; displayed findings never cite superseded or invisible sources.

### AV-22 Public claim extraction and confirmation — M
- Agent marks candidate public factual statements in the draft (dates of public events, platform rules, third-party facts). Internal facts (prices, internal dates, audiences) are excluded by rule and by a local filter against internal source text.
- The employee sees the list in the AV-04 gate, can untick or edit each one, and only confirmed claims go to Tavily.
- **Acceptance:** a draft containing an internal price and a public event date proposes only the public claim; nothing is sent without confirmation.

### AV-23 "Still true?" verification with Tavily — M
- For each confirmed claim: Tavily search (advanced, `include_answer`), top results passed to Nemotron with the claim; verdict `supported | contradicted | unclear`, with the result URLs and the exact snippet used.
- Validation: snippet must be in the returned Tavily content; otherwise verdict becomes `unclear`.
- Shown as a separate "Public check" section, visually distinct from approved company rules, with "public sources, not company approval" copy.
- **Acceptance:** mocked Tavily tests for each verdict; live check recorded in `docs/HANDOVER.md` with a synthetic claim.

### AV-24 Link check in drafts — S
- Detect `https://` links in observed text; after the AV-04 gate, Tavily Extract each page and check that approved values present in the draft (price, date, offer name) also appear on the page.
- **Acceptance:** fixture landing page with a different price produces a finding citing the page text and the approved rule.

### AV-25 Review UI: visible agent steps — M
- In Review, a collapsible "How Averill checked this" list: each tool step in plain language ("Read approved rules for LinkedIn", "Compared brief v1 with v2", "Checked 2 public claims with Tavily"). No raw prompts or chain-of-thought text.
- Labels per finding: Approved rule match / Nemotron suggestion · excerpts validated / Public check · Tavily.
- **Acceptance:** follows `travel-desktop/design-system/DESIGN_SYSTEM.md`; reduced-motion respected; works with AI off (shows only local steps).

### AV-26 Recheck after edit uses the agent result — S
- Existing recheck re-runs deterministic checks immediately and the agent only on request, so typing never triggers cloud calls.
- **Acceptance:** typing invalidation in the browser bridge still clears findings; no cloud call is made without an explicit action.

---

## Phase 3 — Public website vs approved sources

### AV-30 Public site as a source type — M
- Admin enters the company's public site URL in Setup. Pages become sources with status `public-unapproved`, department `company`, never usable as approval evidence.
- **Acceptance:** public pages never satisfy a rule or approve anything; they appear in Knowledge with a distinct badge.

### AV-31 Crawl with Tavily — M
- Tavily crawl/map + extract limited to the entered domain, page cap (e.g. 30), depth cap, HTTPS only, existing redirect checks. Re-run manually; store fetch time per page.
- For local demos, `travel-site/` served on a public test URL or loopback fixture for tests.
- **Acceptance:** mocked crawl test; refusing off-domain URLs; page cap enforced.

### AV-32 Site vs brief comparison — M
- For each approved rule, deterministic search of crawled pages first; Nemotron judges ambiguous cases with both quotes validated (page text and source text).
- Results go to the admin as "Public site disagrees with approved source" items, each with page URL, page quote, source quote.
- **Acceptance:** add one intentional mismatch to the Vamo site fixture (for example an old price or the v1 audience) and get exactly that finding.

### AV-33 Admin workflow for site findings — S
- Mark as fixed on site / approved source is wrong (opens existing source review) / ignore with reason. Re-crawl confirms "fixed".
- **Acceptance:** decisions are logged with actor and reason; non-admins cannot see the queue.

---

## Phase 4 — Knowledge

### AV-40 Local embedding index — L
- Chunk approved and visible sources (by paragraph, keep line/page); embed via Nebius (consented sources only); store vectors locally per workspace; re-embed on new version; delete with the source.
- Non-consented sources stay keyword-only.
- **Acceptance:** index rebuilds after import; removing a source removes its vectors; no vectors for restricted files.

### AV-41 Hybrid search — M
- Query embedding + keyword score; filter by role visibility, status, department before ranking. Used by Knowledge UI and by the agent `search_sources` tool.
- **Acceptance:** "can I promise the lowest price?" returns the price-guarantee rule without the word "price" being required in exactly that form; invisible sources are never returned (test).

### AV-42 Cited multi-source answers — M
- `workspace-answer.js`: Nemotron answers only from retrieved passages, returns claims each tied to a quote; every quote validated; unsupported sentences removed. "What changed from v1 to v2?" and "who approved X?" use structured data, not the model.
- If nothing supports an answer, offer the existing private clarification request.
- **Acceptance:** tests for quote validation, the no-answer path and offline keyword fallback.

### AV-43 Knowledge UI updates — S
- Show "Semantic match" vs "Keyword match", source version, approval and line for each passage.
- **Acceptance:** design-system tokens; no change for AI-off workspaces except labels.

---

## Phase 5 — Handover and Learn

### AV-50 Version briefing — M
- When a superseded document is opened, show "What you need to know": structured diff of rules (AV-10) between versions, plus an optional Nemotron summary whose every sentence cites both versions.
- **Acceptance:** brief v1 shows changed audience, claim, asset and date with citations; v1 and `winter-square-old.svg` stay untouched as fixtures.

### AV-51 Exercise generation from approved rules — M
- At import/approval time, with consent, Nemotron drafts practice items (spot the error, pick the approved value) from approved rules; each item stores the rule id and source version.
- Items are saved locally; Learn reads them offline.
- **Acceptance:** Learn works with network disabled; items from a superseded source are hidden.

### AV-52 Exercise review by leads — S
- Generated items are proposals until a lead/admin approves them.
- **Acceptance:** employees see only approved items.

### AV-53 Practice from real findings — S
- A Review finding can start a practice item bound to the same rule (extends the existing person-owned practice exercise).
- **Acceptance:** records stay with the active person; no other person's history is exposed.

---

## Phase 6 — Source freshness

### AV-60 External dependency marking — S
- Admin/lead can mark an approved rule as depending on an external public rule, with a short public query (for example "Instagram paid partnership label requirements") and optional domains.
- **Acceptance:** only public text is stored as the query; credential check applies.

### AV-61 Freshness check run — M
- Admin starts the run from Setup (manual; optional scheduled run only while the app is open and only if the admin enables it). Tavily search per dependency, Nemotron compares results with the rule quote.
- Output: `still consistent | may be outdated | unclear`, with URLs and snippets validated against Tavily content.
- **Acceptance:** mocked tests; no run without admin action/enablement; nothing is sent beyond the stored public queries.

### AV-62 Freshness queue — S
- "May be outdated" items go to the existing source review with links; never change approval status automatically.
- **Acceptance:** approval status unchanged after a run (test).

### AV-63 Freshness indicator — S
- Rules show "last checked against public sources on …" when a run happened.
- **Acceptance:** no indicator for rules without dependencies.

---

## Phase 7 — Documentation and release

### AV-70 Confidentiality and cloud docs — S
- Update `docs/COMPANY_CONFIDENTIALITY.md` and `docs/CLOUD_CONNECTIONS.md`: what each feature sends to Nebius/Tavily, when, and under which consent. Provider NDA/retention remain unverified.

### AV-71 AGENTS.md / PROJECT.md / ARCHITECTURE.md / HANDOVER.md — S
- Describe the new behavior accurately after each phase lands, including the agent loop limits, public-site sources and freshness checks. Remove "planned" status only for verified tickets.

### AV-72 Verification scripts — M
- `verify:nebius` covers extraction, agent loop and embeddings on synthetic data; new `verify:tavily` covers search, extract, crawl and the outbound guard on synthetic public queries. No keys printed, no user data written to the repo.

### AV-73 Release — S
- Package, run `npm test` plus the verify scripts, publish a new preview release with release notes listing what was verified live.

---

## Suggested order for the next two weeks

1. Days 1–2: AV-01, AV-02, AV-03, AV-04.
2. Days 3–5: AV-10, AV-11, AV-12, AV-13.
3. Days 6–8: AV-20, AV-21, AV-22, AV-23, AV-25.
4. Days 9–10: AV-30, AV-31, AV-32.
5. Days 11–12: AV-40, AV-41, AV-42, AV-50.
6. Day 13: AV-70 – AV-73.

Stretch if time remains: AV-14, AV-24, AV-33, AV-43, AV-51 – AV-53, Phase 6.
