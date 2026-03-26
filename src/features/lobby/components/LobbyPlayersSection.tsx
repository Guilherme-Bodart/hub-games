import { SymbolView } from 'expo-symbols';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';

import type { LobbyPlayer } from '@/src/features/lobby';
import type { VisibleLobbyPlayer } from '@/src/features/lobby/lobby.types';
import type { Locale } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';
import { getDuration } from '@/src/ui/motion';
import { styles } from '@/src/features/lobby/lobby.styles';

const PlayerAvatar = memo(
  function PlayerAvatar({
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
        ]}
      >
        {player.isHost ? (
          <View
            style={[
              styles.hostBadge,
              {
                backgroundColor: '#FFD86B',
                borderColor: '#F9BE2F',
              },
            ]}
          >
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
            style={styles.iconAction}
          >
            <Text
              style={[
                styles.iconActionLabel,
                {
                  color: '#FFFFFF',
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}
            >
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
          style={styles.playerCardPressable}
        >
          <View style={styles.avatarShell}>
            <View
              style={[
                styles.avatarOrb,
                {
                  borderColor: withAlpha(readyColor, 0.98),
                  shadowColor: readyColor,
                  backgroundColor: '#FFFFFF',
                },
              ]}
            >
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
            ]}
          >
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.accentTone === nextProps.accentTone &&
      prevProps.isLocalDevice === nextProps.isLocalDevice &&
      prevProps.player.id === nextProps.player.id &&
      prevProps.player.name === nextProps.player.name &&
      prevProps.player.avatarId === nextProps.player.avatarId &&
      prevProps.player.isHost === nextProps.player.isHost &&
      prevProps.player.isReady === nextProps.player.isReady
    );
  }
);

type LobbyPlayersSectionProps = {
  locale: Locale;
  visiblePlayers: VisibleLobbyPlayer[];
  showAddCard: boolean;
  playersEmptyHint: string;
  reduceMotion: boolean;
  playerCellWidth: `${number}%`;
  onToggleReady: (playerId: string, isLocalDevice: boolean) => void;
  onRemovePlayer: (playerId: string) => void;
  onOpenAddPlayerModal: () => void;
};

export function LobbyPlayersSection({
  locale,
  visiblePlayers,
  showAddCard,
  playersEmptyHint,
  reduceMotion,
  playerCellWidth,
  onToggleReady,
  onRemovePlayer,
  onOpenAddPlayerModal,
}: LobbyPlayersSectionProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={styles.playersList}>
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
              },
            ]}
          >
            <PlayerAvatar
              player={player}
              isLocalDevice={isLocalDevice}
              accentTone={index % 3 === 0 ? 'cyan' : index % 3 === 1 ? 'pink' : 'violet'}
              onToggleReady={() => onToggleReady(player.id, isLocalDevice)}
              onRemove={() => onRemovePlayer(player.id)}
            />
          </Animated.View>
        ))}

        {showAddCard ? (
          <Animated.View
            entering={
              reduceMotion
                ? undefined
                : FadeInDown.duration(getDuration('medium', reduceMotion)).delay(visiblePlayers.length * 30)
            }
            style={[
              styles.playerCell,
              {
                width: playerCellWidth,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={locale === 'pt' ? 'Adicionar jogador' : 'Add player'}
              onPress={onOpenAddPlayerModal}
              style={styles.addCardButton}
            >
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={38}
                tintColor="#8E95A9"
              />
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
          ]}
        >
          <Text
            style={[
              styles.emptyPlayersText,
              {
                color: '#5C5F7A',
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}
          >
            {playersEmptyHint}
          </Text>
        </View>
      ) : null}
    </>
  );
}

