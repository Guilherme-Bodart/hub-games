import { ScrollView, Text, View } from 'react-native';

import { OrderingCard } from '@/src/features/games/sintonia/components/OrderingCard';
import { SecretPlayerCard } from '@/src/features/games/sintonia/components/SecretPlayerCard';
import { SintoniaPhase, SintoniaPlayer, SintoniaRevealFeedback } from '@/src/features/games/sintonia/types';
import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Badge } from '@/src/ui/atoms';

type SintoniaBoardSectionProps = {
  orderedPlayers: SintoniaPlayer[];
  phase: SintoniaPhase;
  activeSecretPlayerId: string | null;
  revealedById: Record<string, SintoniaRevealFeedback>;
  theme: ThemeTokens;
  secretGridColumns: number;
  orderingGridColumns: number;
  isCompactViewport: boolean;
  playersSectionLabel: string;
  playersBadgeLabel: string;
  emptyCardsLabel: string;
  holdHintLabel: string;
  hiddenNumberLabel: string;
  onSecretPressIn: (player: SintoniaPlayer) => void;
  onSecretPressOut: (playerId: string) => void;
  onOrderingCardMeasure: (layout: { width: number; height: number }) => void;
  onDropPlayer: (playerId: string, dragX: number, dragY: number) => boolean;
};

export function SintoniaBoardSection({
  orderedPlayers,
  phase,
  activeSecretPlayerId,
  revealedById,
  theme,
  secretGridColumns,
  orderingGridColumns,
  isCompactViewport,
  playersSectionLabel,
  playersBadgeLabel,
  emptyCardsLabel,
  holdHintLabel,
  hiddenNumberLabel,
  onSecretPressIn,
  onSecretPressOut,
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
        {phase === 'secrets' ? (
          <ScrollView contentContainerStyle={styles.secretGrid} showsVerticalScrollIndicator={false} bounces>
            {orderedPlayers.map((player) => (
              <SecretPlayerCard
                key={player.id}
                player={player}
                columns={secretGridColumns}
                compact={isCompactViewport}
                holdHintLabel={holdHintLabel}
                isRevealed={activeSecretPlayerId === player.id}
                canReveal={player.isLocalDevice}
                onPressIn={() => onSecretPressIn(player)}
                onPressOut={() => onSecretPressOut(player.id)}
              />
            ))}
          </ScrollView>
        ) : (
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
                isDragEnabled={phase === 'ordering'}
                onDrop={onDropPlayer}
                hiddenNumberLabel={hiddenNumberLabel}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}

