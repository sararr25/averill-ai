# Ask Averill in the working page — product specification

## Owner clarification — Vamo demo acceptance, 18 October 2026

The owner chose the existing Vamo mock social/email pages as the hackathon demonstration environment. Averill remains the product; Vamo is the independent fictional customer. The first milestone uses `demo-tools/social-simulator` at `/brevo` and `/linkedin`, with synthetic drafts and no sending or publishing. This replaces the earlier requirement to obtain real platform accounts for this milestone. Installed-Chrome transport/permissions, manual accessibility and packaging remain separate checks. Older real-platform acceptance issues stay open.

Status: owner product decisions confirmed on 18 October 2026; implementation planned. The audit, delivery order and evidence boundaries are recorded in the companion contextual UX audit. This specification does not claim the new experience is implemented.

## Problem Statement

Employees ask Averill for help while writing an email or social post, but must connect a field, move between Work and Review, and inspect a separate application before returning to their draft. The interface exposes too many equally prominent areas and supporting controls. Advice arrives away from the place where it is useful, and acting on it takes additional manual interpretation. The owner found the current UI, UX and composition unintuitive during direct testing.

## Solution

Keep assistance in the employee's tool. After initial connection, selecting a supported draft and clicking Ask Averill shows an anchored compact card with a specific correction and approved source. The card expands into an in-page side panel for other findings and supporting passages. A safe, individual edit can be previewed, explicitly applied, undone and rechecked. Opening the full Averill app is optional and explicit, for deeper company/source exploration. Rebuild the app's information hierarchy and explore a completely new Averill palette and typography. Email and LinkedIn lead delivery; Instagram and Canva follow through dedicated, evidence-bound tickets.

## User Stories

1. As an employee, I want to ask about the selected draft in the page where I work, so that I can keep my place.
2. As an employee, I want a specific correction immediately after Ask Averill, so that I do not have to write a second question.
3. As an employee, I want one important suggestion to lead the response, so that I know where to start.
4. As an employee, I want to see the original passage alongside the proposed change, so that I understand the difference.
5. As an employee, I want a short reason for each correction, so that I can judge it quickly.
6. As an employee, I want the source title and version next to the suggestion, so that I know its authority.
7. As an employee, I want the exact supporting passage to expand in the page, so that I can verify it without changing applications.
8. As an employee, I want other findings behind a clear count and expandable panel, so that the first response stays compact.
9. As an employee, I want an explicit Open in Averill link, so that I can choose deeper investigation.
10. As an employee, I want that link to open the correct source and review context, so that I do not have to search again.
11. As an employee, I want the card positioned away from my text and editor controls, so that it does not obstruct work.
12. As an employee, I want the card to adapt to scroll, zoom and small viewports, so that it stays usable.
13. As an employee, I want to dismiss help without losing my draft, so that I remain in control.
14. As an employee, I want Stop sharing to be visible, so that I can end access immediately.
15. As a first-time employee, I want guided browser connection, so that I do not need to understand pairing JSON.
16. As a returning employee, I want routine review to avoid repeated setup, so that asking remains lightweight.
17. As an employee, I want the tool to recognize supported editor context, so that I need not choose the work type repeatedly.
18. As an employee, I want a clear unsupported-editor state, so that I do not mistake missing access for a clean result.
19. As an employee, I want to preview each proposed edit before applying it, so that I can control what changes.
20. As an employee, I want Apply to change only the chosen passage, so that unrelated content and formatting remain intact.
21. As an employee, I want Undo after a confirmed edit, so that I can restore the previous content.
22. As an employee, I want a stale edit blocked if I have changed the draft, so that old advice cannot overwrite new work.
23. As an employee, I want ambiguous or unsupported changes explained instead of applied, so that my editor remains reliable.
24. As an employee, I want Undo to preserve intervening typing, so that recovery cannot destroy later edits.
25. As an employee, I want a recheck after a correction, so that I know whether the checked conflict remains.
26. As an employee, I want advice invalidated when I type or change field, so that the result matches the current draft.
27. As an employee, I want revoked or superseded sources to invalidate advice, so that old company guidance is not applied.
28. As an employee, I want pending, failed, no-conflict and insufficient-evidence states distinguished, so that I understand the result.
29. As an employee, I want useful local checks when company AI is disabled, so that assistance remains available offline.
30. As an employee, I want required AI consent inside the working surface, so that reviewing does not force an app switch.
31. As an employee, I want private company information kept out of public fact-checking, so that asking for help does not expose internal work.
32. As an email author, I want the supported email composer to preserve links and formatting through Apply and Undo, so that corrections do not damage the draft.
33. As a LinkedIn author, I want organic company-post guidance in the real composer, so that a demo editor is not my only supported workflow.
34. As an Instagram author, I want a named supported caption workflow, so that I know which view has actually been tested.
35. As a Canva author, I want supported design text checked where I work, so that I can fix wording without leaving the design.
36. As a Canva author, I want text checking distinguished from layout evaluation, so that I do not rely on unverified visual conclusions.
37. As an employee, I want the desktop app to have one current-work destination, so that Review and Work do not split my task.
38. As an employee, I want a reader-first company library, so that I can find brand guidance without navigating approval forms.
39. As an authorized reviewer, I want a separate source/rule approval queue, so that administration stays focused and accountable.
40. As an employee, I want one clear next learning activity and compact history, so that Learn is understandable.
41. As a keyboard user, I want predictable focus and focus restoration, so that contextual assistance is fully operable.
42. As a screen reader user, I want labelled controls and meaningful status announcements, so that I understand changes without visual cues.
43. As a motion-sensitive employee, I want reduced motion respected, so that guidance remains comfortable.
44. As an employee, I want legible contrast and text at 200% zoom, so that the interface remains readable.
45. As the product owner, I want distinct visual directions on comparable real states before selecting new tokens, so that identity decisions are concrete.
46. As the product owner, I want Averill to remain visually independent from Vamo, so that the product and demo company stay distinct.
47. As the product owner, I want platform-specific manual evidence as well as automated tests, so that compatibility claims reflect real behavior.
48. As the product owner, I want a measured routine interaction budget, so that the redesign demonstrably removes steps.

