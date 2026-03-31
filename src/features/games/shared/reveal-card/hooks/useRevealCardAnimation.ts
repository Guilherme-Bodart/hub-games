import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type UseRevealCardAnimationParams = {
  isLocalReady: boolean;
  isRevealed: boolean;
};

const HOLD_CHARGE_DURATION_MS = 750;

export function useRevealCardAnimation({
  isLocalReady,
  isRevealed,
}: UseRevealCardAnimationParams) {
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
    shadowOpacity: 0.18 + chargeProgress.value * 0.34,
    shadowRadius: 14 + chargeProgress.value * 24,
  }));

  const chargeGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeProgress.value, [0, 0.08, 1], [0.14, 0.36, 1]),
    shadowOpacity: 0.26 + chargeProgress.value * 0.56,
    shadowRadius: 14 + chargeProgress.value * 26,
  }));

  const backGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeProgress.value, [0, 0.08, 1], [0, 0.34, 1]),
    shadowOpacity: 0.18 + chargeProgress.value * 0.58,
    shadowRadius: 18 + chargeProgress.value * 42,
    transform: [
      { scaleX: interpolate(chargeProgress.value, [0, 1], [0.8, 1.14]) },
      { scaleY: interpolate(chargeProgress.value, [0, 1], [0.7, 1.22]) },
    ],
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.2, 0]),
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0.2, 1]),
  }));

  return {
    backFaceStyle,
    backGlowStyle,
    chargeGlowStyle,
    chargeProgress,
    frontFaceStyle,
    isPressing,
    setPressingState,
    shellStyle,
  };
}
