import { PropsWithChildren } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { v2Tokens } from '@/src/v2/design-system';

export function V2MeshBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.meshOrb, styles.meshOrbTop]} />
      <View style={[styles.meshOrb, styles.meshOrbMid]} />
      <View style={[styles.meshOrb, styles.meshOrbBottom]} />
    </View>
  );
}

export function V2Header({ title, onSettings }: { title: string; onSettings?: () => void }) {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        <View style={styles.headerStatusDot} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configurações"
          onPress={onSettings}
          style={styles.headerIconBtn}>
          <SymbolView
            name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
            size={16}
            tintColor={v2Tokens.colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function V2GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export function V2Badge({
  label,
  tone = 'info',
}: {
  label: string;
  tone?: 'info' | 'success' | 'warning';
}) {
  const toneStyle = tone === 'success' ? styles.badgeSuccess : tone === 'warning' ? styles.badgeWarning : styles.badgeInfo;
  const textStyle =
    tone === 'success'
      ? styles.badgeSuccessText
      : tone === 'warning'
      ? styles.badgeWarningText
      : styles.badgeInfoText;

  return (
    <View style={[styles.badgeBase, toneStyle]}>
      <Text style={[styles.badgeLabel, textStyle]}>{label}</Text>
    </View>
  );
}

export function V2Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}) {
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        isGhost ? styles.buttonGhost : isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <Text style={[styles.buttonLabel, isGhost ? styles.buttonGhostLabel : null]}>{label}</Text>
    </Pressable>
  );
}

export function V2Input({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={v2Tokens.colors.textMuted}
      style={styles.input}
    />
  );
}

export function V2Modal({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: PropsWithChildren<{
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
}>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <V2GlassCard style={styles.modalCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={onClose}
            style={styles.modalCloseBtn}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={15}
              tintColor={v2Tokens.colors.textSecondary}
            />
          </Pressable>
          <Text style={styles.modalTitle}>{title}</Text>
          {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
          {children}
        </V2GlassCard>
      </View>
    </Modal>
  );
}

export function V2BottomDock({ helperText, children }: PropsWithChildren<{ helperText: string }>) {
  return (
    <View style={styles.dockWrap}>
      <Text style={styles.dockHelper}>{helperText}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  meshOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  meshOrbTop: {
    width: 320,
    height: 320,
    left: -110,
    top: -120,
    backgroundColor: 'rgba(244, 114, 182, 0.09)',
  },
  meshOrbMid: {
    width: 420,
    height: 420,
    alignSelf: 'center',
    top: '28%',
    backgroundColor: 'rgba(192, 132, 252, 0.07)',
  },
  meshOrbBottom: {
    width: 280,
    height: 280,
    right: -90,
    bottom: -100,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  headerWrap: {
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surface,
    borderRadius: v2Tokens.radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: v2Tokens.colors.textPrimary,
    fontSize: 33,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: v2Tokens.colors.success,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: v2Tokens.colors.surfaceStrong,
  },
  glassCard: {
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surface,
    borderRadius: v2Tokens.radius.lg,
    padding: 16,
  },
  badgeBase: {
    borderWidth: 1,
    borderRadius: v2Tokens.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeInfo: {
    backgroundColor: 'rgba(192, 132, 252, 0.16)',
    borderColor: 'rgba(192, 132, 252, 0.36)',
  },
  badgeInfoText: {
    color: '#DAB9FF',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 211, 238, 0.16)',
    borderColor: 'rgba(34, 211, 238, 0.36)',
  },
  badgeSuccessText: {
    color: '#62EAFF',
  },
  badgeWarning: {
    backgroundColor: 'rgba(246, 201, 69, 0.16)',
    borderColor: 'rgba(246, 201, 69, 0.36)',
  },
  badgeWarningText: {
    color: '#FFD966',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonBase: {
    minHeight: 52,
    borderRadius: v2Tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: v2Tokens.spacing.lg,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: v2Tokens.colors.neonPrimary,
    borderColor: 'rgba(230, 198, 255, 0.45)',
    shadowColor: v2Tokens.colors.neonPrimary,
    ...v2Tokens.shadows.neonStrong,
  },
  buttonSecondary: {
    backgroundColor: v2Tokens.colors.neonSecondary,
    borderColor: 'rgba(158, 242, 255, 0.44)',
    shadowColor: v2Tokens.colors.neonSecondary,
    ...v2Tokens.shadows.neonSoft,
  },
  buttonGhost: {
    backgroundColor: 'rgba(33, 28, 50, 0.66)',
    borderColor: v2Tokens.colors.border,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    color: '#1C112A',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 15,
  },
  buttonGhostLabel: {
    color: v2Tokens.colors.textPrimary,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: v2Tokens.colors.borderStrong,
    color: v2Tokens.colors.textPrimary,
    backgroundColor: 'rgba(25, 21, 39, 0.84)',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: v2Tokens.colors.overlay,
  },
  modalCard: {
    borderColor: v2Tokens.colors.borderStrong,
    paddingTop: 24,
    gap: 12,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: v2Tokens.colors.border,
    backgroundColor: v2Tokens.colors.surfaceStrong,
  },
  modalTitle: {
    color: v2Tokens.colors.textPrimary,
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '800',
    paddingRight: 40,
  },
  modalSubtitle: {
    color: v2Tokens.colors.textSecondary,
    fontSize: 15,
  },
  dockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: 'rgba(13, 10, 23, 0.96)',
    borderTopWidth: 1,
    borderTopColor: v2Tokens.colors.border,
    gap: 10,
  },
  dockHelper: {
    color: v2Tokens.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

