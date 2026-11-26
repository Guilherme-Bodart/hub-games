import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ELEVATION_STYLES, useTheme } from '@/src/theme';
import { Button } from '@/src/ui/atoms/Button';

type DockAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  color?: string;
  plinthColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

type BottomActionDockProps = {
  primaryAction: DockAction;
  secondaryAction?: DockAction;
  helperText?: string;
  layout?: 'stacked' | 'row';
  style?: StyleProp<ViewStyle>;
};

export function BottomActionDock({
  primaryAction,
  secondaryAction,
  helperText,
  layout = 'stacked',
  style,
}: BottomActionDockProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isRow = layout === 'row' && Boolean(secondaryAction);

  return (
    <View
      style={[
        styles.root,
        ELEVATION_STYLES.floating,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderTopColor: theme.semantic.border.hairline,
          paddingHorizontal: theme.semantic.layout.spacing.md,
          paddingTop: 12,
          paddingBottom: Math.max(16, insets.bottom + 8),
        },
        style,
      ]}>
      <View style={styles.inner}>
        {helperText ? (
          <Text
            style={[
              styles.helperText,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.bodyFamily,
                fontWeight: theme.semantic.typography.bodyWeight,
              },
            ]}>
            {helperText}
          </Text>
        ) : null}
        <View style={isRow ? styles.actionsRow : styles.actionsStacked}>
          {isRow && secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              disabled={secondaryAction.disabled}
              loading={secondaryAction.loading}
              variant={secondaryAction.variant ?? 'secondary'}
              color={secondaryAction.color}
              plinthColor={secondaryAction.plinthColor}
              textColor={secondaryAction.textColor}
              size="lg"
              style={[styles.rowButton, secondaryAction.style]}
            />
          ) : null}
          <Button
            label={primaryAction.label}
            onPress={primaryAction.onPress}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
            variant={primaryAction.variant}
            color={primaryAction.color}
            plinthColor={primaryAction.plinthColor}
            textColor={primaryAction.textColor}
            size="lg"
            style={[isRow ? styles.rowButton : styles.fullButton, primaryAction.style]}
          />
          {!isRow && secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              disabled={secondaryAction.disabled}
              loading={secondaryAction.loading}
              variant={secondaryAction.variant ?? 'ghost'}
              color={secondaryAction.color}
              plinthColor={secondaryAction.plinthColor}
              textColor={secondaryAction.textColor}
              size="md"
              style={[styles.fullButton, secondaryAction.style]}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
  inner: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    gap: 8,
  },
  actionsStacked: {
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fullButton: {
    width: '100%',
  },
  rowButton: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
