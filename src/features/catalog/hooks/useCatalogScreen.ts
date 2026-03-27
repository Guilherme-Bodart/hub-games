import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { gameCatalog, type GameCatalogItem } from '@/src/features/catalog/games';
import {
  createRandomNickname,
  normalizeRoomCode,
  resolveErrorMessage,
} from '@/src/features/catalog/catalog.utils';
import type { UseCatalogScreenResult } from '@/src/features/catalog/catalog.types';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { triggerGameFeedback } from '@/src/ui/feedback';

const CATALOG_BG_START = '#EFF4FA';
const CATALOG_BG_END = '#DDE6F1';

export const useCatalogScreen = (): UseCatalogScreenResult => {
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
  const [roomCodeInput, setRoomCodeInputValue] = useState('');
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
    setRoomCodeInputValue('');
    setRoomCodeError(null);
    setIsCodeModalVisible(true);
    triggerGameFeedback('confirm');
  };

  const closeJoinCodeModal = () => {
    setIsCodeModalVisible(false);
  };

  const setRoomCodeInput = (value: string) => {
    setRoomCodeInputValue(normalizeRoomCode(value));
    if (roomCodeError) {
      setRoomCodeError(null);
    }
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
      closeJoinCodeModal();
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

  const openSettings = () => {
    router.push('/modal');
  };

  return {
    locale,
    state: {
      nickname,
      nicknameDraft,
      isEditingNickname,
      isCreatingRoom,
      isJoiningRoom,
      isCodeModalVisible,
      roomCodeInput,
      roomCodeError,
      readyGames,
      bgStart: CATALOG_BG_START,
      bgEnd: CATALOG_BG_END,
    },
    handlers: {
      openSettings,
      setNicknameDraft,
      startNicknameEditing,
      commitNicknameEdit,
      shuffleNickname,
      openJoinCodeModal,
      closeJoinCodeModal,
      setRoomCodeInput,
      joinByCode,
      openGame,
    },
  };
};
