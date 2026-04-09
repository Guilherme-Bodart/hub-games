import { Text, View } from 'react-native';

import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { Modal } from '@/src/ui/atoms';

type SintoniaRulesModalProps = {
  visible: boolean;
  title: string;
  objective: string;
  stepOne: string;
  stepTwo: string;
  stepThree: string;
  onClose: () => void;
  theme: ThemeTokens;
};

export function SintoniaRulesModal({
  visible,
  title,
  objective,
  stepOne,
  stepTwo,
  stepThree,
  onClose,
  theme,
}: SintoniaRulesModalProps) {
  const steps = [stepOne, stepTwo, stepThree];

  return (
    <Modal visible={visible} title={title} onClose={onClose}>
      <Text
        style={[
          styles.rulesIntroText,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {objective}
      </Text>

      <View style={styles.rulesStepsWrap}>
        {steps.map((step, index) => (
          <View
            key={`rule-step-${index + 1}`}
            style={[
              styles.rulesStepCard,
              {
                borderColor: withAlpha(theme.semantic.border.subtle, 0.72),
                backgroundColor: withAlpha(theme.semantic.bg.surface, 0.72),
              },
            ]}>
            <Text
              style={[
                styles.rulesStepNumber,
                {
                  color: withAlpha(theme.semantic.button.primary.bg, 0.92),
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {`Passo ${index + 1}`}
            </Text>
            <Text
              style={[
                styles.rulesStepText,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </Modal>
  );
}
