import { useMemo } from 'react';

import {
  resolveImpostorClueTurnSeconds,
  resolveImpostorContentMode,
  resolveImpostorCount,
  resolveImpostorRoundTargetPlayers,
  resolveLobbyActionAuthorityMode,
} from '@/src/features/lobby/gameSettings';
import { getLobbyGameMeta } from '@/src/features/lobby/lobbyGameMeta';
import {
  buildLobbyPanelCopy,
  getImpostorLobbyBadgeLabel,
  getPlayersEmptyHint,
  getRoomCodeVisibilityLabels,
} from '@/src/features/lobby/lobby.copy';
import type { VisibleLobbyPlayer } from '@/src/features/lobby/lobby.types';
import { resolveNextAutoPlayerName } from '@/src/features/lobby/lobby.utils';
import type { Locale } from '@/src/i18n';
import type { HybridLobbyState } from '@/src/features/lobby/types';
import type { TranslationKey } from '@/src/i18n/types';

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

type UseLobbyDerivedStateParams = {
  lobby: HybridLobbyState | null;
  locale: Locale;
  viewportWidth: number;
  realtimeStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  t: TranslateFn;
};

export function useLobbyDerivedState({
  lobby,
  locale,
  viewportWidth,
  realtimeStatus,
  t,
}: UseLobbyDerivedStateParams) {
  const visibleDevices = useMemo(() => {
    if (!lobby) {
      return [];
    }
    return lobby.mode === 'local' ? lobby.devices.filter((device) => device.isLocalDevice) : lobby.devices;
  }, [lobby]);

  const visiblePlayers = useMemo<VisibleLobbyPlayer[]>(
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
    () => visibleDevices.reduce((total, device) => total + device.players.filter((player) => player.isReady).length, 0),
    [visibleDevices]
  );

  const selectedGame = lobby ? getLobbyGameMeta(lobby.gameId) : undefined;
  const minimumPlayers = selectedGame?.players.min ?? 1;
  const maximumPlayers = selectedGame?.players.max ?? Number.MAX_SAFE_INTEGER;
  const lobbyTitle = selectedGame ? selectedGame.title[locale] : t('tabs.lobby');
  const isLocalHost =
    lobby?.devices
      .find((device) => device.id === lobby.selectedDeviceId)
      ?.players.some((player) => player.isHost) ?? false;

  const actionAuthorityMode = lobby ? resolveLobbyActionAuthorityMode(lobby.gameSettings) : 'host-only';
  const isImpostorLobby = lobby?.gameId === 'impostor-neon';
  const isRemoteImpostorLobby = lobby?.mode === 'remote' && isImpostorLobby;
  const isRemoteSintoniaLobby = lobby?.mode === 'remote' && lobby?.gameId === 'sintonia';
  const impostorContentMode = lobby ? resolveImpostorContentMode(lobby.gameSettings) : 'words';
  const impostorTargetPlayers = lobby ? resolveImpostorRoundTargetPlayers(lobby.gameSettings) : 12;
  const impostorCount = lobby ? resolveImpostorCount(lobby.gameSettings) : 1;
  const impostorClueTurnSeconds = lobby ? resolveImpostorClueTurnSeconds(lobby.gameSettings) : 20;
  const lobbyPlayersLimit = isImpostorLobby ? Math.min(impostorTargetPlayers, maximumPlayers) : maximumPlayers;
  const tooManyPlayers = totalPlayers > lobbyPlayersLimit;
  const canAddPlayer = totalPlayers < lobbyPlayersLimit;
  const showAddCard = canAddPlayer && totalPlayers < lobbyPlayersLimit;
  const canStartGame = totalPlayers >= minimumPlayers && !tooManyPlayers && readyCount === totalPlayers;
  const canHostStartThisLobby = lobby?.mode === 'remote' ? isLocalHost : true;
  const isSettingsEditable = isLocalHost;
  const isCompactViewport = viewportWidth < 390;
  const playerColumns = viewportWidth >= 980 ? 6 : viewportWidth >= 760 ? 5 : 4;
  const playerGap = 12;
  const nextAutoName = resolveNextAutoPlayerName(locale, totalPlayers);

  const panelCopy = buildLobbyPanelCopy(locale);
  const playersEmptyHint = getPlayersEmptyHint(locale);
  const impostorLobbyBadgeLabel = getImpostorLobbyBadgeLabel(locale, impostorCount);
  const roomCodeLabels = getRoomCodeVisibilityLabels(locale);
  const impostorContentModeLabel = isImpostorLobby
    ? impostorContentMode === 'questions'
      ? panelCopy.questions
      : panelCopy.words
    : null;
  const clueTimerBadgeLabel = isImpostorLobby ? `${impostorClueTurnSeconds}${panelCopy.secondsShort}` : null;
  const showReadyHint = visiblePlayers.some(({ isLocalDevice, player }) => isLocalDevice && !player.isReady);

  return {
    visiblePlayers,
    totalPlayers,
    readyCount,
    minimumPlayers,
    maximumPlayers,
    lobbyTitle,
    isLocalHost,
    actionAuthorityMode,
    isImpostorLobby,
    isRemoteImpostorLobby,
    isRemoteSintoniaLobby,
    impostorContentMode,
    impostorTargetPlayers,
    impostorCount,
    impostorClueTurnSeconds,
    lobbyPlayersLimit,
    tooManyPlayers,
    canAddPlayer,
    showAddCard,
    canStartGame,
    canHostStartThisLobby,
    isSettingsEditable,
    isCompactViewport,
    playerColumns,
    playerGap,
    nextAutoName,
    panelCopy,
    playersEmptyHint,
    impostorLobbyBadgeLabel,
    impostorContentModeLabel,
    clueTimerBadgeLabel,
    showReadyHint,
    roomCodeLabels,
    realtimeStatus,
  };
}
