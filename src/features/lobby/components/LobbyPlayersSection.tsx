import { type DimensionValue, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';
import { useMemo, useState } from 'react';

import { LobbyPlayer } from '@/src/features/lobby';
import { LobbyAddPlayerCard } from '@/src/features/lobby/components/LobbyAddPlayerCard';
import { LobbyPlayerCard } from '@/src/features/lobby/components/LobbyPlayerCard';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { getDuration } from '@/src/ui/motion';

type VisibleLobbyPlayer = {
  player: LobbyPlayer;
  isLocalDevice: boolean;
};

type LobbyPlayersSectionProps = {
  visiblePlayers: VisibleLobbyPlayer[];
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
      return '48.4%';
    }

    const gapTotal = playerGap * (playerColumns - 1);
    const measured = Math.floor((playersListWidth - gapTotal) / playerColumns);
    return Math.max(68, measured);
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
    </View>
  );
}
