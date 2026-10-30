## Quiet visual coach 0.6.0 — 29 October 2026

Canva has one panel. Selecting text does not create a separate field card; minimizing stays in place even for new findings. Tool help leads with a single illustrated step. A numbered pointer marks a uniquely resolved visible control; the employee’s actual click advances the guide. No synthetic click or automatic mastery. All instructions, sources and measurement scope remain inspectable in details. Public check results show a verdict and statement; explanations/sources expand.

`content.js` is generated from `assistant-view.js`, `canva-guide.js`, and `content-ui.js` by `npm run build:extension`. It contains the complete visual reader, including when an older worker injects only content.js. Edit the source modules and rebuild, not the generated entry. This build runs before test, start and package. Extension version 0.6.0, unchanged manifest permissions.

## Assistance UI 0.5.0 — 29 October 2026

The Canva panel has **Design checks** and **Ask Averill** views. Answers render lists and relevant bundled illustrations. **Show me in Canva** opens one local guide step at a time and outlines only a visible uniquely matched supported control. Back/Next are manual navigation, not inferred mastery. Missing/ambiguous controls show recovery text. The online preview lists inspectable exact inputs with Get Nemotron help / Keep it local. Stop/ending the connection removes the outline. No new manifest permissions, automatic clicks or screen transmission. Reload this existing extension after updating; reconnect through its toolbar action.

# Averill in-page browser companion

Version 0.3.0. Opt-in Chrome Manifest V3 extension, distributed as source for the hackathon prototype. The content script shows Companion guidance beside one chosen top-frame draft field. It uses the desktop app's real local review engine, exact approved source passages and optional consented Nemotron review. A complete synthetic flow is verified; actual-platform acceptance is still open.

## Install or update

Installation is an employee action. Review the source and manifest, then use Chrome Extensions → Developer mode → Load unpacked for this directory. If it is already installed from this directory, reload that existing extension after updating the files. Averill does not install or reload it automatically. This source version needs the matching updated desktop build; an old published binary does not expose the new endpoints.

## Normal connection and review

1. Open the matching Averill app and sign in.
2. In the intended draft tab, click the extension and **Connect this tab**. On first use in that signed-in session, Averill displays a native Cancel/Connect prompt naming the extension and page origin. Approve the intended companion. The extension worker completes connection even if the popup closes while you approve.
3. Choose one draft field. The page shows a small Averill card. Supported Brevo and LinkedIn origins infer the existing marketing email/organic-post work type; an unknown site asks for the work type. This is a context hint, not a claim that every editor on those platforms works.
4. Click **Ask Averill**. The result, exact source passage and optional preview stay in-page. **Open in Averill** explicitly opens the cited source in the desktop app.
5. A unique forbidden-phrase removal may offer **Apply change** for a plain textarea/text input. Confirm its preview. **Undo** restores the previous text only if nothing has changed since; otherwise the card offers explicit manual recovery. Rich contenteditable editors remain review-only until a dedicated adapter is validated. Arbitrary rewriting and new text insertion are not implemented.
5b. **Ask by typing (FB-07).** The card has a question box, "Ask about this draft or company rules" (up to 500 characters, Enter asks, Shift+Enter adds a line). It works with or without a selected field, but only while a card is showing (a card appears when a field is chosen, including a field that cannot be shared). The answer is plain text with its citations: source title, approved version and the exact quoted line. If nothing approved matches it says "No approved source answers this." The bridge accepts only the question and the selected field's id and revision; it uses the field text it already holds, only while that revision is still current. Credentials in a question are refused. Answers stay local unless the owner's company AI policy and the session AI switch allow the model, exactly like the desktop Ask; then the question and the selected text (up to 1500 characters) go to Nebius. Restricted or credential-bearing sources are never cited.
6. Editing immediately invalidates earlier advice. A 1.2-second pause, blur or selection sends the new selected field; periodic local reads detect editor-driven changes. Ask again to recheck. Stop in the page, popup, desktop or floating control revokes the current bridge. Dismiss only closes the card.

After initial connection approval, an explicit reconnect within the same authenticated session needs no second desktop approval.

### Connection length (owner decision D1, 25 October 2026)

A connection stays on for the whole signed-in Averill session:

