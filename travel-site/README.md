# Elseweek — travel studio website

A working editorial website and design system for a fictional European city-break studio, independently branded from Averill.

## Run

From `averill-ai`:

```sh
npm --prefix travel-site start
```

Open http://127.0.0.1:4173/ and http://127.0.0.1:4173/design-system/index.html. Node 22 is sufficient; no install or build is required. Set PORT to change the port. The standalone homepage can also be opened as index.html.

## Included

- Original Elseweek wordmark and departure mark; local Fraunces and DM Sans fonts.
- Responsive homepage, three destination stories, local city filters, editorial articles and FAQ.
- Native dialogs and trip selection that preselects the planner.
- Validated trip preferences and downloadable local text brief.
- Shared CSS tokens, JSON token registry, live component gallery and brand specification.
- Local, credited city photography and licensed Phosphor icons.

## Scope

This is a fictional demo, not an operational agency. No backend, payment, live availability or external enquiry is provided. The brief is generated in the browser; no personal contact information is collected. Elseweek is a proposed creative name, not a cleared trademark/domain. The older Aurelia campaign sources remain historical fixtures in the Averill app.

## Design documentation

- docs/IMPLEMENTATION_PLAN.md — plan and naming rationale
- docs/BRAND.md — brand positioning, voice and visual rules
- design-system/DESIGN_SYSTEM.md — interface specification
- design-system/index.html — live gallery
- docs/ASSETS.md — asset sources and licenses

## Verification

JavaScript syntax and local server routes/assets are checked. Browser acceptance checks cover filters, dialog navigation, required-field validation, generated brief and responsive layout; completed checks are recorded in docs/VERIFICATION.md. No production deployment or real booking has been verified.
