import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/src/i18n';
import { Button, Input, Modal } from '@/src/ui/atoms';

type LobbyAddPlayerModalProps = {
  visible: boolean;
  name: string;
  error: string | null;
  onClose: () => void;
  onChangeName: (value: string) => void;
  onConfirm: () => void;
};

export function LobbyAddPlayerModal({
  visible,
  name,
  error,
  onClose,
  onChangeName,
  onConfirm,
}: LobbyAddPlayerModalProps) {
  const { locale } = useI18n();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={locale === 'pt' ? 'Adicionar jogador' : 'Add player'}>
      <Input
        value={name}
        onChangeText={onChangeName}
        errorText={error ?? undefined}
        placeholder={locale === 'pt' ? 'Nome do jogador' : 'Player name'}
        accessibilityLabel={locale === 'pt' ? 'Nome do jogador' : 'Player name'}
      />

      <View style={styles.actionsRow}>
        <Button
          label={locale === 'pt' ? 'Adicionar' : 'Add'}
          onPress={onConfirm}
          variant="secondary"
          size="md"
          style={styles.confirmButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    marginTop: 4,
  },
  confirmButton: {
    width: '100%',
  },
});
