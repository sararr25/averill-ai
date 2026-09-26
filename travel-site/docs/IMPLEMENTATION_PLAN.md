# Elseweek — travel studio UI plan

26 September 2026. Working identity for the fictional travel company used by Averill. The website is a local, independently branded experience; Averill remains the assistant product.

## Identity decision

**Elseweek** combines the idea of elsewhere with the time available for a short escape. It is visually and phonetically distinct from Averill. Alternatives considered: Sunday Miles (more relaxed, two words) and Quiet Atlas (rejected after finding an existing travel agency at https://www.quietatlas.eu/). An initial web search did not establish an obvious travel-company match for Elseweek. This is a creative working name, not domain or trademark clearance.

## Audience and content

Denmark-based travellers interested in short European winter breaks. Preserve the Winter Escapes 2027 destinations (Copenhagen, Vienna, Prague), campaign dates and intentional superseded fixtures. The website must not invent prices, live availability, hotel partnerships, reviews, awards or operating/legal details.

## Visual plan before implementation

- Warm editorial direction: paper/ivory canvas, forest ink, terracotta detail, real city photography.
- Fraunces for wordmark/display and short italic highlights; DM Sans for UI and reading. Bundle local fonts and licenses.
- A restrained custom departure mark belongs to Elseweek. No Averill aperture, petrol/coral/ice agent chrome, or AI symbolism on the consumer site.
- Split hero: typography and campaign message on the left, winter Nyhavn photography on the right; editorial caption rather than a floating stack of badges.
- Three city stories with photography and a readable selection path. A destination filter changes actual visible cards.
- A trip-detail dialog shows a proposed short-stay outline. It is inspiration rather than a priced/available product.
- A local trip-brief form collects destination, month, length and interests. Submission produces a downloadable brief; it never claims a request was sent or a booking completed.
- An editorial section and FAQ explain the approach and allow real reading interactions.
- A live design-system page shares the production tokens/components and documents their states.

## Engineering and verification

Serve dependency-free HTML/CSS/JS at localhost. Use semantic sections, labeled fields, native modal focus handling, reduced motion and responsive grids. Test actual browser navigation, filters, dialog close/reopen, validation and brief generation. Check desktop and narrow widths. Keep imported data and local Electron user state untouched. Stage the full requested change without dependencies or generated artifacts. No deployment is included.
