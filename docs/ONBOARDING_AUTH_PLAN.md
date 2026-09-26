# Company file onboarding and employee accounts

26 September 2026. Owner request: import existing Excel/PDF/SVG/company documents, let Nebius structure unclear content, and demonstrate separate owner/admin, Marketing manager, Marketing strategy employee and Content creator logins. Preserve English product content and the current design system.

## Delivery sequence

1. Read Excel (.xlsx), CSV, PDF and SVG with source provenance. Provide a mixed-format synthetic Elseweek intake folder, including a roster with real demo email addresses at the reserved `.example` domain. Preserve the older manual pack.
2. Admin uploads files in one selection. Extract readable text locally. Parse clear roster rows deterministically; explicit Nebius analysis proposes people, company context and document department/scope/version. File text is data, never instructions. Every proposed person cites its source and evidence. Show unreadable, truncated, uncertain and duplicate entries rather than inventing data.
3. Review screen lets the admin edit/exclude people and document assignments, confirm company context, choose approval and create accounts in bulk. Company-wide brand sources become a real company visibility scope. Roster files remain private to admin; do not expose personnel records as employee knowledge.
4. Add separate account identity and job profiles. Marketing manager maps to lead; strategist/content creator map to separate employees; owner/admin is configured by the person creating the company, never inferred from an imported file. Implemented scope: separate local email/password accounts on the demo Mac. Online multi-device accounts remain outside this delivery. No emails/invitations are sent by this prototype.
5. Verify parsing/provenance, duplicate protection, approval/privacy, login permissions, Learn ownership, sign-out and restart. Rebuild unsigned app/ZIP, update handover/tutorial and commit/push the delivered change.

## Onboarding UI

First visit: owner account/company. Setup after login: Add company files → local extraction preview → optional clearly disclosed Send extracted text to Nebius → review people/documents → Apply onboarding. Edit drafts in place, preserve drafts while analysis runs, offer retry and direct completion if offline. Advanced manual import remains available. Employees see their profile and sign out; managers approve their department sources. Account credentials are never sent to Nebius or placed in imported documents.

## Delivered and verified

Mixed-format intake, local XLSX/CSV parsing, PDF extraction/OCR, SVG text extraction, explicit Nebius proposal with evidence, review/apply with duplicate exclusion and rollback, real company source visibility, bulk local credentials and four profiles are implemented. Existing workspaces can enable owner login; existing people can receive accounts. Separate live Nebius checks passed for mixed files and three people extracted from unstructured prose using `nvidia/nemotron-3-super-120b-a12b`. Automated native IPC/renderer checks passed for all four profiles and restart; the file chooser was stubbed. Eighteen Node tests pass. ExcelJS uuid dependency is pinned via override to a patched CommonJS-compatible version; npm audit reports zero vulnerabilities. See HANDOVER.md for exact final bundle verification.
