import { Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { Modal } from '@/src/ui/atoms';

type ImpostorRulesModalProps = {
  visible: boolean;
  title: string;
  objective: string;
  stepOne: string;
  stepTwo: string;
  stepThree: string;
  onClose: () => void;
  theme: ThemeTokens;
};

export function ImpostorRulesModal({
  visible,
  title,
  objective,
  stepOne,
  stepTwo,
  stepThree,
  onClose,
  theme,
}: ImpostorRulesModalProps) {
  const accent = getGameAccent('impostor-neon');
  const steps = [stepOne, stepTwo, stepThree];

  return (
    <Modal visible={visible} title={title} onClose={onClose}>
      <Text
        style={[
          styles.rulesText,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {objective}
      </Text>

      <View style={styles.rulesStepsList}>
        {steps.map((step, index) => (
          <View
            key={`rule-step-${index}`}
            style={[
              styles.rulesStepCard,
              {
                borderColor: theme.semantic.border.hairline,
                backgroundColor: theme.semantic.bg.subtle,
              },
            ]}>
            <View
              style={[
                styles.rulesStepBadge,
                {
                  backgroundColor: accent.tint,
                  borderColor: accent.primary,
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
                {`0${index + 1}`}
              </Text>
            </View>
            <Text
              style={[
                styles.rulesText,
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
