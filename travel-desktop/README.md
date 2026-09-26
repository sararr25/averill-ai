# Averill desktop — Aurelia Travel demo

Averill is a standalone company agent assistant prototype demonstrated with the fictional **Winter Escapes 2027** campaign. Aurelia Travel is the fictional test company. All product copy and campaign sources are in English. Read the [central handover](../docs/HANDOVER.md), [project brief](../PROJECT.md), and [system design](../ARCHITECTURE.md) before extending the app.

The selected visual direction and implementation specification live in [design-system/DESIGN_SYSTEM.md](design-system/DESIGN_SYSTEM.md). [Preview](design-system/preview.html) is a review artifact; the running app uses the Petrol / Coral / Ice system, but the preview is not proof of pixel parity.

## Run

```sh
npm ci
npm start
```

Node.js 22+ is recommended. The app opens one assistant window. In **Work**, use **Open** to launch the separate Email Studio, Social Publisher, and Campaign Files windows, then **Share** to let Averill inspect a selected supplied window. **Stop sharing** or closing the window removes its findings. More than one supplied work window can be shared at a time.

Each work window has a **Load incoming draft** or **Open handed-over file** action. Edit the real fields afterwards. Checks run when an input loses focus or a selection changes. The assistant cites local campaign documents, and **Open file on this computer** opens the actual source. Work drafts are saved locally only when **Save draft** is pressed. There is no send or publish action.

## Demo path

1. Open Email Studio and share it. Load the incoming draft. The assistant flags the price claim, audience, and footer. Fix each field and watch the related finding disappear.
2. Ask **Where are the files for this campaign?** Open the cited brief and inspect the approved asset names.
3. Open Social Publisher and share it. Load the incoming draft. Correct the square asset, caption disclosure, Instagram paid partnership label, and publishing date.
4. Open Campaign Files and share it. Open the handed-over brief v1. The assistant identifies v2 and explains the four changes.

## What the prototype actually does

The three supplied work windows send structured field state to Electron; Averill produces findings only while a window is shared. Campaign checks use explicit rules and local sample documents. **Review** displays the leading finding and a question composer. **Setup** creates one local company workspace, adds demo people, imports files or a folder, and lets a lead approve department sources. **Work** reviews a marketing draft with approved sources and can capture one frame from a selected Canva window for local OCR. **Learn** guides four Canva operations with contextual help, records confirmed practice and generates weekly questions/reflections. **Research** searches the public web through Tavily. Canva OCR reads visible text only; it cannot inspect design structure or hidden layers.

Set `NEBIUS_API_KEY` and `TAVILY_API_KEY` in the local `../.env.local`, or enter them in Setup for encrypted local storage. Nebius requires explicit session opt-in; draft/image-text review asks for confirmation before sending relevant approved text. Tavily receives only the entered public query. A live Nebius test validated the fixed Aurelia source pack; the company-source path still needs a live check. No account authentication or multi-computer synchronization is implemented.

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

The 12 tests cover issue detection and resolution for the supplied workflows, source file existence, uncertainty for unsupported questions, model citation IDs, local workspace persistence, folder import, employee learning persistence/isolation, source invalidation, exclusion and Copenhagen week rollover. The packaged app was opened and verified for the shared brief finding and a locally answered, cited comparison. See the [handover](../docs/HANDOVER.md) for checks still pending.
