import { StyleProp, ViewStyle } from 'react-native';

import { BottomActionDock } from '@/src/ui/atoms';

type LobbyStartDockProps = {
  label: string;
  disabled: boolean;
  onStart: () => void;
  style?: StyleProp<ViewStyle>;
  startButtonStyle?: StyleProp<ViewStyle>;
};

export function LobbyStartDock({
  label,
  disabled,
  onStart,
  style,
  startButtonStyle,
}: LobbyStartDockProps) {
  return (
    <BottomActionDock
      style={style}
      primaryAction={{
        label,
        onPress: onStart,
        disabled,
        variant: 'primary',
        style: startButtonStyle,
      }}
    />
  );
}
