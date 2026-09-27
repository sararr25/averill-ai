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

Mixed-format intake, local XLSX/CSV parsing, PDF extraction/OCR, SVG text extraction, explicit Nebius proposal with evidence, review/apply with duplicate exclusion and rollback, real company source visibility, bulk local credentials and four profiles are implemented. Existing workspaces can enable owner login; existing people can receive accounts. Separate live Nebius checks passed for mixed files and three people extracted from unstructured prose using `nvidia/nemotron-3-super-120b-a12b`. Automated native IPC/renderer checks passed for all four profiles and restart; the file chooser was stubbed. Nineteen Node tests pass, including four login documents persisted across reload. ExcelJS uuid dependency is pinned via override to a patched CommonJS-compatible version; npm audit reports zero vulnerabilities. See HANDOVER.md for exact final bundle verification.

Owner and generated passwords now receive separate local Markdown documents under userData/Averill-login-documents, as explicitly requested. Account access → Open login documents requires an authenticated administrator. These files stay outside imported sources and Nebius. No existing account password is reconstructed or reset.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

## Multisource onboarding update — 27 September 2026

Desktop/Finder drop, local/synced files, HTTPS links and Google Drive/OneDrive selected-file OAuth import now feed the local review. Direct cloud use requires registered OAuth clients and remains live-unverified. Company AI defaults off; owner authorization and per-file selection are required. Restricted files are blocked. Local company copies are not application-encrypted; provider confidentiality/no-training/retention settings remain unverified. See [cloud setup](CLOUD_CONNECTIONS.md), [company confidentiality](COMPANY_CONFIDENTIALITY.md) and [handover](HANDOVER.md) for implementation, verification and remaining gates.
