# Contributor rules for Averill

Read `docs/HANDOVER.md`, `PROJECT.md`, `ARCHITECTURE.md`, and `travel-desktop/design-system/DESIGN_SYSTEM.md` before changing product behavior or UI.

- Averill is the agent. Aurelia Travel is only the fictional demo company. Keep product copy, campaign sources, and developer documentation in English.
- Describe current behavior accurately: the three supplied Electron work windows send structured field state, but findings are produced only while a window is explicitly shared. A selected external Canva window supports one-frame OCR after a separate Review action. Do not claim continuous arbitrary desktop observation or external app control.
- Preserve per-window Share and Stop sharing. Findings belong after field completion or selection and cite a real local source. The employee owns all edits and publication.
- Keep brief v1 and `winter-square-old.svg`; they are intentional fixtures. Do not import Noveris tutor material or its old memory into this repository.
- Use `travel-desktop/design-system/DESIGN_SYSTEM.md` and `tokens.css` as the visual source of truth. The preview is a review artifact, not proof that the running UI matches it.
- Never commit `.env.local`, secrets, API keys, user data, or generated dependency folders. Use `.env.example` only for variable names.
- Run `npm test` from `travel-desktop/` after changes to checks, sources, or IPC. State what was actually verified.
