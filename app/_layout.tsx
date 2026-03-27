import { DarkTheme, Theme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import {
  Baloo2_700Bold,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AppStartupLoadingScreen } from '@/src/bootstrap/AppStartupLoadingScreen';
import { preloadWarmBootAssets } from '@/src/bootstrap/warmBoot';
import { ensureFirebaseAnonymousAuth, subscribeFirebaseConnection } from '@/src/integrations/firebase';
import { useLobbySessionStore } from '@/src/features/lobby';
import { FirebaseConnectionState } from '@/src/integrations/firebase';
import { I18nProvider, useI18n } from '@/src/i18n';
import { ThemeProvider, useTheme } from '@/src/theme';
import { triggerGameFeedback } from '@/src/ui/feedback';
import { MotionProvider, useReducedMotion } from '@/src/ui/motion';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Baloo2_700Bold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [bootReady, setBootReady] = useState(false);
  const [connectionState, setConnectionState] = useState<FirebaseConnectionState>('connecting');
  const previousConnectionState = useRef<FirebaseConnectionState | null>(null);
  const didRestoreRemoteSessionRef = useRef(false);
  const restoreRemoteSessionIfAny = useLobbySessionStore((state) => state.restoreRemoteSessionIfAny);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    let active = true;

    const warmBoot = async () => {
      await preloadWarmBootAssets();

      if (active) {
        setBootReady(true);
      }
    };

    void warmBoot();

    return () => {
      active = false;
    };
  }, [loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = subscribeFirebaseConnection((status) => {
      const nextState = status.state;
      const lastState = previousConnectionState.current;
      previousConnectionState.current = nextState;
      setConnectionState(nextState);

      if (lastState !== nextState) {
        if (nextState === 'disconnected') {
          triggerGameFeedback('reconnect');
        } else if (nextState === 'error') {
          triggerGameFeedback('warning');
        }
      }

      if (!__DEV__) {
        return;
      }

      const detail = status.message ? ` (${status.message})` : '';
      console.log(`[firebase] ${status.state}${detail}`);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    void ensureFirebaseAnonymousAuth()
      .then((uid) => {
        if (__DEV__) {
          console.log(`[firebase-auth] anonymous uid=${uid.slice(0, 8)}...`);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.log(
            `[firebase-auth] failed: ${error instanceof Error ? error.message : 'unknown error'}`
          );
        }
      });
  }, []);

  useEffect(() => {
    if (didRestoreRemoteSessionRef.current) {
      return;
    }

    didRestoreRemoteSessionRef.current = true;
    void restoreRemoteSessionIfAny().catch(() => undefined);
  }, [restoreRemoteSessionIfAny]);

  if (!loaded) {
    return null;
  }

  if (!bootReady) {
    return <AppStartupLoadingScreen />;
  }

  return (
    <ThemeProvider>
      <I18nProvider>
        <MotionProvider>
          <RootLayoutNav connectionState={connectionState} />
        </MotionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav({ connectionState }: { connectionState: FirebaseConnectionState }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  const navigationTheme = useMemo<Theme>(
    () => ({
      ...DarkTheme,
      dark: true,
      colors: {
        ...DarkTheme.colors,
        background: theme.semantic.bg.app,
        card: theme.semantic.bg.surface,
        border: theme.semantic.border.subtle,
        text: theme.semantic.text.primary,
        primary: theme.semantic.button.primary.bg,
        notification: theme.semantic.status.error,
      },
    }),
    [theme]
  );

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            animation: reduceMotion ? 'none' : 'fade_from_bottom',
            contentStyle: { backgroundColor: theme.semantic.bg.app },
            headerStyle: { backgroundColor: theme.semantic.bg.surface },
            headerTintColor: theme.semantic.text.primary,
            headerTitleStyle: {
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lobby" options={{ title: t('tabs.lobby') }} />
          <Stack.Screen
            name="game/[gameId]"
            options={{ headerShown: false, title: t('tabs.lobby') }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'card', headerShown: true, title: t('settings.title') }}
          />
        </Stack>
      </View>
    </NavigationThemeProvider>
  );
}
