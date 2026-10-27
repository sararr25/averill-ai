# Feedback spec — 27 October 2026

Source: owner test of `travel-desktop/dist/Averill-darwin-arm64/Averill.app` (build of 26 October), written in Italian and translated here. A ticket counts as done only when its acceptance list is met and has been verified by running the app.

Paths: `travel-desktop` is the desktop app and `travel-desktop/browser-extension` is the browser extension.

Order: A (bugs) first, then B (visual system), then C and D (redesigns).

## What the feedback means

| # | Feedback (plain English) | Cause found in code |
| --- | --- | --- |
| 1 | Current work does not scroll. | `src/ui-refinements.css:31` sets the active review tab to `overflow:hidden`, and `:32` makes `.review-feed` a `flex:1` scroller. The tab is not a flex container, so the feed never gets a height and its content is clipped. `src/companion-theme.css:118` also sets `.review-feed` to `overflow:visible`, which fights that rule. To confirm while fixing. |
| 2 | Spacing is broken in several places (screenshots: Learn step card and Source approval card). | Buttons and links have no gap between them: "Read company context" touches "I tried this step, continue", and "Read proposal", the dropdown, "Compare extracted versions" and Approve/Reject/Clarify touch each other. `src/agent.html:2` loads 8 stylesheets (`styles.css`, `agent-controls`, `agent-theme`, `ui-refinements`, `guided-ui`, `companion-theme`, `todo`, plus `tokens.css`), and they patch each other. The 25 October spec (item 10) found the same thing, and it is still not fixed. |
| 3 | Averill is tiring to read. | It uses a dark purple-grey background with mid-grey text (grey on grey) and small 12–13 px sizes in many places. The tokens in `design-system/tokens.css` (petrol) do not match what is drawn (the companion theme), so there are two palettes. |
| 4 | The tests are not good: you confirm every step, and Canva tests are not done in Canva. | `src/learning-ui.js:33-36` shows one step at a time with an "I tried this step, continue" button and "Confirmed by you, not automatically verified." Nothing is checked, even though `browser-extension/canva-design.js` can already read positions, sizes, text and colours of the open Canva design. |
| 5 | It is not clear what Current work is. | The tab mixes a hero, a browser checklist, Tavily checks, the "Connection and review tools" panel (pairing recovery, app window capture, the task dropdown), hidden demo fixtures and a chat (`src/agent.html`, the `data-tab="review"` block). Nothing says "this is what you are working on". |
| 6 | Installing the extension should be immediate: Connect if it is installed, otherwise a link that installs it. | The judge guide says to Load unpacked from inside the app package. The desktop app has no install entry point and does not detect whether the extension exists. A link that installs an extension automatically is only possible through the Chrome Web Store. |
| 7 | "Connect browser" says "Starting local browser pairing: completed." when nothing has connected. | The operation feedback reports that the *request* finished, not that the connection exists. The real state is `browserBridge.connected` (`src/agent.js:100`). |
| 8 | Still confusing and hard to understand. It needs icons, vectors, images and diagrams. | Navigation, section headers and states are text only. There are no visuals explaining the connection or the exercises. |

## Decisions (owner, 27 October 2026)

- **Q1. Current work content:** both the work open now, at the top, and a list of recent projects below it.
- **Q2. Readability:** a light and a dark theme. The app follows macOS and defaults to light. The dark theme gets more contrast.
- **Q3. Exercise verification:** automatic wherever the extension can read the design, plus **one** confirmation per page/session for the rest. No more confirming every step.
- **Q4. Exercise tools:** Canva first, then Brevo (email), then LinkedIn and Instagram drafts. Exercises always happen inside the real tool.
- **Q5. Extension install:** guided install now. Chrome Web Store publishing (one-time $5 fee, Google review of a few days) after the hackathon, and only with the owner's go-ahead for the payment.
- **Q6. Icons:** Phosphor, through better-icons.
- **Q7. Order:** bugs first, then the visual system, then the redesigns.

## A. Bugs

