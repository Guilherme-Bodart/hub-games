import { ScrollView, Text } from 'react-native';

import { CandidatePitchCard } from '@/src/features/games/red-green-flag/components/CandidatePitchCard';
import { FlagHandPicker } from '@/src/features/games/red-green-flag/components/FlagHandPicker';
import { FlagResultCard } from '@/src/features/games/red-green-flag/components/FlagResultCard';
import { FlagRoundHeader } from '@/src/features/games/red-green-flag/components/FlagRoundHeader';
import { useRedGreenFlagGame } from '@/src/features/games/red-green-flag/hooks/useRedGreenFlagGame';
import { redGreenFlagStyles as styles } from '@/src/features/games/red-green-flag/styles/redGreenFlagStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { BottomActionDock, Button, Card, GameScreenShell, GameTopBar, Modal } from '@/src/ui/atoms';

export function RedGreenFlagScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const accent = getGameAccent('red-green-flag');
  const roseColor = accent.secondary ?? '#F43F5E';
  const rosePlinth = accent.secondaryPlinth ?? '#E11D48';
  const game = useRedGreenFlagGame(lobby, locale);
  const { isPt, phase, singlePlayer, currentCupid } = game;

  if (game.players.length < 2 || !singlePlayer) {
    return (
      <GameScreenShell accentColor={accent.primary}>
        <GameTopBar title="Red / Green Flag" onPressLeft={onExitLobby} />
        <Card
          title={isPt ? 'Jogadores insuficientes' : 'Not enough players'}
          subtitle={
            isPt
              ? 'Adicione pelo menos 2 jogadores no lobby para jogar.'
              : 'Add at least 2 players in the lobby to play.'
          }>
          <Button label={isPt ? 'Voltar ao lobby' : 'Back to lobby'} onPress={onExitLobby} />
        </Card>
      </GameScreenShell>
    );
  }

  const footer =
    phase === 'building' && game.isCupidHandoff ? (
      <BottomActionDock
        primaryAction={{
          label: isPt ? `Sou ${currentCupid?.name ?? ''}! Montar` : `I'm ${currentCupid?.name ?? ''}! Ready`,
          onPress: game.handleAcceptCupidHandoff,
          color: accent.primary,
          plinthColor: accent.plinth,
        }}
      />
    ) : phase === 'building' ? (
      <BottomActionDock
        helperText={
          isPt
            ? `Vez de ${currentCupid?.name ?? ''} montar um pretendente para ${singlePlayer.name}`
            : `${currentCupid?.name ?? ''}'s turn to build a date for ${singlePlayer.name}`
        }
        primaryAction={{
          label: isPt ? 'Confirmar Pretendente' : 'Confirm Candidate',
          onPress: game.handleConfirmCandidate,
          disabled: !game.selectedGreen || !game.selectedRed,
          color: accent.primary,
          plinthColor: accent.plinth,
        }}
      />
    ) : phase === 'pitching' ? (
      <BottomActionDock
        helperText={
          isPt
            ? `${singlePlayer.name}, ouça as defesas e escolha com qual pretendente você fica!`
            : `${singlePlayer.name}, listen to the pitches and pick your match!`
        }
        primaryAction={{
          label: isPt ? 'Dar Match e Revelar' : 'Match & Reveal',
          onPress: game.handleConfirmMatch,
          disabled: !game.winningCupidId,
          color: roseColor,
          plinthColor: rosePlinth,
        }}
      />
    ) : (
      <BottomActionDock
        layout="row"
        primaryAction={{
          label: isPt ? 'Próximo Solteiro(a)' : 'Next Single',
          onPress: game.handleStartNextRound,
          color: accent.primary,
          plinthColor: accent.plinth,
        }}
        secondaryAction={{ label: 'Lobby', onPress: onExitLobby, variant: 'secondary' }}
      />
    );

  return (
    <GameScreenShell accentColor={accent.primary} footerInset={124} footer={footer}>
      <GameTopBar
        title="Red / Green Flag"
        subtitle={
          phase === 'building'
            ? isPt
              ? `Cupido ${game.activeCupidTurn + 1} de ${game.cupids.length}`
              : `Cupid ${game.activeCupidTurn + 1} of ${game.cupids.length}`
            : phase === 'pitching'
              ? isPt
                ? 'Hora de vender o peixe!'
                : 'Pitch time!'
              : isPt
                ? 'Match Revelado!'
                : 'Match Revealed!'
        }
        statusTone={phase === 'pitching' ? 'error' : 'success'}
        onPressLeft={onExitLobby}
        onPressRight={() => game.setRulesVisible(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FlagRoundHeader
          locale={locale}
          isPt={isPt}
          singlePlayer={singlePlayer}
          category={game.category}
          showControls={phase === 'building' && !game.isCupidHandoff}
          onSelectCategory={game.handleSelectCategory}
          onRerollHand={game.handleRerollHand}
        />

        {phase === 'building' && currentCupid ? (
          <FlagHandPicker
            cupid={currentCupid}
            singleName={singlePlayer.name}
            cupidTurnNumber={game.activeCupidTurn + 1}
            totalCupids={game.cupids.length}
            isHandoffPending={game.isCupidHandoff}
            greens={game.currentHand.greens}
            reds={game.currentHand.reds}
            selectedGreen={game.selectedGreen}
            selectedRed={game.selectedRed}
            isPt={isPt}
            onSelectGreen={game.handleSelectGreen}
            onSelectRed={game.handleSelectRed}
          />
        ) : null}

        {phase === 'pitching' ? (
          <CandidatePitchCard
            submissions={game.submissions}
            singleName={singlePlayer.name}
            winningCupidId={game.winningCupidId}
            isPt={isPt}
            onSelectWinner={game.handleSelectWinner}
          />
        ) : null}

        {phase === 'result' && game.winningSubmission ? (
          <FlagResultCard singlePlayer={singlePlayer} winningSubmission={game.winningSubmission} isPt={isPt} />
        ) : null}
      </ScrollView>

      <Modal
        visible={game.rulesVisible}
        title={isPt ? 'Regras • Red Flag / Green Flag' : 'Rules • Red Flag / Green Flag'}
        onClose={() => game.setRulesVisible(false)}>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '1. A cada rodada, 1 jogador é o Solteiro(a) e todos os outros são Cupidos.'
            : '1. Each round, 1 player is the Single and everyone else is a Cupid.'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '2. Cada Cupido escolhe 1 Green Flag (qualidade perfeita) + 1 Red Flag (defeito bizarro).'
            : '2. Each Cupid picks 1 Green Flag + 1 Red Flag from their hand.'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '3. Todos defendem seus pretendentes em voz alta e o Solteiro(a) escolhe o Match!'
            : '3. Everyone pitches out loud and the Single picks the winning Match!'}
        </Text>
      </Modal>
    </GameScreenShell>
  );
}
