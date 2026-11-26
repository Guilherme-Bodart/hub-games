import { Ionicons } from '@expo/vector-icons';
import { Pressable, Switch, Text, View } from 'react-native';

import type { ReduceMotionMode } from '@/src/features/settings/preferencesStore';
import { styles } from '@/src/features/settings/styles/settingsStyles';
import type { Locale } from '@/src/i18n';
import { HUB_DEFAULT_ACCENT, useTheme } from '@/src/theme';
import { Card } from '@/src/ui/atoms';

type ReduceMotionOptionView = {
  mode: ReduceMotionMode;
  label: string;
  selected: boolean;
};

type SettingsPreferencesCardProps = {
  locale: Locale;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotionOptions: ReduceMotionOptionView[];
  onToggleSound: (enabled: boolean) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onSelectReduceMotion: (mode: ReduceMotionMode) => void;
};

export function SettingsPreferencesCard({
  locale,
  soundEnabled,
  hapticsEnabled,
  reduceMotionOptions,
  onToggleSound,
  onToggleHaptics,
  onSelectReduceMotion,
}: SettingsPreferencesCardProps) {
  const { theme } = useTheme();
  const isPt = locale === 'pt';

  return (
    <Card
      title={isPt ? 'Experiência & Feedback' : 'Experience & Feedback'}
      subtitle={
        isPt
          ? 'Ajuste sons, vibração e animações do app.'
          : 'Customize app sounds, haptics, and motion.'
      }
      variant="elevated">
      <View style={styles.prefRow}>
        <View style={styles.prefRowLeft}>
          <View style={[styles.prefIconWrap, { backgroundColor: HUB_DEFAULT_ACCENT.tint }]}>
            <Ionicons
              name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
              size={20}
              color={HUB_DEFAULT_ACCENT.primary}
            />
          </View>
          <View style={styles.prefCopy}>
            <Text
              style={[
                styles.prefLabel,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {isPt ? 'Efeitos sonoros' : 'Sound effects'}
            </Text>
            <Text
              style={[
                styles.prefDescription,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                },
              ]}>
              {isPt ? 'Cliques, revelações e alertas da partida' : 'Taps, reveals, and match alerts'}
            </Text>
          </View>
        </View>

        <Switch
          value={soundEnabled}
          onValueChange={onToggleSound}
          trackColor={{
            false: theme.semantic.border.strong,
            true: HUB_DEFAULT_ACCENT.primary,
          }}
          thumbColor={theme.semantic.bg.surface}
          ios_backgroundColor={theme.semantic.border.strong}
          accessibilityLabel={isPt ? 'Efeitos sonoros' : 'Sound effects'}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.semantic.border.hairline }]} />

      <View style={styles.prefRow}>
        <View style={styles.prefRowLeft}>
          <View style={[styles.prefIconWrap, { backgroundColor: HUB_DEFAULT_ACCENT.tint }]}>
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={HUB_DEFAULT_ACCENT.primary}
            />
          </View>
          <View style={styles.prefCopy}>
            <Text
              style={[
                styles.prefLabel,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {isPt ? 'Vibração tátil' : 'Haptic feedback'}
            </Text>
            <Text
              style={[
                styles.prefDescription,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                },
              ]}>
              {isPt ? 'Toques táteis em botões e turnos' : 'Tactile feedback on buttons and turns'}
            </Text>
          </View>
        </View>

        <Switch
          value={hapticsEnabled}
          onValueChange={onToggleHaptics}
          trackColor={{
            false: theme.semantic.border.strong,
            true: HUB_DEFAULT_ACCENT.primary,
          }}
          thumbColor={theme.semantic.bg.surface}
          ios_backgroundColor={theme.semantic.border.strong}
          accessibilityLabel={isPt ? 'Vibração tátil' : 'Haptic feedback'}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.semantic.border.hairline }]} />

      <View style={styles.motionSection}>
        <View style={styles.prefRowLeft}>
          <View style={[styles.prefIconWrap, { backgroundColor: HUB_DEFAULT_ACCENT.tint }]}>
            <Ionicons name="sparkles-outline" size={20} color={HUB_DEFAULT_ACCENT.primary} />
          </View>
          <View style={styles.prefCopy}>
            <Text
              style={[
                styles.prefLabel,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.titleFamily,
                  fontWeight: theme.semantic.typography.titleWeight,
                },
              ]}>
              {isPt ? 'Reduzir animações' : 'Reduce motion'}
            </Text>
            <Text
              style={[
                styles.prefDescription,
                {
                  color: theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                },
              ]}>
              {isPt
                ? 'Suaviza transições e efeitos de movimento'
                : 'Tones down transitions and motion effects'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.segmentedTrack,
            {
              backgroundColor: theme.semantic.bg.subtle,
              borderColor: theme.semantic.border.hairline,
            },
          ]}>
          {reduceMotionOptions.map((option) => (
            <Pressable
              key={option.mode}
              onPress={() => onSelectReduceMotion(option.mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: option.selected }}
              accessibilityLabel={option.label}
              style={({ pressed }) => [
                styles.segmentedButton,
                {
                  backgroundColor: option.selected
                    ? theme.semantic.bg.surface
                    : 'transparent',
                  borderColor: option.selected
                    ? HUB_DEFAULT_ACCENT.primary
                    : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.segmentedLabel,
                  {
                    color: option.selected
                      ? HUB_DEFAULT_ACCENT.primary
                      : theme.semantic.text.secondary,
                    fontFamily: theme.semantic.typography.titleFamily,
                    fontWeight: theme.semantic.typography.titleWeight,
                  },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Card>
  );
}
