import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite } from '@/src/ui/atoms';

type CluesHeroPanelProps = {
  theme: ThemeTokens;
  eyebrow: string;
  title: string;
  hint: string;
  progressLabel: string;
  progressWidth: `${number}%`;
  progressSteps: Array<{
    id: string;
    label: string;
    avatarId: number;
    state: 'submitted' | 'typing' | 'waiting';
    isCurrent: boolean;
    size: 'focus' | 'side';
  }>;
  children?: ReactNode;
};

const resolveStepColors = (
  state: 'submitted' | 'typing' | 'waiting',
  theme: ThemeTokens
) => {
  if (state === 'submitted') {
    return {
      bg: withAlpha(theme.semantic.button.primary.bg, 0.14),
      border: withAlpha(theme.semantic.button.primary.bg, 0.2),
      text: theme.semantic.button.primary.bg,
      ring: withAlpha(theme.semantic.button.primary.bg, 0.24),
    };
  }

  if (state === 'typing') {
    return {
      bg: withAlpha(theme.semantic.status.warning, 0.14),
      border: withAlpha(theme.semantic.status.warning, 0.2),
      text: '#996C16',
      ring: withAlpha(theme.semantic.status.warning, 0.24),
    };
  }

  return {
    bg: withAlpha(theme.semantic.bg.surface, 0.84),
    border: withAlpha(theme.semantic.border.subtle, 0.95),
    text: theme.semantic.text.secondary,
    ring: withAlpha(theme.semantic.border.subtle, 0.9),
  };
};

export function CluesHeroPanel({
  theme,
  eyebrow,
  title,
  hint,
  progressLabel,
  progressWidth,
  progressSteps,
  children,
}: CluesHeroPanelProps) {
  return (
    <View
      style={[
        styles.heroPanel,
        {
          backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.94),
          borderColor: withAlpha(theme.semantic.button.primary.bg, 0.16),
          shadowColor: theme.semantic.button.primary.bg,
        },
      ]}>
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          {eyebrow ? (
            <Text
              style={[
                styles.heroEyebrow,
                {
                  color: theme.semantic.text.muted,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {eyebrow}
            </Text>
          ) : null}
          <Text
            style={[
              styles.heroTitle,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {title}
          </Text>
          {hint ? (
            <Text
              style={[
                styles.heroHint,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {hint}
            </Text>
          ) : null}
        </View>

        {progressLabel ? (
          <View
            style={[
              styles.progressBadge,
              {
                backgroundColor: withAlpha(theme.semantic.button.primary.bg, 0.12),
                borderColor: withAlpha(theme.semantic.button.primary.bg, 0.22),
              },
            ]}>
            <Text
              style={[
                styles.progressBadgeText,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {progressLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: withAlpha(theme.semantic.button.primary.bg, 0.18),
          },
        ]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.semantic.button.primary.bg,
              width: progressWidth,
            },
          ]}
        />
      </View>

      <View style={styles.progressStepsRow}>
        {progressSteps.map((step) => {
          const palette = resolveStepColors(step.state, theme);

          return (
            <View key={step.id} style={styles.progressStepItem}>
              <View
                style={[
                  step.size === 'focus' ? styles.progressStepAvatarFocus : styles.progressStepAvatarSide,
                  {
                    backgroundColor: palette.bg,
                    borderColor: step.isCurrent ? palette.text : palette.ring,
                  },
                ]}>
                <AvatarSprite avatarId={step.avatarId} size={step.size === 'focus' ? 34 : 22} />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  step.size === 'focus' ? styles.progressStepTextFocus : styles.progressStepTextSide,
                  {
                    color: palette.text,
                    fontFamily: theme.semantic.typography.bodyFamily,
                    fontWeight: step.isCurrent
                      ? theme.semantic.typography.titleWeight
                      : theme.semantic.typography.bodyWeight,
                  },
                ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {children ? <View style={styles.heroBody}>{children}</View> : null}
    </View>
  );
}
