# Test Averill (about 10 minutes)

Averill checks your work against your company's approved rules and shows you the source. Everything here is fictional (the company Vamo, its people and its tools). Nothing is posted. Only if you agree, a draft is sent to NVIDIA Nemotron for a second opinion.

**You need:** a Mac with Apple Silicon (M1 or newer) and Google Chrome. Sections 5 and 6 also need a free Canva account.

## 1. Open Averill

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest) and unzip it.
2. Right-click `Averill.app` › **Open** › **Open**. The app is unsigned, so macOS asks once.
3. Click **Try the demo**. You are signed in as Emma from Marketing. No password is needed. Averill opens on **To do**, which lists the tasks that need your review.
4. Choose **1-minute tour**, or **Skip**. The **?** button on each screen explains that screen later.

## 2. Add the Chrome extension

1. In Averill, open **Current work** and click **Install extension**. Averill opens `chrome://extensions` in Chrome and shows the `browser-extension` folder in Finder. Nothing is installed automatically.
2. In Chrome, turn on **Developer mode**, click **Load unpacked** and choose that `browser-extension` folder. The three illustrated steps under the button show the same.
3. If you loaded an older copy, click the reload button for the extension at `chrome://extensions`; the version number did not change for this update.
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

- **Maya (Marketing lead):** in **Company library**, Emma's practice note waits for approval. In **More › Workspace settings**, two versions of the social media guidelines conflict; choose **Supersede** on version 1. This also turns on the hashtag, image and design checks. Version 3 of the same guidelines is waiting too: it adds the typography rules. Ask "Which font should I use?" in the question box first: Averill says no approved rule covers fonts. Then click **Approve** on version 3 and **Supersede** on version 2, and ask again: the answer names Fraunces and DM Sans and cites version 3. Then the LinkedIn draft shows too many hashtags (LinkedIn allows 3), and the Reel draft shows a banned hashtag (`#lowestprice`). On the Instagram Reel draft, also choose **Check images too** under **Images**: the image prints "Lowest prices guaranteed", and Averill flags it.
- **Alex (owner):** sees every department, the whole team under **Team and account access**, and the public-website check in **More › Workspace settings** (running it needs your own Tavily key, so in this demo you can only see it).

## 5. Check a Canva design

Do this after Maya's step in section 4.

1. Open the starting carousel (five Instagram slides): **TEMPLATE LINK (the owner adds it before release)**. Canva makes your own copy.
2. Connect the tab as in section 3, step 2.
3. In Averill's design card, tick **Watch my design**. It is off by default.
4. Averill reads only the slide that is open. Flip through all five slides with the page bar at the bottom of Canva, so Averill can check each one. The card shows how many slides it has checked, for example **Checked 3 of 5 slides**. It keeps **Fix before you export** until every slide has been checked and has no problems.
5. The starting carousel already breaks some rules: Averill flags low contrast on slide 1 and texts too close to the edge on slides 1 and 2. Fix them in Canva and watch the warnings clear. On the last slide, finish the body line of the post.
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
- **Hashtag or image checks are missing:** this Mac has an older workspace. Import `social-media-guidelines-v2` again in **More › Workspace settings**.
- **Canva shows "Averill cannot read this design":** Canva has changed its page layout. The rest of Averill still works.
