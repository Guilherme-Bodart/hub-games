import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { type GameCatalogItem } from '@/src/features/catalog';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { withAlpha } from '@/src/theme/utils';

type CatalogGameGridProps = {
  games: GameCatalogItem[];
  isBusy: boolean;
  onOpenGame: (game: GameCatalogItem) => void;
};

type CatalogGameTileProps = {
  game: GameCatalogItem;
  index: number;
  tileHeight: number;
  locale: ReturnType<typeof useI18n>['locale'];
  t: ReturnType<typeof useI18n>['t'];
  isBusy: boolean;
  onOpenGame: (game: GameCatalogItem) => void;
};

const resolveCardTone = (index: number) => (index % 2 === 0 ? styles.cardPurple : styles.cardCyan);

const resolveModeSymbols = (mode: GameCatalogItem['mode']) => {
  if (mode === 'both') {
    return [
      { ios: 'iphone', android: 'smartphone', web: 'smartphone' } as const,
      { ios: 'globe', android: 'language', web: 'language' } as const,
    ];
  }

  if (mode === 'remote') {
    return [{ ios: 'globe', android: 'language', web: 'language' } as const];
  }

  return [{ ios: 'iphone', android: 'smartphone', web: 'smartphone' } as const];
};

function CatalogGameTile({
  game,
  index,
  tileHeight,
  locale,
  t,
  isBusy,
  onOpenGame,
}: CatalogGameTileProps) {
  const title = game.id === 'impostor-neon' ? 'IMPOSTOR' : game.title[locale].toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('catalog.openGameA11y', { game: game.title[locale] })}
      onPress={() => onOpenGame(game)}
      disabled={isBusy}
      style={({ pressed }) => [
        styles.gameTilePressable,
        { height: tileHeight },
        {
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}>
      <View style={[styles.gameTileSimple, resolveCardTone(index), { height: tileHeight }]}>
        {game.coverImage ? (
          <View style={styles.gameTileCoverFrame}>
            <Image
              source={game.coverImage}
              resizeMode="cover"
              style={styles.gameTileCoverImage}
            />
          </View>
        ) : null}
        <View style={styles.gameTileImageOverlay} />
        <LinearGradient
          colors={[
            withAlpha('#FFFFFF', 0.18),
            withAlpha(game.coverTone, 0.12),
            withAlpha('#FFFFFF', 0),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gameTileGlow}
        />
        <View style={styles.gameTileTopRow}>
          <Text style={styles.gameTileSimpleLabel}>{title}</Text>
        </View>

        <View style={styles.gameTileBody} />

        <View style={styles.gameTileFooter}>
          <View style={styles.gameModeBadge}>
            {resolveModeSymbols(game.mode).map((symbolName, iconIndex) => (
              <SymbolView
                key={`${game.id}-mode-${iconIndex}`}
                name={symbolName}
                size={12}
                tintColor="#2B2A46"
              />
            ))}
          </View>
          <View style={styles.gamePlayersBadge}>
            <SymbolView
              name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
              size={12}
              tintColor="#2B2A46"
            />
            <Text style={styles.gamePlayersBadgeText}>
              {`${game.players.min}-${game.players.max}`}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function CatalogGameGrid({ games, isBusy, onOpenGame }: CatalogGameGridProps) {
  const { locale, t } = useI18n();
  const tileHeight = 280;
  const rows = useMemo(() => {
    const nextRows: GameCatalogItem[][] = [];

    for (let index = 0; index < games.length; index += 2) {
      nextRows.push(games.slice(index, index + 2));
    }

    return nextRows;
  }, [games]);

  return (
    <View style={styles.gameGrid}>
      {rows.map((row, rowIndex) => (
        <View
          key={`catalog-row-${rowIndex}`}
          style={[
            styles.gameGridRow,
            row.length === 1 ? styles.gameGridRowSingle : null,
          ]}>
          {row.map((game, columnIndex) => (
            <View
              key={`${game.id}-${rowIndex}-${columnIndex}`}
              style={[
                styles.gameGridCell,
                { height: tileHeight },
                columnIndex === row.length - 1 ? null : styles.gameGridCellGap,
              ]}>
              <CatalogGameTile
                game={game}
                index={rowIndex * 2 + columnIndex}
                tileHeight={tileHeight}
                locale={locale}
                t={t}
                isBusy={isBusy}
                onOpenGame={onOpenGame}
              />
            </View>
          ))}
          {row.length === 1 ? <View style={[styles.gameGridCell, { height: tileHeight }]} /> : null}
        </View>
      ))}
    </View>
  );
}
