import { Pressable, Text, View } from 'react-native';

import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { Modal } from '@/src/ui/atoms';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';

type LobbySettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  panelCopy: LobbyPanelCopy;
  isSettingsEditable: boolean;
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
  isSettingsEditable,
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
  const { t } = useI18n();
  const { theme } = useTheme();
  const decreaseLabelPrefix = t('common.decrease');
  const increaseLabelPrefix = t('common.increase');

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
            onPress={() => onSetActionAuthorityMode('host-only')}
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
            onPress={() => onSetActionAuthorityMode('collaborative')}
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
                onPress={() => onSetImpostorContentMode('words')}
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
                onPress={() => onSetImpostorContentMode('questions')}
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
                  accessibilityLabel={`${decreaseLabelPrefix} ${panelCopy.roundPlayers}`}
                  accessibilityState={{
                    disabled: !isSettingsEditable || impostorTargetPlayers <= minimumPlayers,
                  }}
                  disabled={!isSettingsEditable || impostorTargetPlayers <= minimumPlayers}
                  onPress={() => onSetImpostorTargetPlayers(impostorTargetPlayers - 1)}
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
                  accessibilityLabel={`${increaseLabelPrefix} ${panelCopy.roundPlayers}`}
                  accessibilityState={{
                    disabled: !isSettingsEditable || impostorTargetPlayers >= maximumPlayers,
                  }}
                  disabled={!isSettingsEditable || impostorTargetPlayers >= maximumPlayers}
                  onPress={() => onSetImpostorTargetPlayers(impostorTargetPlayers + 1)}
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
                const optionValue = countOption as 1 | 2;
                const isDisabled = !isSettingsEditable || (optionValue === 2 && totalPlayers < 7);
                const isActive = impostorCount === optionValue;

                return (
                  <Pressable
                    key={`imp-${optionValue}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${optionValue} ${panelCopy.impostors}`}
                    accessibilityState={{ disabled: isDisabled, selected: isActive }}
                    disabled={isDisabled}
                    onPress={() => onSetImpostorCount(optionValue)}
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
                      {optionValue}
                    </Text>
                  </Pressable>
                );
              })}
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
              {panelCopy.clueTimer}
            </Text>
            <View style={styles.settingsToggleRow}>
              {[10, 20, 30].map((secondsOption) => {
                const optionValue = secondsOption as 10 | 20 | 30;
                const isActive = impostorClueTurnSeconds === optionValue;

                return (
                  <Pressable
                    key={`imp-timer-${optionValue}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${optionValue}${panelCopy.secondsShort} ${panelCopy.clueTimer}`}
                    accessibilityState={{ disabled: !isSettingsEditable, selected: isActive }}
                    disabled={!isSettingsEditable}
                    onPress={() => onSetImpostorClueTurnSeconds(optionValue)}
                    style={[
                      styles.settingsToggle,
                      {
                        borderColor: isActive
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.border.subtle,
                        backgroundColor: isActive
                          ? theme.semantic.button.primary.bg
                          : theme.semantic.bg.surface,
                        opacity: isSettingsEditable ? 1 : 0.45,
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
                      {optionValue}
                      {panelCopy.secondsShort}
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
