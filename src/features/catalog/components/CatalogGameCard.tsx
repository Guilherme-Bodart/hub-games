import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import type { CatalogCardVariant } from '@/src/features/catalog/catalog.types';
import type { GameCatalogItem } from '@/src/features/catalog/games';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import type { Locale } from '@/src/i18n';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';

type CatalogGameCardProps = {
  game: GameCatalogItem;
  locale: Locale;
  accessibilityLabel: string;
  isBusy: boolean;
  variant?: CatalogCardVariant;
  onPress: (game: GameCatalogItem) => void;
};

const resolveGameTag = (game: GameCatalogItem, locale: Locale): string => {
  if (game.mode === 'local') {
    return locale === 'pt' ? 'Local' : 'Local';
  }
  if (game.mode === 'remote') {
    return 'Online';
  }
  return locale === 'pt' ? 'Festa' : 'Party';
};

export function CatalogGameCard({
  game,
  locale,
  accessibilityLabel,
  isBusy,
  variant = 'grid',
  onPress,
}: CatalogGameCardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent(game.id);
  const title = game.title[locale];
  const playersRange = `${game.players.min}-${game.players.max}`;
  const tagLabel = resolveGameTag(game, locale);

  if (variant === 'wide') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => onPress(game)}
        disabled={isBusy}
        style={({ pressed }) => [
          styles.cardPressable,
          ELEVATION_STYLES.card,
          {
            borderRadius: theme.semantic.card.radius,
            backgroundColor: theme.semantic.bg.surface,
            opacity: isBusy
              ? theme.semantic.motion.feedback.disabledOpacity
              : pressed
                ? theme.semantic.motion.feedback.pressedOpacity
                : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}>
        <View
          style={[
            styles.wideCard,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: theme.semantic.border.hairline,
            },
          ]}>
          <View style={[styles.wideCoverWrap, { backgroundColor: accent.tint }]}>
            {game.coverImage ? (
              <Image
                source={game.coverImage}
                resizeMode="cover"
                style={styles.gridCoverImage}
              />
            ) : (
              <View style={styles.gridCoverPlaceholder}>
                <Text style={styles.gridCoverGlyph}>{game.coverGlyph}</Text>
              </View>
            )}
          </View>

          <View style={styles.wideContent}>
            <View style={styles.wideHeaderRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.gridCardTitle,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                    flexShrink: 1,
                  },
                ]}>
                {title}
              </Text>
              <View style={[styles.playersPill, { backgroundColor: accent.tint }]}>
                <Ionicons name="people" size={12} color={accent.primary} />
                <Text
                  style={[
                    styles.playersPillText,
                    {
                      color: accent.primary,
                      fontFamily: theme.semantic.typography.numberFamily,
                    },
                  ]}>
                  {playersRange}
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={2}
              style={[
                styles.wideSubtitle,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                },
              ]}>
              {game.subtitle[locale]}
            </Text>

            <View style={styles.gridCardMetaRow}>
              <View style={[styles.playersPill, { backgroundColor: accent.primary }]}>
                <Text
                  style={[
                    styles.gridAccentPillText,
                    {
                      color: accent.textOnPrimary,
                      fontFamily: theme.semantic.typography.numberFamily,
                    },
                  ]}>
                  {tagLabel}
                </Text>
              </View>
              {game.requiresVoice ? (
                <View style={[styles.voiceChip, { backgroundColor: theme.semantic.badge.warningBg }]}>
                  <Ionicons name="mic" size={12} color={theme.semantic.badge.warningText} />
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(game)}
      disabled={isBusy}
      style={({ pressed }) => [
        styles.cardPressable,
        ELEVATION_STYLES.card,
        {
          borderRadius: theme.semantic.card.radius,
          backgroundColor: theme.semantic.bg.surface,
          opacity: isBusy
            ? theme.semantic.motion.feedback.disabledOpacity
            : pressed
              ? theme.semantic.motion.feedback.pressedOpacity
              : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <View
        style={[
          styles.gridCard,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <View style={[styles.gridCoverWrap, { backgroundColor: accent.tint }]}>
          {game.coverImage ? (
            <Image
              source={game.coverImage}
              resizeMode="cover"
              style={styles.gridCoverImage}
            />
          ) : (
            <View style={styles.gridCoverPlaceholder}>
              <Text style={styles.gridCoverGlyph}>{game.coverGlyph}</Text>
            </View>
          )}

          <View style={[styles.gridAccentPillOverlay, { backgroundColor: accent.primary }]}>
            <Text
              style={[
                styles.gridAccentPillText,
                {
                  color: accent.textOnPrimary,
                  fontFamily: theme.semantic.typography.numberFamily,
                },
              ]}>
              {tagLabel}
            </Text>
          </View>
        </View>

        <View style={[styles.gridCardFooter, { backgroundColor: theme.semantic.bg.surface }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.gridCardTitle,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {title}
          </Text>

          <View style={styles.gridCardMetaRow}>
            <View style={[styles.playersPill, { backgroundColor: accent.tint }]}>
              <Ionicons name="people" size={12} color={accent.primary} />
              <Text
                style={[
                  styles.playersPillText,
                  {
                    color: accent.primary,
                    fontFamily: theme.semantic.typography.numberFamily,
                  },
                ]}>
                {playersRange}
              </Text>
            </View>

            {game.requiresVoice ? (
              <View style={[styles.voiceChip, { backgroundColor: theme.semantic.badge.warningBg }]}>
                <Ionicons name="mic" size={12} color={theme.semantic.badge.warningText} />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
