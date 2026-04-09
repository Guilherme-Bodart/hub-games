import { Text, View } from 'react-native';

import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { IconCircleButton } from '@/src/ui/atoms';

type LobbyHeaderPanelProps = {
  lobbyTitle: string;
  settingsLabel: string;
  onOpenSettings: () => void;
  isRemoteLobby: boolean;
  roomCode: string;
  roomCodeLabel: string;
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
  impostorContentModeLabel: string | null;
  clueTimerBadgeLabel: string | null;
};

export function LobbyHeaderPanel({
  lobbyTitle,
  settingsLabel,
  onOpenSettings,
  isRemoteLobby,
  roomCode,
  roomCodeLabel,
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
  impostorContentModeLabel,
  clueTimerBadgeLabel,
}: LobbyHeaderPanelProps) {
  const { theme } = useTheme();
  const hiddenCodeMask = '●';

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
        />
      </View>

      <View style={styles.sessionMetaPanel}>
        {isRemoteLobby ? (
          <View style={styles.roomCodeWrap}>
            <View style={styles.roomCodeHeader}>
              <Text
                style={[
                  styles.roomCodeLabel,
                  {
                    color: withAlpha(theme.semantic.text.secondary, 0.8),
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {roomCodeLabel}
              </Text>
            </View>

            <View style={styles.roomCodeActions}>
              <View style={[styles.roomCodeTilesWrap, { backgroundColor: 'transparent' }]}>
                {(isRoomCodeHidden ? hiddenCodeMask.repeat(roomCode.length) : roomCode).split('').map((char, index) => {
                  const usesMaskChar = isRoomCodeHidden;
                  return (
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
                            fontFamily: usesMaskChar
                              ? theme.semantic.typography.bodyFamily
                              : theme.semantic.typography.numberFamily,
                            fontWeight: usesMaskChar
                              ? theme.semantic.typography.bodyWeight
                              : theme.semantic.typography.numberWeight,
                          },
                        ]}>
                        {char}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.roomCodeButtons}>
                <IconCircleButton
                  icon="copy-outline"
                  accessibilityLabel={copyCodeLabel}
                  onPress={onCopyRoomCode}
                />
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
          {impostorContentModeLabel ? (
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
                {impostorContentModeLabel}
              </Text>
            </View>
          ) : null}
          {clueTimerBadgeLabel ? (
            <View style={[styles.statusPill, styles.statusPillNeutral]}>
              <Text
                style={[
                  styles.statusPillText,
                  {
                    color: '#7780A4',
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {clueTimerBadgeLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

