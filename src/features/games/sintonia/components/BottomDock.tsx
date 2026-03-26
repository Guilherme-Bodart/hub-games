import { BottomActionDock } from '@/src/ui/atoms';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';

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
  theme,
  helperText,
  primaryAction,
  backLabel,
  onBack,
}: SintoniaBottomDockProps) {
  return (
    <BottomActionDock
      helperText={helperText}
      primaryAction={{
        label: primaryAction.label,
        onPress: primaryAction.onPress,
        disabled: primaryAction.disabled,
        style: {
          backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.88),
          borderColor: withAlpha(theme.semantic.button.primary.bg, 0.92),
          shadowColor: theme.semantic.button.primary.bg,
          shadowOpacity: 0.8,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 14,
        },
      }}
      secondaryAction={{
        label: backLabel,
        onPress: onBack,
        variant: 'ghost',
        style: {
          backgroundColor: withAlpha(theme.semantic.bg.surface, 0.35),
          borderColor: withAlpha(theme.semantic.border.subtle, 0.95),
          shadowOpacity: 0,
          elevation: 0,
        },
      }}
    />
  );
}
