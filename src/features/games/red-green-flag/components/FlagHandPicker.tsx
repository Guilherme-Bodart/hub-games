import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { FlagPlayer } from '@/src/features/games/red-green-flag/hooks/useRedGreenFlagGame';
import { redGreenFlagStyles as styles } from '@/src/features/games/red-green-flag/styles/redGreenFlagStyles';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge, Card } from '@/src/ui/atoms';

type FlagHandPickerProps = {
  cupid: FlagPlayer;
  singleName: string;
  cupidTurnNumber: number;
  totalCupids: number;
  isHandoffPending: boolean;
  greens: string[];
  reds: string[];
  selectedGreen: string | null;
  selectedRed: string | null;
  isPt: boolean;
  onSelectGreen: (flagText: string) => void;
  onSelectRed: (flagText: string) => void;
};

export function FlagHandPicker({
  cupid,
  singleName,
  cupidTurnNumber,
  totalCupids,
  isHandoffPending,
  greens,
  reds,
  selectedGreen,
  selectedRed,
  isPt,
  onSelectGreen,
  onSelectRed,
}: FlagHandPickerProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('red-green-flag');
  const greenColor = accent.primary;
  const greenTint = accent.tint;
  const redColor = accent.secondary ?? '#F43F5E';
  const redTint = accent.secondaryTint ?? '#FFF1F2';

  if (isHandoffPending) {
    return (
      <View
        style={[
          styles.handoffCard,
          ELEVATION_STYLES.hero,
          {
            backgroundColor: theme.semantic.bg.surface,
            borderColor: theme.semantic.border.hairline,
          },
        ]}>
        <Badge
          label={
            isPt
              ? `Cupido ${cupidTurnNumber} de ${totalCupids}`
              : `Cupid ${cupidTurnNumber} of ${totalCupids}`
          }
          variant="success"
        />
        <View
          style={[
            styles.handoffAvatarRing,
            { backgroundColor: greenTint, borderColor: greenColor },
          ]}>
          <AvatarSprite avatarId={cupid.avatarId} size={72} />
        </View>
        <Text
          style={[
            styles.handoffEyebrow,
            { color: greenColor, fontFamily: theme.semantic.typography.titleFamily },
          ]}>
          {isPt ? 'PASSE O CELULAR PARA O CUPIDO' : 'PASS THE PHONE TO CUPID'}
        </Text>
        <Text
          style={[
            styles.handoffName,
            {
              color: theme.semantic.text.primary,
              fontFamily: theme.semantic.typography.titleFamily,
              fontWeight: theme.semantic.typography.titleWeight,
            },
          ]}>
          {cupid.name}
        </Text>
        <Text style={[styles.handoffBody, { color: theme.semantic.text.secondary }]}>
          {isPt
            ? `Monte em segredo um pretendente para ${singleName} sem deixar ninguém espiar sua mão!`
            : `Secretly build a candidate for ${singleName} without letting anyone peek at your hand!`}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Card
        title={
          isPt
            ? `1. Escolha 1 Green Flag (${cupid.name})`
            : `1. Pick 1 Green Flag (${cupid.name})`
        }
        subtitle={isPt ? 'A qualidade perfeita do pretendente:' : 'The perfect trait:'}>
        <View style={styles.cardsColumn}>
          {greens.map((flagText) => {
            const isSelected = selectedGreen === flagText;
            return (
              <Pressable
                key={flagText}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectGreen(flagText)}
                style={[
                  styles.flagCard,
                  isSelected ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
                  {
                    backgroundColor: isSelected ? greenTint : theme.semantic.bg.surface,
                    borderColor: isSelected ? greenColor : theme.semantic.border.hairline,
                  },
                ]}>
                <View style={[styles.flagCardStrip, { backgroundColor: greenColor }]} />
                <View style={styles.flagCardBody}>
                  <View style={styles.flagCardHeader}>
                    <Badge label="GREEN FLAG" variant="success" />
                    <View
                      style={[
                        styles.selectIndicator,
                        {
                          backgroundColor: isSelected ? greenColor : theme.semantic.bg.subtle,
                          borderColor: isSelected ? greenColor : theme.semantic.border.hairline,
                        },
                      ]}>
                      {isSelected ? (
                        <SymbolView
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          size={12}
                          tintColor="#FFFFFF"
                        />
                      ) : null}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.flagOptionText,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.bodyFamily,
                      },
                    ]}>
                    {flagText}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card
        title={
          isPt
            ? `2. Escolha 1 Red Flag (${cupid.name})`
            : `2. Pick 1 Red Flag (${cupid.name})`
        }
        subtitle={isPt ? 'O defeito bizarro que vem no pacote:' : 'The chaotic catch:'}>
        <View style={styles.cardsColumn}>
          {reds.map((flagText) => {
            const isSelected = selectedRed === flagText;
            return (
              <Pressable
                key={flagText}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectRed(flagText)}
                style={[
                  styles.flagCard,
                  isSelected ? ELEVATION_STYLES.card : ELEVATION_STYLES.flat,
                  {
                    backgroundColor: isSelected ? redTint : theme.semantic.bg.surface,
                    borderColor: isSelected ? redColor : theme.semantic.border.hairline,
                  },
                ]}>
                <View style={[styles.flagCardStrip, { backgroundColor: redColor }]} />
                <View style={styles.flagCardBody}>
                  <View style={styles.flagCardHeader}>
                    <Badge label="RED FLAG" variant="error" />
                    <View
                      style={[
                        styles.selectIndicator,
                        {
                          backgroundColor: isSelected ? redColor : theme.semantic.bg.subtle,
                          borderColor: isSelected ? redColor : theme.semantic.border.hairline,
                        },
                      ]}>
                      {isSelected ? (
                        <SymbolView
                          name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                          size={12}
                          tintColor="#FFFFFF"
                        />
                      ) : null}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.flagOptionText,
                      {
                        color: theme.semantic.text.primary,
                        fontFamily: theme.semantic.typography.bodyFamily,
                      },
                    ]}>
                    {flagText}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </>
  );
}
