# Test Averill (about 10 minutes)

Averill checks your work against your company's approved rules and shows you the source. Everything here is fictional (the company Vamo, its people and its tools). Nothing is posted. Only if you agree, a draft is sent to NVIDIA Nemotron for a second opinion.

**You need:** a Mac with Apple Silicon (M1 or newer) and Google Chrome. Section 5 also needs a free Canva account.

## 1. Open Averill

1. Download `Averill-macOS-arm64.zip` from the [latest release](https://github.com/sararr25/averill-ai/releases/latest) and unzip it.
2. Right-click `Averill.app` › **Open** › **Open**. The app is unsigned, so macOS asks once.
3. Click **Try the demo**. You are signed in as Emma from Marketing. No password is needed. Averill opens on **To do**, which lists the tasks that need your review.
4. Choose **1-minute tour**, or **Skip**. The **?** button on each screen explains that screen later.

## 2. Add the Chrome extension

1. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose the `browser-extension` folder inside the app. To find it, right-click `Averill.app` › **Show Package Contents** › `Contents/Resources/app/browser-extension`.
3. If you loaded an older copy, click the reload button for the extension at `chrome://extensions`. The version must be **0.3.0**.

## 3. Check a draft

1. In Chrome, open <https://averill-demo-sim.vercel.app/brevo> and open **Winter Escapes 2027 · launch draft**. It is wrong on purpose.
2. Click the Averill extension › **Connect this tab**, then approve the connection in Averill. The extension popup shows the connection state, and the toolbar badge shows **ON** while connected. The connection stays on until you press **Stop** in Averill, sign out, quit Averill, close the tab or open another site. Current work in Averill shows a 3-step connection checklist.
3. Click the email text, then **Ask Averill**. If asked what you are working on, choose **Email**.
4. Averill flags "lowest prices guaranteed" and the missing footer, and shows the approved company rule behind each one. Fix the text yourself and the warnings go away.
5. In the **Ask about this draft or company rules** box, type `Can we say lowest prices guaranteed?` and press Enter. Averill answers with the approved rule it cites.
6. In Averill, choose **Check approved rules**. After the local check, Averill asks before sending the draft to NVIDIA Nemotron through the Vamo demo server. Nemotron findings are marked **Nemotron suggestion** and appear only when their quotes match your draft and an approved rule. The server has a daily limit; when it is reached, Averill says so and the local check still works.
7. Under **Double-check online**, tick the public statements (dates, prices, events) and choose **Check with Tavily**. Nothing is sent before that click. The demo allows 10 searches a day. Results appear under **Public check, not company approval**, with a link and an excerpt. The verdict is **Unclear** unless Nemotron is on.

Press **Stop** in Averill at any time to end sharing.

**Also try:** <https://averill-demo-sim.vercel.app/linkedin> and <https://averill-demo-sim.vercel.app/instagram>. Under **Drafts**, choose **Edit draft** and check it as above (work type **Organic LinkedIn** or **Paid Instagram**).

## 4. Try the other roles

Click **Sign out**, then pick a person. No password is needed.

- **Maya (Marketing lead):** in **Company library**, Emma's practice note waits for approval. In **Setup**, two versions of the social media guidelines conflict; choose **Supersede** on version 1. This also turns on the hashtag, image and design checks. Then the LinkedIn draft shows too many hashtags (LinkedIn allows 3), and the Reel draft shows a banned hashtag (`#lowestprice`). On the Instagram Reel draft, also choose **Check images too** under **Images**: the image prints "Lowest prices guaranteed", and Averill flags it.
- **Alex (owner):** sees every department, the whole team under **Team and account access**, and the public-website check in **Setup** (running it needs your own Tavily key, so in this demo you can only see it).

## 5. Check a Canva design

Do this after Maya's step in section 4.

1. Open the starting post: **TEMPLATE LINK (the owner adds it before release)**. Canva makes your own copy.
2. Connect the tab as in section 3, step 2.
3. In Averill's design card, tick **Watch my design**. It is off by default.
4. Finish the body line of the post in Canva.
5. Try pistachio green text (`#93C572`) or drag text near the edge of the design. Averill shows **Fix before you export** with the rule it broke. Fixing the design clears the warning. You can choose **Export anyway**; Averill records that choice for the session. Averill never edits or exports your design.

The check covers the one-page Instagram-size design on canva.com only.

## If something goes wrong

- **No "Try the demo" button:** Averill already has a company on this Mac. Quit Averill, move the folder `~/Library/Application Support/averill-ai-desktop` to the Trash, then reopen Averill.
- **After a restart:** pick any person on the sign-in screen. Demo accounts need no password.
- **Extension says "Averill is not reachable":** make sure the Averill you just downloaded is open (quit any older copy), then click **Connect this tab** again.
- **The extension card says sharing ended:** the card gives the reason. To reconnect, click the Averill icon in the Chrome toolbar, then choose **Connect this tab**.
- **Hashtag or image checks are missing:** this Mac has an older workspace. Import `social-media-guidelines-v2` again in **Setup**.
- **Canva shows "Averill cannot read this design":** Canva has changed its page layout. The rest of Averill still works.
