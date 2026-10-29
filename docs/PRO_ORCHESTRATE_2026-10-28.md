# Plan-Orchestrate Result

**Plan**: `docs/PRO_PLAN_2026-10-28.md`
**Steps**: 11
**Scope**: all
**Emitted**: 10 · **Blocked**: 1

Generated on 28 October 2026 using `ecc:plan-orchestrate`. Commands are reviewable output only; none were executed. Command Usage forms were checked against the installed ECC command files. The global delivery exclusions remain in the plan; no step-specific Out of scope clause was invented. Run in the Averill repository and respect dependencies; the batch is a pasteable catalogue, not a parallel execution instruction.

## Steps overview

| # | Title | Tags | Command | Status |
| --- | --- | --- | --- | --- |
| 1 | Fix sentence-breaking corrections | fix | `/orch-fix-defect` | emitted |
| 2 | Change marketing drafts to meaningful supported copy | change | `/orch-change-feature` | emitted |
| 3 | Add a task and evidence router | impl | `/orch-add-feature` | emitted |
| 4 | Change the default assistant experience | change | `/orch-change-feature` | emitted |
| 5 | Fix Canva carousel and connection trust | fix | `/orch-fix-defect` | emitted |
| 6 | Add contextual Canva functional tutoring | impl | `/orch-add-feature` | emitted |
| 7 | Change practice to reflect work actually learned | change | `/orch-change-feature` | emitted |
| 8 | Add explicit social and email workflow adapters | impl | `/orch-add-feature` | emitted |
| 9 | Add role playbooks and an Operations pilot | impl | `/orch-add-feature` | emitted |
| 10 | Test the complete employee journey on real surfaces | test | `/test-coverage` | BLOCKED — cannot carry plan scope |
| 11 | Design the enterprise foundation and broader rollout | design | `/plan` | emitted |

---

## Step 1 — Fix sentence-breaking corrections

**Intent:** Show the offending excerpt and why it is wrong before suggesting a complete sentence. Replace fragment deletion with a sentence-level local safe alternative when grounded; if no coherent replacement is available, explain and offer manual editing without a destructive patch. Nemotron may propose a structured `{before, after, evidence}` rewrite through the existing consented client. Require exact unique span, bounded output, supported factual claims, current authority and current field revision. A rewrite is editorial; citations support its factual inputs, not a false claim of deterministic grammatical proof.

**Tags:** fix

**Command rationale:** Existing incorrect behaviour needs a reproduced defect and regression criteria.

```text
/orch-fix-defect "[Plan: docs/PRO_PLAN_2026-10-28.md#step-1] Fix corrections that delete a forbidden fragment and leave a dangling sentence. Explain the issue, then offer a grounded complete-sentence local or Nemotron rewrite. Acceptance: preserve surrounding text and footer; reject ambiguous or stale patches; preview/apply/undo only on accepted adapters."
```

## Step 2 — Change marketing drafts to meaningful supported copy

**Intent:** Use the clean reference in the research document as a starting point. Provide a truthful clean email and a distinct intentional-error exercise draft. Explain intentional flaws in developer/judge material, not as misleading approved content. Judge commercial quality in the rendered preview, not just JSON length.

**Tags:** change

**Command rationale:** An existing feature must satisfy the new desired behaviour and acceptance criteria.

```text
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-2] Change the clean Vamo marketing email and retain a separate intentional-error exercise draft. Acceptance: meaningful main body has at least 200 characters excluding subject/footer/URL; offer claims trace to approved evidence; editable body and rendered preview agree with a visible unsubscribe control."
```

## Step 3 — Add a task and evidence router

**Intent:** Add typed intents and an evidence envelope with origin, source/version or public URL, retrieved time, person/task binding and verification status. A tool question should not fall through to a vaguely matching company-file passage. Use Nemotron for contextual explanation, drafting and reasoning. Reuse existing privacy checks and source authorization. Public documentation may describe steps but cannot authorize company offers or actions. Treat retrieved pages and shared content as untrusted data.

**Tags:** impl

**Command rationale:** The step adds a concrete capability; its privacy and verification requirements travel with the task.

```text
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-3] Add typed routing for company policy, tool help, rewriting and mixed requests using the existing Nebius/Tavily clients. Acceptance: task-specific answers separate public guidance from approved facts; offline and permission failures remain useful; live synthetic requests prove bounded calls and provenance."
```

## Step 4 — Change the default assistant experience

**Intent:** Lead with current tool/task and a single conversational entry. Offer context-relevant actions such as Explain the issue, Improve this and Show me how. Keep the sharing state and Stop visible. Distinguish “connected”, “waiting”, “checked” and “cannot read”; do not require users to select an AI engine. Keep setup/recovery and source administration secondary. Show an inline preview before implementing substantial visual changes; previews stay outside the repository as previously requested.