**A1. Current work scrolls.** (#1)
- The trackpad, the mouse wheel and the keyboard (Page Down, Space) all scroll Current work to its last element, at window heights of 600, 800 and 1000 px.
- The other tabs still scroll as they do today.

**A2. No touching or overlapping controls.** (#2)
- Every group of buttons or links uses one shared actions row: flex with an 8 px gap, wrapping to a new line when space runs out.
- The Learn step card and the Source approval card, at the window size shown in the screenshots, have no control touching another.
- Screenshot check of every tab, at 420 px and 800 px wide.

**A3. Connection messages tell the truth.** (#7)
- After a click on Connect, the message reads "Waiting for the extension…" until `browserBridge.connected` becomes true.
- "Connected to <site>" appears only when the bridge is actually connected.
- After 2 minutes without a connection: "Not connected. Open the Averill extension on your draft tab and click Connect." No "completed" wording is shown for a connection that does not exist.
- A test covers all three states.

## B. Visual system

**B1. One stylesheet, one palette.** (#2, #3)
- `tokens.css` is the only source of colours, type sizes and spacing. Semantic tokens (`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--border`) are defined for light and for dark (`prefers-color-scheme`).
- The other stylesheets are merged into one, organised by component, with no `!important` overrides between files. The old light-theme rules in `styles.css` are removed.

**B2. Easy to read in both themes.** (#3)
- Body text is at least 15 px with a line height of 1.5. Nothing users need to read is below 13 px.
- Body text contrast is at least 7:1, and small or secondary text at least 4.5:1, checked by an automated contrast test in both themes.
- The dark background is neutral, with no purple cast. The lime accent is only used for the main action and for focus.

**B3. Icons, illustrations, diagrams.** (#8)
- Phosphor icons on the navigation tabs, section headers, status pills and main buttons, all from one icon set and one weight.
- A small diagram, "Chrome extension → Averill on this Mac → approved company rules", in the connection area.
- Illustrated steps for the extension install (C2) and for each exercise (D).

## C. Current work and extension

**C1. Current work shows the work.** (#5, Q1)
1. **Working on now** card: the tool icon, the document name (for example "Winter Escapes 2027 · Brevo"), when it was last checked and how many things there are to fix. It has one main button, "Check now", and a secondary button, "Ask about this", which opens the guidance chat.
2. **To fix**: the findings from the last check, each with its source.
3. **Recent work**: past drafts or projects, newest first. One click opens a draft's history.
4. The connection state is an icon in the header (connected or not connected). Pairing recovery and app window capture move to Workspace settings.
- Empty state: an illustration, the line "Open your draft in Chrome or Canva and Averill will follow along", and the install/connect button from C2.

**C2. Install and connect in one place.** (#6, Q5)
- The desktop app detects the extension: the extension pings the local connect port `43147`.
- Not installed: an **Install extension** button opens Chrome at `chrome://extensions`, reveals the extension folder in Finder and shows 3 illustrated steps (Developer mode → Load unpacked → choose the folder).
- Installed but not connected: a **Connect** button.
- Connected: a green state, the connected tab and a **Disconnect** button.
- Later, after the owner approves: Chrome Web Store (unlisted). The Install button then opens the store page.

## D. Exercises inside the real tool

**D1. Canva layout essentials, inside Canva.** (#4, Q3, Q4)
- "Start exercise" opens Canva on a practice design. The extension shows an overlay inside Canva listing every step of the page.
- Steps that Averill can read from the design tick themselves off, through `canva-design.js` (for example: elements aligned, text inside the safe margin, sizes). Each step is labelled either "Checked by Averill" or "Confirmed by you".
- At the end of the page the user gives one confirmation, covering only the steps Averill cannot check.
- Open check before building: whether "selected" and "grouped" can be read from the Canva page. If they cannot, those steps stay in the one-confirmation group. Averill never guesses.

**D2. Brevo email exercises**, the same pattern inside the Brevo editor (simulator), after D1 works.

**D3. LinkedIn and Instagram draft exercises**, the same pattern, after D2.

## Out of scope

- Any feature that is not listed here.
- Paying for or submitting to the Chrome Web Store before the owner approves it.

## Verification for every ticket

`npm test` passes. The app runs. Screenshots of each changed tab in both themes go in `docs/screenshots/2026-10-27/`. A short note explains how to check it by hand.
