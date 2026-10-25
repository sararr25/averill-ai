# Canva spike, 25 October 2026 (FB-13)

This spike answers ticket FB-13 in FEEDBACK_SPEC_2026-10-25.md. It ran in the owner's real Chrome on real canva.com, signed in to the owner's account. No Averill code was changed.

## Starting post

- Created in the owner's Canva account with the Canva connector: "Vamo Copenhagen before 8 Instagram post", design ID DAHZAkgeHzA, edit link https://www.canva.com/d/Rx8sBkMXCgxWiQp.
- Size 1080 by 1440 (Instagram 3:4 portrait, Canva's "Instagram Post (3:4)"), not 1080 by 1350 as the spec first said.
- Content:
  - Copenhagen canal photo (top).
  - Light cream panel (bottom, about #F5F0E5).
  - Small "vamo" wordmark top left.
  - Finished headline "copenhagen before 8" in near-black #100F0D.
  - Body line "finish this line: what makes the city good before 8?" that the judge replaces.
- The photo came from the generated layout, not from the Vamo asset folder. The Vamo Copenhagen photo was uploaded to the owner's Canva uploads (asset MAHZAveEJjc) but not placed.
- Owner step still open: create the template link (Share, Share link, choose "Template link", copy). Canva Help says this works on free accounts. The agent did not do this step, because it publishes a link. After that, test it once with a second Canva account (acceptance item still open).
- Evidence: review-evidence-2026-10-25/canva-starting-post-editor.jpg

## Spike findings

| Question | Result | Evidence |
| --- | --- | --- |
| 1. Is Canva text readable from the page? | Yes. Each text line is a real DOM span with a computed CSS color (for example rgb(16, 15, 13)). It is not drawn on a canvas, and there is no canvas element inside the page. | Page reading in the spike run |
| 2. Can we find the design page frame? | Yes. A div with inline style width 1080px and height 1440px (the design size) holds the elements. Its parent carries the zoom as a CSS scale (matrix 0.400694 at 40%). Each element wrapper carries its design position in its CSS transform (headline: translate 64.0151, 891.786, the same values Canva's own design data reports). The frame was found by inline size, not by class names, because class names are obfuscated (for example "a_GcMg"). | Page reading in the spike run |
| 3. Does it survive a zoom change? | Yes. At 100% zoom the computed design position of the body line was (71.5, 1275.5), against Canva's data (71.47, 1276.17). At 100% the page is partly off screen (top at minus 285px), so a screenshot would see only part of the design, while the page reading still works. | review-evidence-2026-10-25/canva-zoom-100-page-offscreen.jpg |
| 4. Can we read the background pixels under a text box? | Yes, from the page itself. Background images are img elements with crossOrigin "anonymous". Drawing them on a canvas and calling getImageData worked without a security error (center pixel of the cream panel: 244, 239, 228). Not tested: a photo the user uploads, a solid color fill without an image, gradients. | Page reading in the spike run |
| 5. Contrast check end to end, all in the page: 132 ms. | Body line: text rgb(16,15,13) on average background rgb(245,240,229) gives 16.86:1, which passes WCAG AA 4.5:1. Pistachio green rgb(147,197,114) on the same background would give 1.76:1, which fails. "vamo" on the sky gives 11.67:1; pistachio there gives 1.22:1. The averaging of background pixels is crude. FB-14 should use the worst-case area, not the mean. | Page reading in the spike run |
| 6. Is a screenshot plus macOS OCR a route? | It works, but it is slower and weaker. A 1411 by 840 capture gave four text lines whose boxes match the DOM within about 4px. It took about 12 s with the uncompiled spike script (a compiled binary will be faster; not measured). It only sees the visible part of the page. | Screenshot and OCR run in the spike |
| 7. Does chrome.tabs.captureVisibleTab work with only activeTab in the Averill extension? | NOT TESTED. The capture above came from the Claude in Chrome tool, not from the Averill extension. It is not needed if FB-14 uses the page-reading route. | Not applicable |

## Recommendation for FB-14

Use the page-reading route in the existing content script. Read the text, color and design box from the DOM. Read the background pixels from the page images. Compute contrast and safe zones in the extension. Send only the text and the numbers (not images) over the existing loopback bridge for rule checks and citations.

No screenshots, no OCR, no new permissions. Keep screenshot plus OCR only as a fallback if a design has no readable DOM text.

Risk: Canva can change its page structure at any time without notice. The adapter must fail closed with a clear "Averill cannot read this design" message. The demo needs a rehearsal check on the day.

## Open items

- Owner: create the template link and run the second-account test.
- captureVisibleTab test only if the fallback is ever needed.
- Test uploaded photos and solid fills.
- Confirm Instagram safe margins for 3:4 before coding.
