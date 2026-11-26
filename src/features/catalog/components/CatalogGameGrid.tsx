import { useMemo } from 'react';
import { View } from 'react-native';

import type { CatalogCardVariant } from '@/src/features/catalog/catalog.types';
import { CatalogGameCard } from '@/src/features/catalog/components/CatalogGameCard';
import type { GameCatalogItem } from '@/src/features/catalog/games';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';

type CatalogGameGridProps = {
  games: GameCatalogItem[];
  isBusy: boolean;
  cardVariant?: CatalogCardVariant;
  onOpenGame: (game: GameCatalogItem) => void;
};

export function CatalogGameGrid({
  games,
  isBusy,
  cardVariant = 'grid',
  onOpenGame,
}: CatalogGameGridProps) {
  const { locale, t } = useI18n();

  const rows = useMemo(() => {
    const nextRows: GameCatalogItem[][] = [];

    for (let index = 0; index < games.length; index += 2) {
      nextRows.push(games.slice(index, index + 2));
    }

    return nextRows;
  }, [games]);

  if (cardVariant === 'wide') {
    return (
      <View style={styles.gameGrid}>
        {games.map((game) => (
          <CatalogGameCard
            key={game.id}
            game={game}
            locale={locale}
            accessibilityLabel={t('catalog.openGameA11y', { game: game.title[locale] })}
            isBusy={isBusy}
            variant="wide"
            onPress={onOpenGame}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.gameGrid}>
      {rows.map((row, rowIndex) => (
        <View key={`catalog-row-${rowIndex}`} style={styles.gameGridRow}>
          {row.map((game) => (
            <View key={game.id} style={styles.gameGridCell}>
              <CatalogGameCard
                game={game}
                locale={locale}
                accessibilityLabel={t('catalog.openGameA11y', { game: game.title[locale] })}
                isBusy={isBusy}
                variant="grid"
                onPress={onOpenGame}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.gameGridCell} /> : null}
        </View>
      ))}
    </View>
  );
}
