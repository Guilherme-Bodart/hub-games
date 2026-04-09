import { Text, View } from 'react-native';

import { CluesComposerDock } from '@/src/features/games/impostor/components/CluesComposerDock';
import { CluesHeroPanel } from '@/src/features/games/impostor/components/CluesHeroPanel';
import { useImpostorCluesPhaseViewModel } from '@/src/features/games/impostor/hooks/useImpostorCluesPhaseViewModel';
import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { ThemeTokens } from '@/src/theme/types';
import { PlayerClueCard } from './PlayerClueCard';

type CluesPhaseProps = {
  round: ImpostorRound;
  isPt: boolean;
  theme: ThemeTokens;
  isClueCycleComplete: boolean;
  activeTurnName: string;
  activeTurnId: string | null;
  clueProgress: number;
  clueSubmittedCount: number;
  typingLabel: string;
  canSubmitClue: boolean;
  clueTurnLabel: string;
  clueInput: string;
  onChangeClueInput: (value: string) => void;
  onSubmitClue: () => void;
  onProceedDecision: () => void;
  submitLabel: string;
  proceedLabel: string;
  isProceedDisabled: boolean;
};

export function ImpostorCluesPhase({
  round,
  isPt,
  theme,
  isClueCycleComplete,
  activeTurnName,
  activeTurnId,
  clueProgress,
  clueSubmittedCount,
  typingLabel,
  canSubmitClue,
  clueTurnLabel,
  clueInput,
  onChangeClueInput,
  onSubmitClue,
  onProceedDecision,
  submitLabel,
  proceedLabel,
  isProceedDisabled,
}: CluesPhaseProps) {
  const viewModel = useImpostorCluesPhaseViewModel({
    round,
    isPt,
    activeTurnId,
    activeTurnName,
    clueSubmittedCount,
    clueProgress,
    isClueCycleComplete,
    canSubmitClue,
    typingLabel,
  });

  return (
    <View style={styles.section}>
      <CluesHeroPanel
        theme={theme}
        eyebrow={viewModel.headerEyebrow}
        title={viewModel.headerTitle}
        hint={viewModel.headerHint}
        progressLabel={clueTurnLabel}
        progressWidth={viewModel.progressWidth}
        progressSteps={viewModel.progressSteps}>
        <CluesComposerDock
          theme={theme}
          canSubmitClue={canSubmitClue}
          isClueCycleComplete={isClueCycleComplete}
          clueInput={clueInput}
          inputLabel={viewModel.inputLabel}
          inputPlaceholder={isPt ? 'Digite uma palavra' : 'Type one word'}
          helperText={viewModel.composerHelperText}
          submitLabel={submitLabel}
          proceedLabel={proceedLabel}
          isProceedDisabled={isProceedDisabled}
          onChangeClueInput={onChangeClueInput}
          onSubmitClue={onSubmitClue}
          onProceedDecision={onProceedDecision}
        />
      </CluesHeroPanel>

      <View style={styles.rosterSection}>
        <View style={styles.rosterHeader}>
          <Text
            style={[
              styles.rosterEyebrow,
              {
                color: theme.semantic.text.muted,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {viewModel.rosterEyebrow}
          </Text>
          <Text
            style={[
              styles.rosterTitle,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {viewModel.rosterTitle}
          </Text>
        </View>

        <View style={styles.grid}>
          {viewModel.cards.map((card) => (
            <View key={`slot-${card.player.id}`} style={[styles.cardCell, { width: card.width }]}>
              <PlayerClueCard
                player={card.player}
                clue={card.clue}
                previousClues={card.previousClues}
                playerLabel={undefined}
                statusLabel={card.statusLabel}
                emphasisLabel={card.emphasisLabel}
                historyLabel={card.historyLabel}
                tone={card.tone}
                theme={theme}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
