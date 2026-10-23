# Averill check — 21 October 2026

Verdict: ready for a guided owner feedback session; release acceptance remains open. Checked canonical checkout at 23fd111. No product behavior changed; no normal accounts, keys or company data used.

## Verified now
- Unit suite: 91/91 with loopback enabled (sandbox-only: seven EPERM failures).
- Browser synthetic regression: pairing, selected field, typing invalidation, Stop/logout pass.
- Canva representative-DOM adapter: Apply/Undo, formatting guards and manual recovery pass. This does not revalidate Canva web.
- Accessibility renderer: nine groups pass across four roles, three destinations, small viewport/200% zoom and logout. VoiceOver remains unverified.
- Offline rehearsal: consent cancellation, correction, revocation, Stop, weekly practice, person isolation and packaged-resource restart pass. This is not final-executable acceptance.
- Vamo simulator: 2/2 tests and production build pass.

## Findings and priority
1. P1: `verify:feedback` fails twice restoring the Read button focus after closing an uploaded-source reader. Investigate actual focus versus hidden/replaced trigger and harness timing before changing code.
2. P1: default `verify:contextual` stops at its field-type selector before review. Diagnose harness/shadow-root readiness; in-page end-to-end regression is not green in this run.
3. P1: initial `verify:release` rejects ZIP/app mismatch (204 differing locale-resource paths). Tracked runtime source checks passed before archive comparison. Fixed by rebuilding the local app/ZIP: integrity now passes 171 tracked files, both helpers and 3160 bundle entries. SHA-256: `eaeeeb1719d8701e2f3fc6cfb46132bf1a52e4d0e8db7d2af7ea6f5baf40c583`. Unsigned local build; no release published.
4. Remaining acceptance: final .app + installed Chrome connection/cancel/restart/expiry/port conflict; complete Brevo mock loop; VoiceOver and physical displays; owner usability feedback.
5. Product scope still missing: cloud account sync/invitations/owner recovery, signed distribution, publishing integrations, general rich-editor editing and Canva visual/layout assessment. These are not prerequisites for a bounded local demo.

Cloud provider calls were not repeated. Handover has earlier live Nebius/Tavily evidence dated 18 October; that is historical, not a fresh availability check. GitHub issue state was not refreshed.

## Owner test — 20 minutes
1. Open `travel-desktop/dist/Averill-darwin-arm64/Averill.app` from this checkout, not an older Applications/public build. Use local credentials in ignored `demo-login-documents/` (do not send passwords in feedback).
2. Start mock pages in a terminal: `cd /Users/sararuffini/Documents/Hackatons/Nvidia/averill-ai/demo-tools/social-simulator && npm run dev`. Open the printed localhost URL in Chrome. Reload existing Averill extension from `travel-desktop/browser-extension/` at chrome://extensions; expected version 0.2.1. Close duplicate Averill instances.
3. LinkedIn mock: connect tab, approve in Averill, select Post text containing `lowest prices guaranteed`. With a matching approved rule, Ask Averill must cite the source; Preview → Apply → Undo must restore the original exactly. If no approved source exists, expect insufficient evidence rather than a fabricated warning.
4. Edit the draft manually after Preview: old Apply/Undo must not overwrite newer text. Stop sharing must remove the companion and preserve the draft. Repeat in Brevo Email content; Instagram is optional.
5. Library: search/read a source, close it and check keyboard focus; pending/approved states must stay distinct. Learn: start one activity and check that the next step is obvious.
6. Quit/reopen: login and browser approval must be requested again; sources must persist. Try Tab/Escape and 200% zoom.

Feedback format: page/action → expected → observed → screenshot if useful; add “next action clear: yes/no”. Stop at the first blocking issue and report its exact screen/message. Do not publish/send during the test.

## Next work
First diagnose the two failing UI regressions; then finish the exact packaged Chrome/Brevo/restart path. Use owner feedback to prioritize clarity improvements. Finish VoiceOver and clean-Mac checks before release acceptance; broader integrations are separate scope.
