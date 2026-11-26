import { getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
import { BottomActionDock } from '@/src/ui/atoms';

type SintoniaBottomDockProps = {
  theme: ThemeTokens;
  helperText: string;
  primaryAction: {
    label: string;
    onPress: () => void;
    disabled: boolean;
  };
  backLabel: string;
  onBack: () => void;
};

export function SintoniaBottomDock({
  helperText,
  primaryAction,
  backLabel,
  onBack,
}: SintoniaBottomDockProps) {
  const accent = getGameAccent('sintonia');

  return (
    <BottomActionDock
      helperText={helperText}
      primaryAction={{
        label: primaryAction.label,
        onPress: primaryAction.onPress,
        disabled: primaryAction.disabled,
        color: accent.primary,
        plinthColor: accent.plinth,
        textColor: accent.textOnPrimary,
      }}
      secondaryAction={{
        label: backLabel,
        onPress: onBack,
        variant: 'secondary',
      }}
    />
  );
}
