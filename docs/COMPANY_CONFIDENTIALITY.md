# Company confidentiality

Updated 27 September 2026.

## Implemented controls

- Company onboarding and approved-source questions use local processing by default. The owner must enable company AI and explicitly select individual files before Nebius intake.
- Restricted files cannot enter Nebius prompts. Credential-looking documents are excluded; heuristic detection is not comprehensive DLP. Existing sources without explicit AI permission remain local.
- Company imports never enter Tavily automatically. Research remains an explicitly submitted public query: employees must not put confidential material in public searches.
- Cloud tokens/client configuration use Electron safeStorage encryption. Connections belong to the authenticated owner and workspace, request read access, expire, and can be disconnected. Connecting does not import the whole drive.
- HTTPS download redirects are checked against private/local/reserved addresses, DNS is pinned and bearer tokens are removed on redirects. Files are bounded to 20 MB; each import batch allows up to 30 files.
- Incoming sources remain subject to private personnel handling, source review, approval and department visibility. Import, source approval and external AI permission are separate decisions.

## Required provider verification

Do not claim an NDA, zero retention, no training or a selected region from an API key alone. The owner must verify the agreement applicable to the account, confidentiality obligations, retention/region and training opt-out before enabling company AI. These settings are not checked automatically.

[Token Factory terms](https://docs.tokenfactory.nebius.com/legal/terms-of-service) reviewed on 27 September describe storage and use of inputs/outputs for speculative-decoding models unless opted out; the page also describes an agreement transition on 28 September. Verify the applicable [Nebius agreement](https://docs.nebius.com/legal/agreement) and account settings directly with Nebius. Current demo account opt-out, contractual confidentiality and zero retention are **unverified**. No company documents were sent during multisource testing.

## Production gaps

Local company copies and workspace text use OS permissions, not application encryption. Local logins are not server tenant isolation. Production requires encrypted document storage, centrally enforced access, audit/deletion/retention controls and an agreed provider data-processing policy. Demo password documents are locally readable by design and must not be treated as production credential storage. Do not deploy this demo as enterprise-secret storage without these controls.
