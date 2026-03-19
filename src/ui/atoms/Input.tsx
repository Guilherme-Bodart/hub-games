import { StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { useState } from 'react';

import { useTheme } from '@/src/theme';

type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  helperText,
  errorText,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  testID,
  accessibilityLabel,
  style,
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(errorText);
  const helperLabel = errorText ?? helperText;
  const borderColor = hasError
    ? theme.semantic.status.error
    : isFocused
      ? theme.semantic.border.focus
      : theme.semantic.input.border;

  return (
    <View style={style}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        accessibilityLabel={accessibilityLabel ?? label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.semantic.input.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: theme.semantic.input.bg,
            borderColor,
            color: theme.semantic.input.text,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
            borderRadius: theme.semantic.layout.radius.lg,
            borderWidth: theme.semantic.layout.borderWidth.subtle,
            minHeight: theme.semantic.layout.minTouchTarget,
            opacity: disabled ? theme.semantic.motion.feedback.disabledOpacity : 1,
          },
        ]}
      />
      {helperLabel ? (
        <Text
          style={[
            styles.helper,
            {
              color: hasError ? theme.semantic.status.error : theme.semantic.text.muted,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {helperLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    marginTop: 8,
  },
});
