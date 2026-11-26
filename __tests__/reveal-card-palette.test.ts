import { buildRevealCardVisualTokens } from '@/src/features/games/shared/reveal-card';
import { getGameAccent, getTheme } from '@/src/theme';

describe('buildRevealCardVisualTokens', () => {
  const theme = getTheme('studioParty');

  it('uses per-game Studio Party accents for number and secret variants', () => {
    const numberTokens = buildRevealCardVisualTokens(theme, 'number');
    const secretTokens = buildRevealCardVisualTokens(theme, 'secret');

    expect(numberTokens.accentColor).toBe(getGameAccent('sintonia').primary);
    expect(secretTokens.accentColor).toBe(theme.semantic.button.primary.bg);
    expect(numberTokens.paperEffect.enabled).toBe(false);
    expect(secretTokens.paperEffect.enabled).toBe(false);
    expect(numberTokens.foilColors).toHaveLength(4);
    expect(secretTokens.foilColors).toHaveLength(4);
  });

  it('prepares the impostor variant with crimson accent, foil shimmer, and special paper treatment', () => {
    const tokens = buildRevealCardVisualTokens(theme, 'impostor');
    const impostorAccent = getGameAccent('impostor-neon');

    expect(tokens.accentColor).toBe(impostorAccent.primary);
    expect(tokens.revealTextColor).toBe(impostorAccent.plinth);
    expect(tokens.paperEffect.enabled).toBe(true);
    expect(tokens.paperEffect.gradientColors).toHaveLength(3);
    expect(tokens.foilColors).toHaveLength(4);
  });

  it('keeps impostor cards neutral before they are revealed', () => {
    const hiddenTokens = buildRevealCardVisualTokens(theme, 'impostor', { isRevealed: false });

    expect(hiddenTokens.accentColor).toBe(theme.semantic.button.primary.bg);
    expect(hiddenTokens.revealTextColor).toBe(theme.semantic.text.primary);
    expect(hiddenTokens.paperEffect.enabled).toBe(false);
  });
});
