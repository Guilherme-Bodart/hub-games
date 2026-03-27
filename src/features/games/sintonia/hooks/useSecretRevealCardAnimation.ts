import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type UseSecretRevealCardAnimationParams = {
  isRevealed: boolean;
  isLocalReady: boolean;
};

const HOLD_CHARGE_DURATION_MS = 1000;

export function useSecretRevealCardAnimation({
  isRevealed,
  isLocalReady,
}: UseSecretRevealCardAnimationParams) {
  const [isPressing, setIsPressing] = useState(false);
  const chargeProgress = useSharedValue(0);
  const flipProgress = useSharedValue(isRevealed ? 1 : 0);

  useEffect(() => {
    flipProgress.value = withTiming(isRevealed ? 1 : 0, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    });
  }, [flipProgress, isRevealed]);

  const setPressingState = (nextValue: boolean) => {
    setIsPressing(nextValue);

    if (nextValue && !isLocalReady) {
      chargeProgress.value = withTiming(1, {
        duration: HOLD_CHARGE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    chargeProgress.value = withTiming(isRevealed ? 1 : 0, {
      duration: nextValue ? 120 : 200,
      easing: Easing.out(Easing.quad),
    });
  };

  const shellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(chargeProgress.value, [0, 1], [1, 1.02]) }],
    shadowOpacity: 0.14 + chargeProgress.value * 0.22,
    shadowRadius: 10 + chargeProgress.value * 14,
  }));

  const chargeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeProgress.value, [0, 1], [0.08, 1]),
    shadowOpacity: 0.14 + chargeProgress.value * 0.32,
    shadowRadius: 8 + chargeProgress.value * 14,
    transform: [{ scale: interpolate(chargeProgress.value, [0, 1], [1, 1.01]) }],
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` }],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.2, 0]),
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` }],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0.2, 1]),
  }));

  return {
    isPressing,
    setPressingState,
    chargeProgress,
    shellStyle,
    chargeGlowStyle,
    frontFaceStyle,
    backFaceStyle,
  };
}
