# Contextual assistant and guided-help research

Date: 29 October 2026 (Europe/Copenhagen). Research precedes the implementation requested in this session.
Audience: individual employees and enterprise teams using Averill beside their existing work tools.
Scope: Watch on Canva, the main Averill panel, and Ask Averill; delivery priority is the 30 October submission, followed by a longer-term guidance system.

## Executive read

The closest reference is a combination of Copilot Vision's requested visual guidance and WalkMe/Whatfix's reliable element-based walkthroughs. These products document an explicit transition from asking a question to being shown the next action in the application. Their guidance attaches to a specific control and advances through a user's action or an observed condition; a long article is a different format. Scribe and Guidde add useful examples of visual, reusable instructions, but their recorded guides should not be confused with live interpretation of the current screen. Averill already has company authority, bounded Canva readings, and source-backed help; the supplied screenshot shows those mechanics overwhelming the employee-facing answer. The immediate opportunity is to make one useful answer and one next action prominent, offer an interactive guide, and reserve evidence and service diagnostics for expandable details. These vendor documents establish available interaction patterns, not comparative usability or measured effectiveness; the direction still needs real Canva and owner testing.

## Primary-source comparison

| Product | Documented behavior | Transfer to Averill | Limit and evidence |
| --- | --- | --- | --- |
| Microsoft Copilot Vision | An explicitly started session shares selected content; answers can highlight relevant screen regions. It guides without clicking, typing, or scrolling for the user. | A visible connection state, persistent Stop, and an explicit **Show me in Canva** action. Highlight what the employee should click while leaving the click to them. | Current support describes rollout variation; do not copy account/region assumptions or data-retention promises into Averill. [Using Copilot Vision](https://support.microsoft.com/en-au/microsoft-copilot/using-copilot-vision-with-microsoft-copilot). The product team's launch example specifically calls the interaction “show me how”: [Highlights announcement](https://www.microsoft.com/en-us/microsoft-copilot/blog/2025/06/12/copilot-vision-on-windows-with-highlights-is-now-available-in-the-u-s/). |
| WalkMe Smart Walk-Thrus | An instruction balloon is attached to an on-screen element; triggers advance the flow. Start points accommodate users already mid-process; goals and milestones track progress. | One current instruction with Back, Next, Exit; prefer detected click/condition advancement. Resume at the applicable step rather than always restarting. | These are authored flows with explicit element matching, not evidence that arbitrary AI-generated steps work. [Getting started](https://support.walkme.com/knowledge-base/smart-walkthru-getting-started-guide/). |
| WalkMe appearance and QA | Highlights can frame an element; element-not-found and changing layouts need handling. QA explicitly includes blocked information, smaller viewports, wrong clicks, and mid-process starts. | Resolve an actual visible, unique control before highlighting; reposition on scroll/resize; provide a manual route if missing. | Do not guess coordinates or silently treat a missing element as a completed task. [Appearance settings](https://support.walkme.com/knowledge-base/appearance/), [QA checklist](https://support.walkme.com/knowledge-base/quality-assurance-testing/). |
| Whatfix | Self Help offers page-contextual help and repository-backed summarized answers. Flows and visual content coexist. Spotlight can restrict interactions to the current target. | One contextual help entry point; a short answer with optional guide and sources. Use a nonblocking highlight by default so employees can continue work. | Blocking Spotlight is an available vendor feature, not the recommended Averill default. [Self Help best practices](https://support.whatfix.com/docs/self-help-best-practices), [Spotlight behavior](https://support.whatfix.com/studio/docs/enabling-spotlight-feature). |
| Scribe | Captures a performed process as screenshots, text, and cursor-click steps; click targets identify the intended location and are editable. | A reusable visual step library and a compact example beside a short instruction. | A captured location belongs to that recording, not necessarily the current Canva UI. Do not use a historic screenshot to imply a current observed target. [Scribe 101](https://support.scribehow.com/hc/en-us/articles/8951146003741-New-User-Guide-Scribe-101), [Click targets](https://support.scribehow.com/hc/en-us/articles/7006817910429-Screenshots-Click-Target-aka-the-orange-dot). |
| Guidde desktop | Records a chosen desktop/window workflow and generates a step-by-step guide; supports pause/finish and static click callouts alongside video. | Offer visual explanations where motion adds information, with pause/replay and a text alternative. | Recorded documentation is distinct from live observation. Do not add desktop recording as an implicit side effect of improving help. [Desktop application](https://help.guidde.com/en/articles/9760354-desktop-application). |
| ChatGPT Work with Apps on macOS | An app/context banner makes recognized content visible; supported app content accompanies a submitted message. IDE changes can be reviewed as a diff and reverted. | Make the context of each answer apparent: selected app, current slide/field, or general help. Preserve explicit review of any supported edit. | This is a bounded supported-app integration, not an arbitrary Canva visual-control API. [Work with Apps](https://help.openai.com/en/articles/10119604-work-with-apps-on-macos). |
| Gemini Live | Screen sharing is explicitly started and stopped, with a system notification route to Stop; pausing or locking ends sharing without automatic resumption. | Keep session control available outside the answer's scroll region; distinguish paused, connected, and ended states. | Mobile screen-sharing reference, not desktop feature parity or a recommendation to expand Averill capture. [Gemini Live help](https://support.google.com/gemini/answer/15274899?hl=en-gb). |

## Ranked Averill problems

Evidence below is **internal owner evidence and source inspection**, not measured population frequency. Frequency is unknown beyond this report and the earlier owner-feedback research. Severity and recommended moves are research judgments.

| Rank | Problem and user goal | Surface and observed break | Severity / confidence / frequency | Recommended move |
| --- | --- | --- | --- | --- |
| 1 | Get a usable answer to a simple tool question | Owner screenshot: contrast-and-spacing question receives validator failure prose followed by an undifferentiated instruction excerpt. `src/work-assistant.js` currently assembles fallback text from official excerpts and exposes technical failure wording. | Critical task interruption; high confidence in this instance; no incidence rate. | Answer-first presentation, topic-specific steps, bounded structured synthesis and repair; retain exact evidence validation. Expose fallback status in details, not the main answer. |
| 2 | Find the control and perform the next action | Owner explicitly asks for “where it is and what to click.” Articles and a fixed lesson do not demonstrate a current live control. | High; high confidence in the requirement, current full-path acceptance unverified. | User-invoked, DOM-resolved highlight with one instruction; no arbitrary page clicking and no invented target when absent. |
| 3 | Improve both requested dimensions | The example asks about contrast **and** spacing. `src/work-assistant.js` has single-topic matching, with contrast as one topic; a result can address only the first detected topic. | High; medium confidence until full routing tests; recurrence unknown. | Recognize multi-goal questions and show separate Contrast and Spacing actions without importing unrelated typography operations. |
| 4 | Read help without losing the work | Screenshot has large repeated prompt and dense paragraph text; answer is visually clipped above Stop sharing. | High; high confidence at supplied viewport; other sizes unmeasured. | Compact question, clear answer title, short step cards, bounded scroll area, stable footer, accessible typography and one primary action. |
| 5 | Know what is actually checked | A click or Next is not proof the design improved. Existing repo distinguishes current measurements and employee confirmation. | High; high confidence in the boundary; no owner confusion rate measured. | Separate **Action completed**, **Checked on this slide**, **Confirm yourself**, and **Cannot read this property**. Regressions clear measurement checks. |
| 6 | Trust company guidance while getting ordinary help | The assistant mixes general Canva operations, company authority, outbound notices, and provider diagnostics. | High; owner evidence strong, wider frequency unknown. | Lead with practical help; label company requirements separately; collapse citations and diagnostics; keep outbound consent before provider use. |

## Proposed shared interaction contract

All three surfaces should render the same answer model, with density adapted to the available space:

1. **Context**: “Canva · Slide 2” only when current identity is known; otherwise “General Canva help.”
2. **Answer**: one sentence explaining what to improve and why, followed by short task-specific actions. A combined question keeps both goals.
3. **Visual**: an existing approved instructional asset or source-grounded illustration explicitly marked as an example. A live highlight is only displayed for a uniquely resolved current control.
4. **Primary action**: **Show me in Canva** starts or continues a guide. Show one active step with progress, Back, Next and Exit; do not autoplay an interruption when the user is only asking.
5. **Result**: re-read supported design properties after the employee changes them; state the exact observation. An employee-confirmed step remains manual and is never inferred mastery.
6. **Details**: source title/link, public versus company authority, and concise status. Preserve the existing content-bound outbound preview and Stop/logout cancellation.

Use Nemotron to turn approved official excerpts into concise, structured, tool-specific explanations and steps. Keep source references separate from prose, validate exact evidence, and allow a bounded format-repair attempt. Do not loosen company-claim or credential checks to make a general-tool answer pass. A malformed reply should lead to readable local guidance and an optional retry, never a raw article dump. More tokens may help prevent truncation but do not fix incorrect intent routing, irrelevant retrieval, strict number checks, or unstructured rendering by themselves. This recommendation follows the inspected local pipeline, not a claim about the provider's current live failure reason.

For Canva, keep the current DOM-only design-check scope. A guidance resolver may inspect the visible control's semantic role/name locally to place a nonblocking outline; it must not send arbitrary new page content, add screenshot capture, or claim control of the editor. If multiple controls match or no current control is visible, explain the next manual action and ask the employee to open the relevant toolbar/menu; retry resolution after they do. Bind the guide to the current connected tab/origin and clean it up on Stop, sign-out, navigation end, and Escape/Exit. Keep the company rule overlay distinct from the visual teaching layer.

## Opportunity map and acceptance

### Submission pass: 29–30 October

- Repair answer hierarchy and readable fallbacks across Watch, main panel and Ask; preserve sources and consent in expandable supporting areas.
- Handle contrast plus spacing as a compound task. Use the configured provider through the approved client, with structured output, adequate bounded budget and useful source-grounded recovery.
- Add a narrow interactive guide for the highest-value Canva operations using stable visible semantic targets. Missing/ambiguous targets must fall back clearly.
- Verify exact screenshot question, multiple follow-up questions, failed/slow provider, narrow viewport, scrolling, missing target, manual progress, Stop, logout, and unchanged company-source isolation. Run repository checks and then a real connected Canva rehearsal; synthetic checks do not establish live Canva acceptance.

### Following quarter

- Versioned guide library for Canva, Brevo and supported social workflows; role/context relevance and restart points.
- Authored visual examples or short recordings for concepts that cannot be explained by a control highlight.
- Measure task completion, time to first useful action, guide abandonment, target resolution failure and correction regressions, with transparent collection choices.

### Deeper research

- Five or more observed employee tasks across roles; compare short answers, visual examples, and live guides rather than assuming any vendor pattern wins.
- Keyboard and screen-reader walkthroughs, reduced motion, multilingual control labels, small screens, zoom and divergent Canva states.
- Broader desktop visual guidance is a separate permission, architecture and reliability decision. It is not required to improve the current bounded browser assistant.

## Source map and confidence limits

Implementation follow-up: [Nebius Structured output & JSON](https://docs.tokenfactory.nebius.com/ai-models-inference/json) explicitly documents `response_format` with `type: "json_schema"`, a named schema wrapper with `strict: true`, and recommends schemas when strict structure is needed. It also states that support differs by model and recommends testing; the documentation examples do not establish current Nemotron compatibility. Apply schema constraints to public-tool-help output while retaining local evidence/value validation and verify the selected canonical model live. Increasing the bounded answer allowance from the inspected 900 tokens can accommodate structured steps and citations; the necessary budget and latency remain empirical questions.

Searched current public official support/product documentation for Copilot Vision, WalkMe, Whatfix, Scribe, Guidde, ChatGPT Work with Apps and Gemini Live. Official pages supply feature mechanics, completion triggers, visual guidance and documented failure considerations. The owner screenshot and current `travel-desktop/src/work-assistant.js` / `src/nebius.js` supply direct Averill evidence. Earlier `docs/PRO_RESEARCH_2026-10-28.md` supplies local continuity, not proof of current provider health.

Public community complaints, reviews and support-ticket incidence were not used as evidence: this is a targeted primary-source comparator scan, not a representative sentiment study. No competitor was logged into or experimentally benchmarked; claims such as “works better,” user preference, completion uplift, and enterprise readiness remain unproven. Vendor documentation may vary by rollout and can conflict across historical pages; retain the mechanical pattern without transplanting current entitlement or privacy promises. No private employee documents, account data, credentials, or messages were needed for this research.
