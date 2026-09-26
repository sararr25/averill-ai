# Averill product demo plan

Decision record, 23 September 2026; implementation status updated 26 September 2026. The first specialized product path is marketing. Elseweek remains disposable sample data, not the product model. See [HANDOVER.md](HANDOVER.md) for verified behavior and remaining gates.

## Buyer and employee journey

1. An administrator creates a local company workspace with an owner login, uploads Excel/PDF/SVG company material together and reviews bulk employee accounts. The hackathon now demonstrates separate local email/password accounts on one computer; it does not claim network synchronization.
2. The administrator imports a selected folder or files. Each imported file records its original path, checksum, owner, department, status, version, and approval time. Import does not silently make a document authoritative.
3. A department lead reviews proposed sources, assigns source priority, approves or rejects them, and can supersede a version. An administrator can do the same across departments.
4. An employee can add personal context, propose it for department sharing, and see which material is private, pending, approved, or superseded. Only approved department sources can justify a correction to shared work.
5. The employee explicitly shares a work window. Averill observes only that window until Stop sharing, waits for a completed edit or explicit review, and shows a specific finding with the observed value, cited source, and suggested human action.
6. For Canva, the employee can import an exported design for review and explicitly share a Canva window. Window sharing needs macOS screen-recording permission. A screenshot is not equivalent to a structured Canva integration; the UI must identify what was actually inspected.
7. The employee can ask about current approved sources. Sending company content to Nebius requires an explicit per-session disclosure and consent. Tavily searches public web information with a user-visible query; company documents are not sent to Tavily.

## Authority and conflict rules

- Roles: administrator, department lead, employee. An administrator sets up the company and people; a lead may approve sources only in their department; an employee may propose sources and edit personal preferences.
- Approved sources have an explicit priority. If two active, relevant approved sources disagree, Averill shows a conflict and withholds a corrective claim until a lead resolves it. Recency alone cannot resolve the conflict.
- A source citation names the exact imported file and version. If the source is deleted, revoked, or no longer accessible, its finding must disappear or become unavailable.
- Web search results are external evidence, never an approved internal policy. An employee must deliberately promote a result through the source approval workflow.

## Hackathon acceptance path

The judges should see a fresh company setup, source import and approval, an employee entering the marketing workspace, a source-backed correction to a marketing draft, and an exported Canva design review. Then show explicit Canva window sharing and Stop sharing. An optional Nebius answer must disclose data transfer and cite the imported source. A Tavily result must display its public URL and remain separate from company policy.

The intended demo is complete only when these paths survive app restart, role access is enforced in the main process, source status changes affect findings, and failures (missing key, denied screen permission, unsupported file, source conflict) are shown honestly in the UI. Several of these acceptance checks remain open.

## Implementation status

| Area | Current state | Remaining check or gap |
| --- | --- | --- |
| Local onboarding and people | Owner, manager and employee accounts plus workspace data persist on one Mac | Separate local email/password accounts; no cloud/tenant isolation or synchronization |
| Import and approval | File/folder import, private proposal, lead/admin approval, priority and supersession are implemented | Rehearse fresh packaged flow; UI does not expose a Reject action despite support in the source model |
| Marketing work | Three supplied windows, explicit share/stop, fixed campaign findings and cited sources run locally | Only fixed scenarios have specialized rules; imported company sources do not generate continuous field-level findings |
| Nebius | Fixed campaign pack previously passed a live answer; company path has opt-in and local fallback | Live company-source request was blocked pending specific approval of the test payload |
| Tavily | A public-query search returned results in the dev app | Recheck in the packaged app with a configured key |
| Canva | Exported file text import and one-frame window OCR are implemented | Real Canva-window capture, Screen Recording denial, and Stop sharing still need an end-to-end check |
| Mac package and UI | Unsigned arm64 `.app` built; Review hierarchy and supplied windows visually checked | Owner acceptance of visual fidelity, signing/notarization and full demo rehearsal remain open |

## Implementation order

1. Persistent local workspace, roles, document import, approval, version and conflict model.
2. Onboarding and management UI using the approved Petrol / Coral / Ice design system.
3. Marketing assistant grounded in approved imported sources while preserving the existing deterministic campaign fixture.
4. Nebius consent and Tavily public-web search with clear boundaries.
5. Exported Canva file review and explicit window capture with permission and stop controls.
6. End-to-end rehearsal, packaging, and exact-boundary documentation.

