import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseLobbyRoomCodeStateParams = {
  roomCode: string | null;
};

export function useLobbyRoomCodeState({ roomCode }: UseLobbyRoomCodeStateParams) {
  const [copied, setCopied] = useState(false);
  const [isRoomCodeHidden, setIsRoomCodeHidden] = useState(true);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopiedTimer = useCallback(() => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, []);

  const onCopyCode = useCallback(() => {
    if (!roomCode) {
      return;
    }

    void Clipboard.setStringAsync(roomCode);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    clearCopiedTimer();
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 1200);
  }, [clearCopiedTimer, roomCode]);

  const onToggleRoomCodeVisibility = useCallback(() => {
    setIsRoomCodeHidden((current) => !current);
    void Haptics.selectionAsync();
  }, []);

  useEffect(
    () => () => {
      clearCopiedTimer();
    },
    [clearCopiedTimer]
  );

  return {
    copied,
    isRoomCodeHidden,
    onCopyCode,
    onToggleRoomCodeVisibility,
  };
}
