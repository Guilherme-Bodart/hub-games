import { ScrollView, Text } from 'react-native';

import { DrawPassGallery } from '@/src/features/games/draw-pass/components/DrawPassGallery';
import { DrawPassHandoff } from '@/src/features/games/draw-pass/components/DrawPassHandoff';
import { DrawPassTurnCard } from '@/src/features/games/draw-pass/components/DrawPassTurnCard';
import { useDrawPassGame } from '@/src/features/games/draw-pass/hooks/useDrawPassGame';
import { drawPassStyles as styles } from '@/src/features/games/draw-pass/styles/drawPassStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { BottomActionDock, GameScreenShell, GameTopBar, Modal } from '@/src/ui/atoms';

export function DrawPassScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const accent = getGameAccent('draw-pass');
  const game = useDrawPassGame(lobby, locale);
  const { isPt, activePlayer, isDrawingTurn, isFinished, isHandoffPending } = game;

  const footer = isFinished ? (
    <BottomActionDock
      layout="row"
      primaryAction={{
        label: isPt ? 'Nova Rodada' : 'New Round',
        onPress: game.handleNewGame,
        color: accent.primary,
        plinthColor: accent.plinth,
      }}
      secondaryAction={{ label: 'Lobby', onPress: onExitLobby, variant: 'secondary' }}
    />
  ) : isHandoffPending ? (
    <BottomActionDock
      primaryAction={{
        label: isPt ? `Sou ${activePlayer?.name ?? ''}! Começar` : `I'm ${activePlayer?.name ?? ''}! Ready`,
        onPress: game.handleAcceptHandoff,
        color: accent.primary,
        plinthColor: accent.plinth,
      }}
    />
  ) : (
    <BottomActionDock
      helperText={
        isPt
          ? 'Termine sua etapa e passe o celular para o próximo jogador!'
          : 'Finish your step and pass the phone to the next player!'
      }
      layout="row"
      primaryAction={{
        label: isDrawingTurn
          ? isPt
            ? 'Pronto! Passar'
            : 'Done! Pass'
          : isPt
            ? 'Confirmar chute'
            : 'Confirm guess',
        onPress: game.handleSubmitStep,
        disabled: !game.canSubmit,
        color: accent.primary,
        plinthColor: accent.plinth,
      }}
      secondaryAction={
        isDrawingTurn && game.currentStrokes.length > 0
          ? { label: isPt ? 'Desfazer' : 'Undo', onPress: game.handleUndoStroke, variant: 'secondary' }
          : undefined
      }
    />
  );

  return (
    <GameScreenShell accentColor={accent.primary} footerInset={124} footer={footer}>
      <GameTopBar
        title={isPt ? 'Desenha e Passa' : 'Draw & Pass'}
        subtitle={
          isFinished
            ? isPt
              ? 'Galeria Completa'
              : 'Full Comic Gallery'
            : isPt
              ? `Vez de ${activePlayer?.name ?? ''} (${game.turnIndex + 1}/${game.players.length})`
              : `${activePlayer?.name ?? ''}'s turn (${game.turnIndex + 1}/${game.players.length})`
        }
        statusTone="info"
        statusLabel={!isFinished ? `${game.turnIndex + 1}/${game.players.length}` : undefined}
        onPressLeft={onExitLobby}
        onPressRight={() => game.setRulesVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isFinished || isHandoffPending || !isDrawingTurn}>
        {!isFinished && isHandoffPending && activePlayer ? (
          <DrawPassHandoff
            player={activePlayer}
            turnNumber={game.turnIndex + 1}
            totalTurns={game.players.length}
            isDrawingTurn={isDrawingTurn}
            isPt={isPt}
          />
        ) : null}

        {!isFinished && !isHandoffPending && activePlayer ? (
          <DrawPassTurnCard
            locale={locale}
            isPt={isPt}
            turnIndex={game.turnIndex}
            category={game.category}
            activePlayer={activePlayer}
            isDrawingTurn={isDrawingTurn}
            promptToDraw={game.promptToDraw}
            currentStrokes={game.currentStrokes}
            currentGuess={game.currentGuess}
            previousEntry={game.previousEntry}
            onSelectCategory={game.handleSelectCategory}
            onRerollPrompt={game.handleRerollPrompt}
            onAddStroke={game.handleAddStroke}
            onClearCanvas={game.handleClearCanvas}
            onChangeGuess={game.setCurrentGuess}
            onSubmitStep={game.handleSubmitStep}
          />
        ) : null}

        {isFinished ? <DrawPassGallery chain={game.chain} isPt={isPt} /> : null}
      </ScrollView>

      <Modal
        visible={game.rulesVisible}
        title={isPt ? 'Regras • Desenha e Passa' : 'Rules • Draw & Pass'}
        onClose={() => game.setRulesVisible(false)}>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '1. O 1º jogador vê uma frase maluca e desenha na tela.'
            : '1. The 1st player sees a crazy prompt and draws it on screen.'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '2. O próximo jogador vê APENAS o desenho (sem a frase!) e escreve o que acha que é.'
            : '2. The next player sees ONLY the drawing and writes what they think it is.'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '3. No final, todos veem a galeria completa de como a história desandou!'
            : '3. At the end, everyone sees the full gallery of how the story went off the rails!'}
        </Text>
      </Modal>
    </GameScreenShell>
  );
}
