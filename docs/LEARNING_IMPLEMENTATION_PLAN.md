# Canva tutor and weekly practice implementation plan

26 September 2026. Implement a local, offline learning path in the existing Electron app.

1. Add a Learn area using the shared Averill visual tokens. Provide a bounded Canva lesson on selecting, positioning and grouping elements, with official Canva references and contextual help. The employee performs and confirms each step; no geometry verification or automatic Canva operation is claimed. Optional capture remains the existing explicit one-frame OCR path.
2. Persist employee-owned sessions inside the existing workspace JSON. Store lesson, selected approved source/version, confirmed steps, timestamps and week key. No screenshot archive or background tracking. Resume a session after restart and exclude a session from weekly practice.
3. Generate weekly practice from confirmed steps in the current Europe/Copenhagen calendar week. Add source-reading practice only when the linked company source is still approved, visible and not conflicted. A practical exercise uses a transparent employee checklist; no AI mastery score.
4. Enforce owner isolation in main-process actions and snapshots. Reject invented step IDs, out-of-order confirmation, unavailable sources and stale questions. Persist answers and explanation feedback; no outgoing service request is needed.
5. Test persistence, week rollover, person isolation, exclusion, source revocation/conflicts and assessment. Verify the Learn UI in Electron and rebuild the Mac package. Update handover and demo status with actual verification boundaries.

This delivers a guided, employee-confirmed Canva tutor and source-linked weekly practice. General conversational tutoring, automatic visual step assessment and a full arbitrary activity tracker are outside this first implementation.

## Delivered first version

Learn is implemented in `travel-desktop/src/learning-ui.js`; state and weekly practice are in `src/learning.js`, with owner-scoped main-process IPC. The bounded four-step lesson covers selection, Position, alignment and grouping. Contextual help and the official guide are available at each step. Sessions resume locally and can be excluded. Employees can also record confirmed Canva, LinkedIn or newsletter practice with an optional approved company source.

Weekly sets use confirmed activity in the current Europe/Copenhagen Monday-based week: up to two learned-operation questions, a source/version check when linked evidence is still available, and practical reflection. Recorded work supplies a personalised reflection prompt. Feedback uses explicit deterministic answers and self-confirmed practical work; no generative assessment or automatic geometry check is claimed. New activity can refresh the practice set; unavailable/excluded evidence blocks affected questions.

Verification: all 12 Node tests pass. Native Electron UI checked in a separate temporary user-data profile: workspace creation, Learn tab, contextual help, step advancement, weekly question creation, incorrect-answer explanation and practical-reflection completion. Test confirmation records are synthetic. Existing real Canva capture is unchanged; no real Canva design operation or window capture was verified by these checks. Packaged-app rebuild status is recorded in the handover.

Official guidance checked 26 September 2026: https://www.canva.com/help/layer-group-align/ . Interface variants can differ; the app links to the source rather than inventing coordinates.
