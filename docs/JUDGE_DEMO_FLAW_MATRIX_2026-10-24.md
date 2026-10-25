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

## Not checked automatically
- LinkedIn draft: "book before the end of October" is invented urgency. `linkedin-campaign.md` says tone and factual accuracy need human review; the local check does not flag it.
- Dates, times and assets are checked only when the selected field is labelled as that field (for example a Date field in the Brevo schedule dialog). Body text is not searched for them.

## Change made for this matrix
The required-text check accepted body fields labelled body, message, caption, post copy or email content. The LinkedIn editor field is labelled "Post text", so the missing CTA was never reported. `travel-desktop/src/task-review.js` now also accepts "post text"; the LinkedIn test case fails without it.
