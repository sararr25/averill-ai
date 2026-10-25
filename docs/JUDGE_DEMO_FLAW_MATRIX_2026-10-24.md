# Judge demo flaw matrix — 24 October 2026

Ticket JD-06. Every flaw planted in the simulator drafts, the approved Vamo source that catches it, and what Averill's local approved-rules check reports. The drafts live in `demo-tools/social-simulator/src/data/flawed-drafts.json`; `travel-desktop/tests/flaw-matrix.test.js` reads that same file, checks each finding and citation below, and checks that the corrected draft produces no finding.

| Draft (simulator) | Field | Planted flaw | Finding | Approved source and passage |
| --- | --- | --- | --- | --- |
| Brevo · Winter Escapes 2027 · launch draft | Subject line | "lowest prices guaranteed" | forbidden-claim | `current-brief.md` v2 — Do not claim "lowest prices guaranteed" or imply a price guarantee. |
| Brevo · Winter Escapes 2027 · launch draft | Audience | Sent to "All travel subscribers" | field-requirement | `current-brief.md` v2 — Field requirement: email \| audience \| "Travel subscribers, Denmark". |
| Brevo · Winter Escapes 2027 · launch draft | Email content | "lowest prices guaranteed" | forbidden-claim | `current-brief.md` v2 (as above) |
| Brevo · Winter Escapes 2027 · launch draft | Email content | Footer missing | missing-required-text | `brand-and-legal.md` v1 — Every marketing email must include this footer: "You are receiving this email because you subscribed to Vamo. Unsubscribe anytime." |
| Brevo · Winter Escapes 2027 · last-call reminder | Email content | Footer missing | missing-required-text | `brand-and-legal.md` v1 (as above) |
| Brevo · Winter Escapes 2027 · Vienna teaser | Email content | "Lowest prices guaranteed on every Vienna break" | forbidden-claim | `current-brief.md` v2 (as above) |
| LinkedIn · winter company post draft | Post text | "Lowest prices guaranteed" | forbidden-claim | `current-brief.md` v2 (as above) |
| LinkedIn · winter company post draft | Post text | CTA "Explore the winter collection" missing | missing-required-text | `linkedin-campaign.md` v1 — Include "Explore the winter collection". |
| Instagram · paid creator Reel draft | Caption | "Paid partnership with Vamo" missing | missing-required-text | `brand-and-legal.md` v1 — For paid creator content, include "Paid partnership with Vamo" in the caption. |
| LinkedIn · winter company post draft | Post text | 5 hashtags (#vamotravel #travel #citybreaks #winter #europe) | hashtag-too-many | `social-media-guidelines.md` v2 — Hashtag rule: linkedin \| max \| "3". |
| Instagram · paid creator Reel draft | Caption | Banned tag #lowestprice | hashtag-banned | `social-media-guidelines.md` v2 — Hashtag rule: any \| banned \| "#lowestprice". |
| Instagram · paid creator Reel (disclosure added, banned tag removed) | Caption | Paid Reel without #ad | hashtag-missing | `social-media-guidelines.md` v2 — Hashtag rule: instagram \| paid-required \| "#ad". |
| Instagram caption (any) | Caption | Brand tag #vamotravel missing | hashtag-missing | `social-media-guidelines.md` v2 — Hashtag rule: instagram \| required \| "#vamotravel". |
| Instagram · paid creator Reel draft | Image (read by OCR) | "Lowest prices guaranteed" printed on the artwork (`winter-reel-vertical-price.svg`) | forbidden-claim | `current-brief.md` v2 (as above) |

## Hashtag rules (FB-09)
Guidelines v2 has a Hashtags section with machine-readable `Hashtag rule: <task> | required, banned, max or paid-required | "<value>".` lines. Tags are matched case-insensitively, counted once each, and only checked in caption or post text fields. The rules apply only once the v1/v2 guidelines conflict is resolved (Maya supersedes v1); until then Averill uses neither version, so the flaw-matrix test performs that step first and has a second test proving the unresolved state raises no hashtag finding. The published posts in `social-posts.ts` are tested to raise no hashtag finding (LinkedIn posts now carry #vamotravel). The paid #ad rule fires when the caption mentions a paid partnership or sponsorship, and adds to the existing "Paid partnership with Vamo" rule.

## Image check (FB-08)
After the employee presses "Check images too" in the in-page card, Averill checks the images in the post editor on this device: an image is present, it has alt text, its aspect ratio and width fit the platform, and the text printed on it (read with the macOS OCR helper that imports use) is checked against the approved claim rules. Hashtag and caption-only rules do not apply to image text. The image rules are the `Image rule: <task> | required, aspect, min-width or alt-text | "<value>".` lines in the Images section of guidelines v2, and each finding cites its line. The Reel draft's image is `winter-reel-vertical-price.svg`, a copy of the Reel artwork with "Lowest prices guaranteed" printed on it; the corrected image is the original `winter-reel-vertical.svg`. `flaw-matrix.test.js` runs both, once with the words drawn in the artwork and once with the real OCR helper where the machine has it. The LinkedIn draft image (`winter-linkedin-landscape.svg`, 1200 by 627) meets the rules. A cross-origin image the page will not let the extension read sends no pixels, and the card says so; its size and alt text are still checked.

## Not checked automatically
- LinkedIn draft: "book before the end of October" is invented urgency. `linkedin-campaign.md` says tone and factual accuracy need human review; the local check does not flag it.
- Dates, times and assets are checked only when the selected field is labelled as that field (for example a Date field in the Brevo schedule dialog). Body text is not searched for them.

## Change made for this matrix
The required-text check accepted body fields labelled body, message, caption, post copy or email content. The LinkedIn editor field is labelled "Post text", so the missing CTA was never reported. `travel-desktop/src/task-review.js` now also accepts "post text"; the LinkedIn test case fails without it.
