import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { LobbyPlayer } from '@/src/features/lobby';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { ELEVATION_STYLES, type GameAccentPalette, useTheme } from '@/src/theme';
import { AvatarSprite, Badge } from '@/src/ui/atoms';

type LobbyPlayerCardProps = {
  player: LobbyPlayer;
  isLocalDevice: boolean;
  gameAccent: GameAccentPalette;
  hostLabel: string;
  readyPillLabel: string;
  tapReadyPillLabel: string;
  waitingPillLabel: string;
  onToggleReady: () => void;
  onRemove: () => void;
};

export const LobbyPlayerCard = memo(
  function LobbyPlayerCard({
    player,
    isLocalDevice,
    gameAccent,
    hostLabel,
    readyPillLabel,
    tapReadyPillLabel,
    waitingPillLabel,
    onToggleReady,
    onRemove,
  }: LobbyPlayerCardProps) {
    const { t } = useI18n();
    const { theme } = useTheme();
    const statusLabel = player.isReady
      ? readyPillLabel
      : isLocalDevice
        ? tapReadyPillLabel
        : waitingPillLabel;

    return (
      <View
        style={[
          styles.playerCard,
          ELEVATION_STYLES.card,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: player.isReady ? gameAccent.primary : theme.semantic.border.hairline,
            borderWidth: player.isReady ? 2 : 1,
          },
        ]}>
        {player.isHost ? (
          <View
            style={[
              styles.hostCornerBadge,
              {
                backgroundColor: theme.semantic.badge.hostBg,
                borderColor: theme.semantic.border.hairline,
              },
            ]}>
            <SymbolView
              name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
              size={11}
              tintColor={theme.semantic.badge.hostText}
            />
            <Text
              style={[
                styles.hostCornerText,
                {
                  color: theme.semantic.badge.hostText,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {hostLabel}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.deviceCornerIcon,
              {
                backgroundColor: theme.semantic.bg.subtle,
                borderColor: theme.semantic.border.hairline,
              },
            ]}>
            <SymbolView
              name={
                isLocalDevice
                  ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
                  : { ios: 'globe', android: 'language', web: 'language' }
              }
              size={11}
              tintColor={theme.semantic.text.muted}
            />
          </View>
        )}

        {!player.isHost && isLocalDevice ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('lobby.removePlayerA11y', { name: player.name })}
            onPress={onRemove}
            hitSlop={8}
            style={({ pressed }) => [
              styles.removeCornerButton,
              {
                backgroundColor: theme.semantic.badge.errorBg,
                borderColor: theme.semantic.border.hairline,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <Text
              style={[
                styles.removeCornerLabel,
                {
                  color: theme.semantic.badge.errorText,
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
          accessibilityLabel={
            player.isReady
              ? t('lobby.markPendingA11y', { name: player.name })
              : t('lobby.markReadyA11y', { name: player.name })
          }
          accessibilityState={{ disabled: !isLocalDevice, selected: player.isReady }}
          disabled={!isLocalDevice}
          onPress={onToggleReady}
          style={({ pressed }) => [
            styles.playerCardPressable,
            {
              backgroundColor: theme.semantic.bg.surface,
              opacity: pressed && isLocalDevice ? theme.semantic.motion.feedback.pressedOpacity : 1,
            },
          ]}>
          <View
            style={[
              styles.avatarShell,
              {
                backgroundColor: player.isReady ? gameAccent.tint : theme.semantic.bg.subtle,
                borderColor: player.isReady ? gameAccent.primary : theme.semantic.border.hairline,
              },
            ]}>
            <AvatarSprite avatarId={player.avatarId} size={50} />
          </View>

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

          <Badge label={statusLabel} variant={player.isReady ? 'success' : 'neutral'} />
        </Pressable>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isLocalDevice === nextProps.isLocalDevice &&
    prevProps.gameAccent.id === nextProps.gameAccent.id &&
    prevProps.hostLabel === nextProps.hostLabel &&
    prevProps.readyPillLabel === nextProps.readyPillLabel &&
    prevProps.tapReadyPillLabel === nextProps.tapReadyPillLabel &&
    prevProps.waitingPillLabel === nextProps.waitingPillLabel &&
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.player.isReady === nextProps.player.isReady
);
