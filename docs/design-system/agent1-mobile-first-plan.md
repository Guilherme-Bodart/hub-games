# Agent1 Mobile-First Design System Plan

## Scope
- Foundation for `catalog`, `lobby`, and shared atoms with mobile-first priority.
- Keep work isolated in branch/worktree `agent1/design-system-mobile-foundation`.

## Goals
1. Make shared icon/button visuals consistent on Android/iOS.
2. Normalize responsive grids for `catalog` and `lobby`.
3. Stabilize room-code tiles rendering (no masked glyph fallback issues).
4. Reduce per-screen layout drift by pushing behavior into reusable components/styles.

## Execution Blocks

### Block A (Done)
- Diagnose active files and style sources.
- Identify current regressions in icon shell, card widths, and room-code tiles.

### Block B (Done)
- Update `IconCircleButton` shadow/elevation baseline.
- Update `CatalogGameGrid` mobile sizing strategy.
- Update `LobbyHeaderPanel` masked room-code glyph fallback.
- Update lobby derived layout + players section behavior for percentage-based card widths.

### Block C (Next)
- Validate real-device spacing for catalog/lobby at breakpoints.
- Tune edge cases for odd card counts.
- Align remaining lobby surface tokens with DS components.

### Block D (Next)
- Continue cleanup in settings + remaining shared surface atoms.
- Add regression checklist pass for mobile screenshots.

## Files touched in Block B
- `src/ui/atoms/IconCircleButton.tsx`
- `src/features/catalog/components/CatalogGameGrid.tsx`
- `src/features/catalog/styles/catalogStyles.ts`
- `src/features/lobby/components/LobbyHeaderPanel.tsx`
- `src/features/lobby/hooks/useLobbyDerivedState.ts`
- `src/features/lobby/components/LobbyPlayersSection.tsx`
- `src/features/lobby/styles/lobbyStyles.ts`

## Validation status
- `npm test -- --watchAll=false` executed but full run is blocked in this worktree because `jest` binary is unavailable (dependencies not installed locally).
- Structural diff review completed.
