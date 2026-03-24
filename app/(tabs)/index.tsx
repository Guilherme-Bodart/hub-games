import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameCatalog, GameCatalogItem } from '@/src/features/catalog';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { resolveThemeSystemGradient, useTheme } from '@/src/theme';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { Button, IconCircleButton } from '@/src/ui/atoms';

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const NICKNAME_PREFIXES = ['Neo', 'Turbo', 'Pixel', 'Luna', 'Vibe', 'Ninja', 'Cosmo', 'Candy'];
const NICKNAME_SUFFIXES = ['Fox', 'Spark', 'Wave', 'Bolt', 'Panda', 'Nova', 'Byte', 'Star'];

const createRandomNickname = (): string => {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  const seed = Math.floor(Math.random() * 90 + 10);
  return `${prefix}${suffix}${seed}`.slice(0, 20);
};

const normalizeRoomCode = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);

const resolveModeMeta = (mode: GameCatalogItem['mode']) => {
  if (mode === 'local') {
    return { icons: ['phone-portrait-outline'] };
  }

  if (mode === 'remote') {
    return { icons: ['globe-outline'] };
  }

  return { icons: ['phone-portrait-outline', 'globe-outline'] };
};

const ui = {
  cardPurple: '#7F72E8',
  cardCyan: '#28C2E0',
  cardPink: '#F377B6',
  cardBlue: '#5BAFEF',
  clayOrange: '#F8A409',
  clayBlue: '#227DDB',
};

