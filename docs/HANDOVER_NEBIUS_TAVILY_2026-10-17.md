# Handover — Nebius and Tavily integration, 17 October 2026

For the next session running **locally on the owner's Mac** (it can read `.env.local`). Read `AGENTS.md`, this file, `docs/NEBIUS_TAVILY_PLAN.md` and the table in `docs/COMPANY_CONFIDENTIALITY.md` before changing anything.

## Where things are

- Branch `claude/charming-johnson-rhezro`, PR https://github.com/sararr25/averill-ai/pull/21 (open, not merged). Commit `8d9e68e` and later.
- Everything in the plan is implemented (AV-02 – AV-72) and tested with **faked** network responses only. A cloud session built it with no API keys, so **no live Nebius or Tavily call has been made by any new feature**.
- Hackathon: Nebius x NVIDIA Global AI Hackathon, submissions close **30 October 2026, 10:00 PT**. The project must run on Nebius Token Factory with an NVIDIA open model (Nemotron). Best Use of Tavily needs real runtime use.

## New modules (all in `travel-desktop/`)

| File | Purpose |
| --- | --- |
| `src/nebius.js` | Only Nebius client: model discovery/cache, Nemotron and embedding selection, policy + credential gate, retry, `chat` (tools/JSON) and `embed` |
| `src/tavily.js` | Only Tavily client: `search`, `extract`, `crawl`, outbound guard (credentials, repeated internal text), public HTTPS host checks |
| `src/cloud-activity.js` | Per-person call log, no payloads; admin totals |
| `src/rules.js` + `src/rules-ui.js` | Structured rules, Nemotron extraction, lead/admin approval, conflicts |
| `src/review-agent.js` | Nemotron tool-calling review; falls back to `task-review.js` |
| `src/public-check.js` | Tavily check of confirmed public statements and linked pages |
| `src/public-site.js` + `src/public-site-ui.js` | Company website vs approved sources (Setup, admin) |
| `src/semantic-index.js` + `src/semantic-ui.js` | Local embedding index and search by meaning |
| `src/version-briefing.js`, `src/rule-exercises.js`, `src/practice-ui.js` | Handover briefing, Learn practice from approved rules |
| `src/source-freshness.js` | Admin-run check of rules that depend on public rules |
| `src/outbound-gate.js` | Confirmation dialog listing exactly what is sent |
| `scripts/nebius-capabilities.cjs` | `npm run probe:nebius` (AV-01) |
| `scripts/verify-cloud-ui.cjs` | `npm run verify:cloud-ui`, Electron smoke with faked network |

## Verified so far

- `npm test`: 76/77. The failing `XLSX onboarding bulk creates separate manager, strategist and creator accounts…` (expects version '2', gets '1') already failed on `main`; not caused by this work.
- `npm run verify:cloud-ui` passed in Electron on Linux (xvfb, `--disable-gpu`) with faked responses and no renderer errors.

## Do next, in order

1. **Setup.** `git fetch origin claude/charming-johnson-rhezro && git checkout claude/charming-johnson-rhezro`, then `cd travel-desktop && npm install`. Confirm `.env.local` (repo root) has `NEBIUS_API_KEY` and `TAVILY_API_KEY`. Never print, log or commit them. Do not touch the normal user-data workspace; use temporary profiles.
2. **AV-01 probe.** `npm run probe:nebius`. Record (without keys) in `docs/HANDOVER.md`: chosen Nemotron id, `toolCalling`, `jsonMode`, embedding model id and dimension.
   - If `toolCalling` is false, `review-agent.js` still works through the JSON reply path. Check that it really returns `mode: 'agent'`, and adapt `SYSTEM` if not.
   - If `jsonMode` errors, remove `response_format` for that model in `nebius.chat` (callers already parse JSON from text).
   - If no embedding model is listed, set `NEBIUS_EMBED_MODEL` to one Token Factory offers, or note that search by meaning stays off.
3. **Existing live smoke.** `npm run verify:nebius -- --synthetic-consent` must still pass (it now goes through `src/nebius.js`).
4. **Live check of each feature on synthetic or Vamo fixture text only.** Write a script `scripts/verify-live-cloud.cjs`, modeled on `verify-cloud-ui.cjs` but without the fetch stub. Run each once and save a receipt to `dist/` (counts, model ids, verdicts; no keys, no prompts):
   - rule extraction on `sources/brand-and-legal.md` → every candidate quote validates;
   - review agent on a draft containing "lowest prices guaranteed" → `mode: 'agent'`, steps recorded;
   - public check on a real public statement (e.g. a Copenhagen market opening date) → a validated verdict;
   - link check on a public page;
   - Tavily crawl of a real public HTTPS site you are allowed to read → pages returned (`/crawl` may need a plan that includes it; otherwise switch `crawl()` to `/map` + `/extract`);
   - semantic index build and a search;
   - handover briefing for brief v1 → v2 with Nemotron points;
   - practice drafts with Nemotron;
   - a freshness run.

   Fix what breaks: real response shapes may differ from the mocks, especially Tavily crawl/extract field names (`raw_content`), embedding `data[].index`, and tool-call `arguments`.
5. **Real app on the Mac.** `npm start`, isolated profile. Enable company AI, then run each feature through the UI: Knowledge rules, search by meaning, Setup › Public website, Review with Nemotron on a shared draft (browser field or window), public check, Learn practice. Check the outbound dialog text and layout at 440×660 and 960×820.
6. **Docs.** Replace "not verified" in `docs/HANDOVER.md`, `docs/NEBIUS_TAVILY_PLAN.md` (status table) and `devpost-submission.md` (NVIDIA model and Nebius use, Tavily runtime usage) with what was actually verified. Keep claims exact.
7. **PR.** Commit to the same branch and push. Keep PR #21 updated; reply to review comments.

## Still missing (not built)

- An intentional mismatch on the Vamo site (`travel-site/`), for example a stale "lowest prices guaranteed" line or the v1 audience on a winter page, so Setup › Public website has something real to find. It must use the Vamo design system only. To crawl it, it must be served on a public HTTPS URL.
- A scheduled freshness run (only the manual admin run exists).
- `src/assistant.js` (fixture demo answers) still calls Nebius with its own `fetch`. Move it to `src/nebius.js`.
- A live verify script for Tavily (step 4) and release packaging (AV-73) after live checks pass.
- The pre-existing XLSX onboarding test failure, a separate fix.

## Rules that must hold

- Tavily gets only text the employee confirmed or public HTTPS URLs; never drafts, internal source text or personnel data.
- Nebius gets only consented, non-restricted sources while company AI is on.
- Model output is always a proposal validated against exact quotes. Approvals stay human, and source status never changes automatically.
- Deterministic offline fallbacks stay. Learn practice works offline once approved.
