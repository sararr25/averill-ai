# Canva general-help regression acceptance — 29 October 2026

- With no approved Design rule, low-contrast text still yields a general design warning; missing rules do not mean a design is good. General suggestions are labelled separately from mandatory company requirements.
- With company AI off, ask “How do I create a frame in Canva?”. Review the outbound preview: a generic operation and official public excerpts only for Nemotron. Confirm, receive practical supported steps, and check the cited official help. No company policy must be enabled for this public-only request.
- Cancel that preview: no provider call. Company document questions remain local while company AI is off.
- A previously ticked lesson step must lose its tick if current contrast/margin regresses. Restore the actual design and recheck. Historical practice is separate.
- A measured clean result explicitly limits itself to measured checks and never certifies the whole design. Real composition, final viewing size, crop and grouping need human review.
- Automated evidence: desktop 268 tests, synthetic Canva 31 steps/35 relays, plus real public-only providers. These do not replace real edit/fix/recheck or human usability acceptance.

# Test Averill

Averill helps you complete work, improve drafts and learn how to use your tools. It also checks company requirements and shows the source. Everything here is fictional (the company Vamo, its people and its tools). Nothing is posted. Only if you agree, a draft is sent to NVIDIA Nemotron for a second opinion.

**You need:** a Mac with Apple Silicon (M1 or newer) and Google Chrome. Sections 5 and 6 also need a free Canva account.

## 1. Open Averill

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest) and unzip it.
2. Right-click `Averill.app` › **Open** › **Open**. The app is unsigned, so macOS asks once.
3. Click **Try the demo**. You are signed in as Emma from Marketing. No password is needed. Averill opens on **To do**, which lists the tasks that need your review.
4. Choose **1-minute tour**, or **Skip**. The **?** button on each screen explains that screen later.

## 2. Add the Chrome extension

1. In Averill, open **Current work** and click **Install extension**. Averill opens `chrome://extensions` in Chrome and shows the `browser-extension` folder in Finder. Nothing is installed automatically.
2. In Chrome, turn on **Developer mode**, click **Load unpacked** and choose that `browser-extension` folder. The three illustrated steps under the button show the same.
3. If you loaded an older copy, click the reload button for the extension at `chrome://extensions`; the Pro extension is version **0.4.0**. The app and extension must come from the same build.
4. Averill notices the extension by itself: **Install extension** becomes **Connect**.

## 3. Check a draft

1. In Chrome, open <https://averill-demo-sim.vercel.app/brevo> and open **Winter Escapes 2027 · launch draft**. It is wrong on purpose.
2. Click the Averill extension › **Connect this tab**, then approve the connection in Averill. The extension popup shows the connection state, and the toolbar badge shows **ON** while connected. The connection stays on until you press **Disconnect** in Averill, sign out, quit Averill, close the tab or open another site. Clicking **Connect** in Averill only brings Chrome forward; Averill says it is connected only once your draft appears.
3. Click the email text, then **Ask Averill**. In Averill, **Current work** now shows the draft under **Working on now**, already set to **Marketing email** because the page is Brevo.
4. Averill flags "lowest prices guaranteed" and the missing footer, and shows the approved company rule behind each one. Fix the text yourself and the warnings go away.
5. In the **Ask about this draft or company rules** box, type `Can we say lowest prices guaranteed?` and press Enter. Averill answers with the approved rule it cites.
6. In Averill, choose **Check now**. The check is listed under **Recent work** afterwards. After the local check, Averill asks before sending the draft to NVIDIA Nemotron through the Vamo demo server. Nemotron findings are marked **Nemotron suggestion** and appear only when their quotes match your draft and an approved rule. The server has a daily limit; when it is reached, Averill says so and the local check still works.
7. Under **Double-check online**, tick the public statements (dates, prices, events) and choose **Check with Tavily**. Nothing is sent before that click. The demo allows 10 searches a day. Results appear under **Public check, not company approval**, with a link and an excerpt. The verdict is **Unclear** unless Nemotron is on.

Press **Disconnect** in Averill at any time to end sharing.

**Also try:** <https://averill-demo-sim.vercel.app/linkedin> and <https://averill-demo-sim.vercel.app/instagram>. Under **Drafts**, choose **Edit draft** and check it as above. Averill picks **Organic LinkedIn** or **Paid Instagram** from the site.

## 4. Try the other roles

Click **Sign out**, then pick a person. No password is needed.

- **Maya (Marketing lead):** in **Company library**, Emma's practice note waits for approval. In **More › Workspace settings**, two versions of the social media guidelines conflict; choose **Supersede** on version 1. This also turns on the hashtag, image and design checks. Version 3 of the same guidelines is waiting too: it adds the typography rules. Ask "Which font should I use?" in the question box first: Averill says no approved rule covers fonts. Then click **Approve** on version 3 and **Supersede** on version 2, and ask again: the answer names Fraunces and DM Sans and cites version 3. Then the LinkedIn draft shows too many hashtags (Vamo’s approved LinkedIn guideline allows 3), and the Reel draft shows a banned hashtag (`#lowestprice`). On the Instagram Reel draft, also choose **Check images too** under **Images**: the image prints "Lowest prices guaranteed", and Averill flags it.
- **Alex (owner):** sees every department, the whole team under **Team and account access**, and the public-website check in **More › Workspace settings** (running it needs your own Tavily key, so in this demo you can only see it).

## 5. Check a Canva design

