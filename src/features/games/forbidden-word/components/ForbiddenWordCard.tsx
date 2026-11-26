import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { ForbiddenCardItem } from '@/src/features/games/forbidden-word/content';
import { TURN_DURATION_SECONDS } from '@/src/features/games/forbidden-word/hooks/useForbiddenWordGame';
import { forbiddenWordStyles as styles } from '@/src/features/games/forbidden-word/styles/forbiddenWordStyles';
import { Locale } from '@/src/i18n';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';

type ForbiddenWordCardProps = {
  card: ForbiddenCardItem;
  locale: Locale;
  timeLeft: number;
  onBuzz: () => void;
};

export function ForbiddenWordCard({
  card,
  locale,
  timeLeft,
  onBuzz,
}: ForbiddenWordCardProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('forbidden-word');
  const isPt = locale === 'pt';
  const isUrgent = timeLeft <= 10;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / TURN_DURATION_SECONDS));
  const timerColor = isUrgent ? theme.semantic.status.error : accent.primary;
  const timerBg = isUrgent ? '#FFF1F2' : accent.tint;

  return (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.tabooCard,
          ELEVATION_STYLES.hero,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: isUrgent ? theme.semantic.status.error : theme.semantic.border.hairline,
          },
        ]}>
        <View style={[styles.timerStrip, { backgroundColor: theme.semantic.bg.surface }]}>
          <View style={styles.timerHeaderRow}>
            <Text
              style={[
                styles.timerLabel,
                {
                  color: isUrgent ? theme.semantic.status.error : theme.semantic.text.secondary,
                  fontFamily: theme.semantic.typography.titleFamily,
                },
              ]}>
              {isUrgent
                ? isPt
                  ? 'CORRE! ÚLTIMOS SEGUNDOS'
                  : 'HURRY! FINAL SECONDS'
                : isPt
                  ? 'TEMPO RESTANTE'
                  : 'TIME REMAINING'}
            </Text>
            <View
              style={[
                styles.timerValuePill,
                { backgroundColor: timerBg, borderColor: timerColor },
              ]}>
              <Text
                style={[
                  styles.timerValueText,
                  {
                    color: timerColor,
                    fontFamily: theme.semantic.typography.numberFamily,
                    fontWeight: theme.semantic.typography.numberWeight,
                  },
                ]}>
                {timeLeft}s
              </Text>
            </View>
          </View>
          <View style={[styles.timerTrack, { backgroundColor: theme.semantic.bg.subtle }]}>
            <View
              style={[
                styles.timerFill,
                {
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={[styles.mainWordBanner, { backgroundColor: accent.primary }]}>
          <Text
            style={[
              styles.mainWordSubLabel,
              {
                color: '#FFEDD5',
                fontFamily: theme.semantic.typography.titleFamily,
              },
            ]}>
            {isPt ? 'FAÇA O GRUPO ACERTAR' : 'MAKE THEM GUESS'}
          </Text>
          <Text
            style={[
              styles.mainWordTitle,
              {
                color: accent.textOnPrimary,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {card.word[locale]}
          </Text>
        </View>

        <View style={styles.forbiddenSection}>
          <Text
            style={[
              styles.forbiddenHeader,
              {
                color: theme.semantic.status.error,
                fontFamily: theme.semantic.typography.titleFamily,
              },
            ]}>
            {isPt ? 'PROIBIDO FALAR (4 PALAVRAS)' : 'FORBIDDEN WORDS (4)'}
          </Text>
          <View style={styles.forbiddenGrid}>
            {card.forbidden[locale].map((forbiddenWord) => (
              <View
                key={forbiddenWord}
                style={[
                  styles.forbiddenChip,
                  {
                    backgroundColor: '#FFF1F2',
                    borderColor: '#FECDD3',
                  },
                ]}>
                <SymbolView
                  name={{ ios: 'nosign', android: 'block', web: 'block' }}
                  size={14}
                  tintColor={theme.semantic.status.error}
                />
                <Text
                  numberOfLines={2}
                  style={[
                    styles.forbiddenWordText,
                    {
                      color: theme.semantic.text.primary,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {forbiddenWord}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPt ? 'Buzina: Falou palavra proibida' : 'Buzzer: Said forbidden word'}
        onPress={onBuzz}
        style={[
          styles.buzzerPlinth,
          ELEVATION_STYLES.card,
          { backgroundColor: '#BE123C' },
        ]}>
        {({ pressed }) => (
          <View
            style={[
              styles.buzzerFace,
              {
                backgroundColor: theme.semantic.status.error,
                borderColor: '#E11D48',
                transform: [{ translateY: pressed ? 3 : 0 }],
              },
            ]}>
            <SymbolView
              name={{ ios: 'bell.fill', android: 'notifications_active', web: 'notifications_active' }}
              size={19}
              tintColor="#FFFFFF"
            />
            <Text
              style={[
                styles.buzzerText,
                { fontFamily: theme.semantic.typography.titleFamily },
              ]}>
              {isPt ? 'BUZINA! FALOU PROIBIDA' : 'BUZZER! FORBIDDEN WORD'}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
