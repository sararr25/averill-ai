# Averill — three identity directions

18 October 2026 · CX-01 / [issue #24](https://github.com/sararr25/averill-ai/issues/24)

**Status: exploration delivered; owner selection pending.** The current product, its approved design system and Vamo are unchanged. The owner's choice to rethink palette/type authorized these alternatives; it did not choose one of them.

Open [the interactive study](index.html) and use **Compare all** to see the alternatives side by side. Each direction includes a contextual card, expanded in-page panel, before/after preview, local Apply/Undo demonstration, company library and Learn. The state menu shows checking, no conflict, insufficient evidence, error and changed-draft states. All source/draft content is synthetic. No employee account, real document, provider, browser extension or platform is connected.

## Creative brief

- Audience: employees writing in existing tools, including email and organic LinkedIn composers.
- Need: understand what to change, why and which source supports it without losing place.
- Essence: clarity.
- Visual tension: a precise, small intervention beside a busy editor.
- Signature moment: original draft + a useful, cited suggestion + reversible change visible in the same working context.
- Ambition: typography, information hierarchy and state craft, with a lightweight interface. No decorative scroll or cursor effects.
- Fixed interaction: anchored compact card, expandable in-page panel, exact source, preview, explicit Apply, Undo and optional app opening. On a narrow viewport, the study docks the card before the synthetic editor rather than covering it.
- Open decision: visual direction and final mark. The small marks shown are typographic concepts, not a finalized vector identity or a trademark search result.

## Compare the directions

| | 01 Editorial | 02 Precise | 03 Companion |
| --- | --- | --- | --- |
| Idea | A useful note in the margin | A clearly framed decision | A quiet companion in the work |
| Visual character | Paper, ink-blue, fine dividers | Cool grey, graphite, rust, hard edges | Dark plum, pale lime, soft contours |
| Typography | Newsreader for key titles/wordmark; Manrope for reading and controls | Space Grotesk for titles/wordmark; IBM Plex Sans for UI | Plus Jakarta Sans throughout, differentiated by weight and scale |
| Composition | Airy title/action with a separate source footer | Compact header, structured result, full-height evidence rail; horizontal desktop navigation | Short conversational response, rounded action, contained source; quieter sidebar |
| Strength | Calm and readable alongside written work | Dense comparison and fast scanning | Distinct presence and approachable tone |
| Tradeoff | Uses more space in review-heavy queues | More operational and less warm | Dark surface contrasts strongly with pale host editors |
| Best next validation | Long finding titles and source reading at small width | Repeated review decisions and before/after scanning | Source legibility and unobtrusiveness in actual light editors |

**Recommendation: develop Editorial first.** Its hierarchy fits the owner's reported problem: one correction, one action and then the source, with less competition from the application shell. This is a design judgment, not user research. Precise is the stronger alternative if review density becomes the main criterion. Companion is the most visibly distinctive if a dark assistant presence is preferred.

The alternatives vary composition, density, type, shape, desktop navigation and source treatment as well as color. The underlying task is deliberately held constant for comparison.

## Candidate foundations

The machine-readable [candidate tokens](candidate-tokens.json) are scoped to this study. Do not import them into the current product before selection.

| Role | Editorial | Precise | Companion |
| --- | --- | --- | --- |
| Background | `#F6F5F1` | `#EEF0F2` | `#211F2A` |
| Surface | `#FCFBF8` | `#FAFBFC` | `#2B2835` |
| Primary text | `#202B43` | `#20242C` | `#F3F1F8` |
| Secondary text | `#5B6578` | `#606875` | `#B8B2C6` |
| Action accent | `#244ECB` | `#AD3614` | `#D6EF91` |
| Text on action | `#FBFCFF` | `#FFF8F4` | `#242A1B` |
| Observed conflict | `#A1472A` | `#AD3614` | `#FFC794` |
| Main corner radius | 14px | 5px | 22px |

Use a 4px spacing base, restrained 10–12px metadata, 12–14px compact UI reading and 25–31px finding titles in this study. These are candidate sizes; final product sizing must follow selected-direction verification. The review controls surrounding the prototype are not part of the product typography or navigation.

The primary action uses the direction accent; the conflict has its own labelled treatment, sources carry document identity and approval/version text, and Stop is always available while sharing. Every color meaning also has text. Hover changes tone without moving the layout. Focus is visible for keyboard and programmatic focus; reduced-motion removes the spinner animation and transitions.

## Preview files

- [Three-way comparison](previews/comparison.png)
- Editorial: [context](previews/a-context.png), [preview](previews/a-preview.png), [panel](previews/a-panel.png), [library](previews/a-library.png), [Learn](previews/a-learn.png)
- Precise: [context](previews/b-context.png), [preview](previews/b-preview.png), [panel](previews/b-panel.png), [library](previews/b-library.png), [Learn](previews/b-learn.png)
- Companion: [context](previews/c-context.png), [preview](previews/c-preview.png), [panel](previews/c-panel.png), [library](previews/c-library.png), [Learn](previews/c-learn.png)

These are captures of the local review artifact. They do not show a running Brevo/LinkedIn integration. The example host is a neutral synthetic editor; Vamo appears only as the fictional author inside the email, not as Averill's visual identity. Send is disabled. Open in Averill simulates navigation to the prototype's company library; it does not launch the real app. Review queue and lesson controls show illustrative feedback without saving decisions or learning progress.

## Verification and limits

The [renderer receipt](previews/verification.json) records the local checks. Each direction exercises preview, example Apply, exact example Undo, source expansion, panel expansion, library search and the checking/clear/no-source/error/changed-draft states. Width checks at 440, 520 and 960 CSS pixels show no horizontal overflow. The study also checks 200% zoom, reduced-motion and keyboard Tab/focus indication. This is scoped prototype behavior, not a real editor adapter test. All five font families are loaded from local files.

Calculated text contrast against the candidate flat surfaces is in [contrast.json](contrast.json): body 12.86–15.01:1, secondary 5.43–7.01:1, primary action 6.03–11.68:1 and observed-text treatment 5.29–7.64:1. These values verify those color pairs only; they do not establish complete accessibility or platform acceptance. No screen-reader study, frame profiling or real-editor geometry/obstruction test was performed.

The earlier inspected product baseline was 4.25/10 in the audit. Subjective concept-stage visual assessment for this study is approximately **7/10**: hierarchy, typography and identity are intentional, but reaching the craft target still needs the owner's direction choice, a finalized mark, refined long-content/compact typography, full role-dependent states and real editor acceptance. These are not usability scores or a claim that a 10/10 product has shipped.

## Font provenance

Downloaded from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl) on 18 October 2026. Each family has its own bundled OFL license in `assets/`:

- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope)
- [Newsreader](https://github.com/google/fonts/tree/main/ofl/newsreader)
- [Space Grotesk](https://github.com/google/fonts/tree/main/ofl/spacegrotesk)
- [IBM Plex Sans](https://github.com/google/fonts/tree/main/ofl/ibmplexsans)
- [Plus Jakarta Sans](https://github.com/google/fonts/tree/main/ofl/plusjakartasans)

No external font or network request is made by the prototype.

## Next increment after selection

Refine the chosen direction rather than regenerating all alternatives. Finalize the mark, complete the selected card/panel/desktop state specification, verify source and control semantics at real sizes, and only then promote selected tokens into the Averill visual source of truth. Keep CX-01 open until selection and the selected foundation specification are recorded. Subsequent runtime implementation belongs to CX-04/CX-08 and the remaining feature tickets.
