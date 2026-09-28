# Common Miles design system

Version 2.0 · shared by the travel website and live gallery.

## Architecture

`tokens.css` is the source of truth. `tokens.json` mirrors its registry. Primitive `--p-*` values feed semantic `--color-*` roles, then component aliases. Common Miles tokens apply only to `travel-site/`; Averill retains its own design system.

| Role | Value | Use |
| --- | --- | --- |
| Cloud | `#F5F8FF` | Page canvas |
| White | `#FFFFFF` | Reading and form surfaces |
| Night | `#10213E` | Type, dark sections |
| Electric | `#2458F5` | Primary actions, focus |
| Mist | `#E5ECFF` | Secondary surface |
| Lime | `#D8FA63` | Small high-energy accents |
| Slate | `#50617F` | Secondary copy |
| Line | `#CBD7EC` | Dividers and fields |

## Logo and typography

The custom SVG mark is a route ending at a lime point. Use it at 28px or larger, with half its width of clear space. The wordmark uses locally bundled DM Sans 600, lowercase, tight tracking. DM Sans 400/500/600 handles the entire interface; display headings scale from roughly 44px to 110px with short line lengths. Do not use Fraunces or Averill's Spline Sans. Keep body text at 15–16px with generous line height.

## Layout

Maximum content width 1320px, fluid gutters 20–72px, section gap 64–112px and a 4px spacing base. The hero combines a night-blue message field and destination photo. Destination cards form three columns on desktop and one below 760px. Photos carry a visible place label. Use 8px corners for compact controls and 16px for large surfaces.

## Components and states

- Primary action: electric blue on white sections, lime on the night-blue hero, 48px minimum target, visible arrow when useful. Hover lifts 2px; reduced motion removes the lift.
- Secondary action: night-blue outline with a clear text label.
- Filter: native button with `aria-pressed`, explicit selected styling, a live result count and actual card filtering.
- Destination card: real photo, location metadata, destination headline, concise description and explicit action.
- Modal: native dialog, heading, close button, Escape and backdrop dismissal; trip selection leads to the planner.
- Form: visible labels, native select validation, focus outline, local result and downloadable text brief. It never submits an enquiry.
- FAQ: native details/summary with a visible disclosure icon.

Focus uses a 2px electric outline, 5px offset. Use semantic headings, skip link, 44px minimum compact targets, text labels alongside decorative icons and reduced-motion support. Do not signal meaning only through colour. No invented pricing, bookings, availability or testimonials.
