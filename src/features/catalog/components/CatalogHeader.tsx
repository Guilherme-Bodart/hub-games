import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { styles as catalogStyles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { IconCircleButton } from '@/src/ui/atoms';

type CatalogHeaderProps = {
  title: string;
  nickname: string;
  nicknameDraft: string;
  isEditingNickname: boolean;
  onNicknameDraftChange: (value: string) => void;
  onStartNicknameEditing: () => void;
  onCommitNicknameEdit: () => void;
  onShuffleNickname: () => void;
  onOpenSettings: () => void;
  settingsLabel: string;
};

const personSymbolName = {
  ios: 'person.crop.circle',
  android: 'account_circle',
  web: 'account_circle',
} as const;

export function CatalogHeader({
  title,
  nickname,
  nicknameDraft,
  isEditingNickname,
  onNicknameDraftChange,
  onStartNicknameEditing,
  onCommitNicknameEdit,
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
              <View style={catalogStyles.profileAvatarWrap}>
                <SymbolView name={personSymbolName} size={28} tintColor="#6A6D88" />
              </View>
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
          <TouchableOpacity
            style={styles.identityWrap}
            onPress={onStartNicknameEditing}
            accessibilityRole="button"
            accessibilityLabel={t('catalog.editNickname')}
            activeOpacity={0.9}>
            <View style={catalogStyles.profileIdentityRow}>
              <View style={catalogStyles.profileAvatarWrap}>
                <SymbolView name={personSymbolName} size={28} tintColor="#6A6D88" />
              </View>
              <Text numberOfLines={1} style={catalogStyles.profileNameText}>
                {nickname}
              </Text>
            </View>
          </TouchableOpacity>
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
});
