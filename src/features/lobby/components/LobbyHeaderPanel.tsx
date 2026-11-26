import { Text, View } from 'react-native';

import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { ELEVATION_STYLES, type GameAccentPalette, useTheme } from '@/src/theme';
import { Badge, IconCircleButton } from '@/src/ui/atoms';

type LobbyHeaderPanelProps = {
  lobbyTitle: string;
  gameAccent: GameAccentPalette;
  backLabel: string;
  onPressBack: () => void;
  settingsLabel: string;
  onOpenSettings: () => void;
  isRemoteLobby: boolean;
  allowLocalPlayers: boolean;
  onlineOnlyBadgeLabel: string;
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
  gameAccent,
  backLabel,
  onPressBack,
  settingsLabel,
  onOpenSettings,
  isRemoteLobby,
  allowLocalPlayers,
  onlineOnlyBadgeLabel,
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
  const displayCode = isRoomCodeHidden ? '•'.repeat(Math.max(4, roomCode.length)) : roomCode;
  const allReady = totalPlayers > 0 && readyCount === totalPlayers;

  return (
    <View style={styles.headerRoot}>
      <View style={styles.topBarRow}>
        <IconCircleButton
          icon="chevron-back"
          accessibilityLabel={backLabel}
          onPress={onPressBack}
        />

        <View style={styles.titleWrap}>
          <View style={[styles.titleAccentDot, { backgroundColor: gameAccent.primary }]} />
          <Text
            numberOfLines={1}
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
        </View>

        <IconCircleButton
          icon="settings-outline"
          accessibilityLabel={settingsLabel}
          onPress={onOpenSettings}
        />
      </View>

      <View
        style={[
          styles.headerMetaCard,
          ELEVATION_STYLES.card,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        {isRemoteLobby ? (
          <>
            <View style={styles.roomCodeRow}>
              <View
                style={[
                  styles.roomCodePill,
                  {
                    backgroundColor: theme.semantic.bg.subtle,
                    borderColor: theme.semantic.border.hairline,
                  },
                ]}>
                <Text
                  style={[
                    styles.roomCodeLabel,
                    {
                      color: theme.semantic.text.muted,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {roomCodeLabel}
                </Text>
                <Text
                  style={[
                    styles.roomCodeValue,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: isRoomCodeHidden
                        ? theme.semantic.typography.bodyFamily
                        : theme.semantic.typography.numberFamily,
                      fontWeight: isRoomCodeHidden
                        ? theme.semantic.typography.bodyWeight
                        : theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  {displayCode}
                </Text>
              </View>

              <View style={styles.roomCodeButtons}>
                <IconCircleButton
                  icon={copied ? 'checkmark-outline' : 'copy-outline'}
                  accessibilityLabel={copyCodeLabel}
                  onPress={onCopyRoomCode}
                  tone={copied ? 'primary' : 'neutral'}
                />
                <IconCircleButton
                  icon={isRoomCodeHidden ? 'eye-off-outline' : 'eye-outline'}
                  accessibilityLabel={isRoomCodeHidden ? showRoomCodeLabel : hideRoomCodeLabel}
                  onPress={onToggleRoomCodeHidden}
                />
              </View>
            </View>

            {copied ? (
              <Text
                style={[
                  styles.copiedText,
                  {
                    color: theme.semantic.status.success,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {codeCopiedLabel}
              </Text>
            ) : null}
          </>
        ) : null}

        <View style={styles.headerBadges}>
          {allReady ? (
            <Badge label={`${readyCount}/${totalPlayers} ${readyLabel}`} variant="success" />
          ) : (
            <View
              style={[
                styles.accentPill,
                {
                  backgroundColor: gameAccent.tint,
                  borderColor: theme.semantic.border.hairline,
                },
              ]}>
              <Text
                style={[
                  styles.accentPillText,
                  {
                    color: gameAccent.primary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {`${readyCount}/${totalPlayers} ${readyLabel}`}
              </Text>
            </View>
          )}

          {!allowLocalPlayers ? <Badge label={onlineOnlyBadgeLabel} variant="info" /> : null}
          {isImpostorLobby ? <Badge label={impostorLobbyBadgeLabel} variant="error" /> : null}
          {impostorContentModeLabel ? (
            <Badge label={impostorContentModeLabel} variant="neutral" />
          ) : null}
          {clueTimerBadgeLabel ? <Badge label={clueTimerBadgeLabel} variant="neutral" /> : null}
        </View>
      </View>
    </View>
  );
}
