import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { secretPhaseStyles as styles } from '@/src/features/games/sintonia/styles/secretPhaseStyles';
import { ELEVATION_STYLES, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';

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
  const accent = getGameAccent('sintonia');

  return (
    <View
      style={[
        styles.scaleCard,
        ELEVATION_STYLES.card,
        {
          borderColor: theme.semantic.border.hairline,
          backgroundColor: theme.semantic.bg.surface,
        },
      ]}>
      <View style={styles.scaleHeaderRow}>
        <View
          style={[
            styles.scaleTitlePill,
            {
              backgroundColor: accent.tint,
              borderColor: theme.semantic.border.hairline,
            },
          ]}>
          <Text
            style={[
              styles.scaleTitle,
              {
                color: accent.primary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {scaleTitle}
          </Text>
        </View>
      </View>

      <View style={styles.scaleAxisRow}>
        <Text
          style={[
            styles.scaleEdgeLabel,
            {
              color: accent.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {scaleStartLabel}
        </Text>

        <View style={styles.scaleTrackWrap}>
          <View style={[styles.scaleTrack, { backgroundColor: theme.semantic.bg.subtle }]}>
            <LinearGradient
              colors={[accent.primary, theme.semantic.border.strong, theme.semantic.button.accent.bg]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.scaleTrackGradient}
            />
            <View
              style={[
                styles.scaleDotHalo,
                {
                  borderColor: theme.semantic.border.strong,
                  backgroundColor: theme.semantic.bg.surface,
                },
              ]}>
              <View style={[styles.scaleDot, { backgroundColor: accent.primary }]} />
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.scaleEdgeLabel,
            {
              color: theme.semantic.button.accent.bg,
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
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {`"${roundTheme}"`}
      </Text>
    </View>
  );
}
