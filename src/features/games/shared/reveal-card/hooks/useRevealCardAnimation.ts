import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { RevealCardMode } from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { triggerHaptic } from '@/src/ui/feedback';
import { useReducedMotion } from '@/src/ui/motion';

type UseRevealCardAnimationParams = {
  isLocalReady: boolean;
  isRevealed: boolean;
  mode: RevealCardMode;
};

const HOLD_CHARGE_DURATION_MS = 750;
const MAX_TILT_DEG = 10;

export function useRevealCardAnimation({
  isLocalReady,
  isRevealed,
  mode,
}: UseRevealCardAnimationParams) {
  const reduceMotion = useReducedMotion();
  const [isPressing, setIsPressing] = useState(false);
  const chargeProgress = useSharedValue(0);
  const flipProgress = useSharedValue(isRevealed ? 1 : 0);
  const pressScale = useSharedValue(1);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const midChargeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRevealedRef = useRef(isRevealed);

  const clearMidChargeTimer = useCallback(() => {
    if (midChargeTimerRef.current) {
      clearTimeout(midChargeTimerRef.current);
      midChargeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearMidChargeTimer, [clearMidChargeTimer]);

  useEffect(() => {
    const didReveal = isRevealed && !prevRevealedRef.current;
    prevRevealedRef.current = isRevealed;

    if (didReveal) {
      triggerHaptic(mode === 'impostor' ? 'impactHeavy' : 'impactMedium');
    }

    if (!isRevealed) {
      tiltX.value = withSpring(0, { damping: 18, stiffness: 220 });
      tiltY.value = withSpring(0, { damping: 18, stiffness: 220 });
    }

    if (reduceMotion) {
      flipProgress.value = withTiming(isRevealed ? 1 : 0, { duration: 180 });
      return;
    }

    flipProgress.value = withSpring(isRevealed ? 1 : 0, {
      damping: 18,
      stiffness: 170,
      mass: 0.85,
    });
  }, [flipProgress, isRevealed, mode, reduceMotion, tiltX, tiltY]);

  const setPressingState = useCallback(
    (nextValue: boolean) => {
      setIsPressing(nextValue);
      clearMidChargeTimer();

      if (nextValue && !isLocalReady) {
        triggerHaptic('impactLight');
        if (!reduceMotion) {
          pressScale.value = withSpring(0.97, { damping: 20, stiffness: 280 });
        }
        chargeProgress.value = withTiming(1, {
          duration: HOLD_CHARGE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        });
        midChargeTimerRef.current = setTimeout(() => {
          triggerHaptic('selection');
        }, 350);
        return;
      }

      pressScale.value = withSpring(1, { damping: 18, stiffness: 240 });
      tiltX.value = withSpring(0, { damping: 18, stiffness: 220 });
      tiltY.value = withSpring(0, { damping: 18, stiffness: 220 });
      chargeProgress.value = withTiming(isRevealed ? 1 : 0, {
        duration: nextValue ? 120 : 180,
        easing: Easing.out(Easing.quad),
      });
    },
    [chargeProgress, clearMidChargeTimer, isLocalReady, isRevealed, pressScale, reduceMotion, tiltX, tiltY]
  );

  const updateTiltFromDelta = useCallback(
    (dx: number, dy: number) => {
      if (reduceMotion || !isRevealed) {
        return;
      }
      const clampedY = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, (dx / 110) * MAX_TILT_DEG));
      const clampedX = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, (-dy / 130) * MAX_TILT_DEG));
      tiltX.value = clampedX;
      tiltY.value = clampedY;
    },
    [isRevealed, reduceMotion, tiltX, tiltY]
  );

  const shellStyle = useAnimatedStyle(() => {
    const flipLift = reduceMotion
      ? 1
      : interpolate(flipProgress.value, [0, 0.5, 1], [1, 1.035, 1]);
    return {
      transform: [{ scale: pressScale.value * flipLift }],
    };
  });

  const chargeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeProgress.value, [0, 0.08, 1], [0, 0.45, 1]),
  }));

  const backGlowStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : interpolate(chargeProgress.value, [0, 0.12, 1], [0, 0.22, 0.55]),
    transform: [
      { scaleX: interpolate(chargeProgress.value, [0, 1], [0.88, 1.04]) },
      { scaleY: interpolate(chargeProgress.value, [0, 1], [0.88, 1.06]) },
    ],
  }));

  const frontFaceStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: reduceMotion
        ? []
        : [{ perspective: 1100 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipProgress.value, [0, 0.48, 0.5, 1], [1, 1, 0, 0]),
    };
  });

  const backFaceStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: reduceMotion
        ? []
        : [
            { perspective: 1100 },
            { rotateX: `${tiltX.value}deg` },
            { rotateY: `${rotateY + tiltY.value}deg` },
          ],
      opacity: interpolate(flipProgress.value, [0, 0.5, 0.52, 1], [0, 0, 1, 1]),
    };
  });

  const foilStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 0 };
    }
    const baseShift = interpolate(flipProgress.value, [0, 0.5, 1], [-220, 0, 160]);
    const tiltShift = tiltY.value * 14 + tiltX.value * 6;
    const tiltEnergy = (Math.abs(tiltX.value) + Math.abs(tiltY.value)) / (MAX_TILT_DEG * 2);
    const sweepOpacity = Math.min(
      0.85,
      interpolate(flipProgress.value, [0, 0.45, 0.65, 1], [0, 0.25, 0.72, 0.34]) +
        tiltEnergy * 0.45
    );
    return {
      opacity: sweepOpacity,
      transform: [{ translateX: baseShift + tiltShift }, { rotate: '-22deg' }],
    };
  });

  return {
    backFaceStyle,
    backGlowStyle,
    chargeGlowStyle,
    chargeProgress,
    foilStyle,
    frontFaceStyle,
    isPressing,
    setPressingState,
    shellStyle,
    updateTiltFromDelta,
  };
}
