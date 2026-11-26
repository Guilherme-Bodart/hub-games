import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ForbiddenScoreboard } from '@/src/features/games/forbidden-word/components/ForbiddenScoreboard';
import { ForbiddenTurnSummary } from '@/src/features/games/forbidden-word/components/ForbiddenTurnSummary';
import { ForbiddenWordCard } from '@/src/features/games/forbidden-word/components/ForbiddenWordCard';
import { FORBIDDEN_CATEGORIES } from '@/src/features/games/forbidden-word/content';
import { useForbiddenWordGame } from '@/src/features/games/forbidden-word/hooks/useForbiddenWordGame';
import { forbiddenWordStyles as styles } from '@/src/features/games/forbidden-word/styles/forbiddenWordStyles';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { getGameAccent, useTheme } from '@/src/theme';
import { BottomActionDock, GameScreenShell, GameTopBar, Modal } from '@/src/ui/atoms';

export function ForbiddenWordScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const accent = getGameAccent('forbidden-word');
  const game = useForbiddenWordGame(lobby, locale);
  const { isPt, activeSpeaker, isTurnRunning, isPreTurn, isTurnOver } = game;

  const footer = isPreTurn ? (
    <BottomActionDock
      helperText={
        isPt
          ? `Passe o celular para ${activeSpeaker?.name ?? ''}. Um rival vigia por cima do ombro!`
          : `Pass the phone to ${activeSpeaker?.name ?? ''}. A rival watches over their shoulder!`
      }
      primaryAction={{
        label: isPt ? 'Iniciar Turno (45s)' : 'Start Turn (45s)',
        onPress: game.handleStartTurn,
        color: accent.primary,
        plinthColor: accent.plinth,
      }}
    />
  ) : isTurnRunning ? (
    <BottomActionDock
      layout="row"
      primaryAction={{
        label: isPt ? 'ACERTOU (+1)' : 'GOT IT (+1)',
        onPress: game.handleHit,
        color: theme.semantic.status.success,
        plinthColor: '#059669',
      }}
      secondaryAction={{ label: isPt ? 'PULAR' : 'PASS', onPress: game.handleSkip, variant: 'secondary' }}
    />
  ) : (
    <BottomActionDock
      layout="row"
      primaryAction={{
        label: isPt ? 'Próximo Jogador' : 'Next Player',
        onPress: game.handleNextSpeaker,
        color: accent.primary,
        plinthColor: accent.plinth,
      }}
      secondaryAction={{ label: 'Lobby', onPress: onExitLobby, variant: 'secondary' }}
    />
  );

  return (
    <GameScreenShell accentColor={accent.primary} footerInset={124} footer={footer}>
      <GameTopBar
        title={isPt ? 'Palavra Proibida' : 'Forbidden Word'}
        subtitle={
          isTurnRunning
            ? `${game.timeLeft}s • ${activeSpeaker?.name ?? ''}`
            : isPt
              ? `Vez de ${activeSpeaker?.name ?? ''}`
              : `${activeSpeaker?.name ?? ''}'s Turn`
        }
        statusTone={isTurnRunning && game.timeLeft <= 10 ? 'error' : 'warning'}
        statusLabel={isTurnRunning ? `${game.timeLeft}s` : undefined}
        onPressLeft={onExitLobby}
        onPressRight={() => game.setRulesVisible(true)}
      />

      <View style={[styles.voiceNotice, { borderColor: '#FED7AA', backgroundColor: accent.tint }]}>
        <SymbolView name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }} size={14} tintColor={accent.primary} />
        <Text style={[styles.voiceNoticeText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? 'Explique a palavra em voz alta sem dizer nenhuma das 4 palavras proibidas!'
            : 'Explain the main word out loud without saying any of the 4 forbidden words!'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isTurnRunning ? (
          <View style={styles.categoryRow}>
            {FORBIDDEN_CATEGORIES.map((cat) => {
              const isActive = game.category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => game.handleSelectCategory(cat.id)}
                  style={[
                    styles.categoryPill,
                    {
                      borderColor: isActive ? accent.primary : theme.semantic.border.hairline,
                      backgroundColor: isActive ? accent.primary : theme.semantic.bg.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isActive ? accent.textOnPrimary : theme.semantic.text.secondary,
                        fontFamily: theme.semantic.typography.titleFamily,
                      },
                    ]}>
                    {cat.label[locale]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {isTurnRunning && game.currentCard ? (
          <ForbiddenWordCard
            card={game.currentCard}
            locale={locale}
            timeLeft={game.timeLeft}
            onBuzz={game.handleBuzz}
          />
        ) : null}

        {isTurnOver && activeSpeaker ? (
          <ForbiddenTurnSummary
            speaker={activeSpeaker}
            turnHits={game.turnHits}
            turnBuzzes={game.turnBuzzes}
            isPt={isPt}
          />
        ) : null}

        {!isTurnRunning ? (
          <ForbiddenScoreboard
            players={game.players}
            activeSpeakerId={activeSpeaker?.id}
            scoresByPlayer={game.scoresByPlayer}
            isPt={isPt}
          />
        ) : null}
      </ScrollView>

      <Modal
        visible={game.rulesVisible}
        title={isPt ? 'Regras • Palavra Proibida' : 'Rules • Forbidden Word'}
        onClose={() => game.setRulesVisible(false)}>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '1. O jogador da vez tem 45 segundos para fazer o grupo adivinhar a Palavra Principal.'
            : '1. The active player has 45 seconds to make the group guess the Main Word.'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '2. É proibido dizer qualquer uma das 4 Palavras Proibidas da carta (nem partes delas)!'
            : '2. You cannot say any of the 4 Forbidden Words on the card!'}
        </Text>
        <Text style={[styles.rulesText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? '3. Se falar uma palavra proibida, aperte a BUZINA vermelha e a carta é descartada.'
            : '3. If a forbidden word is spoken, hit the red BUZZER and the card is discarded.'}
        </Text>
      </Modal>
    </GameScreenShell>
  );
}
