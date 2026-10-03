# Averill — submission draft

Preparation draft, 3 October 2026. **Not submitted.** TODO fields require real evidence or owner input. Requirements: [docs/SUBMISSION_REQUIREMENTS.md](docs/SUBMISSION_REQUIREMENTS.md).

## Tagline

Company knowledge, useful corrections and guided practice while employees work in their own tools.

## Inspiration

Company guidance often lives in documents away from the place where work happens. Averill connects an employee's explicitly shared work with approved company sources, explains a specific inconsistency and helps the employee practise the correction.

## What it does

A company owner creates a local workspace, imports documents and reviews people and source authority. Employees can consult approved guidance, explicitly share one external window or selected browser field, inspect a cited finding and make their own correction. Guided Canva lessons and person-owned weekly practice support learning. Vamo is the fictional sample company.

The prototype runs on one Mac with separate local accounts. Its external checks are bounded text/rule checks. Browser field sharing is opt-in; platform acceptance remains pending. Canva steps are employee-confirmed, without automatic geometry assessment. There is no automatic editing, email sending or social publishing.

## How we built it

Electron provides the desktop companion and isolated local account/workspace state. Native macOS helpers read an explicitly selected window through Accessibility or visible-text OCR. An optional activeTab browser extension sends one selected field to an authenticated, ephemeral loopback endpoint after an edit pause. Source approval, role visibility, version and conflict checks determine which local documents can support advice.

Optional Nebius Token Factory inference interprets permitted excerpts only after the relevant AI consent. The task-review path validates exact observed and source quotations before displaying model suggestions. A generated synthetic email and policy passed a live request using NVIDIA `nvidia/nemotron-3-super-120b-a12b` on 3 October 2026. Deterministic review remains available offline. Tavily supports explicit typed public queries separately from internal company policy.

## NVIDIA model and Nebius use

Model: `nvidia/nemotron-3-super-120b-a12b`, served by Nebius Token Factory. We use prompt-based inference, not fine-tuning. The model interprets bounded task and approved-source text; exact citation validation and local authority checks constrain what can appear. The selected variant was available from the provider model listing and completed the live synthetic smoke. No comparative performance claim is established by one request.

TODO: include a consented runtime request in the recorded application demonstration. Do not show any key or private company material.

## Validation and challenges

47 automated tests plus isolated native feedback, task-review and browser IPC/content-script smoke checks cover local behavior. The app and ZIP are verified together. Real email account access, installed Chrome extension behavior, full packaged rehearsal, permission denial and physical display checks remain acceptance gates. Keeping authority, privacy, model suggestions and employee confirmation distinct is central to the implementation.

## What is next

Complete real-platform acceptance, signing/notarization, broader supported field schemas and richer tool guidance. Cross-device identity/synchronization and general visual coaching are future work.

## Links and owner fields

- Repository: https://github.com/sararr25/averill-ai — MIT, setup in README.md.
- Track proposed: Best apps and agents.
- Video: TODO public YouTube URL, final cut 2:50.
- Demo/test build: https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004 — verify release publication and clean judge download; unsigned macOS arm64.
- Submitter type / organization / residence / province: TODO owner confirmation.
- New or existing before 26 August / significant updates: TODO owner confirmation against project history.
- Model quality (1–10), Nebius recommendation (1–10), inference experience (1–10): TODO owner ratings.
- Other-model comparison: no controlled comparison established; owner may add actual experience only.
- Platform improvements / NVIDIA model-team wishes: TODO owner feedback.
- Tavily runtime usage / IRL city: TODO confirm demonstrated runtime use and actual attendance.
- Age / non-affiliation eligibility: TODO owner declarations after reading rules.
