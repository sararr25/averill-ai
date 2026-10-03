# Follow-up milestones — 3 October 2026

The owner requested points 1–5 in order, with one commit and GitHub push after each completed milestone. This is the current execution ledger; historical evidence in other documents does not establish new acceptance.

| Point | Scope | Status |
| --- | --- | --- |
| 1 | Release consistency, current docs, app/ZIP verification and GitHub synchronization | Complete; commit/push follows |
| 2 | Coherent Vamo source/fixture pack and current People guidance | Pending |
| 3 | A real external email draft correction loop | Pending |
| 4 | Field-aware observation and broader task requirements | Pending |
| 5 | Canva/AI rehearsal, event requirements and submission preparation | Pending |

## Point 1

Added package:release and verify:release. Release verification checks tracked desktop files, both native helpers and complete extracted archive equality; generated binaries and release evidence stay ignored. The audit passed 44/44 tests, native feedback/external/task-review smoke and packaged-resource feedback. Final executable/platform/device acceptance remains separate.

Release build passed: 107 tracked runtime source files, both native helpers and 3,096 extracted ZIP entries match. SHA-256: `10b100fce8b4c6cf5ab007addb4dfe61344f852ec7fa0ff628efbb02d6229c89`. Development package metadata is intentionally pruned; runtime identity/dependencies are compared separately.
