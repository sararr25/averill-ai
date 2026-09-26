# Elseweek onboarding and four account demo

26 September 2026. All sample identities and sources are fictional. These are separate email/password accounts on one Mac; no online accounts, synchronization or invitation emails are provided.

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

Choose **Confirm company onboarding**. Three separate accounts are created together. Save the temporary passwords shown in **Team account access** immediately, using Copy account access or your own password manager. They are shown once and are not recoverable from the saved hashes. No invitation email is sent. The app has no password-reset flow yet; keep these credentials for the demo.

## 5. Demonstrate the four people

As Alex, show the imported company/department material and account management. Choose **Sign out**. Select Maya in **Demo account**, enter her generated password and choose **Sign in**: she can approve Marketing sources, sees company-wide guidance, and cannot access the roster or approve company-wide guidance.

Sign out and log in as Emma, then Oscar. Each has their own learning history and weekly practice. Their job titles differ; both have employee permissions. Show LinkedIn Draft or Canva Learn from the desired account. Editing/publishing remains human-owned; the supplied editors are local demo work, not connections to LinkedIn/Canva APIs.

Restart Averill: you must sign in again. Accounts, approved sources and each person's learning persist. Signing out closes supplied work windows and clears sharing, company draft text, source dialog and the prior account's visible learning context.

## Existing people and advanced imports

If a person already exists from the manual pack without login access, the owner can use **Account access → Create account access** to attach an email/profile to their existing record. The manual pack remains supported. The new intake uses a real company-wide source scope, so you do not need to duplicate brand guidance per department.

The app stores this local workspace on this Mac. These checks protect application routes; they do not provide cloud/tenant security against someone who can directly read/edit its local files. Do not present the demo as remote multi-device authentication.
