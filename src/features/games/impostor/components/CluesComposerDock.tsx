import { Text, View } from 'react-native';

import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
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
  return (
    <View style={styles.composerStage}>
      {canSubmitClue ? (
        <View
          style={[
            styles.composerCard,
            {
              backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.94),
              borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
            },
          ]}>
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
            style={styles.composerInput}
          />
          <Button
            label={submitLabel}
            onPress={onSubmitClue}
            disabled={!clueInput.trim()}
            size="lg"
            style={styles.actionButton}
          />
        </View>
      ) : (
        <View
          style={[
            styles.composerCard,
            {
              backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.92),
              borderColor: withAlpha(theme.semantic.border.subtle, 0.9),
            },
          ]}>
          {isClueCycleComplete ? (
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
                  backgroundColor: withAlpha(theme.semantic.bg.surface, 0.94),
                  borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
                },
              ]}>
              <Text
                style={[
                  styles.passiveDockPillText,
                  {
                    color: theme.semantic.text.muted,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {helperText}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
