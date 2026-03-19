import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameCatalog, GameCatalogItem, getGameById } from '@/src/features/catalog';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { createCatalogCardEntering, useReducedMotion } from '@/src/ui/motion';
import { BottomActionDock, Button, GameTopBar, Input, Modal } from '@/src/ui/atoms';

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export default function CatalogScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const startSession = useLobbySessionStore((state) => state.startSession);
  const createRemoteSession = useLobbySessionStore((state) => state.createRemoteSession);
  const joinRemoteSession = useLobbySessionStore((state) => state.joinRemoteSession);
  const getPreferredNickname = useLobbySessionStore((state) => state.getPreferredNickname);
  const setPreferredNickname = useLobbySessionStore((state) => state.setPreferredNickname);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [openRoomVisible, setOpenRoomVisible] = useState(false);
  const [openRoomCode, setOpenRoomCode] = useState('');
  const [openRoomError, setOpenRoomError] = useState<string | null>(null);
  const [remoteNickname, setRemoteNickname] = useState('');
  const [remoteNicknameError, setRemoteNicknameError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const selectedGame = useMemo(
    () => (selectedGameId ? getGameById(selectedGameId) : undefined),
    [selectedGameId]
  );
  const gridColumns = viewportWidth >= 780 ? 2 : 1;
  const gridItemWidth = gridColumns === 1 ? '100%' : '48.8%';
  const gridItemMaxWidth = gridColumns === 1 ? 560 : 320;
  const dockHelperText =
    locale === 'pt'
      ? 'Ja tem codigo de sala? Entre direto sem criar lobby novo.'
      : 'Already have a room code? Join directly without creating a new lobby.';
  const catalogHeaderTitle = locale === 'pt' ? 'Catalogo de Jogos' : 'Game Catalog';

  const openGame = (game: GameCatalogItem) => {
    if (game.status === 'coming') {
      triggerGameFeedback('warning');
      return;
    }

    triggerGameFeedback('confirm');
    setRemoteNicknameError(null);
    setSelectedGameId(game.id);
  };

  const resolveRemoteNickname = (): string | null => {
    const normalized = remoteNickname.trim();

    if (!normalized) {
      setRemoteNicknameError(t('catalog.nicknameRequired'));
      return null;
    }

    return normalized;
  };

  const launchMode = async (mode: 'local' | 'remote') => {
    if (!selectedGame) {
      return;
    }

    if (mode === 'local') {
      setRemoteNicknameError(null);
      startSession(selectedGame.id, mode);
      triggerGameFeedback('submit');
      setSelectedGameId(null);
      router.push('/lobby');
      return;
    }

    const nickname = resolveRemoteNickname();

    if (!nickname) {
      return;
    }

    try {
      setIsCreatingRoom(true);
      setRemoteNicknameError(null);
      await createRemoteSession(selectedGame.id, { nickname });
      triggerGameFeedback('submit');
      setSelectedGameId(null);
      router.push('/lobby');
    } catch (error) {
      triggerGameFeedback('error');
      Alert.alert(
        t('catalog.openRoomTitle'),
        resolveErrorMessage(error, t('catalog.openRoomInvalid'))
      );
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const joinExistingLobby = async () => {
    const nickname = resolveRemoteNickname();
    const normalizedCode = openRoomCode.trim().toUpperCase();

    if (!nickname) {
      return;
    }

    if (!normalizedCode) {
      setOpenRoomError(t('catalog.openRoomEmpty'));
      return;
    }

    try {
      setIsJoiningRoom(true);
      setOpenRoomError(null);
      setRemoteNicknameError(null);
      await joinRemoteSession(normalizedCode, { nickname });
      triggerGameFeedback('submit');
      setOpenRoomCode('');
      setOpenRoomVisible(false);
      router.push('/lobby');
    } catch (error) {
      triggerGameFeedback('error');
      setOpenRoomError(resolveErrorMessage(error, t('catalog.openRoomInvalid')));
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const openJoinRoomModal = () => {
    triggerGameFeedback('confirm');
    setOpenRoomVisible(true);
    setOpenRoomCode('');
    setOpenRoomError(null);
    setRemoteNicknameError(null);
  };

  useEffect(() => {
    let active = true;

    void getPreferredNickname().then((storedNickname) => {
      if (!active || !storedNickname) {
        return;
      }

      setRemoteNickname((currentValue) =>
        currentValue.trim() ? currentValue : storedNickname.slice(0, 20)
      );
    });

    return () => {
      active = false;
    };
  }, [getPreferredNickname]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}> 
      <ScrollView contentContainerStyle={styles.container}>
        <GameTopBar
          title={catalogHeaderTitle}
          statusTone="success"
          onPressRight={() => router.push('/modal')}
          rightSymbolName={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
          rightAccessibilityLabel={t('settings.title')}
        />

        <View style={styles.grid}>
          {gameCatalog.map((game, index) => (
            <Animated.View
              key={game.id}
              entering={createCatalogCardEntering(index, reduceMotion)}
              style={[
                styles.gridItem,
                {
                  width: gridItemWidth,
                  maxWidth: gridItemMaxWidth,
                },
              ]}>
              <Pressable
                onPress={() => openGame(game)}
                style={({ pressed }) => [
                  styles.gameCard,
                  {
                    opacity: game.status === 'coming' ? 0.55 : pressed ? 0.84 : 1,
                    backgroundColor: game.coverTone,
                    borderColor: theme.semantic.border.subtle,
                  },
                ]}>
                <View
                  style={[
                    styles.cover,
                    {
                      borderColor: theme.semantic.border.subtle,
                      backgroundColor: theme.semantic.bg.surface,
                    },
                  ]}>
                  <View
                    style={[
                      styles.coverPlaceholder,
                      {
                        borderColor: theme.semantic.border.subtle,
                      },
                    ]}>
                    <SymbolView
                      name={{ ios: 'photo', android: 'image', web: 'image' }}
                      size={26}
                      tintColor={theme.semantic.text.muted}
                    />
                    <Text
                      style={[
                        styles.coverPlaceholderLabel,
                        {
                          color: theme.semantic.text.muted,
                          fontFamily: theme.semantic.typography.bodyFamily,
                          fontWeight: theme.semantic.typography.bodyWeight,
                        },
                      ]}>
                      {locale === 'pt' ? 'Imagem em breve' : 'Image coming soon'}
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.gameTitle,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.titleFamily,
                      fontWeight: theme.semantic.typography.titleWeight,
                    },
                  ]}>
                  {game.title[locale]}
                </Text>

                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.iconBadge,
                      {
                        backgroundColor: theme.semantic.badge.neutralBg,
                      },
                    ]}>
                    <SymbolView
                      name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
                      size={12}
                      tintColor={theme.semantic.badge.neutralText}
                    />
                    <Text
                      style={[
                        styles.iconBadgeLabel,
                        {
                          color: theme.semantic.badge.neutralText,
                          fontFamily: theme.semantic.typography.bodyFamily,
                          fontWeight: theme.semantic.typography.bodyWeight,
                        },
                      ]}>
                      {`${game.players.min}-${game.players.max} ${
                        locale === 'pt' ? 'jogadores' : 'players'
                      }`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.iconBadge,
                      {
                        backgroundColor: theme.semantic.badge.neutralBg,
                      },
                    ]}>
                    <SymbolView
                      name={
                        game.mode === 'local'
                          ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
                          : game.mode === 'remote'
                            ? { ios: 'wifi', android: 'wifi', web: 'wifi' }
                            : { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }
                      }
                      size={12}
                      tintColor={theme.semantic.badge.neutralText}
                    />
                    <Text
                      style={[
                        styles.iconBadgeLabel,
                        {
                          color: theme.semantic.badge.neutralText,
                          fontFamily: theme.semantic.typography.bodyFamily,
                          fontWeight: theme.semantic.typography.bodyWeight,
                        },
                      ]}>
                      {game.mode === 'local'
                        ? locale === 'pt'
                          ? 'Local'
                          : 'Local'
                        : game.mode === 'remote'
                          ? 'Online'
                          : locale === 'pt'
                            ? 'Local + Online'
                            : 'Local + Online'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selectedGame)}
        title={
          selectedGame
            ? t('catalog.chooseModeTitle', { game: selectedGame.title[locale] })
            : t('catalog.chooseModeTitle', { game: '' })
        }
        onClose={() => {
          setSelectedGameId(null);
          setRemoteNicknameError(null);
        }}>
        <Text
          style={[
            styles.modalSubtitle,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {t('catalog.chooseModeSubtitle')}
        </Text>

        <Input
          label={t('catalog.nicknameLabel')}
          errorText={remoteNicknameError ?? undefined}
          value={remoteNickname}
          onChangeText={(value) => {
            const nextNickname = value.slice(0, 20);
            setRemoteNickname(nextNickname);
            void setPreferredNickname(nextNickname);

            if (remoteNicknameError) {
              setRemoteNicknameError(null);
            }
          }}
          placeholder={t('catalog.nicknamePlaceholder')}
        />

        <View style={styles.modeActions}>
          <Button
            label={t('catalog.playOnDevice')}
            variant="secondary"
            onPress={() => launchMode('local')}
            disabled={selectedGame?.mode === 'remote' || isCreatingRoom}
          />
          <Button
            label={t('catalog.createRemoteRoom')}
            onPress={() => launchMode('remote')}
            loading={isCreatingRoom}
            disabled={selectedGame?.mode === 'local' || isCreatingRoom}
          />
        </View>
      </Modal>

      <Modal
        visible={openRoomVisible}
        title={t('catalog.openRoomTitle')}
        onClose={() => {
          setOpenRoomVisible(false);
          setOpenRoomError(null);
          setOpenRoomCode('');
          setRemoteNicknameError(null);
        }}>
        <Text
          style={[
            styles.modalSubtitle,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {t('catalog.openRoomSubtitle')}
        </Text>

        <Input
          label={t('catalog.nicknameLabel')}
          errorText={remoteNicknameError ?? undefined}
          value={remoteNickname}
          onChangeText={(value) => {
            const nextNickname = value.slice(0, 20);
            setRemoteNickname(nextNickname);
            void setPreferredNickname(nextNickname);

            if (remoteNicknameError) {
              setRemoteNicknameError(null);
            }
          }}
          placeholder={t('catalog.nicknamePlaceholder')}
        />

        <Input
          errorText={openRoomError ?? undefined}
          value={openRoomCode}
          onChangeText={(value) => {
            setOpenRoomCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5));
            if (openRoomError) {
              setOpenRoomError(null);
            }
          }}
          placeholder={t('catalog.openRoomPlaceholder')}
        />

        <Button
          label={t('catalog.openRoomConfirm')}
          onPress={joinExistingLobby}
          loading={isJoiningRoom}
          disabled={isJoiningRoom}
        />
      </Modal>

      <BottomActionDock
        helperText={dockHelperText}
        primaryAction={{
          label: t('catalog.openRoom'),
          onPress: openJoinRoomModal,
          variant: 'secondary',
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 164,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    justifyContent: 'flex-start',
  },
  gridItem: {
  },
  gameCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    minHeight: 220,
    gap: 12,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  cover: {
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    aspectRatio: 16 / 7,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverPlaceholderLabel: {
    fontSize: 12,
  },
  gameTitle: {
    fontSize: 28,
    lineHeight: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
  },
  iconBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 26,
  },
  iconBadgeLabel: {
    fontSize: 12,
    lineHeight: 12,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  modeActions: {
    gap: 10,
  },
});