export default function CatalogScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { themeName } = useTheme();
  const createRemoteSession = useLobbySessionStore((state) => state.createRemoteSession);
  const joinRemoteSession = useLobbySessionStore((state) => state.joinRemoteSession);
  const getPreferredNickname = useLobbySessionStore((state) => state.getPreferredNickname);
  const setPreferredNickname = useLobbySessionStore((state) => state.setPreferredNickname);
  const [bgStart, bgEnd] = resolveThemeSystemGradient(themeName);

  const [nickname, setNickname] = useState('');
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isCodeModalVisible, setIsCodeModalVisible] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCodeError, setRoomCodeError] = useState<string | null>(null);

  const readyGames = useMemo(() => gameCatalog.filter((game) => game.status === 'ready'), []);

  useEffect(() => {
    let active = true;

    void getPreferredNickname().then((storedNickname) => {
      if (!active) {
        return;
      }

      const normalized = storedNickname.trim();
      if (normalized) {
        const sanitized = normalized.slice(0, 20);
        setNickname(sanitized);
        setNicknameDraft(sanitized);
        return;
      }

      const generated = createRandomNickname();
      setNickname(generated);
      setNicknameDraft(generated);
      void setPreferredNickname(generated);
    });

    return () => {
      active = false;
    };
  }, [getPreferredNickname, setPreferredNickname]);

  const resolveNickname = (): string => {
    const normalized = nickname.trim();

    if (normalized) {
      return normalized.slice(0, 20);
    }

    const generated = createRandomNickname();
    setNickname(generated);
    void setPreferredNickname(generated);
    return generated;
  };

  const shuffleNickname = () => {
    const next = createRandomNickname();
    setIsEditingNickname(false);
    setNickname(next);
    setNicknameDraft(next);
    void setPreferredNickname(next);
    triggerGameFeedback('confirm');
  };

  const startNicknameEditing = () => {
    setNicknameDraft(nickname);
    setIsEditingNickname(true);
    triggerGameFeedback('confirm');
  };

  const commitNicknameEdit = () => {
    const normalized = nicknameDraft.trim().slice(0, 20);
    const nextNickname = normalized || createRandomNickname();
    setNickname(nextNickname);
    setNicknameDraft(nextNickname);
    setIsEditingNickname(false);
    void setPreferredNickname(nextNickname);
  };

  const openGame = async (game: GameCatalogItem) => {
    const sessionNickname = resolveNickname();

    try {
      setIsCreatingRoom(true);
      await createRemoteSession(game.id, { nickname: sessionNickname });
      triggerGameFeedback('submit');
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

  const openJoinCodeModal = () => {
    setRoomCodeInput('');
    setRoomCodeError(null);
    setIsCodeModalVisible(true);
    triggerGameFeedback('confirm');
  };

  const joinByCode = async () => {
    const normalizedCode = normalizeRoomCode(roomCodeInput);

    if (!normalizedCode) {
      setRoomCodeError(locale === 'pt' ? 'Digite o código da sala.' : 'Enter the room code.');
      return;
    }

    const sessionNickname = resolveNickname();

    try {
      setIsJoiningRoom(true);
      setRoomCodeError(null);
      await joinRemoteSession(normalizedCode, { nickname: sessionNickname });
      triggerGameFeedback('submit');
      setIsCodeModalVisible(false);
      router.push('/lobby');
    } catch (error) {
      triggerGameFeedback('error');
      Alert.alert(
        t('catalog.openRoomTitle'),
        resolveErrorMessage(error, t('catalog.openRoomInvalid'))
      );
    } finally {
      setIsJoiningRoom(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={[bgStart, bgEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <View className="flex-1 px-3 pt-2" style={styles.pageFrame}>
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
                    onChangeText={(value) => setNicknameDraft(value.slice(0, 20))}
                    onSubmitEditing={commitNicknameEdit}
                    onBlur={commitNicknameEdit}
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
                onPress={startNicknameEditing}
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
                onPress={shuffleNickname}
                accessibilityLabel={locale === 'pt' ? 'Trocar apelido' : 'Shuffle nickname'}
                tone="neutral"
                iconSize={18}
              />

              <IconCircleButton
                icon="settings-sharp"
                onPress={() => router.push('/modal')}
                accessibilityLabel={t('settings.title')}
                tone="neutral"
                iconSize={19}
              />
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={styles.cardsContent}>
          <View className="flex-row flex-wrap justify-between gap-[10px]">
            {readyGames.slice(0, 4).map((game, index) => {
              const cardTone =
                index === 0
                  ? styles.cardPurple
                  : index === 1
                    ? styles.cardCyan
                    : index === 2
                      ? styles.cardPink
                      : styles.cardBlue;
              const buttonTone = index % 2 === 0 ? styles.buttonOrange : styles.buttonBlue;
              const modeMeta = resolveModeMeta(game.mode);

              return (
                <View
                  key={game.id}
                  className="relative min-h-[220px] w-[48.5%] overflow-hidden rounded-[18px] border px-2 py-[10px]"
                  style={[styles.gameTile, cardTone]}>
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
                        void openGame(game);
                      }}
                      disabled={isCreatingRoom || isJoiningRoom}
                      className="mt-auto min-h-[46px] items-center justify-center rounded-[14px] border"
                      style={({ pressed }) => [
                        styles.tileActionButton,
                        buttonTone,
                        pressed ? styles.tileActionPressed : null,
                        isCreatingRoom || isJoiningRoom ? styles.modeButtonDisabled : null,
                      ]}>
                      <Text className="text-center font-display text-[14px] leading-[16px] tracking-[0.7px] text-white">
                        {isCreatingRoom
                          ? locale === 'pt'
                            ? 'ABRINDO...'
                            : 'OPENING...'
                          : locale === 'pt'
                            ? 'JOGAR AGORA'
                            : 'PLAY NOW'}
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
            onPress={openJoinCodeModal}
            variant="secondary"
            size="lg"
            style={styles.codeButton}
          />
        </View>
      </View>

      <RNModal
        visible={isCodeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCodeModalVisible(false)}>
        <View className="flex-1 justify-center bg-[#18122E73] px-5">
          <View className="gap-[10px] rounded-3xl border border-white/90 bg-white/80 px-[14px] pb-[14px] pt-4">
            <IconCircleButton
              icon="close"
              accessibilityLabel={locale === 'pt' ? 'Fechar modal de código' : 'Close code modal'}
              onPress={() => setIsCodeModalVisible(false)}
              tone="neutral"
              size={34}
              iconSize={18}
              style={styles.codeModalCloseButton}
            />

            <Text className="pr-11 font-display text-[30px] leading-[30px] tracking-[0.4px] text-catalog-ink">
              {locale === 'pt' ? 'Entrar com código' : 'Join with code'}
            </Text>
            <Text className="font-body text-[14px] leading-[18px] text-[#4A4A6F]">
              {locale === 'pt'
                ? 'Digite o código da sala para entrar direto no lobby.'
                : 'Type the room code to join the lobby directly.'}
            </Text>

            <TextInput
              value={roomCodeInput}
              onChangeText={(value) => {
                setRoomCodeInput(normalizeRoomCode(value));
                if (roomCodeError) {
                  setRoomCodeError(null);
                }
              }}
              placeholder={locale === 'pt' ? 'Ex: 7ZP2K' : 'Ex: 7ZP2K'}
              placeholderTextColor="rgba(43,42,70,0.45)"
              className="min-h-[52px] rounded-2xl border bg-white/90 px-[14px] text-center font-number text-[22px] tracking-[1.5px] text-catalog-ink"
              style={[styles.codeModalInput, roomCodeError ? styles.codeModalInputError : null]}
              autoCorrect={false}
              autoCapitalize="characters"
              maxLength={5}
            />

            {roomCodeError ? (
              <Text className="-mt-[2px] font-body text-[12px] leading-[16px] text-[#C73961]">
                {roomCodeError}
              </Text>
            ) : null}

            <Button
              label={
                isJoiningRoom
                  ? locale === 'pt'
                    ? 'ENTRANDO...'
                    : 'JOINING...'
                  : locale === 'pt'
                    ? 'CONFIRMAR'
                    : 'CONFIRM'
              }
              onPress={() => {
                void joinByCode();
              }}
              disabled={isJoiningRoom}
              variant="primary"
              size="lg"
              style={[styles.codeModalConfirmButton, isJoiningRoom ? styles.modeButtonDisabled : null]}
            />
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  pageFrame: {
    backgroundColor: 'rgba(255,255,255,0.80)',
  },
  backgroundMilkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  cardsContent: {
    paddingBottom: 120,
  },
  gameTile: {
    borderColor: 'rgba(255,255,255,0.48)',
  },
  tileTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  cardPurple: {
    backgroundColor: ui.cardPurple,
  },
  cardCyan: {
    backgroundColor: ui.cardCyan,
  },
  cardPink: {
    backgroundColor: ui.cardPink,
  },
  cardBlue: {
    backgroundColor: ui.cardBlue,
  },
  tileActionButton: {
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tileActionPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonOrange: {
    backgroundColor: ui.clayOrange,
  },
  buttonBlue: {
    backgroundColor: ui.clayBlue,
  },
  codeButton: {
    width: '100%',
  },
  codeModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  codeModalInput: {
    borderColor: 'rgba(61,57,100,0.35)',
    fontFamily: 'Nunito_800ExtraBold',
  },
  codeModalInputError: {
    borderColor: '#D6456B',
  },
  codeModalConfirmButton: {
    borderRadius: 16,
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
});
