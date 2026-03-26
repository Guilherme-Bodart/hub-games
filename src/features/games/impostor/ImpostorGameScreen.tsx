import { SymbolView } from 'expo-symbols';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createImpostorRound,
  getActiveTurnPlayer,
  proceedToRoundDecision,
  submitImpostorGuess,
  submitPlayerVoting,
  submitRoundClue,
  submitRoundDecisionVote,
} from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  resetRemoteImpostorRound,
  subscribeRemoteImpostorState,
  updateRemoteImpostorRound,
} from '@/src/features/games/impostor/realtime';
import { ImpostorRound } from '@/src/features/games/impostor/types';
import { GameRuntimeScreenProps } from '@/src/features/games/types';
import { resolveLobbyActionAuthorityMode } from '@/src/features/lobby/gameSettings';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, Button, Card, GameScreenShell, GameTopBar, Input } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

const REVEAL_HOLD_DELAY_MS = 220;

type ClueSlotCardProps = {
  player: ImpostorRound['players'][number];
  clue?: string;
  isActive: boolean;
  previousClues: string[];
  typingLabel: string;
  waitingLabel: string;
  theme: ReturnType<typeof useTheme>['theme'];
};

const ClueSlotCard = memo(function ClueSlotCard({
  player,
  clue,
  isActive,
  previousClues,
  typingLabel,
  waitingLabel,
  theme,
}: ClueSlotCardProps) {
  const hasClue = Boolean(clue);
  const flipProgress = useSharedValue(1);
  const typingPulse = useSharedValue(1);
  const wasClueVisibleRef = useRef(hasClue);

  useEffect(() => {
    if (hasClue && !wasClueVisibleRef.current) {
      flipProgress.value = 0;
      flipProgress.value = withTiming(1, { duration: 460 });
    }

    wasClueVisibleRef.current = hasClue;
  }, [flipProgress, hasClue]);

  useEffect(() => {
    if (isActive && !hasClue) {
      typingPulse.value = 1;
      typingPulse.value = withRepeat(withTiming(0.5, { duration: 480 }), -1, true);
      return;
    }

    typingPulse.value = withTiming(1, { duration: 160 });
  }, [hasClue, isActive, typingPulse]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 820 }, { rotateY: `${(1 - flipProgress.value) * 90}deg` }],
    opacity: 0.45 + flipProgress.value * 0.55,
  }));

  const typingStyle = useAnimatedStyle(() => ({
    opacity: hasClue ? 1 : isActive ? typingPulse.value : 0.82,
  }));

  return (
    <Animated.View
      style={[
        styles.clueSlot,
        flipStyle,
        {
          borderColor: isActive
            ? theme.semantic.button.primary.bg
            : hasClue
              ? theme.semantic.status.success
              : theme.semantic.border.subtle,
          backgroundColor: theme.semantic.bg.surface,
        },
      ]}>
      <View style={styles.clueSlotHeader}>
        <AvatarSprite avatarId={player.avatarId} size={24} />
        <Text numberOfLines={1} style={[styles.clueSlotName, { color: theme.semantic.text.primary }]}>
          {player.name}
        </Text>
      </View>
      <View style={styles.clueSlotContentRow}>
        <View style={styles.clueSlotMainClueCol}>
          <Animated.Text
            style={[
              styles.clueSlotValue,
              typingStyle,
              {
                color: hasClue ? theme.semantic.button.primary.bg : theme.semantic.text.muted,
              },
            ]}>
            {hasClue ? clue : isActive ? typingLabel : waitingLabel}
          </Animated.Text>
        </View>
        <View style={[styles.clueSlotDivider, { backgroundColor: theme.semantic.border.subtle }]} />
        <View style={styles.clueHistoryCol}>
          {previousClues.length ? (
            <View style={styles.clueHistoryList}>
              {previousClues.map((oldClue, index) => (
                <Text
                  key={`${player.id}-old-clue-${index}`}
                  style={[styles.clueHistoryText, { color: theme.semantic.text.secondary }]}>
                  {oldClue}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.clueHistoryText, { color: theme.semantic.text.muted }]}>-</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.clue === nextProps.clue &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.typingLabel === nextProps.typingLabel &&
    prevProps.waitingLabel === nextProps.waitingLabel &&
    prevProps.previousClues.length === nextProps.previousClues.length &&
    prevProps.previousClues.every((value, index) => value === nextProps.previousClues[index]) &&
    prevProps.theme === nextProps.theme
  );
});

export function ImpostorGameScreen({ lobby, onExitLobby, setShellPhase }: GameRuntimeScreenProps) {
  const { theme } = useTheme();
  const { locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();

  const isPt = locale === 'pt';
  const copy = {
    title: isPt ? 'Impostor Neon' : 'Neon Impostor',
    noPlayers: isPt ? 'Minimo de 4 jogadores prontos.' : 'Minimum of 4 ready players.',
    waiting: isPt ? 'Aguardando rodada...' : 'Waiting for round...',
    reveal: isPt ? 'Revelacao' : 'Reveal',
    clues: isPt ? 'Pistas' : 'Clues',
    roundDecision: isPt ? 'Decisao da rodada' : 'Round decision',
    voting: isPt ? 'Votacao' : 'Voting',
    guessing: isPt ? 'Chute' : 'Guess',
    result: isPt ? 'Resultado' : 'Result',
    skipSuspense: isPt ? 'Pular suspense' : 'Skip suspense',
    goClues: isPt ? 'Ir para pistas' : 'Go to clues',
    holdRevealHint: isPt ? 'Segure para revelar.' : 'Hold to reveal.',
    releaseRevealHint: isPt ? 'Solte para ocultar.' : 'Release to hide.',
    clueInput: isPt ? 'Digite 1 palavra curta' : 'Type 1 short word',
    submitClue: isPt ? 'Enviar pista' : 'Send clue',
    goDecision: isPt ? 'Ir para decisao' : 'Go to decision',
    waitingClue: isPt ? 'aguardando...' : 'waiting...',
    roundDecisionHint: isPt
      ? 'Todos votam: mais uma rodada de palavras ou ir para suspeitos.'
      : 'Everyone votes: another clue round or go to suspects.',
    continueClues: isPt ? 'Mais pistas' : 'More clues',
    goSuspects: isPt ? 'Ir para suspeitos' : 'Go to suspects',
    turnOf: isPt ? 'Vez de' : 'Turn',
    unlockVote: isPt ? 'Estou com o celular' : 'I have the phone',
    votePrivacyHint: isPt
      ? 'Passe o celular para o jogador da vez e desbloqueie para votar.'
      : 'Pass the phone to the active player and unlock to vote.',
    guessInput: isPt ? 'Palavra dos civis' : 'Civil prompt',
    submitGuess: isPt ? 'Confirmar chute' : 'Submit guess',
    winnerC: isPt ? 'Civis venceram' : 'Civilians won',
    winnerI: isPt ? 'Impostores venceram' : 'Impostors won',
    suspense: isPt ? 'Sinal instavel...' : 'Signal unstable...',
    defeatBanner: isPt ? 'Derrota dos civis' : 'Civilians defeated',
    victoryBanner: isPt ? 'Vitoria dos civis' : 'Civilians victory',
    impostorRevealSingle: isPt ? 'O impostor era' : 'The impostor was',
    impostorRevealMulti: isPt ? 'Os impostores eram' : 'The impostors were',
    revealBlockTitle: isPt ? 'Revelacao da rodada' : 'Round reveal',
    civilWord: isPt ? 'Palavra dos civis' : 'Civil word',
    impostorSecret: isPt ? 'Segredo do impostor' : 'Impostor secret',
    voteMapTitle: isPt ? 'Quem votou em quem' : 'Who voted for who',
    votesCount: isPt ? 'votos' : 'votes',
    newRound: isPt ? 'Nova rodada' : 'New round',
    back: isPt ? 'Voltar ao lobby' : 'Back to lobby',
    hostOnly: isPt ? 'Apenas host pode confirmar.' : 'Only host can confirm.',
  };

  const isRemote = lobby.mode === 'remote';
  const roomCode = lobby.roomCode;
  const localDeviceId = lobby.selectedDeviceId;
  const controlMode = resolveLobbyActionAuthorityMode(lobby.gameSettings);

  const [round, setRound] = useState<ImpostorRound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heldRevealId, setHeldRevealId] = useState<string | null>(null);
  const [activeVotingPlayerId, setActiveVotingPlayerId] = useState<string | null>(null);
  const [typingDotsCount, setTypingDotsCount] = useState(1);
  const [visibleVotingCount, setVisibleVotingCount] = useState(0);
  const [resultStage, setResultStage] = useState(0);
  const [resultRouletteTick, setResultRouletteTick] = useState(0);
  const [clueInput, setClueInput] = useState('');
  const [votingDraftsByPlayer, setVotingDraftsByPlayer] = useState<Record<string, string[]>>({});
  const [isVoteSelectionUnlocked, setIsVoteSelectionUnlocked] = useState(false);
  const [guessDrafts, setGuessDrafts] = useState<Record<string, string>>({});

  const latestLobbyRef = useRef(lobby);
  const latestRoundRef = useRef<ImpostorRound | null>(null);
  const revealHoldTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPhaseRef = useRef<ImpostorRound['phase'] | null>(null);
  const previousRevealedIdRef = useRef<string | null>(null);
  const previousResultStageRef = useRef<number>(0);
  const impostorPromptPulse = useSharedValue(0.5);
  const resultFlicker = useSharedValue(0.8);
  const revealFogOpacity = useSharedValue(0);
  const revealPromptOpacity = useSharedValue(0);

  useEffect(() => {
    latestLobbyRef.current = lobby;
  }, [lobby]);

  useEffect(() => {
    latestRoundRef.current = round;
  }, [round]);

  useEffect(() => {
    impostorPromptPulse.value = withRepeat(withTiming(1, { duration: 920 }), -1, true);
    resultFlicker.value = withRepeat(withTiming(1, { duration: 760 }), -1, true);
  }, [impostorPromptPulse, resultFlicker]);

  const isHostDevice = useMemo(() => {
    const device = lobby.devices.find((item) => item.id === localDeviceId);
    return device?.players.some((player) => player.isHost) ?? false;
  }, [lobby.devices, localDeviceId]);

  const canControl = controlMode === 'collaborative' || isHostDevice;

  const localPlayerIds = useMemo(
    () =>
      new Set(
        lobby.devices.find((item) => item.id === localDeviceId)?.players.map((player) => player.id) || []
      ),
    [lobby.devices, localDeviceId]
  );

  const localRevealPlayers = useMemo(
    () => round?.players.filter((player) => player.deviceId === localDeviceId) ?? [],
    [localDeviceId, round]
  );

  const localVotingPlayers = useMemo(
    () => round?.players.filter((player) => localPlayerIds.has(player.id)) ?? [],
    [localPlayerIds, round]
  );

  const revealedPrompt = useMemo(() => {
    if (!round || !heldRevealId) {
      return null;
    }

    const revealedPlayer = round.players.find((item) => item.id === heldRevealId);

    if (!revealedPlayer) {
      return null;
    }

    return revealedPlayer.isImpostor ? round.impostorPrompt : round.civilPrompt;
  }, [heldRevealId, round]);

  const revealedPlayer = useMemo(
    () => (heldRevealId ? round?.players.find((item) => item.id === heldRevealId) ?? null : null),
    [heldRevealId, round]
  );

  const revealedIsImpostor = Boolean(revealedPlayer?.isImpostor);
  const clueProgress = round ? Object.keys(round.clues).length / Math.max(round.players.length, 1) : 0;
  const clueSubmittedCount = round ? Object.keys(round.clues).length : 0;
  const activeVotingSelection =
    round && activeVotingPlayerId
      ? votingDraftsByPlayer[activeVotingPlayerId] ??
        round.votingSelectionsByPlayer[activeVotingPlayerId] ??
        []
      : [];
  const isVoteSelectionLocked = Boolean(activeVotingPlayerId && !isVoteSelectionUnlocked);
  const allLocalVotingSubmitted = Boolean(
    round &&
      localVotingPlayers.every((player) => round.votingSubmittedPlayerIds.includes(player.id))
  );
  const localVotesSubmittedCount = round
    ? localVotingPlayers.filter((player) => round.votingSubmittedPlayerIds.includes(player.id)).length
    : 0;
  const hasVotingTallies = Boolean(round && Object.keys(round.votingTallies).length > 0);
  const votingTallies = useMemo(() => {
    if (!round) {
      return [];
    }

    return round.players
      .map((player) => ({
        playerId: player.id,
        name: player.name,
        votes: round.votingTallies[player.id] ?? 0,
      }))
      .sort((left, right) => right.votes - left.votes || left.name.localeCompare(right.name));
  }, [round]);
  const impostorPlayers = useMemo(
    () => (round ? round.players.filter((player) => player.isImpostor) : []),
    [round]
  );
  const voteBreakdown = useMemo(() => {
    if (!round) {
      return [];
    }

    const votersBySuspectId = round.players.reduce<Record<string, string[]>>((accumulator, player) => {
      accumulator[player.id] = [];
      return accumulator;
    }, {});

    Object.entries(round.votingSelectionsByPlayer).forEach(([voterId, suspectIds]) => {
      suspectIds.forEach((suspectId) => {
        if (votersBySuspectId[suspectId]) {
          votersBySuspectId[suspectId].push(voterId);
        }
      });
    });

    return round.players
      .map((player) => ({
        suspect: player,
        voteCount: round.votingTallies[player.id] ?? 0,
        voters: (votersBySuspectId[player.id] ?? [])
          .map((voterId) => round.players.find((playerItem) => playerItem.id === voterId))
          .filter(
            (
              voter
            ): voter is {
              id: string;
              name: string;
              avatarId: number;
              isHost: boolean;
              isLocalDevice: boolean;
              deviceId: string;
              isImpostor: boolean;
            } => Boolean(voter)
          ),
      }))
      .sort(
        (left, right) =>
          right.voteCount - left.voteCount || left.suspect.name.localeCompare(right.suspect.name)
      );
  }, [round]);
  const votingRevealDone =
    round?.phase === 'voting' ? visibleVotingCount >= round.players.length : true;
  const revealGridColumns =
    viewportWidth >= 760 ? 4 : viewportWidth >= 560 ? 3 : viewportWidth >= 390 ? 2 : 1;
  const playerCardWidth =
    revealGridColumns === 4
      ? '23.6%'
      : revealGridColumns === 3
        ? '31.8%'
        : revealGridColumns === 2
          ? '48.6%'
          : '100%';
  const voteGridColumnsCompact = viewportWidth >= 900 ? 3 : 2;
  const voteCellWidth = voteGridColumnsCompact === 3 ? '31.8%' : '47%';
  const typingLabel = isPt
    ? `digitando${'.'.repeat(typingDotsCount)}`
    : `typing${'.'.repeat(typingDotsCount)}`;
  const resultShouldShowQuestionBlock = round?.mode === 'questions';
  const suspenseWinnerIsImpostor = resultRouletteTick % 2 === 0;
  const bannerWinnerIsImpostor =
    round?.phase === 'result' && resultStage < 1
      ? suspenseWinnerIsImpostor
      : round?.result?.winner === 'impostors';
  const revealResultBlockAt = resultShouldShowQuestionBlock ? 3 : -1;
  const votingResultBlockAt = resultShouldShowQuestionBlock ? 4 : 3;
  const resultActionsAt = resultShouldShowQuestionBlock ? 5 : 4;
  const impostorPromptPulseStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + impostorPromptPulse.value * 0.28,
  }));

  const resultFlickerStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + resultFlicker.value * 0.22,
  }));
  const revealFogStyle = useAnimatedStyle(() => ({
    opacity: revealFogOpacity.value,
  }));
  const revealPromptStyle = useAnimatedStyle(() => ({
    opacity: revealPromptOpacity.value,
  }));

  const initializeRound = useCallback(async () => {
    try {
      setError(null);
      setHeldRevealId(null);
      setActiveVotingPlayerId(null);
      setClueInput('');
      setVotingDraftsByPlayer({});
      setGuessDrafts({});
      const previousTurnOrder = latestRoundRef.current?.players.map((player) => player.id);
      const nextRound = createImpostorRound({
        lobby: latestLobbyRef.current,
        locale,
        previousTurnOrder,
      });
      if (isRemote) {
        await initializeRemoteImpostorRound(roomCode, nextRound, localDeviceId);
      } else {
        setRound(nextRound);
      }
    } catch (err) {
      setRound(null);
      setError(err instanceof Error ? err.message : copy.noPlayers);
    }
  }, [copy.noPlayers, isRemote, locale, localDeviceId, roomCode]);

  const saveRound = useCallback(
    async (nextRound: ImpostorRound) => {
      setError(null);
      if (isRemote) {
        await updateRemoteImpostorRound(roomCode, nextRound, localDeviceId);
      } else {
        setRound(nextRound);
      }
    },
    [isRemote, localDeviceId, roomCode]
  );

  useEffect(() => {
    if (!isRemote) {
      void initializeRound();
      return;
    }

    const unsub = subscribeRemoteImpostorState({
      roomCode,
      onState: (stateRound) => setRound(stateRound),
      onError: (message) => setError(message || copy.waiting),
    });

    return unsub;
  }, [copy.waiting, initializeRound, isRemote, roomCode]);

  useEffect(() => {
    if (!round || !heldRevealId) {
      return;
    }

    const stillVisible = round.players.some(
      (player) => player.id === heldRevealId && player.deviceId === localDeviceId
    );

    if (!stillVisible) {
      setHeldRevealId(null);
    }
  }, [heldRevealId, localDeviceId, round]);

  useEffect(() => {
    if (!heldRevealId) {
      revealFogOpacity.value = withTiming(0, { duration: 180 });
      revealPromptOpacity.value = withTiming(0, { duration: 120 });
      return;
    }

    revealFogOpacity.value = 0.68;
    revealFogOpacity.value = withTiming(0.18, { duration: 620 });
    revealPromptOpacity.value = withTiming(1, { duration: 620 });
  }, [heldRevealId, revealFogOpacity, revealPromptOpacity]);

  useEffect(() => {
    if (!round || round.phase !== 'clues') {
      setTypingDotsCount(1);
      return;
    }

    const interval = setInterval(() => {
      setTypingDotsCount((current) => (current >= 4 ? 1 : current + 1));
    }, 260);

    return () => clearInterval(interval);
  }, [round?.phase]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setVisibleVotingCount(0);
      return;
    }

    setVisibleVotingCount(0);
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setVisibleVotingCount(current);

      if (current >= round.players.length) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [round?.id, round?.phase, round?.players.length]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setActiveVotingPlayerId(null);
      setIsVoteSelectionUnlocked(false);
      return;
    }

    const pendingLocalVoter = localVotingPlayers.find(
      (player) => !round.votingSubmittedPlayerIds.includes(player.id)
    );

    if (!pendingLocalVoter) {
      setActiveVotingPlayerId(null);
      setIsVoteSelectionUnlocked(false);
      return;
    }

    if (!activeVotingPlayerId || round.votingSubmittedPlayerIds.includes(activeVotingPlayerId)) {
      setActiveVotingPlayerId(pendingLocalVoter.id);
      setIsVoteSelectionUnlocked(false);
    }
  }, [activeVotingPlayerId, localVotingPlayers, round]);

  useEffect(() => {
    if (!round || round.phase !== 'voting') {
      setVotingDraftsByPlayer({});
      return;
    }

    if (!activeVotingPlayerId) {
      return;
    }

    const submitted = round.votingSubmittedPlayerIds.includes(activeVotingPlayerId);

    if (submitted) {
      return;
    }

    setVotingDraftsByPlayer((currentDrafts) => {
      if (currentDrafts[activeVotingPlayerId]) {
        return currentDrafts;
      }

      const baseSelection = round.votingSelectionsByPlayer[activeVotingPlayerId] ?? [];

      return {
        ...currentDrafts,
        [activeVotingPlayerId]: baseSelection,
      };
    });
  }, [activeVotingPlayerId, round]);

  useEffect(() => {
    if (!round || round.phase !== 'result') {
      setResultStage(0);
      setResultRouletteTick(0);
      return;
    }

    setResultStage(0);
    setResultRouletteTick(0);

    const rouletteInterval = setInterval(() => {
      setResultRouletteTick((current) => current + 1);
    }, 120);

    const maxStage = round.mode === 'questions' ? 5 : 4;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let stage = 1; stage <= maxStage; stage += 1) {
      const timeout = setTimeout(() => {
        setResultStage((currentStage) => Math.max(currentStage, stage));

        if (stage === 1) {
          clearInterval(rouletteInterval);
        }
      }, stage * 1000);
      timeouts.push(timeout);
    }

    return () => {
      clearInterval(rouletteInterval);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [round?.id, round?.phase, round?.mode]);

  const phaseLabel =
    round?.phase === 'reveal'
      ? copy.reveal
      : round?.phase === 'clues'
        ? copy.clues
        : round?.phase === 'roundDecision'
          ? copy.roundDecision
        : round?.phase === 'voting'
          ? copy.voting
          : round?.phase === 'guessing'
      ? copy.guessing
      : copy.result;
  const shellPhaseLabel = round ? phaseLabel : copy.waiting;
  const topBarStatusTone =
    error || round?.phase === 'guessing'
      ? 'error'
      : round?.phase === 'voting' || round?.phase === 'roundDecision'
        ? 'warning'
        : round?.phase === 'result'
          ? 'success'
          : 'info';
  const phaseGuideText =
    round?.phase === 'reveal'
      ? isPt
        ? 'Passe o celular e segure para revelar apenas o segredo do jogador da vez.'
        : 'Pass the phone and hold to reveal only the active player secret.'
      : round?.phase === 'clues'
        ? isPt
          ? 'Cada jogador envia uma pista curta. Evite ser obvio demais.'
          : 'Each player sends one short clue. Avoid being too obvious.'
        : round?.phase === 'roundDecision'
          ? isPt
            ? 'Todos votam: mais pistas ou ir para os suspeitos.'
            : 'Everyone votes: more clues or move to suspects.'
          : round?.phase === 'voting'
            ? isPt
              ? 'Selecione suspeitos com calma e confirme o voto de cada jogador local.'
              : 'Select suspects carefully and confirm each local player vote.'
            : round?.phase === 'guessing'
              ? isPt
                ? 'Impostores pegos tentam acertar a palavra final.'
                : 'Caught impostors attempt the final prompt guess.'
              : isPt
                ? 'Revise o resultado e prepare a proxima rodada.'
                : 'Review the result and prepare the next round.';

  useEffect(() => {
    setShellPhase?.(shellPhaseLabel);
  }, [setShellPhase, shellPhaseLabel]);

  useEffect(() => {
    if (!round) {
      previousPhaseRef.current = null;
      return;
    }

    if (previousPhaseRef.current === round.phase) {
      return;
    }

    previousPhaseRef.current = round.phase;

    if (round.phase === 'voting') {
      triggerGameFeedback('vote');
      return;
    }

    if (round.phase === 'result') {
      triggerGameFeedback('result');
      return;
    }

    if (round.phase === 'roundDecision') {
      triggerGameFeedback('warning');
    }
  }, [round]);

  useEffect(() => {
    if (!heldRevealId) {
      previousRevealedIdRef.current = null;
      return;
    }

    if (previousRevealedIdRef.current === heldRevealId) {
      return;
    }

    previousRevealedIdRef.current = heldRevealId;
    triggerGameFeedback('reveal');
  }, [heldRevealId]);

  useEffect(() => {
    if (!round || round.phase !== 'result') {
      previousResultStageRef.current = 0;
      return;
    }

    if (resultStage === previousResultStageRef.current) {
      return;
    }

    previousResultStageRef.current = resultStage;

    if (resultStage === 1) {
      triggerGameFeedback('warning');
      return;
    }

    if (resultStage === 2) {
      triggerGameFeedback('reveal');
      return;
    }

    if (resultStage >= votingResultBlockAt && resultStage < resultActionsAt) {
      triggerGameFeedback('vote');
      return;
    }

    if (resultStage >= resultActionsAt) {
      triggerGameFeedback('result');
    }
  }, [resultActionsAt, resultStage, round, votingResultBlockAt]);

  const startRevealHold = useCallback((playerId: string) => {
    if (revealHoldTimeoutRef.current) {
      clearTimeout(revealHoldTimeoutRef.current);
      revealHoldTimeoutRef.current = null;
    }

    revealHoldTimeoutRef.current = setTimeout(() => {
      setHeldRevealId(playerId);
    }, REVEAL_HOLD_DELAY_MS);
  }, []);

  const stopRevealHold = useCallback((playerId: string) => {
    if (revealHoldTimeoutRef.current) {
      clearTimeout(revealHoldTimeoutRef.current);
      revealHoldTimeoutRef.current = null;
    }

    setHeldRevealId((currentId) => (currentId === playerId ? null : currentId));
  }, []);

  useEffect(() => {
    return () => {
      if (revealHoldTimeoutRef.current) {
        clearTimeout(revealHoldTimeoutRef.current);
      }
    };
  }, []);

  const activeTurn = round ? getActiveTurnPlayer(round) : null;
  const isClueCycleComplete = Boolean(round && Object.keys(round.clues).length >= round.players.length);
  const canSubmitClue = Boolean(activeTurn && localPlayerIds.has(activeTurn.id) && !isClueCycleComplete);
  const handleExitLobby = useCallback(async () => {
    if (isRemote && canControl) {
      try {
        await resetRemoteImpostorRound(roomCode);
      } catch {
        // Ignore cleanup failures and still return to lobby.
      }
    }

    onExitLobby();
  }, [canControl, isRemote, onExitLobby, roomCode]);

  const fastForwardResult = useCallback(() => {
    setResultStage(resultActionsAt);
    triggerGameFeedback('confirm');
  }, [resultActionsAt]);

  if (!round) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
        <View style={styles.emptyWrap}>
          <Card
            title={copy.title}
            subtitle={
              error ||
              (isPt
                ? 'Aguardando configuracao da rodada. O host pode iniciar novamente.'
                : 'Waiting for round setup. The host can start again.')
            }>
            {canControl ? (
              <Button
                label={copy.newRound}
                onPress={() => {
                  triggerGameFeedback('confirm');
                  void initializeRound();
                }}
              />
            ) : null}
            <Button
              label={copy.back}
              onPress={() => {
                triggerGameFeedback('warning');
                void handleExitLobby();
              }}
              variant="ghost"
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GameScreenShell contentStyle={styles.root}>
      <GameTopBar title={copy.title} subtitle={phaseLabel} statusTone={topBarStatusTone} />
      {error ? (
        <View
          style={[
            styles.errorStrip,
            {
              borderColor: withAlpha(theme.semantic.status.error, 0.55),
              backgroundColor: withAlpha(theme.semantic.status.error, 0.16),
            },
          ]}>
          <Text style={[styles.errorText, { color: theme.semantic.status.error }]}>{error}</Text>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.content}>
          {round.phase === 'reveal' ? (
            <Card
              title={copy.reveal}
              subtitle={
                isPt
                  ? 'Segure o card para revelar.'
                  : 'Press and hold a card to reveal.'
              }>
              <Animated.View
                style={[
                  styles.promptBox,
                  revealedIsImpostor ? impostorPromptPulseStyle : null,
                  {
                    borderColor: revealedIsImpostor
                      ? theme.semantic.status.error
                      : theme.semantic.border.subtle,
                    backgroundColor: revealedIsImpostor
                      ? `${theme.semantic.status.error}18`
                      : theme.semantic.bg.surface,
                  },
                ]}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.promptFogLayer,
                    revealFogStyle,
                    {
                      backgroundColor: theme.semantic.bg.app,
                    },
                  ]}
                />
                <View style={styles.promptHeader}>
                  <SymbolView
                    name={{
                      ios: revealedPrompt ? 'eye.fill' : 'eye.slash.fill',
                      android: revealedPrompt ? 'visibility' : 'visibility_off',
                      web: revealedPrompt ? 'visibility' : 'visibility_off',
                    }}
                    size={15}
                    tintColor={
                      revealedIsImpostor ? theme.semantic.status.error : theme.semantic.text.muted
                    }
                  />
                  <Text
                    style={{
                      color: revealedIsImpostor
                        ? theme.semantic.status.error
                        : theme.semantic.text.secondary,
                      fontSize: 12,
                    }}>
                    {isPt ? 'Segredo da rodada' : 'Round secret'}
                  </Text>
                </View>
                <Animated.Text
                  style={[
                    revealPromptStyle,
                    {
                      color: revealedIsImpostor
                        ? theme.semantic.status.error
                        : theme.semantic.text.primary,
                      fontSize: 19,
                      fontWeight: '700',
                      letterSpacing: revealedIsImpostor ? 1 : 0.2,
                    },
                  ]}>
                  {revealedPrompt || (heldRevealId ? copy.releaseRevealHint : copy.holdRevealHint)}
                </Animated.Text>
              </Animated.View>
              <View style={styles.grid}>
                {localRevealPlayers.map((player) => {
                  return (
                    <Pressable
                      key={player.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${player.name}. ${copy.holdRevealHint}`}
                      onPressIn={() => startRevealHold(player.id)}
                      onPressOut={() => stopRevealHold(player.id)}
                      style={[
                        styles.playerCard,
                        styles.revealPlayerCard,
                        {
                          width: playerCardWidth,
                          borderColor:
                            heldRevealId === player.id
                              ? theme.semantic.button.primary.bg
                              : theme.semantic.border.subtle,
                          backgroundColor: theme.semantic.bg.surface,
                          opacity: heldRevealId && heldRevealId !== player.id ? 0.36 : 1,
                          borderWidth: heldRevealId === player.id ? 1.8 : 1.2,
                          shadowOpacity: heldRevealId === player.id ? 0.62 : 0.2,
                          shadowRadius: heldRevealId === player.id ? 16 : 7,
                          elevation: heldRevealId === player.id ? 12 : 4,
                        },
                      ]}>
                      <View
                        pointerEvents="none"
                        style={[
                          styles.revealCardFrame,
                          { borderColor: withAlpha(theme.semantic.text.primary, 0.11) },
                        ]}
                      />
                      <AvatarSprite avatarId={player.avatarId} size={34} />
                      <Text style={[styles.playerName, { color: theme.semantic.text.primary }]}>
                        {player.name}
                      </Text>
                      <View
                        style={[
                          styles.revealLock,
                          {
                            borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
                            backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.72),
                          },
                        ]}>
                        <SymbolView
                          name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                          size={12}
                          tintColor={theme.semantic.text.muted}
                        />
                      </View>
                      <Text style={[styles.revealHint, { color: theme.semantic.text.muted }]}>
                        {copy.holdRevealHint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {!localRevealPlayers.length ? (
                <Text style={{ color: theme.semantic.text.muted }}>
                  {isPt ? 'Nenhum jogador local pronto para revelar.' : 'No local player ready to reveal.'}
                </Text>
              ) : null}
              <Button
                label={copy.goClues}
                onPress={() => {
                  triggerGameFeedback('submit');
                  void saveRound({ ...round, phase: 'clues', activeTurnIndex: 0 });
                }}
                disabled={isRemote && !canControl}
              />
              {isRemote && !canControl ? <Text style={{ color: theme.semantic.text.muted }}>{copy.hostOnly}</Text> : null}
            </Card>
          ) : null}

          {round.phase === 'reveal' && revealedPlayer && revealedPrompt ? (
            <View
              style={[
                styles.revealHeroCard,
                {
                  borderColor: withAlpha(theme.semantic.button.primary.bg, 0.86),
                  backgroundColor: withAlpha(theme.semantic.bg.surface, 0.92),
                  shadowColor: theme.semantic.button.primary.bg,
                },
              ]}>
              <View
                style={[
                  styles.revealHeroFrame,
                  { borderColor: withAlpha(theme.semantic.text.primary, 0.14) },
                ]}
              />
              <View
                style={[
                  styles.revealHeroFrameInner,
                  { borderColor: withAlpha(theme.semantic.text.primary, 0.1) },
                ]}
              />
              <AvatarSprite avatarId={revealedPlayer.avatarId} size={80} />
              <Text
                numberOfLines={1}
                style={[
                  styles.revealHeroName,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {revealedPlayer.name}
              </Text>
              <Text
                style={[
                  styles.revealHeroSecret,
                  {
                    color: revealedIsImpostor
                      ? theme.semantic.status.error
                      : theme.semantic.button.primary.bg,
                  },
                ]}>
                {revealedPrompt}
              </Text>
              <Text style={[styles.revealHeroHint, { color: theme.semantic.text.secondary }]}>
                {copy.releaseRevealHint}
              </Text>
            </View>
          ) : null}

          {round.phase === 'clues' ? (
            <Card
              title={copy.clues}
              subtitle={
                isClueCycleComplete
                  ? isPt
                    ? 'Todas as pistas enviadas'
                    : 'All clues submitted'
                  : activeTurn
                    ? activeTurn.name
                    : '-'
              }>
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
                  const isActive = activeTurn?.id === player.id;
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
                <Button
                  label={copy.goDecision}
                  onPress={() => {
                    const response = proceedToRoundDecision(round);
                    if (response.error) {
                      setError(response.error);
                      return;
                    }
                    triggerGameFeedback('confirm');
                    void saveRound(response.round);
                  }}
                  disabled={isRemote && !canControl}
                />
              ) : null}

              {canSubmitClue ? (
                <>
                  <Input
                    value={clueInput}
                    onChangeText={setClueInput}
                    placeholder={copy.clueInput}
                    style={styles.input}
                  />
                  <Button
                    label={copy.submitClue}
                    onPress={() => {
                      const response = submitRoundClue(round, activeTurn?.id || '', clueInput);
                      if (response.error) {
                        setError(response.error);
                        return;
                      }
                      setClueInput('');
                      triggerGameFeedback('submit');
                      void saveRound(response.round);
                    }}
                    disabled={!clueInput.trim()}
                  />
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
          ) : null}

          {round.phase === 'voting' ? (
            <Card>
              {activeVotingPlayerId ? (
                <View style={styles.activeVoterCard}>
                  <Text style={[styles.activeVoterLabel, { color: theme.semantic.text.secondary }]}>
                    {copy.turnOf}
                  </Text>
                  <Text style={[styles.activeVoterName, { color: theme.semantic.text.primary }]}>
                    {round.players.find((player) => player.id === activeVotingPlayerId)?.name || '-'}
                  </Text>
                  <View style={styles.voteProgressDots}>
                    {localVotingPlayers.map((player) => {
                      const submitted = round.votingSubmittedPlayerIds.includes(player.id);
                      const active = activeVotingPlayerId === player.id;
                      return (
                        <View
                          key={`vote-progress-${player.id}`}
                          style={[
                            styles.voteProgressDot,
                            {
                              borderColor: submitted
                                ? theme.semantic.status.success
                                : active
                                  ? theme.semantic.button.primary.bg
                                  : theme.semantic.border.subtle,
                              backgroundColor: submitted
                                ? `${theme.semantic.status.success}d0`
                                : active
                                  ? `${theme.semantic.button.primary.bg}2b`
                                  : 'transparent',
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                  <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
                    {`${localVotesSubmittedCount}/${localVotingPlayers.length} ${isPt ? 'votos locais' : 'local votes'}`}
                  </Text>
                </View>
              ) : null}

              <View
                style={[
                  styles.voteBoardWrap,
                  {
                    borderColor: withAlpha(theme.semantic.button.primary.bg, 0.35),
                    backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.7),
                  },
                ]}>
                <View style={styles.voteGrid}>
                  {round.players.slice(0, visibleVotingCount).map((player, index) => {
                    const selected = activeVotingSelection.includes(player.id);
                    return (
                      <Animated.View
                        key={player.id}
                        entering={FadeInDown.duration(320).delay(index * 40)}
                        style={[styles.votePlayerCell, { width: voteCellWidth }]}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${isPt ? 'Selecionar suspeito' : 'Select suspect'}: ${player.name}`}
                          accessibilityState={{
                            disabled: !activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked,
                            selected,
                          }}
                          disabled={!activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked}
                          onPress={() => {
                            if (!activeVotingPlayerId || !votingRevealDone || isVoteSelectionLocked) {
                              return;
                            }

                            setVotingDraftsByPlayer((currentDrafts) => {
                              const currentSelection = currentDrafts[activeVotingPlayerId] ?? [];
                              const alreadySelected = currentSelection.includes(player.id);
                              const nextSelection = alreadySelected
                                ? currentSelection.filter((item) => item !== player.id)
                                : [...currentSelection, player.id].slice(-round.impostorCount);

                              return {
                                ...currentDrafts,
                                [activeVotingPlayerId]: nextSelection,
                              };
                            });
                            triggerGameFeedback('vote');
                          }}
                          style={[
                            styles.playerCard,
                            styles.votePlayerCard,
                            selected ? styles.voteSelectedCard : null,
                            {
                              borderColor: selected
                                ? theme.semantic.button.primary.bg
                                : theme.semantic.border.subtle,
                              borderWidth: selected ? 1.8 : 1.25,
                              backgroundColor: theme.semantic.bg.surface,
                              shadowColor: theme.semantic.shadow.base,
                              transform: [{ scale: selected ? 1.04 : 1 }],
                              opacity:
                                activeVotingPlayerId && votingRevealDone && !isVoteSelectionLocked
                                  ? 1
                                  : 0.45,
                            },
                          ]}>
                          <View style={styles.votePlayerRow}>
                            <AvatarSprite avatarId={player.avatarId} size={28} />
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[styles.playerName, styles.votePlayerName, { color: theme.semantic.text.primary }]}>
                              {player.name}
                            </Text>
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>

                {isVoteSelectionLocked ? (
                  <View
                    style={[
                      styles.votePrivacyOverlay,
                      {
                        backgroundColor: withAlpha(theme.semantic.bg.app, 0.84),
                        borderColor: theme.semantic.border.subtle,
                      },
                    ]}>
                    <Text style={[styles.votePrivacyText, { color: theme.semantic.text.secondary }]}>
                      {copy.votePrivacyHint}
                    </Text>
                    <Button
                      label={copy.unlockVote}
                      onPress={() => {
                        triggerGameFeedback('confirm');
                        setIsVoteSelectionUnlocked(true);
                      }}
                    />
                  </View>
                ) : null}
              </View>

              {!votingRevealDone ? (
                <Text style={{ color: theme.semantic.text.muted }}>
                  {isPt ? 'Carregando suspeitos...' : 'Loading suspects...'}
                </Text>
              ) : null}
              <Button
                label={activeVotingPlayerId ? (isPt ? 'Confirmar voto' : 'Confirm vote') : isPt ? 'Aguardando votos locais' : 'Waiting local votes'}
                disabled={
                  !votingRevealDone ||
                  !activeVotingPlayerId ||
                  isVoteSelectionLocked ||
                  activeVotingSelection.length !== round.impostorCount ||
                  round.votingSubmittedPlayerIds.includes(activeVotingPlayerId)
                }
                onPress={() => {
                  if (!activeVotingPlayerId) {
                    return;
                  }

                  const response = submitPlayerVoting(
                    {
                      ...round,
                      votingSelectionsByPlayer: {
                        ...round.votingSelectionsByPlayer,
                        [activeVotingPlayerId]: activeVotingSelection,
                      },
                    },
                    activeVotingPlayerId
                  );
                  if (response.error) {
                    setError(response.error);
                    return;
                  }
                  setVotingDraftsByPlayer((currentDrafts) => {
                    const nextDrafts = { ...currentDrafts };
                    delete nextDrafts[activeVotingPlayerId];
                    return nextDrafts;
                  });
                  setIsVoteSelectionUnlocked(false);
                  triggerGameFeedback('submit');
                  void saveRound(response.round);
                }}
              />
              {allLocalVotingSubmitted ? (
                <Text style={{ color: theme.semantic.text.muted }}>
                  {isPt
                    ? 'Votos locais enviados. Aguardando outros jogadores...'
                    : 'Local votes sent. Waiting other players...'}
                </Text>
              ) : null}
            </Card>
          ) : null}

          {round.phase === 'roundDecision' ? (
            <Card title={copy.roundDecision} subtitle={copy.roundDecisionHint}>
              <View style={{ gap: 8 }}>
                {round.players
                  .filter((player) => localPlayerIds.has(player.id))
                  .map((player) => {
                    const currentVote = round.decisionVotes[player.id];

                    return (
                      <View
                        key={`decision-${player.id}`}
                        style={[
                          styles.decisionRow,
                          {
                            borderColor: theme.semantic.border.subtle,
                            backgroundColor: theme.semantic.bg.surface,
                          },
                        ]}>
                        <Text style={{ color: theme.semantic.text.primary }}>{player.name}</Text>
                        <View style={styles.decisionButtons}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: currentVote === 'vote-suspect' }}
                            accessibilityLabel={`${player.name}. ${copy.goSuspects}`}
                            onPress={() => {
                              const response = submitRoundDecisionVote(
                                round,
                                player.id,
                                'vote-suspect'
                              );

                              if (response.error) {
                                setError(response.error);
                                return;
                              }

                              triggerGameFeedback('confirm');
                              void saveRound(response.round);
                            }}
                            style={[
                              styles.decisionButton,
                              {
                                borderColor:
                                  currentVote === 'vote-suspect'
                                    ? theme.semantic.button.accent.bg
                                    : theme.semantic.border.subtle,
                                backgroundColor:
                                  currentVote === 'vote-suspect'
                                    ? theme.semantic.button.accent.bg
                                    : theme.semantic.bg.elevated,
                              },
                            ]}>
                            <Text
                              style={{
                                color:
                                  currentVote === 'vote-suspect'
                                    ? theme.semantic.button.accent.text
                                    : theme.semantic.text.secondary,
                              }}>
                              {copy.goSuspects}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: currentVote === 'continue-clues' }}
                            accessibilityLabel={`${player.name}. ${copy.continueClues}`}
                            onPress={() => {
                              const response = submitRoundDecisionVote(
                                round,
                                player.id,
                                'continue-clues'
                              );

                              if (response.error) {
                                setError(response.error);
                                return;
                              }

                              triggerGameFeedback('confirm');
                              void saveRound(response.round);
                            }}
                            style={[
                              styles.decisionButton,
                              {
                                borderColor:
                                  currentVote === 'continue-clues'
                                    ? theme.semantic.border.accent
                                    : theme.semantic.border.subtle,
                                backgroundColor:
                                  currentVote === 'continue-clues'
                                    ? theme.semantic.bg.elevated
                                    : theme.semantic.bg.surface,
                              },
                            ]}>
                            <Text
                              style={{
                                color:
                                  currentVote === 'continue-clues'
                                    ? theme.semantic.text.primary
                                    : theme.semantic.text.secondary,
                              }}>
                              {copy.continueClues}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </Card>
          ) : null}

          {round.phase === 'guessing' ? (
            <Card title={copy.guessing} subtitle={isPt ? 'Impostores pegos fazem o chute final.' : 'Caught impostors make final guess.'}>
              {hasVotingTallies ? (
                <View
                  style={[
                    styles.voteSummary,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.surface,
                    },
                  ]}>
                  <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
                    {isPt ? 'Resultado da votação' : 'Voting result'}
                  </Text>
                  {votingTallies.map((entry) => (
                    <Text key={`guess-tally-${entry.playerId}`} style={{ color: theme.semantic.text.primary }}>
                      {`${entry.name}: ${entry.votes}`}
                    </Text>
                  ))}
                </View>
              ) : null}
              {round.caughtImpostorIds.map((impostorId) => {
                const impostor = round.players.find((player) => player.id === impostorId);
                if (!impostor) {
                  return null;
                }
                const canEdit = localPlayerIds.has(impostorId) && !round.impostorGuesses[impostorId];
                return (
                  <View key={impostorId} style={{ gap: 6 }}>
                    <Text style={{ color: theme.semantic.text.primary }}>{impostor.name}</Text>
                    {round.impostorGuesses[impostorId] ? (
                      <Text style={{ color: theme.semantic.text.secondary }}>{round.impostorGuesses[impostorId]}</Text>
                    ) : (
                      <>
                        <Input
                          value={guessDrafts[impostorId] || ''}
                          onChangeText={(value) => setGuessDrafts((curr) => ({ ...curr, [impostorId]: value }))}
                          placeholder={copy.guessInput}
                          disabled={!canEdit}
                          style={styles.input}
                        />
                        <Button
                          label={copy.submitGuess}
                          onPress={() => {
                            const response = submitImpostorGuess(round, impostorId, guessDrafts[impostorId] || '');
                            if (response.error) {
                              setError(response.error);
                              return;
                            }
                            triggerGameFeedback('submit');
                            void saveRound(response.round);
                          }}
                          disabled={!canEdit || !guessDrafts[impostorId]?.trim()}
                        />
                      </>
                    )}
                  </View>
                );
              })}
            </Card>
          ) : null}

          {round.phase === 'result' ? (
            <Card title={copy.result} style={styles.resultCard}>
              {resultStage < resultActionsAt ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.skipSuspense}
                  onPress={fastForwardResult}
                  style={[
                    styles.skipButton,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.elevated,
                    },
                  ]}>
                  <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
                    {copy.skipSuspense}
                  </Text>
                </Pressable>
              ) : null}

              <Animated.View
                style={[
                  styles.resultStateBanner,
                  resultFlickerStyle,
                  {
                    borderColor: bannerWinnerIsImpostor
                        ? theme.semantic.status.error
                        : theme.semantic.status.success,
                    backgroundColor: bannerWinnerIsImpostor
                        ? `${theme.semantic.status.error}26`
                        : `${theme.semantic.status.success}26`,
                  },
                ]}>
                <Text
                  style={[
                    styles.resultStateTitle,
                    {
                      color: bannerWinnerIsImpostor
                          ? theme.semantic.status.error
                          : theme.semantic.status.success,
                    },
                  ]}>
                  {resultStage < 1
                    ? copy.suspense
                    : bannerWinnerIsImpostor
                      ? copy.defeatBanner
                      : copy.victoryBanner}
                </Text>
                <Text
                  style={[
                    styles.resultStateSubtitle,
                    {
                      color: bannerWinnerIsImpostor
                          ? theme.semantic.status.error
                          : theme.semantic.status.success,
                    },
                  ]}>
                  {resultStage < 1
                    ? (isPt ? 'interferencia...' : 'interference...')
                    : bannerWinnerIsImpostor
                      ? copy.winnerI
                      : copy.winnerC}
                </Text>
              </Animated.View>
              {resultStage >= 2 ? (
                <Animated.View entering={FadeInUp.duration(420)}>
                  <View
                    style={[
                      styles.resultBlock,
                      {
                        borderColor: theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.surface,
                      },
                    ]}>
                    <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                      {impostorPlayers.length > 1 ? copy.impostorRevealMulti : copy.impostorRevealSingle}
                    </Text>
                    <View style={styles.resultImpostorRow}>
                      {impostorPlayers.map((player) => (
                        <View key={`result-impostor-${player.id}`} style={styles.resultImpostorCard}>
                          <AvatarSprite avatarId={player.avatarId} size={48} />
                          <Text style={[styles.resultImpostorName, { color: theme.semantic.text.primary }]}>
                            {player.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Animated.View>
              ) : null}

              {resultShouldShowQuestionBlock && resultStage >= revealResultBlockAt ? (
                <Animated.View entering={FadeInUp.duration(420)}>
                  <View
                    style={[
                      styles.resultBlock,
                      {
                        borderColor: theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.surface,
                      },
                    ]}>
                    <Text style={[styles.resultBlockTitle, { color: theme.semantic.text.primary }]}>
                      {copy.revealBlockTitle}
                    </Text>
                    <View style={styles.resultPromptRow}>
                      <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                        {copy.civilWord}
                      </Text>
                      <Text style={[styles.resultPromptValue, { color: theme.semantic.text.primary }]}>
                        {round.civilPrompt}
                      </Text>
                    </View>
                    <View style={styles.resultPromptRow}>
                      <Text style={[styles.resultBlockLabel, { color: theme.semantic.text.secondary }]}>
                        {copy.impostorSecret}
                      </Text>
                      <Text
                        style={[
                          styles.resultPromptValue,
                          {
                            color: bannerWinnerIsImpostor
                              ? theme.semantic.status.error
                              : theme.semantic.text.primary,
                          },
                        ]}>
                        {round.impostorPrompt}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ) : null}

              {hasVotingTallies && resultStage >= votingResultBlockAt ? (
                <Animated.View entering={FadeInUp.duration(420)}>
                  <View
                    style={[
                      styles.resultBlock,
                      {
                        borderColor: theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.surface,
                      },
                    ]}>
                    <Text style={[styles.resultBlockTitle, { color: theme.semantic.text.primary }]}>
                      {copy.voteMapTitle}
                    </Text>
                    {voteBreakdown.map((entry) => (
                      <View
                        key={`vote-map-${entry.suspect.id}`}
                        style={[styles.voteMapRow, { borderColor: theme.semantic.border.subtle }]}>
                        <View style={styles.voteMapTarget}>
                          <AvatarSprite avatarId={entry.suspect.avatarId} size={28} />
                          <Text style={{ color: theme.semantic.text.primary, fontSize: 13 }}>
                            {entry.suspect.name}
                          </Text>
                        </View>
                        <View style={styles.voteMapVoters}>
                          {entry.voters.length ? (
                            entry.voters.map((voter) => (
                              <AvatarSprite
                                key={`vote-voter-${entry.suspect.id}-${voter.id}`}
                                avatarId={voter.avatarId}
                                size={18}
                              />
                            ))
                          ) : (
                            <Text style={{ color: theme.semantic.text.muted, fontSize: 12 }}>-</Text>
                          )}
                        </View>
                        <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
                          {`${entry.voteCount} ${copy.votesCount}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              ) : null}

              {resultStage >= resultActionsAt ? (
                <Animated.View entering={FadeInUp.duration(420)}>
                  <View style={styles.resultActions}>
                    <Button
                      label={copy.newRound}
                      onPress={() => {
                        triggerGameFeedback('confirm');
                        void initializeRound();
                      }}
                      disabled={isRemote && !canControl}
                    />
                    <Button
                      label={copy.back}
                      variant="ghost"
                      onPress={() => {
                        triggerGameFeedback('warning');
                        void handleExitLobby();
                      }}
                    />
                  </View>
                </Animated.View>
              ) : null}
            </Card>
          ) : null}
      </ScrollView>
    </GameScreenShell>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  root: {
    gap: 12,
  },
  phaseGuide: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  phaseGuideText: {
    fontSize: 12,
    lineHeight: 17,
  },
  errorStrip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playerCard: {
    width: '31%',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
  },
  revealPlayerCard: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 132,
    justifyContent: 'center',
  },
  revealCardFrame: {
    position: 'absolute',
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderWidth: 1,
    borderRadius: 12,
  },
  revealLock: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  revealHint: {
    fontSize: 11,
    lineHeight: 12,
    textAlign: 'center',
  },
  revealHeroCard: {
    borderWidth: 1.5,
    borderRadius: 26,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
    paddingVertical: 28,
    shadowOpacity: 0.68,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
    overflow: 'hidden',
  },
  revealHeroFrame: {
    position: 'absolute',
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  revealHeroFrameInner: {
    position: 'absolute',
    top: 24,
    right: 24,
    bottom: 24,
    left: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  revealHeroName: {
    fontSize: 34,
    lineHeight: 36,
    textAlign: 'center',
  },
  revealHeroSecret: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    textAlign: 'center',
  },
  revealHeroHint: {
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 13,
  },
  decisionRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  input: {},
  promptBox: {
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  promptFogLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressWrap: {
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  cluesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clueSlot: {
    width: '48.5%',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 7,
  },
  clueSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clueSlotContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 68,
  },
  clueSlotDivider: {
    width: 1,
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },
  clueSlotMainClueCol: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  clueHistoryCol: {
    width: '42%',
    justifyContent: 'flex-start',
  },
  clueSlotValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
    minHeight: 22,
  },
  clueSlotName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  clueHistoryText: {
    fontSize: 11,
    lineHeight: 14,
  },
  clueHistoryList: {
    gap: 2,
  },
  voteSelectedCard: {
    shadowOpacity: 0.72,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  voteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  votePlayerCell: {
    width: '47%',
    minWidth: 0,
    marginBottom: 8,
  },
  votePlayerCard: {
    width: '100%',
    minHeight: 66,
    paddingHorizontal: 9,
    paddingVertical: 9,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
  },
  votePlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  votePlayerName: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
    lineHeight: 18,
  },
  activeVoterCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  activeVoterLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeVoterName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  voteProgressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  voteBoardWrap: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'visible',
    padding: 6,
  },
  votePrivacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  votePrivacyText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  voteSummary: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  resultCard: {
    gap: 12,
  },
  skipButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultStateBanner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  resultStateTitle: {
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '800',
  },
  resultStateSubtitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultBlock: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  resultBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultBlockLabel: {
    fontSize: 12,
  },
  resultPromptRow: {
    gap: 2,
  },
  resultPromptValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  resultImpostorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  resultImpostorCard: {
    alignItems: 'center',
    gap: 4,
  },
  resultImpostorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  voteMapRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteMapTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
  },
  voteMapVoters: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  resultActions: {
    gap: 8,
  },
});
