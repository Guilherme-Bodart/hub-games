import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
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
import { AvatarSprite, Badge, BottomActionDock, Button, Card, Modal } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { getDuration, useReducedMotion } from '@/src/ui/motion';

const START_COUNTDOWN_MS = 3200;
const QUICK_PLAYER_NAMES_PT = ['Alex', 'Bia', 'Caio', 'Duda', 'Enzo', 'Lia', 'Nina', 'Rafa'];
const QUICK_PLAYER_NAMES_EN = ['Alex', 'Bea', 'Cody', 'Dina', 'Evan', 'Lia', 'Nina', 'Rafa'];

const PlayerAvatar = memo(function PlayerAvatar({
  player,
  isLocalDevice,
  onToggleReady,
  onRemove,
  accentTone,
}: {
  player: LobbyPlayer;
  isLocalDevice: boolean;
  onToggleReady: () => void;
  onRemove: () => void;
  accentTone: 'cyan' | 'pink' | 'violet';
}) {
  const { theme } = useTheme();
  const deviceOpacity = isLocalDevice ? 1 : 0.62;
  const toneColor =
    accentTone === 'cyan' ? '#27D5E5' : accentTone === 'pink' ? '#FF8EC6' : '#9A8BFF';
  const readyColor = player.isReady ? '#1FCFAE' : toneColor;

  return (
    <View
      style={[
        styles.playerCard,
        {
          opacity: deviceOpacity,
          borderColor: withAlpha(readyColor, 0.88),
          shadowColor: readyColor,
        },
      ]}>
      {player.isHost ? (
        <View
          style={[
            styles.hostBadge,
            {
              backgroundColor: '#FFD86B',
              borderColor: '#F9BE2F',
            },
          ]}>
          <SymbolView
            name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
            size={11}
            tintColor="#5C3A00"
          />
        </View>
      ) : null}

      {!player.isHost && isLocalDevice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover jogador ${player.name}`}
          onPress={onRemove}
          hitSlop={8}
          style={styles.iconAction}>
          <Text
            style={[
              styles.iconActionLabel,
              {
                color: '#FFFFFF',
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            ×
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${player.name}. ${player.isReady ? 'Marcar pendente' : 'Marcar pronto'}`}
        accessibilityState={{ disabled: !isLocalDevice, selected: player.isReady }}
        disabled={!isLocalDevice}
        onPress={onToggleReady}
        style={styles.playerCardPressable}>
        <View style={styles.avatarShell}>
          <View
            style={[
              styles.avatarOrb,
              {
                borderColor: withAlpha(readyColor, 0.98),
                shadowColor: readyColor,
                backgroundColor: '#FFFFFF',
              },
            ]}>
            <AvatarSprite avatarId={player.avatarId} size={44} style={{ opacity: isLocalDevice ? 1 : 0.78 }} />
          </View>
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.playerName,
            {
              color: '#2B2A46',
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {player.name}
        </Text>
        <SymbolView
          name={
            isLocalDevice
              ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
              : { ios: 'wifi', android: 'wifi', web: 'wifi' }
          }
          size={12}
          tintColor="#6B7790"
          style={styles.deviceIcon}
        />
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.accentTone === nextProps.accentTone &&
    prevProps.isLocalDevice === nextProps.isLocalDevice &&
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.player.isReady === nextProps.player.isReady
  );
});

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
  const showAddCard = canAddPlayer && totalPlayers < lobbyPlayersLimit;
  const canStartGame = totalPlayers >= minimumPlayers && !tooManyPlayers && readyCount === totalPlayers;
  const canHostStartThisLobby = lobby?.mode === 'remote' ? isLocalHost : true;
  const isSettingsEditable = isLocalHost;
  const playersEmptyHint =
    locale === 'pt'
      ? 'Nenhum jogador nesta sala ainda. Toque no card "+" para adicionar.'
      : 'No players in this room yet. Tap the "+" card to add one.';
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
  const playerColumns = viewportWidth >= 980 ? 6 : viewportWidth >= 760 ? 5 : viewportWidth >= 390 ? 4 : 3;
  const playerCellWidth =
    playerColumns === 6 ? '15.4%' : playerColumns === 5 ? '18.8%' : playerColumns === 4 ? '23.2%' : '31.2%';
  const nextAutoName = useMemo(() => {
    const pool = locale === 'pt' ? QUICK_PLAYER_NAMES_PT : QUICK_PLAYER_NAMES_EN;
    const base = pool[totalPlayers % pool.length] ?? (locale === 'pt' ? 'Jogador' : 'Player');
    const cycle = Math.floor(totalPlayers / pool.length) + 1;
    return cycle > 1 ? `${base} ${cycle}` : base;
  }, [locale, totalPlayers]);
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

  useEffect(() => {
    navigation.setOptions({
      title: t('tabs.lobby'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF',
      },
      headerTintColor: '#2B2A46',
      headerTitleStyle: {
        fontFamily: theme.semantic.typography.titleFamily,
        fontWeight: theme.semantic.typography.titleWeight,
      },
    });
  }, [navigation, t, theme.semantic.typography.titleFamily, theme.semantic.typography.titleWeight]);
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={['#FFF5D6', '#FFE8F2', '#E9E6FF', '#DDF3FF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.lobbyMilkOverlay} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View
          style={[
            styles.sessionPanel,
            {
              borderColor: 'rgba(255,255,255,0.96)',
              backgroundColor: 'rgba(255,255,255,0.72)',
              shadowColor: '#90BCEA',
            },
          ]}>
          <View style={styles.sessionHeaderRow}>
            <Text
              style={[
                styles.sessionTitle,
                {
                  color: '#2B2A46',
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
                  borderColor: 'rgba(0,0,0,0.12)',
                  backgroundColor: '#FFFFFF',
                },
              ]}>
              <SymbolView
                name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
                size={18}
                tintColor="#2B2A46"
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
                    color: '#5A5C79',
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {panelCopy.countdownStarting}
              </Text>
              <Text
                style={[
                  styles.countdownValue,
                  {
                    color: '#3D5AFE',
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
                    borderColor: 'rgba(0,0,0,0.1)',
                    backgroundColor: '#FFFFFF',
                  },
                ]}>
                <Text
                  style={[
                    styles.roomCodeText,
                    {
                      color: '#2B2A46',
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
                  tintColor="#5B5D7A"
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isRoomCodeHidden ? 'Mostrar código da sala' : 'Ocultar código da sala'}
                accessibilityState={{ selected: !isRoomCodeHidden }}
                onPress={() => {
                  setIsRoomCodeHidden((current) => !current);
                  void Haptics.selectionAsync();
                }}
                style={[
                  styles.roomCodeMaskButton,
                  {
                    borderColor: 'rgba(0,0,0,0.1)',
                    backgroundColor: '#FFFFFF',
                  },
                ]}>
                <SymbolView
                  name={{
                    ios: isRoomCodeHidden ? 'eye.slash' : 'eye',
                    android: isRoomCodeHidden ? 'visibility_off' : 'visibility',
                    web: isRoomCodeHidden ? 'visibility_off' : 'visibility',
                  }}
                  size={16}
                  tintColor="#5B5D7A"
                />
              </Pressable>
            </View>

            {copied ? (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: '#5A5C79',
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
                accentTone={index % 3 === 0 ? 'cyan' : index % 3 === 1 ? 'pink' : 'violet'}
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
          {showAddCard ? (
            <Animated.View
              entering={
                reduceMotion
                  ? undefined
                  : FadeInDown.duration(getDuration('medium', reduceMotion)).delay(
                      visiblePlayers.length * 30
                    )
              }
              style={[
                styles.playerCell,
                {
                  width: playerCellWidth,
                },
              ]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={locale === 'pt' ? 'Adicionar jogador' : 'Add player'}
                onPress={() => {
                  addPlayer(nextAutoName);
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.addCardButton}>
                <Text
                  style={[
                    styles.addCardSymbol,
                    {
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  +
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
        {!visiblePlayers.length ? (
          <View
            style={[
              styles.emptyPlayersState,
              {
                borderColor: 'rgba(0,0,0,0.08)',
                backgroundColor: 'rgba(255,255,255,0.78)',
              },
            ]}>
            <Text
              style={[
                styles.emptyPlayersText,
                {
                  color: '#5C5F7A',
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
              accessibilityRole="button"
              accessibilityLabel={panelCopy.hostOnly}
              accessibilityState={{
                disabled: !isSettingsEditable,
                selected: actionAuthorityMode === 'host-only',
              }}
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
              accessibilityRole="button"
              accessibilityLabel={panelCopy.collaborative}
              accessibilityState={{
                disabled: !isSettingsEditable,
                selected: actionAuthorityMode === 'collaborative',
              }}
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
                  accessibilityRole="button"
                  accessibilityLabel={panelCopy.words}
                  accessibilityState={{
                    disabled: !isSettingsEditable,
                    selected: impostorContentMode === 'words',
                  }}
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
                  accessibilityRole="button"
                  accessibilityLabel={panelCopy.questions}
                  accessibilityState={{
                    disabled: !isSettingsEditable,
                    selected: impostorContentMode === 'questions',
                  }}
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
                    accessibilityRole="button"
                    accessibilityLabel={`Diminuir ${panelCopy.roundPlayers}`}
                    accessibilityState={{
                      disabled: !isSettingsEditable || impostorTargetPlayers <= minimumPlayers,
                    }}
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
                    accessibilityRole="button"
                    accessibilityLabel={`Aumentar ${panelCopy.roundPlayers}`}
                    accessibilityState={{
                      disabled: !isSettingsEditable || impostorTargetPlayers >= maximumPlayers,
                    }}
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
                      accessibilityRole="button"
                      accessibilityLabel={`${countOption} ${panelCopy.impostors}`}
                      accessibilityState={{ disabled: isDisabled, selected: isActive }}
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
        style={styles.bottomDock}
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
          style: styles.startButton,
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
  lobbyMilkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.56)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 176,
    gap: 12,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  sessionPanel: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionTitle: {
    fontSize: 52,
    lineHeight: 54,
  },
  roomCodeWrap: {
    alignItems: 'center',
    gap: 8,
  },
  roomCodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomCodePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#93BFEA',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  roomCodeMaskButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#93BFEA',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  roomCodeText: {
    fontSize: 24,
    letterSpacing: 2.2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
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
    backgroundColor: '#FFFFFF',
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
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8CA6DB',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    rowGap: 12,
    columnGap: 10,
  },
  emptyPlayersState: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyPlayersText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  playerCell: {
    minWidth: 0,
  },
  playerCard: {
    borderWidth: 1.8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    minHeight: 128,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: 'hidden',
  },
  playerCardPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minHeight: 126,
  },
  avatarShell: {
    position: 'relative',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOrb: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  playerName: {
    maxWidth: '100%',
    fontSize: 13,
    lineHeight: 15,
    textAlign: 'center',
  },
  deviceIcon: {
    marginTop: 1,
  },
  hostBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 19,
    height: 19,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAction: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 19,
    height: 19,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5A81',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  iconActionLabel: {
    fontSize: 13,
    lineHeight: 13,
  },
  addCardButton: {
    minHeight: 128,
    borderRadius: 18,
    borderWidth: 1.8,
    borderColor: '#BFD3EC',
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#90BCEA',
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addCardSymbol: {
    color: '#8E95A9',
    fontSize: 44,
    lineHeight: 44,
  },
  bottomDock: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderTopWidth: 1,
    shadowColor: '#9AAFD6',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 10,
  },
  startButton: {
    borderRadius: 999,
    minHeight: 58,
    shadowColor: '#FF6C6C',
    shadowOpacity: 0.34,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },
});

