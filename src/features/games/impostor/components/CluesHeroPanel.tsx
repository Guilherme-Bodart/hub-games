import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cluesPhaseStyles as styles } from '@/src/features/games/impostor/styles/cluesPhaseStyles';
import { ELEVATION_STYLES, GameAccentPalette, getGameAccent } from '@/src/theme';
import { ThemeTokens } from '@/src/theme/types';
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
  theme: ThemeTokens,
  accent: GameAccentPalette
) => {
  if (state === 'submitted') {
    return {
      bg: theme.semantic.badge.successBg,
      border: theme.semantic.status.success,
      text: theme.semantic.badge.successText,
    };
  }

  if (state === 'typing') {
    return {
      bg: accent.tint,
      border: accent.primary,
      text: accent.plinth,
    };
  }

  return {
    bg: theme.semantic.bg.subtle,
    border: theme.semantic.border.hairline,
    text: theme.semantic.text.muted,
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
  const accent = getGameAccent('impostor-neon');

  return (
    <View
      style={[
        styles.heroPanel,
        ELEVATION_STYLES.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: theme.semantic.border.hairline,
        },
      ]}>
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          {eyebrow ? (
            <Text
              style={[
                styles.heroEyebrow,
                {
                  color: accent.primary,
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
                backgroundColor: accent.tint,
                borderColor: accent.primary,
              },
            ]}>
            <Text
              style={[
                styles.progressBadgeText,
                {
                  color: accent.plinth,
                  fontFamily: theme.semantic.typography.numberFamily,
                  fontWeight: theme.semantic.typography.numberWeight,
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
            backgroundColor: theme.semantic.bg.subtle,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: accent.primary,
              width: progressWidth,
            },
          ]}
        />
      </View>

      <View style={styles.progressStepsRow}>
        {progressSteps.map((step) => {
          const palette = resolveStepColors(step.state, theme, accent);

          return (
            <View key={step.id} style={styles.progressStepItem}>
              <View
                style={[
                  step.size === 'focus' ? styles.progressStepAvatarFocus : styles.progressStepAvatarSide,
                  {
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
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
                    fontFamily: step.isCurrent
                      ? theme.semantic.typography.titleFamily
                      : theme.semantic.typography.bodyFamily,
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
