# Design System Components Guide

This guide documents the current component API and the visual behavior expected for UI work in HUB GAMES.

It should be used as the baseline reference for Catalog, Lobby, Settings, Sintonia, and shared UI surfaces.

## Core usage rules

1. Prefer `src/ui/atoms/*` over custom one-off UI blocks.
2. Do not hardcode colors, spacing, radius, or shadows in screens unless there is no token yet.
3. Always include accessibility metadata on new interactive elements.
4. When a pattern already exists in Catalog, Lobby, Settings, or Sintonia, reuse it instead of inventing a new one.
5. Prioritize mobile clarity over decorative complexity.

## Product direction

The app should feel:
- mobile-first
- clear
- light
- premium
- social / party-game oriented

The app should not feel like:
- an admin dashboard
- an old neon interface
- a generic form-based app with arbitrary cards

## Global visual principles

1. Each screen should have one obvious primary action.
2. Titles should be strong, but should not compete with the main action area.
3. Cards and modals should use soft surfaces, subtle borders, and controlled depth.
4. Disabled states must not look actionable.
5. Repeated information should not appear in multiple competing UI blocks.
6. Use motion only to reinforce meaning, never as decoration by default.

## Color system guidance

Base surfaces:
- app background: very light with subtle gradient
- cards and modals: white or near-white
- primary text: dark navy
- secondary text: muted blue-gray

Action colors:
- primary action: coral / salmon
- secondary action: white or soft neutral with border
- success: soft green
- warning: warm soft accent, never aggressive neon
- error: controlled coral-red, not a harsh saturated red by default

Rules:
- avoid introducing isolated colors that do not already belong to the app language
- yellow should not be used as the selected state unless there is a strong product reason
- red should communicate error, danger, removal, or failure, not neutral ordering or generic emphasis

## Typography guidance

Hierarchy:
- screen title: strong, dark, high contrast
- section title: medium emphasis
- helper text: short, low emphasis
- badge text: compact and readable

Rules:
- avoid long blocks of explanatory text in action-heavy screens
- avoid repeating the same instruction in two places
- use uppercase sparingly, mostly for labels, chips, and CTA text when already established

## Button

File: `src/ui/atoms/Button.tsx`

### Variants

- `primary`
- `secondary`
- `accent`
- `ghost`
- `destructive`

### Sizes

- `sm`
- `md`
- `lg`

### Props

- `label: string`
- `onPress: () => void`
- `disabled?: boolean`
- `loading?: boolean`
- `variant?: ...`
- `size?: ...`
- `testID?: string`
- `accessibilityLabel?: string`

### Visual rules

#### Primary button
- reserved for the main action in the current viewport
- coral background
- dark navy text
- rounded corners
- short, controlled shadow
- mild bottom depth

#### Secondary button
- used for important but non-primary actions
- white or near-white background
- soft border
- dark navy text
- lighter shadow than primary

#### Ghost button
- used for navigation and low-priority actions
- transparent or near-transparent surface
- no heavy fill
- dark text

#### Destructive button
- only for removal, exit, or irreversible danger
- should not be reused for generic emphasis

#### Disabled button
- must keep the same shape as the active button
- should be visibly less saturated
- should have weaker depth and lower visual priority
- must not look tappable at a glance

## IconCircleButton

File: `src/ui/atoms/IconCircleButton.tsx`

### Usage

Use for:
- settings
- info
- copy
- show / hide
- shuffle / randomize

### Rules

- all circular icon buttons must use the same atom
- target size: `44x44`
- visible circular surface on native and web
- same border treatment across screens
- same shadow logic across screens
- same tap feedback across screens
- do not locally override them with different shadow, size, or radius unless absolutely necessary

### Visual behavior

- light background
- soft border
- subtle but visible shadow
- icon centered
- interactive feedback on press

## Card

File: `src/ui/atoms/Card.tsx`

### Variants

- `elevated`
- `outlined`
- `filled`

### Props

- `title?: string`
- `subtitle?: string`
- `variant?: ...`
- `selected?: boolean`
- `disabled?: boolean`

### Visual rules

- use high radius
- avoid unnecessary nested frames inside frames
- selected state should be clear without needing extra icons unless truly helpful
- placeholder / empty cards should keep the same perceived size and weight as filled cards

## Input

File: `src/ui/atoms/Input.tsx`

### Props

