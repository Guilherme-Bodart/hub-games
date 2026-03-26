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
  closeStyle?: 'solid' | 'ghost';
  style?: StyleProp<ViewStyle>;
}>;

export function Modal({
  visible,
  title,
  onClose,
  variant = 'alert',
  closeStyle = 'solid',
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
            backgroundColor: 'rgba(27,33,63,0.24)',
            padding: isFullscreen ? 0 : theme.semantic.layout.spacing.lg,
          },
        ]}>
        <View
          style={[
            styles.content,
            {
              backgroundColor: '#F8FBFF',
              borderColor: '#D8E1EF',
              borderRadius: isFullscreen
                ? 0
                : theme.semantic.layout.radius.xl,
              borderWidth: theme.semantic.layout.borderWidth.subtle,
              padding: theme.semantic.layout.spacing.md,
              gap: theme.semantic.layout.spacing.sm,
              shadowColor: '#000000',
              shadowOpacity: 0.18,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
              flex: isFullscreen ? 1 : undefined,
              width: '100%',
              maxWidth: isFullscreen ? undefined : 560,
              alignSelf: 'center',
            },
            style,
          ]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal"
            style={[
              styles.closeArea,
              closeStyle === 'ghost'
                ? {
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    borderRadius: theme.semantic.layout.radius.full,
                    borderWidth: 0,
                    width: theme.semantic.layout.minTouchTarget,
                    height: theme.semantic.layout.minTouchTarget,
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 0,
                  }
                : {
                    borderColor: 'rgba(0,0,0,0.12)',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 17,
                    borderWidth: theme.semantic.layout.borderWidth.subtle,
                    width: 34,
                    height: 34,
                    shadowColor: '#000000',
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    shadowOffset: { width: 4, height: 4 },
                    elevation: 7,
                  },
            ]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
              tintColor="#2B2A46"
            />
          </Pressable>
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: '#23254D',
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
    overflow: 'visible',
  },
  closeArea: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.3,
    paddingRight: 54,
  },
});
