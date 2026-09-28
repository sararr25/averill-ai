# Averill desktop — Elseweek demo

Averill is a standalone company agent assistant prototype demonstrated with the fictional **Winter Escapes 2027** campaign. Elseweek is the fictional test company. All product copy and campaign sources are in English. Read the [central handover](../docs/HANDOVER.md), [project brief](../PROJECT.md), and [system design](../ARCHITECTURE.md) before extending the app.

The selected visual direction and implementation specification live in [design-system/DESIGN_SYSTEM.md](design-system/DESIGN_SYSTEM.md). [Preview](design-system/preview.html) is a review artifact; the running app uses the Petrol / Coral / Ice system, but the preview is not proof of pixel parity.

## Run

```sh
npm ci
npm start
```

Node.js 22+ is recommended. Averill opens an assistant window and a movable floating Ask Averill button. Employees write in their usual browser or desktop tool. In **Work**, choose one external window, read it once or start six-second local observation, then choose a work type to check exact approved rules. macOS Accessibility text is preferred; visible-text OCR is the fallback. Nebius suggestions require owner policy, session opt-in, eligible sources and a separate captured-text confirmation. For an internet fact-check, type a public query; Tavily receives the query, not the screenshot. **Stop sharing** clears the window and observed text. The supplied Email Studio, LinkedIn Draft, Social Publisher, and Campaign Files windows are under Hackathon demo fixtures for repeatable test scenes.

For verification, run `npm test`, `npm run verify:feedback`, `npm run verify:external` and `npm run verify:task-review`. The last two use isolated synthetic Electron windows. `npm run verify:native-window` is an interactive harness for a deliberately opened real application window; set its target and text markers in the environment before running it. See the [acceptance matrix](../docs/EXTERNAL_WORK_ACCEPTANCE.md) for proof already obtained and real-platform gaps.

Each work window has a **Load incoming draft** or **Open handed-over file** action. Edit the real fields afterwards. Checks run when an input loses focus or a selection changes. The assistant cites local campaign documents, and **Open file on this computer** opens the actual source. Work drafts are saved locally only when **Save draft** is pressed. There is no send or publish action.

## Demo path

1. Open Email Studio and share it. Load the incoming draft. The assistant flags the price claim, audience, and footer. Fix each field and watch the related finding disappear.
2. Ask **Where are the files for this campaign?** Open the cited brief and inspect the approved asset names.
3. Open Social Publisher and share it. Load the incoming draft. Correct the square asset, caption disclosure, Instagram paid partnership label, and publishing date.
4. Open Campaign Files and share it. Open the handed-over brief v1. The assistant identifies v2 and explains the four changes.

## What the prototype actually does

The four supplied fixture windows send structured field state to Electron; Averill produces fixture findings only while a window is shared. Campaign checks use explicit rules and local sample documents. **Review** displays findings, source, Explain/Copy/Practise/Recheck actions and a question composer. **Setup** creates one local company workspace, adds demo people, imports files or a folder, and lets a lead approve department sources. **Knowledge** searches visible documents, shows passage/approval metadata, compares extracted versions and supports motivated decisions and private clarification. **Work** leads with existing external tools, local observation and bounded approved-rule review. **Learn** guides four Canva operations, three task-based exercises, confirmed correction practice and weekly questions/reflections. **Research** searches the public web through Tavily. OCR reads visible text only; it cannot inspect design structure or hidden layers.

Set `NEBIUS_API_KEY` and `TAVILY_API_KEY` in the local `../.env.local`, or enter them in Setup for encrypted local storage. Nebius requires explicit session opt-in; draft/image-text review asks for confirmation before sending relevant approved text. Tavily receives only the entered public query. A live Nebius test validated the fixed historical Aurelia source pack; the company-source path still needs a live check. Separate local account authentication is implemented; no online account service or multi-computer synchronization is provided.

## Learning demo path

1. Create a workspace and select a person in Setup. Open Learn.
2. Start Canva layout essentials, optionally linking an approved company source. Practise selection, Position, alignment and grouping in Canva; confirm each step yourself. Step help links to official guidance. There is no automatic visual verification.
3. Record another confirmed Canva, LinkedIn or newsletter activity with a short description. Review Your week and exclude incorrect records before practice.
4. Start weekly practice. Answer operation questions, open a linked current source and save a practical reflection. The next practice suggestion targets a missed operation when applicable.
5. Restart: the active session and answers remain in the local workspace. Switching person shows that person’s records. Refresh practice after adding activities; unavailable sources or excluded records invalidate affected questions.

The week starts Monday in Europe/Copenhagen. Practical work is self-confirmed, not scored as mastery. Learn makes no AI/network request. Historical records persist locally; exclusion removes eligibility rather than deleting history. See the [implementation plan](../docs/LEARNING_IMPLEMENTATION_PLAN.md).

## Package for macOS

```sh
npm run package:mac
```

This creates an unsigned arm64 `.app` under `dist/Averill-darwin-arm64/` and bundles the Swift PDF/image text extractor. The ZIP is a separate local artifact and is not published by GitHub. Restart the app after rebuilding. See the [handover](../docs/HANDOVER.md) for the exact verification boundary.

The intentionally superseded campaign brief v1 and square creative are part of the current demo. They let the assistant detect outdated handover materials and an incorrect social asset; they are not artifacts of the retired product.

