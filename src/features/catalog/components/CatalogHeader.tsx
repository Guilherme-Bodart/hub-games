import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Locale } from '@/src/i18n';
import { IconCircleButton } from '@/src/ui/atoms';

type CatalogHeaderProps = {
  locale: Locale;
  nickname: string;
  nicknameDraft: string;
  isEditingNickname: boolean;
  onStartEditNickname: () => void;
  onCommitNicknameEdit: () => void;
  onChangeNicknameDraft: (value: string) => void;
  onShuffleNickname: () => void;
  onOpenSettings: () => void;
};

export function CatalogHeader({
  locale,
  nickname,
  nicknameDraft,
  isEditingNickname,
  onStartEditNickname,
  onCommitNicknameEdit,
  onChangeNicknameDraft,
  onShuffleNickname,
  onOpenSettings,
}: CatalogHeaderProps) {
  return (
    <View className="gap-[10px] pb-[10px]">
      <Text className="font-display text-[44px] leading-[44px] tracking-[0.8px] text-catalog-ink">
        FESTA HUB
      </Text>

      <View className="flex-row items-center justify-between">
        {isEditingNickname ? (
          <View className="flex-1 pr-[10px]">
            <View className="flex-row items-center gap-2">
              <View className="h-[42px] w-[42px] items-center justify-center rounded-full">
                <Ionicons name="person-circle-outline" size={40} color="#2B2A46" />
              </View>
              <TextInput
                value={nicknameDraft}
                onChangeText={(value) => onChangeNicknameDraft(value.slice(0, 20))}
                onSubmitEditing={onCommitNicknameEdit}
                onBlur={onCommitNicknameEdit}
                autoFocus
                maxLength={20}
                className="flex-1 bg-transparent px-0 py-0 font-display text-[22px] leading-[24px] tracking-[0.3px] text-catalog-ink"
                placeholder={locale === 'pt' ? 'Digite seu apelido' : 'Enter your nickname'}
                placeholderTextColor="rgba(43,42,70,0.45)"
              />
            </View>
          </View>
        ) : (
          <Pressable
            className="flex-1 pr-[10px]"
            onPress={onStartEditNickname}
            accessibilityRole="button"
            accessibilityLabel={locale === 'pt' ? 'Editar apelido' : 'Edit nickname'}>
            <View className="flex-row items-center gap-2">
              <View className="h-[42px] w-[42px] items-center justify-center rounded-full">
                <Ionicons name="person-circle-outline" size={40} color="#2B2A46" />
              </View>
              <Text
                numberOfLines={1}
                className="font-display text-[24px] leading-[26px] tracking-[0.4px] text-catalog-ink">
                {nickname}
              </Text>
            </View>
          </Pressable>
        )}

        <View className="flex-row items-center gap-2">
          <IconCircleButton
            icon="shuffle"
            onPress={onShuffleNickname}
            accessibilityLabel={locale === 'pt' ? 'Trocar apelido' : 'Shuffle nickname'}
            tone="neutral"
            iconSize={18}
          />

          <IconCircleButton
            icon="settings-sharp"
            onPress={onOpenSettings}
            accessibilityLabel={locale === 'pt' ? 'Configurações' : 'Settings'}
            tone="neutral"
            iconSize={19}
          />
        </View>
      </View>
    </View>
  );
}
