import { Text, View } from 'react-native';

import { drawPassStyles as styles } from '@/src/features/games/draw-pass/styles/drawPassStyles';
import { DrawPassPlayer } from '@/src/features/games/draw-pass/types/drawPass.types';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge } from '@/src/ui/atoms';

type DrawPassHandoffProps = {
  player: DrawPassPlayer;
  turnNumber: number;
  totalTurns: number;
  isDrawingTurn: boolean;
  isPt: boolean;
};

export function DrawPassHandoff({
  player,
  turnNumber,
  totalTurns,
  isDrawingTurn,
  isPt,
}: DrawPassHandoffProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('draw-pass');

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
            ? `Etapa ${turnNumber} de ${totalTurns} • ${isDrawingTurn ? 'Desenhar' : 'Adivinhar'}`
            : `Step ${turnNumber} of ${totalTurns} • ${isDrawingTurn ? 'Draw' : 'Guess'}`
        }
        variant="info"
      />

      <View
        style={[
          styles.handoffAvatarRing,
          {
            backgroundColor: accent.tint,
            borderColor: accent.primary,
          },
        ]}>
        <AvatarSprite avatarId={player.avatarId} size={76} />
      </View>

      <Text
        style={[
          styles.handoffEyebrow,
          {
            color: accent.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {isPt ? 'PASSE O CELULAR PARA' : 'PASS THE PHONE TO'}
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
        {player.name}
      </Text>

      <Text
        style={[
          styles.handoffBody,
          {
            color: theme.semantic.text.secondary,
            fontFamily: theme.semantic.typography.bodyFamily,
          },
        ]}>
        {isDrawingTurn
          ? isPt
            ? 'Garanta que só você esteja olhando a tela antes de ver a frase para desenhar!'
            : 'Make sure only you can see the screen before revealing the prompt to draw!'
          : isPt
            ? 'Garanta que só você esteja olhando a tela antes de ver o desenho anterior!'
            : 'Make sure only you can see the screen before revealing the previous drawing!'}
      </Text>
    </View>
  );
}
