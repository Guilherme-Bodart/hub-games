import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';

import { LobbyPlayer } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';

type LobbyPlayerCardProps = {
  player: LobbyPlayer;
  isLocalDevice: boolean;
  onToggleReady: () => void;
  onRemove: () => void;
};

export const LobbyPlayerCard = memo(function LobbyPlayerCard({
  player,
  isLocalDevice,
  onToggleReady,
  onRemove,
}: LobbyPlayerCardProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const deviceOpacity = isLocalDevice ? 1 : 0.7;
  const readyTone = '#28C2E0';

  return (
    <View
      style={[
        styles.playerCard,
        {
          opacity: deviceOpacity,
          borderColor: player.isReady ? withAlpha(readyTone, 0.7) : 'transparent',
          shadowColor: player.isReady ? readyTone : '#000000',
          shadowOpacity: player.isReady ? 0.3 : 0.08,
          shadowRadius: player.isReady ? 12 : 14,
          shadowOffset: player.isReady ? { width: 0, height: 0 } : { width: 0, height: 10 },
          elevation: player.isReady ? 10 : 3,
        },
      ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        pointerEvents="none"
        style={styles.shineGradient}
      />

      {player.isHost ? (
        <View
          style={[
            styles.hostBadge,
            {
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            },
          ]}>
          <SymbolView
            name={{ ios: 'crown.fill', android: 'crown', web: 'crown' }}
            size={16}
            tintColor="#FFD86B"
          />
        </View>
      ) : null}

      {!player.isHost && isLocalDevice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('lobby.removePlayerA11y', { name: player.name })}
          onPress={onRemove}
          hitSlop={8}
          style={styles.iconAction}>
          <Text
            style={[
              styles.iconActionLabel,
              {
                color: '#FF5A81',
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
        style={[
          styles.playerCardPressable,
          player.isReady ? styles.playerCardPressableReady : null,
        ]}>
        <View style={styles.avatarShell}>
          <AvatarSprite avatarId={player.avatarId} size={46} />
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
        <View style={styles.playerMetaRow}>
          <SymbolView
            name={
              isLocalDevice
                ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
                : { ios: 'globe', android: 'language', web: 'language' }
            }
            size={12}
            tintColor="#6B7790"
            style={styles.deviceIcon}
          />
        </View>
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isLocalDevice === nextProps.isLocalDevice &&
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.name === nextProps.player.name &&
    prevProps.player.avatarId === nextProps.player.avatarId &&
    prevProps.player.isHost === nextProps.player.isHost &&
    prevProps.player.isReady === nextProps.player.isReady
  );
});