**Tags:** change

**Command rationale:** An existing feature must satisfy the new desired behaviour and acceptance criteria.

```text
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-4] Change Current work and the browser card to lead with the task and one conversational help entry. Acceptance: help and Stop are reachable within three actions after connection; typing causes no repeated interruptions; keyboard, zoom and light/dark flows preserve focus and controls."
```

## Step 5 — Fix Canva carousel and connection trust

**Intent:** Reproduce the latest live failure before assigning a cause. Expose the connected extension protocol/build in diagnostics and detect an incompatible copy without auto-installing or granting permissions. Bind accumulated checks to person/session/tab/origin/design identity and slide revision; opening a new design must not inherit another design's clean state. Reconcile the missing slide identifier through the live transport.

**Tags:** fix

**Command rationale:** Existing incorrect behaviour needs a reproduced defect and regression criteria.

```text
/orch-fix-defect "[Plan: docs/PRO_PLAN_2026-10-28.md#step-5] Fix the live Canva carousel aggregate that reports clean slides despite earlier unresolved findings. Acceptance: real five-slide flow shows Checked X of 5 and preserves blockers; unknown/stale/new-design readings never yield all-clear; verify fix rechecks, override acknowledgement and Stop cleanup."
```

## Step 6 — Add contextual Canva functional tutoring

**Intent:** Tavily retrieves official public Canva instructions from a minimal generic query such as “Canva group elements desktop”. Nemotron combines those instructions with the bounded observed task to explain the next action. Cover text, font/size, positioning/alignment, margins, grouping, images and human-run export preparation. Ask the smallest useful clarifying question when controls/version cannot be identified. Offer “I cannot find this” and refresh the official procedure. Reuse validated public help from a dated cache for outages; do not embed all product expertise as static rules.

**Tags:** impl

**Command rationale:** The step adds a concrete capability; its privacy and verification requirements travel with the task.

```text
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-6] Add Canva functional tutoring with official public help retrieved through Tavily and contextual Nemotron explanations. Acceptance: unscripted grouping help works without company rules; only fresh observable edits tick automatically; public-only queries, dated cache and outage guidance pass real-tool scenarios."
```

## Step 7 — Change practice to reflect work actually learned

**Intent:** Separate visual knowledge questions from practical tool tasks. A quiz should assess the skills the employee actually practised, using local visual assets and verified answer keys. Never add an unrelated Canva question merely to fill four formats. If too little relevant evidence exists, show a shorter quiz or offer a clearly labelled optional foundation lesson. Add role/tool/skill and evidence freshness to personal events; schema changes require backwards-compatible migration. Show an inline mockup of three question types in light/dark before implementation.

**Tags:** change

**Command rationale:** An existing feature must satisfy the new desired behaviour and acceptance criteria.

```text
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-7] Change weekly practice to assess skills the person actually used, preserving offline Learn. Acceptance: email-only work produces no unrelated Canva filler; visual questions use one submit and wrong-only retry; personal evidence, source invalidation and legacy history remain safe. Show three question mockups first."
```

## Step 8 — Add explicit social and email workflow adapters

**Intent:** Define support per surface and capability: read, explain, rewrite, preview, apply/undo, practical verification, and publication. Start with complete simulator flows, then validate real-platform draft editors individually using designated test drafts. Unsupported editors still get copy/manual guidance. Use official current help for functional questions and channel specifications; an organic LinkedIn draft must not inherit paid Instagram disclosure rules.

**Tags:** impl

**Command rationale:** The step adds a concrete capability; its privacy and verification requirements travel with the task.

```text
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-8] Add explicit Brevo, LinkedIn and Instagram draft adapter capability contracts and connected exercises. Acceptance: simulator and real-platform evidence are separate; checks use matching observed fields only; help/improve/recheck and failure recovery work per accepted adapter without sending or publishing."
```

## Step 9 — Add role playbooks and an Operations pilot

**Intent:** Define configurable role playbooks: goals, typical tasks, relevant sources, supported tools, allowed action level and learning skills. Ship content creator, strategist and marketing lead task entries using existing workflows. Then add one Operations handover-to-checklist pilot using its own approved source and manually shared context, without a new external application integration. Persist project continuity separately from permissions and assessment scores.

**Tags:** impl

**Command rationale:** The step adds a concrete capability; its privacy and verification requirements travel with the task.

```text
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-9] Add task playbooks for content creator, strategist and marketing lead, followed by one Operations handover-to-checklist pilot. Acceptance: role entries produce practical outcomes; Operations output cites its own approved evidence; role selection never expands permissions or exposes private quiz performance."
```

## Step 10 — Test the complete employee journey on real surfaces (blocked)

**Intent:** Run the packaged employee journeys, live providers, real-platform drafts and accessibility gates defined in the plan.

