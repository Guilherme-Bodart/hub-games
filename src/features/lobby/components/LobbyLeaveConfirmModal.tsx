import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { Button, Modal } from '@/src/ui/atoms';

type LobbyLeaveConfirmModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
};

export function LobbyLeaveConfirmModal({
  visible,
  onClose,
  onConfirmLeave,
}: LobbyLeaveConfirmModalProps) {
  const { t } = useI18n();
  const { theme } = useTheme();

  return (
    <Modal visible={visible} title={t('lobby.leaveConfirmTitle')} onClose={onClose}>
      <Text
        style={[
          styles.message,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
          },
        ]}>
        {t('lobby.leaveConfirmMessage')}
      </Text>
      <View style={styles.actionsRow}>
        <Button
          label={t('common.leave')}
          onPress={onConfirmLeave}
          variant="ghost"
          size="md"
          style={styles.leaveButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  leaveButton: {
    minWidth: 120,
  },
});
