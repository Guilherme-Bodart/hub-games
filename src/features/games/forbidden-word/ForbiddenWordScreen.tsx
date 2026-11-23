import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  FORBIDDEN_CATEGORIES,
  ForbiddenCategoryId,
  getForbiddenDeck,
} from '@/src/features/games/forbidden-word/content';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import {
  AvatarSprite,
  Badge,
  BottomActionDock,
  Button,
  Card,
  GameScreenShell,
  GameTopBar,
  Modal,
} from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

const TURN_DURATION_SECONDS = 45;

export function ForbiddenWordScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const isPt = locale === 'pt';

  const players = useMemo(
    () =>
      lobby.devices.flatMap((device) =>
        device.players.map((player) => ({
          id: player.id,
          name: player.name,
          avatarId: player.avatarId,
        }))
      ),
    [lobby.devices]
  );

  const [category, setCategory] = useState<ForbiddenCategoryId>('all');
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [isTurnRunning, setIsTurnRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
  const [scoresByPlayer, setScoresByPlayer] = useState<Record<string, number>>({});
  const [turnHits, setTurnHits] = useState(0);
  const [turnBuzzes, setTurnBuzzes] = useState(0);
  const [rulesVisible, setRulesVisible] = useState(false);

  const deck = useMemo(() => getForbiddenDeck(category), [category]);
  const currentCard = deck[cardIndex % Math.max(deck.length, 1)];
  const activeSpeaker = players[speakerIndex % Math.max(players.length, 1)];

  useEffect(() => {
    if (!isTurnRunning) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTurnRunning(false);
          triggerGameFeedback('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTurnRunning]);

  const handleStartTurn = useCallback(() => {
    setTimeLeft(TURN_DURATION_SECONDS);
    setTurnHits(0);
    setTurnBuzzes(0);
    setIsTurnRunning(true);
    triggerGameFeedback('confirm');
  }, []);

  const handleNextSpeaker = useCallback(() => {
    setSpeakerIndex((prev) => (prev + 1) % Math.max(players.length, 1));
    setCardIndex((prev) => prev + 1);
    setTimeLeft(TURN_DURATION_SECONDS);
    setTurnHits(0);
    setTurnBuzzes(0);
    setIsTurnRunning(false);
    triggerGameFeedback('confirm');
  }, [players.length]);

  const handleHit = useCallback(() => {
    if (!activeSpeaker) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTurnHits((prev) => prev + 1);
    setScoresByPlayer((prev) => ({
      ...prev,
      [activeSpeaker.id]: (prev[activeSpeaker.id] ?? 0) + 1,
    }));
    setCardIndex((prev) => prev + 1);
  }, [activeSpeaker]);

  const handleBuzz = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    triggerGameFeedback('error');
    setTurnBuzzes((prev) => prev + 1);
    setCardIndex((prev) => prev + 1);
  }, []);

  return (
    <GameScreenShell
      footerInset={124}
      footer={
        !isTurnRunning && timeLeft === TURN_DURATION_SECONDS ? (
          <BottomActionDock
            helperText={
              isPt
                ? `Passe o celular para ${activeSpeaker?.name ?? ''}. Um rival vigia por cima do ombro!`
                : `Pass the phone to ${activeSpeaker?.name ?? ''}. A rival watches over their shoulder!`
            }
            primaryAction={{
              label: isPt ? 'Iniciar Turno (45s)' : 'Start Turn (45s)',
              onPress: handleStartTurn,
              variant: 'primary',
            }}
          />
        ) : isTurnRunning ? (
          <BottomActionDock
            layout="row"
            primaryAction={{
              label: isPt ? 'ACERTOU (+1)' : 'GOT IT (+1)',
              onPress: handleHit,
              variant: 'secondary',
            }}
            secondaryAction={{
              label: isPt ? 'PULAR' : 'SKIP',
              onPress: () => {
                void Haptics.selectionAsync();
                setCardIndex((prev) => prev + 1);
              },
              variant: 'ghost',
            }}
          />
        ) : (
          <BottomActionDock
            layout="row"
            primaryAction={{
              label: isPt ? 'Próximo Jogador' : 'Next Player',
              onPress: handleNextSpeaker,
              variant: 'primary',
            }}
            secondaryAction={{
              label: isPt ? 'Lobby' : 'Lobby',
              onPress: onExitLobby,
              variant: 'ghost',
            }}
          />
        )
      }>
      <GameTopBar
        title={isPt ? 'Palavra Proibida' : 'Forbidden Word'}
        subtitle={
          isTurnRunning
            ? `${timeLeft}s • ${activeSpeaker?.name ?? ''}`
            : isPt
              ? `Vez de ${activeSpeaker?.name ?? ''}`
              : `${activeSpeaker?.name ?? ''}'s Turn`
        }
        statusTone={isTurnRunning && timeLeft <= 10 ? 'error' : 'success'}
        statusLabel={isTurnRunning ? `${timeLeft}s` : undefined}
        onPressLeft={onExitLobby}
        onPressRight={() => setRulesVisible(true)}
      />

      <View
        style={[
          styles.voiceNotice,
          {
            borderColor: withAlpha(theme.semantic.status.warning, 0.45),
            backgroundColor: withAlpha(theme.semantic.status.warning, 0.12),
          },
        ]}>
        <SymbolView
          name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
          size={14}
          tintColor={theme.semantic.status.warning}
        />
        <Text
          style={[
            styles.voiceNoticeText,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
            },
          ]}>
          {isPt
            ? 'Explique a palavra em voz alta sem dizer nenhuma das 4 palavras proibidas!'
            : 'Explain the main word out loud without saying any of the 4 forbidden words!'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isTurnRunning ? (
          <View style={styles.categoryRow}>
            {FORBIDDEN_CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setCategory(cat.id);
                    setCardIndex(0);
                    void Haptics.selectionAsync();
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      borderColor: isActive
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.border.subtle,
                      backgroundColor: isActive
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.bg.surface,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isActive
                          ? theme.semantic.button.primary.text
                          : theme.semantic.text.secondary,
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

        {isTurnRunning && currentCard ? (
          <>
            <View
              style={[
                styles.tabooCard,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: theme.semantic.bg.surface,
                },
              ]}>
              <View
                style={[
                  styles.mainWordBanner,
                  {
                    backgroundColor: theme.semantic.button.primary.bg,
                  },
                ]}>
                <Text
                  style={[
                    styles.mainWordSubLabel,
                    {
                      color: withAlpha('#FFFFFF', 0.8),
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {isPt ? 'FAÇA O GRUPO ACERTAR' : 'MAKE THEM GUESS'}
                </Text>
                <Text
                  style={[
                    styles.mainWordTitle,
                    {
                      color: '#FFFFFF',
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  {currentCard.word[locale]}
                </Text>
              </View>

              <View style={styles.forbiddenListWrap}>
                <Text
                  style={[
                    styles.forbiddenHeader,
                    {
                      color: theme.semantic.status.error,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {isPt ? 'PROIBIDO FALAR:' : 'FORBIDDEN WORDS:'}
                </Text>
                {currentCard.forbidden[locale].map((forbiddenWord) => (
                  <View
                    key={forbiddenWord}
                    style={[
                      styles.forbiddenChip,
                      {
                        borderColor: withAlpha(theme.semantic.status.error, 0.35),
                        backgroundColor: withAlpha(theme.semantic.status.error, 0.1),
                      },
                    ]}>
                    <SymbolView
                      name={{ ios: 'nosign', android: 'block', web: 'block' }}
                      size={14}
                      tintColor={theme.semantic.status.error}
                    />
                    <Text
                      style={[
                        styles.forbiddenWordText,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                        },
                      ]}>
                      {forbiddenWord}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPt ? 'Buzina: Falou palavra proibida' : 'Buzzer: Said forbidden word'}
              onPress={handleBuzz}
              style={({ pressed }) => [
                styles.buzzerButton,
                {
                  backgroundColor: theme.semantic.status.error,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <SymbolView
                name={{ ios: 'bell.fill', android: 'notifications_active', web: 'notifications_active' }}
                size={20}
                tintColor="#FFFFFF"
              />
              <Text
                style={[
                  styles.buzzerText,
                  {
                    fontFamily: theme.semantic.typography.titleFamily,
                  },
                ]}>
                {isPt ? 'BUZINA! FALOU PROIBIDA 🚨' : 'BUZZER! FORBIDDEN WORD 🚨'}
              </Text>
            </Pressable>
          </>
        ) : null}

        {!isTurnRunning ? (
          <Card
            title={
              timeLeft === 0
                ? isPt
                  ? `Fim do tempo de ${activeSpeaker?.name ?? ''}!`
                  : `${activeSpeaker?.name ?? ''}'s time is up!`
                : isPt
                  ? 'Placar da Rodada'
                  : 'Round Scoreboard'
            }
            subtitle={
              timeLeft === 0
                ? isPt
                  ? `Acertos no turno: ${turnHits} • Buzinas: ${turnBuzzes}`
                  : `Turn hits: ${turnHits} • Buzzes: ${turnBuzzes}`
                : isPt
                  ? 'Quem fizer mais pontos explicando sem errar vence!'
                  : 'Whoever scores the most points explaining without slipping wins!'
            }>
            <View style={styles.scoreboardList}>
              {players.map((player) => {
                const isCurrent = player.id === activeSpeaker?.id;
                const score = scoresByPlayer[player.id] ?? 0;
                return (
                  <View
                    key={player.id}
                    style={[
                      styles.scoreRow,
                      {
                        borderColor: isCurrent
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.elevated,
                      },
                    ]}>
                    <AvatarSprite avatarId={player.avatarId} size={34} />
                    <Text
                      style={[
                        styles.scorePlayerName,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                        },
                      ]}>
                      {player.name}
                    </Text>
                    {isCurrent ? (
                      <Badge label={isPt ? 'Da Vez' : 'Up Next'} variant="info" />
                    ) : null}
                    <Text
                      style={[
                        styles.scoreValue,
                        {
                          color: theme.semantic.button.secondary.bg,
                          fontFamily: theme.semantic.typography.numberFamily,
                        },
                      ]}>
                      {score} pts
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <Modal
        visible={rulesVisible}
        title={isPt ? 'Regras • Palavra Proibida' : 'Rules • Forbidden Word'}
        onClose={() => setRulesVisible(false)}>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '1. O jogador da vez tem 45 segundos para fazer o grupo adivinhar a Palavra Principal.'
            : '1. The active player has 45 seconds to make the group guess the Main Word.'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '2. É proibido dizer qualquer uma das 4 Palavras Proibidas da carta (nem partes delas)!'
            : '2. You cannot say any of the 4 Forbidden Words on the card!'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '3. Se falar uma palavra proibida, aperte a BUZINA vermelha e a carta é descartada.'
            : '3. If a forbidden word is spoken, hit the red BUZZER and the card is discarded.'}
        </Text>
      </Modal>
    </GameScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 28,
  },
  voiceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  voiceNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryPillText: {
    fontSize: 12,
  },
  tabooCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainWordBanner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4,
  },
  mainWordSubLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  mainWordTitle: {
    fontSize: 28,
    letterSpacing: 1,
    textAlign: 'center',
  },
  forbiddenListWrap: {
    padding: 16,
    gap: 10,
  },
  forbiddenHeader: {
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  forbiddenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  forbiddenWordText: {
    fontSize: 16,
  },
  buzzerButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  buzzerText: {
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.7,
  },
  scoreboardList: {
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scorePlayerName: {
    flex: 1,
    fontSize: 15,
  },
  scoreValue: {
    fontSize: 16,
  },
});
