import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getGameById } from '@/src/features/catalog';
import { GamePhaseTransitionOverlay } from '@/src/features/games/GamePhaseTransitionOverlay';
import { getGamePlugin } from '@/src/features/games';
import { useLobbySessionStore } from '@/src/features/lobby';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { useReducedMotion } from '@/src/ui/motion';
import { Button, Card, Screen } from '@/src/ui/atoms';

const normalizeParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default function GameRuntimeRoute() {
  const { theme } = useTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const lobby = useLobbySessionStore((state) => state.lobby);
  const sessionRestoreStatus = useLobbySessionStore((state) => state.sessionRestoreStatus);
  const reduceMotion = useReducedMotion();
  const [shellPhaseLabel, setShellPhaseLabel] = useState<string | null>(null);

  const routeGameId = normalizeParam(gameId);
  const selectedGameId = lobby?.gameId ?? routeGameId;

  if (!selectedGameId || !lobby) {
    if (sessionRestoreStatus === 'restoring') {
      return (
        <Screen contentContainerStyle={styles.centered}>
          <Card title={t('connection.reconnecting')} subtitle={t('game.noLobbySubtitle')} />
        </Screen>
      );
    }

    return (
      <Screen contentContainerStyle={styles.centered}>
        <Card title={t('game.noLobbyTitle')} subtitle={t('game.noLobbySubtitle')}>
          <Button label={t('game.returnCatalog')} onPress={() => router.replace('/(tabs)')} />
        </Card>
      </Screen>
    );
  }

  const plugin = getGamePlugin(selectedGameId);
  const catalogGame = getGameById(selectedGameId);
  const gameName = catalogGame?.title[locale] ?? selectedGameId;

  if (!plugin) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Stack.Screen options={{ title: gameName }} />
        <Card
          title={t('game.unavailableTitle')}
          subtitle={t('game.unavailableSubtitle', { game: gameName })}>
          <Text
            style={[
              styles.unavailableText,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {t('game.unavailableHint')}
          </Text>
          <Button label={t('game.returnLobby')} onPress={() => router.replace('/lobby')} />
        </Card>
      </Screen>
    );
  }

  const GameScreen = plugin.Screen;

  return (
    <View style={styles.runtimeRoot}>
      <Stack.Screen options={{ title: plugin.manifest.title[locale] }} />
      <GameScreen
        lobby={lobby}
        onExitLobby={() => router.replace('/lobby')}
        setShellPhase={setShellPhaseLabel}
      />
      {!reduceMotion ? <GamePhaseTransitionOverlay phaseLabel={shellPhaseLabel} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  runtimeRoot: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  unavailableText: {
    fontSize: 13,
  },
});
