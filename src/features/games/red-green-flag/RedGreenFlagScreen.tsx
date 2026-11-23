import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  FLAG_CATEGORIES,
  FlagCategoryId,
  getFilteredFlags,
  greenFlagsCatalog,
  redFlagsCatalog,
} from '@/src/features/games/red-green-flag/content';
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

type CandidateSubmission = {
  cupidId: string;
  cupidName: string;
  cupidAvatarId: number;
  greenFlag: string;
  redFlag: string;
};

type Phase = 'building' | 'pitching' | 'result';

const shuffleArray = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function RedGreenFlagScreen({ lobby, onExitLobby }: GameRuntimeScreenProps) {
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

  const [category, setCategory] = useState<FlagCategoryId>('all');
  const [singleIndex, setSingleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('building');
  const [activeCupidTurn, setActiveCupidTurn] = useState(0);
  const [selectedGreen, setSelectedGreen] = useState<string | null>(null);
  const [selectedRed, setSelectedRed] = useState<string | null>(null);
  const [handSeed, setHandSeed] = useState(0);
  const [submissions, setSubmissions] = useState<CandidateSubmission[]>([]);
  const [winningCupidId, setWinningCupidId] = useState<string | null>(null);
  const [rulesVisible, setRulesVisible] = useState(false);

  const singlePlayer = players[singleIndex % Math.max(players.length, 1)];
  const cupids = useMemo(
    () => players.filter((player) => player.id !== singlePlayer?.id),
    [players, singlePlayer?.id]
  );
  const currentCupid = cupids[activeCupidTurn];

  const currentHand = useMemo(() => {
    const greens = shuffleArray(getFilteredFlags(greenFlagsCatalog, locale, category)).slice(0, 3);
    const reds = shuffleArray(getFilteredFlags(redFlagsCatalog, locale, category)).slice(0, 3);
    return { greens, reds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, locale, activeCupidTurn, singleIndex, handSeed]);

  const handleConfirmCandidate = useCallback(() => {
    if (!currentCupid || !selectedGreen || !selectedRed) {
      return;
    }

    const nextSubmissions: CandidateSubmission[] = [
      ...submissions,
      {
        cupidId: currentCupid.id,
        cupidName: currentCupid.name,
        cupidAvatarId: currentCupid.avatarId,
        greenFlag: selectedGreen,
        redFlag: selectedRed,
      },
    ];

    setSubmissions(nextSubmissions);
    setSelectedGreen(null);
    setSelectedRed(null);
    triggerGameFeedback('submit');

    if (activeCupidTurn + 1 < cupids.length) {
      setActiveCupidTurn((prev) => prev + 1);
    } else {
      setPhase('pitching');
    }
  }, [activeCupidTurn, cupids.length, currentCupid, selectedGreen, selectedRed, submissions]);

  const handleStartNextRound = useCallback(() => {
    setSingleIndex((prev) => (prev + 1) % Math.max(players.length, 1));
    setPhase('building');
    setActiveCupidTurn(0);
    setSelectedGreen(null);
    setSelectedRed(null);
    setSubmissions([]);
    setWinningCupidId(null);
    setHandSeed((prev) => prev + 1);
    triggerGameFeedback('confirm');
  }, [players.length]);

  if (players.length < 2 || !singlePlayer) {
    return (
      <GameScreenShell>
        <GameTopBar
          title="Red Flag / Green Flag"
          onPressLeft={onExitLobby}
        />
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

  const winningSubmission = submissions.find((item) => item.cupidId === winningCupidId);

  return (
    <GameScreenShell
      footerInset={124}
      footer={
        phase === 'building' ? (
          <BottomActionDock
            helperText={
              isPt
                ? `Vez de ${currentCupid?.name ?? ''} montar um pretendente para ${singlePlayer.name}`
                : `${currentCupid?.name ?? ''}'s turn to build a date for ${singlePlayer.name}`
            }
            primaryAction={{
              label: isPt ? 'Confirmar Pretendente' : 'Confirm Candidate',
              onPress: handleConfirmCandidate,
              disabled: !selectedGreen || !selectedRed,
              variant: 'primary',
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
              label: isPt ? 'Dar Match e Revelar Cupidos' : 'Match & Reveal Cupids',
              onPress: () => {
                if (!winningCupidId) {
                  return;
                }
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                triggerGameFeedback('result');
                setPhase('result');
              },
              disabled: !winningCupidId,
              variant: 'primary',
            }}
          />
        ) : (
          <BottomActionDock
            layout="row"
            primaryAction={{
              label: isPt ? 'Próximo Solteiro(a)' : 'Next Single',
              onPress: handleStartNextRound,
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
        title="Red Flag / Green Flag"
        subtitle={
          phase === 'building'
            ? isPt
              ? `Cupido ${activeCupidTurn + 1} de ${cupids.length}`
              : `Cupid ${activeCupidTurn + 1} of ${cupids.length}`
            : phase === 'pitching'
              ? isPt
                ? 'Hora de vender o peixe!'
                : 'Pitch time!'
              : isPt
                ? 'Match Revelado!'
                : 'Match Revealed!'
        }
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
            ? 'Jogo de festa ao vivo: cada Cupido defende seu pretendente em voz alta!'
            : 'Live party game: each Cupid pitches their candidate out loud!'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {FLAG_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                accessibilityRole="button"
                accessibilityLabel={cat.label[locale]}
                onPress={() => {
                  setCategory(cat.id);
                  setSelectedGreen(null);
                  setSelectedRed(null);
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
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {cat.label[locale]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.singleBanner,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.surface,
            },
          ]}>
          <AvatarSprite avatarId={singlePlayer.avatarId} size={46} />
          <View style={styles.singleBannerTexts}>
            <Text
              style={[
                styles.singleRoleLabel,
                {
                  color: theme.semantic.button.primary.bg,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {isPt ? 'SOLTEIRO(A) DA RODADA' : 'SINGLE OF THE ROUND'}
            </Text>
            <Text
              style={[
                styles.singleName,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {singlePlayer.name}
            </Text>
          </View>
          {phase === 'building' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPt ? 'Sortear novas cartas' : 'Reroll cards'}
              onPress={() => {
                setSelectedGreen(null);
                setSelectedRed(null);
                setHandSeed((prev) => prev + 1);
                void Haptics.selectionAsync();
              }}
              style={[
                styles.rerollBtn,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: theme.semantic.bg.elevated,
                },
              ]}>
              <SymbolView
                name={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }}
                size={14}
                tintColor={theme.semantic.text.secondary}
              />
              <Text
                style={[
                  styles.rerollBtnText,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.titleFamily,
                  },
                ]}>
                {isPt ? 'Trocar mão' : 'Reroll'}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {phase === 'building' && currentCupid ? (
          <>
            <Card
              title={
                isPt
                  ? `1. Escolha 1 Green Flag (${currentCupid.name})`
                  : `1. Pick 1 Green Flag (${currentCupid.name})`
              }
              subtitle={isPt ? 'A qualidade perfeita do pretendente:' : 'The perfect trait:'}>
              <View style={styles.cardsColumn}>
                {currentHand.greens.map((flagText) => {
                  const isSelected = selectedGreen === flagText;
                  return (
                    <Pressable
                      key={flagText}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        setSelectedGreen(flagText);
                        void Haptics.selectionAsync();
                      }}
                      style={[
                        styles.flagOptionCard,
                        {
                          borderColor: isSelected
                            ? theme.semantic.status.success
                            : theme.semantic.border.subtle,
                          backgroundColor: isSelected
                            ? withAlpha(theme.semantic.status.success, 0.16)
                            : theme.semantic.bg.elevated,
                          borderWidth: isSelected ? 1.6 : 1,
                        },
                      ]}>
                      <Badge label="GREEN FLAG" variant="success" />
                      <Text
                        style={[
                          styles.flagOptionText,
                          {
                            color: theme.semantic.text.primary,
                            fontFamily: theme.semantic.typography.bodyFamily,
                          },
                        ]}>
                        {flagText}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card
              title={
                isPt
                  ? `2. Escolha 1 Red Flag (${currentCupid.name})`
                  : `2. Pick 1 Red Flag (${currentCupid.name})`
              }
              subtitle={isPt ? 'O defeito bizarro que vem no pacote:' : 'The chaotic catch:'}>
              <View style={styles.cardsColumn}>
                {currentHand.reds.map((flagText) => {
                  const isSelected = selectedRed === flagText;
                  return (
                    <Pressable
                      key={flagText}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        setSelectedRed(flagText);
                        void Haptics.selectionAsync();
                      }}
                      style={[
                        styles.flagOptionCard,
                        {
                          borderColor: isSelected
                            ? theme.semantic.status.error
                            : theme.semantic.border.subtle,
                          backgroundColor: isSelected
                            ? withAlpha(theme.semantic.status.error, 0.16)
                            : theme.semantic.bg.elevated,
                          borderWidth: isSelected ? 1.6 : 1,
                        },
                      ]}>
                      <Badge label="RED FLAG" variant="error" />
                      <Text
                        style={[
                          styles.flagOptionText,
                          {
                            color: theme.semantic.text.primary,
                            fontFamily: theme.semantic.typography.bodyFamily,
                          },
                        ]}>
                        {flagText}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </>
        ) : null}

        {phase === 'pitching' ? (
          <Card
            title={isPt ? 'Pretendentes na Pista' : 'Candidates on the Floor'}
            subtitle={
              isPt
                ? `Cada Cupido defende seu combo em voz alta! Depois, ${singlePlayer.name} toca no escolhido:`
                : `Each Cupid defends their combo out loud! Then ${singlePlayer.name} taps the winner:`
            }>
            <View style={styles.cardsColumn}>
              {submissions.map((item, idx) => {
                const isSelected = winningCupidId === item.cupidId;
                return (
                  <Pressable
                    key={item.cupidId}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      setWinningCupidId(item.cupidId);
                      void Haptics.selectionAsync();
                    }}
                    style={[
                      styles.comboCard,
                      {
                        borderColor: isSelected
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                        backgroundColor: isSelected
                          ? withAlpha(theme.semantic.button.primary.bg, 0.14)
                          : theme.semantic.bg.elevated,
                        borderWidth: isSelected ? 1.8 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.comboHeaderLabel,
                        {
                          color: theme.semantic.text.secondary,
                          fontFamily: theme.semantic.typography.titleFamily,
                        },
                      ]}>
                      {isPt ? `Pretendente #${idx + 1}` : `Candidate #${idx + 1}`}
                    </Text>
                    <View style={styles.comboFlagRow}>
                      <Badge label="GREEN" variant="success" />
                      <Text style={[styles.comboFlagText, { color: theme.semantic.text.primary }]}>
                        {item.greenFlag}
                      </Text>
                    </View>
                    <View style={styles.comboFlagRow}>
                      <Badge label="RED" variant="error" />
                      <Text style={[styles.comboFlagText, { color: theme.semantic.text.primary }]}>
                        {item.redFlag}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        ) : null}

        {phase === 'result' && winningSubmission ? (
          <Card
            title={isPt ? 'Deu Match!' : 'It is a Match!'}
            subtitle={
              isPt
                ? `${singlePlayer.name} escolheu o pretendente criado por ${winningSubmission.cupidName}!`
                : `${singlePlayer.name} picked the candidate created by ${winningSubmission.cupidName}!`
            }>
            <View
              style={[
                styles.winnerHighlight,
                {
                  borderColor: theme.semantic.status.success,
                  backgroundColor: withAlpha(theme.semantic.status.success, 0.12),
                },
              ]}>
              <AvatarSprite avatarId={winningSubmission.cupidAvatarId} size={56} />
              <Text
                style={[
                  styles.winnerCupidName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                  },
                ]}>
                {isPt
                  ? `Cupido Vencedor: ${winningSubmission.cupidName}`
                  : `Winning Cupid: ${winningSubmission.cupidName}`}
              </Text>
              <Text style={[styles.comboFlagText, { color: theme.semantic.status.success }]}>
                ✅ {winningSubmission.greenFlag}
              </Text>
              <Text style={[styles.comboFlagText, { color: theme.semantic.status.error }]}>
                🚩 {winningSubmission.redFlag}
              </Text>
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <Modal
        visible={rulesVisible}
        title={isPt ? 'Regras • Red Flag / Green Flag' : 'Rules • Red Flag / Green Flag'}
        subtitle={
          isPt
            ? 'Todos os jogadores participam criando e defendendo pretendentes absurdos!'
            : 'Every player participates by creating and pitching chaotic candidates!'
        }
        onClose={() => setRulesVisible(false)}>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '1. A cada rodada, 1 jogador é o Solteiro(a) e todos os outros são Cupidos.'
            : '1. Each round, 1 player is the Single and everyone else is a Cupid.'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '2. Cada Cupido escolhe 1 Green Flag (qualidade perfeita) + 1 Red Flag (defeito bizarro) na sua mão.'
            : '2. Each Cupid picks 1 Green Flag + 1 Red Flag from their hand.'}
        </Text>
        <Text style={{ color: theme.semantic.text.secondary, fontSize: 14, lineHeight: 20 }}>
          {isPt
            ? '3. Todos defendem seus pretendentes em voz alta e o Solteiro(a) escolhe com qual dá Match!'
            : '3. Everyone pitches their candidate out loud and the Single picks the winning Match!'}
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
  singleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  singleBannerTexts: {
    flex: 1,
    gap: 2,
  },
  singleRoleLabel: {
    fontSize: 11,
    letterSpacing: 0.7,
  },
  singleName: {
    fontSize: 18,
  },
  rerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rerollBtnText: {
    fontSize: 11,
  },
  cardsColumn: {
    gap: 8,
  },
  flagOptionCard: {
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  flagOptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  comboCard: {
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  comboHeaderLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  comboFlagRow: {
    gap: 4,
  },
  comboFlagText: {
    fontSize: 14,
    lineHeight: 20,
  },
  winnerHighlight: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  winnerCupidName: {
    fontSize: 17,
  },
});
