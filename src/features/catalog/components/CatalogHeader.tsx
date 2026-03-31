import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { styles as catalogStyles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { AvatarSprite, IconCircleButton } from '@/src/ui/atoms';

type CatalogHeaderProps = {
  title: string;
  nickname: string;
  avatarId: number;
  nicknameDraft: string;
  isEditingNickname: boolean;
  onNicknameDraftChange: (value: string) => void;
  onStartNicknameEditing: () => void;
  onCommitNicknameEdit: () => void;
  onOpenAvatarPicker: () => void;
  onShuffleNickname: () => void;
  onOpenSettings: () => void;
  settingsLabel: string;
};

export function CatalogHeader({
  title,
  nickname,
  avatarId,
  nicknameDraft,
  isEditingNickname,
  onNicknameDraftChange,
  onStartNicknameEditing,
  onCommitNicknameEdit,
  onOpenAvatarPicker,
  onShuffleNickname,
  onOpenSettings,
  settingsLabel,
}: CatalogHeaderProps) {
  const { t } = useI18n();

  return (
    <View style={styles.root}>
      <Text style={catalogStyles.catalogTitle}>{title}</Text>
      <View style={catalogStyles.profileCardShell}>
        {isEditingNickname ? (
          <View style={styles.identityWrap}>
            <View style={catalogStyles.profileIdentityRow}>
              <TouchableOpacity
                style={catalogStyles.profileAvatarWrap}
                onPress={onOpenAvatarPicker}
                accessibilityRole="button"
                accessibilityLabel={t('catalog.editAvatar')}
                activeOpacity={0.88}>
                <AvatarSprite avatarId={avatarId} size={30} />
              </TouchableOpacity>
              <TextInput
                value={nicknameDraft}
                onChangeText={(value) => onNicknameDraftChange(value.slice(0, 20))}
                onSubmitEditing={onCommitNicknameEdit}
                onBlur={onCommitNicknameEdit}
                autoFocus
                maxLength={20}
                style={styles.nicknameInput}
                placeholder={t('catalog.nicknamePlaceholder')}
                placeholderTextColor="rgba(43,42,70,0.45)"
              />
            </View>
          </View>
        ) : (
          <View style={styles.identityWrap}>
            <View style={catalogStyles.profileIdentityRow}>
              <TouchableOpacity
                style={catalogStyles.profileAvatarWrap}
                onPress={onOpenAvatarPicker}
                accessibilityRole="button"
                accessibilityLabel={t('catalog.editAvatar')}
                activeOpacity={0.88}>
                <AvatarSprite avatarId={avatarId} size={30} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onStartNicknameEditing}
                accessibilityRole="button"
                accessibilityLabel={t('catalog.editNickname')}
                activeOpacity={0.9}
                style={styles.nicknameTapTarget}>
                <Text numberOfLines={1} style={catalogStyles.profileNameText}>
                  {nickname}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionsRow}>
          <IconCircleButton
            icon="shuffle-outline"
            accessibilityLabel={t('catalog.shuffleNickname')}
            onPress={onShuffleNickname}
          />
          <IconCircleButton
            icon="settings-outline"
            accessibilityLabel={settingsLabel}
            onPress={onOpenSettings}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    paddingBottom: 14,
  },
  identityWrap: {
    flex: 1,
    paddingRight: 8,
  },
  nicknameInput: {
    flex: 1,
    color: '#23254D',
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    lineHeight: 22,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nicknameTapTarget: {
    flex: 1,
  },
});
