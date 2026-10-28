# Feedback round, 28 October 2026

The owner tested release `v0.1.0-judge.20261028` (built from `4d6b764`) on 28 October and reported 11 problems. This spec turns each one into tickets. No code was changed while writing it.

Every cause below was checked in the code, the owner's local profile (structure only, no secret values) or the running processes on 28 October. Where a cause is a guess, the ticket says so.

## What went wrong last round

- **Learn:** the 27 October feedback asked for the *test* to confirm once per session or page, and to run inside the tool. Phase D1 changed only the Canva lesson. The weekly practice (`src/learning-ui.js`, lines 100 to 115) still has one form and one button per question, and every written question has its own "I tried this operation myself" tick. The task-based exercises ("Improve a composition") still ask for a note and a confirmation at every step. So the owner's report that "nothing changed" in the test is correct.
- **Social drafts:** FB-02 (25 October) asked for a "photo style where possible". The drafts that judges edit still use drawn SVG illustrations (`public/vamo/winter/*.svg`, which contain no photos), and their links go to `vamo.example`, a domain that does not exist.
- **Canva:** D1 was verified only on the synthetic page. The real canva.com page fails the reader.

Rule for this round: a ticket is done only when the owner's own words below are met and shown with a screenshot from the real surface (real Chrome, real canva.com, or the deployed simulator), not only from a synthetic harness.

## The owner's words (28 October), one per ticket group

1. "tavily e nebius mi dice che non sono attivi. come si fa per attivarli?" → T1
2. UI screenshots (question box, Canva card), "controlla se ci sono cose del genere anche in altre parti" → T2
3. "lo sfondo di averill lo farei leggermente più scuro" → T2
4. "web connesso con estensione e dice on ma app averill dice not sharing" → T3
5. LinkedIn draft: "deve essere un post che simula un post vero e proprio di linkedin … veritiero, con anche hashtags e un'immagine vera! + link al sito vamo. idem su brevo e instagram" → T4
6. "Canva: non funziona. dice che non può vedere il design" → T5
7. "quella tab rimane aperta sopra a tutto quindi è un casino" → T5
8. "non c'è la parte tutorial on canva per spiegarmi come utilizzarlo" → T5
9. "se chiedo cose come 'which font should i use' non mi risponde, o peggio mi risponde parlandomi del wording" → T6
10. "il design del post è orribile. anche qui deve sembrare vero e professionale" → T5
11. "la parte learn con il test: non è cambiato assolutamente nulla" → T7

## Decisions the owner must take

Each has a recommendation. Work on the related ticket waits for the answer.

- **Q1 (T1). Nemotron for the question box in the demo.** The demo workspace already sends **Check now** to Nemotron through the judge server, after consent. The question box ("Ask about approved company sources") does not, so it says "key needed". The options are:
  - Recommended: send question-box questions through the judge server too, with the same consent and daily limit.
  - Alternative: keep the questions local and change the wording so it does not look broken.
- **Q2 (T4, T5). Where the real photos come from.** The provenance of the existing `copenhagen.jpg`, `vienna.jpg` and `prague.jpg` is not recorded, so it is unknown. The options are:
  - Recommended: Unsplash or Pexels photos (free licence), with a `CREDITS.md` that lists each photo's author and link.
  - Alternative: the owner supplies photos.
- **Q3 (T2). The Canva card's colours.** It is always dark, while the app is light by default. The options are:
  - Recommended: follow macOS like the app, light by default.
  - Alternative: stay dark, so it stands out on Canva's white page.
- **Q4 (T5). A live session on real canva.com.** The reader can only be fixed by looking at the real page. This needs the owner's Chrome and Canva login. The owner either opens the design and lets Claude in Chrome read the page, or saves the page with DevTools. Nothing is edited in Canva.
- **Q5 (T5). Who makes the starting Canva design.** The options are:
  - Recommended: Claude builds it in the owner's Canva account through the Canva connector, which is available in this environment, and the owner approves it.
  - Alternative: the owner picks a Canva template.

