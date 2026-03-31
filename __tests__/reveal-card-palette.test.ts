import { buildRevealCardVisualTokens } from '@/src/features/games/shared/reveal-card';
import { getTheme } from '@/src/theme/themes';

describe('buildRevealCardVisualTokens', () => {
  const theme = getTheme('coralPop');

  it('keeps the default accent for number and secret variants', () => {
    const numberTokens = buildRevealCardVisualTokens(theme, 'number');
    const secretTokens = buildRevealCardVisualTokens(theme, 'secret');

    expect(numberTokens.accentColor).toBe(theme.semantic.button.primary.bg);
    expect(secretTokens.accentColor).toBe(theme.semantic.button.primary.bg);
    expect(numberTokens.paperEffect.enabled).toBe(false);
    expect(secretTokens.paperEffect.enabled).toBe(false);
  });

  it('prepares the impostor variant with error accent and special paper treatment', () => {
    const tokens = buildRevealCardVisualTokens(theme, 'impostor');

    expect(tokens.accentColor).toBe(theme.semantic.status.error);
    expect(tokens.revealTextColor).toBe(theme.semantic.status.error);
    expect(tokens.paperEffect.enabled).toBe(true);
    expect(tokens.paperEffect.gradientColors).toHaveLength(3);
  });
});
