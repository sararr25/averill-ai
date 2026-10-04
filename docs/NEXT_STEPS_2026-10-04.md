# Averill next steps and acceptance handover

Updated 4 October 2026 after Guided UI publication. Use the public release linked in PROJECT_STATUS_2026-10-04.md. The code is implemented and pushed; completion below requires recorded evidence, not another build alone.

## First check the published app

1. Download the new ZIP and SHA256SUMS. Verify `shasum -a 256 Averill-macOS-arm64.zip`, extract it, quit older Averill copies and launch the new app on an Apple Silicon Mac. It is unsigned, macOS 13+. Preserve normal user data; use a separate synthetic test workspace for destructive/account tests. Confirm sign-in, approved sources and personal learning survive restart, while sharing and login sessions do not.
2. In Review choose **Choose what to review**. In Work connect **Browser field**, copy pairing details into the already installed Averill extension and select one non-sensitive field on the local fake Brevo page. No Brevo, Instagram or LinkedIn sign-in is needed. Confirm typing removes advice, a pause captures the current field, and **Check approved rules** opens Review with observed text, suggested edit and an exact versioned source.
3. Correct the prohibited price phrase manually in fake Brevo; use **Recheck after my edit**, then **Read and recheck locally**. Confirm the finding clears. Stop in Review and the floating control; confirm text and pairing clear. Repeat on fake Instagram and LinkedIn. Check uploaded image persistence after save/reload separately; transport proof is not image or schedule acceptance.
4. Exercise changed task, superseded/revoked source, navigation, pairing expiry, background tab, logout and another account. A late result must never restore old advice. Verify audience/date/asset rules only when the corresponding structured field was shared; hidden settings stay unverified.
5. Open Learn, start a Canva lesson, perform and confirm a step. Check next-heading focus. Open **Your week and learning history**, create a practice answer, then switch person and verify isolation. A task exercise or recorded activity must not be shown as a Canva lesson. Test Knowledge search/filters/approval details and Setup file/team/service/advanced disclosures with employee, lead and admin accounts.

## Remaining checks and work in priority order

| Priority | Work | Completion evidence |
| --- | --- | --- |
| P0 before recording | Full manual story on this published build, including explicit AI consent cancellation and local fallback | Under 2:50, with source/correction/recheck/Stop visible; no secrets or real recipients |
| P0 before recording | Screen Recording/Accessibility denied, chosen window closed, full screen and two actual monitors | Honest error, no stale capture, floating Stop reachable on actual hardware |
| P0 submission | Final recording, public YouTube video and owner registration/declarations | Owner-approved public links and completed official submission checklist; no submission performed yet |
| P1 UI acceptance | Keyboard traversal, focus restoration, VoiceOver, 200% zoom, OS Reduce Motion | Six areas and source dialog usable; log specific failures and fix/retest them |
| P1 motion | DevTools Performance with representative transitions and CPU throttling | Record frame timings; no 60fps claim until measured; address long frames if found |
| P1 demo accuracy | Image upload save/reload and structured audience/date selection on all local fake editors | Separate before/after receipts; never infer these from caption-only sharing |
| P2 distribution | Signing/notarization and clean target-Mac install | Signed artifact and installer acceptance; current release is unsigned |
| Future product | Live platform adapters, cloud auth/sync, encrypted store/retention, broad visual/semantic checks | Separate scoped design and tests; not hackathon functionality claims |
| Optional setup | Live Drive/OneDrive OAuth and provider confidentiality settings | Registered clients and deliberate end-to-end acceptance; synced local files remain fallback |

## What is already checked

47/47 Node tests. Isolated native feedback/intake/Knowledge/logout, lesson continuation/focus and emulated reduced motion; synthetic extension pairing, typing invalidation and Stop; renderer external review, correction, fresh recheck, source revocation and task invalidation. All six areas fit 440×660, 520×850 and 960×820. Bundle-resource feedback/learning/focus/reduced-motion passed. Package verification matched 120 tracked source files, both native helpers and 3109 archived entries. Prior installed Chrome evidence covers selected-field transport on the fake editors and the Brevo correction loop, not complete acceptance of this release.

## If something fails

Record release tag, account role, area, selected field/window, capture method, exact action and expected/observed result. Use synthetic text and redact credentials. Fix the specific reproducible defect, rerun the matching regression and update the acceptance record. Commit/push changes, rebuild and publish a new version when runtime files change; documentation-only updates do not alter the existing binary. Do not reset the normal Mac workspace or silently reapprove changed sources.
