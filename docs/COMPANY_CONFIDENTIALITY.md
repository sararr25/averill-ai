# Company confidentiality

Current status, 4 October 2026: the Guided UI release is public at [v0.1.0-preview.20261004.2](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004.2). See [PROJECT_STATUS_2026-10-04.md](PROJECT_STATUS_2026-10-04.md) and [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) for current evidence, ordered checks and pending fixes. Dated earlier sections are historical where superseded.

Updated 27 September 2026.

## Implemented controls

- Company onboarding and approved-source questions use local processing by default. The owner must enable company AI and explicitly select individual files before Nebius intake.
- Restricted files cannot enter Nebius prompts. Credential-looking documents are excluded; heuristic detection is not comprehensive DLP. Existing sources without explicit AI permission remain local.
- Company imports never enter Tavily automatically. Research remains an explicitly submitted public query: employees must not put confidential material in public searches.
- Cloud tokens/client configuration use Electron safeStorage encryption. Connections belong to the authenticated owner and workspace, request read access, expire, and can be disconnected. Connecting does not import the whole drive.
- HTTPS download redirects are checked against private/local/reserved addresses, DNS is pinned and bearer tokens are removed on redirects. Files are bounded to 20 MB; each import batch allows up to 30 files.
- Incoming sources remain subject to private personnel handling, source review, approval and department visibility. Import, source approval and external AI permission are separate decisions.

## Nebius and Tavily features — 17 October 2026

Every call below needs company AI on (Nebius) or a Tavily key, and an explicit action. Each send that the employee did not type directly goes through the "Sent to Nebius/Tavily" confirmation, which lists exactly what leaves the Mac. A per-person local log records service, purpose and counts only, never payload text; admins see totals only.

| Feature | Sent to Nebius | Sent to Tavily | Who starts it |
| --- | --- | --- | --- |
| Rule extraction | Extracted text of one approved source with Nebius consent | — | Lead (own department) or admin |
| Review agent | Observed work text; matching lines of eligible approved sources via local tools | — | Employee, with company AI on |
| Public statement check | The claim and the public search results | Only statements the employee confirmed or edited; refused when they repeat internal source text or credentials | Employee |
| Linked page check | — | Public HTTPS links that appear in the shared work | Employee |
| Public website | Rule values/quotes with consent and public page text | The admin-entered site URL (same host, up to 30 pages) | Admin |
| Search by meaning | Paragraphs of approved consented sources (once) and the person's question | — | Lead/admin builds; employees search |
| Handover summary | Both versions of a superseded source, if both have consent | — | Person who can see both |
| Practice drafts | Rule value and quote | — | Lead or admin |
| Source freshness | Rule quote and public results | Stored public query and optional official domains | Admin runs; lead/admin marks |

Restricted and credential-bearing sources never enter these prompts. Model output is always a proposal: rules, practice items, website findings and freshness results need a human decision and never change source approval. Vectors and website page text stay on this Mac. Provider retention and opt-out remain unverified as described above.

## Required provider verification

Do not claim an NDA, zero retention, no training or a selected region from an API key alone. The owner must verify the agreement applicable to the account, confidentiality obligations, retention/region and training opt-out before enabling company AI. These settings are not checked automatically.

[Token Factory terms](https://docs.tokenfactory.nebius.com/legal/terms-of-service) reviewed on 27 September describe storage and use of inputs/outputs for speculative-decoding models unless opted out; the page also describes an agreement transition on 28 September. Verify the applicable [Nebius agreement](https://docs.nebius.com/legal/agreement) and account settings directly with Nebius. Current demo account opt-out, contractual confidentiality and zero retention are **unverified**. No company documents were sent during multisource testing.

## Production gaps

Local document retention now includes explicit deletion of an eligible managed source copy/extracted text and removal of temporary onboarding batch copies after successful application or replacement. Personal Learn history can be deleted. These actions do not remove the source original outside Averill, OS backups, cached provider data or earlier copies already made outside the current profile. Workspace JSON, extracted text and saved login documents are still not application-encrypted. A real-company release requires an encryption migration, backup/retention/deletion policy, provider data-processing verification and tenant-scoped server authorization. See [ADDITIONS_STATUS.md](ADDITIONS_STATUS.md).

Local company copies and workspace text use OS permissions, not application encryption. Local logins are not server tenant isolation. Production requires encrypted document storage, centrally enforced access, audit/deletion/retention controls and an agreed provider data-processing policy. Demo password documents are locally readable by design and must not be treated as production credential storage. Do not deploy this demo as enterprise-secret storage without these controls.
