import {
  RevealCardMode,
  RevealCardVisualTokens,
} from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { ThemeTokens } from '@/src/theme/types';
import { shiftHexColor, withAlpha } from '@/src/theme/utils';

const IMPOSTOR_PAPER_BASE = '#FFF8F3';
const IMPOSTOR_PAPER_MID = '#FFF2EC';
const IMPOSTOR_PAPER_EDGE = '#F7E5DE';
const IMPOSTOR_PAPER_TEXTURE = '#DAB8AD';
const CLASSIC_CARD_BASE = '#FFFDF7';
const CLASSIC_CARD_MID = '#FAF3E8';
const CLASSIC_CARD_EDGE = '#F2E5D4';
const LOBBY_GLOW_CYAN = '#42DDF4';

export function buildRevealCardVisualTokens(
  theme: ThemeTokens,
  mode: RevealCardMode,
  options?: {
    isRevealed?: boolean;
  }
): RevealCardVisualTokens {
  const isImpostor = mode === 'impostor';
  const isImpostorRevealed = isImpostor && (options?.isRevealed ?? true);
  const accentColor = isImpostorRevealed ? theme.semantic.status.error : theme.semantic.button.primary.bg;
  const accentSecondaryColor = mode === 'number' ? LOBBY_GLOW_CYAN : theme.semantic.button.accent.bg;
  const shellToneColors: [string, string, string] = isImpostorRevealed
    ? [
        withAlpha(IMPOSTOR_PAPER_BASE, 0.98),
        withAlpha(IMPOSTOR_PAPER_MID, 0.96),
        withAlpha(IMPOSTOR_PAPER_EDGE, 0.92),
      ]
    : [
        withAlpha(CLASSIC_CARD_BASE, 0.99),
        withAlpha(CLASSIC_CARD_BASE, 0.99),
        withAlpha(CLASSIC_CARD_BASE, 0.99),
      ];
  const shellBackgroundColor = withAlpha(
    isImpostorRevealed ? shiftHexColor(theme.semantic.bg.surface, 0.03) : CLASSIC_CARD_BASE,
    0.96
  );

  return {
    accentColor,
    avatarHaloBackgroundColor: withAlpha(theme.semantic.bg.elevated, 0.96),
    avatarHaloBorderColor: withAlpha(theme.semantic.border.subtle, 0.92),
    avatarHaloShadowColor: withAlpha(accentSecondaryColor, isImpostorRevealed ? 0.18 : 0.64),
    cardBadgeBackgroundColor: withAlpha(accentColor, isImpostorRevealed ? 0.94 : 0.96),
    cardBadgeBorderColor: withAlpha(shiftHexColor(accentColor, -0.08), 0.84),
    cardBadgeShadowColor: withAlpha(accentColor, isImpostorRevealed ? 0.24 : 0.32),
    cardBadgeTextColor: isImpostorRevealed ? withAlpha('#FFF6F2', 0.98) : theme.semantic.button.primary.text,
    cardCornerColor: withAlpha(isImpostorRevealed ? accentColor : accentSecondaryColor, isImpostorRevealed ? 0.42 : 0.5),
    cardInsetColor: withAlpha(isImpostorRevealed ? IMPOSTOR_PAPER_EDGE : '#FFFFFF', 0.94),
    cardPatternColor: withAlpha(isImpostorRevealed ? IMPOSTOR_PAPER_TEXTURE : accentSecondaryColor, isImpostorRevealed ? 0.58 : 0.18),
    cardPipColor: withAlpha(isImpostorRevealed ? '#FFF4EE' : '#FFF9EF', 0.96),
    chargeBorderColor: withAlpha(accentSecondaryColor, isImpostorRevealed ? 0.42 : 0.98),
    chargeShadowColor: withAlpha(accentSecondaryColor, isImpostorRevealed ? 0.32 : 0.96),
    chargeSweepColors: [
      withAlpha('#FFFFFF', 0),
      withAlpha(accentColor, isImpostorRevealed ? 0.12 : 0.22),
      withAlpha('#FFFFFF', 0),
    ],
    glossColors: isImpostorRevealed
      ? [withAlpha('#FFFFFF', 0.3), withAlpha('#FFFFFF', 0)]
      : [withAlpha('#FFFFFF', 0.56), withAlpha('#FFFFFF', 0)],
    hintTextColor: theme.semantic.text.secondary,
    holdProgressFillColor: withAlpha(accentColor, 0.95),
    holdProgressTrackBackgroundColor: withAlpha(theme.semantic.bg.elevated, 0.9),
    holdProgressTrackBorderColor: withAlpha(theme.semantic.border.subtle, 0.8),
    hostBadgeBackgroundColor: withAlpha('#D7A63D', 0.14),
    hostBadgeBorderColor: withAlpha('#D7A63D', 0.7),
    hostBadgeTintColor: '#D7A63D',
    paperEffect: {
      accentLineColor: withAlpha(accentColor, 0.12),
      backgroundColor: withAlpha(IMPOSTOR_PAPER_BASE, 0.98),
      enabled: isImpostorRevealed,
      frameBorderColor: withAlpha(accentColor, 0.18),
      gradientColors: [
        withAlpha(IMPOSTOR_PAPER_BASE, 0.98),
        withAlpha(IMPOSTOR_PAPER_MID, 0.96),
        withAlpha(IMPOSTOR_PAPER_EDGE, 0.92),
      ],
      innerBorderColor: withAlpha(accentColor, 0.1),
      textureColor: withAlpha(IMPOSTOR_PAPER_TEXTURE, 0.34),
    },
    revealHeaderBackgroundColor: withAlpha(accentColor, isImpostorRevealed ? 0.1 : 0.14),
    revealHeaderBorderColor: withAlpha(accentColor, isImpostorRevealed ? 0.28 : 0.38),
    revealHeaderTintColor: accentColor,
    revealHintColor: withAlpha(theme.semantic.text.secondary, 0.82),
    revealLabelColor: withAlpha(theme.semantic.text.secondary, 0.78),
    revealSurfaceBackgroundColor: isImpostorRevealed
      ? withAlpha(IMPOSTOR_PAPER_BASE, 0.98)
      : withAlpha(accentColor, mode === 'secret' ? 0.06 : 0.09),
    revealSurfaceBorderColor: withAlpha(accentColor, isImpostorRevealed ? 0.2 : 0.34),
    revealTextColor: isImpostorRevealed ? theme.semantic.status.error : theme.semantic.text.primary,
    shellBackgroundColor,
    shellBorderColor: withAlpha(accentColor, isImpostorRevealed ? 0.42 : 0.52),
    shellFrameInnerColor: withAlpha(isImpostorRevealed ? accentColor : accentSecondaryColor, isImpostorRevealed ? 0.28 : 0.42),
    shellFrameOuterColor: withAlpha(accentColor, isImpostor ? 0.28 : 0.4),
    shellShadowColor: withAlpha(theme.semantic.shadow.base, isImpostorRevealed ? 0.64 : 0.8),
    shellToneColors,
    waitingTextColor: theme.semantic.text.secondary,
  };
}
