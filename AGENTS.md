# Contributor rules for Averill

Read `docs/HANDOVER.md`, `PROJECT.md`, `ARCHITECTURE.md`, and `travel-desktop/design-system/DESIGN_SYSTEM.md` before changing product behavior or UI.

- Averill is the agent. Aurelia Travel is only the fictional demo company. Keep product copy, campaign sources, and developer documentation in English.
- Describe current behavior accurately: the three supplied Electron work windows send structured field state, but findings are produced only while a window is explicitly shared. A selected external Canva window supports one-frame OCR after a separate Review action. Do not claim continuous arbitrary desktop observation or external app control.
- Preserve per-window Share and Stop sharing. Findings belong after field completion or selection and cite a real local source. The employee owns all edits and publication.
- Keep brief v1 and `winter-square-old.svg`; they are intentional fixtures. Do not import Noveris tutor material or its old memory into this repository.
- Use `travel-desktop/design-system/DESIGN_SYSTEM.md` and `tokens.css` as the visual source of truth. The preview is a review artifact, not proof that the running UI matches it.
- Never commit `.env.local`, secrets, API keys, user data, or generated dependency folders. Use `.env.example` only for variable names.
- Run `npm test` from `travel-desktop/` after changes to checks, sources, or IPC. State what was actually verified.

- Learning records belong to the active person. Do not accept an owner ID from IPC or expose another person’s session/quiz. Preserve source approval/version/conflict checks, Copenhagen week keys and explicit employee confirmation.
- Canva tutoring currently means a bounded guided lesson. Do not claim automatic geometry verification, conversational tool control or inferred mastery. Learn must work offline; network/AI use requires a separate product change.
- Run the learning tests alongside existing tests when changing sessions, quiz eligibility or feedback. Keep `docs/HANDOVER.md` and `docs/LEARNING_IMPLEMENTATION_PLAN.md` current.
