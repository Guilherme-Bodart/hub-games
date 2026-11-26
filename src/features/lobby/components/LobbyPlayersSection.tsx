import { useMemo, useState } from 'react';
import { type DimensionValue, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';

import { LobbyAddPlayerCard } from '@/src/features/lobby/components/LobbyAddPlayerCard';
import { LobbyPlayerCard } from '@/src/features/lobby/components/LobbyPlayerCard';
import type { LobbyPanelCopy, VisibleLobbyPlayer } from '@/src/features/lobby/lobby.types';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { type GameAccentPalette, useTheme } from '@/src/theme';
import { getDuration } from '@/src/ui/motion';

type LobbyPlayersSectionProps = {
  visiblePlayers: VisibleLobbyPlayer[];
  gameAccent: GameAccentPalette;
  panelCopy: LobbyPanelCopy;
  reduceMotion: boolean;
  playerColumns: number;
  playerGap: number;
  showAddCard: boolean;
  playersEmptyHint: string;
  isRemoteLobby: boolean;
  realtimeError: string | null;
  onToggleReady: (playerId: string, isLocalDevice: boolean) => void;
  onRemove: (playerId: string) => void;
  onRequestAddPlayer: () => void;
};

export function LobbyPlayersSection({
  visiblePlayers,
  gameAccent,
  panelCopy,
  reduceMotion,
  playerColumns,
  playerGap,
  showAddCard,
  playersEmptyHint,
  isRemoteLobby,
  realtimeError,
  onToggleReady,
  onRemove,
  onRequestAddPlayer,
}: LobbyPlayersSectionProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [playersListWidth, setPlayersListWidth] = useState(0);

  const playerCellWidth = useMemo<DimensionValue>(() => {
    if (playersListWidth <= 0) {
      return '48%';
    }

    const gapTotal = playerGap * (playerColumns - 1);
    const measured = Math.floor((playersListWidth - gapTotal) / playerColumns);
    return Math.max(120, measured);
  }, [playerColumns, playerGap, playersListWidth]);

  return (
    <View style={styles.playersStage}>
      {realtimeError && isRemoteLobby ? (
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

      <View
        style={styles.playersList}
        onLayout={(event) => {
          setPlayersListWidth(Math.floor(event.nativeEvent.layout.width));
        }}>
        {visiblePlayers.map(({ player, isLocalDevice }, index) => (
          <Animated.View
            key={player.id}
            entering={
              reduceMotion
                ? undefined
                : FadeInDown.duration(getDuration('medium', reduceMotion)).delay(index * 40)
            }
            exiting={reduceMotion ? undefined : FadeOutUp.duration(getDuration('fast', reduceMotion))}
            layout={reduceMotion ? undefined : Layout.springify().damping(18).stiffness(170)}
            style={[
              styles.playerCell,
              {
                width: playerCellWidth,
                marginRight: (index + 1) % playerColumns === 0 ? 0 : playerGap,
                marginBottom: playerGap,
              },
            ]}>
            <LobbyPlayerCard
              player={player}
              isLocalDevice={isLocalDevice}
              gameAccent={gameAccent}
              hostLabel={panelCopy.hostLabel}
              readyPillLabel={panelCopy.readyPill}
              tapReadyPillLabel={panelCopy.tapReadyPill}
              waitingPillLabel={panelCopy.waitingPill}
              onToggleReady={() => onToggleReady(player.id, isLocalDevice)}
              onRemove={() => onRemove(player.id)}
            />
          </Animated.View>
        ))}

        {showAddCard ? (
          <Animated.View
            style={[
              styles.playerCell,
              {
                width: playerCellWidth,
                marginRight: (visiblePlayers.length + 1) % playerColumns === 0 ? 0 : playerGap,
                marginBottom: playerGap,
              },
            ]}>
            <LobbyAddPlayerCard
              label={panelCopy.addPlayerLabel}
              gameAccent={gameAccent}
              onPress={onRequestAddPlayer}
              accessibilityLabel={t('lobby.addPlayerA11y')}
            />
          </Animated.View>
        ) : null}
      </View>

      {!visiblePlayers.length ? (
        <View
          style={[
            styles.emptyPlayersState,
            {
              borderColor: theme.semantic.border.hairline,
              backgroundColor: theme.semantic.bg.surface,
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
    </View>
  );
}
