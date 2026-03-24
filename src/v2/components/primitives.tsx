import { PropsWithChildren } from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';

import {
  BentoCard,
  ClayButton,
  FloatingDock,
  GlassPanel,
  HybridBadge,
  HybridHeader,
  HybridInput,
  HybridModal,
  MeshBackdrop,
} from '@/src/v2/components/base';

export function V2MeshBackground() {
  return <MeshBackdrop />;
}

export function V2Header({ title, onSettings }: { title: string; onSettings?: () => void }) {
  return <HybridHeader title={title} onPressSettings={onSettings} showStatusDot />;
}

export function V2GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <BentoCard style={style}>{children}</BentoCard>;
}

export function V2Badge({
  label,
  tone = 'info',
}: {
  label: string;
  tone?: 'info' | 'success' | 'warning';
}) {
  return <HybridBadge label={label} tone={tone} />;
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
  const clayVariant = variant === 'ghost' ? 'secondary' : variant;

  if (variant === 'ghost') {
    return (
      <ClayButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        variant={clayVariant}
        style={{ opacity: disabled ? 0.45 : 0.76 }}
      />
    );
  }

  return <ClayButton label={label} onPress={onPress} disabled={disabled} variant={clayVariant} />;
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
  return <HybridInput value={value} onChangeText={onChangeText} placeholder={placeholder} />;
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
    <HybridModal visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      {children}
    </HybridModal>
  );
}

export function V2BottomDock({ helperText, children }: PropsWithChildren<{ helperText: string }>) {
  return <FloatingDock helperText={helperText}>{children}</FloatingDock>;
}

export function V2Label({ value }: { value: string }) {
  return <Text>{value}</Text>;
}
