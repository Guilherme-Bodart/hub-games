import { PropsWithChildren, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type GameScreenShellProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  showBackdrop?: boolean;
  accentColor?: string;
  footerInset?: number;
}>;

export function GameScreenShell({
  children,
  style,
  contentStyle,
  footer,
  showBackdrop = true,
  accentColor,
  footerInset = 112,
}: GameScreenShellProps) {
  const { theme } = useTheme();
  const topTint = accentColor ? withAlpha(accentColor, 0.08) : withAlpha(theme.semantic.button.primary.bg, 0.05);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }, style]}>
      {showBackdrop ? (
        <LinearGradient
          pointerEvents="none"
          colors={[topTint, theme.semantic.bg.app, theme.semantic.bg.app]}
          locations={[0, 0.34, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.backdrop}
        />
      ) : null}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.semantic.layout.spacing.md,
            paddingTop: 12,
            paddingBottom: footer ? footerInset : theme.semantic.layout.spacing.md,
            gap: 12,
          },
          contentStyle,
        ]}>
        {children}
      </View>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
});
