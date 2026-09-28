# Added capabilities and company-readiness gates

Updated 28 September 2026. This is the implementation ledger for section “What I would add” in the UI/UX/functionality audit. `docs/HANDOVER.md` remains the operational entry point.

## Work to learning

| Requested capability | Current behavior and verification boundary |
| --- | --- |
| Explain and practise from a finding | Review and Work findings offer Explain, Copy correction, Practise and Recheck. Practise creates a person-owned record tied to the finding ID, work kind and supplied source. The main process revalidates that the finding is current and shared. |
| Outcome-based exercises | Learn includes composition, LinkedIn visual and newsletter export projects. Each has three ordered steps, optional approved company source/version or a supplied demo source, notes and employee confirmation. The app does not verify Canva geometry, the exported file or publication. |
| Contextual free question and one capture | Learn answers free questions only from its offline selection/Position/alignment/grouping lesson. With an explicitly selected Canva window, the employee can request one OCR capture; extracted text is shown locally. OCR does not assess layout or control Canva. |
| Copy, before/after and recheck | Copy uses the current deterministic finding, not editable renderer text. The finding exercise shows the original problem and target, records the employee's description and stores whether the supported rule cleared, remained or could not be checked. A separate Recheck action refreshes the current shared fields. |

## Company knowledge

| Requested capability | Current behavior and verification boundary |
| --- | --- |
| Passage-level evidence | Local answers show an exact matching line. Newly extracted PDFs include page markers; older imported PDFs need reimport for page numbers. Citations include source version, approval date, approver, line/page when available, and why the passage matched. Optional Nebius answers are accepted only when the answer is an exact substring of a verified quoted passage; otherwise local extraction is returned. This is extractive validation, not semantic claim verification. |
| Real version comparison | Knowledge can show a bounded line-level diff of two visible documents in the same scope and department. A reviewer can explicitly link a new approved file to the approved file it replaces, even when titles differ; the old one becomes superseded. Similarity/conflict detection remains title/hash based until a reviewer makes the link. |
| Approval queue and clarification | Lead/admin reviewers can approve, reject or request clarification with a reason. A missing-evidence company answer can create a local private question visible to its requester and authorised reviewer; the reply can link an approved source visible to the requester. No email or external message is sent. |
| Global search and filters | Knowledge searches visible extracted text/title and filters by status, department, uploaded/saved type and conflicts. Extracted text and the stored original remain separate actions. |

## Accounts, data and distribution

| Requested capability | Current behavior and remaining gate |
| --- | --- |
| Revoke and recover access | Admin can disable a different non-owner local account and reset its password with a new local login document. A signed-in person can change their own password. Disabled accounts fail the next authentication. The owner's saved login document is still the recovery route; no remote identity proof or invitation delivery exists. |
| Invitation and multi-device sync | Account creation prepares local credentials only. No invite email, hosted authentication, cross-device sync or production tenant isolation is implemented. A backend, tenant identity model, authorization policy, audit logs, conflict resolution and secure credential recovery must be selected and tested before enabling these claims. |
| Retention and local document protection | An authorised user can delete an eligible local source copy and its extracted text; the original outside Averill and OS backups are untouched. A person can delete their own Learn history. Replacing/confirming an onboarding batch removes temporary copies and the applied batch retains only counts/timestamps. Workspace JSON, source copies and login documents have restrictive file permissions, but the knowledge store is not application-encrypted. A retention schedule, backup/deletion policy and encrypted storage migration are still needed for real company data. |
| Signed release and provider end-to-end proof | The macOS bundle is unsigned. Signing/notarization requires an Apple Developer identity and notarization setup. Google/Microsoft direct OAuth remains covered by local mocked callback tests, not live accounts. Nebius company-document transfer requires explicit policy and per-file consent; a provider contract and real end-to-end tests remain required. |

## Release gates for real-company deployment

1. Choose and provision a backend for company identity, tenant-scoped auth, revocation, invite delivery and sync. Enforce tenant membership server-side and test cross-tenant denial, stale sessions and conflict resolution.
2. Design and migrate the local store to authenticated encryption for workspace metadata, extracted text and source copies; define key recovery, backup and deletion guarantees. Do not infer this protection from encrypted API tokens.
3. Define a retention schedule and verify deletion in the app, backups and any future server/provider; include legal holds and audit policy if required.
4. Sign, notarize, install and launch the final package using the target Apple Developer identity. Complete real Google/Microsoft authorization and consented Nebius/Tavily checks with approved synthetic payloads.

No enterprise readiness claim follows from the local controls above.