- Switching tabs, covering Chrome with Averill or leaving the tab idle **pauses** sharing. The page sends a paused heartbeat and nothing else; it resumes when the tab is visible again, with no new approval.
- Reloading the same page, or moving inside the same site, keeps the connection. The extension worker re-injects the companion using the existing activeTab grant. If Chrome refuses, sharing ends and the page asks for a reconnect.
- A failed local relay is retried three times (after 0.5 s and 1.5 s) before Averill counts as closed. A rejected token ends at once.
- It ends only on: Stop (page, popup, desktop or floating control), sign-out, Averill quit or unreachable, closing the tab, moving the tab to another site, lost contact (no heartbeat for 2 minutes while visible, 30 minutes while paused), or a rejected token. The in-page card, popup and Current work checklist show which one, in plain words.
- Limits: trust and the connection live in memory only. Quitting Averill, restarting Chrome or reloading the extension always ends it. Chrome only grants page access after a click on the toolbar icon, so **every reconnect starts there**: click the Averill icon, then **Connect this tab**. A tab Chrome freezes or discards for more than 30 minutes ends as lost contact.

The toolbar badge shows **ON** on the connected tab. The popup reads the current state each time it opens: connected, not connected (with the last end reason), or waiting for approval in Averill. Company source/policy changes invalidate cached advice at the next status exchange and are checked again on every Apply/open authorization.

If guided connection is unavailable, the popup explains how to open/sign in to Averill. **Advanced connection** retains legacy pairing JSON for diagnostics; it is no longer the normal route. A port conflict on 43147 can prevent guided connection without preventing the legacy fallback.

## Privacy and capability boundary

Permissions remain activeTab, scripting, session storage and loopback-only host access (`http://127.0.0.1/*`). The publicly accessible resources are the bundled font and mark; their match list does not grant persistent website host access. No cookies, history, all-sites reading permission or automatic extension installation is requested.

The no-data rendezvous on 127.0.0.1:43147 accepts only extension Origins and signed-in, explicitly approved sessions. It returns a short-lived random-port bridge bound to one extension/tab/origin. The bridge validates Host, Origin, token and monotonically increasing observation sequence. Contextual review requests are separate from that queue so a slow provider cannot block editing invalidation or heartbeats. The token exists only in extension session storage, never the host DOM, public snapshots or logs.

Only one clicked top-frame field is shared. Credential/contact/payment/personnel-labelled fields and unsupported/oversized fields are excluded. The selected value is capped at 6000 UTF-16 code units; no whole-page extraction occurs. Selecting an excluded field clears the previous observation. Credential-shaped content and payment numbers are redacted in the main process; redacted observations do not get executable proposals. Cross-origin frames, closed shadow editors and visual geometry are not supported by the generic reader.

Only bounded findings, minimal authorized source passages, work scope and validated optional patches go back to the page. Restricted/credential-bearing sources are not quoted there. Full documents, company/person snapshots, provider keys, model traces and public-claim suggestions are never returned through this capability. A closed shadow root isolates styling, not confidential data from the host site; therefore the company library remains in Averill.

Nemotron requires the existing company AI policy, eligible source/file consent, session AI availability and an explicit in-page confirmation for the selected review. Local checks make no provider call. Tavily is not called by this flow. Nothing sends, posts, schedules or publishes. No automatic rich-editor manipulation is claimed.

The plain-text adapter changes only a unique, exact server-authorized removal and verifies the editor's native value after an input event. It checks the full field value/id/revision, preserves unrelated whitespace and text, and never interprets model prose as code. Undo state stays ephemeral in the content-script closure. An editor that rejects/transforms a write is reported as uncertain rather than silently declared fixed. Dedicated real-editor acceptance is required for controlled rich editors and formatting preservation.

## Evidence

