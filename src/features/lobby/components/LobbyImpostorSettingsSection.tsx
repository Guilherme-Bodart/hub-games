import { Pressable, Text, View } from 'react-native';

import type { LobbyPanelCopy } from '@/src/features/lobby/lobby.types';
import { styles } from '@/src/features/lobby/styles/lobbyStyles';
import { useI18n } from '@/src/i18n';
import { type GameAccentPalette, useTheme } from '@/src/theme';

type LobbyImpostorSettingsSectionProps = {
  panelCopy: LobbyPanelCopy;
  gameAccent: GameAccentPalette;
  isSettingsEditable: boolean;
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

export function LobbyImpostorSettingsSection({
  panelCopy,
  gameAccent,
  isSettingsEditable,
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
}: LobbyImpostorSettingsSectionProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const decreaseLabelPrefix = t('common.decrease');
  const increaseLabelPrefix = t('common.increase');

  const labelStyle = [
    styles.settingsLabel,
    {
      color: theme.semantic.text.secondary,
      fontFamily: theme.semantic.typography.bodyFamily,
      fontWeight: theme.semantic.typography.bodyWeight,
    },
  ];

  const renderToggle = (
    key: string,
    label: string,
    a11yLabel: string,
    isActive: boolean,
    isDisabled: boolean,
    onPress: () => void
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: isDisabled, selected: isActive }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.settingsToggle,
        {
          borderColor: isActive ? gameAccent.primary : theme.semantic.border.hairline,
          backgroundColor: isActive ? gameAccent.primary : theme.semantic.bg.subtle,
          opacity: isDisabled ? 0.4 : 1,
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
        {label}
      </Text>
    </Pressable>
  );

  return (
    <>
      <View
        style={[styles.settingsDivider, { backgroundColor: theme.semantic.border.hairline }]}
      />

      <View style={styles.settingsSection}>
        <Text style={labelStyle}>{panelCopy.impostorMode}</Text>
        <View style={styles.settingsToggleRow}>
          {renderToggle(
            'imp-words',
            panelCopy.words,
            panelCopy.words,
            impostorContentMode === 'words',
            !isSettingsEditable,
            () => onSetImpostorContentMode('words')
          )}
          {renderToggle(
            'imp-questions',
            panelCopy.questions,
            panelCopy.questions,
            impostorContentMode === 'questions',
            !isSettingsEditable,
            () => onSetImpostorContentMode('questions')
          )}
        </View>
      </View>

      <View style={styles.settingsStepperRow}>
        <Text style={labelStyle}>{panelCopy.roundPlayers}</Text>
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
                borderColor: theme.semantic.border.hairline,
                backgroundColor: theme.semantic.bg.subtle,
                opacity: isSettingsEditable && impostorTargetPlayers > minimumPlayers ? 1 : 0.4,
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
                borderColor: theme.semantic.border.hairline,
                backgroundColor: theme.semantic.bg.subtle,
                opacity: isSettingsEditable && impostorTargetPlayers < maximumPlayers ? 1 : 0.4,
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

      <View style={styles.settingsSection}>
        <Text style={labelStyle}>{panelCopy.impostors}</Text>
        <View style={styles.settingsToggleRow}>
          {([1, 2] as const).map((optionValue) => {
            const isDisabled = !isSettingsEditable || (optionValue === 2 && totalPlayers < 7);
            return renderToggle(
              `imp-${optionValue}`,
              `${optionValue}`,
              `${optionValue} ${panelCopy.impostors}`,
              impostorCount === optionValue,
              isDisabled,
              () => onSetImpostorCount(optionValue)
            );
          })}
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={labelStyle}>{panelCopy.clueTimer}</Text>
        <View style={styles.settingsToggleRow}>
          {([10, 20, 30] as const).map((optionValue) =>
            renderToggle(
              `imp-timer-${optionValue}`,
              `${optionValue}${panelCopy.secondsShort}`,
              `${optionValue}${panelCopy.secondsShort} ${panelCopy.clueTimer}`,
              impostorClueTurnSeconds === optionValue,
              !isSettingsEditable,
              () => onSetImpostorClueTurnSeconds(optionValue)
            )
          )}
        </View>
      </View>
    </>
  );
}
