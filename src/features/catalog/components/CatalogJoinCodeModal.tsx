import { Text, TextInput, View } from 'react-native';

import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { Button, Modal } from '@/src/ui/atoms';

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
      style={styles.codeModal}
      title={t('catalog.openRoomTitle')}>
      <Text style={styles.codeModalSubtitle}>{t('catalog.openRoomSubtitle')}</Text>

      <View style={styles.codeModalInputWrap}>
        <TextInput
          value={roomCodeInput}
          onChangeText={onChangeRoomCode}
          placeholder={t('catalog.openRoomPlaceholder')}
          placeholderTextColor="rgba(43,42,70,0.45)"
          style={[styles.codeModalInput, roomCodeError ? styles.codeModalInputError : null]}
          autoCorrect={false}
          autoCapitalize="characters"
          maxLength={5}
        />
      </View>

      {roomCodeError ? <Text style={styles.codeModalError}>{roomCodeError}</Text> : null}

      <Button
        label={isJoiningRoom ? t('catalog.openRoomJoining').toUpperCase() : t('catalog.openRoomConfirm').toUpperCase()}
        onPress={onConfirm}
        disabled={isJoiningRoom}
        variant="primary"
        size="lg"
        style={[styles.codeModalConfirmButton, isJoiningRoom ? styles.modeButtonDisabled : null]}
      />
    </Modal>
  );
}
