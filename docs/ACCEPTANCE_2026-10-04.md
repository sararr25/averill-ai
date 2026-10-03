# Remaining acceptance — 4 October 2026

Continuation requested by the owner: finish pending work and keep committing/pushing. This record separates observed results from gates requiring an account, permission or physical hardware.

## Verified in this continuation

- Current regression suite: **47/47**.
- The actual unsigned macOS 13+ arm64 `Averill.app` launched on this Mac through native app control. Its existing Aurelia workspace remained at sign-in; no normal-profile accounts or approvals were reset.
- A new repeatable `verify:rehearsal` script runs against packaged app resources in a temporary profile, then starts a second process with that profile. It checks separate sign-in after restart, persisted approved source and personal lesson, AI reset, no previous observation and isolation from another person's learning.
- Consent-dialog cancellation exercises the renderer handlers and causes no provider call. An accepted generated-policy/email review completes a real Nebius Token Factory/NVIDIA Nemotron request, displays a validated AI suggestion and identifies the runtime provider/model. Source data is explicitly synthetic/public; the script refuses unexpected live review text.
- Local correction/recheck, typing invalidation, source revocation, floating Stop, confirmed learning, weekly practice and unauthorized learning access rejection pass. Receipt/screenshots remain ignored in `travel-desktop/dist/rehearsal/`.
- This is a regression harness with scripted consent decisions and a synthetic extension client, not proof of installed Chrome, Brevo or manual completion of the whole narrative.

## Public test build

Published release: `v0.1.0-preview.20261004`, on the public `sararr25/averill-ai` repository. Release assets are the verified ZIP and SHA256SUMS; the release notes describe local setup, unsigned arm64 scope and open platform gates. The release and download both returned HTTP 200 without authentication. GitHub reports the same uploaded ZIP digest as the locally verified archive: `acef84c59cf6bc5609d17328aff7a6129c4624a26d33b3d508d03fc87125ef8b`. Release target is commit `3ce9e296011e254494c7f25a4896732ce74af566`. Public URL:

https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004

Keys, environment files, generated login documents and normal user-data files are not in the app resource tree. Company documents remain local by default. The build does not include provider credentials or cloud authentication.

## Still requires user input or external proof

| Gate | Exact next step | Why it is still open |
| --- | --- | --- |
| Real email draft | Sign in to the opened Brevo tab, or identify an already authenticated email tool; then rehearse an unpublished synthetic draft | Brevo is visibly at sign-in; no account access was supplied |
| Installed Chrome extension | Confirm loading the reviewed local extension and its activeTab/scripting/loopback permissions; then test the actual extension transport and platform editor | Installation/access approval is required by the computer-use policy; broad pending-work authorization cannot replace that action-time confirmation |
| Manual full packaged story | Rehearse onboarding → real Canva step → real email → consented AI → weekly practice → Stop after the account/extension gates | Packaged-resource regression is distinct from manual platform acceptance |
| Screen permission denial, full screen and physical second monitor | Exercise those states on the target Mac without weakening security protections | Simulated tests do not establish actual TCC denial/revocation or a second physical display |
| Final recording and public YouTube URL | Record the accepted 2:50 story after real-platform gates, review the cut and publish to the owner's intended channel | No final recording exists; a synthetic regression screenshot is not a functioning-platform video |
| Registration and eligibility/ratings | Owner confirms Devpost account, residence, new/existing status, ratings and declarations | The connected Devpost account still lists only WebMCP on 4 October. Identity, experience ratings and binding declarations cannot be invented or accepted on behalf of the owner |

No email/post was sent, no campaign scheduled, and no Devpost agreement accepted or entry submitted.

## Reproduce the packaged-resource rehearsal

From the canonical repository root, after packaging:

```sh
AVERILL_NATIVE_APP="$PWD/travel-desktop/dist/Averill-darwin-arm64/Averill.app/Contents/Resources/app" npm --prefix travel-desktop run verify:rehearsal -- --synthetic-consent
```

The explicit flag permits only generated public policy/draft text to Token Factory. Configure NEBIUS_API_KEY locally; it is not printed. Omit the flag for offline regression. Temporary profiles are removed after successful or failed child execution. This command uses development Electron with the release's app resources; it does not itself launch the distributed `.app` executable.
