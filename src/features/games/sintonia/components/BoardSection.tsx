import { ScrollView, Text, View } from 'react-native';

import { OrderingCard } from '@/src/features/games/sintonia/components/OrderingCard';
import { SintoniaPlayer, SintoniaRevealFeedback } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Badge } from '@/src/ui/atoms';

type SintoniaBoardSectionProps = {
  orderedPlayers: SintoniaPlayer[];
  revealedById: Record<string, SintoniaRevealFeedback>;
  theme: ThemeTokens;
  orderingGridColumns: number;
  isCompactViewport: boolean;
  playersSectionLabel: string;
  playersBadgeLabel: string;
  emptyCardsLabel: string;
  hiddenNumberLabel: string;
  isDragEnabled: boolean;
  onOrderingCardMeasure: (layout: { width: number; height: number }) => void;
  onDropPlayer: (playerId: string, dragX: number, dragY: number) => boolean;
};

export function SintoniaBoardSection({
  orderedPlayers,
  revealedById,
  theme,
  orderingGridColumns,
  isCompactViewport,
  playersSectionLabel,
  playersBadgeLabel,
  emptyCardsLabel,
  hiddenNumberLabel,
  isDragEnabled,
  onOrderingCardMeasure,
  onDropPlayer,
}: SintoniaBoardSectionProps) {
  return (
    <>
      <View style={styles.playersMetaRow}>
        <Text
          style={[
            styles.playersSectionTitle,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {playersSectionLabel}
        </Text>
        <Badge label={playersBadgeLabel} variant="info" />
      </View>

      <View
        style={[
          styles.cardsViewport,
          {
            borderColor: withAlpha(theme.semantic.border.subtle, 0.7),
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.5),
          },
        ]}>
        {!orderedPlayers.length ? (
          <View style={styles.emptyCardsState}>
            <Text
              style={[
                styles.emptyCardsText,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {emptyCardsLabel}
            </Text>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.orderingGrid} showsVerticalScrollIndicator={false} bounces>
          {orderedPlayers.map((player, index) => (
            <OrderingCard
              key={player.id}
              index={index}
              player={player}
              onMeasure={onOrderingCardMeasure}
              columns={orderingGridColumns}
              compact={isCompactViewport}
              revealFeedback={revealedById[player.id] ?? 'hidden'}
              isDragEnabled={isDragEnabled}
              onDrop={onDropPlayer}
              hiddenNumberLabel={hiddenNumberLabel}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );
}
