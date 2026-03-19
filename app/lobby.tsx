import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGameById } from '@/src/features/catalog';
import { createImpostorRound } from '@/src/features/games/impostor/logic';
import {
  initializeRemoteImpostorRound,
  subscribeRemoteImpostorState,
} from '@/src/features/games/impostor/realtime';
import { createSintoniaRound } from '@/src/features/games/sintonia/logic';
import { initializeRemoteSintoniaRound } from '@/src/features/games/sintonia/realtime';
import {
  LOBBY_SETTINGS_KEYS,
  LobbyPlayer,
  resolveImpostorContentMode,
  resolveImpostorCount,
  resolveImpostorRoundTargetPlayers,
  resolveLobbyActionAuthorityMode,
  useLobbySessionStore,
} from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, Badge, BottomActionDock, Button, Card, Input, Modal } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { getDuration, useReducedMotion } from '@/src/ui/motion';

const CARD_BORDER_WIDTH = 1.5;
const READY_BORDER_TRANSITION_MS = 320;
const PENDING_BORDER_PULSE_MS = 640;
const READY_GLOW_PULSE_MS = 680;
const START_COUNTDOWN_MS = 3200;

function PlayerAvatar({
  player,
  isLocalDevice,
  onToggleReady,
  onRemove,
}: {
  player: LobbyPlayer;
  isLocalDevice: boolean;
  onToggleReady: () => void;
  onRemove: () => void;
}) {
  const { theme } = useTheme();
  const pendingPulse = useSharedValue(0.56);
  const glow = useSharedValue(0.7);
  const readyProgress = useSharedValue(player.isReady ? 1 : 0);

  useEffect(() => {
    readyProgress.value = withTiming(player.isReady ? 1 : 0, {
      duration: READY_BORDER_TRANSITION_MS,
    });
  }, [player.isReady, readyProgress]);

  useEffect(() => {
    if (player.isReady) {
      glow.value = withRepeat(withTiming(1, { duration: READY_GLOW_PULSE_MS }), -1, true);
      return;
    }

    glow.value = withTiming(0.65, { duration: 220 });
  }, [glow, player.isReady]);

  useEffect(() => {
    if (player.isReady) {
      pendingPulse.value = withTiming(0.16, { duration: 180 });
      return;
    }

    pendingPulse.value = 0.64;
    pendingPulse.value = withRepeat(
      withTiming(1.16, { duration: PENDING_BORDER_PULSE_MS }),
      -1,
      true
    );
  }, [pendingPulse, player.isReady]);

  const readyGlowStyle = useAnimatedStyle(() => {
    const readyGlow = readyProgress.value * (0.82 + glow.value * 0.3);
    const pendingGlow = (1 - readyProgress.value) * (0.54 + pendingPulse.value * 0.42);

    return {
      shadowOpacity: 0.1 + readyGlow * 0.44 + pendingGlow * 0.36,
      shadowRadius:
        8 +
        readyProgress.value * (10 + glow.value * 4) +
        (1 - readyProgress.value) * (7 + pendingPulse.value * 4),
      elevation:
        3 +
        readyProgress.value * (7 + glow.value * 3) +
        (1 - readyProgress.value) * (6 + pendingPulse.value * 6),
    };
  });

  const readyBorderStyle = useAnimatedStyle(() => ({
    opacity: readyProgress.value * (0.86 + glow.value * 0.28),
  }));

  const pendingBorderStyle = useAnimatedStyle(() => ({
    opacity: (1 - readyProgress.value) * (0.72 + pendingPulse.value * 0.34),
  }));

  return (
    <Animated.View
      style={[
        styles.playerRow,
        {
          borderColor: 'transparent',
          backgroundColor: theme.semantic.bg.surface,
          shadowColor: player.isReady
            ? theme.semantic.status.success
            : theme.semantic.status.warning,
        },
        readyGlowStyle,
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pendingBorder,
          {
            borderColor: withAlpha(theme.semantic.status.warning, 0.98),
          },
          pendingBorderStyle,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.readyBorder,
          {
            borderColor: withAlpha(theme.semantic.status.success, 0.98),
          },
          readyBorderStyle,
        ]}
      />

      {player.isHost ? (
        <View style={styles.hostBadge}>
          <SymbolView
            name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
            size={14}
            tintColor={theme.semantic.button.primary.bg}
          />
        </View>
      ) : null}

      {!player.isHost && isLocalDevice ? (
        <Pressable
          onPress={onRemove}
          style={styles.iconAction}>
          <Text
            style={[
              styles.iconActionLabel,
              {
                color: theme.semantic.status.error,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            X
          </Text>
        </Pressable>
      ) : null}

      <Pressable disabled={!isLocalDevice} onPress={onToggleReady} style={styles.avatarPressable}>
        <AvatarSprite
          avatarId={player.avatarId}
          size={56}
          style={{ opacity: isLocalDevice ? 1 : 0.88 }}
        />
      </Pressable>

      <View style={styles.playerMeta}>
        <View style={styles.playerNameRow}>
          <SymbolView
            name={
              isLocalDevice
                ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
                : { ios: 'cloud.fill', android: 'cloud', web: 'cloud' }
            }
            size={12}
            tintColor={theme.semantic.text.muted}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.playerName,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {player.name}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function LobbyScreen() {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const navigation = useNavigation();
  const allowLeaveRef = useRef(false);
  const handledRemoteRoundIdRef = useRef<string | null>(null);
  const consumedStartAtRef = useRef<number | null>(null);

  const lobby = useLobbySessionStore((state) => state.lobby);
  const realtimeStatus = useLobbySessionStore((state) => state.realtimeStatus);
  const realtimeError = useLobbySessionStore((state) => state.realtimeError);
  const sessionRestoreStatus = useLobbySessionStore((state) => state.sessionRestoreStatus);
  const addPlayer = useLobbySessionStore((state) => state.addPlayerToSelectedDevice);
  const togglePlayerReady = useLobbySessionStore((state) => state.togglePlayerReady);
  const removePlayer = useLobbySessionStore((state) => state.removePlayer);
  const updateGameSettings = useLobbySessionStore((state) => state.updateGameSettings);
  const scheduleRemoteStart = useLobbySessionStore((state) => state.scheduleRemoteStart);
  const clearRemoteStart = useLobbySessionStore((state) => state.clearRemoteStart);
  const endSession = useLobbySessionStore((state) => state.endSession);

  const [nickname, setNickname] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRoomCodeHidden, setIsRoomCodeHidden] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [countdownTargetAt, setCountdownTargetAt] = useState<number | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const visibleDevices = useMemo(() => {
    if (!lobby) {
      return [];
    }

    return lobby.mode === 'local'
      ? lobby.devices.filter((device) => device.isLocalDevice)
      : lobby.devices;
  }, [lobby]);

  const visiblePlayers = useMemo(
    () =>
      visibleDevices.flatMap((device) =>
        device.players.map((player) => ({
          player,
          isLocalDevice: device.isLocalDevice,
        }))
      ),
    [visibleDevices]
  );

  const totalPlayers = useMemo(
    () => visibleDevices.reduce((total, device) => total + device.players.length, 0),
    [visibleDevices]
  );

  const readyCount = useMemo(
    () =>
      visibleDevices.reduce(
        (total, device) => total + device.players.filter((player) => player.isReady).length,
        0
      ),
    [visibleDevices]
  );

  const selectedGame = lobby ? getGameById(lobby.gameId) : undefined;
  const minimumPlayers = selectedGame?.players.min ?? 1;
  const maximumPlayers = selectedGame?.players.max ?? Number.MAX_SAFE_INTEGER;
  const modeLabel = lobby
    ? lobby.mode === 'local'
      ? t('common.localMode')
      : t('common.remoteMode')
    : t('common.hybridMode');
  const isLocalHost = useMemo(() => {
    if (!lobby) {
      return false;
    }

    return (
      lobby.devices
        .find((device) => device.id === lobby.selectedDeviceId)
        ?.players.some((player) => player.isHost) ?? false
    );
  }, [lobby]);
  const actionAuthorityMode = lobby
    ? resolveLobbyActionAuthorityMode(lobby.gameSettings)
    : 'host-only';
  const isImpostorLobby = lobby?.gameId === 'impostor-neon';
  const isRemoteImpostorLobby = lobby?.mode === 'remote' && isImpostorLobby;
  const isRemoteSintoniaLobby = lobby?.mode === 'remote' && lobby?.gameId === 'sintonia';
  const impostorContentMode = lobby ? resolveImpostorContentMode(lobby.gameSettings) : 'words';
  const impostorTargetPlayers = lobby ? resolveImpostorRoundTargetPlayers(lobby.gameSettings) : 12;
  const impostorCount = lobby ? resolveImpostorCount(lobby.gameSettings) : 1;
  const lobbyPlayersLimit = isImpostorLobby
    ? Math.min(impostorTargetPlayers, maximumPlayers)
    : maximumPlayers;
  const tooManyPlayers = totalPlayers > lobbyPlayersLimit;
  const canAddPlayer = totalPlayers < lobbyPlayersLimit;
  const canStartGame = totalPlayers >= minimumPlayers && !tooManyPlayers && readyCount === totalPlayers;
  const canHostStartThisLobby = lobby?.mode === 'remote' ? isLocalHost : true;
  const isSettingsEditable = isLocalHost;
  const playersEmptyHint =
    locale === 'pt'
      ? 'Nenhum jogador nesta sala ainda. Adicione pelo menos um apelido para comecar.'
      : 'No players in this room yet. Add at least one nickname to get started.';
  const impostorLobbyBadgeLabel =
    locale === 'pt'
      ? `${impostorCount} impostor${impostorCount > 1 ? 'es' : ''}`
      : `${impostorCount} impostor${impostorCount > 1 ? 's' : ''}`;
  const remoteStatusTone =
    realtimeStatus === 'connected'
      ? 'success'
      : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting' || realtimeStatus === 'idle'
        ? 'neutral'
        : 'error';
  const remoteStatusLabel =
    realtimeStatus === 'connected'
      ? t('connection.online')
      : realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting' || realtimeStatus === 'idle'
        ? t('connection.reconnecting')
        : t('connection.error');
  const lobbyTitle = selectedGame ? selectedGame.title[locale] : t('tabs.lobby');
  const isCompactViewport = viewportWidth < 390;
  const playerColumns =
    viewportWidth >= 760 ? 4 : viewportWidth >= 560 ? 3 : viewportWidth >= 390 ? 2 : 1;
  const playerCellWidth =
    playerColumns === 4 ? '23.6%' : playerColumns === 3 ? '31.8%' : playerColumns === 2 ? '48.6%' : '100%';
  const panelCopy =
    locale === 'pt'
      ? {
          settingsTitle: 'Configuração da partida',
          controlMode: 'Controle de ações',
          hostOnly: 'Só host',
          collaborative: 'Colaborativo',
          impostorMode: 'Modalidade',
          words: 'Palavras',
          questions: 'Perguntas',
          roundPlayers: 'Limite de jogadores',
          impostors: 'Impostores',
          hostOnlyHint: 'Apenas o host pode alterar as configurações.',
          waitingHostStart: 'Aguardando host iniciar',
          countdownStarting: 'Partida iniciando em',
        }
      : {
          settingsTitle: 'Match settings',
          controlMode: 'Action control',
          hostOnly: 'Host only',
          collaborative: 'Collaborative',
          impostorMode: 'Mode',
          words: 'Words',
          questions: 'Questions',
          roundPlayers: 'Player limit',
          impostors: 'Impostors',
          hostOnlyHint: 'Only the host can change settings.',
          waitingHostStart: 'Waiting host to start',
          countdownStarting: 'Match starting in',
        };
  const leaveLobby = useCallback(() => {
    allowLeaveRef.current = true;
    if (lobby?.mode === 'remote' && isLocalHost) {
      void clearRemoteStart().catch(() => undefined);
    }
    endSession();

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }, [clearRemoteStart, endSession, isLocalHost, lobby?.mode, router]);

  useEffect(() => {
    if (!lobby) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowLeaveRef.current) {
        return;
      }

      event.preventDefault();

      if (Platform.OS === 'web') {
        const shouldLeave = globalThis.confirm
          ? globalThis.confirm(t('lobby.leaveConfirmMessage'))
          : true;

        if (shouldLeave) {
          leaveLobby();
        }

        return;
      }

      Alert.alert(t('lobby.leaveConfirmTitle'), t('lobby.leaveConfirmMessage'), [
        {
          text: t('common.stay'),
          style: 'cancel',
        },
        {
          text: t('common.leave'),
          style: 'destructive',
          onPress: () => {
            leaveLobby();
          },
        },
      ]);
    });

    return unsubscribe;
  }, [leaveLobby, lobby, navigation, t]);

  useEffect(() => {
    if (!lobby || !isRemoteImpostorLobby) {
      handledRemoteRoundIdRef.current = null;
      return;
    }

    const unsubscribe = subscribeRemoteImpostorState({
      roomCode: lobby.roomCode,
      onState: (round) => {
        if (!round) {
          return;
        }

        if (handledRemoteRoundIdRef.current === round.id) {
          return;
        }

        handledRemoteRoundIdRef.current = round.id;
        router.push({
          pathname: '/game/[gameId]',
          params: { gameId: lobby.gameId },
        });
      },
      onError: (_message) => undefined,
    });

    return unsubscribe;
  }, [isRemoteImpostorLobby, lobby, router]);

  const startGameNow = useCallback(async () => {
    if (!lobby) {
      return;
    }

    if (isRemoteImpostorLobby && isLocalHost) {
      try {
        const initialRound = createImpostorRound({ lobby, locale });
        handledRemoteRoundIdRef.current = initialRound.id;
        await initializeRemoteImpostorRound(
          lobby.roomCode,
          initialRound,
          lobby.selectedDeviceId
        );
      } catch (error) {
        Alert.alert(
          'Impostor Neon',
          error instanceof Error && error.message
            ? error.message
            : 'Nao foi possivel iniciar a partida agora.'
        );
        return;
      }
    }

    if (isRemoteSintoniaLobby && isLocalHost) {
      try {
        const initialRound = createSintoniaRound({ lobby, locale });
        await initializeRemoteSintoniaRound(
          lobby.roomCode,
          initialRound,
          lobby.selectedDeviceId
        );
      } catch (error) {
        Alert.alert(
          'Sintonia',
          error instanceof Error && error.message
            ? error.message
            : 'Nao foi possivel iniciar a rodada agora.'
        );
        return;
      }
    }

    triggerGameFeedback('result');
    router.push({
      pathname: '/game/[gameId]',
      params: { gameId: lobby.gameId },
    });
  }, [isLocalHost, isRemoteImpostorLobby, isRemoteSintoniaLobby, lobby, locale, router]);

  const beginStartSequence = useCallback(async () => {
    if (!lobby || !canStartGame || !canHostStartThisLobby) {
      return;
    }

    const targetAt = Date.now() + START_COUNTDOWN_MS;

    if (lobby.mode === 'remote') {
      try {
        await scheduleRemoteStart(targetAt);
      } catch (error) {
        Alert.alert(
          t('tabs.lobby'),
          error instanceof Error && error.message ? error.message : t('connection.error')
        );
      }
      return;
    }

    setCountdownTargetAt(targetAt);
    triggerGameFeedback('confirm');
  }, [canHostStartThisLobby, canStartGame, lobby, scheduleRemoteStart, t]);

  useEffect(() => {
    if (!lobby || lobby.mode !== 'remote') {
      consumedStartAtRef.current = null;
      return;
    }

    setCountdownTargetAt(lobby.startAt);
  }, [lobby?.mode, lobby?.startAt]);

  useEffect(() => {
    if (!countdownTargetAt || !lobby) {
      setCountdownValue(null);
      return;
    }

    const syncCountdown = () => {
      const remainingMs = countdownTargetAt - Date.now();
      const nextValue = Math.max(0, Math.ceil(remainingMs / 1000));
      setCountdownValue(nextValue);

      if (remainingMs > 0) {
        return;
      }

      if (consumedStartAtRef.current === countdownTargetAt) {
        return;
      }

      consumedStartAtRef.current = countdownTargetAt;
      setCountdownTargetAt(null);

      void (async () => {
        await startGameNow();

        if (lobby.mode === 'remote' && isLocalHost) {
          setTimeout(() => {
            void clearRemoteStart().catch(() => undefined);
          }, 1600);
        }
      })();
    };

    syncCountdown();
    const interval = setInterval(syncCountdown, 120);

    return () => {
      clearInterval(interval);
    };
  }, [clearRemoteStart, countdownTargetAt, isLocalHost, lobby, startGameNow]);

  if (!lobby) {
    if (sessionRestoreStatus === 'restoring') {
      return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
          <View style={styles.emptyWrap}>
            <Card title={t('tabs.lobby')} subtitle={t('connection.reconnecting')} />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}> 
        <View style={styles.emptyWrap}>
          <Card title={t('tabs.lobby')} subtitle={t('catalog.subtitle')}>
            <Button label={t('tabs.catalog')} onPress={() => router.replace('/(tabs)')} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.sessionPanel,
            {
              borderColor: withAlpha(theme.semantic.button.primary.bg, 0.52),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.74),
              shadowColor: theme.semantic.shadow.neon,
            },
          ]}>
          <View style={styles.sessionHeaderRow}>
            <Text
              style={[
                styles.sessionTitle,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {lobbyTitle}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={panelCopy.settingsTitle}
              onPress={() => setSettingsVisible(true)}
              style={[
                styles.settingsIconButton,
                {
                  borderColor: theme.semantic.border.subtle,
                  backgroundColor: theme.semantic.bg.surface,
                },
              ]}>
              <SymbolView
                name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
                size={17}
                tintColor={theme.semantic.button.secondary.bg}
              />
            </Pressable>
          </View>

          {countdownValue !== null ? (
            <View
              style={[
                styles.countdownPill,
                {
                  borderColor: theme.semantic.button.primary.bg,
                  backgroundColor: theme.semantic.bg.elevated,
                },
              ]}>
              <Text
                style={[
                  styles.countdownLabel,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
              </Text>
              <Text
                style={[
                  styles.countdownValue,
                  {
                    color: theme.semantic.button.primary.bg,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {countdownValue}
              </Text>
            </View>
          ) : null}

        {lobby.mode === 'remote' ? (
          <View style={styles.roomCodeWrap}>
            <View style={styles.roomCodeActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('lobby.copyCode')}
                onPress={() => {
                  void Clipboard.setStringAsync(lobby.roomCode);
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                style={[
                  styles.roomCodePill,
                  {
                    borderColor: theme.semantic.border.accent,
                    backgroundColor: theme.semantic.bg.surface,
                  },
                ]}>
                <Text
                  style={[
                    styles.roomCodeText,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                      fontSize: isCompactViewport ? 20 : 24,
                    },
                  ]}>
                  {isRoomCodeHidden ? '•'.repeat(lobby.roomCode.length) : lobby.roomCode}
                </Text>
                <SymbolView
                  name={{ ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
                  size={15}
                  tintColor={theme.semantic.text.secondary}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsRoomCodeHidden((current) => !current);
                  void Haptics.selectionAsync();
                }}
                style={[
                  styles.roomCodeMaskButton,
                  {
                    borderColor: theme.semantic.border.subtle,
                    backgroundColor: theme.semantic.bg.surface,
                  },
                ]}>
                <SymbolView
                  name={{
                    ios: isRoomCodeHidden ? 'eye.slash' : 'eye',
                    android: isRoomCodeHidden ? 'visibility_off' : 'visibility',
                    web: isRoomCodeHidden ? 'visibility_off' : 'visibility',
                  }}
                  size={16}
                  tintColor={theme.semantic.text.secondary}
                />
              </Pressable>
            </View>

            {copied ? (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {t('lobby.codeCopied')}
              </Text>
            ) : null}
          </View>
        ) : null}

          <View style={styles.headerBadges}>
            <Badge label={`${readyCount}/${totalPlayers} ${t('common.ready')}`} variant="success" />
            {isImpostorLobby ? (
              <Badge label={impostorLobbyBadgeLabel} variant="error" />
            ) : null}
            <Badge label={modeLabel} variant="neutral" />
            {lobby.mode === 'remote' ? (
              <Badge label={remoteStatusLabel} variant={remoteStatusTone} />
            ) : null}
          </View>
        </View>

        {realtimeError && lobby.mode === 'remote' ? (
          <Text
            style={[
              styles.realtimeHint,
              {
                color: theme.semantic.status.warning,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {realtimeError}
          </Text>
        ) : null}

        <View style={styles.addRow}>
          <Input
            value={nickname}
            onChangeText={setNickname}
            disabled={!canAddPlayer}
            placeholder={t('lobby.addPersonPlaceholder')}
            style={styles.addInputWrap}
          />
          <Pressable
            onPress={() => {
              if (!nickname.trim() || !canAddPlayer) {
                return;
              }

              addPlayer(nickname);
              setNickname('');
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.addIcon,
              {
                backgroundColor: theme.semantic.button.secondary.bg,
                borderColor: theme.semantic.border.subtle,
                opacity: canAddPlayer ? 1 : 0.45,
              },
            ]}>
            <Text
              style={[
                styles.addIconText,
                {
                  color: theme.semantic.button.secondary.text,
                  fontFamily: theme.semantic.typography.numberFamily,
                  fontWeight: theme.semantic.typography.numberWeight,
                },
              ]}>
              +
            </Text>
          </Pressable>
        </View>
        <View style={styles.playersList}>
          {visiblePlayers.map(({ player, isLocalDevice }, index) => (
            <Animated.View
              key={player.id}
              entering={
                reduceMotion
                  ? undefined
                  : FadeInDown.duration(getDuration('medium', reduceMotion)).delay(index * 40)
              }
              exiting={
                reduceMotion ? undefined : FadeOutUp.duration(getDuration('fast', reduceMotion))
              }
              layout={reduceMotion ? undefined : Layout.springify().damping(18).stiffness(170)}
              style={[
                styles.playerCell,
                {
                  width: playerCellWidth,
                },
              ]}>
              <PlayerAvatar
                player={player}
                isLocalDevice={isLocalDevice}
                onToggleReady={() => {
                  if (!isLocalDevice) {
                    return;
                  }
                  void Haptics.selectionAsync();
                  togglePlayerReady(player.id);
                }}
                onRemove={() => removePlayer(player.id)}
              />
            </Animated.View>
          ))}
        </View>
        {!visiblePlayers.length ? (
          <View
            style={[
              styles.emptyPlayersState,
              {
                borderColor: withAlpha(theme.semantic.border.subtle, 0.9),
                backgroundColor: withAlpha(theme.semantic.bg.surface, 0.62),
              },
            ]}>
            <Text
              style={[
                styles.emptyPlayersText,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {playersEmptyHint}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={settingsVisible}
        title={panelCopy.settingsTitle}
        onClose={() => setSettingsVisible(false)}>
        {!isSettingsEditable ? (
          <Text
            style={[
              styles.settingsHint,
              {
                color: theme.semantic.text.muted,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {panelCopy.hostOnlyHint}
          </Text>
        ) : null}

        <View style={styles.settingsBlock}>
          <Text
            style={[
              styles.settingsLabel,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {panelCopy.controlMode}
          </Text>
          <View style={styles.settingsToggleRow}>
            <Pressable
              disabled={!isSettingsEditable}
              onPress={() =>
                updateGameSettings({
                  [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: 'host-only',
                })
              }
              style={[
                styles.settingsToggle,
                {
                  borderColor:
                    actionAuthorityMode === 'host-only'
                      ? theme.semantic.button.primary.bg
                      : theme.semantic.border.subtle,
                  backgroundColor:
                    actionAuthorityMode === 'host-only'
                      ? theme.semantic.button.primary.bg
                      : theme.semantic.bg.surface,
                  opacity: isSettingsEditable ? 1 : 0.45,
                },
              ]}>
              <Text
                style={[
                  styles.settingsToggleText,
                  {
                    color:
                      actionAuthorityMode === 'host-only'
                        ? theme.semantic.button.primary.text
                        : theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {panelCopy.hostOnly}
              </Text>
            </Pressable>

            <Pressable
              disabled={!isSettingsEditable}
              onPress={() =>
                updateGameSettings({
                  [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: 'collaborative',
                })
              }
              style={[
                styles.settingsToggle,
                {
                  borderColor:
                    actionAuthorityMode === 'collaborative'
                      ? theme.semantic.button.primary.bg
                      : theme.semantic.border.subtle,
                  backgroundColor:
                    actionAuthorityMode === 'collaborative'
                      ? theme.semantic.button.primary.bg
                      : theme.semantic.bg.surface,
                  opacity: isSettingsEditable ? 1 : 0.45,
                },
              ]}>
              <Text
                style={[
                  styles.settingsToggleText,
                  {
                    color:
                      actionAuthorityMode === 'collaborative'
                        ? theme.semantic.button.primary.text
                        : theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {panelCopy.collaborative}
              </Text>
            </Pressable>
          </View>

          {isImpostorLobby ? (
            <>
              <Text
                style={[
                  styles.settingsLabel,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {panelCopy.impostorMode}
              </Text>
              <View style={styles.settingsToggleRow}>
                <Pressable
                  disabled={!isSettingsEditable}
                  onPress={() =>
                    updateGameSettings({
                      [LOBBY_SETTINGS_KEYS.impostorContentMode]: 'words',
                    })
                  }
                  style={[
                    styles.settingsToggle,
                    {
                      borderColor:
                        impostorContentMode === 'words'
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                      backgroundColor:
                        impostorContentMode === 'words'
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.bg.surface,
                      opacity: isSettingsEditable ? 1 : 0.45,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.settingsToggleText,
                      {
                        color:
                          impostorContentMode === 'words'
                            ? theme.semantic.button.primary.text
                            : theme.semantic.text.secondary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                      },
                    ]}>
                    {panelCopy.words}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!isSettingsEditable}
                  onPress={() =>
                    updateGameSettings({
                      [LOBBY_SETTINGS_KEYS.impostorContentMode]: 'questions',
                    })
                  }
                  style={[
                    styles.settingsToggle,
                    {
                      borderColor:
                        impostorContentMode === 'questions'
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                      backgroundColor:
                        impostorContentMode === 'questions'
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.bg.surface,
                      opacity: isSettingsEditable ? 1 : 0.45,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.settingsToggleText,
                      {
                        color:
                          impostorContentMode === 'questions'
                            ? theme.semantic.button.primary.text
                            : theme.semantic.text.secondary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                      },
                    ]}>
                    {panelCopy.questions}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.settingsStepperRow}>
                <Text
                  style={[
                    styles.settingsLabel,
                    {
                      color: theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {panelCopy.roundPlayers}
                </Text>
                <View style={styles.stepperControls}>
                  <Pressable
                    disabled={!isSettingsEditable || impostorTargetPlayers <= minimumPlayers}
                    onPress={() =>
                      updateGameSettings({
                        [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: impostorTargetPlayers - 1,
                      })
                    }
                    style={[
                      styles.stepperButton,
                      {
                        borderColor: theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.surface,
                        opacity:
                          isSettingsEditable && impostorTargetPlayers > minimumPlayers ? 1 : 0.4,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.stepperButtonText,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.numberFamily,
                          fontWeight: theme.semantic.typography.numberWeight,
                        },
                      ]}>
                      -
                    </Text>
                  </Pressable>
                  <Text
                    style={[
                      styles.stepperValue,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.numberFamily,
                        fontWeight: theme.semantic.typography.numberWeight,
                      },
                    ]}>
                    {impostorTargetPlayers}
                  </Text>
                  <Pressable
                    disabled={!isSettingsEditable || impostorTargetPlayers >= maximumPlayers}
                    onPress={() =>
                      updateGameSettings({
                        [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: impostorTargetPlayers + 1,
                      })
                    }
                    style={[
                      styles.stepperButton,
                      {
                        borderColor: theme.semantic.border.subtle,
                        backgroundColor: theme.semantic.bg.surface,
                        opacity:
                          isSettingsEditable && impostorTargetPlayers < maximumPlayers ? 1 : 0.4,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.stepperButtonText,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.numberFamily,
                          fontWeight: theme.semantic.typography.numberWeight,
                        },
                      ]}>
                      +
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text
                style={[
                  styles.settingsLabel,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {panelCopy.impostors}
              </Text>
              <View style={styles.settingsToggleRow}>
                {[1, 2].map((countOption) => {
                  const isDisabled =
                    !isSettingsEditable || (countOption === 2 && totalPlayers < 7);
                  const isActive = impostorCount === countOption;

                  return (
                    <Pressable
                      key={`imp-${countOption}`}
                      disabled={isDisabled}
                      onPress={() =>
                        updateGameSettings({
                          [LOBBY_SETTINGS_KEYS.impostorCount]: countOption,
                        })
                      }
                      style={[
                        styles.settingsToggle,
                        {
                          borderColor: isActive
                            ? theme.semantic.button.primary.bg
                            : theme.semantic.border.subtle,
                          backgroundColor: isActive
                            ? theme.semantic.button.primary.bg
                            : theme.semantic.bg.surface,
                          opacity: isDisabled ? 0.35 : 1,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.settingsToggleText,
                          {
                            color: isActive
                              ? theme.semantic.button.primary.text
                              : theme.semantic.text.secondary,
                            fontFamily: theme.semantic.typography.titleFamily,
                            fontWeight: theme.semantic.typography.titleWeight,
                          },
                        ]}>
                        {countOption}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      </Modal>

      <BottomActionDock
        primaryAction={{
          label:
            countdownValue !== null
              ? `${panelCopy.countdownStarting} ${countdownValue}`
              : canStartGame && canHostStartThisLobby
                ? t('lobby.startGame')
                : tooManyPlayers
                  ? t('lobby.tooManyPlayers', { max: lobbyPlayersLimit })
                  : totalPlayers < minimumPlayers
                    ? t('lobby.needMorePlayers', { min: minimumPlayers })
                    : !canHostStartThisLobby
                      ? panelCopy.waitingHostStart
                      : t('lobby.waiting', { ready: readyCount, total: totalPlayers }),
          onPress: () => {
            void beginStartSequence();
          },
          disabled: !canStartGame || !canHostStartThisLobby || countdownValue !== null,
          variant: 'primary',
        }}
      />
    </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    paddingBottom: 164,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  sessionPanel: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionTitle: {
    fontSize: 36,
    lineHeight: 40,
  },
  roomCodeWrap: {
    alignItems: 'center',
    gap: 4,
  },
  roomCodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomCodePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomCodeMaskButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomCodeText: {
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
  },
  countdownPill: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownLabel: {
    fontSize: 12,
  },
  countdownValue: {
    fontSize: 18,
    lineHeight: 18,
  },
  realtimeHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsIconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBlock: {
    gap: 8,
  },
  settingsLabel: {
    fontSize: 13,
  },
  settingsHint: {
    fontSize: 12,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsToggle: {
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  settingsToggleText: {
    fontSize: 13,
  },
  settingsStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 19,
    lineHeight: 19,
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
  },
  playersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyPlayersState: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emptyPlayersText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  playerCell: {
    minWidth: 150,
  },
  playerRow: {
    width: '100%',
    minHeight: 114,
    borderWidth: CARD_BORDER_WIDTH,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarPressable: {
    borderRadius: 999,
    marginTop: 8,
  },
  playerMeta: {
    width: '100%',
    marginTop: 6,
    alignItems: 'center',
  },
  playerNameRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  playerName: {
    fontSize: 14,
    textAlign: 'center',
  },
  hostBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  pendingBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: CARD_BORDER_WIDTH + 0.4,
    borderStyle: 'dashed',
  },
  readyBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: CARD_BORDER_WIDTH + 0.35,
  },
  iconAction: {
    position: 'absolute',
    top: 5,
    right: 6,
    zIndex: 2,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  iconActionLabel: {
    fontSize: 16,
    lineHeight: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  addInputWrap: {
    flex: 1,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: {
    fontSize: 24,
    lineHeight: 24,
  },
});
