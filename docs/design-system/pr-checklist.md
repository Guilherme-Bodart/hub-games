# Design System PR Checklist

Use this checklist in every UI-related PR.

## Tokens and styling

- [ ] No hardcoded color values in screen/component code.
- [ ] Spacing/radius/border values come from theme semantic tokens.
- [ ] Typography uses semantic font families/weights consistently.
- [ ] Motion feedback uses semantic motion tokens.

## Component behavior

- [ ] Interactive elements support disabled state.
- [ ] Primary actions have pressed feedback.
- [ ] Loading states are visible where async actions occur.
- [ ] Error states are explicit and readable.

## Accessibility

- [ ] Minimum touch target is at least 44x44.
- [ ] `accessibilityRole` and `accessibilityLabel` provided where needed.
- [ ] Contrast remains readable for key text and CTA content.

## Product consistency

- [ ] No mixing of Sintonia and Impostor mechanics/labels in the same flow.
- [ ] Connection states (online/reconnecting/error) are represented consistently.
- [ ] Game phase labels and results use semantic phase/result tokens.

## Validation

- [ ] `npx tsc --noEmit` passes.
- [ ] Relevant tests pass (at least game logic smoke test for touched area).

