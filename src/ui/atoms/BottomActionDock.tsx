import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';
import { Button } from '@/src/ui/atoms/Button';

type DockAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  style?: StyleProp<ViewStyle>;
};

type BottomActionDockProps = {
  primaryAction: DockAction;
  secondaryAction?: DockAction;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
};

export function BottomActionDock({
  primaryAction,
  secondaryAction,
  helperText,
  style,
}: BottomActionDockProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: withAlpha(theme.semantic.bg.overlay, 0.78),
          borderTopColor: theme.semantic.border.subtle,
          borderTopWidth: theme.semantic.layout.borderWidth.subtle,
          paddingHorizontal: theme.semantic.layout.spacing.md,
          paddingTop: theme.semantic.layout.spacing.sm,
          paddingBottom: Math.max(theme.semantic.layout.spacing.md, insets.bottom + 6),
          gap: theme.semantic.layout.spacing.sm,
        },
        style,
      ]}>
      <View
        style={[
          styles.inner,
          {
            maxWidth: 620,
            alignSelf: 'center',
            width: '100%',
          },
        ]}>
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
        <Button
          label={primaryAction.label}
          onPress={primaryAction.onPress}
          disabled={primaryAction.disabled}
          loading={primaryAction.loading}
          variant={primaryAction.variant}
          size="lg"
          style={primaryAction.style}
        />
        {secondaryAction ? (
          <Button
            label={secondaryAction.label}
            onPress={secondaryAction.onPress}
            disabled={secondaryAction.disabled}
            loading={secondaryAction.loading}
            variant={secondaryAction.variant ?? 'ghost'}
            size="md"
            style={secondaryAction.style}
          />
        ) : null}
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
  },
  inner: {
    gap: 8,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
