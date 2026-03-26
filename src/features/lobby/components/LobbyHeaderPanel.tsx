import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';
import { useTheme } from '@/src/theme';
import { Badge } from '@/src/ui/atoms';
import { styles } from '@/src/features/lobby/lobby.styles';

type LobbyHeaderPanelProps = {
  lobbyTitle: string;
  panelCopy: LobbyPanelCopy;
  onOpenSettings: () => void;
  countdownValue: number | null;
  isRemoteLobby: boolean;
  roomCode: string;
  isRoomCodeHidden: boolean;
  onCopyCode: () => void;
  onToggleRoomCodeVisibility: () => void;
  copied: boolean;
  copiedLabel: string;
  copyCodeA11yLabel: string;
  showCodeA11yLabel: string;
  hideCodeA11yLabel: string;
  isCompactViewport: boolean;
  readyCount: number;
  totalPlayers: number;
  readyLabel: string;
  isImpostorLobby: boolean;
  impostorLobbyBadgeLabel: string;
  modeLabel: string;
  remoteStatusLabel: string;
  remoteStatusTone: 'success' | 'neutral' | 'error';
};

export function LobbyHeaderPanel({
  lobbyTitle,
  panelCopy,
  onOpenSettings,
  countdownValue,
  isRemoteLobby,
  roomCode,
  isRoomCodeHidden,
  onCopyCode,
  onToggleRoomCodeVisibility,
  copied,
  copiedLabel,
  copyCodeA11yLabel,
  showCodeA11yLabel,
  hideCodeA11yLabel,
  isCompactViewport,
  readyCount,
  totalPlayers,
  readyLabel,
  isImpostorLobby,
  impostorLobbyBadgeLabel,
  modeLabel,
  remoteStatusLabel,
  remoteStatusTone,
}: LobbyHeaderPanelProps) {
  const { theme } = useTheme();

  return (
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
          onPress={onOpenSettings}
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

      {isRemoteLobby ? (
        <View style={styles.roomCodeWrap}>
          <View style={styles.roomCodeActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copyCodeA11yLabel}
              onPress={onCopyCode}
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
                {isRoomCodeHidden ? '•'.repeat(roomCode.length) : roomCode}
              </Text>
              <SymbolView
                name={{ ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
                size={15}
                tintColor="#5B5D7A"
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isRoomCodeHidden ? showCodeA11yLabel : hideCodeA11yLabel}
              accessibilityState={{ selected: !isRoomCodeHidden }}
              onPress={onToggleRoomCodeVisibility}
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
              {copiedLabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.headerBadges}>
        <Badge label={`${readyCount}/${totalPlayers} ${readyLabel}`} variant="success" />
        {isImpostorLobby ? <Badge label={impostorLobbyBadgeLabel} variant="error" /> : null}
        <Badge label={modeLabel} variant="neutral" />
        {isRemoteLobby ? <Badge label={remoteStatusLabel} variant={remoteStatusTone} /> : null}
      </View>
    </View>
  );
}
