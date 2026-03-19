# HUB GAMES Design System - Implementation Tracker

This tracker records the incremental rollout of the design system so work can
continue safely across chat sessions.

## Scope

- Platform: React Native + Expo + TypeScript
- Product areas:
  - Catalog
  - Lobby
  - Game runtime shell
  - Sintonia game
  - Impostor Neon game

## Progress

### Task 1 - Foundation tokens (completed)

- Expanded theme semantic tokens in `src/theme/types.ts` with:
  - `layout` (spacing, radius, borderWidth, minTouchTarget)
  - `elevation`
  - `motion`
  - `game.phase`, `game.connection`, `game.result`
  - `zIndex`
- Added token values to all theme presets in `src/theme/themes.ts`.
- Added `button.destructive` and richer badge semantics.

### Task 2 - Core atoms consuming tokens (completed)

- Updated `Button`:
  - Added variants: `destructive` (kept existing variants)
  - Added sizes: `sm | md | lg`
  - Added `loading`, `testID`, `accessibilityLabel`
  - Moved visual feedback to motion tokens
- Updated `Card`:
  - Added `variant`, `selected`, `disabled`
  - Uses semantic layout/elevation tokens
- Updated `Input`:
  - Added `errorText`, `disabled`, `testID`, `accessibilityLabel`
  - Focus/error border logic and disabled opacity via tokens
- Updated `Badge`:
  - Added variants: `warning`, `info`, `host`
  - Uses semantic layout tokens for sizing/radius
- Updated `Modal`:
  - Added `variant: alert | fullscreen`
  - Uses layout/elevation tokens and min touch target for close button
- Updated `Screen`:
  - Uses semantic spacing tokens
- Updated `ConnectionStatusPill`:
  - Uses `semantic.game.connection.*` tokens

### Task 3 - DS docs and governance (completed)

- This tracker file created.
- `docs/design-system/pr-checklist.md` created.

### Task 4 - Structural components and first migration (completed)

- Created structural components:
  - `src/ui/atoms/GameTopBar.tsx`
  - `src/ui/atoms/BottomActionDock.tsx`
  - `src/ui/atoms/GameScreenShell.tsx`
- Exported them in `src/ui/atoms/index.ts`.
- Integrated first screen migration in Sintonia:
  - Replaced local header block with `GameTopBar`
  - Replaced local footer block with `BottomActionDock`
  - Wrapped main layout with `GameScreenShell`
  - Removed obsolete local layout styles replaced by shell components

### Task 5 - Lobby migration to DS structure (completed)

- Integrated `GameTopBar` in `app/lobby.tsx` as the standardized lobby header.
- Replaced legacy CTA dock block with `BottomActionDock`.
- Kept existing lobby logic intact (ready checks, host rules, countdown, remote flow).
- Updated scroll bottom spacing to account for the new fixed dock.

### Task 6 - Catalog migration to DS structure (completed)

- Migrated `app/(tabs)/index.tsx` to use `GameTopBar` for standardized catalog header.
- Replaced old top "open room" button placement with `BottomActionDock` CTA.
- Improved form-state handling in modals:
  - `Input` now receives `errorText` directly
  - action buttons use `loading` states (`isCreatingRoom`, `isJoiningRoom`)
- Kept session creation/join logic untouched.

### Task 7 - Game internals DS refinement (completed)

- Impostor Neon refinement completed:
  - Main gameplay layout now uses `GameScreenShell`.
  - Replaced raw `TextInput` usage with DS `Input` in clue/guess flows.
  - Replaced custom outline back action in result phase with DS `Button` (`ghost` variant).
  - Kept game logic and state transitions untouched.
- Sintonia refinement completed:
  - Replaced custom players-count tag block with DS `Badge` (`info` variant).
  - Kept phase interaction logic intact while aligning with semantic component usage.

### Task 8 - DS docs and regression artifacts (completed)

- Added component usage guide:
  - `docs/design-system/components.md`
- Added visual regression checklist and screenshot protocol:
  - `docs/design-system/visual-regression-checklist.md`

### Task 9 - Aggressive visual polish pass (completed)

- Global DS polish:
  - `GameScreenShell` now has stronger atmospheric backdrop (multi-orb + scanline texture), wider spacing and centered max content width.
  - `GameTopBar` upgraded with stronger title hierarchy, larger signal indicator and elevated glass panel look.
  - `Button`, `Card`, `Input`, `Badge`, `Modal`, `BottomActionDock` received visual-strength updates (contrast, spacing, shape, glow, typography cadence).
- Catalog (`app/(tabs)/index.tsx`):
  - Added hero panel.
  - Added game status pill (`Ready` / `Coming soon`) on cards.
  - Increased card scale and hierarchy.
  - Added responsive card grid (1 or 2 columns depending on viewport width).
