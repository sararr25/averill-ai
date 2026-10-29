# Canva general guidance and current lesson checks

Owner correction: 29 October 2026. Approved company requirements are mandatory, but missing company rules must not block general design or functional tool assistance.

## Delivered

- General text contrast checks use documented 4.5:1 normal / 3:1 large-text readability targets even without company design lines. Company rules are still checked and cited as company authority. General findings are labelled separately and link to the W3C reference; social-image viewing size still needs human review.
- A 60 px inset on a 1080 px design is a suggested layout starting point, explicitly not a platform or company requirement. Stricter approved company margins feed the lesson check.
- Current lesson ticks clear when a later reading fails. Historical practice evidence is retained separately. Finishing an observed lesson requires its current automatic checks, not historical ticks. Labels describe measured properties on this slide, not whole-design approval.
- The clean card says “No issues in the measured checks”, names its limits, and offers contrast/spacing help. Current work text-review summaries say “No text-rule conflicts”, not “Nothing to fix”.
- Frame instructions have a concrete local fallback and an official public query. Questions about design basics can combine public tool guidance with mandatory company requirements; absence of a company rule no longer terminates the answer.
- Tool-help uses a dedicated Nemotron prompt and retry instruction instead of the marketing-email prompt. List markers are formatting, not factual measurements. Empty numbered lines and raw heading markup are cleaned, and public citations expand separately from the answer.
- Public functional help also works when company AI is off. A closed Nebius wrapper sends only a generic operation and bounded official public excerpts, after the outbound confirmation. The original question, shared draft, role/profile and company files are excluded; company AI stays off. Company chat/intake/embeddings still require the owner policy.
- The app the owner was actually running was `travel-desktop/dist/Averill.app`, a separate older extracted copy. Update that exact path with a backup after closing it; do not alter profile accounts, provider keys, policies or company sources.

## Verification

- Desktop: 268/268 tests passed, including public-only payload isolation and refusal of arbitrary company-chat policy bypass.
- Canva synthetic renderer/main/bridge flow: 31 steps, 35 design-check relays, zero provider requests. Includes margin/contrast regressions and restoration, policy-grounded questions, current lesson checks and logout cleanup.
- Server: 14/14 tests passed. Updated fixed tool-help prompt deployed to existing production project `averill-judge-ai`: `dpl_Hsw9rjwjKyUw3vgLdRFHs9sbEdoe`, READY, alias `https://averill-judge-ai.vercel.app`.
- Real public-only Tavily + Nebius/Nemotron with company AI OFF: frame help returned model mode in 4.9 seconds, zero company sources. Sanitized receipt: `review-evidence-2026-10-29/design-basics/providers-public-only-policy-off.json`.
- Earlier real direct Tavily + Nebius/Nemotron: “How do I create a frame in Canva?” returned a model answer with public exact evidence, zero company sources, about 2.5 seconds in the final sample. No user documents, design text, profile or credentials were sent. See the sanitized receipt.
- Initial provider trial exposed a validation failure: numbered steps were treated as unsupported factual numbers. The final code ignores list markers while still validating substantive numbers and exact citations.
- Packaged/live Chrome follow-up and installed-copy receipt are recorded in `review-evidence-2026-10-29/design-basics/` when completed; do not infer a live result from the synthetic flow.

## References and boundaries

[W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [Canva frames](https://www.canva.com/en_gb/help/using-frames/) were consulted on 29 October. An inset is Averill guidance, not sourced mandatory policy. No overall visual-composition certification, screenshot/OCR observation, autonomous Canva control or publication was added. Provider policy, per-request outbound review and company-source permissions remain enforced. Native VoiceOver, final-size human readability and employee pilots remain separate gates.

## Installed/native completion

The exact used `dist/Averill.app` has been updated with preserved backups. Normal-workspace Emma, session AI off: outbound preview and real Nemotron frame guidance with official sources passed. Accounts, keys, source approvals and company policy were not changed. See `native-public-help.json` and `native-public-help.png`. Current ZIP SHA-256: `f561c62949437c0d20c123703e89b6f8d103a3804fadcaa813e64c208fd83d62`. The final real Canva UI reconnection was interrupted by another active Chrome activity; no original design edit or live fix/recheck is claimed.
