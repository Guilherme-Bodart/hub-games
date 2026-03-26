import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { triggerGameFeedback } from '@/src/ui/feedback';
import type { Locale } from '@/src/i18n';

type UseLobbyPlayerModalsParams = {
  canAddPlayer: boolean;
  nextAutoName: string;
  locale: Locale;
  addPlayer: (name: string) => void;
};

export function useLobbyPlayerModals({
  canAddPlayer,
  nextAutoName,
  locale,
  addPlayer,
}: UseLobbyPlayerModalsParams) {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addPlayerName, setAddPlayerName] = useState('');
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  const openAddPlayerModal = useCallback(() => {
    if (!canAddPlayer) {
      return;
    }
    setAddPlayerName(nextAutoName);
    setAddPlayerError(null);
    setAddModalVisible(true);
  }, [canAddPlayer, nextAutoName]);

  const closeAddPlayerModal = useCallback(() => {
    setAddModalVisible(false);
    setAddPlayerError(null);
  }, []);

  const confirmAddPlayer = useCallback(() => {
    const normalized = addPlayerName.trim().slice(0, 20);
    if (!normalized) {
      setAddPlayerError(locale === 'pt' ? 'Digite um nome para continuar.' : 'Type a name to continue.');
      return;
    }

    addPlayer(normalized);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeAddPlayerModal();
    triggerGameFeedback('confirm');
  }, [addPlayer, addPlayerName, closeAddPlayerModal, locale]);

  const onAddPlayerNameChange = useCallback(
    (value: string) => {
      setAddPlayerName(value);
      if (addPlayerError) {
        setAddPlayerError(null);
      }
    },
    [addPlayerError]
  );

  const openLeaveModal = useCallback(() => {
    setLeaveModalVisible(true);
  }, []);

  const closeLeaveModal = useCallback(() => {
    setLeaveModalVisible(false);
  }, []);

  return {
    addModalVisible,
    addPlayerName,
    addPlayerError,
    leaveModalVisible,
    openAddPlayerModal,
    closeAddPlayerModal,
    confirmAddPlayer,
    onAddPlayerNameChange,
    openLeaveModal,
    closeLeaveModal,
  };
}
