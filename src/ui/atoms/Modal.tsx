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

import { useI18n } from '@/src/i18n';
import { ELEVATION_STYLES, useTheme } from '@/src/theme';

type ModalProps = PropsWithChildren<{
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  variant?: 'alert' | 'fullscreen';
  closeStyle?: 'solid' | 'ghost';
  style?: StyleProp<ViewStyle>;
}>;

export function Modal({
  visible,
  title,
  subtitle,
  onClose,
  variant = 'alert',
  closeStyle = 'solid',
  children,
  style,
}: ModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isFullscreen = variant === 'fullscreen';

  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.semantic.bg.scrim,
            padding: isFullscreen ? 0 : theme.semantic.layout.spacing.md,
          },
        ]}>
        <View
          style={[
            styles.content,
            isFullscreen ? ELEVATION_STYLES.flat : ELEVATION_STYLES.hero,
            {
              backgroundColor: theme.semantic.bg.surface,
              borderColor: theme.semantic.border.hairline,
              borderRadius: isFullscreen ? 0 : theme.semantic.layout.radius.xl,
              borderWidth: isFullscreen ? 0 : 1,
              padding: theme.semantic.layout.spacing.lg,
              gap: theme.semantic.layout.spacing.sm,
              flex: isFullscreen ? 1 : undefined,
              maxWidth: isFullscreen ? undefined : 520,
            },
            style,
          ]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('settings.close')}
            style={({ pressed }) => [
              styles.closeArea,
              {
                backgroundColor:
                  closeStyle === 'ghost' ? 'transparent' : theme.semantic.bg.subtle,
                borderColor:
                  closeStyle === 'ghost' ? 'transparent' : theme.semantic.border.hairline,
                borderWidth: closeStyle === 'ghost' ? 0 : 1,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
              tintColor={theme.semantic.text.primary}
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
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {subtitle}
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
    width: '100%',
    alignSelf: 'center',
    overflow: 'visible',
  },
  closeArea: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: 0.2,
    paddingRight: 44,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 36,
  },
});
