# Visual Regression Checklist

Use this checklist when validating DS migrations and UI refactors.

## Screenshot protocol

1. Capture at least two viewport sizes:
   - 390x844
   - 430x932
2. Capture both locales when text may wrap differently:
   - `pt`
   - `en`
3. Use deterministic state data where possible.

## Naming convention

`<screen>-<state>-<locale>-<viewport>.png`

Examples:

- `catalog-default-pt-390x844.png`
- `lobby-remote-countdown-en-430x932.png`
- `sintonia-ordering-pt-390x844.png`

## Mandatory captures

### Catalog

- Default
- Open room modal (empty + error)
- Choose mode modal (local enabled / remote enabled)

### Lobby

- Local mode (enough players ready)
- Remote mode (room code hidden + shown)
- Countdown running
- Reconnecting/error notice visible
- Settings modal opened

### Sintonia

- Secrets phase (no reveal)
- Secrets phase (press-and-hold reveal)
- Ordering phase (2-column cards)
- Revealing phase (mid-progress)
- Finished success
- Finished failure
- Rules modal

### Impostor Neon

- Reveal phase (hidden)
- Reveal phase (hold to reveal)
- Clues phase (typing + submitted clue)
- Round decision
- Voting (selection + pending local voters)
- Guessing
- Result timeline (mid-stage + final)

## Diff checks

- Component spacing remains consistent with DS tokens.
- Typography scale remains consistent.
- CTA placement and hierarchy unchanged unexpectedly.
- Safe area + dock spacing does not clip content.
- Color semantics for status/phase/result remain correct.

## QA sign-off

- [ ] Visual QA complete
- [ ] Accessibility quick pass complete
- [ ] No unintended layout shift found
- [ ] Reviewer approved screenshot set

