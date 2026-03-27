import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { secretPhaseStyles as styles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

type SecretThemeScaleCardProps = {
  theme: ThemeTokens;
  scaleTitle: string;
  scaleStartLabel: string;
  scaleEndLabel: string;
  roundTheme: string;
};

export function SecretThemeScaleCard({
  theme,
  scaleTitle,
  scaleStartLabel,
  scaleEndLabel,
  roundTheme,
}: SecretThemeScaleCardProps) {
  return (
    <View
      style={[
        styles.scaleCard,
        {
          borderColor: withAlpha(theme.semantic.border.subtle, 0.9),
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.9),
          shadowColor: withAlpha(theme.semantic.shadow.base, 0.7),
        },
      ]}>
      <LinearGradient
        pointerEvents="none"
        colors={[withAlpha('#FFFFFF', 0.6), withAlpha('#FFFFFF', 0)]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, right: 0, left: 0, height: '50%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      />

      <Text
        style={[
          styles.scaleTitle,
          {
            color: withAlpha(theme.semantic.text.secondary, 0.78),
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {scaleTitle}
      </Text>

      <View style={styles.scaleAxisRow}>
        <Text
          style={[
            styles.scaleEdgeLabel,
            {
              color: withAlpha(theme.semantic.button.primary.bg, 0.88),
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {scaleStartLabel}
        </Text>
        <View style={[styles.scaleTrack, { backgroundColor: withAlpha(theme.semantic.border.subtle, 0.94) }]}>
          <View style={[styles.scaleDot, { backgroundColor: withAlpha(theme.semantic.text.secondary, 0.72) }]} />
        </View>
        <Text
          style={[
            styles.scaleEdgeLabel,
            {
              color: withAlpha(theme.semantic.button.accent.bg, 0.9),
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {scaleEndLabel}
        </Text>
      </View>

      <Text
        style={[
          styles.scaleThemeText,
          {
            color: withAlpha(theme.semantic.text.primary, 0.95),
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        "{roundTheme}"
      </Text>
    </View>
  );
}