## Video programme — company onboarding, guided work and weekly learning

Updated 26 September 2026 following the owner’s direction. The opening is company-data onboarding across departments, rather than a presentation of the travel website. Canva demonstrates learning the tool. A weekly employee test closes the learning loop. Elseweek is the fictional customer; Averill remains the product.

### Narrative

Company knowledge → department context → employee learns while working → employee applies the learning → weekly practice and feedback.

Show one employee’s marketing week after establishing that the company workspace contains multiple departments. Marketing is the detailed example; other departments establish the organisation and access model, not unimplemented specialised capabilities. Working duration: about four minutes, adjustable once submission requirements are confirmed.

| Time | Scene | Concrete screen action and outcome | Implementation boundary |
| --- | --- | --- | --- |
| 00:00–00:45 | Company and department onboarding | Administrator creates Elseweek and departments, adds people, imports a small synthetic source pack by department. Show company-wide brand guidance, a Marketing campaign brief and one Operations procedure. A lead approves a proposed source. Switch to the marketing employee and show their available context | Local accounts, bulk file onboarding, Nebius interpretation and source approval exist. Use the mixed-format Elseweek intake. Accounts are local to one Mac, not multi-device collaboration. Verify actual visibility rules instead of assuming access |
| 00:45–01:40 | Learn Canva while doing a real task | Employee shares a Canva window and asks “Help me turn this into a LinkedIn campaign visual.” Averill gives one step at a time: choose the agreed format, improve text hierarchy, align elements, then export. Employee performs the actions. Show one clarification and one confirmed learning step | The four-step guided lesson and learning records are implemented. Conversational tutoring and visual step verification remain future work. Current one-frame OCR reads visible text; it cannot reliably verify alignment, hidden layers or export settings. Validate each guidance source and observed state before recording |
| 01:40–02:15 | Apply learning to a LinkedIn draft | Employee uses the creative and drafts a post. Averill helps apply approved tone/message and explains why a suggested change fits the brief. The employee makes the edit | LinkedIn-specific supplied editor and approved synthetic source pack are implemented. Explicit sharing checks the listed campaign requirements; it is not an external LinkedIn integration. Existing Social Publisher is Instagram; do not transfer its Reel date/disclosure rules to LinkedIn |
| 02:15–02:50 | Prepare the newsletter | Employee selects audience and launch date. Averill highlights one mismatch, cites the current campaign source and explains the correction | Existing Email Studio supports the supplied campaign checks. Approved email is 15 October 2026 at 10:00 Europe/Copenhagen. Rehearse with coherent Elseweek sources |
| 02:50–03:45 | Weekly employee practice | Open “Your week”, showing recorded activities and confirmed learning. Start a short personalised test: one Canva workflow question, one campaign audience decision and one practical copy exercise. Show an answer, explanation and a suggested next practice step | Confirmed activity history, weekly operation/source-version questions and reflection feedback are implemented. Campaign-audience assessment and automatic practical scoring are not. Use seeded synthetic records only if clearly labeled; do not describe them as automatically collected real history |
| 03:45–04:00 | Close the loop | Show the next learning goal and Stop sharing. Close with the employee’s ability to work more independently with company context | A next-practice suggestion is implemented; editable long-term learning goals remain future work; the employee owns all work and publishing |

### Weekly test specification for the demo

- Input: employee-visible department sources, explicitly recorded work sessions, learning goals and steps the employee completed or confirmed. Distinguish “practised”, “help requested” and “demonstrated in an exercise”; observing a screen alone does not establish mastery.
- Record scope: selected task, relevant approved source/version, learning topic, completed practice and employee confirmation. Do not require continuous background screen recording or storage of raw screenshots to create a learning record.
- Preview: show what the week contains before starting the test. Let the employee correct or omit a misclassified activity.
- Test: three short tasks tied to that week. One recall/workflow question, one decision scenario grounded in a source, and one practical application. The full test can take a few minutes; the video shows an edited excerpt.
- Feedback: explain the expected reasoning, link the relevant approved company source or validated tool guidance, and offer a targeted follow-up exercise. Do not treat confidence in an AI answer as a verified skill score.
- Completion: employee sees learning progress and chooses the next practice goal. Keep this demo about formative learning; manager reporting and employment evaluation are not defined by this plan.
- Source changes: reference the current approved brief. If the week involved an older source, explain the version change rather than marking the employee wrong without context.

### Canva learning specification