**Tags:** test

**Command rationale:** `/test-coverage` accepts no step-scoped task argument and does not substitute for manual real-surface acceptance. Keep this gate attached to step 10 in the acceptance ledger.

```text
BLOCKED — /test-coverage cannot carry plan scope; run manually if wanted: /test-coverage
```

## Step 11 — Design the enterprise foundation and broader rollout

**Intent:** Produce a separate implementation RFC for tenant isolation, cloud identity/SSO, connector authorization and revocation, encrypted storage, retention/deletion, audit trail, signed updates and observability. Extend department discovery beyond Operations only after identifying real tasks, data and owners. Define action-specific approvals and recovery for any future sending/publishing; current delivery stays advisory. Resolve an official Canva integration's account availability, read capabilities, review/distribution path and adapter migration cost before choosing it.

**Tags:** design

**Command rationale:** This is a separate architecture decision, not authorization to implement enterprise infrastructure.

```text
/plan "[Plan: docs/PRO_PLAN_2026-10-28.md#step-11] Design a separate enterprise RFC after employee-pilot acceptance, covering tenant isolation, identity, connector permissions, retention, signed updates and official Canva feasibility. Acceptance: data-flow and rollout/rollback are explicit; Canva has a bounded go/no-go; each department has a workflow and evaluation owner."
```

## Blocked manual gate

Step 10: `BLOCKED — /test-coverage cannot carry plan scope; run manually if wanted: /test-coverage`.
The employee journey gate still requires the exact real-surface checks in the plan. This routing limitation is not a product blocker or a reason to skip acceptance.

## Batch execution

These commands are not run by this document. Delivery starts with steps 1, 2 and 5; preserve the dependency order specified in the plan when selecting commands. Step 11 is deferred until the pilot evidence exists.

```text
/orch-fix-defect "[Plan: docs/PRO_PLAN_2026-10-28.md#step-1] Fix corrections that delete a forbidden fragment and leave a dangling sentence. Explain the issue, then offer a grounded complete-sentence local or Nemotron rewrite. Acceptance: preserve surrounding text and footer; reject ambiguous or stale patches; preview/apply/undo only on accepted adapters."
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-2] Change the clean Vamo marketing email and retain a separate intentional-error exercise draft. Acceptance: meaningful main body has at least 200 characters excluding subject/footer/URL; offer claims trace to approved evidence; editable body and rendered preview agree with a visible unsubscribe control."
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-3] Add typed routing for company policy, tool help, rewriting and mixed requests using the existing Nebius/Tavily clients. Acceptance: task-specific answers separate public guidance from approved facts; offline and permission failures remain useful; live synthetic requests prove bounded calls and provenance."
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-4] Change Current work and the browser card to lead with the task and one conversational help entry. Acceptance: help and Stop are reachable within three actions after connection; typing causes no repeated interruptions; keyboard, zoom and light/dark flows preserve focus and controls."
/orch-fix-defect "[Plan: docs/PRO_PLAN_2026-10-28.md#step-5] Fix the live Canva carousel aggregate that reports clean slides despite earlier unresolved findings. Acceptance: real five-slide flow shows Checked X of 5 and preserves blockers; unknown/stale/new-design readings never yield all-clear; verify fix rechecks, override acknowledgement and Stop cleanup."
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-6] Add Canva functional tutoring with official public help retrieved through Tavily and contextual Nemotron explanations. Acceptance: unscripted grouping help works without company rules; only fresh observable edits tick automatically; public-only queries, dated cache and outage guidance pass real-tool scenarios."
/orch-change-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-7] Change weekly practice to assess skills the person actually used, preserving offline Learn. Acceptance: email-only work produces no unrelated Canva filler; visual questions use one submit and wrong-only retry; personal evidence, source invalidation and legacy history remain safe. Show three question mockups first."
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-8] Add explicit Brevo, LinkedIn and Instagram draft adapter capability contracts and connected exercises. Acceptance: simulator and real-platform evidence are separate; checks use matching observed fields only; help/improve/recheck and failure recovery work per accepted adapter without sending or publishing."
/orch-add-feature "[Plan: docs/PRO_PLAN_2026-10-28.md#step-9] Add task playbooks for content creator, strategist and marketing lead, followed by one Operations handover-to-checklist pilot. Acceptance: role entries produce practical outcomes; Operations output cites its own approved evidence; role selection never expands permissions or exposes private quiz performance."
/plan "[Plan: docs/PRO_PLAN_2026-10-28.md#step-11] Design a separate enterprise RFC after employee-pilot acceptance, covering tenant isolation, identity, connector permissions, retention, signed updates and official Canva feasibility. Acceptance: data-flow and rollout/rollback are explicit; Canva has a bounded go/no-go; each department has a workflow and evaluation owner."
```
