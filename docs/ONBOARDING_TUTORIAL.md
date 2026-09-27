# Elseweek onboarding and four account demo

26 September 2026. All sample identities and sources are fictional. These are separate email/password accounts on one Mac; no online accounts, synchronization or invitation emails are provided.


## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

For the prepared demo, sign in as owner and proceed to step 2. Existing roster emails are excluded as duplicates; preserve those exclusions. Review and approve source imports explicitly. Steps below also cover a fresh workspace on another Mac.

## 1. Create the company and owner login

Quit an older running Averill and open the rebuilt app. In Setup, enter:

- Company: Elseweek
- Your name: Alex Holm
- Work email: alex@elseweek.example
- A password of your choice, 10–128 characters

Choose **Create company and sign in**. The owner is the administrator. If your older workspace already exists, select its administrator in the legacy role selector, then use **Account access → Enable owner login**. Existing people, sources and learning remain. Once enabled, use Sign out/Sign in instead of role switching.

## 2. Upload the company material together

Choose **Add company files** and select the six files in `travel-desktop/demo-company/elseweek-intake/` (not this README):

- `elseweek-team.xlsx`: Maya, Emma and Oscar, their Marketing jobs and demo work emails.
- `elseweek-brand-and-company.svg`: company-wide brand/company context, matching Elseweek's existing website palette/mark.
- `winter-escapes-campaign-v2.pdf`: campaign brief v2 and approved channel schedule.
- `linkedin-campaign.md`: organic LinkedIn campaign requirements.
- `operations-procedure.md`: Operations source.
- `people-onboarding.md`: People source.

The app reads the staff table locally, so you do not enter the three employees individually. Expand uploaded-file previews when you want to inspect the extracted text. Existing account emails are detected and excluded; keep that exclusion to avoid duplicate accounts.

## 3. Let Nebius interpret the documents

If no key is configured, add it under **Service keys → Save Nebius key**. Then choose **Interpret with Nebius**. The confirmation names the files and the maximum amount of extracted text, including personnel names/emails, that will be sent. Passwords, keys and image/file binaries are not included. Company/people suggestions stay uncommitted until your review.

You can finish locally without Nebius for a clearly structured roster. For unclear files, Nebius proposes people with quotes from the original text and document assignments. Missing/unreadable content is flagged; the AI cannot recover information absent from the extracted text. Legacy `.xls` needs export as `.xlsx` or CSV. PDF extraction reads up to 30 pages and uses local OCR for scanned pages. SVG needs text/title/description content; outlined shapes alone do not establish brand information.

## 4. Review and confirm once

Check the three person summaries. Expand a person to correct name, email, department or profile. Profiles should be:

| Person | Email | Profile | Permissions |
| --- | --- | --- | --- |
| Alex Holm | alex@elseweek.example | Owner / CEO / admin | Company onboarding and accounts; company/department source approval |
| Maya Jensen | maya@elseweek.example | Marketing manager | Marketing department source approval |
| Emma Larsen | emma@elseweek.example | Marketing strategy employee | Marketing work and personal learning |
| Oscar Lind | oscar@elseweek.example | Content creator | Marketing work and separate personal learning |

Review the document summaries. Personnel records stay private to the owner. Brand context should be **Everyone in the company**, version 1. Campaign PDF should be Marketing, version 2; LinkedIn guidance Marketing, version 1. Operations/People documents stay in their own departments. Expand to correct a proposed scope/version.

After reading the knowledge files, tick the collective approval checkbox, or approve only chosen files individually. Approval is your explicit decision, not something extracted from an APPROVED label in a document. Archived files are never approved by this batch flow.

Choose **Confirm company onboarding**. Three separate accounts are created together. Each login, including the owner, receives a separate Markdown document containing its email and password. Choose **Account access → Open login documents** to find them again after a restart. They are saved locally under `~/Library/Application Support/averill-ai-desktop/Averill-login-documents/`, outside the repository. You can copy these documents for your demo. No invitation email is sent. Existing accounts created before this feature have only hashes; their original passwords cannot be reconstructed. The app has no password-reset flow yet.

## 5. Demonstrate the four people

As Alex, show the imported company/department material and account management. Choose **Sign out**. Select Maya in **Demo account**, enter her generated password and choose **Sign in**: she can approve Marketing sources, sees company-wide guidance, and cannot access the roster or approve company-wide guidance.

Sign out and log in as Emma, then Oscar. Each has their own learning history and weekly practice. Their job titles differ; both have employee permissions. Show LinkedIn Draft or Canva Learn from the desired account. Editing/publishing remains human-owned; the supplied editors are local demo work, not connections to LinkedIn/Canva APIs.

Restart Averill: you must sign in again. Accounts, approved sources and each person's learning persist. Signing out closes supplied work windows and clears sharing, company draft text, source dialog and the prior account's visible learning context.

## Existing people and advanced imports

If a person already exists from the manual pack without login access, the owner can use **Account access → Create account access** to attach an email/profile to their existing record. The manual pack remains supported. The new intake uses a real company-wide source scope, so you do not need to duplicate brand guidance per department.

The app stores this local workspace on this Mac. These checks protect application routes; they do not provide cloud/tenant security against someone who can directly read/edit its local files. Do not present the demo as remote multi-device authentication.

## Multiple company data locations — 27 September 2026

Log in as Owner and open Setup. Drop one or several files from Desktop/Finder into **Drop company files here**, click that area to choose local files, or choose files from a synced Google Drive/OneDrive folder. Excel, PDF, SVG and other supported documents enter the same local review.

Use **Import from links** for HTTPS files or public pages, one link per line. Private login pages are not downloadable documents. Use the Google Drive/Microsoft OneDrive sections to configure and connect cloud accounts, browse folders and import selected files. See [cloud setup](CLOUD_CONNECTIONS.md): registered OAuth client IDs are required before direct connections work.

Adding files rebuilds the combined unapplied proposal: review people/source settings again. Nothing is automatically sent to Nebius. For each file choose Internal, Public or Restricted. Restricted files and detected credentials are excluded from AI. In Company confidentiality, the owner can authorize external AI only after checking the provider terms/settings. Then select specific eligible files and confirm their transfer before Analyze with Nebius. Local import and account creation continue without AI.

Check the proposed employees, departments, profiles and evidence, exclude unwanted entries, confirm the local import and approve sources separately. Source approval does not grant AI permission. Accounts and password documents remain available through the existing login-document action.

[Company confidentiality and production limitations](COMPANY_CONFIDENTIALITY.md).

## Check that your files were received and consult know-how

After an action, read the status banner directly below navigation: Working, Completed or Action failed. File intake reports how many documents have readable text and flags rejected/unreadable material. Cancellation is explicitly reported. Choose View company knowledge after upload, or open the Knowledge tab at any time.

Uploaded files appear immediately as Uploaded · review needed, with local text previews. Use Search documents to find a title or words inside extracted text; filter by status. Read extracted text opens the local document text. For an uploaded proposal, Review in Setup returns to confirmation and approval. After confirmation, the same library contains saved sources; approved guidance is distinguished from private, pending and superseded records. Open original file is available for saved sources. Employees see only sources permitted by their role/department.
