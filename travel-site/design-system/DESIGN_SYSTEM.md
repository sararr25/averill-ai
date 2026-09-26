# Elseweek design system

Version 1.0 · shared by the website and live component gallery (`index.html`).

## Token architecture

`tokens.css` is the implementation source. `tokens.json` mirrors the registry for inspection. Primitive values use `--p-*`; semantic roles use `--color-*`; button, input and card aliases reference semantic roles. Avoid hardcoded component colours.

| Role | Value | Use |
| --- | --- | --- |
| Paper | #F6F3EB | Page canvas |
| White | #FFFDF8 | Inputs and elevated surfaces |
| Forest | #213C30 | Text and primary actions |
| Forest dark | #15291F | Primary hover |
| Slate | #5C695E | Secondary copy |
| Clay | #A54D32 | Accent and focus |
| Sage | #E1E6DA | Supporting sections / selected pills |
| Line | #D7D9CC | Dividers and input borders |
| Ochre | #EEDDB9 | Editorial cards |
| Error | #9B302E | Error treatment when applicable |

## Typography

Locally bundled Fraunces 400 normal/italic for wordmark and display. DM Sans 400/500/600 for reading and controls. Body 15px with 1.6 line height; supporting editorial text 12–14px. Small labels are secondary metadata, never the sole instruction for an action. Desktop display ranges 56–91px; mobile hero 51–78px. Section headings 36–55px; cards 26–32px. Avoid synthetic font weights.

## Geometry and spacing

4px spacing base. Main scale 8, 16, 24, 32, 48, 64, 96px. Maximum content width 1320px. Gutter 20–72px. Section gap 64–112px. Inputs use 4px radii; dialogs 8px; actions use pill radii. At 760px the split layouts become single-column and navigation becomes a labeled toggle. At 390px the form becomes one column.

## Components

- Primary button: forest/white, 48px minimum height, 12px label, arrow when useful. Hover darkens the background; focus is a 2px clay outline with 5px offset.
- Secondary button: transparent background, line border, forest label. Hover becomes forest/white.
- Text action: text and icon together; visible focus. Never use an unlabeled icon as the only action.
- City filters: labeled buttons, `aria-pressed`, selected forest/white. Actual cards hide; result count uses a live region.
- Destination card: real photo, location metadata, serif city name, short description, explicit detail action.
- Dialog: native HTML dialog with heading association, visible close control, Escape, backdrop dismissal and normal focus management.
- Form: native selects, visible labels, required city, focus treatment; checkboxes styled as interest pills. Native validation precedes a local result and download link.
- FAQ: native details/summary. Expansion changes chevron direction.

## Icons and motion

Phosphor Light SVG icons from the bundled licensed set, 20px default / 256px viewBox, currentColor. Decorative icons have `aria-hidden`. The brand mark is custom. Fast transitions 160ms, base 240ms. Disable transitions, image hover transform and smooth scrolling under reduced motion.

## Experience rules

Clear semantic section hierarchy, skip link, labeled controls, visible keyboard focus and a native modal. Colours reinforce text labels rather than replace them. No invented prices, reviews, live availability or submission success. The city outlines are inspiration and require independent travel planning checks. Accessibility conformance is not certified; visual and interaction verification is documented in README.
