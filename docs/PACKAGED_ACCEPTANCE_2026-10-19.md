# Packaged executable acceptance continuation

19 October 2026. This increment follows [the installed-browser/Canva report](CONTINUATION_2026-10-19.md).

## Implemented

An explicit `--averill-qa-profile=<directory>` startup option now permits testing the real packaged executable without choosing the normal workspace. It accepts only a direct, dedicated `averill-acceptance-*` directory under the operating system's temporary root, with a matching local-acceptance marker and an authentication-enabled workspace containing only `@synthetic.example` people. Relative, malformed, duplicate, symlinked, unmarked and normal-account profiles fail closed. Without the option, the existing app paths are unchanged. No automatic sign-in or role bypass is added. Provider environment keys are empty for this profile, and its separate directory has no normal encrypted key store.

`scripts/prepare-packaged-qa.cjs` creates the marked disposable workspace with an approved synthetic price-claim rule and a normal hashed local owner account. It prints only the directory. The known synthetic test login is defined in that script; it is not a real account or credential. The profile survives app restart for persistence acceptance. Delete only that test directory after completing the run; never point the option at normal user data.

The profile uses Electron's documented early `app.setPath('userData', ...)` and `app.setPath('sessionData', ...)` APIs rather than relying on an unverified Chromium CLI switch. [Electron app reference](https://www.electronjs.org/docs/latest/api/app).

If the guided browser rendezvous cannot bind, Current work now shows actionable recovery outside the advanced disclosure. For an occupied port: close other Averill instances and restart this app, or use Advanced connection recovery. The app does not take over the occupied listener or silently claim that guided connection is ready. The original instance remains functional.

## Automated evidence

- Added a QA-profile isolation test, including malformed flag handling, synthetic-account requirements and a symlink guard.
- Added an actual loopback lifecycle test: occupied port rejects the second listener without approval/connection side effects; the original remains usable; a fresh server process requires another approval even for the same session identifier.
- Existing heartbeat-expiry and token/person-change tests remain in the targeted run.
- `QA_PORT_CONFLICT=1 npm run verify:feedback` injects an occupied-port failure and verifies the actionable renderer message, then completes Library, reader focus, Learn, reduced-motion and logout checks. This is synthetic failure injection, not actual installed-browser conflict acceptance. It passed against both source and the final packaged resources; the expected private-link rejection is part of its negative coverage.

## Actual executable boundary

The arm64 bundle was rebuilt. Initially CUA reported a locked Mac. On resumption Chrome was accessible, but the exact packaged app repeatedly returned CUA `timeoutReached` after both direct execution and Launch Services startup with the synthetic profile. The QA process was confirmed alive; no controllable QA window was obtained. A CUA app lookup following a sandbox-aborted launch opened the normal workspace at its signed-out screen; no sign-in or workflow action was performed there, and that instance was closed. Do not interpret a process launch as packaged-flow acceptance.

No synthetic-profile sign-in, native connection approval, screen-reader navigation or installed-browser restart result was observed. Do not close CX-03/#26 or CX-13/#36 from these automated results. VoiceOver, real restart/expiry/port-conflict UI, full-screen/physical displays and the consenting human A/B study are still open.

Final automated run: **91/91 tests pass** with loopback access; the sandbox-only run failed seven network-bound checks with `listen EPERM`, so its result is not a product regression. Final bundle integrity: **171 tracked source files, both native helpers, 3160 ZIP entries**; SHA-256 `acffc68b1842786482f833c4269d027999603e79257da1459db9b52513b25e00`. The final package contains the guarded profile option and guided connection error. It remains a local unsigned artifact, not a public release.

## Resume packaged GUI acceptance

1. Run `node scripts/prepare-packaged-qa.cjs` from `travel-desktop`, retaining only the printed test directory locally.
2. Start the exact local bundle executable with `--averill-qa-profile=<printed directory>`; use the full canonical `.app` path for CUA. Confirm the synthetic workspace at sign-in and authenticate normally.
3. Connect the installed 0.2.1 extension to a Vamo mock draft; verify native approval, cited review, Preview/Apply/Undo and Stop. Record the exact bundle receipt and extension version.
4. Quit/relaunch the executable with the same marked profile. Confirm that login is required again, sources persist and first browser connection requires fresh approval. Test cancellation before accepting it.
5. Complete the actual Brevo mock loop and source/version/typing invalidation. Then continue the VoiceOver, display and physical acceptance gates. Keep real-platform and Vamo mock results distinct.

The previous A/B technical evidence is unchanged; no new human data was collected.
