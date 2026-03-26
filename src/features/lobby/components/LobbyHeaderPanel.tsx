import { Text, View } from 'react-native';

import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { IconCircleButton } from '@/src/ui/atoms';

type RemoteStatusTone = 'success' | 'neutral' | 'error';

type LobbyHeaderPanelProps = {
  lobbyTitle: string;
  settingsLabel: string;
  onOpenSettings: () => void;
  countdownValue: number | null;
  countdownStartingLabel: string;
  isRemoteLobby: boolean;
  roomCode: string;
  isRoomCodeHidden: boolean;
  onCopyRoomCode: () => void;
  onToggleRoomCodeHidden: () => void;
  copied: boolean;
  copyCodeLabel: string;
  showRoomCodeLabel: string;
  hideRoomCodeLabel: string;
  codeCopiedLabel: string;
  readyCount: number;
  totalPlayers: number;
  readyLabel: string;
  isImpostorLobby: boolean;
  impostorLobbyBadgeLabel: string;
  modeLabel: string;
  remoteStatusTone: RemoteStatusTone;
  remoteStatusLabel: string;
};

export function LobbyHeaderPanel({
  lobbyTitle,
  settingsLabel,
  onOpenSettings,
  countdownValue,
  countdownStartingLabel,
  isRemoteLobby,
  roomCode,
  isRoomCodeHidden,
  onCopyRoomCode,
  onToggleRoomCodeHidden,
  copied,
  copyCodeLabel,
  showRoomCodeLabel,
  hideRoomCodeLabel,
  codeCopiedLabel,
  readyCount,
  totalPlayers,
  readyLabel,
  isImpostorLobby,
  impostorLobbyBadgeLabel,
  modeLabel,
  remoteStatusTone,
  remoteStatusLabel,
}: LobbyHeaderPanelProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.sessionPanel,
        {
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          shadowColor: 'transparent',
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
        <IconCircleButton
          icon="settings-outline"
          accessibilityLabel={settingsLabel}
          onPress={onOpenSettings}
          style={styles.settingsIconButton}
        />
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
            {countdownStartingLabel}
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

      {isRemoteLobby ? (
        <View style={styles.roomCodeWrap}>
          <View style={styles.roomCodeActions}>
            <View style={[styles.roomCodeTilesWrap, { backgroundColor: 'transparent' }]}>
              {(isRoomCodeHidden ? '•'.repeat(roomCode.length) : roomCode).split('').map((char, index) => (
                <View
                  key={`room-char-${char}-${index}`}
                  style={[
                    styles.roomCodeCharTile,
                    {
                      shadowColor: theme.semantic.button.primary.bg,
                      borderColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
                    },
                  ]}>
                  <Text
                    style={[
                      styles.roomCodeCharText,
                      {
                        color: '#2B2A46',
                        fontFamily: theme.semantic.typography.numberFamily,
                        fontWeight: theme.semantic.typography.numberWeight,
                      },
                    ]}>
                    {char}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.roomCodeButtons}>
              <IconCircleButton icon="copy-outline" accessibilityLabel={copyCodeLabel} onPress={onCopyRoomCode} />
              <IconCircleButton
                icon={isRoomCodeHidden ? 'eye-off-outline' : 'eye-outline'}
                accessibilityLabel={isRoomCodeHidden ? showRoomCodeLabel : hideRoomCodeLabel}
                onPress={onToggleRoomCodeHidden}
              />
            </View>
          </View>

          <View style={styles.roomCodeFeedbackSlot}>
            <Text
              style={[
                styles.subtitle,
                {
                  color: '#5A5C79',
                  opacity: copied ? 1 : 0,
                  fontSize: 10,
                  lineHeight: 12,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {codeCopiedLabel}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.headerBadges}>
        <View style={[styles.statusPill, styles.statusPillReady]}>
          <Text
            style={[
              styles.statusPillText,
              {
                color: '#6658D8',
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {`${readyCount}/${totalPlayers} ${readyLabel}`}
          </Text>
        </View>
        {isImpostorLobby ? (
          <View style={[styles.statusPill, styles.statusPillImpostor]}>
            <Text
              style={[
                styles.statusPillText,
                {
                  color: '#C95A9D',
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {impostorLobbyBadgeLabel}
            </Text>
          </View>
        ) : null}
        <View style={[styles.statusPill, styles.statusPillMode]}>
          <Text
            style={[
              styles.statusPillText,
              {
                color: '#3A89D9',
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {modeLabel}
          </Text>
        </View>
        {isRemoteLobby ? (
          <View
            style={[
              styles.statusPill,
              remoteStatusTone === 'success'
                ? styles.statusPillOnline
                : remoteStatusTone === 'error'
                  ? styles.statusPillDanger
                  : styles.statusPillNeutral,
            ]}>
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    remoteStatusTone === 'success'
                      ? '#2E9E80'
                      : remoteStatusTone === 'error'
                        ? '#C75B74'
                        : '#7780A4',
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {remoteStatusLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
