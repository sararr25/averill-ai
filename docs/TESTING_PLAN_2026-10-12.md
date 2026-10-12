# Averill testing and review plan — 12 October 2026

Approved by the owner and published to GitHub using the to-tickets skill. Each ticket is a complete acceptance slice: inspect the employee flow, exercise it with synthetic data, fix reproduced defects and record evidence. Preserve normal accounts, approvals and secrets.

## Tickets and dependencies

| Ticket | Delivers | Blocked by | Current status |
| --- | --- | --- | --- |
| [#1](https://github.com/sararr25/averill-ai/issues/1) Verify release ZIP and app consistency | Acceptance criteria and evidence are in the linked ticket | None | Complete: local release integrity; clean-Mac install remains in final acceptance |
| [#2](https://github.com/sararr25/averill-ai/issues/2) Verify onboarding, roles and Knowledge | Acceptance criteria and evidence are in the linked ticket | None | In progress: chooser/roles/rejection/replacement/current-source lookup passed; counter fixed; real human Finder drop/extraction/pending-save/approval/reload passed; final-executable chooser open |
| [#3](https://github.com/sararr25/averill-ai/issues/3) Verify browser correction and Stop | Acceptance criteria and evidence are in the linked ticket | None | In progress: installed email correction/logout/person/private-label passed; remaining browser/social matrix open |
| [#4](https://github.com/sararr25/averill-ai/issues/4) Verify fake-editor persistence and structured fields | Acceptance criteria and evidence are in the linked ticket | None | Complete: supported local media/persistence/schedule acceptance |
| [#5](https://github.com/sararr25/averill-ai/issues/5) Verify Learn, weekly practice and restart | Acceptance criteria and evidence are in the linked ticket | None | In progress: native source-linked lesson/weekly feedback/exclusion/isolation passed; recovery-copy fix verified; manual Canva/finding/revocation UI and final executable open |
| [#6](https://github.com/sararr25/averill-ai/issues/6) Verify accessibility and motion | Acceptance criteria and evidence are in the linked ticket | None | In progress: native 207% zoom and dialog focus fix; VoiceOver/OS motion/profiling open |
| [#7](https://github.com/sararr25/averill-ai/issues/7) Verify permissions, full screen and displays | Acceptance criteria and evidence are in the linked ticket | #1 | In progress: main-app full screen/companion access; capture permissions/displays open |
| [#8](https://github.com/sararr25/averill-ai/issues/8) Reconcile documentation and optional integrations | Acceptance criteria and evidence are in the linked ticket | None | Complete: claims reconciled and local negative paths passed; optional live/provider/owner gates explicit |
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
