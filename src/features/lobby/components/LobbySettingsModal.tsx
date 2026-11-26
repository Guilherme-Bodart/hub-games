import { Pressable, ScrollView, Text, View } from 'react-native';

import { LobbyImpostorSettingsSection } from '@/src/features/lobby/components/LobbyImpostorSettingsSection';
import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { type GameAccentPalette, useTheme } from '@/src/theme';
import { Badge, Modal } from '@/src/ui/atoms';

type LobbySettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  panelCopy: LobbyPanelCopy;
  gameAccent: GameAccentPalette;
  isSettingsEditable: boolean;
  supportsOnlineSync: boolean;
  allowLocalPlayers: boolean;
  hasAnyMultiPlayerDevice: boolean;
  onSetAllowLocalPlayers: (allow: boolean) => void;
  actionAuthorityMode: 'host-only' | 'collaborative';
  onSetActionAuthorityMode: (mode: 'host-only' | 'collaborative') => void;
  isImpostorLobby: boolean;
  impostorContentMode: 'words' | 'questions';
  onSetImpostorContentMode: (mode: 'words' | 'questions') => void;
  impostorTargetPlayers: number;
  minimumPlayers: number;
  maximumPlayers: number;
  onSetImpostorTargetPlayers: (value: number) => void;
  impostorCount: number;
  impostorClueTurnSeconds: 10 | 20 | 30;
  totalPlayers: number;
  onSetImpostorCount: (value: 1 | 2) => void;
  onSetImpostorClueTurnSeconds: (value: 10 | 20 | 30) => void;
};

export function LobbySettingsModal({
  visible,
  onClose,
  panelCopy,
  gameAccent,
  isSettingsEditable,
  supportsOnlineSync,
  allowLocalPlayers,
  hasAnyMultiPlayerDevice,
  onSetAllowLocalPlayers,
  actionAuthorityMode,
  onSetActionAuthorityMode,
  isImpostorLobby,
  impostorContentMode,
  onSetImpostorContentMode,
  impostorTargetPlayers,
  minimumPlayers,
  maximumPlayers,
  onSetImpostorTargetPlayers,
  impostorCount,
  impostorClueTurnSeconds,
  totalPlayers,
  onSetImpostorCount,
  onSetImpostorClueTurnSeconds,
}: LobbySettingsModalProps) {
  const { theme } = useTheme();
  const isOnlineOnlyBlocked = hasAnyMultiPlayerDevice && allowLocalPlayers;
  const isOnlineOnlyDisabled = !isSettingsEditable || isOnlineOnlyBlocked;

  const labelStyle = [
    styles.settingsLabel,
    {
      color: theme.semantic.text.secondary,
      fontFamily: theme.semantic.typography.bodyFamily,
      fontWeight: theme.semantic.typography.bodyWeight,
    },
  ];

  return (
    <Modal visible={visible} title={panelCopy.settingsTitle} onClose={onClose}>
      <ScrollView
        style={styles.settingsScroll}
        contentContainerStyle={styles.settingsScrollContent}
        showsVerticalScrollIndicator={false}>
        {!isSettingsEditable ? (
          <Text
            style={[
              styles.settingsHint,
              {
                color: theme.semantic.text.muted,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {panelCopy.hostOnlyHint}
          </Text>
        ) : null}

        <View style={styles.settingsSection}>
          <Text style={labelStyle}>{panelCopy.roomMode}</Text>
          {supportsOnlineSync ? (
            <>
              <View style={styles.settingsToggleStack}>
                {(
                  [
                    {
                      allow: true,
                      label: panelCopy.hybridMode,
                      selected: allowLocalPlayers,
                      disabled: !isSettingsEditable,
                    },
                    {
                      allow: false,
                      label: panelCopy.onlineOnlyMode,
                      selected: !allowLocalPlayers,
                      disabled: isOnlineOnlyDisabled,
                    },
                  ] as const
                ).map((option) => (
                  <Pressable
                    key={option.allow ? 'hybrid' : 'online-only'}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{
                      disabled: option.disabled,
                      selected: option.selected,
                    }}
                    disabled={option.disabled}
                    onPress={() => onSetAllowLocalPlayers(option.allow)}
                    style={[
                      styles.settingsToggleFull,
                      {
                        borderColor: option.selected
                          ? gameAccent.primary
                          : theme.semantic.border.hairline,
                        backgroundColor: option.selected
                          ? gameAccent.primary
                          : theme.semantic.bg.subtle,
                        opacity: option.disabled ? 0.4 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.settingsToggleText,
                        {
                          color: option.selected
                            ? gameAccent.textOnPrimary
                            : theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                          fontWeight: theme.semantic.typography.titleWeight,
                        },
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {isOnlineOnlyBlocked ? (
                <Text
                  style={[
                    styles.settingsHint,
                    {
                      color: theme.semantic.status.warning,
                      fontFamily: theme.semantic.typography.bodyFamily,
                      fontWeight: theme.semantic.typography.bodyWeight,
                    },
                  ]}>
                  {panelCopy.onlineOnlyBlockedHint}
                </Text>
              ) : null}
            </>
          ) : (
            <Badge label={panelCopy.localPassPhoneBadge} variant="info" />
          )}
        </View>

        <View
          style={[styles.settingsDivider, { backgroundColor: theme.semantic.border.hairline }]}
        />

        <View style={styles.settingsSection}>
          <Text style={labelStyle}>{panelCopy.controlMode}</Text>
          <View style={styles.settingsToggleRow}>
            {(['host-only', 'collaborative'] as const).map((mode) => {
              const isActive = actionAuthorityMode === mode;
              const modeLabel = mode === 'host-only' ? panelCopy.hostOnly : panelCopy.collaborative;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="button"
                  accessibilityLabel={modeLabel}
                  accessibilityState={{
                    disabled: !isSettingsEditable,
                    selected: isActive,
                  }}
                  disabled={!isSettingsEditable}
                  onPress={() => onSetActionAuthorityMode(mode)}
                  style={[
                    styles.settingsToggle,
                    {
                      borderColor: isActive ? gameAccent.primary : theme.semantic.border.hairline,
                      backgroundColor: isActive ? gameAccent.primary : theme.semantic.bg.subtle,
                      opacity: isSettingsEditable ? 1 : 0.4,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.settingsToggleText,
                      {
                        color: isActive ? gameAccent.textOnPrimary : theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.titleFamily,
                        fontWeight: theme.semantic.typography.titleWeight,
                      },
                    ]}>
                    {modeLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isImpostorLobby ? (
          <LobbyImpostorSettingsSection
            panelCopy={panelCopy}
            gameAccent={gameAccent}
            isSettingsEditable={isSettingsEditable}
            impostorContentMode={impostorContentMode}
            onSetImpostorContentMode={onSetImpostorContentMode}
            impostorTargetPlayers={impostorTargetPlayers}
            minimumPlayers={minimumPlayers}
            maximumPlayers={maximumPlayers}
            onSetImpostorTargetPlayers={onSetImpostorTargetPlayers}
            impostorCount={impostorCount}
            impostorClueTurnSeconds={impostorClueTurnSeconds}
            totalPlayers={totalPlayers}
            onSetImpostorCount={onSetImpostorCount}
            onSetImpostorClueTurnSeconds={onSetImpostorClueTurnSeconds}
          />
        ) : null}
      </ScrollView>
    </Modal>
  );
}
