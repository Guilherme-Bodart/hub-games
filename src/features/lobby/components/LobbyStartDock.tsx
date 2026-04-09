import { StyleProp, ViewStyle } from 'react-native';

import { BottomActionDock } from '@/src/ui/atoms';
import { useTheme } from '@/src/theme';
import { styles as lobbyStyles } from '@/src/features/lobby/styles/lobbyStyles';

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
  const { theme } = useTheme();
  const resolvedButtonColor = disabled ? '#E1E6F0' : buttonColor;
  const resolvedButtonTextColor = disabled ? '#74809A' : buttonTextColor;

  return (
    <BottomActionDock
      style={style}
      helperText={helperText}
      primaryAction={{
        label,
        onPress: onStart,
        disabled,
        variant: 'primary',
        color: resolvedButtonColor,
        textColor: resolvedButtonTextColor,
        style: [
          disabled
            ? lobbyStyles.bottomPrimaryButtonDisabled
            : {
                shadowColor: theme.semantic.button.primary.bg,
              },
          startButtonStyle,
        ],
      }}
    />
  );
}
