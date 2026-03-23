import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameCatalog, GameCatalogItem, getGameById } from '@/src/features/catalog';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { v2Tokens } from '@/src/v2/design-system';
import { V2BottomDock, V2Button, V2GlassCard, V2Header, V2Input, V2MeshBackground, V2Modal } from '@/src/v2/components';

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export function CatalogV2Screen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { width: viewportWidth } = useWindowDimensions();
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
  const gridItemWidth = gridColumns === 1 ? '100%' : '48.6%';

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
    <SafeAreaView style={styles.safeArea}>
      <V2MeshBackground />

      <ScrollView contentContainerStyle={styles.container}>
        <V2Header title={locale === 'pt' ? 'Catálogo de Jogos' : 'Game Catalog'} onSettings={() => router.push('/modal')} />

        <View style={styles.grid}>
          {gameCatalog.map((game) => (
            <View key={game.id} style={[styles.gridItem, { width: gridItemWidth }]}> 
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${game.title[locale]}. ${
                  game.status === 'coming'
                    ? locale === 'pt'
                      ? 'Em breve'
                      : 'Coming soon'
                    : locale === 'pt'
                    ? 'Abrir jogo'
                    : 'Open game'
                }`}
                accessibilityState={{ disabled: game.status === 'coming' }}
                onPress={() => openGame(game)}
                style={({ pressed, hovered }) => [
                  styles.cardPressable,
                  pressed ? styles.cardPressed : null,
                  hovered ? styles.cardHovered : null,
                  game.status === 'coming' ? styles.cardDisabled : null,
                ]}>
                <V2GlassCard style={styles.gameCard}>
                  <View style={styles.coverWrap}>
                    <View pointerEvents="none" style={styles.coverTintA} />
                    <View pointerEvents="none" style={styles.coverTintB} />
                    {game.coverImage ? (
                      <Image source={game.coverImage} style={styles.coverImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.coverPlaceholder}>
                        <SymbolView
                          name={
                            game.id === 'sintonia'
                              ? { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }
                              : { ios: 'eye.fill', android: 'visibility', web: 'visibility' }
                          }
                          size={48}
                          tintColor={v2Tokens.colors.textMuted}
                        />
                        <Text style={styles.coverPlaceholderLabel}>
                          {locale === 'pt' ? 'Imagem em breve' : 'Image coming soon'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text numberOfLines={1} style={styles.gameTitle}>{game.title[locale]}</Text>

                  <View style={styles.badgeRow}>
                    <View style={[styles.inlineChip, styles.inlineChipSuccess]}>
                      <SymbolView
                        name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
                        size={11}
                        tintColor="#11D9B5"
                      />
                      <Text style={[styles.inlineChipText, styles.inlineChipSuccessText]}>
                        {`${game.players.min}-${game.players.max} ${locale === 'pt' ? 'jogadores' : 'players'}`}
                      </Text>
                    </View>

                    <View style={[styles.inlineChip, styles.inlineChipInfo]}>
                      <SymbolView
                        name={
                          game.mode === 'local'
                            ? { ios: 'iphone', android: 'smartphone', web: 'smartphone' }
                            : game.mode === 'remote'
                            ? { ios: 'wifi', android: 'wifi', web: 'wifi' }
                            : { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }
                        }
                        size={11}
                        tintColor="#CA8FFF"
                      />
                      <Text style={[styles.inlineChipText, styles.inlineChipInfoText]}>
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
                </V2GlassCard>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <V2BottomDock
        helperText={
          locale === 'pt'
            ? 'Já tem código de sala? Entre direto sem criar lobby novo.'
            : 'Already have a room code? Join directly without creating a new lobby.'
        }>
        <V2Button
          label={t('catalog.openRoom')}
          variant="secondary"
          onPress={() => {
            triggerGameFeedback('confirm');
            setOpenRoomVisible(true);
            setOpenRoomCode('');
            setOpenRoomError(null);
            setRemoteNicknameError(null);
          }}
        />
      </V2BottomDock>

      <V2Modal
        visible={Boolean(selectedGame)}
        title={
          selectedGame
            ? t('catalog.chooseModeTitle', { game: selectedGame.title[locale] })
            : t('catalog.chooseModeTitle', { game: '' })
        }
        subtitle={t('catalog.chooseModeSubtitle')}
        onClose={() => {
          setSelectedGameId(null);
          setRemoteNicknameError(null);
        }}>
        <Text style={styles.label}>{t('catalog.nicknameLabel')}</Text>
        <V2Input
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
        {remoteNicknameError ? <Text style={styles.errorText}>{remoteNicknameError}</Text> : null}

        <View style={styles.modalActions}>
          <V2Button
            label={t('catalog.playOnDevice')}
            variant="secondary"
            onPress={() => {
              void launchMode('local');
            }}
            disabled={selectedGame?.mode === 'remote' || isCreatingRoom}
          />
          <V2Button
            label={isCreatingRoom ? (locale === 'pt' ? 'Criando...' : 'Creating...') : t('catalog.createRemoteRoom')}
            onPress={() => {
              void launchMode('remote');
            }}
            disabled={selectedGame?.mode === 'local' || isCreatingRoom}
          />
        </View>
      </V2Modal>

      <V2Modal
        visible={openRoomVisible}
        title={t('catalog.openRoomTitle')}
        subtitle={t('catalog.openRoomSubtitle')}
        onClose={() => {
          setOpenRoomVisible(false);
          setOpenRoomError(null);
          setOpenRoomCode('');
          setRemoteNicknameError(null);
        }}>
        <Text style={styles.label}>{t('catalog.nicknameLabel')}</Text>
        <V2Input
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
        {remoteNicknameError ? <Text style={styles.errorText}>{remoteNicknameError}</Text> : null}

        <Text style={styles.label}>{t('catalog.openRoomConfirm')}</Text>
        <V2Input
          value={openRoomCode}
          onChangeText={(value) => {
            setOpenRoomCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5));
            if (openRoomError) {
              setOpenRoomError(null);
            }
          }}
          placeholder={t('catalog.openRoomPlaceholder')}
        />
        {openRoomError ? <Text style={styles.errorText}>{openRoomError}</Text> : null}

        <V2Button
          label={isJoiningRoom ? (locale === 'pt' ? 'Entrando...' : 'Joining...') : t('catalog.openRoomConfirm')}
          onPress={() => {
            void joinExistingLobby();
          }}
          disabled={isJoiningRoom}
        />
      </V2Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: v2Tokens.colors.background,
  },
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 162,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    maxWidth: 560,
  },
  cardPressable: {
    borderRadius: 20,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  cardHovered: {
    transform: [{ scale: 1.014 }],
  },
  cardDisabled: {
    opacity: 0.5,
  },
  gameCard: {
    minHeight: 228,
    padding: 14,
    borderColor: 'rgba(153, 107, 255, 0.4)',
    backgroundColor: 'rgba(23, 18, 38, 0.72)',
    shadowColor: '#A95BFF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 16 / 7,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(116, 102, 168, 0.42)',
    backgroundColor: 'rgba(56, 50, 84, 0.75)',
    marginBottom: 12,
  },
  coverTintA: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(189, 133, 255, 0.18)',
  },
  coverTintB: {
    position: 'absolute',
    width: '88%',
    height: '160%',
    right: -80,
    bottom: -70,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 228, 225, 0.18)',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: v2Tokens.colors.border,
    borderRadius: 12,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  coverPlaceholderLabel: {
    color: v2Tokens.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  gameTitle: {
    color: v2Tokens.colors.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
  },
  inlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    minHeight: 26,
  },
  inlineChipSuccess: {
    backgroundColor: 'rgba(16, 217, 181, 0.16)',
    borderColor: 'rgba(16, 217, 181, 0.34)',
  },
  inlineChipInfo: {
    backgroundColor: 'rgba(183, 115, 255, 0.16)',
    borderColor: 'rgba(183, 115, 255, 0.34)',
  },
  inlineChipText: {
    fontSize: 11,
    lineHeight: 12,
    fontWeight: '700',
  },
  inlineChipSuccessText: {
    color: '#11D9B5',
  },
  inlineChipInfoText: {
    color: '#CC9BFF',
  },
  label: {
    color: v2Tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  errorText: {
    color: v2Tokens.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    gap: 10,
    marginTop: 4,
  },
});

