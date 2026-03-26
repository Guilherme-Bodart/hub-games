import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { type GameCatalogItem } from '@/src/features/catalog';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';

type CatalogGameGridProps = {
  games: GameCatalogItem[];
  isBusy: boolean;
  onOpenGame: (game: GameCatalogItem) => void;
};

const resolveCardTone = (index: number) => (index % 2 === 0 ? styles.cardPurple : styles.cardCyan);

export function CatalogGameGrid({ games, isBusy, onOpenGame }: CatalogGameGridProps) {
  const { locale, t } = useI18n();

  const rows = useMemo(() => {
    const pairs: Array<GameCatalogItem[]> = [];

    for (let index = 0; index < games.length; index += 2) {
      pairs.push(games.slice(index, index + 2));
    }

    return pairs;
  }, [games]);

  return (
    <View style={styles.gameGrid}>
      {rows.map((row, rowIndex) => (
        <View
          key={`catalog-row-${rowIndex}`}
          style={[styles.gameGridRow, { marginBottom: rowIndex === rows.length - 1 ? 0 : 16 }]}>
          {row.map((game, columnIndex) => {
            const globalIndex = rowIndex * 2 + columnIndex;

            return (
              <Pressable
                key={`${game.id}-${rowIndex}-${columnIndex}`}
                accessibilityRole="button"
                accessibilityLabel={t('catalog.openGameA11y', { game: game.title[locale] })}
                onPress={() => onOpenGame(game)}
                disabled={isBusy}
                style={({ pressed }) => [styles.gameTilePressable, pressed ? styles.gameTilePressed : null]}>
                <View style={[styles.gameTileSimple, resolveCardTone(globalIndex)]}>
                  <Text style={styles.gameTileSimpleLabel}>
                    {game.id === 'impostor-neon' ? 'IMPOSTOR' : game.title[locale].toUpperCase()}
                  </Text>
                  <Text style={styles.gameTilePlayersTag}>
                    {t('catalog.players', { min: game.players.min, max: game.players.max }).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {row.length === 1 ? <View style={styles.gameTilePlaceholder} /> : null}
        </View>
      ))}
    </View>
  );
}
