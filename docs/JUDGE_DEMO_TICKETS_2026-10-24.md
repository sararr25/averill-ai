# Judge demo tickets — 24 October 2026

Plan: [JUDGE_DEMO_PLAN_2026-10-24.md](JUDGE_DEMO_PLAN_2026-10-24.md). These are local tickets; they are not GitHub issues yet. Each ticket is done only when its acceptance list is met and verified by running the app or the tests, not by reading code.

Order: A and C first (no owner action needed), then B, then D.

## Index

| Key | Title | Block | Blocked by |
| --- | --- | --- | --- |
| JD-01 | Fix Learn › Start exercise | C | — |
| JD-02 | Fix the `el` ordering error in `semantic-ui.js` | C | — |
| JD-03 | Replace the Nebius dead-end wording in the demo | C | — |
| JD-04 | Realistic Brevo campaigns | A | — |
| JD-05 | Realistic LinkedIn and Instagram posts | A | — |
| JD-06 | Flaw matrix tied to approved rules, with tests | A | JD-04, JD-05 |
| JD-07 | Richer judge workspace: documents and role work | A | — |
| JD-08 | Guide framework (offer, "?" control, local progress) | B | — |
| JD-09 | Guide content per screen and role | B | JD-07, JD-08 |
| JD-10 | AI server for judges (Vercel) | D | owner steps JD-12 |
| JD-11 | App uses the server in the demo workspace only | D | JD-10 |
| JD-12 | Owner setup: Nebius cap, Vercel key, Upstash | D | — |
| JD-13 | Update `test-averill.md`, verify, release | all | JD-01 … JD-11 as shipped |

## JD-01 — Fix Learn › Start exercise
Reproduce in the running app on a clean demo profile first. Cause is unconfirmed (see plan, problem 2).
Accept:
- Clicking **Start exercise** shows the exercise card in view, with the first step visible.
- The status message names the exercise, not only "Saving learning activity: completed."
- A unit test covers `learning.startProject` with and without a source; `npm test` passes.
- Checked by clicking it in the packaged app.

## JD-02 — Fix `el` ordering in `semantic-ui.js`
`travel-desktop/src/semantic-ui.js:48` calls `el(...)` before `agent.js` defines it.
Accept: no `ReferenceError` in the console at startup; typing in the Knowledge search box triggers the semantic search; covered by an existing or new UI check.

## JD-03 — Replace the Nebius dead-end wording
`travel-desktop/src/agent.js` lines 424 and 516.
Accept: in the demo workspace nobody sees "Enable Nebius…". Until JD-11 ships, the text states plainly that AI review is not available in this build and that the approved-rules check applies. No silent fallback.

## JD-04 — Realistic Brevo campaigns
`demo-tools/social-simulator/src/services/brevo-campaigns.ts` and the Brevo page.
Accept: about 8 campaigns with realistic subject lines, bodies, segments, senders and statistics; at least three drafts with flaws from JD-06; existing `tests/brevo-schedule.test.ts` still passes; the page builds and renders on <https://averill-demo-sim.vercel.app/brevo> after deploy.

## JD-05 — Realistic LinkedIn and Instagram posts
`demo-tools/social-simulator/src/services/social-posts.ts` and the two pages.
Accept: posts with images, captions, comments and numbers; the paid Reel carries its disclosure rules; at least one flawed draft per platform.

## JD-06 — Flaw matrix tied to approved rules
A table in this folder maps every planted flaw to the approved source passage that catches it.
Accept: a test feeds each flawed draft through `src/contextual-review.js` with the judge workspace sources and asserts that the expected finding and citation appear; the corrected draft produces none.

## JD-07 — Richer judge workspace
`travel-desktop/src/judge-demo.js` and `travel-desktop/demo-company/vamo/`.
Accept: more approved documents for Marketing, Operations and People; Emma has a private note proposed and pending; Maya has a pending approval and a v1/v2 conflict; Alex sees roster, library and the website check; the existing guard stays (refuses when a workspace exists); `tests/judge-demo.test.js` extended.

## JD-08 — Guide framework
Accept: first-run offer "1-minute tour / Skip"; a "?" control on Work, Review, Learn, Library and Setup; progress stored locally per person and cleared with that person's data; keyboard accessible; no network calls; `verify:accessibility` still passes.

## JD-09 — Guide content
Accept: 2–3 steps per screen for each of Emma, Maya and Alex, in English, pointing at real controls; every step is checked in the running app; skipping works at every point.

## JD-10 — AI server for judges
New Vercel project, separate from the simulator.
Accept: fixed model and prompt; input cap; per-person and global daily limits; no key in the repository or the app; a limit response the app can show verbatim; tests for the limit logic; deployed only after the owner approves publishing.

## JD-11 — App uses the server in the demo workspace only
Accept: only when `demoAccounts` is true; consent prompt names the destination; a real workspace still uses its own key path; limit or outage shows the explicit message and the local check; checked end to end with a synthetic draft.

## JD-12 — Owner setup (owner action)
1. Set a monthly spend cap in the Nebius dashboard.
2. Put the Nebius key in the new Vercel project's environment variables (never in git).
3. Create the free Upstash Redis store from Vercel and connect it.
Accept: the owner confirms each step in chat.

## JD-13 — Guide, verification, release
Accept: `test-averill.md` updated (short and precise, kept separate from `docs/HANDOVER.md`); full test suite and checks green; each role clicked through on a clean profile; unzipped release tested; a new release only when the owner says so.
