# Averill: full technical A/B review — 30 October 2026

Candidate B is implemented, locally packaged and technically verified. **No human A/B winner is established: zero independent participants.** This report supersedes the earlier source-only handover for the changes listed here. It does not close all sixteen specifications or assert that every feature is accepted.

## What changed

- Desktop primary destinations are Home, Assistant, Company library, Learn and Public research. Assistant separates Ask, Check my work and Recent checks. A searchable session-only question index reopens a selected answer rather than rendering an endless transcript; logout clears private questions. The introductory message disappears once a question is asked, and a completed answer scrolls into view without tester intervention.
- The library uses compact source rows, explicit versions and grouped version families. Search reveals matching previews. Conflicts remain visible. A personal practice note whose text contradicts approved metadata is labelled for review; approval metadata is not silently changed.
- Local source comparisons identify exact quoted changes between two accessible, approved, nonconflicted documents. Relevant passages beyond the document prefix remain retrievable with provenance. Ambiguous document requests offer concrete choices.
- Tool help is separated from company-document answers. Generic unsupported group/reupload workarounds are rejected; remaining requested goals are stated with follow-up choices. Public checks retain explanations and snippets across surfaces. User-facing errors omit raw Electron wrapper text.
- Canva has Ask / Design checks / Guide, a visible guide catalogue and an expandable step index. Guides highlight a unique visible control and advance after a trusted click; manual step navigation does not establish mastery. The panel stays minimized while selection and slide observations change.
- Reconnection removes extension-owned DOM left behind by the previous isolated world. The actual Canva accessible label “Current text color …” resolves to Text color without transmitting the current value. Extension version: **0.7.1**.

## Matched technical comparison

A is the exact source snapshot taken at the beginning of this request, including prior increments. Its manifest and shared simulator fixture hashes are retained. B is the candidate. Same synthetic inputs and isolated profiles were used. Whole packages differ together, so this comparison cannot attribute causality to individual UI choices.

| Verification | A | Final B |
|---|---:|---:|
| Node unit contracts | 293/293 | 295/295 |
| Original renderer / IPC flow | PASS | PASS, 12 checks |
| Accessibility automation: four roles, 520/960px, 200% zoom | PASS | PASS |
| Canva design adapter, extension UI, guide view, offline rehearsal | PASS on original cases | PASS including new regressions |
| Feedback, multisource intake, browser, contextual review, Canva adapter | PASS | PASS |
| Fixed prompt catalogue invariants | 80/80 | 80/80 |
| New regression: actual Canva text-color name | FAIL reproduced | PASS |
| New regression: stale reconnect panel | FAIL reproduced | PASS |

The 80 prompt checks validate invariants such as citations, provider boundaries and absence of false checked state. They are **not an independently scored semantic-answer benchmark**. Lifecycle, permission and transport checks are separate suites. The two new regression cases were introduced after live discovery; A's earlier PASS applies to the original cases only.

A's initial unit runner omitted shared simulator fixtures; the complete final run passed. The final B sandbox-only invocation could not bind loopback and failed 31 tests with EPERM; the authorized sequential run with loopback passed all 295. A relative packaged-resource path failed to resolve in the first renderer invocation; the absolute-path rerun passed. These harness problems were not hidden by product changes.

### Same-fixture UI measurements

| Scripted measure | A | B |
|---|---:|---:|
| Visible conversation messages | 19 | 2 |
| Indexed questions | 0 | 9 |
| Assistant work views | 0 | 3 |
| Library fixture height in pixels | 633.84 | 481.80 |

These are DOM measurements, not observed human speed, discoverability, conversion or preference. Current B screenshots and metrics are in `B/final-packaged-renderer/`; responsive captures are in `B/final-accessibility/`.

## Live providers and real Canva

Final public-provider checks answered two Italian generic tool/readability requests in model mode (5.35s and 6.14s in these samples). Only generic public operations and official excerpts were transmitted; company AI was disabled and company sources absent. Readability help did not claim an actual visual assessment. A separate generated long-source Nemotron request answered in model mode in 1.84s. These samples establish live transport and the tested answer contracts, not universal answer quality or latency guarantees.

Real Chrome/Canva, installed extension 0.7.1: reconnect displayed one active panel; the Guide catalogue opened; the actual current-color toolbar control was highlighted; a trusted click advanced to the next guide step; Stop removed the pointer. The panel stayed minimized while moving through slides. Local reading reached **5/5 slides**, reporting two contrast findings, not whole-design approval. Stop sharing was visibly confirmed. No design content was edited, exported or published; no private design was sent to a model. Page 1 was restored. View zoom remained 39% rather than the initial 43% because native combo-box entry did not apply. This is a test-session view-state limitation, not a content change.

## Build and evidence

- Updated local app: `travel-desktop/dist/Averill.app`; identical candidate bundle: `travel-desktop/dist/Averill-darwin-arm64/Averill.app`.
- ZIP: `travel-desktop/dist/Averill-macOS-arm64.zip`.
- Integrity: 265 source files, both native helpers, 3257 archive entries verified. ZIP SHA-256: `d8018c62b18e7126d2d76550196cee8e4bb6a67ce94d59e3583cffe098d43292`.
- Previous local app preserved at `/tmp/Averill-before-full-ab-20261030.app`. Normal profiles, source approvals, credentials and company policy were not changed. No commit, push or public release occurred.
- Packaged **resources** passed renderer/IPC and feedback tests in disposable synthetic profiles. This does not establish full native executable installation, signing, OS permission or VoiceOver acceptance. The package remains unsigned.
- Static Impeccable scan completed with font/eyebrow warnings, retained in the evidence. They are not a clean detector result and do not establish measured contrast failures. Approved Companion identity was preserved.
- GitHub progress publication was initially rejected by automatic review as an unapproved external disclosure. After explicit owner authorization, the technical summary was published in epic #58: https://github.com/sararr25/averill-ai/issues/58#issuecomment-6519515502. Acceptance gates remain open.

Evidence directory: [full-ab](review-evidence-2026-10-30/full-ab/). Key receipts: [final verification](review-evidence-2026-10-30/full-ab/final-verification.json), [original flow matrix](review-evidence-2026-10-30/full-ab/flow-matrix.json), [broad flow matrix](review-evidence-2026-10-30/full-ab/broad-flow-matrix.json), [prompt comparison](review-evidence-2026-10-30/full-ab/prompt-comparison.json), [real Canva observations](review-evidence-2026-10-30/full-ab/real-canva-session.json).

## Human A/B study and remaining acceptance

The runnable comparison is prepared in [the study protocol](ab-study-2026-10-30/PROTOCOL.md) with a [local recorder](ab-study-2026-10-30/recorder.html). It uses anonymous participant codes, counterbalanced order, twelve outcome-based tasks per variant, unassisted/assisted/failed outcomes, timing and ease ratings. Recorder JavaScript parses; no participant records are fabricated. The launcher creates synthetic, offline profiles; it does not replace normal data or silently switch installed extensions.

Still unproven: independent first-use success without a guide, a statistically justified human winner, native VoiceOver and actual executable acceptance across OS permissions, independently rated answer precision/completeness, generalized multi-goal coverage, model-synthesized full-document summaries/comparisons and unified semantic retrieval. Current summaries/comparisons are bounded exact excerpts/local changes and are labelled accordingly. Real third-party posting/account-sync flows have not been exercised by these synthetic checks. EX-16 and dependent acceptance gates remain open. This report is a concrete technical improvement and reproducible comparison, not a claim that “everything is perfect”.