## Implementation Decisions

- Keep the existing Electron desktop, browser extension and authenticated loopback architecture. Reuse local task review and the Nemotron review agent; do not create a second advice engine in the extension. React, Tailwind and shadcn are not migration requirements.
- Extend the main-process trust boundary with a narrow contextual-review capability. The extension receives a sanitized result for the bound person/session/tab/origin/field/revision and request generation. Never expose a whole workspace snapshot, library or provider credentials.
- Extract shared review orchestration from the renderer-only entry without weakening sender checks. Validate policy, eligible sources, exact quotes, source version/approval and observation identity on request, result delivery, preview and Apply.
- Return bounded findings, optional exact edit proposals, source metadata, minimum authorized citation text, checked scope, provider/mode and an explicit result state. Exact implementation types belong to the implementation ticket; current prose suggestions are not executable patches.
- Bind edits to a stable editor/field identity, original text and revision, exact range or unique passage, replacement and current source authority. Reject ambiguous matches and unsupported rich-text mapping. For missing text, preview an explicit validated insertion location; never guess one.
- An adapter applies only the requested patch after preview confirmation and verifies the resulting editor value. Keep enough ephemeral pre-edit content/formatting to undo that action without persisting a draft history. A source change or session invalidation disables a pending patch.
- After Apply, a separate read-only recheck may run over the same explicitly shared field. It cannot expand capture or trigger additional writes. AI recheck follows the existing consent rules.
- Undo requires the current editor revision to match the applied revision; otherwise block destructive restoration and offer explicit manual recovery. Each new Apply requires its own confirmation. There is no Apply all, automatic publication or model-controlled editor tool.
- Existing manual-edit-only rules are explicitly superseded for this planned, user-confirmed single-patch capability. Update contributor rules and architecture when implementing it. Other permissions and approval rules remain in force.
- Add an isolated contextual UI component with compact card and expandable in-page panel. Isolate styling from host CSS; remember that DOM-inserted information is still exposed to the hosting page. Full confidential documents stay in the desktop app. Host-page script isolation is not document confidentiality.
- Provide in-page request consent and clear local/AI state. Reuse the existing Nebius/Tavily clients and outbound policy gates. Tavily receives only separately confirmed public text or public URLs.
- Replace manual pairing JSON with an authenticated, guided connection design. Retain activeTab, explicit field sharing, short-lived session credentials, exact tab/origin binding and Stop/logout/expiry cleanup. Reconnection cannot silently grant persistent all-site access. If implementation needs new permissions or a native helper, document the concrete protocol and permission impact before adoption.
- The initial email adapter targets the project's existing Brevo workflow. Additional email products require separate compatibility work. The LinkedIn adapter targets organic company posts. Record exact supported views for Instagram and Canva; cross-origin frames, closed editors and geometry are not implicitly supported.
- Redesign desktop navigation around current work, company library and Learn, with administration/account actions separated and role-correct. Source deep links preserve context but revalidate authorization before showing content.
- The owner authorized a full visual identity exploration. Produce three comparable visual directions and obtain selection before replacing the visual source of truth. Keep Averill distinct from Vamo. Use semantic tokens, bundled licensed fonts, consistent iconography, calm state transitions and accessible controls.
- No workspace schema migration is assumed necessary. Contextual request/edit/undo state is ephemeral; existing user data, source approvals, ownership and storage compatibility must survive.

