import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { RevealCardBackFace } from '@/src/features/games/shared/reveal-card/components/RevealCardBackFace';
import { RevealCardChargeFrame } from '@/src/features/games/shared/reveal-card/components/RevealCardChargeFrame';
import { RevealCardFrontFace } from '@/src/features/games/shared/reveal-card/components/RevealCardFrontFace';
import { useRevealCardAnimation } from '@/src/features/games/shared/reveal-card/hooks/useRevealCardAnimation';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';
import { RevealCardProps } from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { buildRevealCardVisualTokens } from '@/src/features/games/shared/reveal-card/utils/revealCardPalette';
import { ELEVATION_STYLES } from '@/src/theme';

export function RevealCard({
  accessibilityLabel,
  content,
  copy,
  isLocalReady,
  isRevealed,
  onInteractionChange,
  onPressIn,
  onPressOut,
  player,
  theme,
}: RevealCardProps) {
  const visuals = buildRevealCardVisualTokens(theme, content.mode, { isRevealed });
  const {
    backFaceStyle,
    backGlowStyle,
    chargeGlowStyle,
    chargeProgress,
    foilStyle,
    frontFaceStyle,
    setPressingState,
    shellStyle,
    updateTiltFromDelta,
  } = useRevealCardAnimation({ isLocalReady, isRevealed, mode: content.mode });

  const isDisabled = !player || isLocalReady;
  const callbacksRef = useRef({
    isDisabled,
    onInteractionChange,
    onPressIn,
    onPressOut,
    setPressingState,
    updateTiltFromDelta,
  });
  callbacksRef.current = {
    isDisabled,
    onInteractionChange,
    onPressIn,
    onPressOut,
    setPressingState,
    updateTiltFromDelta,
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !callbacksRef.current.isDisabled,
        onMoveShouldSetPanResponder: () => !callbacksRef.current.isDisabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          callbacksRef.current.onInteractionChange?.(true);
          callbacksRef.current.setPressingState(true);
          callbacksRef.current.onPressIn();
        },
        onPanResponderMove: (_evt, gestureState) => {
          callbacksRef.current.updateTiltFromDelta(gestureState.dx, gestureState.dy);
        },
        onPanResponderRelease: () => {
          callbacksRef.current.setPressingState(false);
          callbacksRef.current.onPressOut();
          callbacksRef.current.onInteractionChange?.(false);
        },
        onPanResponderTerminate: () => {
          callbacksRef.current.setPressingState(false);
          callbacksRef.current.onPressOut();
          callbacksRef.current.onInteractionChange?.(false);
        },
      }),
    []
  );

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? (player ? player.name : copy.waitingLabel)}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={styles.touchRoot}
      {...panResponder.panHandlers}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.cardBackGlow,
          backGlowStyle,
          { backgroundColor: visuals.chargeShadowColor },
        ]}
      />

      <Animated.View style={[styles.cardStage, shellStyle]}>
        <Animated.View
          style={[
            styles.cardFaceShell,
            ELEVATION_STYLES.hero,
            frontFaceStyle,
            {
              backgroundColor: '#FFFFFF',
              borderColor: visuals.shellBorderColor,
            },
          ]}>
          <View
            pointerEvents="none"
            style={[styles.cardInset, { backgroundColor: '#F8FAFF' }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.chargeGlowBorder,
              chargeGlowStyle,
              { borderColor: visuals.chargeBorderColor },
            ]}
          />
          <View
            pointerEvents="none"
            style={[styles.cardFrameOuter, { borderColor: visuals.shellFrameOuterColor }]}
          />
          <RevealCardChargeFrame chargeProgress={chargeProgress} visuals={visuals} />
          <RevealCardFrontFace
            chargeProgress={chargeProgress}
            copy={copy}
            frontFaceStyle={styles.faceInnerReset}
            player={player}
            theme={theme}
            visuals={visuals}
            waitingLabel={copy.waitingLabel}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFaceShell,
            ELEVATION_STYLES.hero,
            backFaceStyle,
            {
              backgroundColor: visuals.shellBackgroundColor,
              borderColor: visuals.shellBorderColor,
            },
          ]}>
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
          <Animated.View pointerEvents="none" style={[styles.foilBandWrap, foilStyle]}>
            <LinearGradient
              colors={visuals.foilColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.foilBand}
            />
          </Animated.View>
          <RevealCardBackFace
            backFaceStyle={styles.faceInnerReset}
            content={content}
            copy={copy}
            player={player}
            theme={theme}
            visuals={visuals}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
