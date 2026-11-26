import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { styles } from '@/src/features/games/sintonia/styles/sintoniaStyles';
import { SintoniaRoundResult } from '@/src/features/games/sintonia/types';
import { ELEVATION_STYLES, useTheme } from '@/src/theme';
import { Badge } from '@/src/ui/atoms';

type SintoniaResultSummaryBannerProps = {
  roundResult: SintoniaRoundResult;
  title: string;
  subtitle: string;
  correctCount: number;
  totalCount: number;
};

export function SintoniaResultSummaryBanner({
  roundResult,
  title,
  subtitle,
  correctCount,
  totalCount,
}: SintoniaResultSummaryBannerProps) {
  const { theme } = useTheme();
  const isSuccess = roundResult === 'success';
  const statusColor = isSuccess ? theme.semantic.status.success : theme.semantic.status.error;
  const badgeBg = isSuccess ? theme.semantic.badge.successBg : theme.semantic.badge.errorBg;

  return (
    <View
      style={[
        styles.resultBanner,
        ELEVATION_STYLES.card,
        {
          backgroundColor: theme.semantic.bg.surface,
          borderColor: statusColor,
        },
      ]}>
      <View
        style={[
          styles.resultIconCircle,
          {
            backgroundColor: badgeBg,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={statusColor}
        />
      </View>

      <View style={styles.resultTextCol}>
        <View style={styles.resultTitleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.resultTitle,
              {
                color: theme.semantic.text.primary,
                fontFamily: theme.semantic.typography.titleFamily,
                fontWeight: theme.semantic.typography.titleWeight,
              },
            ]}>
            {title}
          </Text>
          <Badge
            label={`${correctCount}/${totalCount}`}
            variant={isSuccess ? 'success' : 'error'}
          />
        </View>
        <Text
          numberOfLines={2}
          style={[
            styles.resultSubtitle,
            {
              color: theme.semantic.text.secondary,
              fontFamily: theme.semantic.typography.bodyFamily,
              fontWeight: theme.semantic.typography.bodyWeight,
            },
          ]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
