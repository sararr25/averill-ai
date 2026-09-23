# Averill design system — v1

**Status:** approved visual direction and design specification for Averill. The assistant window now imports these tokens and uses the specified local font packages. The separate Aurelia sample work windows retain their own styling.

**Reference image:** [reference-petrol-coral-ice.png](reference-petrol-coral-ice.png). The palette below is the implementation source of truth, not the image's approximate pixels.

## Product boundary

This system belongs to the independent desktop assistant. Aurelia Travel is the fictional company in the demo work windows. The screenshot shows a visual composition, not a claim that the agent and Campaign Files are one application. The current prototype receives structured changes from the three supplied work windows after the user shares them. It cites local files, suggests corrections, and never edits, sends, or publishes on the user's behalf.

## Design intent

**A precise signal inside deep, calm petrol.** Coral means the assistant has spotted something that needs attention. Ice means a source or state has been verified. Most of the interface stays quiet so the transition from observation to evidence is the memorable moment. The aperture mark in the concept image is a custom brand motif, not a generic AI sparkle; its final vector geometry should be drawn only after the name is chosen.

### Color roles

| Role | Token | Hex | Use |
|---|---|---:|---|
| Canvas | `--ds-color-canvas` | `#071E25` | Desktop surround and deepest layer |
| Window | `--ds-color-window` | `#08282E` | Agent window |
| Raised surface | `--ds-color-panel` | `#0D353D` | Input and selective grouping |
| Hover surface | `--ds-color-panel-hover` | `#174852` | Interactive row hover |
| Primary text | `--ds-color-text` | `#F5F1EA` | Headings, finding, values |
| Secondary text | `--ds-color-text-secondary` | `#AEC4CA` | Explanation, timestamps |
| Muted text | `--ds-color-text-muted` | `#92AEB6` | Labels and placeholders |
| Coral signal | `--ds-color-signal` | `#FF705E` | Finding marker, unresolved emphasis, primary text action |
| Coral hover | `--ds-color-signal-hover` | `#FF8D7F` | Hover on coral text action |
| Ice verified | `--ds-color-verified` | `#A8DBDE` | Approved version, source icon, citation state |
| Ice soft | `--ds-color-verified-soft` | `#C8EAEB` | Source link and quiet selected state |
| Hairline | `--ds-color-border` | `#31545C` | Separators and input outline |

Coral and ice encode **different meanings**; never use them interchangeably as decoration. Error text keeps a verbal label, because color alone cannot explain a finding. Avoid using coral as a full window background or covering long text in ice.

Calculated contrast on the window surface: ivory 13.78:1, secondary slate 8.53:1, coral 5.71:1, ice 10.24:1. These cover normal text in the core palette; still verify rendered weights, smaller labels, disabled states, and focus in Electron.

### Typography

| Job | Family | Treatment |
|---|---|---|
| Display and finding title | **Geologica** variable | 600–650 weight; slightly tight tracking; compact without looking like a terminal |
| Product UI and reading | **Spline Sans** | 400–600; open counters, readable at 13–16px |
| Version IDs and metadata | **Fragment Mono** | 400; only short labels, dates, index numbers, and technical metadata |

Use font files hosted with the app for offline desktop reliability. The three families are available from their upstream projects under OFL; include the license files when bundled. Do not replace them with Inter, Arial, Roboto, or Helvetica. Fallbacks in CSS exist only for failed font loading, not as a design choice.

| Style | Size / line | Weight | Where |
|---|---|---:|---|
| Display | 32 / 36 | 650 | Key finding in a wide agent window |
| Title | 24 / 30 | 600 | Finding title in the actual narrow window |
| Section | 17 / 24 | 600 | Main section headings |
| Body | 14 / 21 | 400 | Explanation, answer text |
| Body strong | 14 / 21 | 600 | Source name, selected file |
| Label | 11 / 16 | 600, +0.14em | `FINDING`, `CURRENT SOURCE`, `SHARED WINDOWS` |
| Meta | 11 / 16 | 400 | Version, date, count; Fragment Mono |

The existing desktop window is narrow. Long finding titles wrap naturally; no 32px display text inside a 400–480px window. Do not use all caps for sentences.

### Geometry and layout

- 4px base spacing; frequent steps: 8, 12, 16, 24, 32, 40px.
- Agent window inner padding: 24px at normal width; 16px when narrower than 420px.
- Major section gap: 32px. Finding content gap: 16px. Label-to-value gap: 8px.
- Window corner: native Electron shell. Internal surfaces: 8–12px. Composer: 12px. Small status chip: full pill.
- Hairline separators use `--ds-color-border`; use them to separate meaning, not every row.
- Agent header, current context, findings, source, and composer remain distinct in the reading order.
- No shadow stack or cards for every paragraph. One subtle raised surface is enough for an input or selected source.

## Components

### 1. Agent window / header

