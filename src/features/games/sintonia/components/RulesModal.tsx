import { Text } from 'react-native';

import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
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
      <Text
        style={[
          styles.rulesText,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {`1. ${stepOne}`}
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
        {`2. ${stepTwo}`}
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
        {`3. ${stepThree}`}
      </Text>
    </Modal>
  );
}