- `label?: string`
- `helperText?: string`
- `errorText?: string`
- `value: string`
- `onChangeText: (text: string) => void`
- `placeholder?: string`
- `disabled?: boolean`
- `testID?: string`
- `accessibilityLabel?: string`

### Visual rules

- keep inputs integrated with the screen language
- helper text should support the action, not repeat what is already obvious
- placeholders should be human and short

## Badge

File: `src/ui/atoms/Badge.tsx`

### Variants

- `success`
- `error`
- `warning`
- `info`
- `host`
- `neutral`

### Visual rules

- keep badges compact and readable on mobile
- badges in the same block should have similar visual weight
- use badges for status, rules, and compact metadata
- do not duplicate the same information in a badge and a headline

### Recommended usage

Good:
- ready count
- impostor count
- game mode (`Words`, `Questions`)
- timer (`10s`, `20s`, `30s`)

Avoid:
- two badges saying nearly the same thing
- overly saturated badges without semantic meaning

## Modal

File: `src/ui/atoms/Modal.tsx`

### Variants

- `alert`
- `fullscreen`

### Props

- `visible: boolean`
- `title?: string`
- `onClose: () => void`
- `variant?: ...`

### Visual rules

- white or near-white surface
- strong title, short supporting copy
- same circular icon button pattern for close actions when appropriate
- enough inner spacing to breathe without feeling empty

## Structural components

### GameTopBar

File: `src/ui/atoms/GameTopBar.tsx`

- Standardized top area for game pages.
- Includes title, subtitle, status dot, and optional right-side action.
- Should contextualize the phase without overpowering the action area.

### BottomActionDock

File: `src/ui/atoms/BottomActionDock.tsx`

- Fixed bottom CTA container with safe-area support.
- Supports primary + optional secondary action.
- Helper text belongs here when it should not compete with the main content.

### GameScreenShell

File: `src/ui/atoms/GameScreenShell.tsx`

- Standardized game screen shell with optional backdrop and footer slot.
- Use for gameplay screens to keep spacing and layout consistent.

## Screen-specific behavior guidance

### Catalog

Goal:
- feel like a party-game hub

Rules:
- game cards are the main focus
- top profile area should feel friendly and light
- circular icon buttons must match the shared atom
- room-code CTA is secondary, but still clearly actionable

### Lobby

Goal:
- feel like a live room, not a passive waiting screen

Rules:
- room code must be clearly identified
- player cards are the main body of the screen
- bottom CTA must clearly communicate active vs waiting state
- connection/device state can live in player cards instead of duplicated top badges

### Settings

Goal:
- simple and coherent with the rest of the app

Rules:
- selected state should use the same primary action family as the app
- avoid introducing a color that does not exist elsewhere in the product

### Sintonia

Goal:
- feel like a real local party game played around the same device

Rules:
- reveal interactions must feel tactile
- ordering phase must clearly look draggable
- result phase must be quickly understandable
- avoid heavy dashboard-like UI blocks

## Sintonia-specific implementation notes

### Reveal phase
- text should make it obvious that the card is the reveal target
- hold-to-reveal needs visual feedback
- avatars at the top can stay if they help reinforce round context

### Ordering phase
- add a drag affordance icon to player cards
- avoid bright red order markers unless they mean failure or warning
- keep the board easy to scan quickly

### Result phase
- reinforce win / failure state through hierarchy and color
- do not add explanatory clutter if the screen is already understandable at a glance

## What to avoid

- arbitrary color choices outside the system
- different circular icon buttons in different screens
- disabled buttons that still look active
- duplicate instructions in headline + helper + badge
- harsh red used for neutral ordering or generic attention
- complex card nesting without a clear reason

## Implementation checklist

Before creating or refactoring a screen:
1. identify the main action
2. identify the main visual focus area
3. apply the shared component rules from this file
4. verify consistency with Catalog, Lobby, Settings, and Sintonia
5. only introduce a new visual pattern if no existing one fits

## Quick examples

```tsx
<Button label="Start" onPress={onStart} variant="primary" size="lg" />

<Input
  label="Nickname"
  value={nickname}
  onChangeText={setNickname}
  errorText={nicknameError || undefined}
/>

<BottomActionDock
  primaryAction={{ label: 'Continue', onPress: onContinue }}
  secondaryAction={{ label: 'Back', onPress: onBack, variant: 'ghost' }}
/>
```
