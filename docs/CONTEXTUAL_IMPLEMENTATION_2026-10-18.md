# Contextual browser implementation — 18 October 2026

## Delivered increment

Owner authorized push and ticket updates after selecting Companion. Design commit `82f4377` is pushed; CX-01 / #24 is closed for its design deliverables. The current increment implements the shared contextual review contract (CX-02 / #25), guided connection, the first real in-page Companion UI and bounded plain-text preview/Apply/Undo. It is source implementation, not another mockup. The main desktop shell is still the legacy visual implementation until CX-08.

## Ticket state

| Ticket | Implemented here | Remaining before closure |
| --- | --- | --- |
| CX-02 / #25 | Shared main-process orchestration; minimal bound review/proposal/open contract; source/role/session/revision validation and stale reply exclusion; no workspace/key leakage | Design contract/code/unit/native synthetic seam accepted for this ticket; real-platform work remains in adapter tickets |
| CX-03 / #26 | Guided loopback rendezvous, first-session native approval, session-scoped trust, no normal JSON paste, explicit reconnect, logout/restart revocation, popup recovery and legacy diagnostics | Installed Chrome first-connect/reconnect/restart, normal packaged app, in-page disconnected recovery and documented port-conflict handling acceptance |
| CX-04 / #27 | Closed-shadow Companion card, expandable findings/passages, inline consent, explicit cited-source app link, pending/error/insufficient/no-conflict states, source/typing invalidation | Real editor anchoring/no obstruction, keyboard/screen reader/focus restoration, width/zoom/reduced-motion acceptance and complete panel polish |
| CX-05 / #28 | Deterministic unique removal proposals; plaintext native setter/readback; preview; revision-aware Undo/manual recovery; restricted/ambiguous/stale changes rejected | More actual-editor failure paths, controlled/rich editor mapping where supported, packaged/installed acceptance. Arbitrary model rewriting and required-text insertion are still manual |
| CX-06 / #29; CX-07 / #30 | Brevo/LinkedIn origin context hints only | Dedicated actual editor adapters and manual complete platform loops; no new platform support claim |
| CX-08–CX-13 | Dependencies and chosen identity documented | Desktop migration, library/Learn hierarchy, later platforms and final packaged acceptance remain open |

CX-03–CX-05 stay open despite passing synthetic tests. Do not close acceptance parents or platform tickets from module success.

## Concrete behavior

With a matching desktop source/build and the updated source extension, the employee connects the selected tab from the extension. The first extension Origin in the authenticated app session requires a native Cancel/Connect confirmation. The extension chooses one field and can request a local or consented AI review without navigating to desktop Review/Work. Guidance and the exact approved citation appear in-page. A source link opens the authorized document in Averill only after an explicit click.

Only unique forbidden-phrase removals are executable proposals today. Plain textarea/text-input controls can preview/apply that single removal and undo it exactly. The adapter checks field identity, revision and original full value, uses the owning document's native setter, emits an input event and confirms the resulting value. Intervening typing blocks automatic Undo and offers explicit manual recovery. Contenteditable fields are review-only; formatting-aware write adapters remain separate. The example removal is intentionally literal; it is not a claim of generative rewriting or grammar repair.

Source revocation/version/text/privacy/role changes invalidate authority. Typing clears advice immediately. Source changes clear cached UI at the next local status exchange, while Apply/open always revalidate synchronously in the main process before authorization. Model output never controls an edit tool. Provider calls reuse the existing Nebius client, with policy/file consent and a before-each-call authority guard. A newer review supersedes earlier replies. Local review remains offline; no Tavily calls are part of this flow.

The connection secret is bound to one extension/tab/origin and kept in session storage. Results expose only bounded findings, source quotes and optional exact removal patches. No full document, person/workspace snapshot, runtime key, raw model traces or public claims are returned. Restricted/credential-bearing sources are excluded from in-page evidence. The public extension resources are only bundled font/mark assets. The no-data rendezvous is separate from the random-port authenticated observation/context bridge; packaged desktop uses 43147, while isolated development tests use an ephemeral port.

## Verification

- `npm test`: **89/89**, including new rendezvous/context/patch tests and the existing account, privacy, learning and rule regressions.
- `npm run verify:contextual`: **13 complete-flow checks**, actual app/bridge/review/background/content code, synthetic Chrome transport/permission/approval, isolated authenticated profile, zero provider requests. [Receipt](review-evidence-2026-10-18/contextual/verification.json), [preview](review-evidence-2026-10-18/contextual/preview.png), [clear result](review-evidence-2026-10-18/contextual/clear.png).
- `npm run verify:browser`: prior native pairing/typing/Stop/logout/content-script regression; expanded excluded-field test.
- `npm run verify:ui-e2e`: **22/22**, preserving the existing desktop review/recheck/Stop flow after shared orchestration extraction.

The Unicode synthetic draft, surrounding whitespace, newline and link text are preserved through Apply/Undo. Source revocation blocks Apply. Intervening typing cannot be overwritten by Undo. Same-session reconnect needs no duplicate native approval. Authenticated logout prevents a fresh connection.

No normal credentials, source approvals or user workspace were changed. No live provider, installed Chrome or actual-platform draft was used. The extension was not automatically installed/reloaded. No new public release or merge was performed. Do not use a previously packaged binary to judge these new endpoints without rebuilding it.

## Next ordered work

Finish CX-03's installed-browser connection/recovery gates and CX-04's actual-browser placement/accessibility checks, then CX-05 adapter failure/formatting gates. Implement and validate CX-06/CX-07 against named real Brevo/organic LinkedIn surfaces with synthetic draft content. CX-08 can then migrate the desktop shell using the selected foundation; the task hierarchy and library/Learn work remain distinct. Preserve the source/runtime/packaged/platform evidence boundaries in every ticket update.
