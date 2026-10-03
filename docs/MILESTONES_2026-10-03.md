# Follow-up milestones — 3 October 2026

The owner requested points 1–5 in order, with one commit and GitHub push after each completed milestone. This is the current execution ledger; historical evidence in other documents does not establish new acceptance.

| Point | Scope | Status |
| --- | --- | --- |
| 1 | Release consistency, current docs, app/ZIP verification and GitHub synchronization | Complete — pushed 00282cc |
| 2 | Coherent Vamo source/fixture pack and current People guidance | Complete — 44/44 regressions pass |
| 3 | A real external email draft correction loop | Pending |
| 4 | Field-aware observation and broader task requirements | Pending |
| 5 | Canva/AI rehearsal, event requirements and submission preparation | Pending |

## Point 1

Added package:release and verify:release. Release verification checks tracked desktop files, both native helpers and complete extracted archive equality; generated binaries and release evidence stay ignored. The audit passed 44/44 tests, native feedback/external/task-review smoke and packaged-resource feedback. Final executable/platform/device acceptance remains separate.

Release build passed: 107 tracked runtime source files, both native helpers and 3,096 extracted ZIP entries match. SHA-256: `10b100fce8b4c6cf5ab007addb4dfe61344f852ec7fa0ff628efbb02d6229c89`. Development package metadata is intentionally pruned; runtime identity/dependencies are compared separately.

## Point 2

Shipped sources, new accounts, XLSX/PDF/SVG intake and current artwork use Vamo. People and brand guides are v2. Historical brief/artwork remain unchanged. New person-owned drafts use vamo:v2. No normal-profile credentials, copied approvals or old draft storage were rewritten. See DEMO_MIGRATION.md for explicit fresh/imported-workspace paths.

Point 2 regression suite: 44/44. Current source SVG/PDF/XLSX documents extract with Vamo identity; the native task-review check is rerun before commit.

Point 2 native task-review passed. App/ZIP release passed with 107 source files, both helpers and 3,096 archive entries. Current archive SHA-256: `f83989b24f775a45f9334f29090e62cce18ff4a58ca0d358c1c0619207d722c3`.
