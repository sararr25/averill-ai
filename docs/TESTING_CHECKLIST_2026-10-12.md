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

## Still open

- [ ] Clean target-Mac install and the full manual final-executable story.
- [ ] Installed Chrome logout/person switch, expiry, private fields, background/navigation and cross-origin cases; social-specific rule and structured-field acceptance. Today's browser smoke is not installed-extension evidence.
- [ ] Real native chooser/drop and complete role/department walkthrough; manual Canva-to-weekly-practice acceptance.
- [ ] Keyboard/VoiceOver/200% zoom, OS reduced motion and frame/CPU profiling.
- [ ] Actual permission denial/revocation, full screen and physical second monitor.
- [ ] Live Drive/OneDrive OAuth, provider confidentiality/retention settings and fresh consented AI acceptance if included in the final story.

## Evidence

- [Instagram after reload](review-evidence-2026-10-12/instagram-reload.png)
- [LinkedIn after reload](review-evidence-2026-10-12/linkedin-reload.png)
- [Brevo schedule after reload](review-evidence-2026-10-12/brevo-schedule-reload.png)
- [Brevo media after reload](review-evidence-2026-10-12/brevo-media-reload.png)
- [Offline packaged-resource receipt](review-evidence-2026-10-12/offline-rehearsal.json)

The date-control automation initially showed a date without committing the native segments; native keyboard entry committed it and scheduling passed. This was not treated as a demonstrated app persistence defect. The cause of the previously missing local Electron locales is unknown; no product source or published ZIP changed.
