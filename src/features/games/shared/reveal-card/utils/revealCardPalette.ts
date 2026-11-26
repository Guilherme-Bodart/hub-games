import {
  RevealCardMode,
  RevealCardVisualTokens,
} from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { ThemeTokens } from '@/src/theme/types';
import { shiftHexColor, withAlpha } from '@/src/theme/utils';

const IMPOSTOR_PAPER_BASE = '#FFF7F8';
const IMPOSTOR_PAPER_MID = '#FFEFF2';
const IMPOSTOR_PAPER_EDGE = '#FCE3E8';
const IMPOSTOR_PAPER_TEXTURE = '#E5B2BC';
const STUDIO_CARD_BASE = '#FFFFFF';
const STUDIO_CARD_EDGE = '#F4F7FC';
const SINTONIA_INDIGO = '#6366F1';
const FOIL_CYAN = '#38BDF8';
const FOIL_GOLD = '#FBBF24';

export function buildRevealCardVisualTokens(
  theme: ThemeTokens,
  mode: RevealCardMode,
  options?: {
    isRevealed?: boolean;
  }
): RevealCardVisualTokens {
  const isImpostor = mode === 'impostor';
  const isImpostorRevealed = isImpostor && (options?.isRevealed ?? true);
  const accentColor = isImpostorRevealed
    ? '#FF4D6D'
    : mode === 'number'
      ? SINTONIA_INDIGO
      : theme.semantic.button.primary.bg;
  const accentSecondaryColor = isImpostorRevealed
    ? FOIL_GOLD
    : mode === 'number'
      ? FOIL_CYAN
      : '#818CF8';

  const shellToneColors: [string, string, string] = isImpostorRevealed
    ? [IMPOSTOR_PAPER_BASE, IMPOSTOR_PAPER_MID, IMPOSTOR_PAPER_EDGE]
    : [STUDIO_CARD_BASE, STUDIO_CARD_BASE, STUDIO_CARD_EDGE];

  const shellBackgroundColor = isImpostorRevealed ? IMPOSTOR_PAPER_BASE : STUDIO_CARD_BASE;

  const foilColors: [string, string, string, string] = isImpostorRevealed
    ? [
        withAlpha('#FFFFFF', 0),
        withAlpha('#FF4D6D', 0.22),
        withAlpha('#FDE68A', 0.34),
        withAlpha('#FFFFFF', 0),
      ]
    : mode === 'number'
      ? [
          withAlpha('#FFFFFF', 0),
          withAlpha('#38BDF8', 0.22),
          withAlpha('#A5B4FC', 0.32),
          withAlpha('#FFFFFF', 0),
        ]
      : [
          withAlpha('#FFFFFF', 0),
          withAlpha('#818CF8', 0.18),
          withAlpha('#FFFFFF', 0.45),
          withAlpha('#FFFFFF', 0),
        ];

  return {
    accentColor,
    avatarHaloBackgroundColor: '#F4F6FB',
    avatarHaloBorderColor: withAlpha(accentColor, 0.28),
    avatarHaloShadowColor: withAlpha(accentColor, 0.35),
    cardBadgeBackgroundColor: accentColor,
    cardBadgeBorderColor: shiftHexColor(accentColor, -0.1),
    cardBadgeShadowColor: withAlpha(accentColor, 0.28),
    cardBadgeTextColor: '#FFFFFF',
    cardCornerColor: withAlpha(accentColor, 0.38),
    cardInsetColor: isImpostorRevealed ? '#FFF0F3' : '#F8FAFF',
    cardPatternColor: withAlpha(isImpostorRevealed ? IMPOSTOR_PAPER_TEXTURE : accentColor, 0.2),
    cardPipColor: '#FFFFFF',
    chargeBorderColor: accentColor,
    chargeShadowColor: withAlpha(accentColor, 0.45),
    chargeSweepColors: [
      withAlpha('#FFFFFF', 0),
      withAlpha(accentColor, 0.18),
      withAlpha('#FFFFFF', 0),
    ],
    foilColors,
    glossColors: [withAlpha('#FFFFFF', 0.52), withAlpha('#FFFFFF', 0)],
    hintTextColor: theme.semantic.text.secondary,
    holdProgressFillColor: accentColor,
    holdProgressTrackBackgroundColor: '#EBF0F8',
    holdProgressTrackBorderColor: '#D6DFEE',
    hostBadgeBackgroundColor: '#FFFBEB',
    hostBadgeBorderColor: '#F59E0B',
    hostBadgeTintColor: '#D97706',
    paperEffect: {
      accentLineColor: withAlpha(accentColor, 0.18),
      backgroundColor: IMPOSTOR_PAPER_BASE,
      enabled: isImpostorRevealed,
      frameBorderColor: withAlpha(accentColor, 0.26),
      gradientColors: [IMPOSTOR_PAPER_BASE, IMPOSTOR_PAPER_MID, IMPOSTOR_PAPER_EDGE],
      innerBorderColor: withAlpha(accentColor, 0.14),
      textureColor: withAlpha(IMPOSTOR_PAPER_TEXTURE, 0.32),
    },
    revealHeaderBackgroundColor: withAlpha(accentColor, 0.12),
    revealHeaderBorderColor: withAlpha(accentColor, 0.28),
    revealHeaderTintColor: accentColor,
    revealHintColor: theme.semantic.text.secondary,
    revealLabelColor: theme.semantic.text.muted,
    revealSurfaceBackgroundColor: isImpostorRevealed
      ? IMPOSTOR_PAPER_BASE
      : withAlpha(accentColor, 0.06),
    revealSurfaceBorderColor: withAlpha(accentColor, 0.24),
    revealTextColor: isImpostorRevealed ? '#D92B4E' : theme.semantic.text.primary,
    shellBackgroundColor,
    shellBorderColor: withAlpha(accentColor, isImpostorRevealed ? 0.55 : 0.36),
    shellFrameInnerColor: withAlpha(accentSecondaryColor, 0.26),
    shellFrameOuterColor: withAlpha(accentColor, 0.24),
    shellShadowColor: '#181C3A',
    shellToneColors,
    waitingTextColor: theme.semantic.text.secondary,
  };
}
