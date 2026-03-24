import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { GlassPanel } from '@/src/v2/components/base/GlassPanel';
import { v2Tokens } from '@/src/v2/design-system';

type HybridModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}>;

export function HybridModal({ visible, onClose, title, subtitle, children }: HybridModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <GlassPanel style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar modal"
            onPress={onClose}
            style={styles.closeButton}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={14}
              tintColor={v2Tokens.colors.textSecondary}
            />
          </Pressable>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </GlassPanel>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: v2Tokens.spacing.md,
    backgroundColor: v2Tokens.colors.overlay,
  },
  card: {
    gap: v2Tokens.spacing.sm,
    paddingTop: v2Tokens.spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: v2Tokens.radius.pill,
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: v2Tokens.colors.textPrimary,
    fontSize: v2Tokens.typography.section,
    lineHeight: v2Tokens.typography.section + 2,
    fontWeight: '800',
    paddingRight: 38,
  },
  subtitle: {
    color: v2Tokens.colors.textSecondary,
    fontSize: v2Tokens.typography.body,
  },
});
