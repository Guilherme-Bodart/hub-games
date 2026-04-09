import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CatalogAvatarPickerModal,
  CatalogGameGrid,
  CatalogHeader,
  CatalogJoinCodeModal,
} from '@/src/features/catalog/components';
import { useCatalogScreen } from '@/src/features/catalog/hooks/useCatalogScreen';
import { catalogUi, styles } from '@/src/features/catalog/styles/catalogStyles';
import { useI18n } from '@/src/i18n';
import { Button } from '@/src/ui/atoms';

export default function CatalogScreen() {
  const { t } = useI18n();
  const { state, handlers } = useCatalogScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={[state.bgStart, state.bgEnd]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <View style={[styles.pageFrame, styles.pageContent]}>
        <View style={styles.headerSection}>
          <CatalogHeader
            title="FESTA HUB"
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

        <ScrollView style={styles.cardsScroll} contentContainerStyle={styles.cardsContent}>
          <View style={styles.sectionIntro}>
            <Text style={styles.sectionEyebrow}>{t('catalog.gameShowcase').toUpperCase()}</Text>
            <Text style={styles.sectionTitle}>{t('catalog.gameShowcaseSubtitle')}</Text>
          </View>
          <CatalogGameGrid
            games={state.readyGames}
            isBusy={state.isCreatingRoom || state.isJoiningRoom}
            onOpenGame={(game) => {
              void handlers.openGame(game);
            }}
          />
        </ScrollView>

        <View style={[styles.codeButtonDock, { paddingBottom: 16 }]}>
          <Button
            label={t('catalog.openRoom').toUpperCase()}
            accessibilityLabel={t('catalog.openRoomAccessLabel')}
            onPress={handlers.openJoinCodeModal}
            variant="primary"
            size="lg"
            color={catalogUi.roomButton}
            textColor="#20255C"
            style={styles.codeButtonAtom}
          />
        </View>
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
