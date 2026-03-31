import { ThemeTokens } from '@/src/theme/types';

export type RevealCardMode = 'number' | 'secret' | 'impostor';

export type RevealCardPlayer = {
  avatarId: number;
  isHost?: boolean;
  name: string;
};

export type RevealCardCopy = {
  chargingLabel: string;
  holdHintLabel: string;
  releaseHintLabel: string;
  waitingLabel: string;
};

export type RevealCardContent = {
  mode: RevealCardMode;
  revealedLabel: string;
  value: string | number;
};

export type RevealCardPaperEffect = {
  accentLineColor: string;
  backgroundColor: string;
  enabled: boolean;
  frameBorderColor: string;
  gradientColors: [string, string, string];
  innerBorderColor: string;
  textureColor: string;
};

export type RevealCardVisualTokens = {
  accentColor: string;
  avatarHaloBackgroundColor: string;
  avatarHaloBorderColor: string;
  avatarHaloShadowColor: string;
  cardBadgeBackgroundColor: string;
  cardBadgeBorderColor: string;
  cardBadgeShadowColor: string;
  cardBadgeTextColor: string;
  cardCornerColor: string;
  cardInsetColor: string;
  cardPatternColor: string;
  cardPipColor: string;
  chargeBorderColor: string;
  chargeShadowColor: string;
  chargeSweepColors: [string, string, string];
  glossColors: [string, string];
  hintTextColor: string;
  holdProgressFillColor: string;
  holdProgressTrackBackgroundColor: string;
  holdProgressTrackBorderColor: string;
  hostBadgeBackgroundColor: string;
  hostBadgeBorderColor: string;
  hostBadgeTintColor: string;
  paperEffect: RevealCardPaperEffect;
  revealHeaderBackgroundColor: string;
  revealHeaderBorderColor: string;
  revealHeaderTintColor: string;
  revealHintColor: string;
  revealLabelColor: string;
  revealSurfaceBackgroundColor: string;
  revealSurfaceBorderColor: string;
  revealTextColor: string;
  shellBackgroundColor: string;
  shellBorderColor: string;
  shellFrameInnerColor: string;
  shellFrameOuterColor: string;
  shellShadowColor: string;
  shellToneColors: [string, string, string];
  waitingTextColor: string;
};

export type RevealCardProps = {
  accessibilityLabel?: string;
  content: RevealCardContent;
  copy: RevealCardCopy;
  isLocalReady: boolean;
  isRevealed: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  player: RevealCardPlayer | null;
  theme: ThemeTokens;
};
