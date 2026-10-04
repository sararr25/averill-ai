# Vamo demo migration — 3 October 2026

Current status, 4 October 2026: the Guided UI release is public at [v0.1.0-preview.20261004.2](https://github.com/sararr25/averill-ai/releases/tag/v0.1.0-preview.20261004.2). See [PROJECT_STATUS_2026-10-04.md](PROJECT_STATUS_2026-10-04.md) and [NEXT_STEPS_2026-10-04.md](NEXT_STEPS_2026-10-04.md) for current evidence, ordered checks and pending fixes. Dated earlier sections are historical where superseded.

The shipped source pack, current artwork, four supplied editors, mixed-format intake, synthetic tests and new-demo identities now use Vamo. Averill remains the independent assistant with its own Petrol / Coral / Ice design. Vamo creative uses its own cream/sea/mint/coral/fuchsia palette and Fraunces/DM Sans. The original superseded brief and Aurelia square remain unchanged as intentionally historical examples.

## Fresh coherent demo

Use a separate local profile for rehearsal, create Vamo with `alex@vamo.example`, and import the six files in `travel-desktop/demo-company/vamo-intake/`. Review company/department/private scopes and versions; brand context and People guide are v2. Approve sources explicitly. Generated staff identities use reserved `vamo.example` addresses. Account/password documents remain local and ignored. The manual alternative is `demo-company/vamo/`; follow its department/version instructions.

## Existing normal profile

This source migration does **not** rewrite the existing Aurelia Demo workspace, Elseweek account emails, password hashes, saved login documents, imported copies, source approvals, source IDs, learning records or old draft keys. Existing credentials still work. New supplied-editor drafts use `vamo:v2:<kind>:person:<id>`; earlier `elseweek:v1` and `aurelia` keys remain untouched and are never silently assigned to the new demo.

To update an existing workspace, use authenticated administrator import/review to add the new files, inspect differences, explicitly link approved replacements to their predecessors and then supersede outdated documents. Do not edit stored approved source text or hashes behind the app. Keep legacy login addresses unless the owner deliberately changes identity in a separate account migration. A source label update is not permission to reset passwords or replace another person's learning history.

The preparation helper remains a **legacy-only** tool and refuses an already credential-bearing workspace. It must not be rerun to perform this migration.

## Current evidence

The updated automated intake test exercises the Vamo XLSX, SVG and PDF, local credentials, duplicate exclusion, company visibility, private roster and restart. Manual native chooser and account/platform rehearsal remain separate acceptance gates. An old imported People guide describes role switching; replace and explicitly reapprove it using the new v2 guide before presenting current company policy.
