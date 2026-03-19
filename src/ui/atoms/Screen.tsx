import { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { theme } = useTheme();
  const containerSpacing = {
    paddingHorizontal: theme.semantic.layout.spacing.md,
    paddingVertical: theme.semantic.layout.spacing.md,
    gap: theme.semantic.layout.spacing.sm,
  };

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }]}> 
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            containerSpacing,
            { backgroundColor: theme.semantic.bg.app },
            contentContainerStyle,
          ]}
          style={style}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.bg.app }, style]}>
      <View style={[styles.container, containerSpacing, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});
