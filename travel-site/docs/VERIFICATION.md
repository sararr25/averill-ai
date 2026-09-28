# Verification

26 September 2026. Verified in the Codex internal browser.

- Node syntax checks passed for site.js, icons.js and server.mjs.
- Static server homepage returns HTTP 200; root path normalization corrected during verification.
- Homepage visuals inspected at 1440×900 and 375×812; document width matched viewport width, without horizontal overflow. All city photos and brand marks loaded.
- Vienna filter produced one visible city and announced “1 city story”; restoring all cities produced three.
- Vienna detail opened with its suggested outline; selection prefilled the planner. Prague dialog closed with Escape.
- Mobile menu expanded and destination navigation worked.
- Submitting without a destination activated native invalid-field focus; choosing Prague and February 2027 generated the matching brief summary and download link.
- Download link activated, but the internal-browser download event timed out. File saving is not confirmed in that browser.
- Design-system navigation and mobile gallery visually checked.
- No warnings or errors were captured in the console during homepage interaction checks.
- No production deployment, commercial transaction, booking backend or certified accessibility conformance is claimed.

## Common Miles identity pass · 28 September 2026

- `node --check travel-site/site.js` and `node --check travel-site/server.mjs` passed.
- `tokens.json` parsed and `git diff --check` passed.
- Local homepage and design-system gallery loaded in the in-app browser. The narrow viewport screenshot showed the new wordmark, hero, CTA and credited Copenhagen photo without visible horizontal overflow.
- This pass changed labels and styling but not filter, dialog or planner algorithms. Chrome interaction checks passed for the Vienna filter and live count, destination dialog, trip selection and local brief result. The in-app browser did not activate controls reliably; Chrome provided the interaction proof.
- The legacy Elseweek desktop source pack remains historical and requires a separate coordinated migration if the demo company is renamed there.

## Vamo identity and site · 28 September 2026

- Rebuilt the independent travel-site homepage with the approved second editorial/photo direction, Vamo name and Coastline palette. Primary ink is `#0E576B`; coral is `#F16D73`, mint is `#BFE4D5`, and small fuchsia marks use `#D52C85`.
- `node --check` passed for `site.js` and `server.mjs`. The local page loaded in the in-app browser with all major sections in the accessibility tree.
- Verified the Prague destination dialog, keyboard activation of “Start with Prague”, and generation of a local `vamo-prague-trip-brief.txt` download link. The browser's pointer automation did not consistently activate buttons inside the open dialog; keyboard activation did. No production deployment is claimed.
- At an explicit 390px viewport, `document.documentElement.scrollWidth` matched `innerWidth`, so no horizontal page overflow was found. A desktop 1440px viewport also matched document width.
- The ferry hero is AI-generated concept imagery, labeled as such in credits and asset documentation. Creator tiles are editorial previews rather than live social posts. The desktop Elseweek fixtures remain historical and were not changed in this pass.
