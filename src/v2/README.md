# V2 Hybrid Design System

This folder is the new frontend foundation for the hybrid visual language:

- Bento Grid for layout structure
- Claymorphism for primary interactions
- Glassmorphism for floating surfaces

## Layers

1. `design-system/`
- tokens, theme variants, helper utils

2. `components/base/`
- reusable primitives with no screen business logic

3. `screens/`
- future V2 screens built only from base primitives

## Rules

- Keep one dominant visual style per component.
- Use `ClayButton` for main actions only.
- Use `GlassPanel` only in overlays/modals/floating elements.
- Use `BentoCard` for content blocks and grid tiles.
- Avoid hardcoded colors in screens: read from `v2Tokens`.
