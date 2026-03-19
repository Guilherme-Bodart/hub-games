import { StyleSheet, Text, View } from 'react-native';

import { FirebaseConnectionState } from '@/src/integrations/firebase';
import { useI18n } from '@/src/i18n';
import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type ConnectionStatusPillProps = {
  state: FirebaseConnectionState;
};

const getLabelKey = (state: FirebaseConnectionState) => {
  if (state === 'connected') {
    return 'connection.online' as const;
  }

  if (state === 'connecting' || state === 'disconnected') {
    return 'connection.reconnecting' as const;
  }

  if (state === 'disabled') {
    return 'connection.offline' as const;
  }

  return 'connection.error' as const;
};

export function ConnectionStatusPill({ state }: ConnectionStatusPillProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const color =
    state === 'connected'
      ? theme.semantic.game.connection.connected
      : state === 'connecting' || state === 'disconnected'
        ? theme.semantic.game.connection.reconnecting
        : state === 'disabled'
          ? theme.semantic.game.connection.offline
          : theme.semantic.game.connection.error;

  return (
    <View pointerEvents="none" style={styles.root}>
      <View
        style={[
          styles.pill,
          {
            borderColor: withAlpha(color, 0.4),
            backgroundColor: withAlpha(color, 0.18),
            borderRadius: theme.semantic.layout.radius.full,
            borderWidth: theme.semantic.layout.borderWidth.subtle,
            paddingHorizontal: theme.semantic.layout.spacing.sm,
            paddingVertical: theme.semantic.layout.spacing.xs,
            gap: theme.semantic.layout.spacing.xs,
          },
        ]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text
          style={[
            styles.label,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {t(getLabelKey(state))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
});
