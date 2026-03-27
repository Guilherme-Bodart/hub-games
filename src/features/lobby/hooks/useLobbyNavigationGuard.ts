import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { ThemeTokens } from '@/src/theme';
import type { HybridLobbyState } from '@/src/features/lobby/types';

type UseLobbyNavigationGuardParams = {
  lobby: HybridLobbyState | null;
  isLocalHost: boolean;
  clearRemoteStart: () => Promise<void>;
  endSession: () => void;
  title: string;
  leaveConfirmMessage: string;
  headerFamily: ThemeTokens['semantic']['typography']['titleFamily'];
  headerWeight: ThemeTokens['semantic']['typography']['titleWeight'];
  headerTextColor: string;
  headerBackgroundColor: string;
};

export function useLobbyNavigationGuard({
  lobby,
  isLocalHost,
  clearRemoteStart,
  endSession,
  title,
  leaveConfirmMessage,
  headerFamily,
  headerWeight,
  headerTextColor,
  headerBackgroundColor,
}: UseLobbyNavigationGuardParams) {
  const navigation = useNavigation();
  const router = useRouter();
  const allowLeaveRef = useRef(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: headerBackgroundColor },
      headerTintColor: headerTextColor,
      headerTitleStyle: {
        fontFamily: headerFamily,
        fontWeight: headerWeight,
      },
    });
  }, [headerBackgroundColor, headerFamily, headerTextColor, headerWeight, navigation, title]);

  const leaveLobby = useCallback(() => {
    allowLeaveRef.current = true;
    if (lobby?.mode === 'remote' && isLocalHost) {
      void clearRemoteStart().catch(() => undefined);
    }
    endSession();

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [clearRemoteStart, endSession, isLocalHost, lobby?.mode, router]);

  useEffect(() => {
    if (!lobby) {
      return;
    }

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowLeaveRef.current) {
        return;
      }

      event.preventDefault();

      if (Platform.OS === 'web') {
        const shouldLeave = globalThis.confirm ? globalThis.confirm(leaveConfirmMessage) : true;
        if (shouldLeave) {
          leaveLobby();
        }
        return;
      }

      setLeaveModalVisible(true);
    });

    return unsubscribe;
  }, [leaveConfirmMessage, leaveLobby, lobby, navigation]);

  const dismissLeaveLobby = useCallback(() => {
    setLeaveModalVisible(false);
  }, []);

  const confirmLeaveLobby = useCallback(() => {
    setLeaveModalVisible(false);
    leaveLobby();
  }, [leaveLobby]);

  const onBackToCatalog = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return {
    leaveModalVisible,
    dismissLeaveLobby,
    confirmLeaveLobby,
    onBackToCatalog,
  };
}
