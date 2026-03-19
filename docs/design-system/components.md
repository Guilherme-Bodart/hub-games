# Design System Components Guide

This guide documents the current component API for UI work in HUB GAMES.

## Core usage rules

1. Prefer `src/ui/atoms/*` over custom one-off UI blocks.
2. Do not hardcode colors/spacing/radius in screens unless there is no token yet.
3. Always include accessibility metadata on new interactive elements.

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

## Badge

File: `src/ui/atoms/Badge.tsx`

### Variants

- `success`
- `error`
- `warning`
- `info`
- `host`
- `neutral`

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

## Structural components

### GameTopBar

File: `src/ui/atoms/GameTopBar.tsx`

- Standardized top area for game/lobby pages.
- Includes title, subtitle, status dot, optional right-side action.

### BottomActionDock

File: `src/ui/atoms/BottomActionDock.tsx`

- Fixed bottom CTA container with safe-area support.
- Supports primary + optional secondary action.

### GameScreenShell

File: `src/ui/atoms/GameScreenShell.tsx`

- Standardized game screen shell with optional backdrop and footer slot.
- Use for gameplay screens to keep spacing/layout consistent.

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

