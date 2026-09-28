# Vamo design system

Version 3.0 · 28 September 2026

Vamo is the fictional travel company used to demonstrate Averill. Its visual system applies only to `travel-site/`; Averill's desktop identity stays separate. Never use Vamo as Averill's name or apply Vamo's mark, palette, typography, imagery or editorial layouts to the assistant. Never place Averill's name, aperture or desktop styling on the Vamo site.

## Direction

A youthful travel magazine and social-first collective: candid people photography, oversize editorial type, torn-paper edges, small handwritten-feeling annotations, and vertical story previews. It should feel like a journey someone wants to share, not a software dashboard. The selected visual direction was the second Sundaze concept, renamed Vamo and recolored.

## Palette

| Role | Hex | Use |
| --- | --- | --- |
| Warm canvas | `#FFF8E9` | Main page, breathing space |
| Sea ink | `#0E576B` | Primary type, footer, readable controls |
| Sea deep | `#0A4353` | Hover and deeper contrast |
| Mint | `#BFE4D5` | Large editorial section and soft contrast |
| Coral | `#F16D73` | Main action and collage accent |
| Coral ink | `#102B32` | Small text on coral surfaces |
| Fuchsia | `#D52C85` | Tiny strokes and expressive marks only |

`tokens.css` is the source of truth. Fuchsia is a detail rather than a second primary action color. Small text on coral uses coral ink for contrast; sea ink is reserved for cream and mint surfaces. No navy brand surfaces.

## Type and imagery

Fraunces provides large editorial headlines. DM Sans handles UI, labels and the energetic wordmark. The locally bundled ferry photo is AI-generated concept photography; it is not evidence of an actual trip or real creator. Copenhagen, Vienna and Prague photographs have source credits in `../docs/ASSETS.md`.

## Interaction

Trip cards open real editorial detail dialogs. The trip form generates a local downloadable text brief without a booking or server submit. Story previews are clearly editorial concepts; they do not impersonate live social posts or invent metrics. The mobile layout stacks destination cards and allows horizontal story browsing. Keyboard focus is fuchsia and reduced motion removes visual transitions.
