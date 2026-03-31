import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { RevealCardBackFace } from '@/src/features/games/shared/reveal-card/components/RevealCardBackFace';
import { RevealCardChargeFrame } from '@/src/features/games/shared/reveal-card/components/RevealCardChargeFrame';
import { RevealCardFrontFace } from '@/src/features/games/shared/reveal-card/components/RevealCardFrontFace';
import { useRevealCardAnimation } from '@/src/features/games/shared/reveal-card/hooks/useRevealCardAnimation';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';
import { RevealCardProps } from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { buildRevealCardVisualTokens } from '@/src/features/games/shared/reveal-card/utils/revealCardPalette';

export function RevealCard({
  accessibilityLabel,
  content,
  copy,
  isLocalReady,
  isRevealed,
  onPressIn,
  onPressOut,
  player,
  theme,
}: RevealCardProps) {
  const visuals = buildRevealCardVisualTokens(theme, content.mode);
  const {
    backFaceStyle,
    backGlowStyle,
    chargeGlowStyle,
    chargeProgress,
    frontFaceStyle,
    setPressingState,
    shellStyle,
  } = useRevealCardAnimation({ isLocalReady, isRevealed });

  const isDisabled = !player || isLocalReady;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? (player ? player.name : copy.waitingLabel)}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
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
        pointerEvents="none"
        style={[
          styles.cardBackGlow,
          backGlowStyle,
          {
            backgroundColor: visuals.chargeShadowColor,
            shadowColor: visuals.chargeShadowColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.cardShell,
          shellStyle,
          {
            backgroundColor: visuals.shellBackgroundColor,
            borderColor: visuals.shellBorderColor,
            shadowColor: visuals.shellShadowColor,
          },
        ]}>
        <View
          pointerEvents="none"
          style={[styles.cardInset, { backgroundColor: visuals.cardInsetColor }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.chargeGlowBorder,
            chargeGlowStyle,
            {
              borderColor: visuals.chargeBorderColor,
              shadowColor: visuals.chargeShadowColor,
            },
          ]}
        />
        <LinearGradient
          colors={visuals.shellToneColors}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          style={styles.cardToneBackground}
        />
        <View
          pointerEvents="none"
          style={[styles.cardFrameOuter, { borderColor: visuals.shellFrameOuterColor }]}
        />
        <View
          pointerEvents="none"
          style={[styles.cardFrameInner, { borderColor: visuals.shellFrameInnerColor }]}
        />
        <RevealCardChargeFrame chargeProgress={chargeProgress} visuals={visuals} />

        <LinearGradient
          colors={visuals.glossColors}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={styles.cardGloss}
        />

        <View style={styles.flipCanvas}>
          <RevealCardFrontFace
            chargeProgress={chargeProgress}
            frontFaceStyle={frontFaceStyle}
            player={player}
            theme={theme}
            visuals={visuals}
            waitingLabel={copy.waitingLabel}
          />

          <RevealCardBackFace
            backFaceStyle={backFaceStyle}
            content={content}
            copy={copy}
            player={player}
            theme={theme}
            visuals={visuals}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}
