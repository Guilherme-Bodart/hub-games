import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SintoniaPlayer } from '@/src/features/games/sintonia/types';
import { secretRevealCardStyles as styles } from '@/src/features/games/sintonia/styles/secretRevealCardStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

type SecretRevealBackFaceProps = {
  theme: ThemeTokens;
  player: SintoniaPlayer | null;
  revealedLabel: string;
  releaseHintLabel: string;
  backFaceStyle: object;
};

export function SecretRevealBackFace({
  theme,
  player,
  revealedLabel,
  releaseHintLabel,
  backFaceStyle,
}: SecretRevealBackFaceProps) {
  return (
    <Animated.View style={[styles.flipFace, backFaceStyle]}>
      {player ? (
        <>
          <View style={styles.revealedHeader}>
            <View
              style={[
                styles.revealedIconWrap,
                {
                  borderColor: withAlpha(theme.semantic.button.primary.bg, 0.38),
                  backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.14),
                },
              ]}>
              <SymbolView
                name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                size={16}
                tintColor={theme.semantic.button.primary.bg}
              />
            </View>
            <Text
              style={[
                styles.subtleLabel,
                {
                  color: withAlpha(theme.semantic.text.secondary, 0.78),
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {revealedLabel}
            </Text>
          </View>

          <View
            style={[
              styles.numberWrap,
              {
                borderColor: withAlpha(theme.semantic.button.primary.bg, 0.34),
                backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.09),
              },
            ]}>
            <Text
              style={[
                styles.numberText,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.numberFamily,
                  fontWeight: theme.semantic.typography.numberWeight,
                },
              ]}>
              {player.secretNumber}
            </Text>
          </View>
          <Text
            style={[
              styles.hintText,
              {
                color: withAlpha(theme.semantic.text.secondary, 0.82),
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {releaseHintLabel}
          </Text>
        </>
      ) : null}
    </Animated.View>
  );
}
