# Contributor rules for Averill

Read `docs/HANDOVER.md`, `PROJECT.md`, `ARCHITECTURE.md`, and `travel-desktop/design-system/DESIGN_SYSTEM.md` before changing product behavior or UI.

- Averill is the agent product. Vamo is the independent fictional travel-company brand shown in `travel-site/`. They must never share a name, logo, palette or interface style. The desktop fixtures and source pack still use legacy Elseweek wording; do not claim that migration is complete. Keep product copy, campaign sources, and developer documentation in English.
- Describe current behavior accurately: Vamo is an independent demo-company website, while Averill is the companion product. Legacy desktop fixtures still use Elseweek. Employees create work in their existing tools. The four supplied Electron editors are hackathon fixtures; their structured field findings require explicit sharing. An explicitly selected external window can be read once or polled locally every six seconds through macOS Accessibility or visible-text OCR. The floating button opens Averill, shows status and stops observation; it does not itself read the screen. Do not claim arbitrary desktop surveillance, hidden-field or visual-geometry understanding, external app control, or verified platform integrations.
- Preserve per-window Share and Stop sharing. Findings belong after field completion or selection and cite a real local source. The employee owns all edits and publication.
- Keep brief v1 and `winter-square-old.svg`; they are intentional fixtures. Do not import Noveris tutor material or its old memory into this repository.
- Use `travel-desktop/design-system/DESIGN_SYSTEM.md` and its `tokens.css` as the visual source of truth for Averill. Use `travel-site/design-system/DESIGN_SYSTEM.md` and its `tokens.css` for Vamo. Never cross-apply either brand. A preview is a review artifact, not proof that the running UI matches it.
- Never commit `.env.local`, secrets, API keys, user data, or generated dependency folders. Use `.env.example` only for variable names.
- Run `npm test` from `travel-desktop/` after changes to checks, sources, or IPC. State what was actually verified.

- Learning records belong to the active person. Do not accept an owner ID from IPC or expose another person’s session/quiz. Preserve source approval/version/conflict checks, Copenhagen week keys and explicit employee confirmation.
- Canva tutoring currently means a bounded guided lesson. Do not claim automatic geometry verification, conversational tool control or inferred mastery. Learn must work offline; network/AI use requires a separate product change.
- Run the learning tests alongside existing tests when changing sessions, quiz eligibility or feedback. Keep `docs/HANDOVER.md` and `docs/LEARNING_IMPLEMENTATION_PLAN.md` current.

- Use the Elseweek pack README for department import/version/approval; do not import the root pack as one department or auto-approve files based on text. Preserve private proposals and role visibility.
- `linkedin` is an organic company-post fixture. Keep its rules/source separate from paid Instagram Reel disclosures and dates. Supplied fixtures are static; do not imply imported approval controls them or that LinkedIn publication/API access is implemented.
- Preserve the old Aurelia localStorage namespace and historical square artwork. Current work uses `elseweek:v1:<kind>` and Elseweek assets.

- New workspace creation requires owner email/password. Preserve async scrypt hashing and sender/session guards; authenticated person is main-process state. After auth activation, never restore passwordless role switching or persisted login. Keep credentials and onboarding evidence internals out of public snapshots.
- Imported staff cannot receive admin privileges. Four account profiles map owner→admin, marketing_manager→lead, marketing_strategy/content_creator→employee. Onboarding approval and account creation require an authenticated admin; Learn remains scoped to that person.
- Personnel imports stay private. Company-wide sources need admin approval; department leads cannot approve them. Nebius intake requires explicit file-text consent and matching source evidence for identities. Preserve upload/review drafts on failure, duplicate exclusions and apply rollback. Do not send credentials/keys or file binaries to Nebius.
- The mixed demo pack has synthetic `.example` accounts and no passwords. Owner and generated account credentials are saved as local demo login documents; do not commit generated credentials/user-data. Admin reset of another non-owner local account and self-service password change are implemented. No employee cloud authentication, background sync, unauthenticated owner recovery or invitation email is implemented.

- The normal Mac workspace now has four prepared logins and encrypted Nebius/Tavily keys. Read HANDOVER.md before touching user data. demo-login-documents is ignored; never commit it. scripts/prepare-local-demo.cjs only prepares legacy workspaces without credentials and must refuse an already configured workspace. Keep keys outside the distributed app.

- Multisource imports must remain local by default. Preserve owner AI policy, per-file consent and restricted/credential exclusion in intake and company answers. Do not bypass HTTPS address/redirect checks or expose cloud tokens. Read docs/COMPANY_CONFIDENTIALITY.md and docs/CLOUD_CONNECTIONS.md; provider NDA/retention/opt-out and live OAuth are unverified.