## T1. Nebius and Tavily say they are off

**Cause (verified):**
- Keys live in `averill-secrets.enc.json` inside the app profile (`main.js`: `secretPath`, `loadSecrets`). The current profile, `~/Library/Application Support/averill-ai-desktop`, was recreated with Try the demo and has no such file.
- The keys from before are only in `averill-ai-desktop-backup-2026-10-25/averill-secrets.enc.json`.
- The demo workspace (`demoAccounts: true`) sends Check now and Tavily through the judge server. However, the question box (`onlineCheckState`, `ask` in `main.js`) uses only a local key.
- Only an admin (Alex) can save a key (`workspace:save-key`). Emma sees "Nemotron AI: key needed in Setup", but she cannot act on it, and the tab is no longer called Setup.

**T1.1 Owner's Mac, now (no code):**
- Write a step-by-step note in HANDOVER covering:
  - Sign in as Alex, go to More › Workspace settings › AI services, and paste the Nebius and Tavily keys. The keys are in `.env.local`, which the owner can open; never copy them into the repo or a chat.
  - Or quit Averill and copy `averill-secrets.enc.json` from the backup folder into the current profile.
- The copy may fail to decrypt if the backup was written by a different app build, because the macOS keychain item belongs to the app. In that case, paste the keys again.
- Do not do this for the owner without their go-ahead, since it touches their profile.

**T1.2 Pill text and action:**
- When there is no key:
  - An admin sees "Nemotron AI: add a key", which opens Workspace settings › AI services.
  - Other people see "Nemotron AI: off (ask your admin)" and no dead link.
- In the demo workspace, the pill states what actually happens (see Q1).
- Replace every stale "Setup" and "Open Work" in UI copy with the real place:
  - "Setup" appears in `agent.js` lines 131, 139 and 195, `company-privacy.js:4`, `knowledge-ui.js:44/52/66/82`, `learning-ui.js:23` and `public-site.js:24`.
  - "Open Work" appears in `agent.js:250/355`, and `showTab('work')` is called at `agent.js:604/660/864`.

**T1.3 (if Q1 = recommended) Question box through the judge server in the demo:**
- Use the same consent, quota, quote validation and "Nemotron suggestion" label as Check now.
- The local answer stays the fallback.
- Needs a judge-server route or reuse of `/api/review`. Write it in `judge-ai-server/` and test it with a mocked provider.

**Accept:**
- A screenshot of each pill state.
- A grep that finds no "Setup" or "Open Work" left in renderer copy.
- `npm test` passes.
- Live: after T1.1, a real question returns a cited Nemotron answer and a real Tavily check returns results. Record a receipt in HANDOVER.

## T2. UI defects and a darker background

**T2.1 Question box (screenshots 1 and 2):**
- The input draws its own focus ring inside the box's focus ring (`.review-composer .ask-form:focus-within` plus the input's default outline), so you see two borders. Keep one ring on the box.
- "Choose work" sits inside the box, with too much left space, and points to a tab that moved in phase C. Change it as follows:
  - When a draft is connected, show its name.
  - When nothing is connected, show "Connect a draft", which goes to the Working on now card.
  - Align it to the input's baseline.
- The dashed pill reads as disabled. Give it the same solid style as the other status pills, with a clear on/off word.

**T2.2 Canva card (screenshot 3):**
- The checkbox focus ring is a thick lime square bigger than the box. Make it a 2 px ring with a 2 px offset in the same colour as the app's focus ring.
- Apply Q3 to the card colours.

**T2.3 Sweep for the same defects everywhere:**
- Check every input, select and button that sits inside a bordered container in `agent.html`, `companion.html`, `work.html` and the extension card and popup, in light and dark.
- Look for:
  - double focus rings;
  - labels sitting off the baseline;
  - dashed "disabled-looking" chips that are actually enabled;
  - padding inside one container that doesn't match.
