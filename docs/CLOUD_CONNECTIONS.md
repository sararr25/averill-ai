# Cloud connection setup

Current status, 4 October 2026: the Guided UI release is public at [v0.1.0-preview.20261004.2](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004.2). See [PROJECT_STATUS_2026-10-04.md](PROJECT_STATUS_2026-10-04.md) and [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) for current evidence, ordered checks and pending fixes. Dated earlier sections are historical where superseded.

Updated 27 September 2026. The desktop implements direct Google Drive and Microsoft OneDrive OAuth, browser authorization with PKCE and loopback callbacks, folder browsing and selected-file downloads. Real provider login is not yet verified: no registered Averill clients have been supplied.

## Google Drive

1. Create/select an Averill Google Cloud project, enable Drive API and configure the OAuth consent screen/test users.
2. Create an OAuth **Desktop app** client. In Averill Setup → Google Drive, save its client ID and desktop client secret if supplied.
3. Click Connect Google Drive and authorize in the browser. Browse folders, select files and import them for local review.
4. Scope is `drive.readonly`. This gives read access broadly and may require Google verification for distribution; Averill only downloads chosen files. Google Docs/Sheets/Slides export to TXT/XLSX/PDF.

[Google native OAuth guide](https://developers.google.com/identity/protocols/oauth2/native-app).

## Microsoft OneDrive

1. Register an Averill application in Microsoft Entra. Select account types appropriate to the company and/or personal accounts required for the demo.
2. Under Mobile and desktop applications, add `http://localhost/oauth/callback`. Configure delegated Microsoft Graph `Files.Read`; public desktop clients do not store a Microsoft client secret.
3. Save its application/client ID in Averill Setup → Microsoft OneDrive. Connect in the browser, then browse and select files.
4. Current picker accesses the connected user's own drive. Shared libraries/SharePoint and private Microsoft share-link resolution are not implemented. Tenant policy may require administrator consent.

[Microsoft registration guide](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app), [authorization code with PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow).

## Operation and alternatives

Tokens are encrypted locally and scoped to owner/workspace. No background sync or refresh token is requested; reconnect after expiry. Disconnect deletes local access; revoke grants in the provider account when needed. Cancellation and four-minute timeout close the callback listener.

While client registration is pending, choose downloaded files from synced Google Drive/OneDrive folders or drag them from Finder/Desktop. HTTPS public file/page links work independently. Google document links require a connected Drive account; Microsoft private links should use the picker or synced file. Signed URL query strings are not saved as source provenance.

See [company confidentiality](COMPANY_CONFIDENTIALITY.md). OAuth consent is not permission to send documents to Nebius.

## Real-company synchronization boundary — 28 September 2026

Google Drive and OneDrive import credentials are separate from company account authentication. Averill still stores one local workspace on one Mac; it does not sync people, approvals, clarifications, learning or source files between devices. New local disable/reset controls affect local authentication only. A backend choice, tenant identity model, server-side authorization, encrypted transport/storage, revocation and conflict policy are required before inviting real employees across devices. Provider OAuth callback tests are local and mocked; actual Google/Microsoft authorization remains unverified. See [ADDITIONS_STATUS.md](ADDITIONS_STATUS.md).
