import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SecretRevealBackFace } from '@/src/features/games/sintonia/components/SecretRevealBackFace';
import { SecretRevealFrontFace } from '@/src/features/games/sintonia/components/SecretRevealFrontFace';
import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { useSecretRevealCardAnimation } from '@/src/features/games/sintonia/hooks/useSecretRevealCardAnimation';
import { secretRevealCardStyles as styles } from '@/src/features/games/sintonia/styles/secretRevealCardStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

type SecretRevealInteractiveCardProps = {
  theme: ThemeTokens;
  player: SintoniaPlayer | null;
  isRevealed: boolean;
  isLocalReady: boolean;
  waitingLabel: string;
  holdHintLabel: string;
  chargingLabel: string;
  releaseHintLabel: string;
  revealedLabel: string;
  onPressIn: () => void;
  onPressOut: () => void;
};

export function SecretRevealInteractiveCard({
  theme,
  player,
  isRevealed,
  isLocalReady,
  waitingLabel,
  holdHintLabel,
  chargingLabel,
  releaseHintLabel,
  revealedLabel,
  onPressIn,
  onPressOut,
}: SecretRevealInteractiveCardProps) {
  const {
    isPressing,
    setPressingState,
    chargeProgress,
    shellStyle,
    chargeGlowStyle,
    frontFaceStyle,
    backFaceStyle,
  } = useSecretRevealCardAnimation({ isRevealed, isLocalReady });

  const hintLabel = useMemo(() => {
    if (!player) {
      return waitingLabel;
    }

    if (isRevealed) {
      return releaseHintLabel;
    }

    return isPressing ? chargingLabel : holdHintLabel;
  }, [chargingLabel, holdHintLabel, isPressing, isRevealed, player, releaseHintLabel, waitingLabel]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !player || isLocalReady }}
      accessibilityLabel={player ? `Carta secreta de ${player.name}` : waitingLabel}
      disabled={!player || isLocalReady}
      onPressIn={() => {
        setPressingState(true);
        onPressIn();
      }}
      onPressOut={() => {
        setPressingState(false);
        onPressOut();
      }}
      style={{ width: '100%' }}>
      <Animated.View
        style={[
          styles.cardShell,
          shellStyle,
          {
            borderColor: withAlpha(theme.semantic.border.subtle, 0.75),
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.95),
            shadowColor: withAlpha(theme.semantic.shadow.base, 0.8),
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.chargeGlowBorder,
            chargeGlowStyle,
            {
              borderColor: withAlpha(theme.semantic.button.primary.bg, 0.86),
              shadowColor: withAlpha(theme.semantic.button.primary.bg, 0.88),
            },
          ]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha('#FFFFFF', 0.56), withAlpha('#FFFFFF', 0)]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardGloss}
        />

        <View style={styles.flipCanvas}>
          <SecretRevealFrontFace
            theme={theme}
            player={player}
            waitingLabel={waitingLabel}
            hintLabel={hintLabel}
            chargeProgress={chargeProgress}
            frontFaceStyle={frontFaceStyle}
          />

          <SecretRevealBackFace
            theme={theme}
            player={player}
            revealedLabel={revealedLabel}
            releaseHintLabel={releaseHintLabel}
            backFaceStyle={backFaceStyle}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}
