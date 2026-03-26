import { Pressable, Text, View } from 'react-native';

import {
  LOBBY_SETTINGS_KEYS,
  type ImpostorContentMode,
  type LobbyActionAuthorityMode,
} from '@/src/features/lobby/gameSettings';
import type { LobbyGameSettings } from '@/src/features/lobby/types';
import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';
import { useTheme } from '@/src/theme';
import { Modal } from '@/src/ui/atoms';
import { styles } from '@/src/features/lobby/lobby.styles';

type LobbySettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  panelCopy: LobbyPanelCopy;
  isSettingsEditable: boolean;
  actionAuthorityMode: LobbyActionAuthorityMode;
  isImpostorLobby: boolean;
  impostorContentMode: ImpostorContentMode;
  impostorTargetPlayers: number;
  impostorCount: number;
  minimumPlayers: number;
  maximumPlayers: number;
  totalPlayers: number;
  onUpdateSettings: (patch: Partial<LobbyGameSettings>) => void;
};

export function LobbySettingsModal({
  visible,
  onClose,
  panelCopy,
  isSettingsEditable,
  actionAuthorityMode,
  isImpostorLobby,
  impostorContentMode,
  impostorTargetPlayers,
  impostorCount,
  minimumPlayers,
  maximumPlayers,
  totalPlayers,
  onUpdateSettings,
}: LobbySettingsModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} title={panelCopy.settingsTitle} onClose={onClose}>
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

      <View style={styles.settingsBlock}>
        <Text
          style={[
            styles.settingsLabel,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {panelCopy.controlMode}
        </Text>
        <View style={styles.settingsToggleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={panelCopy.hostOnly}
            accessibilityState={{
              disabled: !isSettingsEditable,
              selected: actionAuthorityMode === 'host-only',
            }}
            disabled={!isSettingsEditable}
            onPress={() =>
              onUpdateSettings({
                [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: 'host-only',
              })
            }
            style={[
              styles.settingsToggle,
              {
                borderColor:
                  actionAuthorityMode === 'host-only'
                    ? theme.semantic.button.primary.bg
                    : theme.semantic.border.subtle,
                backgroundColor:
                  actionAuthorityMode === 'host-only'
                    ? theme.semantic.button.primary.bg
                    : theme.semantic.bg.surface,
                opacity: isSettingsEditable ? 1 : 0.45,
              },
            ]}>
            <Text
              style={[
                styles.settingsToggleText,
                {
                  color:
                    actionAuthorityMode === 'host-only'
                      ? theme.semantic.button.primary.text
                      : theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {panelCopy.hostOnly}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={panelCopy.collaborative}
            accessibilityState={{
              disabled: !isSettingsEditable,
              selected: actionAuthorityMode === 'collaborative',
            }}
            disabled={!isSettingsEditable}
            onPress={() =>
              onUpdateSettings({
                [LOBBY_SETTINGS_KEYS.actionAuthorityMode]: 'collaborative',
              })
            }
            style={[
              styles.settingsToggle,
              {
                borderColor:
                  actionAuthorityMode === 'collaborative'
                    ? theme.semantic.button.primary.bg
                    : theme.semantic.border.subtle,
                backgroundColor:
                  actionAuthorityMode === 'collaborative'
                    ? theme.semantic.button.primary.bg
                    : theme.semantic.bg.surface,
                opacity: isSettingsEditable ? 1 : 0.45,
              },
            ]}>
            <Text
              style={[
                styles.settingsToggleText,
                {
                  color:
                    actionAuthorityMode === 'collaborative'
                      ? theme.semantic.button.primary.text
                      : theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {panelCopy.collaborative}
            </Text>
          </Pressable>
        </View>

        {isImpostorLobby ? (
          <>
            <Text
              style={[
                styles.settingsLabel,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {panelCopy.impostorMode}
            </Text>
            <View style={styles.settingsToggleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={panelCopy.words}
                accessibilityState={{
                  disabled: !isSettingsEditable,
                  selected: impostorContentMode === 'words',
                }}
                disabled={!isSettingsEditable}
                onPress={() =>
                  onUpdateSettings({
                    [LOBBY_SETTINGS_KEYS.impostorContentMode]: 'words',
                  })
                }
                style={[
                  styles.settingsToggle,
                  {
                    borderColor:
                      impostorContentMode === 'words'
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.border.subtle,
                    backgroundColor:
                      impostorContentMode === 'words'
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.bg.surface,
                    opacity: isSettingsEditable ? 1 : 0.45,
                  },
                ]}>
                <Text
                  style={[
                    styles.settingsToggleText,
                    {
                      color:
                        impostorContentMode === 'words'
                          ? theme.semantic.button.primary.text
                          : theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.titleFamily,
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {panelCopy.words}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={panelCopy.questions}
                accessibilityState={{
                  disabled: !isSettingsEditable,
                  selected: impostorContentMode === 'questions',
                }}
                disabled={!isSettingsEditable}
                onPress={() =>
                  onUpdateSettings({
                    [LOBBY_SETTINGS_KEYS.impostorContentMode]: 'questions',
                  })
                }
                style={[
                  styles.settingsToggle,
                  {
                    borderColor:
                      impostorContentMode === 'questions'
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.border.subtle,
                    backgroundColor:
                      impostorContentMode === 'questions'
                        ? theme.semantic.button.primary.bg
                        : theme.semantic.bg.surface,
                    opacity: isSettingsEditable ? 1 : 0.45,
                  },
                ]}>
                <Text
                  style={[
                    styles.settingsToggleText,
                    {
                      color:
                        impostorContentMode === 'questions'
                          ? theme.semantic.button.primary.text
                          : theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.titleFamily,
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {panelCopy.questions}
                </Text>
              </Pressable>
            </View>

            <View style={styles.settingsStepperRow}>
              <Text
                style={[
                  styles.settingsLabel,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {panelCopy.roundPlayers}
              </Text>
              <View style={styles.stepperControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Diminuir ${panelCopy.roundPlayers}`}
                  accessibilityState={{
                    disabled: !isSettingsEditable || impostorTargetPlayers <= minimumPlayers,
                  }}
                  disabled={!isSettingsEditable || impostorTargetPlayers <= minimumPlayers}
                  onPress={() =>
                    onUpdateSettings({
                      [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: impostorTargetPlayers - 1,
                    })
                  }
                  style={[
                    styles.stepperButton,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.surface,
                      opacity:
                        isSettingsEditable && impostorTargetPlayers > minimumPlayers ? 1 : 0.4,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.stepperButtonText,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.numberFamily,
                        fontWeight: theme.semantic.typography.numberWeight,
                      },
                    ]}>
                    -
                  </Text>
                </Pressable>
                <Text
                  style={[
                    styles.stepperValue,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.numberFamily,
                      fontWeight: theme.semantic.typography.numberWeight,
                    },
                  ]}>
                  {impostorTargetPlayers}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aumentar ${panelCopy.roundPlayers}`}
                  accessibilityState={{
                    disabled: !isSettingsEditable || impostorTargetPlayers >= maximumPlayers,
                  }}
                  disabled={!isSettingsEditable || impostorTargetPlayers >= maximumPlayers}
                  onPress={() =>
                    onUpdateSettings({
                      [LOBBY_SETTINGS_KEYS.impostorTargetPlayers]: impostorTargetPlayers + 1,
                    })
                  }
                  style={[
                    styles.stepperButton,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.surface,
                      opacity:
                        isSettingsEditable && impostorTargetPlayers < maximumPlayers ? 1 : 0.4,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.stepperButtonText,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.numberFamily,
                        fontWeight: theme.semantic.typography.numberWeight,
                      },
                    ]}>
                    +
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text
              style={[
                styles.settingsLabel,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {panelCopy.impostors}
            </Text>
            <View style={styles.settingsToggleRow}>
              {[1, 2].map((countOption) => {
                const isDisabled =
                  !isSettingsEditable || (countOption === 2 && totalPlayers < 7);
                const isActive = impostorCount === countOption;

                return (
                  <Pressable
                    key={`imp-${countOption}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${countOption} ${panelCopy.impostors}`}
                    accessibilityState={{ disabled: isDisabled, selected: isActive }}
                    disabled={isDisabled}
                    onPress={() =>
                      onUpdateSettings({
                        [LOBBY_SETTINGS_KEYS.impostorCount]: countOption,
                      })
                    }
                    style={[
                      styles.settingsToggle,
                      {
                        borderColor: isActive
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                        backgroundColor: isActive
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.bg.surface,
                        opacity: isDisabled ? 0.35 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.settingsToggleText,
                        {
                          color: isActive
                            ? theme.semantic.button.primary.text
                            : theme.semantic.text.secondary,
                          fontFamily: theme.semantic.typography.titleFamily,
                          fontWeight: theme.semantic.typography.titleWeight,
                        },
                      ]}>
                      {countOption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}