The main value is guided learning, with campaign checks as supporting context. Show a small task that the employee finishes themselves, rather than a long tutorial or automatic editing.

1. Employee states the goal and explicitly shares the Canva window.
2. Averill identifies what it can actually inspect and gives the next supported step.
3. Employee follows the step or asks “Where do I find that?”
4. Averill explains the operation with validated guidance; any pointer must match the visible interface.
5. Employee confirms completion; verification is only claimed where the implementation can establish it.
6. Save the specific learning topic to the employee’s weekly record after confirmation.

Tool guidance and company policy are different evidence types: Canva operation guidance comes from validated tool documentation; the campaign message/branding comes from approved company sources. Neither silently overrides the other.

### Supporting scenes

Version handover remains a strong optional scene: open brief v1, ask what changed, inspect v2. The current supplied path is verified and can replace a secondary scene if recording time is short. The website is optional context, not the opening or a claimed integrated review feature. Public research, extra social channels, booking and a long settings tour remain outside the main cut.

### Preparation order

1. Prepare a coherent Elseweek company pack across departments, with owners, visibility, approval and versions; retain the intentionally superseded campaign fixtures.
2. Rehearse actual onboarding, import, approval and employee visibility in the packaged app.
3. Implement the learning-session record and employee “Your week” view, with employee review of recorded topics.
4. Build a bounded Canva tutoring path; verify real capture, validated guidance, step handling, permission denial and Stop sharing. Current OCR alone does not satisfy this feature.
5. Add the LinkedIn-specific draft and approved source path; rehearse newsletter checks.
6. Implement the weekly practice flow and feedback using confirmed sessions and accessible sources. Verify that activities from another employee/department do not enter the test.
7. Rehearse the complete story with resettable synthetic state, then record working features. Label seeded history and conceptual screens honestly; a source review must not be presented as live Canva tutoring.

### Recording acceptance

Onboarding establishes company and department context. The employee visibly learns a Canva operation, applies it to marketing work, then receives relevant weekly practice and useful feedback. All demonstrated actions work and claims match implementation. Sharing is explicit, corrections are human-owned and no automatic send/publication is implied. The guided Learn path is implemented and verified as employee-confirmed practice; the broader conversational/visual tutoring shown in the target narrative remains future work.

## Implementation update — guided practice v1

The initial Learn flow is implemented: four-step Canva lesson with official references and help; confirmed session persistence; manual confirmed work records; source-linked weekly practice and feedback. The prototype can now demonstrate learning and a personalised weekly review using clearly identified synthetic test activity. Its tutoring is bounded and employee-confirmed. General conversation, visual verification of alignment/export, automatic work tracking and general LinkedIn integration remain outside the implemented path. See `LEARNING_IMPLEMENTATION_PLAN.md` and `HANDOVER.md` for checks.

## Elseweek pack / LinkedIn update — 26 September 2026

Preparation steps for department pack and LinkedIn supplied editor are delivered. Import follows `travel-desktop/demo-company/elseweek/README.md` with explicit department, version, review and approval. Company-wide brand context is copied consistently into each department; no company-wide scope or authentication was added. The organic LinkedIn slot is 16 October, 09:00 Copenhagen, with its own landscape creative and CTA. The bounded editor checks five specific requirements, not general audience/copy reasoning. Canva capture/acceptance, richer weekly assessment and the full recording remain open; no work on those paths is included in this delivery.

## Updated onboarding and identity scene

The owner now creates a local email/password account and uploads existing mixed-format company material in one batch. Nebius explicitly interprets extracted text; the owner reviews people and source metadata, confirms approval and receives generated credentials saved in separate local login documents. Demonstrate separate owner, Marketing manager, Marketing strategy employee and Content creator logins with Sign out/Sign in. Company brand sources are shared across departments; staff roster is private. This supersedes the earlier role-switching-only onboarding narrative. Roles/learning remain local to one Mac, not a synchronized multi-employee service.

## Login documents and current continuation

The user requested one retrievable document per demo login. These are saved automatically for owner setup and generated team accounts, outside the repository. See ONBOARDING_TUTORIAL.md. The normal Mac workspace currently remains Aurelia Demo with one legacy admin and no configured credentials. Activation in that workspace versus a separate Elseweek demo remains awaiting the user choice; do not confuse /tmp synthetic test profiles with the normal workspace. HANDOVER.md contains executable paths, verification and remaining checks.
