import { useMemo, useState } from 'react';
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
  const [gridWidth, setGridWidth] = useState(0);

  const tileWidth = useMemo(() => {
    const gap = 16;
    if (gridWidth <= 0) {
      return 0;
    }

    return Math.max(140, Math.floor((gridWidth - gap) / 2));
  }, [gridWidth]);

  return (
    <View
      style={styles.gameGrid}
      onLayout={(event) => {
        setGridWidth(Math.floor(event.nativeEvent.layout.width));
      }}>
      {games.map((game, index) => {
        const isLeftColumn = index % 2 === 0;
        const isLastRowSingle = games.length % 2 === 1 && index === games.length - 1;

        return (
          <Pressable
            key={`${game.id}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={t('catalog.openGameA11y', { game: game.title[locale] })}
            onPress={() => onOpenGame(game)}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.gameTilePressable,
              {
                width: tileWidth || '48.4%',
                marginRight: isLeftColumn ? 16 : 0,
                marginBottom: 16,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
              isLastRowSingle ? styles.gameTileSingleRow : null,
            ]}
          >
            <View style={[styles.gameTileSimple, resolveCardTone(index)]}>
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
    </View>
  );
}
