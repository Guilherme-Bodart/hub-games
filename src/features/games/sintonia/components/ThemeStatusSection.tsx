import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

type SintoniaThemeStatusSectionProps = {
  theme: ThemeTokens;
  roundTheme: string;
  titleFlickerStyle: any;
  themeShineStyle: any;
  themeGlowStyle: any;
  voiceNoticeLabel: string;
  hostHintLabel: string;
  realtimeError: string | null;
  canAdvancePhase: boolean;
};

export function SintoniaThemeStatusSection({
  theme,
  roundTheme,
  titleFlickerStyle,
  themeShineStyle,
  themeGlowStyle,
  voiceNoticeLabel,
  hostHintLabel,
  realtimeError,
  canAdvancePhase,
}: SintoniaThemeStatusSectionProps) {
  return (
    <>
      <Animated.View
        style={[
          styles.themeWrap,
          {
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.78),
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.62),
            shadowColor: withAlpha(theme.semantic.button.primary.bg, 0.95),
          },
          themeGlowStyle,
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.themeShineSweep,
            themeShineStyle,
            { backgroundColor: withAlpha(theme.semantic.text.primary, 0.12) },
          ]}
        />
        <Animated.Text
          style={[
            styles.themeText,
            titleFlickerStyle,
            {
              color: theme.semantic.text.primary,
              textShadowColor: withAlpha(theme.semantic.button.primary.bg, 0.58),
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {roundTheme}
        </Animated.Text>
      </Animated.View>

      <View
        style={[
          styles.voiceNotice,
          {
            borderColor: theme.semantic.border.subtle,
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.7),
          },
        ]}>
        <Text
          style={[
            styles.voiceNoticeText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {voiceNoticeLabel}
        </Text>
      </View>

      {!canAdvancePhase ? (
        <Text
          style={[
            styles.hostHintText,
            {
              color: theme.semantic.status.warning,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {hostHintLabel}
        </Text>
      ) : null}

      {realtimeError ? (
        <Text
          style={[
            styles.hostHintText,
            {
              color: theme.semantic.status.warning,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {realtimeError}
        </Text>
      ) : null}
    </>
  );
}
