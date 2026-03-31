import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { RevealCardVisualTokens } from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';

type RevealCardChargeFrameProps = {
  chargeProgress: SharedValue<number>;
  visuals: RevealCardVisualTokens;
};

export function RevealCardChargeFrame({
  chargeProgress,
  visuals,
}: RevealCardChargeFrameProps) {
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(chargeProgress.value, [0, 0.12, 1], [0.12, 0.48, 1]),
    shadowOpacity: 0.18 + chargeProgress.value * 0.66,
    shadowRadius: 10 + chargeProgress.value * 22,
    transform: [{ scale: interpolate(chargeProgress.value, [0, 1], [1, 1.01]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chargeFrameInnerGlow,
        glowStyle,
        {
          borderColor: visuals.chargeBorderColor,
          shadowColor: visuals.chargeShadowColor,
        },
      ]}
    />
  );
}
