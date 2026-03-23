import { PropsWithChildren } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useTheme } from '@/src/theme';

type ModalProps = PropsWithChildren<{
  visible: boolean;
  title?: string;
  onClose: () => void;
  variant?: 'alert' | 'fullscreen';
  style?: StyleProp<ViewStyle>;
}>;

export function Modal({
  visible,
  title,
  onClose,
  variant = 'alert',
  children,
  style,
}: ModalProps) {
  const { theme } = useTheme();
  const isFullscreen = variant === 'fullscreen';

  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.semantic.bg.overlay,
            padding: isFullscreen ? 0 : theme.semantic.layout.spacing.lg,
          },
        ]}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: theme.semantic.border.subtle,
              borderRadius: isFullscreen
                ? 0
                : theme.semantic.layout.radius.xl,
              borderWidth: theme.semantic.layout.borderWidth.subtle,
              padding: theme.semantic.layout.spacing.md,
              gap: theme.semantic.layout.spacing.sm,
              shadowColor: theme.semantic.shadow.neon,
              shadowOpacity: theme.semantic.elevation.high.shadowOpacity,
              shadowRadius: theme.semantic.elevation.high.shadowRadius,
              shadowOffset: { width: 0, height: 0 },
              elevation: theme.semantic.elevation.high.elevation,
              flex: isFullscreen ? 1 : undefined,
              width: '100%',
              maxWidth: isFullscreen ? undefined : 560,
              alignSelf: 'center',
            },
            style,
          ]}>
          <View
            pointerEvents="none"
            style={[
              styles.topSheen,
              { backgroundColor: `${theme.semantic.button.primary.bg}22` },
            ]}
          />
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal"
            style={[
              styles.closeArea,
              {
                borderColor: theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.elevated,
                borderRadius: theme.semantic.layout.radius.full,
                borderWidth: theme.semantic.layout.borderWidth.subtle,
                width: theme.semantic.layout.minTouchTarget,
                height: theme.semantic.layout.minTouchTarget,
              },
            ]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
              tintColor={theme.semantic.text.secondary}
            />
          </Pressable>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    overflow: 'hidden',
  },
  closeArea: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 42,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.3,
    paddingRight: 54,
  },
});
