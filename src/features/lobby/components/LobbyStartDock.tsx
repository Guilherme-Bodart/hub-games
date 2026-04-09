import { StyleProp, ViewStyle } from 'react-native';

import { BottomActionDock } from '@/src/ui/atoms';

type LobbyStartDockProps = {
  label: string;
  helperText?: string;
  disabled: boolean;
  onStart: () => void;
  style?: StyleProp<ViewStyle>;
  startButtonStyle?: StyleProp<ViewStyle>;
  buttonColor?: string;
  buttonTextColor?: string;
};

export function LobbyStartDock({
  label,
  helperText,
  disabled,
  onStart,
  style,
  startButtonStyle,
  buttonColor,
  buttonTextColor,
}: LobbyStartDockProps) {
  return (
    <BottomActionDock
      style={style}
      helperText={helperText}
      primaryAction={{
        label,
        onPress: onStart,
        disabled,
        variant: 'primary',
        color: buttonColor,
        textColor: buttonTextColor,
        style: startButtonStyle,
      }}
    />
  );
}
