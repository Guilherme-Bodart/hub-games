import { type GameAccentPalette, useTheme } from '@/src/theme';
import { BottomActionDock } from '@/src/ui/atoms';

type LobbyStartDockProps = {
  label: string;
  helperText?: string;
  disabled: boolean;
  gameAccent: GameAccentPalette;
  onStart: () => void;
};

export function LobbyStartDock({
  label,
  helperText,
  disabled,
  gameAccent,
  onStart,
}: LobbyStartDockProps) {
  const { theme } = useTheme();

  return (
    <BottomActionDock
      helperText={helperText}
      primaryAction={{
        label,
        onPress: onStart,
        disabled,
        variant: 'primary',
        color: disabled ? theme.semantic.bg.subtle : gameAccent.primary,
        plinthColor: disabled ? theme.semantic.border.strong : gameAccent.plinth,
        textColor: disabled ? theme.semantic.text.muted : gameAccent.textOnPrimary,
      }}
    />
  );
}
