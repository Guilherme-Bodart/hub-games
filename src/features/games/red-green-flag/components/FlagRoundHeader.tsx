import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { FLAG_CATEGORIES, FlagCategoryId } from '@/src/features/games/red-green-flag/content';
import { FlagPlayer } from '@/src/features/games/red-green-flag/hooks/useRedGreenFlagGame';
import { redGreenFlagStyles as styles } from '@/src/features/games/red-green-flag/styles/redGreenFlagStyles';
import { Locale } from '@/src/i18n';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite } from '@/src/ui/atoms';

type FlagRoundHeaderProps = {
  locale: Locale;
  isPt: boolean;
  singlePlayer: FlagPlayer;
  category: FlagCategoryId;
  showControls: boolean;
  onSelectCategory: (id: FlagCategoryId) => void;
  onRerollHand: () => void;
};

export function FlagRoundHeader({
  locale,
  isPt,
  singlePlayer,
  category,
  showControls,
  onSelectCategory,
  onRerollHand,
}: FlagRoundHeaderProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('red-green-flag');
  const roseColor = accent.secondary ?? '#F43F5E';

  return (
    <>
      <View style={[styles.voiceNotice, { borderColor: '#A7F3D0', backgroundColor: accent.tint }]}>
        <SymbolView
          name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
          size={14}
          tintColor={accent.primary}
        />
        <Text style={[styles.voiceNoticeText, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? 'Jogo de festa ao vivo: cada Cupido defende seu pretendente em voz alta!'
            : 'Live party game: each Cupid pitches their candidate out loud!'}
        </Text>
      </View>

      {showControls ? (
        <View style={styles.categoryRow}>
          {FLAG_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                accessibilityRole="button"
                onPress={() => onSelectCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  {
                    borderColor: isActive ? accent.primary : theme.semantic.border.hairline,
                    backgroundColor: isActive ? accent.primary : theme.semantic.bg.surface,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isActive ? accent.textOnPrimary : theme.semantic.text.secondary,
                      fontFamily: theme.semantic.typography.titleFamily,
                    },
                  ]}>
                  {cat.label[locale]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          styles.singleBanner,
          ELEVATION_STYLES.card,
          { backgroundColor: theme.semantic.bg.surface, borderColor: theme.semantic.border.hairline },
        ]}>
        <AvatarSprite avatarId={singlePlayer.avatarId} size={44} />
        <View style={styles.singleBannerTexts}>
          <Text style={[styles.singleRoleLabel, { color: roseColor, fontFamily: theme.semantic.typography.titleFamily }]}>
            {isPt ? 'SOLTEIRO(A) DA RODADA' : 'SINGLE OF THE ROUND'}
          </Text>
          <Text style={[styles.singleName, { color: theme.semantic.text.primary, fontFamily: theme.semantic.typography.titleFamily }]}>
            {singlePlayer.name}
          </Text>
        </View>
        {showControls ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRerollHand}
            style={[styles.rerollBtn, { borderColor: theme.semantic.border.hairline, backgroundColor: theme.semantic.bg.subtle }]}>
            <SymbolView
              name={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }}
              size={13}
              tintColor={theme.semantic.text.secondary}
            />
            <Text style={[styles.rerollBtnText, { color: theme.semantic.text.secondary }]}>
              {isPt ? 'Trocar mão' : 'Reroll'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}
