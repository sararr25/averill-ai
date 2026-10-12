# Averill testing and review plan — 12 October 2026

Approved by the owner and published to GitHub using the to-tickets skill. Each ticket is a complete acceptance slice: inspect the employee flow, exercise it with synthetic data, fix reproduced defects and record evidence. Preserve normal accounts, approvals and secrets.

## Tickets and dependencies

| Ticket | Delivers | Blocked by | Current status |
| --- | --- | --- | --- |
| [#1](https://github.com/sararr25/averill-ai/issues/1) Verify release ZIP and app consistency | Acceptance criteria and evidence are in the linked ticket | None | Complete: local release integrity; clean-Mac install remains in final acceptance |
| [#2](https://github.com/sararr25/averill-ai/issues/2) Verify onboarding, roles and Knowledge | Acceptance criteria and evidence are in the linked ticket | None | Started: native intake/Knowledge regression; real chooser/role walkthrough open |
| [#3](https://github.com/sararr25/averill-ai/issues/3) Verify browser correction and Stop | Acceptance criteria and evidence are in the linked ticket | None | Started: synthetic-client and native OCR correction; installed-browser edge cases open |
| [#4](https://github.com/sararr25/averill-ai/issues/4) Verify fake-editor persistence and structured fields | Acceptance criteria and evidence are in the linked ticket | None | Complete: supported local media/persistence/schedule acceptance |
| [#5](https://github.com/sararr25/averill-ai/issues/5) Verify Learn, weekly practice and restart | Acceptance criteria and evidence are in the linked ticket | None | Started: offline source and release-resource rehearsal; manual practice walkthrough open |
| [#6](https://github.com/sararr25/averill-ai/issues/6) Verify accessibility and motion | Acceptance criteria and evidence are in the linked ticket | None | Started: layout/focus/emulated reduced motion; accessibility/profiling open |
| [#7](https://github.com/sararr25/averill-ai/issues/7) Verify permissions, full screen and displays | Acceptance criteria and evidence are in the linked ticket | #1 | Ready after #1; physical permissions/displays not tested |
| [#8](https://github.com/sararr25/averill-ai/issues/8) Reconcile documentation and optional integrations | Acceptance criteria and evidence are in the linked ticket | None | Started: stale claims corrected; external provider/rules gates open |
| [#9](https://github.com/sararr25/averill-ai/issues/9) Rehearse the complete packaged story | Acceptance criteria and evidence are in the linked ticket | #1, #2, #3, #4, #5, #6, #7 | Blocked by remaining #2–#7 acceptance |

## Execution order

1. Verify and restore release integrity; keep the already published ZIP unchanged.
2. Run local regression and isolated native onboarding/Knowledge, browser, review and Learn checks.
3. Use the canonical simulator in a separate local origin to verify image/text persistence, cancellation, previews and supported audience/schedule settings.
4. Finish installed-browser session/privacy cases, native chooser/roles and manual learning.
5. Finish keyboard/VoiceOver/200% zoom/OS reduced motion/profiling and physical permission/full-screen/display cases.
6. Rehearse the complete actual executable once its blockers pass; keep live AI/OAuth requests and owner submission declarations explicit.

## Evidence and limits

See [the short checklist](TESTING_CHECKLIST_2026-10-12.md). The browser checks used real Chrome at `http://127.0.0.1:5186` running the canonical simulator; synthetic posts remain local to that test origin. Native regressions used temporary profiles and synthetic material. No live provider request, real email or real post publication occurred.

A passing packaged-resource harness uses development Electron with extracted release resources. It does not establish clean-Mac installation or completion of the manual final-executable narrative. Ticket completion for #1 and #4 is limited to their recorded acceptance; #9 retains the full packaged-story gate.
