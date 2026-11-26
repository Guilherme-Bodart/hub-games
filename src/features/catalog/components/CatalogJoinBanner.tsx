import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/src/features/catalog/styles/catalogStyles';
import type { Locale } from '@/src/i18n';
import { ELEVATION_STYLES, HUB_DEFAULT_ACCENT, useTheme } from '@/src/theme';

type CatalogJoinBannerProps = {
  locale: Locale;
  accessibilityLabel: string;
  onPress: () => void;
};

export function CatalogJoinBanner({
  locale,
  accessibilityLabel,
  onPress,
}: CatalogJoinBannerProps) {
  const { theme } = useTheme();
  const title = locale === 'pt' ? 'Entrar com código de sala' : 'Join with room code';
  const subtitle =
    locale === 'pt'
      ? 'Recebeu um código? Entre na sala em segundos'
      : 'Got a room code? Jump into the party now';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.joinBannerPlinth,
        ELEVATION_STYLES.card,
        { backgroundColor: theme.semantic.button.secondary.plinth },
      ]}>
      {({ pressed }) => (
        <View
          style={[
            styles.joinBannerFace,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: theme.semantic.border.hairline,
              transform: [{ translateY: pressed ? 2 : 0 }],
            },
          ]}>
          <View style={styles.joinBannerLeft}>
            <View
              style={[
                styles.joinBannerIconWrap,
                { backgroundColor: HUB_DEFAULT_ACCENT.tint },
              ]}>
              <Ionicons
                name="keypad-outline"
                size={22}
                color={HUB_DEFAULT_ACCENT.primary}
              />
            </View>

            <View style={styles.joinBannerCopy}>
              <Text
                numberOfLines={1}
                style={[
                  styles.joinBannerTitle,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {title}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.joinBannerSubtitle,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {subtitle}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.joinBannerChevron,
              {
                backgroundColor: HUB_DEFAULT_ACCENT.primary,
                borderColor: HUB_DEFAULT_ACCENT.plinth,
              },
            ]}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={HUB_DEFAULT_ACCENT.textOnPrimary}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}
