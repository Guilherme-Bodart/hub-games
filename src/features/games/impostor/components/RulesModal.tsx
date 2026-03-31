import { Text } from 'react-native';

import { roundHeaderStyles as styles } from '@/src/features/games/styles/roundHeaderStyles';
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
        1. {stepOne}
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
        2. {stepTwo}
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
        3. {stepThree}
      </Text>
    </Modal>
  );
}
