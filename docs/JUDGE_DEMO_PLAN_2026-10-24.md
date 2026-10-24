# Judge demo — design and decisions (24 October 2026)

Status: approved by the owner in chat on 24 October 2026. Nothing in this document is implemented yet. Tickets: [JUDGE_DEMO_TICKETS_2026-10-24.md](JUDGE_DEMO_TICKETS_2026-10-24.md).

## Goal

A judge opens Averill and feels they work at Vamo: as an employee (Emma), the Marketing lead (Maya) or the owner (Alex). The company must look alive, the drafts must look like real work with realistic mistakes, the app must teach itself in context, and the NVIDIA part must work without the judge owning any key. The owner and the judges use the same app: `Averill.app`, release `v0.1.0-judge.20261024` or later, and the hosted simulator <https://averill-demo-sim.vercel.app>.

## Problems the owner reported

1. **"Enable Nebius, then choose Review text for a source-backed comparison."** Judges have no API key, so the AI path is a dead end. Source: `travel-desktop/src/agent.js` lines 424 and 516.
2. **Learn › Start exercise does nothing.** The only feedback is "Saving learning activity: completed." The form is in `travel-desktop/src/learning-ui.js` (task-based exercise, `learnAction('project-start', …)`). Suspected cause, not yet reproduced: the exercise starts but its card renders lower in the panel with no scroll or message. Reproduce first, then fix.
3. **The Brevo, LinkedIn and Instagram drafts are too basic.** The simulator pages are 23–55 lines each and the drafts live in `demo-tools/social-simulator/src/services/` (`brevo-campaigns.ts`, `social-posts.ts`).

A further bug seen in the app log while testing: `Uncaught ReferenceError: el is not defined` at `travel-desktop/src/semantic-ui.js:48`. `semantic-ui.js` loads before `agent.js`, which defines `el`, so the Knowledge search box never gets its input listener. It predates this work (commit `6e166f5`). It is ticket JD-02.

## Decisions

| Question | Decision |
| --- | --- |
| How do judges get NVIDIA Nemotron without keys? | A small server owned by the owner holds the Nebius key and answers judges live. |
| What happens when the daily limit is reached or the server is unreachable? | An explicit message, for example "Daily AI limit reached. The approved-rules check still works." No hidden fallback and no fake answer. |
| Shape of the demo | Free exploration plus an in-app guide that changes with the screen and the signed-in role. The guide can be skipped at any time. |
| Order of work | First the zero-cost blocks (Vamo world, in-app guide, bug fixes), then the AI server. |

## Design

### Block A — A believable Vamo
- **Brevo:** about 8 campaigns with real-looking bodies, segments, senders and statistics. At least three are drafts with realistic, subtle flaws.
- **LinkedIn and Instagram:** posts with images, captions, comments and numbers, plus a paid Reel with its disclosure rules.
- **Flaws tied to approved rules:** each flaw must be caught by an approved source, so the finding cites a real passage. Candidates: "lowest prices guaranteed", launch email sent to the full list instead of the Denmark segment, missing Vamo footer, wrong campaign date, missing paid-partnership disclosure, claim from the superseded v1 brief, destination not in the brief.
- **Company library:** more approved documents for Marketing, Operations and People in the judge workspace, so Knowledge and Learn have substance.
- **Work for every role:** Emma has drafts to check and a private note to propose. Maya has Emma's pending proposal to approve and a version conflict (v1 against v2). Alex sees the whole company, the people roster and the public-website check (`https://vamo-travel-site.vercel.app/winter.html`).
- Fictional people, products and numbers only. The Vamo brand stays independent from the Averill brand (see `AGENTS.md`).

### Block B — In-app guide
- On the first screen after "Try the demo": "1-minute tour / Skip".
- A small "?" control on every main screen (Work, Review, Learn, Library, Setup). It opens 2–3 steps that fit the screen and the signed-in role, and points at the real controls.
- Progress is stored locally per person (same scope rule as Learn history). It never contacts the network. Copy is English.
- It must be keyboard accessible and not trap focus.

### Block C — Fixes
- Learn › Start exercise: reproduce, fix, and show the exercise card in view with a message that names the exercise.
- Remove the dead-end Nebius wording from the demo (interim text until Block D ships; see JD-03).
- Fix the `el` ordering bug in `semantic-ui.js`.

### Block D — AI server for judges
- A serverless function (Vercel, separate project) receives a bounded review request, calls Nebius with the owner's key and returns structured findings. The existing validation against exact quotes stays in the app, so model output remains a proposal.
- Guardrails: fixed model and fixed system prompt; input capped at about 4,000 characters; per-person and global daily limits; no tools, no browsing, no history; the key exists only as a Vercel environment variable.
- The app uses the server only when the workspace is marked `demoAccounts`. Real workspaces keep the local-key path. The existing consent prompt stays and names the server as the destination.
- Rate-limit counters need a small store. Upstash Redis (free tier) via Vercel is the proposed choice; it needs the owner's account.
- The owner must set a monthly spend cap in the Nebius dashboard. This cannot be done from code.
- Risks: abuse of a public endpoint, spend, and text leaving the Mac. Mitigation: limits above, synthetic demo text only, consent before the first call.

## Out of scope
Signed or notarised distribution, Windows or Intel Macs, replacing the extension step with an in-app sample editor (noted in the handover as an alternative), renaming the demo company.

## Verification required before any release
`npm test` in `travel-desktop/`; the Electron end-to-end and accessibility checks already in `package.json`; a real click-through of each role on a clean profile; the unzipped release on a profile with no workspace. A release is created only when the owner says so.
