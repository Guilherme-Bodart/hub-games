import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { secretRevealCardStyles as styles } from '@/src/features/games/sintonia/styles/secretRevealCardStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type SecretRevealFrontFaceProps = {
  theme: ThemeTokens;
  player: SintoniaPlayer | null;
  waitingLabel: string;
  hintLabel: string;
  chargeProgress: SharedValue<number>;
  frontFaceStyle: object;
};

export function SecretRevealFrontFace({
  theme,
  player,
  waitingLabel,
  hintLabel,
  chargeProgress,
  frontFaceStyle,
}: SecretRevealFrontFaceProps) {
  const holdProgressFillStyle = useAnimatedStyle(() => ({
    width: interpolate(chargeProgress.value, [0, 1], [0, 190]),
    opacity: interpolate(chargeProgress.value, [0, 1], [0.3, 1]),
  }));

  const avatarHaloStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + chargeProgress.value * 0.6,
    shadowRadius: 8 + chargeProgress.value * 18,
    transform: [{ scale: 1 + chargeProgress.value * 0.07 }],
  }));

  return (
    <Animated.View style={[styles.flipFace, frontFaceStyle]}>
      {player ? (
        <>
          {player.isHost ? (
            <View
              style={[
                styles.hostBadge,
                {
                  backgroundColor: withAlpha('#D7A63D', 0.14),
                  borderColor: withAlpha('#D7A63D', 0.7),
                },
              ]}>
              <SymbolView
                name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
                size={13}
                tintColor="#D7A63D"
              />
            </View>
          ) : null}

          <Animated.View
            style={[
              styles.avatarHalo,
              avatarHaloStyle,
              {
                borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
                backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.96),
                shadowColor: withAlpha(theme.semantic.button.primary.bg, 0.45),
              },
            ]}>
            <AvatarSprite avatarId={player.avatarId} size={84} />
          </Animated.View>

          <Text
            numberOfLines={1}
            style={[
              styles.playerName,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {player.name}
          </Text>
          <Text
            style={[
              styles.hintText,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {hintLabel}
          </Text>

          <View
            style={[
              styles.holdProgressTrack,
              {
                borderColor: withAlpha(theme.semantic.border.subtle, 0.8),
                backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.9),
              },
            ]}>
            <Animated.View
              style={[
                styles.holdProgressFill,
                holdProgressFillStyle,
                {
                  backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
                },
              ]}
            />
          </View>
        </>
      ) : (
        <Text
          style={[
            styles.waitingText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {waitingLabel}
        </Text>
      )}
    </Animated.View>
  );
}
