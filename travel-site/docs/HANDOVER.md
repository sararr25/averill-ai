# Vamo website handover

Updated 28 September 2026. Scope: the independent, fictional travel-company website in `travel-site/`.

## Identity and product boundary

**Averill is the hackathon product:** an agent assistant for employees working with company information. **Vamo is the fictional travel company used to demonstrate it:** a consumer-facing brand and example customer. Vamo is never another name for Averill, and Averill is never the name of the travel agency. Do not put Averill's aperture, Petrol / Coral / Ice desktop styling, assistant language or navigation on Vamo's site. Do not put Vamo's wordmark, travel imagery, sea/cream/coral/fuchsia palette or editorial style on Averill's assistant UI. When both appear in one demo, identify them explicitly as separate products and surfaces.

The shipped desktop fixtures, onboarding packs and new synthetic identities now use Vamo (3 October 2026). Existing persisted workspaces and credentials are not automatically rewritten; follow `../../docs/DEMO_MIGRATION.md`. The intentional historical brief and square creative are preserved.

## Approved Vamo direction

- Name: **Vamo**.
- Position: modern, youthful travel collective using social storytelling and a creator-oriented editorial voice.
- Visual direction: the second photographed editorial concept previously shown to the user, adapted to Vamo. People together in recognisable places lead; large editorial headlines, paper-like edges, handwritten-feeling notes and vertical story previews support the photography. Avoid SaaS dashboard cards, dark navy and Averill visual motifs.
- Palette: warm cream `#FFF8E9`, primary sea ink **`#0E576B`**, mint `#BFE4D5`, pink-leaning coral `#F16D73`, small fuchsia accents `#D52C85`. Small text on coral uses deeper ink `#102B32` for contrast. Do not revert sea ink to the earlier `#14594F` proposal.
- Typography: locally bundled Fraunces for large editorial headings and DM Sans for interface text and the expressive Vamo wordmark.
- Brand source of truth: `design-system/tokens.css`, mirrored in `tokens.json`; rationale in `design-system/DESIGN_SYSTEM.md` and `docs/BRAND.md`.

## Current implementation

`index.html`, `styles.css` and `site.js` implement a responsive single-page website with a photographic hero, three destination cards and dialogs, creator-style editorial previews, journal dialogs, and a local downloadable trip brief. The trip form runs in the browser. There is no booking, payment, account, enquiry backend, Instagram connection or LinkedIn connection.

The ferry hero (`assets/photos/vamo-friends-ferry.png`) is AI-generated concept imagery. It does not depict a real Vamo trip or real creator. The Copenhagen, Vienna and Prague images are locally bundled third-party photographs credited in `docs/ASSETS.md` and the site credits dialog. The creator-style tiles are editorial previews, not actual posts, partnerships or engagement data. The separate `demo-social-simulator` already contains local Vamo Instagram, LinkedIn and Brevo-inspired content; it is not a platform integration.

## Run and review

From the repository root:

```sh
npm --prefix travel-site start
```

Open `http://127.0.0.1:4173/`; the Vamo design-system page is `/design-system/index.html`. The site has no install or build step. Use `PORT=<free-port>` if 4173 is in use. The local server binds to 127.0.0.1.

Verification performed in this local pass: `node --check` on `site.js` and `server.mjs`; JSON parse of `tokens.json`; `git diff --check`; browser load; Prague destination dialog; keyboard activation of the trip selection; browser-generated `vamo-prague-trip-brief.txt` link; 390px and 1440px viewport width checks with no horizontal document overflow. The in-app browser's pointer automation did not consistently activate a button in the dialog, while keyboard activation worked. The download link was generated, but saving a file was not separately confirmed. No production deployment or real-platform social account check was performed. See `docs/VERIFICATION.md` for dated history.

## Next work

1. Review the live site visually at desktop and mobile sizes with the owner; adjust the creative if requested.
2. For an existing workspace, explicitly import/review/reapprove the shipped Vamo pack; preserve legacy credentials and intentionally historical material.
3. Rehearse the separate Vamo Instagram/LinkedIn/Brevo simulator, including draft persistence, image uploads and local-only scheduling.
4. Recheck asset provenance, interaction, accessibility and responsive behavior before any public deployment.

## Repository and publication status

The Vamo website implementation was committed locally as `35228aa` on `main`. That initial push was blocked; the owner authorized release on 3 October and milestone 1 pushed the site commits to GitHub main. Averill's central handover remains `docs/HANDOVER.md` at repository root.
