import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/src/theme';
import { Button, Card, Screen } from '@/src/ui/atoms';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Rota não encontrada' }} />
      <Screen contentContainerStyle={styles.container}>
        <Card title="Ops" subtitle="Essa tela não existe no hub.">
          <Text
            style={[
              styles.text,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            Volte para o catálogo e continue a festa.
          </Text>
          <Link href="/" asChild>
            <Button label="Ir para home" onPress={() => undefined} />
          </Link>
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    fontSize: 14,
  },
});
