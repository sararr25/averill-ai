# Averill rebuild and comprehensive technical testing — 30 October 2026

The updated macOS arm64 app and ZIP are built from the current working tree, including current-reading revocation and the public fact-check fix. Local technical gates pass. **Public release verdict: DO NOT SHIP as fully accepted yet**: installed-browser/real Canva, VoiceOver, independent usability and answer-quality acceptance remain open. No public release or deployment was performed.

## Current artifacts

- App: `travel-desktop/dist/Averill.app`.
- Matching packager app: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`.
- ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`.
- ZIP SHA-256: `755c87dcc29122fad8adb20b285d37337690d3b17e4cabb6fb1c932901957cba`.
- Integrity: 265 source files, both native helpers and 3257 archive entries. The standalone app matches the packager bundle byte for byte. No workspace JSON, encrypted-secrets file, `.env` file or generated login directory was bundled. Unsigned Apple Silicon build; native local launch does not establish clean-Mac Gatekeeper acceptance.
- Built over `d17e4c7` with the pre-existing dirty worktree preserved. See [release receipt](review-evidence-2026-10-30/full-rebuild-testing/release-final.json).

## Verified coverage

| Gate | Result | Evidence |
| --- | --- | --- |
| Desktop unit contracts | 297/297 | `final-unit.log` |
| Broad functional matrix | 18/18 suites after fixes | `matrix-final.json` |
| Packaged Pro renderer/IPC | 12 checks | `final-pro-ui.log` |
| Four-role accessibility | 10 groups, narrow/wide, 200% zoom, keyboard practice, reduced motion | `accessibility.log` |
| Packaged extension UI | 11 checks; single card, sticky minimization, consent, guide, Stop | `packaged-extension-ui.log` |
| Shared guide view | 10 checks; actual color-control label, missing/ambiguous targets and local assets | `packaged-shared-guide.log` |
| Contextual field workflow | 20 checks; sharing, public consent, pause/reload, Preview/Apply/Undo, Stop/logout | `contextual-fixed.log` |
| Canva design reading | 31 stages / 38 relays, zero providers; current-reading invalidation and locked completion | `canva-design.log` |
| Final packaged visual matrix | 36 captures: six areas × 440/768/1440px × light/dark; no horizontal overflow/unnamed buttons | `final-visual/visual.json` |
| Theme contrast/focus | Both themes; minimum text sizes, contrast and single focus rings | `contrast-themes.log` |
| Feedback, intake, browser, task review, cloud features, external observation, auto-connect, offline restart and outage recovery | PASS within the matrix | Individual logs listed in `matrix-final.json` |
| Vamo simulator | 34/34 tests and production build | `simulator-tests.log`, `simulator-build.log` |
| Real provider transport | 2/2 public-only Nemotron/Tavily help samples; 1 generated long-source Nemotron request | `live-public/public-live.json`, `live-retrieval/retrieval-live.json` |

All evidence paths in the table are relative to [the receipt directory](review-evidence-2026-10-30/full-rebuild-testing/). Synthetic renderer/transport, real providers and native executable evidence are separate. The three provider samples are not a general answer-quality score or latency percentile.

## Defects found and corrected

1. **Public fact-check rendering:** `publicVerdict` used an undefined `line` variable after appending the explanation/snippet to its actual card. The result failed to render. Removed the misplaced duplicate append; the packaged cloud flow now checks the contradicted verdict, exact explanation, supported snippet and matching history. The original failing log is retained.
2. **Contextual harness false success:** its old citation selector expected a `b` element rather than the current disclosure `summary`, and Electron `app.quit()` masked the failure despite `process.exitCode=1`. Updated selectors and the separately displayed public-check title/scope, and made failure exit explicit. The final run passes 20 checks. This is a testing correction, not weakened product validation.
3. **Dark SVG screenshot artifact:** the first capture immediately after a theme change showed blank SVG ink. Waiting 500ms before capture produced the complete mark/illustration on the same product. The capture wrapper is retained; no speculative product theme change was made.

The matrix's original cloud failure and contextual false success are preserved in `matrix.json` and the original logs; `matrix-final.json` identifies the corrected runs. Do not infer pass solely from an Electron exit code.

## Direct native executable and UX review

Used the actual `dist/Averill.app/Contents/MacOS/Averill` with a marked temporary synthetic profile. Observed sign-in, Home → Ask, exact local policy answer with source, source dialog, Escape and restored focus, Library text search and reader with preserved query/focus, Learn starting at zero measurements with Finish disabled, wide Learn layout, unconfigured Public research recovery, sign-out and a separate-process restart requiring sign-in. The unfinished lesson remained available without restoring current measurements. Native app observations do not constitute a VoiceOver test.

Reviewed current light/dark screenshots and sidebar/wide native layouts. Primary actions and readable source distinctions are present. A remaining **P2 UX copy inconsistency** is visible in Workspace settings: it still says “Open Current work”, while primary navigation now says “Assistant”. This is recorded for EX-09/EX-14; it is not silently marked complete. The scripted navigation checks do not establish first-time discoverability or a human usability winner. No independent pixel-baseline regression score is claimed.

## Cleanup and data preservation

The original running app was preserved when automatic review initially rejected forced closure. After the owner explicitly authorized closure, it was stopped and replaced. Old app candidates and temporary `.app` backups were moved to Trash; the app/ZIP paths now hold only the latest candidate. Both current `.app` copies are identical (standalone and packager layout), not two different versions. The original packager output and ZIP were replaced during the first build. Trash was not emptied. Exact later move receipts are retained; `cleanup.json` also records the initial cleanup receipt-path error and protected Trash listing.

Normal profiles, credentials, encrypted keys and source approvals were not reset or deleted. Provider tests used generic public operations/official excerpts or an entirely generated source, never a normal workspace. No post, email, export or publication was performed.

## Explicit acceptance limits

- **NOT RUN this turn:** installed Chrome/real Canva regression. The Mac was unlocked, but browser use continued to report “Local browser use is disabled in Work settings”; the owner was asked to enable it. No alternative browser-control route was used to bypass the restriction.
- **NOT RUN:** full VoiceOver, native OS permission-denial/recovery, clean-Mac signing/Gatekeeper, independent unassisted usability, independently rated full-answer precision/completeness and live Google/Microsoft OAuth.
- Real social publication/account-sync is outside the implemented bounded adapters; synthetic simulator success does not validate publication.
- Model summaries/comparisons, semantic retrieval unification and generalized multi-goal completeness remain the earlier open excellence gates. This test run does not close all EX tickets.
- `/testing` was not an installed command/skill in this session. Used repository suites plus the browser-qa and accessibility workflows. Legacy scripts coupled to superseded navigation labels were not substituted for acceptance of the current UI.

The optional final launch was initially rejected by automatic approval review for potential private-workspace exposure. The owner then explicitly authorized normal-profile access. The final app opened on the existing fictional Vamo login, Maya signed in, and both Italian posting/leave questions returned cited local answers. A public-only contrast/spacing request passed through the actual preview → demo-server Nebius/Tavily → answer flow: five practical steps, two official Canva sources, no design-measurement claim. Native guide Start → Next → Stop restored the answer/focus; practice was not saved. The app is left open as Maya on that answer. See `native-normal-profile.json`.

The owner also explicitly authorized enabling browser use. The tool refused control of `com.openai.codex` for safety reasons, so the setting could not be enabled by the agent; manual enablement was requested. This restriction was not bypassed.
