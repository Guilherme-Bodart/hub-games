import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import {
  RevealCardCopy,
  RevealCardPlayer,
  RevealCardVisualTokens,
} from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite } from '@/src/ui/atoms';

type RevealCardFrontFaceProps = {
  chargeProgress: SharedValue<number>;
  copy: RevealCardCopy;
  frontFaceStyle: object;
  player: RevealCardPlayer | null;
  theme: ThemeTokens;
  visuals: RevealCardVisualTokens;
  waitingLabel: string;
};

export function RevealCardFrontFace({
  chargeProgress,
  copy,
  frontFaceStyle,
  player,
  theme,
  visuals,
  waitingLabel,
}: RevealCardFrontFaceProps) {
  const avatarHaloStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.2 + chargeProgress.value * 0.6,
    shadowRadius: 8 + chargeProgress.value * 18,
    transform: [{ scale: 1 + chargeProgress.value * 0.07 }],
  }));
  const progressFillStyle = useAnimatedStyle(() => ({
    width: 16 + chargeProgress.value * 160,
    opacity: 0.36 + chargeProgress.value * 0.64,
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + chargeProgress.value * 0.28,
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
                  backgroundColor: visuals.hostBadgeBackgroundColor,
                  borderColor: visuals.hostBadgeBorderColor,
                },
              ]}>
              <SymbolView
                name={{ android: 'crown', ios: 'crown.fill', web: 'crown' }}
                size={13}
                tintColor={visuals.hostBadgeTintColor}
              />
            </View>
          ) : null}

          <Animated.View
            style={[
              styles.avatarHalo,
              avatarHaloStyle,
              {
                backgroundColor: visuals.avatarHaloBackgroundColor,
                borderColor: visuals.avatarHaloBorderColor,
                shadowColor: visuals.avatarHaloShadowColor,
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

          <Animated.Text
            style={[
              styles.frontHintText,
              hintStyle,
              {
                color: visuals.hintTextColor,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {copy.holdHintLabel}
          </Animated.Text>

          <View
            style={[
              styles.holdProgressTrack,
              {
                backgroundColor: visuals.holdProgressTrackBackgroundColor,
                borderColor: visuals.holdProgressTrackBorderColor,
              },
            ]}>
            <Animated.View
              style={[
                styles.holdProgressFill,
                progressFillStyle,
                { backgroundColor: visuals.holdProgressFillColor },
              ]}
            />
          </View>
        </>
      ) : (
        <Text
          style={[
            styles.waitingText,
            {
              color: visuals.waitingTextColor,
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
