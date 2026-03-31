import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { RevealCardBackContent } from '@/src/features/games/shared/reveal-card/components/RevealCardBackContent';
import {
  RevealCardContent,
  RevealCardCopy,
  RevealCardPlayer,
  RevealCardVisualTokens,
} from '@/src/features/games/shared/reveal-card/types/revealCard.types';
import { revealCardStyles as styles } from '@/src/features/games/shared/reveal-card/styles/revealCardStyles';
import { ThemeTokens } from '@/src/theme/types';

type RevealCardBackFaceProps = {
  backFaceStyle: object;
  content: RevealCardContent;
  copy: RevealCardCopy;
  player: RevealCardPlayer | null;
  theme: ThemeTokens;
  visuals: RevealCardVisualTokens;
};

export function RevealCardBackFace({
  backFaceStyle,
  content,
  copy,
  player,
  theme,
  visuals,
}: RevealCardBackFaceProps) {
  return (
    <Animated.View style={[styles.flipFace, backFaceStyle]}>
      {player ? (
        <>
          <View style={styles.revealedHeader}>
            <View
              style={[
                styles.revealedIconWrap,
                {
                  backgroundColor: visuals.revealHeaderBackgroundColor,
                  borderColor: visuals.revealHeaderBorderColor,
                },
              ]}>
              <SymbolView
                name={{ android: 'auto_awesome', ios: 'sparkles', web: 'auto_awesome' }}
                size={16}
                tintColor={visuals.revealHeaderTintColor}
              />
            </View>

            <Text
              style={[
                styles.subtleLabel,
                {
                  color: visuals.revealLabelColor,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {content.revealedLabel}
            </Text>
          </View>

          <RevealCardBackContent content={content} theme={theme} visuals={visuals} />

          <Text
            style={[
              styles.hintText,
              {
                color: visuals.revealHintColor,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {copy.releaseHintLabel}
          </Text>
        </>
      ) : null}
    </Animated.View>
  );
}
