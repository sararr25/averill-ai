# Demo Social Simulator

A local React demo with separate Instagram, LinkedIn and Brevo inspired workspaces. All three open without sign-in and use fictional Vamo data. Nothing connects to real platform accounts.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. The production build is `npm run build`.

Instagram and LinkedIn show fictional Vamo editorial posts. Neither page connects to a real account or reports engagement metrics. Posts created in the demo are stored locally in the browser under `demo-social-simulator:vamo-posts:v1`; the older generic seed namespace remains untouched. `src/services/social-posts.ts` is the persistence boundary. `src/services/external-events.ts` dispatches `demo-social-post-created` with `{ platform, post }` and logs a demo notification; it does not publish externally. Uploaded images are stored as data URLs, so very large images may exceed browser storage quota.

The visual source is `../averill-ai/travel-site/design-system/` and the brand voice is `../averill-ai/travel-site/docs/BRAND.md`. The copied local photos and mark in `public/vamo/` come from that site; provenance is in `../averill-ai/travel-site/docs/ASSETS.md`. The ferry image is generated concept imagery. LinkedIn and Instagram posts are fictional editorial examples.

## Brevo demo

Open `/brevo` for a Brevo-inspired Marketing > Campaigns workspace. Create an Email campaign, configure a fictional sender and recipient list, write the subject and email, add an optional image, preview desktop/mobile, then choose Send now or Schedule for later. Both actions only update local demo state; no email is sent. Campaigns persist under `demo-social-simulator:vamo-brevo-campaigns:v2`, and creation emits `demo-brevo-campaign-created` and a status change emits `demo-brevo-campaign-status-changed`, each with `{ platform: 'brevo', campaign }`. The Brevo layout and setup flow were checked against Brevo's official Help Center screenshots and documentation.

UI references: [Brevo platform overview](https://help.brevo.com/hc/en-us/articles/33456241984914-Overview-of-the-Brevo-platform) and [email campaign creation](https://help.brevo.com/hc/en-us/articles/4413566705298-Create-and-send-an-email-campaign).


## Rehearsal scope and verification

Brevo models Regular email creation, campaign name/folder, sender, one fictional audience, subject/preview text, a simplified Simple editor, desktop/mobile preview and local Send now/Schedule for later. Date, time and timezone are separate controls; schedules use Europe/Copenhagen regardless of the computer timezone. The starter Winter Escapes draft intentionally contains the prohibited price guarantee, the broad audience and no required Vamo footer so Averill can review an actual employee edit. Previous Brevo storage is preserved in its old namespace.

Advanced settings, A/B tests, drag-and-drop templates, real recipient counts, inbox delivery and paid scheduling modes are outside this demo. Unsupported platform controls are disabled or labeled. Instagram supports a photo/caption composer and profile post detail; LinkedIn supports text with optional media. Like/save toggles are session-local. Social scheduling, paid partnership controls and Reel video are not implemented here: use the supplied desktop fixtures to test those structured requirements. Never describe these simulations as verified production integrations.

4 October browser checks passed Brevo creation, folder selection, sender/audience/subject/body saves, mobile preview, invalid schedule rejection, Copenhagen scheduling and reload persistence; LinkedIn text save and reload persistence; Instagram profile and composer inspection. A later native Chrome picker check passed Instagram image upload and caption editing without changing controller permissions. Image save/reload remains unverified. The owner authorized and completed Averill extension installation; actual selected-field transport passed for all three demo pages, and Brevo correction/recheck/Stop passed. See ../../docs/INSTALLED_EXTENSION_2026-10-04.md for the precise boundary.

Use Node 22.17+ for `npm test` (timezone and invalid-date tests), then `npm run build`. For manual acceptance: upload a credited image to Instagram, enter a caption, save locally, reload, open the tile and confirm the caption/image; repeat optional media upload in LinkedIn and Brevo. Verify Cancel/close, local persistence and no external requests. Run the extension acceptance checklist only after approval; share one matching field at a time.

The canonical versioned copy is `averill-ai/demo-tools/social-simulator/`. The pre-existing sibling `demo-social-simulator/` remains runnable and was synchronized in this pass. Future source edits should be made in the canonical copy and copied explicitly to the sibling if that running checkout is still needed. In the canonical copy, asset guidance is at `../../travel-site/docs/BRAND.md` and `../../travel-site/docs/ASSETS.md`.

The unused Tailwind build dependency was removed after an npm advisory. Its unchanged static CSS reset is retained with the MIT license in src/vendor/; all platform styling uses local CSS.
