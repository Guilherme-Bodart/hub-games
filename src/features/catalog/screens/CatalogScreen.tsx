import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CatalogHeader } from '@/src/features/catalog/components/CatalogHeader';
import { CatalogJoinCodeModal } from '@/src/features/catalog/components/CatalogJoinCodeModal';
import { useCatalogScreen } from '@/src/features/catalog/hooks/useCatalogScreen';
import { styles, resolveActionBackgroundStyle, resolveTileBackgroundStyle } from '@/src/features/catalog/catalog.styles';
import { resolveActionTone, resolveModeMeta, resolveTileTone } from '@/src/features/catalog/catalog.utils';
import { Button } from '@/src/ui/atoms';

export function CatalogScreen() {
  const { locale, state, handlers } = useCatalogScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={[state.bgStart, state.bgEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <View className="flex-1 px-3 pt-2" style={styles.pageFrame}>
        <CatalogHeader
          locale={locale}
          nickname={state.nickname}
          nicknameDraft={state.nicknameDraft}
          isEditingNickname={state.isEditingNickname}
          onStartEditNickname={handlers.startNicknameEditing}
          onCommitNicknameEdit={handlers.commitNicknameEdit}
          onChangeNicknameDraft={handlers.setNicknameDraft}
          onShuffleNickname={handlers.shuffleNickname}
          onOpenSettings={handlers.openSettings}
        />

        <ScrollView className="flex-1" contentContainerStyle={styles.cardsContent}>
          <View className="flex-row flex-wrap justify-between gap-[10px]">
            {state.readyGames.slice(0, 4).map((game, index) => {
              const tileTone = resolveTileTone(index);
              const actionTone = resolveActionTone(index);
              const modeMeta = resolveModeMeta(game.mode);

              return (
                <View
                  key={game.id}
                  className="relative min-h-[220px] w-[48.5%] overflow-hidden rounded-[18px] border px-2 py-[10px]"
                  style={[styles.gameTile, resolveTileBackgroundStyle(tileTone)]}>
                  <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)', 'rgba(26,20,56,0.16)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tileTextureOverlay}
                  />

                  <View className="flex-1">
                    <View className="mb-[2px] items-center justify-center py-1">
                      <Ionicons
                        name={game.id === 'sintonia' ? 'pulse-outline' : 'help-circle'}
                        size={54}
                        color="#2D3757"
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      className="text-center font-display text-[15px] leading-[17px] tracking-[0.7px] text-catalog-milk">
                      {game.id === 'impostor-neon' ? 'IMPOSTOR' : game.title[locale].toUpperCase()}
                    </Text>

                    <View className="mt-[6px] flex-row items-center self-center gap-[6px]">
                      <View className="flex-row items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2 py-1">
                        <Text className="font-number text-[10px] leading-[12px] tracking-[0.4px] text-catalog-milk">{`${game.players.min}-${game.players.max}`}</Text>
                        <Ionicons name="people" size={12} color="#F0EEFF" />
                      </View>

                      <View className="flex-row items-center gap-[6px] rounded-full border border-white/30 bg-white/15 px-2 py-1">
                        {modeMeta.icons.map((iconName) => (
                          <Ionicons
                            key={`${game.id}-${iconName}`}
                            name={iconName as never}
                            size={11}
                            color="#F0EEFF"
                          />
                        ))}
                      </View>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${locale === 'pt' ? 'Jogar agora' : 'Play now'} ${game.title[locale]}`}
                      onPress={() => {
                        void handlers.openGame(game);
                      }}
                      disabled={state.isCreatingRoom || state.isJoiningRoom}
                      className="mt-auto min-h-[46px] items-center justify-center rounded-[14px] border"
                      style={({ pressed }) => [
                        styles.tileActionButton,
                        resolveActionBackgroundStyle(actionTone),
                        pressed ? styles.tileActionPressed : null,
                        state.isCreatingRoom || state.isJoiningRoom ? styles.modeButtonDisabled : null,
                      ]}>
                      <Text className="text-center font-display text-[14px] leading-[16px] tracking-[0.7px] text-white">
                        state.isCreatingRoom
                          ? locale === 'pt'
                            ? 'ABRINDO...'
                            : 'OPENING...'
                          : locale === 'pt'
                            ? 'JOGAR AGORA'
                            : 'PLAY NOW'
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View className="absolute bottom-[10px] left-3 right-3">
          <Button
            label={locale === 'pt' ? 'CÓDIGO DA SALA' : 'ROOM CODE'}
            onPress={handlers.openJoinCodeModal}
            variant="secondary"
            size="lg"
            style={styles.codeButton}
          />
        </View>
      </View>

      <CatalogJoinCodeModal
        locale={locale}
        visible={state.isCodeModalVisible}
        isJoiningRoom={state.isJoiningRoom}
        roomCodeInput={state.roomCodeInput}
        roomCodeError={state.roomCodeError}
        onClose={handlers.closeJoinCodeModal}
        onChangeCode={handlers.setRoomCodeInput}
        onConfirm={() => {
          void handlers.joinByCode();
        }}
      />
    </SafeAreaView>
  );
}
