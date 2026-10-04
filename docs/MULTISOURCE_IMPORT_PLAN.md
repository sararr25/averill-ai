# Company imports and confidentiality

Current status, 4 October 2026: the Guided UI release is public at [v0.1.0-preview.20261004.2](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004.2). See [PROJECT_STATUS_2026-10-04.md](PROJECT_STATUS_2026-10-04.md) and [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) for current evidence, ordered checks and pending fixes. Dated earlier sections are historical where superseded.

27 September 2026 implementation plan. Preserve the prepared local accounts and keys.

## User flow

Setup offers drag and drop, native file selection, synced Drive/OneDrive folder selection, HTTPS links and direct OAuth cloud connections. Every input joins the same local review workflow. No cloud file is imported or sent to AI merely by connecting an account. Cloud browsers list folders/files; the admin selects files explicitly. OAuth requires registered Averill clients; missing configuration shows setup instructions, not a fake connected state.

## Confidentiality controls

All new files default to local-only AI permissions. Restricted documents cannot be sent to Nebius. The admin must explicitly allow company AI after checking the applicable contract, confidentiality obligations, retention/region and no-training/opt-out settings, then select permitted documents per request. AI source answers also enforce source permissions. OAuth/API credentials never enter document content or prompts. Imported text is untrusted data. HTTPS link downloads reject local/private network addresses and validate redirects. Cloud tokens are encrypted using OS storage and scoped to the signed-in admin/workspace. Disconnect removes local access; revoke grants in the provider account separately.

These controls cannot establish an NDA or prove provider retention settings. Existing local workspace/file copies are protected by OS file permissions, not encrypted by this application. Real trade secrets require a verified provider agreement/opt-out and suitable endpoint/region, plus device/storage/tenant controls before production. Public demo samples remain synthetic.

## Delivery and verification

Implement network download bounds/provenance, OAuth PKCE and read access, guarded IPC, compact picker/link/drop UI and shared privacy controls. Test SSRF/redirects/size bounds, OAuth state/token handling, duplicate imports, restricted-file and source-answer denial before any network call. Verify native renderer/preload flows with synthetic files. Direct provider OAuth acceptance needs actual client registrations and human sign-in; document this separate gate.
