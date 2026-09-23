# Averill desktop — Aurelia Travel demo

Averill is a standalone company agent assistant prototype demonstrated with the fictional **Winter Escapes 2027** campaign. Aurelia Travel is the fictional test company. All product copy and campaign sources are in English. Read the repository [project handover](../PROJECT.md) and [system design](../ARCHITECTURE.md) before extending the app.

The selected visual direction and implementation specification live in [design-system/DESIGN_SYSTEM.md](design-system/DESIGN_SYSTEM.md). [Preview](design-system/preview.html) is a review artifact; the current app UI has not yet been restyled.

## Run

```sh
npm ci
npm start
```

Node.js 22+ is recommended. The app opens one assistant window. Use **Open** to launch the separate Email Studio, Social Publisher, and Campaign Files windows, then **Share window** to let the assistant observe one. Closing or unsharing a window stops its observations. More than one supplied work window can be shared at a time.

Each work window has a **Load incoming draft** or **Open handed-over file** action. Edit the real fields afterwards. Checks run when an input loses focus or a selection changes. The assistant cites local campaign documents, and **Open file on this computer** opens the actual source. Work drafts are saved locally only when **Save draft** is pressed. There is no send or publish action.

## Demo path

1. Open Email Studio and share it. Load the incoming draft. The assistant flags the price claim, audience, and footer. Fix each field and watch the related finding disappear.
2. Ask **Where are the files for this campaign?** Open the cited brief and inspect the approved asset names.
3. Open Social Publisher and share it. Load the incoming draft. Correct the square asset, caption disclosure, Instagram paid partnership label, and publishing date.
4. Open Campaign Files and share it. Open the handed-over brief v1. The assistant identifies v2 and explains the four changes.

## What the prototype actually does

The three supplied work windows share structured field changes with the assistant only when selected. Campaign checks use explicit rules and local sample documents. The Setup tab creates one local company workspace, adds demo people, imports files or a folder, and lets a lead approve department sources. The Work tab reviews a marketing draft with approved sources and can capture one frame from a selected Canva window for local OCR. The Research tab answers from approved sources and searches the public web through Tavily. Canva OCR reads visible text only; it cannot inspect the design structure or hidden layers.

Set `NEBIUS_API_KEY` and `TAVILY_API_KEY` in the local `../.env.local` for network features. Nebius requires explicit session opt-in, and draft/image-text review requests confirmation before sending relevant approved text to Nebius. Tavily receives only the query entered in Public web research. The old live Nebius test on 23 September 2026 validated the fixed Aurelia source pack; the new company-source path still needs a live check. No account authentication or multi-computer synchronization is implemented.

The intentionally superseded campaign brief v1 and square creative are part of the current demo. They let the assistant detect outdated handover materials and an incorrect social asset; they are not artifacts of the retired product.

## Verify

```sh
npm test
```

The tests cover issue detection and resolution for all three workflows, source file existence for campaign questions, uncertainty for unsupported questions, and validation of citations returned by the model. A desktop UI check confirmed all three workflow findings, the question answer, and the source viewer. `npm audit` reported zero vulnerabilities after the Electron update.
