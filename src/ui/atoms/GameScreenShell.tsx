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
          <LinearGradient
            colors={['#FFF4F6', '#F0F7FF', '#F3F0FF']}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 1, y: 0.7 }}
            style={styles.backdropBase}
          />
          <View
            style={[
              styles.backdropOrbTop,
              { backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.12) },
            ]}
          />
          <View
            style={[
              styles.backdropOrbBottom,
              { backgroundColor: withAlpha(theme.semantic.button.accent.bg, 0.1) },
            ]}
          />
          <View
            style={[
              styles.backdropOrbCenter,
              { backgroundColor: withAlpha(theme.semantic.button.secondary.bg, 0.12) },
            ]}
          />
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
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
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
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
});
