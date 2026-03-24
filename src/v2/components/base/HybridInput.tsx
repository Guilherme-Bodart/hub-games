import { StyleProp, StyleSheet, TextInput, TextStyle } from 'react-native';

import { v2Tokens } from '@/src/v2/design-system';

type HybridInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  style?: StyleProp<TextStyle>;
  disabled?: boolean;
};

export function HybridInput({ value, onChangeText, placeholder, style, disabled = false }: HybridInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={v2Tokens.colors.textMuted}
      editable={!disabled}
      style={[styles.input, disabled ? styles.disabled : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 50,
    borderRadius: v2Tokens.radius.md,
    borderWidth: 1.2,
    borderColor: v2Tokens.colors.borderStrong,
    color: v2Tokens.colors.textPrimary,
    backgroundColor: v2Tokens.colors.surfaceStrong,
    paddingHorizontal: v2Tokens.spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.52,
  },
});
