import { Text, View } from 'react-native';

import { roundHeaderStyles as styles } from '@/src/features/games/styles/roundHeaderStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
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

      <View style={{ gap: 10 }}>
        {steps.map((step, index) => (
          <View
            key={`rule-step-${index}`}
            style={{
              borderWidth: 1,
              borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
              backgroundColor: withAlpha(theme.semantic.bg.surface, 0.9),
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 12,
              gap: 4,
            }}>
            <Text
              style={{
                color: theme.semantic.button.primary.bg,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
                fontSize: 11,
                lineHeight: 13,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}>
              {`0${index + 1}`}
            </Text>
            <Text
              style={[
                styles.rulesText,
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
