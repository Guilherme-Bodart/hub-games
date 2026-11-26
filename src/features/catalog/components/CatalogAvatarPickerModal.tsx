import { Pressable, ScrollView } from 'react-native';

import { AVATAR_ASSET_TOTAL } from '@/src/features/lobby/avatarCatalog';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { ELEVATION_STYLES, HUB_DEFAULT_ACCENT, useTheme } from '@/src/theme';
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
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      closeStyle="solid"
      title={t('catalog.avatarPickerTitle')}
      subtitle={t('catalog.avatarPickerSubtitle')}>
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
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.avatarOption,
                ELEVATION_STYLES.card,
                {
                  backgroundColor: isSelected
                    ? HUB_DEFAULT_ACCENT.tint
                    : theme.semantic.bg.surface,
                  borderColor: isSelected
                    ? HUB_DEFAULT_ACCENT.primary
                    : theme.semantic.border.hairline,
                  borderWidth: isSelected ? 2 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}>
              <AvatarSprite avatarId={avatarId} size={50} />
            </Pressable>
          );
        })}
      </ScrollView>
    </Modal>
  );
}
