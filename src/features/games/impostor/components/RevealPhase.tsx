import { Text, View } from 'react-native';

import { RevealCard } from '@/src/features/games/shared/reveal-card';
import { revealPhaseStyles as styles } from '@/src/features/games/impostor/styles/revealPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Badge, Button } from '@/src/ui/atoms';

type RevealPhaseProps = {
  round: ImpostorRound;
  copy: Record<string, string>;
  isPt: boolean;
  theme: ThemeTokens;
  heldRevealId: string | null;
  revealPlayerIndex: number;
  currentRevealPlayer: ImpostorRound['players'][number] | null;
  hasMoreRevealPlayers: boolean;
  localRevealPlayers: ImpostorRound['players'];
  canControl: boolean;
  isRemote: boolean;
  onPressRevealIn: (playerId: string) => void;
  onPressRevealOut: (playerId: string) => void;
  onAdvanceRevealPlayer: () => void;
  onGoClues: () => void;
};

export function ImpostorRevealPhase({
  round,
  copy,
  isPt,
  theme,
  heldRevealId,
  revealPlayerIndex,
  currentRevealPlayer,
  hasMoreRevealPlayers,
  localRevealPlayers,
  canControl,
  isRemote,
  onPressRevealIn,
  onPressRevealOut,
  onAdvanceRevealPlayer,
  onGoClues,
}: RevealPhaseProps) {
  const currentPlayerLabel = currentRevealPlayer
    ? `${copy.revealPlayerProgress} ${revealPlayerIndex + 1}/${Math.max(localRevealPlayers.length, 1)}`
    : copy.revealWaitingLabel;

  if (!currentRevealPlayer) {
    return (
      <View
        style={[
          styles.emptyState,
          {
            backgroundColor: withAlpha(theme.semantic.bg.surface, 0.94),
            borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
          },
        ]}>
        <Text
          style={[
            styles.emptyStateText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {copy.revealEmptyLabel}
        </Text>
      </View>
    );
  }

  const isImpostor = currentRevealPlayer.isImpostor;
  const actionLabel = hasMoreRevealPlayers ? copy.revealNextPlayer : copy.goClues;

  return (
    <View style={styles.singleCardStage}>
      <View style={styles.metaRow}>
        <Badge label={copy.reveal} variant="info" />
        <Badge label={currentPlayerLabel} variant="neutral" />
      </View>

      <Text
        style={[
          styles.passLabel,
          {
            color: theme.semantic.text.muted,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {copy.revealPassLabel}
      </Text>
      <Text
        style={[
          styles.playerName,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {currentRevealPlayer.name}
      </Text>
      <Text
        style={[
          styles.playerHint,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {copy.revealStageHint}
      </Text>

      <RevealCard
        key={`reveal-card-${currentRevealPlayer.id}-${revealPlayerIndex}`}
        accessibilityLabel={`${isPt ? 'Carta secreta de' : 'Secret card for'} ${currentRevealPlayer.name}`}
        content={{
          mode: isImpostor ? 'impostor' : 'secret',
          revealedLabel: isImpostor ? copy.revealImpostorPromptLabel : copy.revealCivilPromptLabel,
          value: isImpostor ? round.impostorPrompt : round.civilPrompt,
        }}
        copy={{
          chargingLabel: copy.holdRevealHint,
          holdHintLabel: copy.holdRevealHint,
          releaseHintLabel: copy.releaseRevealHint,
          waitingLabel: copy.revealWaitingLabel,
        }}
        isLocalReady={false}
        isRevealed={heldRevealId === currentRevealPlayer.id}
        onPressIn={() => onPressRevealIn(currentRevealPlayer.id)}
        onPressOut={() => onPressRevealOut(currentRevealPlayer.id)}
        player={currentRevealPlayer}
        theme={theme}
      />

      <View style={styles.actionPanel}>
        <Button
          label={actionLabel}
          onPress={hasMoreRevealPlayers ? onAdvanceRevealPlayer : onGoClues}
          disabled={!hasMoreRevealPlayers && isRemote && !canControl}
          size="lg"
        />
        <Text
          style={[
            styles.actionPanelHint,
            {
              color: theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
            {hasMoreRevealPlayers
              ? isPt
                ? 'Depois de memorizar, passe o celular para o próximo jogador.'
                : 'After memorizing, pass the phone to the next player.'
              : isRemote && !canControl
                ? copy.hostOnly
                : isPt
                  ? 'Quando o último jogador terminar, siga para as pistas.'
                  : 'Once the last player is done, continue to clues.'}
        </Text>
      </View>
    </View>
  );
}