- `npm test`: bridge authorization, liveness/pause/end reasons, the actual extension worker in a VM (retry, retry exhaustion, rejected token, same-site re-injection with sequence continuity, other site, tab close, popup status), rendezvous approval/reconnect/logout, selected-field source authority, stale model replies, exact patch applicability and prior regressions.
- Field support (FB-06, `field-select.js`): textarea, text input, `contenteditable` (true, empty, plaintext-only) and editable `role=textbox` elements, including open shadow roots, can be read and reviewed. Writing stays limited to plain controls and the Canva adapter. If an app replaces the selected node, the same field (tag, role, name, label, stable id, position) is found again within about 3 seconds; otherwise the selection ends and the connection stays. Check on the simulator composers: `FB06=1 VAMO_PAGE=linkedin npx electron scripts/verify-contextual.cjs` (and `instagram`). Simulator only, not real linkedin.com or instagram.com.
- `npm run verify:contextual`: real Electron main process, loopback servers, review engine, actual background/content scripts and native plaintext control. Chrome permission/transport and the native approval response are simulated in an isolated profile. It verifies preview/Apply/exact Undo, the status pill and toolbar badge, hidden/visible pause and resume, same-origin reload re-injection without new approval, the ended card after Stop and sign-out, revoked-source rejection, manual recovery after typing, recheck, explicit source deep link, Stop/reconnect/logout and zero provider requests. This is **not** installed Chrome, Brevo, LinkedIn or live Nemotron acceptance.
- `npm run verify:browser`: prior native pairing/typing/Stop/logout and real content-script code in a synthetic DOM; also verifies that clicking an excluded field clears the old selection without transmitting its value.
- `npm run verify:ui-e2e`: regression for the existing desktop Review/Work flow.

Recorded evidence: [contextual flow](../../docs/review-evidence-2026-10-18/contextual/). Older installed 0.1.0 evidence remains historical; it cannot establish 0.2.0 acceptance. Tickets CX-03/CX-04/CX-05 retain their remaining real-browser, layout, accessibility and failure-path gates; Brevo/LinkedIn rich editor adapters are separate CX-06/CX-07 work.

Technical references: [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [session storage](https://developer.chrome.com/docs/extensions/reference/api/storage).

## Double-check online (FB-10)

After a review or an answer, the card can list public statements found in the selected field (prices, dates, events, places) under "Double-check online". Nothing is sent until the employee presses "Check with Tavily"; only the ticked, optionally edited text leaves the device. Averill re-checks each statement against the field text and its Tavily guards, then shows results labelled "Public check, not company approval". In the judge demo workspace without a local Tavily key the search goes through the capped judge server.

## Canva design check (FB-14)

On a connected **canva.com** tab the extension also injects `canva-design.js` (before `content.js`, same activeTab grant, no new permission) and shows a second card docked to the right edge, "Design check", with a **Watch my design** checkbox that is off by default. Nothing is read or sent while it is off.

When it is on, after an edit pause (1 second, at most one check every 2 seconds, only while connected and the tab is visible) the reader looks at the page itself:

- The page frame is the innermost div whose inline width and height equal an Instagram design size (1080 by 1080, 1350, 1440 or 1920). The zoom is the product of the CSS transforms above it and must agree with its drawn width divided by its inline width.
- Each text is the paragraphs of one positioned wrapper (inline size plus `translate()` in design pixels). Canva keeps a second, unpositioned text layer next to the frame with every text and its font size; the two are matched by order. A visual text with glyphs must equal its layer text, the counts must agree and each font size must fit its box, otherwise the design is unreadable. An empty visual span (the headline holds only a line break) takes its text from the layer.
- The background under each text box is sampled on a grid of up to 40 by 40 points from the page images and solid fills behind it, read through a canvas. The contrast is the worse of the darkest 10% and the lightest 10% of those samples, never the mean.

Only the texts and numbers go to Averill (`design-check` bridge kind): text, design box, font size and weight, text colors and the two averaged background colors. The worker refuses anything else: more than 30 texts, a text over 500 characters, unknown keys, image data, numbers out of range. Averill checks WCAG AA contrast (4.5:1, or 3:1 for large text: 24 px or more at a 1080 pixel width, 18.66 px bold), the safe area (every text box at least 108 px from every edge, Vamo's own approved rule matching Canva's margin guide) and the approved claim rules, and cites the exact approved line for each finding.

Any finding turns the card into **Fix before you export** with the text, the problem, the measured value (for example "contrast 1.76:1, needs 4.5:1") and the source. It stays until a check is clean or the employee presses **Export anyway**, which is recorded in Averill's memory for this signed-in session only. Averill never edits, exports or shares the design and never presses anything in Canva.

Limits: Canva can change its page structure at any time. If the frame, zoom, text layers, a rotated text, a gradient or a picture the page cannot read, or more than one page is found, the card says **Averill cannot read this design** and nothing is checked. Uploaded photos and solid page fills are read the same way but were not tested on real Canva. Evidence so far is a synthetic page rebuilt from the captured structure (`npm run verify:canva-design`, `tests/canva-design-reader.test.js`), not real canva.com.
