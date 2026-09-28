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
