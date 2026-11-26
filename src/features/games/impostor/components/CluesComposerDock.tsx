import { Text, View } from 'react-native';

import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { Button, Input } from '@/src/ui/atoms';

type CluesComposerDockProps = {
  theme: ThemeTokens;
  canSubmitClue: boolean;
  isClueCycleComplete: boolean;
  clueInput: string;
  inputLabel?: string;
  inputPlaceholder: string;
  helperText: string;
  submitLabel: string;
  proceedLabel: string;
  isProceedDisabled: boolean;
  onChangeClueInput: (value: string) => void;
  onSubmitClue: () => void;
  onProceedDecision: () => void;
};

export function CluesComposerDock({
  theme,
  canSubmitClue,
  isClueCycleComplete,
  clueInput,
  inputLabel,
  inputPlaceholder,
  helperText,
  submitLabel,
  proceedLabel,
  isProceedDisabled,
  onChangeClueInput,
  onSubmitClue,
  onProceedDecision,
}: CluesComposerDockProps) {
  const accent = getGameAccent('impostor-neon');

  return (
    <View style={styles.composerStage}>
      <View
        style={[
          styles.composerCard,
          {
            backgroundColor: theme.semantic.bg.subtle,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        {canSubmitClue ? (
          <>
            {helperText ? (
              <Text
                style={[
                  styles.composerHelper,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {helperText}
              </Text>
            ) : null}
            <Input
              value={clueInput}
              onChangeText={onChangeClueInput}
              label={inputLabel}
              placeholder={inputPlaceholder}
              returnKeyType="send"
              onSubmitEditing={clueInput.trim() ? onSubmitClue : undefined}
              style={styles.composerInput}
            />
            <Button
              label={submitLabel}
              color={accent.primary}
              plinthColor={accent.plinth}
              onPress={onSubmitClue}
              disabled={!clueInput.trim()}
              size="lg"
              style={styles.actionButton}
            />
          </>
        ) : isClueCycleComplete ? (
          <>
            {helperText ? (
              <Text
                style={[
                  styles.composerHelper,
                  {
                    color: theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {helperText}
              </Text>
            ) : null}
            <Button
              label={proceedLabel}
              color={accent.primary}
              plinthColor={accent.plinth}
              onPress={onProceedDecision}
              disabled={isProceedDisabled}
              size="lg"
              style={styles.actionButton}
            />
          </>
        ) : (
          <View
            style={[
              styles.passiveDockPill,
              {
                backgroundColor: theme.semantic.bg.surface,
                borderColor: theme.semantic.border.hairline,
              },
            ]}>
            <Text
              style={[
                styles.passiveDockPillText,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {helperText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
