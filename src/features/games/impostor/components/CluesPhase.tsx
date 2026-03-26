import { Text, View } from 'react-native';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { Button, Card, Input } from '@/src/ui/atoms';
import { ClueSlotCard } from './ClueSlotCard';

type CluesPhaseProps = {
  round: ImpostorRound;
  copy: Record<string, string>;
  isPt: boolean;
  theme: ThemeTokens;
  isClueCycleComplete: boolean;
  activeTurnName: string;
  activeTurnId: string | null;
  clueProgress: number;
  clueSubmittedCount: number;
  typingLabel: string;
  canSubmitClue: boolean;
  clueInput: string;
  isRemote: boolean;
  canControl: boolean;
  onChangeClueInput: (value: string) => void;
  onProceedDecision: () => void;
  onSubmitClue: () => void;
};

export function ImpostorCluesPhase({
  round,
  copy,
  isPt,
  theme,
  isClueCycleComplete,
  activeTurnName,
  activeTurnId,
  clueProgress,
  clueSubmittedCount,
  typingLabel,
  canSubmitClue,
  clueInput,
  isRemote,
  canControl,
  onChangeClueInput,
  onProceedDecision,
  onSubmitClue,
}: CluesPhaseProps) {
  return (
    <Card
      title={copy.clues}
      subtitle={isClueCycleComplete ? (isPt ? 'Todas as pistas enviadas' : 'All clues submitted') : activeTurnName || '-'}>
      <View style={styles.progressWrap}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.semantic.bg.surface, borderColor: theme.semantic.border.subtle },
          ]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.semantic.button.primary.bg,
                width: `${Math.round(clueProgress * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
          {isPt
            ? `${clueSubmittedCount}/${round.players.length} pistas enviadas`
            : `${clueSubmittedCount}/${round.players.length} clues submitted`}
        </Text>
      </View>

      <View style={styles.cluesGrid}>
        {round.players.map((player) => {
          const clue = round.clues[player.id];
          const isActive = activeTurnId === player.id;
          const clueHistory = round.clueHistoryByPlayer[player.id] ?? [];
          const previousClues = clue ? clueHistory.slice(0, -1) : clueHistory;

          return (
            <ClueSlotCard
              key={`slot-${player.id}`}
              player={player}
              clue={clue}
              isActive={Boolean(isActive)}
              previousClues={previousClues}
              typingLabel={typingLabel}
              waitingLabel={copy.waitingClue}
              theme={theme}
            />
          );
        })}
      </View>

      {isClueCycleComplete ? (
        <Button label={copy.goDecision} onPress={onProceedDecision} disabled={isRemote && !canControl} />
      ) : null}

      {canSubmitClue ? (
        <>
          <Input value={clueInput} onChangeText={onChangeClueInput} placeholder={copy.clueInput} style={styles.input} />
          <Button label={copy.submitClue} onPress={onSubmitClue} disabled={!clueInput.trim()} />
        </>
      ) : (
        <Text style={{ color: theme.semantic.text.muted }}>
          {isClueCycleComplete
            ? isPt
              ? 'Revise as pistas e avance quando quiser.'
              : 'Review clues and continue when ready.'
            : isPt
              ? 'Aguardando jogador da vez.'
              : 'Waiting active player.'}
        </Text>
      )}
    </Card>
  );
}