Do this after Maya's step in section 4.

1. Use your existing five-slide Copenhagen practice carousel if you have access to it. Otherwise, in Canva create an Instagram post at 1080 × 1350, add a headline and a supporting line, then duplicate the page until there are five slides. No shared template link is required for the check.
2. Connect the tab as in section 3, step 2.
3. In Averill's design card, tick **Watch my design**. It is off by default.
4. Averill reads only the slide that is open. Flip through all five slides with the page bar at the bottom of Canva, so Averill can check each one. The card shows how many slides it has checked, for example **Checked 3 of 5 slides**. It keeps **Fix before you export** until every slide has been checked and has no problems.
5. The owner’s Copenhagen sample has deliberate contrast and margin problems on slides 1–3. If you use that sample, fix those warnings. On your own practice design, introduce the visible issues in step 6 instead; a blank slide is not a successful design check.
6. Try pistachio green text (`#93C572`) or drag text near the edge of a slide. Averill shows **Fix before you export** with the slide number and the rule it broke. Fixing the design clears the warning. If you edit a slide that Averill has already checked, open it again so Averill reads it again. You can choose **Export anyway**; Averill records that choice for the session. Averill never edits or exports your design.

The check covers Instagram-size designs on canva.com only, one open slide at a time. Turned (rotated) text is checked too. Averill does not read the grid view of all slides.

## 6. Learn Canva layout inside Canva

1. In Averill, open **Learn** and click **Start Canva lesson**, then **Open Canva**.
2. In a new Instagram post design, connect the tab and tick **Watch my design** as in section 5.
3. Add a headline and a supporting line, make the headline at least 1.5 times bigger, line up their edges, keep them away from the edges and keep the text readable. Averill ticks each step by itself as it sees it in your design; the browser card lists the same steps.
4. When all five steps are ticked, **Finish lesson** becomes available. Confirm that you grouped the texts (Averill cannot see grouping) and click it.

No Canva account? Under **I cannot connect Canva**, you can finish the lesson by confirming every step yourself; Averill records it as your confirmation, not its own check.

## If something goes wrong

- **No "Try the demo" button:** Averill already has a company on this Mac. Quit Averill, move the folder `~/Library/Application Support/averill-ai-desktop` to the Trash, then reopen Averill.
- **After a restart:** pick any person on the sign-in screen. Demo accounts need no password.
- **Extension says "Averill is not reachable":** make sure the Averill you just downloaded is open (quit any older copy), then click **Connect this tab** again.
- **The extension card says sharing ended:** the card gives the reason. To reconnect, click the Averill icon in the Chrome toolbar, then choose **Connect this tab**.
- **Hashtag or image checks are missing, or the Canva card says "No approved design rules yet":** this Mac has an older workspace. Import `social-media-guidelines-v2` again in **More › Workspace settings**, or start from a fresh **Try the demo**.
- **Canva shows "Averill cannot read this design":** Canva has changed its page layout. The rest of Averill still works.


## Pro acceptance: help while working

Use the local Pro build for this section. The published release and production demo sites do not gain these changes until their separate publication/deployment gates are completed; see `docs/PRO_ACCEPTANCE_2026-10-29.md`.

1. Open **Current work**. **Help with your work** and the suggested tasks for your role appear before connection/setup details. Ask **How do I group elements in Canva?**
2. Review the outbound preview. It names the destination and the public tool query. On the keyless demo it names the Averill demo server; with your configured providers it names Nebius/Tavily. A generic tool question does not send company files to Tavily. Unchecking an item or cancelling keeps this request local.
3. The answer gives an action and links official help. Ask **I cannot find it** to continue the same task. Try a question outside the starter lesson, such as **How do I animate a table in Canva?** Unknown controls must not be reported as verified.
4. Do the grouping in Canva yourself. Choose **I tried this · save to my practice** only after trying it. This is your own confirmation, not automatic recognition of grouping.
5. Open **Learn** and start current-week practice. For grouping-only practice, expect the relevant visual grouping question, not extra margin/alignment questions just to fill formats. Questions and grading work offline.
6. Ask **Write a truthful marketing email for the approved campaign, with at least 200 body characters and one CTA.** Check the main copy, not the subject/footer length. No unsupported price, discount, weather or service claim should be accepted. The output is a proposal for your review.
7. In the Brevo simulator, compare **Winter Escapes 2027 · ready to review** with **Winter Escapes 2027 · launch draft**. The latter deliberately contains a guarantee and other planted mistakes; the former is the supported comparison.
8. For an offending sentence in a supported plain-text draft, inspect the explanation, **Preview change**, the whole replacement sentence and its evidence, then **Apply change** and **Undo change**. A draft with ambiguous repeats, changed text or a link inside the sentence may require a manual edit. It must never leave a half-sentence through fragment deletion.
9. On Canva, reload the already installed extension to **0.4.0**, reconnect and check all five slides. Earlier findings remain after visiting a clean last slide; **Checked X of 5** shows progress. A missing slide/design identity must stay incomplete. Grouping, export and publication remain human actions.
10. Stop sharing or sign out while help is running. The pending answer must not appear in a later work context. Repeat with a provider outage: explicit local guidance or an honest unavailable state must remain.

For role testing, sign in as the content creator, strategist and marketing lead and compare the suggested tasks. Operations needs an approved source in its own department to produce a sourced handover checklist. A prompt template alone is not acceptance of a new department.
