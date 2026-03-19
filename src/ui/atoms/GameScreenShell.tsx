import { PropsWithChildren, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import { withAlpha } from '@/src/theme/utils';

type GameScreenShellProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  showBackdrop?: boolean;
  footerInset?: number;
}>;

export function GameScreenShell({
  children,
  style,
  contentStyle,
  footer,
  showBackdrop = true,
  footerInset = 128,
}: GameScreenShellProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }, style]}>
      {showBackdrop ? (
        <View pointerEvents="none" style={styles.backdropLayer}>
          <View
            style={[
              styles.backdropOrbTop,
              { backgroundColor: withAlpha(theme.semantic.status.error, 0.14) },
            ]}
          />
          <View
            style={[
              styles.backdropOrbBottom,
              { backgroundColor: withAlpha(theme.semantic.button.accent.bg, 0.16) },
            ]}
          />
          <View
            style={[
              styles.backdropOrbCenter,
              { backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.1) },
            ]}
          />
          {[0, 1, 2, 3, 4].map((line) => (
            <View
              key={`scanline-${line}`}
              style={[
                styles.scanline,
                {
                  top: 90 + line * 110,
                  backgroundColor: withAlpha(theme.semantic.text.primary, 0.05),
                },
              ]}
            />
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.semantic.layout.spacing.md,
            paddingTop: theme.semantic.layout.spacing.xl + theme.semantic.layout.spacing.md,
            paddingBottom: footer ? footerInset : theme.semantic.layout.spacing.md,
            gap: theme.semantic.layout.spacing.md,
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
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backdropOrbTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 999,
    top: -120,
    left: -70,
  },
  backdropOrbBottom: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 999,
    bottom: -130,
    right: -90,
  },
  backdropOrbCenter: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 999,
    top: '27%',
    alignSelf: 'center',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
});