## Verify

```sh
npm test
```

The 18 tests cover issue detection and resolution for the supplied workflows, source file existence, uncertainty for unsupported questions, model citation IDs, local workspace persistence, folder import, employee learning persistence/isolation, source invalidation, exclusion and Copenhagen week rollover. The packaged app was opened and verified for the shared brief finding and a locally answered, cited comparison. See the [handover](../docs/HANDOVER.md) for checks still pending.

## Company pack and LinkedIn demo

Use [the Elseweek pack README](demo-company/elseweek/README.md) to create people and import Marketing, Operations and People documents at the correct versions. An administrator can choose department and source version in Setup; employee/lead imports stay in their own department. Imported documents arrive pending. Brand context is explicitly approved per department.

Open LinkedIn Draft, Share, then Load incoming draft. Correct the guarantee phrase, editorial audience, selected creative, CTA and planned date/time. The correct slot is 16 October 2026 at 09:00 Europe/Copenhagen. Open the LinkedIn guidance from the draft or the finding citation. Save retains a local draft; Stop sharing clears findings. The editor is supplied synthetic work, not an external LinkedIn connection. Its limited copy checks do not establish a complete tone assessment.

The static fixture and imported workspace paths are separate. Switching people clears sharing; source approval changes control company answers and learning evidence, not the supplied editor rules. Previous Aurelia drafts remain in their old localStorage keys and are not loaded into Elseweek drafts.

## File onboarding and local account demo

Follow [the onboarding tutorial](../docs/ONBOARDING_TUTORIAL.md). Create the owner email/password account, upload the six mixed-format Elseweek intake files, optionally use explicitly disclosed Nebius analysis, review people/document assignments, approve selected sources and confirm the batch. Three Marketing accounts are created together. Use Account access → Open login documents to retrieve each email/password document and sign out/in to demonstrate owner, manager, strategist and creator. Restart requires login. Existing workspaces can enable owner login without losing data; existing people can receive separate accounts.

XLSX/CSV staff tables are read locally. PDFs use PDFKit and scanned-page Vision OCR (first 30 pages); new PDF extractions retain page markers. SVG onboarding extracts text/title/description. Unsupported/unreadable files are flagged. XLS needs a modern XLSX/CSV export. Brand context can be company-wide; personnel copies remain private. Admin reset of non-owner local passwords and self-service password change are available; owner recovery uses the local login document. No cloud authentication, multi-device synchronization or delivered invitations are implemented.

## Executable and development continuation

On this Mac, open `travel-desktop/dist/Averill-darwin-arm64/Averill.app` from the repository folder. Shareable archive: `travel-desktop/dist/Averill-macOS-arm64.zip`. This unsigned build targets Apple Silicon macOS. Quit older running copies before launching it. Build outputs are ignored by Git.

Start future development from `docs/HANDOVER.md`, then `AGENTS.md`, `PROJECT.md`, `ARCHITECTURE.md`, `docs/ONBOARDING_AUTH_PLAN.md` and `docs/ONBOARDING_TUTORIAL.md`. Run `npm test` in travel-desktop; `npm run package:mac` rebuilds the app. The website has its own travel-site documentation.

## Prepared local demo accounts and services

On this Mac, the existing Aurelia Demo workspace now provides four working logins: Demo Admin / alex@elseweek.example (Owner / CEO / admin), Maya Jensen / maya@elseweek.example (Marketing manager), Emma Larsen / emma@elseweek.example (Marketing strategy employee), Oscar Lind / oscar@elseweek.example (Content creator). Company name and original administrator ID are preserved. No existing password was reset. A timestamped pre-login workspace backup is adjacent to averill-workspace.json.

Actual emails/passwords are in separate documents under repository-root demo-login-documents, ignored by Git. Originals are in userData/Averill-login-documents. Open the owner document, then use its email/password on the packaged app sign-in screen. The owner can reopen the original folder from Account access. Never substitute /tmp synthetic test credentials.

Nebius and Tavily keys from the existing local .env.local were encrypted with Electron safeStorage into userData/averill-secrets.enc.json. The packaged app automatically loads them on this Mac. No key is embedded in Git, source or the distributable. Another Mac needs local key provisioning. No manual key entry is needed here.

## Multisource onboarding update — 27 September 2026

Desktop/Finder drop, local/synced files, HTTPS links and Google Drive/OneDrive selected-file OAuth import now feed the local review. Direct cloud use requires registered OAuth clients and remains live-unverified. Company AI defaults off; owner authorization and per-file selection are required. Restricted files are blocked. Local company copies are not application-encrypted; provider confidentiality/no-training/retention settings remain unverified. See [cloud setup](../docs/CLOUD_CONNECTIONS.md), [company confidentiality](../docs/COMPANY_CONFIDENTIALITY.md) and [handover](../docs/HANDOVER.md) for implementation, verification and remaining gates.

## Feedback and know-how library — 27 September 2026

A persistent status banner reports pending, completed, cancelled and failed explicit actions. Knowledge provides local document/text search, uploaded proposals, approved/pending/private/superseded sources, extracted-text reading and original-file access under existing role visibility. Intake is visible before onboarding confirmation. The library does not send documents to external AI. See the handover and onboarding tutorial for current verification and workflow.
