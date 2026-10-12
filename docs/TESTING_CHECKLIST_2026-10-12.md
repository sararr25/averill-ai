# Averill testing checklist — 12 October 2026

Completed in this review, using synthetic material and isolated profiles. [Plan and GitHub tickets](TESTING_PLAN_2026-10-12.md).

## Tested and reviewed

- [x] Desktop regression: **47/47 passed** today (initial report review; loopback access required).
- [x] Release integrity: restored 204 missing Electron locale files in the local app from the unchanged verified ZIP. `verify:release` now passes **120 tracked files, both native helpers and 3109 archive entries**; a fresh extraction also matches. ZIP checksum unchanged.
- [x] Native intake/Knowledge/feedback: pending/success/error/cancel, staged and approved sources, full text/search, logout cleanup, lesson focus and emulated reduced motion passed. Chooser was stubbed.
- [x] Browser regression: selected field, typing invalidation, pause, floating Stop/logout and token privacy passed with a **synthetic extension client**.
- [x] Native selected-window review: cited email rules, manual-equivalent correction, fresh OCR recheck, source revocation, task invalidation and Stop passed with a synthetic external editor.
- [x] Six-area layouts passed at **440×660, 520×850 and 960×820**.
- [x] Offline source and freshly extracted release-resource rehearsal: consent cancellation, correction/revocation, Stop, weekly practice, person isolation and second-process restart passed; **zero provider requests**.
- [x] Real Chrome/local Instagram: image upload, caption, save, reload and reopened detail passed; closing a new empty composer left the post count unchanged.
- [x] Real Chrome/local LinkedIn: image/text save/reload passed; closing an unsaved text composer discarded that text.
- [x] Real Chrome/local Brevo: audience, subject, body, image, desktop/mobile previews and reload passed; cancelled design edits were discarded. Empty-date scheduling was rejected; **15 October 2026, 10:00 Europe/Copenhagen** persisted after native date entry, scheduling and reload.
- [x] Canonical simulator: **2/2 date/timezone tests and production build passed**. Unsupported social scheduling, Reel/disclosure controls and real platform APIs were reviewed as outside its scope.
- [x] Documentation: corrected obsolete no-extension/no-live-model claims and the public-build TODO. Official event overview rechecked; detailed rules retrieval failed, so eligibility/declarations remain unverified.

- [x] Actual macOS chooser: local Markdown imported, extracted text reviewed and explicitly approved. Multisource regression also passed synced XLSX/public HTTPS, AI-off/private-link/missing-OAuth rejection; its drop is a synthetic event.
- [x] Actual role walkthrough: owner, Marketing lead/employee and Operations employee; private/pending/cross-department exclusions and lead clarification/approval passed.
- [x] Installed Chrome/local Brevo: prohibited claim/footer correction, immediate typing invalidation, recheck, logout/late edit, person isolation and sender Email address exclusion passed.
- [x] Source-dialog focus defect reproduced and fixed (`e1f05cb`); mouse-open then Escape returns to its read button. Source and bundle regressions cover staged close and saved-source Escape. New local candidate app/ZIP match 120 tracked files, both helpers and 3109 entries; packaged-resource offline restart rehearsal passed with zero provider requests.
- [x] Native **207.36% zoom**: six areas reachable, no horizontal overflow observed; restored Actual Size. Main-app full screen and companion access passed without active external capture.

- [x] Native Learn continuation: approved-source lesson, four synthetic confirmations with heading focus, weekly wrong/correct feedback, source read/Escape, required reflection confirmation, completion, exclusion/recovery and second-account empty history passed. Fixed misleading refresh instructions after excluding the only eligible lesson; native source UI retest and **47/47 tests** pass with zero provider calls. [Receipt](review-evidence-2026-10-12/learning-continuation/verification.json). Actual Canva operations and final executable remain separate gates.

## Still open

- [ ] Clean target-Mac install and the full manual final-executable story.
- [ ] Installed Chrome expiry, broader sensitive-field matrix, background/navigation and cross-origin cases; social-specific rule and structured-field acceptance.
- [ ] Actual Finder drag/drop, rejection/current-version UI completion and manual Canva-to-weekly-practice acceptance. Repeat chooser after a rendering stall: import/AX completed but pixels stayed on Working until resize.
- [ ] Complete keyboard traversal/VoiceOver, OS reduced motion and frame/CPU profiling. Native zoom and source Escape focus are verified separately.
- [ ] Actual permission denial/revocation, external-app full-screen capture/Stop and physical second monitor.
- [ ] Live Drive/OneDrive OAuth, provider confidentiality/retention settings and fresh consented AI acceptance if included in the final story.

## Evidence

- [Manual acceptance receipt and explicit limits](review-evidence-2026-10-12/continuation/manual-acceptance.json)
- [Installed email after correction](review-evidence-2026-10-12/continuation/installed-email-corrected.png)
- [Native zoom](review-evidence-2026-10-12/continuation/native-207-percent-zoom.png)

- [Instagram after reload](review-evidence-2026-10-12/instagram-reload.png)
- [LinkedIn after reload](review-evidence-2026-10-12/linkedin-reload.png)
- [Brevo schedule after reload](review-evidence-2026-10-12/brevo-schedule-reload.png)
- [Brevo media after reload](review-evidence-2026-10-12/brevo-media-reload.png)
- [Offline packaged-resource receipt](review-evidence-2026-10-12/offline-rehearsal.json)

The date-control automation initially showed a date without committing the native segments; native keyboard entry committed it and scheduling passed. This was not treated as a demonstrated app persistence defect. The cause of the previously missing local Electron locales is unknown; no product source or published ZIP changed.

## Published release

The owner explicitly authorized publication after the initial automatic-review rejection. The focus fix is now public in [v0.1.0-preview.20261012](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261012), built from `e1f05cb`. GitHub's uploaded ZIP digest matches local verification: `b40ea24e9fe96f407be7f7139c7809ef1dcb1ffe96b6359d484f3b6e7780e80f`. The page and checksum are publicly accessible; the previous release is retained. This unsigned macOS 13+ Apple Silicon preview does not complete the still-open manual/hardware gates above.

Publication verification: a fresh unauthenticated ZIP download matches the local and GitHub-uploaded SHA-256. [Public-download receipt](review-evidence-2026-10-12/continuation/publication-verification.json).
