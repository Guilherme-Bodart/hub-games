import { Text, View } from 'react-native';

import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
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
  const accent = getGameAccent('sintonia');
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
                borderColor: theme.semantic.border.hairline,
                backgroundColor: theme.semantic.bg.subtle,
              },
            ]}>
            <View
              style={[
                styles.rulesStepPill,
                {
                  backgroundColor: accent.tint,
                  borderColor: theme.semantic.border.hairline,
                },
              ]}>
              <Text
                style={[
                  styles.rulesStepNumber,
                  {
                    color: accent.primary,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {`Passo ${index + 1}`}
              </Text>
            </View>
            <Text
              style={[
                styles.rulesStepText,
                {
                  color: theme.semantic.text.primary,
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
