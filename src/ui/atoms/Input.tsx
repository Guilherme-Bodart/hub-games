import { useState } from 'react';
import {
  ReturnKeyTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/src/theme';

type InputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: ReturnKeyTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
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
  onSubmitEditing,
  returnKeyType,
  autoCapitalize = 'none',
  maxLength,
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
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        maxLength={maxLength}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize={autoCapitalize}
        spellCheck={false}
        accessibilityLabel={accessibilityLabel ?? label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.semantic.input.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: disabled ? theme.semantic.bg.subtle : theme.semantic.input.bg,
            borderColor,
            borderWidth: isFocused || hasError ? 1.5 : 1,
            color: theme.semantic.input.text,
            fontFamily: theme.semantic.typography.bodyFamily,
            fontWeight: theme.semantic.typography.bodyWeight,
            borderRadius: theme.semantic.layout.radius.md,
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
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
});
