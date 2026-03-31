import { Pressable, ScrollView, Text, View } from 'react-native';

import { AVATAR_ASSET_TOTAL } from '@/src/features/lobby/avatarCatalog';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { AvatarSprite, Modal } from '@/src/ui/atoms';

type CatalogAvatarPickerModalProps = {
  visible: boolean;
  selectedAvatarId: number;
  onSelectAvatar: (avatarId: number) => void;
  onClose: () => void;
};

const avatarIds = Array.from({ length: AVATAR_ASSET_TOTAL }, (_, index) => index);

export function CatalogAvatarPickerModal({
  visible,
  selectedAvatarId,
  onSelectAvatar,
  onClose,
}: CatalogAvatarPickerModalProps) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      closeStyle="solid"
      style={styles.avatarModal}
      title={t('catalog.avatarPickerTitle')}>
      <Text style={styles.avatarModalSubtitle}>{t('catalog.avatarPickerSubtitle')}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.avatarGrid}>
        {avatarIds.map((avatarId) => {
          const isSelected = avatarId === selectedAvatarId;

          return (
            <Pressable
              key={avatarId}
              onPress={() => onSelectAvatar(avatarId)}
              accessibilityRole="button"
              accessibilityLabel={t('catalog.editAvatar')}
              style={[
                styles.avatarOption,
                isSelected ? styles.avatarOptionSelected : null,
              ]}>
              <View style={styles.avatarOptionInner}>
                <AvatarSprite avatarId={avatarId} size={52} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Modal>
  );
}
