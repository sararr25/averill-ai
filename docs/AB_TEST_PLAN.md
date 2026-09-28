# A/B experiment: finding to practice

Prepared 28 September 2026 using the `ab-testing` skill. There is no live employee sample or baseline telemetry, so this document is a pre-registered plan and technical QA record, not a statistical winner claim.

## Hypothesis and one variable

Because the previous Review finding required a separate trip to Learn to record practice, showing an explicit **Practise this correction** action beside the finding should increase the share of eligible finding views that start a linked exercise. Control A: existing finding and source with navigation through Learn. Variant B: the same finding plus the contextual practice action. Keep all other UI and guidance identical while the experiment runs.

## Audience and allocation

Eligible signed-in employees with at least one supported shared-work finding. Assign 50/50 by a stable person/workspace hash so repeat visits retain the same variant. Do not enroll demo presenters, scripted profiles or employees without informed product research consent. No assignment or telemetry is enabled in the current build; enable only after the privacy and backend design is approved.

## Metrics and decision

- Primary: linked exercise starts / eligible finding views, deduplicated by person and finding within a session.
- Secondary: completed employee-confirmed exercise / starts; cited source openings / finding views; median time from finding to start.
- Guardrails: deterministic finding resolution rate, failed actions, unshared-work capture attempts and incorrect claims of visual verification. Stop for a material privacy or access regression.
- Analyze by randomized person, not individual clicks. Pre-register a full run window that includes weekdays and weekends; do not stop for a promising interim result. Check assignment balance and event quality before interpreting outcomes.

With a planning baseline of 10% and a minimum detectable rate of 15%, a two-sided 5% test with 80% power needs approximately **686 people per arm** before exclusions. This is an assumption for sizing, not an observed Averill baseline. Recalculate from a consenting pilot before launch. Given the local prototype's lack of eligible traffic, no valid A/B outcome can be reported now.

## Technical preflight performed

- Control behavior was documented in the previous audit and UX pass: users could read a finding/source and manually navigate to Learn, without a linked exercise action.
- Variant UI was opened in native Electron with an isolated synthetic owner. A flawed LinkedIn draft produced five findings; sharing revealed Explain, Copy, Practise and Recheck. Practise opened a finding-specific exercise with source and before/target context. Module tests cover ownership, current shared-finding validation, rule-clear vs employee confirmation, and source access.
- The preflight found two defects outside the assignment metric: a no-evidence question matched generic policy terms and produced an irrelevant citation, and Knowledge remained on Loading after an unrelated render. The retrieval stopword guard and Knowledge request counter were corrected. A restarted native app then showed zero citations for the unsupported question, saved and answered a private clarification, loaded three documents, and opened the line comparison. This is a regression check of both flows, not randomized user testing. Final bundle smoke is recorded in `HANDOVER.md`.

## Launch checklist

Before a real experiment: choose backend/consent mechanism; implement stable assignment and privacy-safe events; verify both variants on the final signed app; obtain a baseline; freeze copy and UI; register sample size/run window; recruit enough participants. Report n, conversion, effect, 95% confidence interval, guardrails and decision only after that run.