## Testing Decisions

- Test externally visible task outcomes rather than markup structure or private helper calls. The principal seam is the extension-to-main-process-to-editor loop: Ask → cited finding → preview → Apply → Undo/recheck → Stop.
- Extend existing browser bridge and native UI harnesses as prior art. Deterministic synthetic sources and fake network replies cover repeatable full flows; label those results as synthetic.
- Add targeted contract/unit cases for request races, source authority changes, patch applicability, sensitive-field exclusions and formatting restoration. These protect behavior not reliably covered by visual checks alone.
- Exercise local-only mode with zero outbound requests; company AI off; required consent accepted/cancelled; provider failure with local fallback; late results after typing, logout, navigation and Stop; changed source approval/version; tab/origin mismatch; duplicate passages; IME; host editor rerender; expired undo; intervening typing.
- Verify immediate feedback within 150ms, waiting status within 300ms, and target p95 local result ≤1s on a named machine. Report cloud timings separately. Count post-setup actions and application switches; zero full-app switches are permitted in the ordinary supported correction loop.
- Verify compact/panel/desktop layouts, source expansion, keyboard order and focus restoration, screen reader semantics, contrast, reduced motion, 200% zoom and edge-of-viewport placement. Stop remains visible while sharing.
- For the owner-selected demo milestone, use the existing Vamo mock Brevo and organic LinkedIn editors. Capture preview, Apply, formatting preservation, Undo, recheck and Stop without sending/publishing. Label simulated browser transport/approval separately. Older real-platform tickets remain open.
- Rebuild and verify the final packaged desktop plus the corresponding extension. Rehearse email and LinkedIn as the first milestone. Keep Instagram/Canva support explicitly pending until separately accepted.
- The owner initially confirmed real-platform acceptance, then replaced the first milestone environment with the Vamo mockups. Apply/Undo behavior follows the owner's selected correction mode and adds mandatory editor-adapter acceptance.

## Out of Scope

Automatic sending, posting, scheduling, changing recipients or audiences, bulk application, autonomous editor actions, production cloud sync/authentication, automatic extension installation, silent whole-page surveillance, Vamo redesign, a framework migration, guaranteed support for every email client, and a claim of Canva layout/color/geometry verification based on selected text or OCR. This spec does not select the new palette or typeface before reviewing design directions. Mobile apps and native desktop editor writeback are not part of the initial browser milestone.

## Further Notes

The delivery plan defines thirteen independently verifiable tickets and keeps prior acceptance issues open. A follow-up platform may require a dedicated access method; a feasibility result is not a passing implementation acceptance. Full four-platform support remains incomplete until all named flows pass. No implementation, release or final hackathon submission is performed by publishing this specification.
