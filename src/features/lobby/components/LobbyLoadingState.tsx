import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useI18n } from '@/src/i18n';
import { Button, Card } from '@/src/ui/atoms';

type LobbyLoadingStateProps = {
  restoring: boolean;
  onBackToCatalog: () => void;
  style?: StyleProp<ViewStyle>;
};

export function LobbyLoadingState({ restoring, onBackToCatalog, style }: LobbyLoadingStateProps) {
  const { t } = useI18n();

  return (
    <View style={[styles.root, style]}>
      <Card
        title={t('tabs.lobby')}
        subtitle={restoring ? t('connection.reconnecting') : t('catalog.subtitle')}>
        {!restoring ? <Button label={t('tabs.catalog')} onPress={onBackToCatalog} /> : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
