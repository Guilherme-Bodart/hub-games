import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { ELEVATION_STYLES, useTheme } from '@/src/theme';
import { AvatarSprite, IconCircleButton } from '@/src/ui/atoms';

type CatalogHeaderProps = {
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
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.topBar,
        ELEVATION_STYLES.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: theme.semantic.border.hairline,
        },
      ]}>
      <View style={styles.identityRow}>
        <Pressable
          onPress={onOpenAvatarPicker}
          accessibilityRole="button"
          accessibilityLabel={t('catalog.editAvatar')}
          style={({ pressed }) => [
            styles.avatarButton,
            {
              backgroundColor: theme.semantic.bg.subtle,
              borderColor: theme.semantic.border.hairline,
              opacity: pressed ? theme.semantic.motion.feedback.pressedOpacity : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}>
          <AvatarSprite avatarId={avatarId} size={38} />
        </Pressable>

        {isEditingNickname ? (
          <TextInput
            value={nicknameDraft}
            onChangeText={(value) => onNicknameDraftChange(value.slice(0, 20))}
            onSubmitEditing={onCommitNicknameEdit}
            onBlur={onCommitNicknameEdit}
            autoFocus
            maxLength={20}
            returnKeyType="done"
            style={[
              styles.nicknameInput,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}
            placeholder={t('catalog.nicknamePlaceholder')}
            placeholderTextColor={theme.semantic.input.placeholder}
            underlineColorAndroid="transparent"
          />
        ) : (
          <Pressable
            onPress={onStartNicknameEditing}
            accessibilityRole="button"
            accessibilityLabel={t('catalog.editNickname')}
            style={({ pressed }) => [
              styles.nicknameTapTarget,
              { opacity: pressed ? 0.72 : 1 },
            ]}>
            <View style={styles.nicknameTextRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.nicknameText,
                  {
                    color: theme.semantic.text.primary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {nickname}
              </Text>
              <Ionicons name="pencil" size={13} color={theme.semantic.text.muted} />
            </View>
          </Pressable>
        )}
      </View>

      <View style={styles.topBarActions}>
        <IconCircleButton
          icon="shuffle-outline"
          accessibilityLabel={t('catalog.shuffleNickname')}
          onPress={onShuffleNickname}
          size={40}
          iconSize={19}
        />
        <IconCircleButton
          icon="settings-outline"
          accessibilityLabel={settingsLabel}
          onPress={onOpenSettings}
          size={40}
          iconSize={19}
        />
      </View>
    </View>
  );
}