- Lobby (`app/lobby.tsx`):
  - Added session panel container (room code and controls).
  - Improved HUD panel readability and hierarchy.
  - Updated players grid to adaptive density (2 or 3 columns by viewport).
  - Replaced raw `TextInput` for adding player with DS `Input`.
- Sintonia (`src/features/games/sintonia/SintoniaGameScreen.tsx`):
  - Added contextual helper text in dock per phase.
  - Strengthened theme hero card and card viewport framing.
  - Secret cards resized for better readability and stronger game feel.
  - Ordering cards received larger rank markers and clearer spacing.
- Impostor Neon (`src/features/games/impostor/ImpostorGameScreen.tsx`):
  - Added `GameTopBar` + phase/status awareness.
  - Added error strip with semantic error styling.
  - Refined spacing and card density in reveal/clues/voting/result blocks.

### Task 10 - Responsive breakpoint tuning (completed)

- Catalog:
  - Breakpoints adjusted to support 1/2/3 card columns by viewport.
  - Hero typography and card height now adapt for compact devices.
- Lobby:
  - Player grid now adapts to 1/2/3/4 columns depending on viewport width.
  - Room code typography scales down on compact devices.
- Sintonia:
  - Secret and ordering card grids now use responsive column counts.
  - Drag reorder math now adapts to dynamic ordering columns.
  - Card dimensions adapt for compact devices to preserve readability.
- Impostor:
  - Reveal and voting grids now use responsive columns and card widths.
  - Maintains gameplay logic while improving density on large screens and readability on small screens.

### Task 11 - UX microcopy and empty-state pass (completed)

- Translation refinements:
  - Improved `catalog.subtitle` copy in both locales.
  - Improved `lobby.tapAvatarHint` guidance in both locales.
- Catalog:
  - Added helper text in bottom dock to clarify direct room-code entry flow.
- Lobby:
  - Added explicit empty-player state messaging.
  - Added helper copy near add-player input (tip vs limit reached).
  - Added contextual helper text in bottom dock for start/wait states.
- Sintonia:
  - Added phase guidance strip (secrets, ordering, revealing, finished).
  - Added empty-cards state messaging for round wait scenarios.
- Impostor:
  - Added phase guidance strip with step-by-step short instructions.
  - Improved no-round empty state subtitle for clearer host action expectation.

### Task 12 - Catalog header cleanup (completed)

- Removed duplicated hero block from Catalog top area to reduce visual noise.
- Removed global floating `ConnectionStatusPill` overlay from app root.
- Moved connection label (`Online`) into the catalog `GameTopBar` status area for cleaner hierarchy.

### Task 13 - Casual catalog card direction (completed)

- Catalog now follows a simpler "casual game" card approach:
  - Single top header label (`Catalogo de Jogos` / `Game Catalog`).
  - Removed the extra intermediate section.
  - Game cards use colorful background tones, clearer title prominence, and lighter visual noise.
  - Cover area uses explicit placeholder box (`Imagem em breve` / `Image coming soon`) to be replaced by final artwork later.
  - Two explicit tags per card:
    - player count (`min-max players`)
    - mode (`Local`, `Online`, `Local + Online`)
- Tab header options icon changed from three-dots to settings/tool icon.

### Task 14 - Catalog redundant-header removal (completed)

- Removed default tab header from catalog route to avoid duplicated title stack.
- Moved catalog options action to custom in-screen `GameTopBar`.
- `GameTopBar` now supports optional symbol icon on right action button.

### Task 15 - Persistent nickname UX (completed)

- Added persistent nickname helpers to lobby store:
  - `getPreferredNickname()`
  - `setPreferredNickname(nickname)`
- Catalog now hydrates remote nickname input with the last stored nickname on screen load.
- Catalog now persists nickname as the user types (still editable anytime).
- Result:
  - if user leaves room or closes app, last nickname remains prefilled next time.

### Task 16 - Lobby density and interaction polish (completed)

- Reduced lobby top noise from multiple stacked panels to a single primary session panel.
- Moved configuration action to top-right of the primary panel (replacing previous visual focus point).
- Moved status tags to appear directly under the game name.
- Moved add-nickname input above player cards so it no longer shifts with card list growth.
- Increased visual pulse/glow feedback for non-ready cards to highlight required interaction.
- Removed duplicated "waiting" helper text above bottom action dock, keeping only the main waiting CTA.

## Next tasks (pending)

1. Capture real screenshot sets for Catalog, Lobby, Sintonia, and Impostor using the new checklist.
2. Apply any final contrast and spacing tweaks from screenshot QA.
3. Optionally add lightweight onboarding overlay for first-time users per game.

## Validation commands

- `npx tsc --noEmit`
- `npm test -- --runTestsByPath __tests__/sintonia.logic.test.ts --watchAll=false`