- Add the check to `scripts/verify-phase-b.cjs`: no element inside a `:focus-within` container may draw its own outline when focused.

**T2.4 Background slightly darker:**
- Today `--av-canvas` is `#f6f5f8` and surfaces are `#fff`.
- Proposal: canvas about `#ecebf1`, keeping surfaces white, so cards separate from the background. Recheck the 7:1 body and 4.5:1 small/large contrast rule in `verify-phase-b.cjs`.
- Show the owner a before/after inline mockup in chat before changing tokens.

**Accept:**
- Before/after screenshots of each defect.
- `verify-phase-b` passes in light and dark with the new focus check.

## T3. Chrome shows ON, Averill says NOT SHARING

**Cause (verified):** the header pill (`agent.js:142`) counts only the supplied editors (`current.shared`) and a selected app window. It ignores the Chrome connection (`current.externalObservation` and the browser pair), so a connected Brevo or Canva tab still shows "NOT SHARING".

**Fix:** one source of truth for "what Averill can see now". The pill shows:
- "SHARING: brevo.example" (the host) while a browser field or design is connected;
- "WINDOW: <app>" for a selected window;
- "NOT SHARING" only when nothing is connected.

The plug icon next to it and the extension badge must agree.

Also check whether the owner's Chrome was talking to an old Averill. On 28 October an Averill from 25 October (pid 20011, its app folder already deleted) was still running next to the new one. The new one held port 43147.

Add `app.requestSingleInstanceLock()` so a second copy focuses the first instead of running. The lock only works per app build, so also tell the owner to quit old copies.

**Accept:**
- A test in `verify-phase-c.cjs`: after a simulated field connects, the pill reads "SHARING: brevo.example"; after Disconnect, it reads "NOT SHARING".
- A second launch of the packaged app does not start a second copy.

## T4. Realistic drafts on LinkedIn, Instagram and Brevo

Files: `demo-tools/social-simulator/src/data/flawed-drafts.json`, `src/services/social-posts.ts`, the LinkedIn, Instagram and Brevo components, and `public/vamo/`.

General rules for all three:
- Real photos per Q2, with credits.
- No drawn SVG as the main image.
- Every link goes to the live Vamo site, for example `https://vamo-travel-site.vercel.app/winter.html`, never to `vamo.example`.
- Keep the planted flaws exactly, because the judge demo depends on them:
  - "lowest prices guaranteed";
  - the missing footer;
  - 5 hashtags on LinkedIn;
  - `#lowestprice`;
  - the price text printed on the Reel image.
- Check the copy with the no-dash test from FB-03.
- Simulator copy stays English.

**T4.1 LinkedIn company post draft (`vamo-li-winter-draft`):**
- Write it like a real company-page post:
  - a hook in the first line that works before "see more";
  - 2 or 3 short paragraphs with line breaks;
  - a concrete detail per city;
  - a soft call to action with the Vamo link;
  - hashtags at the end.
- Use one landscape photo at 1200 × 627 px, or 1080 × 1350 px portrait.
- Show it in the composer as LinkedIn does: author line "Vamo · Company", a link preview card with image, title and domain, and the "…see more" cut.
- Also give the published posts in the feed the same treatment.

**T4.2 Instagram Reel/post draft (`vamo-ig-winter-reel-draft`):**
- Caption:
  - a hook within the first ~125 characters;
  - a short story;
  - a call to action ("link in bio");
  - the collaborator tag @ida.on.tour;
  - hashtags at the end.
- Use a 4:5 photo (1080 × 1350 px) or a 9:16 Reel cover photo. The planted "Lowest prices guaranteed" stays as text set on the photo, so the image check still finds it.
- The profile link points to the Vamo site.

