import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CatalogAvatarPickerModal,
  CatalogGameGrid,
  CatalogHeader,
  CatalogJoinBanner,
  CatalogJoinCodeModal,
} from '@/src/features/catalog/components';
import { useCatalogScreen } from '@/src/features/catalog/hooks/useCatalogScreen';
import { styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';

export default function CatalogScreen() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { locale, state, handlers } = useCatalogScreen();

  const gamesCountLabel =
    locale === 'pt'
      ? `${state.readyGames.length} jogos`
      : `${state.readyGames.length} games`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}>
      <View style={styles.pageContent}>
        <View style={styles.headerSection}>
          <CatalogHeader
            nickname={state.nickname}
            avatarId={state.avatarId}
            nicknameDraft={state.nicknameDraft}
            isEditingNickname={state.isEditingNickname}
            onNicknameDraftChange={handlers.setNicknameDraft}
            onStartNicknameEditing={handlers.startNicknameEditing}
            onCommitNicknameEdit={handlers.commitNicknameEdit}
            onOpenAvatarPicker={handlers.openAvatarPicker}
            onShuffleNickname={handlers.shuffleNickname}
            onOpenSettings={handlers.openSettings}
            settingsLabel={t('settings.title')}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <CatalogJoinBanner
            locale={locale}
            accessibilityLabel={t('catalog.openRoomAccessLabel')}
            onPress={handlers.openJoinCodeModal}
          />

          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {t('catalog.gameShowcase')}
            </Text>
            <Text
              style={[
                styles.sectionCount,
                {
                  color: theme.semantic.text.muted,
                  fontFamily: theme.semantic.typography.bodyFamily,
                },
              ]}>
              {gamesCountLabel}
            </Text>
          </View>

          <CatalogGameGrid
            games={state.readyGames}
            isBusy={state.isCreatingRoom || state.isJoiningRoom}
            onOpenGame={(game) => {
              void handlers.openGame(game);
            }}
          />
        </ScrollView>
      </View>

      <CatalogJoinCodeModal
        visible={state.isCodeModalVisible}
        isJoiningRoom={state.isJoiningRoom}
        roomCodeInput={state.roomCodeInput}
        roomCodeError={state.roomCodeError}
        onChangeRoomCode={handlers.setRoomCodeInput}
        onConfirm={() => {
          void handlers.joinByCode();
        }}
        onClose={handlers.closeJoinCodeModal}
      />

      <CatalogAvatarPickerModal
        visible={state.isAvatarPickerVisible}
        selectedAvatarId={state.avatarId}
        onSelectAvatar={handlers.selectAvatar}
        onClose={handlers.closeAvatarPicker}
      />
    </SafeAreaView>
  );
}
