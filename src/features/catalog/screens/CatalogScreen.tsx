import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameCatalog, type GameCatalogItem } from '@/src/features/catalog';
import {
  CatalogGameGrid,
  CatalogHeader,
  CatalogJoinCodeModal,
} from '@/src/features/catalog/components';
import { catalogUi, styles } from '@/src/features/catalog/styles/catalogStyles';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { Button } from '@/src/ui/atoms';
import { triggerGameFeedback } from '@/src/ui/feedback';

const NICKNAME_PREFIXES = ['Neo', 'Turbo', 'Pixel', 'Luna', 'Vibe', 'Ninja', 'Cosmo', 'Candy'];
const NICKNAME_SUFFIXES = ['Fox', 'Spark', 'Wave', 'Bolt', 'Panda', 'Nova', 'Byte', 'Star'];

const resolveErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const createRandomNickname = (): string => {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  const seed = Math.floor(Math.random() * 90 + 10);
  return `${prefix}${suffix}${seed}`.slice(0, 20);
};

const normalizeRoomCode = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);

const CATALOG_SOFT_GRAY_GRADIENT = ['#EFF4FA', '#E7EEF7', '#DDE6F1'] as const;

export default function CatalogScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const createRemoteSession = useLobbySessionStore((state) => state.createRemoteSession);
  const joinRemoteSession = useLobbySessionStore((state) => state.joinRemoteSession);
  const getPreferredNickname = useLobbySessionStore((state) => state.getPreferredNickname);
  const setPreferredNickname = useLobbySessionStore((state) => state.setPreferredNickname);

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
      Alert.alert(t('catalog.openRoomTitle'), resolveErrorMessage(error, t('catalog.openRoomInvalid')));
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
      setRoomCodeError(t('catalog.openRoomEmpty'));
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
      Alert.alert(t('catalog.openRoomTitle'), resolveErrorMessage(error, t('catalog.openRoomInvalid')));
    } finally {
      setIsJoiningRoom(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        pointerEvents="none"
        colors={CATALOG_SOFT_GRAY_GRADIENT}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.backgroundMilkOverlay} />

      <View style={[styles.pageFrame, styles.pageContent]}>
        <View style={styles.headerSection}>
          <CatalogHeader
            title="FESTA HUB"
            nickname={nickname}
            nicknameDraft={nicknameDraft}
            isEditingNickname={isEditingNickname}
            onNicknameDraftChange={setNicknameDraft}
            onStartNicknameEditing={startNicknameEditing}
            onCommitNicknameEdit={commitNicknameEdit}
            onShuffleNickname={shuffleNickname}
            onOpenSettings={() => router.push('/modal')}
            settingsLabel={t('settings.title')}
          />
        </View>
        <ScrollView style={styles.cardsScroll} contentContainerStyle={styles.cardsContent}>
          <CatalogGameGrid
            games={readyGames}
            isBusy={isCreatingRoom || isJoiningRoom}
            onOpenGame={(game) => {
              void openGame(game);
            }}
          />
        </ScrollView>

        <View style={[styles.codeButtonDock, { paddingBottom: 16 }]}>
          <Button
            label={t('catalog.openRoom').toUpperCase()}
            accessibilityLabel={t('catalog.openRoomAccessLabel')}
            onPress={openJoinCodeModal}
            variant="primary"
            size="lg"
            color={catalogUi.roomButton}
            textColor="#20255C"
            style={styles.codeButtonAtom}
          />
        </View>
      </View>

      <CatalogJoinCodeModal
        visible={isCodeModalVisible}
        isJoiningRoom={isJoiningRoom}
        roomCodeInput={roomCodeInput}
        roomCodeError={roomCodeError}
        onChangeRoomCode={(value) => {
          setRoomCodeInput(normalizeRoomCode(value));
          if (roomCodeError) {
            setRoomCodeError(null);
          }
        }}
        onConfirm={() => {
          void joinByCode();
        }}
        onClose={() => setIsCodeModalVisible(false)}
      />
    </SafeAreaView>
  );
}