**T4.3 Brevo launch draft (`vamo-brevo-winter-v2`):**
- Today the body is one sentence. Give it the full structure the other campaigns already have:
  - inbox header, preheader, logo;
  - hero photo, headline, intro;
  - three city sections with a photo each;
  - one button to the Vamo winter page;
  - sign-off.
- The footer stays missing on purpose, because that is the planted flaw.

**Research basis (28 October):**
- LinkedIn: a company-page post is read in its first lines before "see more"; feed images are 1200 × 627 or 1080 × 1350.
  - [postiz](https://postiz.com/blog/linkedin-post-dimensions)
  - [linkedinpreview](https://linkedinpreview.com/blog/linkedin-image-sizes-2026)
- Instagram: the feed cuts captions near 125 characters; captions follow hook, context, next step, then a few hashtags.
  - [boomp](https://boomp.net/blog/instagram-caption-best-practices-2026)
  - [Vista Social](https://vistasocial.com/insights/how-to-write-instagram-captions/)
- Email: logo, hero, sections with images, one clear button, footer with address and unsubscribe.
  - [unlayer](https://unlayer.com/blog/newsletter-design-best-practices)
  - [bonjoro](https://www.bonjoro.com/blog/post/email-newsletter-layout-design-best-practices)
- Recheck sizes against LinkedIn's and Instagram's own help pages while building.

**Accept:**
- Screenshots of the three drafts in the deployed preview.
- No broken images in the console.
- A link check that every href resolves on the live Vamo site.
- The flaw matrix still passes: `verify:contextual` for linkedin, instagram and brevo, and the image OCR test.
- The simulator `npm test` and build pass.

## T5. Canva: the reader fails, the card is in the way, there is no tutorial, and the design is ugly

**T5.1 "Averill cannot read this design: The two text layers on this page do not match":**
- This message comes from the fail-closed check in `browser-extension/canva-design.js`. The real canva.com page renders text in a way the synthetic page (rebuilt 25 October) does not. That is a guess until the live capture.
- Steps:
  1. Run the Q4 live capture on the owner's design.
  2. Record what Canva's text layers look like now, then update the reader to pair them correctly.
  3. Add the captured structure as a new synthetic fixture.
  4. Keep it fail-closed for anything still unknown.
- No new permissions, no screenshots and no OCR (AGENTS.md FB-14).

**T5.2 The card covers Canva:**
- Today the card is fixed at the top right with the maximum z-index (`content.js:333`) and cannot be moved or shrunk. Changes:
  - a minimise button that turns it into a small pill showing status and the count of steps or warnings;
  - drag to move;
  - the position is remembered for the tab session;
  - start minimised while "Watch my design" is off;
  - never cover Canva's own top bar or the export button.
- The "Fix before you export" warning may expand the card again, because blocking is the approved behaviour.

**T5.3 A Canva tutorial inside Canva:**
- The lesson says what to achieve, not how to do it in Canva. Add a "How to do this in Canva" panel for each lesson step, shown in the card next to the step, for example:
  - add text with the Text tool;
  - change size in the toolbar;
  - align with Position › Align;
  - show margins with File › View settings › Show margins;
  - group with Cmd+G.
- Use short steps, one illustration each, and a link to Canva's own help page.
- Verify each instruction against Canva's current help pages and the live editor during the Q4 session.
- Averill never clicks Canva's controls.

**T5.4 The starting design looks unprofessional:**
- Replace design DAHZAkgeHzA "Vamo Copenhagen before 8 Instagram post" with a professional post:
  - a real photo (Q2);
  - the Vamo fonts: Fraunces for the headline, DM Sans for the body (`travel-site/design-system/tokens.css`);
  - Vamo colours;
  - text inside the 108 px safe margin;
  - 1080 × 1350 or the agreed size.
- Keep one deliberate, fixable problem for the design check (for example the body line still to write), as section 5 of the guide expects.
- Create the template link (the guide's TODO) per Q5. Do not invent a URL.

**Accept:**
- A screen recording or screenshots on real canva.com:
  - the card reads the owner's design;
  - minimise and drag work;
  - each tutorial step is shown;
  - the lesson ticks steps on the real design.
- `verify:canva-design` passes, with the new captured fixture.

## T6. Design questions get answers about wording

**Cause (verified):** the Vamo company pack contains no font or typography rule (only one SVG shows fonts). The question box answers from approved sources, and its local fallback matches claim and wording rules, so "which font should I use" gets an answer about wording.

**T6.1 Content:** add a Typography and layout section to the Vamo brand guidelines:
- Fraunces for headlines and DM Sans for text, as on the Vamo site;
- sizes, weights and when to use each;
- with `Design rule:` lines like the existing ones.
- Ship it as a new version that Maya approves, never auto-approved.

**T6.2 Behaviour:**
- Recognise design questions (font, colour, size, layout, spacing, image) in the app question box and in the browser card. Answer them only from approved design rules, with the citation.
- If no approved rule covers the question, say so plainly ("No approved rule covers fonts. Ask your lead.") instead of answering about wording.
- In the Canva card, add the current design's facts when they help, for example "Your headline uses 64 px".

**Accept:**
- Unit tests for design questions with and without a rule.
- A screenshot of "Which font should I use?" answered with the Fraunces/DM Sans rule and its citation, in the app and in the Canva card.

## T7. Learn: the test confirms per session and runs in the tool

**T7.1 Weekly practice as one page:**
- Show all questions on one page with one "Submit practice" button.
- Written practice questions share one "I tried these myself" confirmation for the whole page.
- Feedback for every answer appears together after submitting, and you can retry only the wrong ones.
- Keep the stored records: person-scoped, separate from performance, and Copenhagen week keys.

**T7.2 Tool practice happens in the tool:**
- A practice question about Canva gives a task to do in Canva, ticked by the design reading (T5.1).
- A question about an email gives a task to do in the Brevo draft, ticked by the field reading.
- Written reflection stays only for things Averill cannot see.

**T7.3 Task-based exercises:**
- "Improve a composition" and the others show their steps as one page, with one confirmation at the end, like the Canva lesson.
- If an exercise belongs to a tool, it runs in that tool with automatic ticks where Averill can read the result.

**T7.4 Old sessions:**
- The owner's profile has three unfinished sessions from before D1 (no `lesson` and no `checks` fields), and `start()` resumes them.
- Migrate them to the new format, or offer "Start again", so the new screens are what the person sees.

**Accept:**
- Screenshots of the weekly practice page before and after submitting.
- `tests/learning.test.js` covers the single submit, the single confirmation and the old-session migration.
- `verify-feedback` and `verify-guide` pass.
- Run on the owner's real profile copy (a temporary copy, never the original) to see the old sessions open in the new format.

## Order of work

1. **Bugs that block testing:** T3 (pill and single instance), T1.1 and T1.2 (keys and copy), T2.1 to T2.3 (UI defects).
2. **T5.1:** needs the Q4 live session; nothing else in Canva is worth building before the reader works.
3. **T7:** Learn, because it was missed last round.
4. **T4:** realistic drafts, after Q2.
5. **T5.2 to T5.4 and T6:** Canva card, tutorial, design and design questions.
6. **T2.4:** darker background, after the mockup is approved.
7. Update `test-averill.md`, rebuild, and publish a release only on the owner's word.

**Delegation:**
- Haiku: copy sweeps and greps, credits files.
- Sonnet: T1.2, T2, T3, T4 and T7.
- Opus: T5.1 reader changes and the T6 question routing.
- Each piece is rechecked in the main session before its commit.

## Out of scope

- The Chrome Web Store listing (Q5 of 27 October: later, only with the owner's approval).
- New tools beyond Canva, Brevo, LinkedIn and Instagram.
- Any change that lets Averill edit, export or publish in Canva or social tools.
