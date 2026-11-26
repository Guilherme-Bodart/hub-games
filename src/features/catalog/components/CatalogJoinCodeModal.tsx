import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { Button, Input, Modal } from '@/src/ui/atoms';

type CatalogJoinCodeModalProps = {
  visible: boolean;
  isJoiningRoom: boolean;
  roomCodeInput: string;
  roomCodeError: string | null;
  onChangeRoomCode: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function CatalogJoinCodeModal({
  visible,
  isJoiningRoom,
  roomCodeInput,
  roomCodeError,
  onChangeRoomCode,
  onConfirm,
  onClose,
}: CatalogJoinCodeModalProps) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      closeStyle="solid"
      title={t('catalog.openRoomTitle')}
      subtitle={t('catalog.openRoomSubtitle')}>
      <Input
        value={roomCodeInput}
        onChangeText={onChangeRoomCode}
        placeholder={t('catalog.openRoomPlaceholder')}
        errorText={roomCodeError ?? undefined}
        autoCapitalize="characters"
        maxLength={5}
        returnKeyType="go"
        onSubmitEditing={onConfirm}
        disabled={isJoiningRoom}
      />

      <Button
        label={isJoiningRoom ? t('catalog.openRoomJoining') : t('catalog.openRoomConfirm')}
        onPress={onConfirm}
        disabled={isJoiningRoom}
        loading={isJoiningRoom}
        variant="primary"
        size="lg"
        style={styles.modalButton}
      />
    </Modal>
  );
}