Custom aperture mark (20–24px) + Averill wordmark + quiet live status. The header does not contain Aurelia's identity. The selected campaign appears underneath as context. `LIVE` means a shared demo window is currently receiving changes; otherwise show `NOT SHARING` in neutral text, never imply background observation.

### 2. Shared window row

App name, sharing state, and a user-controlled Share/Stop sharing button. Default = neutral outline; shared = ice indicator with text `Shared`; unavailable/closed = muted. Show each of Email Studio, Social Publisher, Campaign Files explicitly. Never imply arbitrary macOS window capture in this prototype.

### 3. Finding

Order: coral marker and `FINDING` label → plain-language title → observed value → why it conflicts → approved value/source → suggested user action. One finding at a time may be visually prominent; the rest collapse to compact rows. `active` uses coral; `resolved` uses ice plus `Resolved`; `dismissed` is neutral; `checking` uses a subtle pulse and text. Never use a spinner as the only status.

### 4. Version comparison

Two labeled values, `SUPERSEDED` and `APPROVED`, connected by a thin coral path/arrow. Old version stays muted; approved version uses ice. This large comparison belongs in Campaign Files or an expanded finding, not in every small alert. The source remains a separate cited object.

### 5. Source citation / viewer

Ice document icon, exact source title, version, approval date when present, and a text action to open the local file. Preserve the distinction between cited **local source** and assistant interpretation. If the source cannot be opened, show an explicit unavailable state; do not silently remove the citation.

### 6. Ask composer and answer

Composer: 48px minimum height, full width, border on the petrol panel, clear focus outline in ice, send button enabled only with nonempty text. Answer blocks show source links after the answer. Waiting, streaming, answered, no-source, and error states need distinct copy. Nebius AI opt-in remains explicit and adjacent to the composer; do not bury the data-sharing disclosure in settings.

### 7. Actions

Primary action for the assistant is a **text link** in coral with a fine arrow; it describes what the user can do (`Open approved brief`, `Review audience`). Secondary actions are quiet outlines. The agent must not show `Fix automatically`, `Send`, or `Publish` in this demo. Hover increases contrast; focus uses a visible ice outline; disabled actions retain readable text and explain why unavailable.

### 8. Empty states and feedback

No shared windows: explain how to open and share a supplied work window. No findings: `No issues found in shared work` plus which windows were checked. Unsupported question: say the answer cannot be verified from the available sources. Resolved finding: mark it resolved in text and remove its active coral emphasis.

## Iconography

Use **Phosphor Light** (or regular at small sizes), 1.5px-equivalent stroke, rounded joins, 16px inline and 20px for actions. Candidate glyphs: document, folder, magnifier, arrow up-right, warning circle, check circle, eye, monitor, link, close. The product aperture is custom SVG and must not be substituted with a library icon. Keep icons monochrome using `currentColor`; coral only for attention and ice only for sources/verified states. Avoid thick Lucide, filled Material, emoji, and arbitrary icon mixes.

The Better Icons CLI was available but its remote search endpoint failed in this environment. Exact Phosphor icon IDs and SVG files should be verified before implementation; this document specifies their visual role, not an unverified asset inventory.

## Motion and accessibility

- New finding: opacity + 8px translate, 320ms, `--ds-ease-out`; no bounce.
- Resolved: coral emphasis fades to ice over 220ms; content remains readable long enough to register.
- Focus and hover: 140–220ms. No animated glow around the aperture during idle.
- Respect `prefers-reduced-motion: reduce` with near-instant state transitions and no transform.
- Keyboard order follows the reading order. All icon-only controls need accessible names. Interactive targets should be at least 40px; composer send target 44px.
- Check text/background contrast in the actual Electron renderer and at reduced window width before treating the mockup as final.

## AI Elements applicability

The current UI is **plain Electron HTML/CSS/JavaScript**, so React AI Elements is not an immediate dependency. The component pattern worth retaining is a source-bearing answer: message body, explicit citations, answer/loading/error states, and a prompt input. If the agent is later rebuilt in React, check the then-current official AI Elements docs and install only `message`, `sources`, `conversation`, and `prompt-input` as needed. Style those source-owned components with these tokens; do not let their defaults define the product identity.

## Implementation order

1. Bundle fonts and licenses; import `tokens.css` into the agent window only.
2. Rework header, shared-window controls, findings, source viewer, and composer using the component specs.
3. Verify all supplied demo workflows, keyboard focus, width constraints, contrast, and reduced motion.
4. Only then adapt the surrounding demo work windows to coordinate with the palette; they remain visibly separate products/windows.

## Sources

- Selected colorway: [reference-petrol-coral-ice.png](reference-petrol-coral-ice.png) (concept art, not production UI).
- Font projects: https://github.com/googlefonts/geologica · https://github.com/SorkinType/SplineSans · https://github.com/weiweihuanghuang/fragment-mono
- AI Elements: https://elements.ai-sdk.dev/ and https://elements.ai-sdk.dev/components/sources
