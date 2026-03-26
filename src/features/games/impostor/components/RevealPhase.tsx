import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ImpostorRound } from '@/src/features/games/impostor/types';
import { styles } from '@/src/features/games/impostor/styles/impostorStyles';
import { ThemeTokens } from '@/src/theme/types';
import { withAlpha } from '@/src/theme/utils';
import { AvatarSprite, Button, Card } from '@/src/ui/atoms';

type RevealPhaseProps = {
  round: ImpostorRound;
  copy: Record<string, string>;
  isPt: boolean;
  theme: ThemeTokens;
  revealedPrompt: string | null;
  revealedIsImpostor: boolean;
  heldRevealId: string | null;
  localRevealPlayers: ImpostorRound['players'];
  playerCardWidth: any;
  revealFogStyle: any;
  revealPromptStyle: any;
  impostorPromptPulseStyle: any;
  canControl: boolean;
  isRemote: boolean;
  onPressRevealIn: (playerId: string) => void;
  onPressRevealOut: (playerId: string) => void;
  onGoClues: () => void;
};

export function ImpostorRevealPhase({
  round,
  copy,
  isPt,
  theme,
  revealedPrompt,
  revealedIsImpostor,
  heldRevealId,
  localRevealPlayers,
  playerCardWidth,
  revealFogStyle,
  revealPromptStyle,
  impostorPromptPulseStyle,
  canControl,
  isRemote,
  onPressRevealIn,
  onPressRevealOut,
  onGoClues,
}: RevealPhaseProps) {
  return (
    <Card title={copy.reveal} subtitle={isPt ? 'Segure o card para revelar.' : 'Press and hold a card to reveal.'}>
      <Animated.View
        style={[
          styles.promptBox,
          revealedIsImpostor ? impostorPromptPulseStyle : null,
          {
            borderColor: revealedIsImpostor ? theme.semantic.status.error : theme.semantic.border.subtle,
            backgroundColor: revealedIsImpostor ? `${theme.semantic.status.error}18` : theme.semantic.bg.surface,
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.promptFogLayer, revealFogStyle, { backgroundColor: theme.semantic.bg.app }]}
        />
        <View style={styles.promptHeader}>
          <SymbolView
            name={{
              ios: revealedPrompt ? 'eye.fill' : 'eye.slash.fill',
              android: revealedPrompt ? 'visibility' : 'visibility_off',
              web: revealedPrompt ? 'visibility' : 'visibility_off',
            }}
            size={15}
            tintColor={revealedIsImpostor ? theme.semantic.status.error : theme.semantic.text.muted}
          />
          <Text
            style={{
              color: revealedIsImpostor ? theme.semantic.status.error : theme.semantic.text.secondary,
              fontSize: 12,
            }}>
            {isPt ? 'Segredo da rodada' : 'Round secret'}
          </Text>
        </View>
        <Animated.Text
          style={[
            revealPromptStyle,
            {
              color: revealedIsImpostor ? theme.semantic.status.error : theme.semantic.text.primary,
              fontSize: 19,
              fontWeight: '700',
              letterSpacing: revealedIsImpostor ? 1 : 0.2,
            },
          ]}>
          {revealedPrompt || (heldRevealId ? copy.releaseRevealHint : copy.holdRevealHint)}
        </Animated.Text>
      </Animated.View>

      <View style={styles.grid}>
        {localRevealPlayers.map((player) => (
          <Pressable
            key={player.id}
            accessibilityRole="button"
            accessibilityLabel={`${player.name}. ${copy.holdRevealHint}`}
            onPressIn={() => onPressRevealIn(player.id)}
            onPressOut={() => onPressRevealOut(player.id)}
            style={[
              styles.playerCard,
              styles.revealPlayerCard,
              {
                width: playerCardWidth as any,
                borderColor:
                  heldRevealId === player.id ? theme.semantic.button.primary.bg : theme.semantic.border.subtle,
                backgroundColor: theme.semantic.bg.surface,
                opacity: heldRevealId && heldRevealId !== player.id ? 0.36 : 1,
                borderWidth: heldRevealId === player.id ? 1.8 : 1.2,
                shadowOpacity: heldRevealId === player.id ? 0.62 : 0.2,
                shadowRadius: heldRevealId === player.id ? 16 : 7,
                elevation: heldRevealId === player.id ? 12 : 4,
              },
            ]}>
            <View
              pointerEvents="none"
              style={[styles.revealCardFrame, { borderColor: withAlpha(theme.semantic.text.primary, 0.11) }]}
            />
            <AvatarSprite avatarId={player.avatarId} size={34} />
            <Text style={[styles.playerName, { color: theme.semantic.text.primary }]}>{player.name}</Text>
            <View
              style={[
                styles.revealLock,
                {
                  borderColor: withAlpha(theme.semantic.border.subtle, 0.92),
                  backgroundColor: withAlpha(theme.semantic.bg.elevated, 0.72),
                },
              ]}>
              <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} size={12} tintColor={theme.semantic.text.muted} />
            </View>
            <Text style={[styles.revealHint, { color: theme.semantic.text.muted }]}>{copy.holdRevealHint}</Text>
          </Pressable>
        ))}
      </View>

      {!localRevealPlayers.length ? (
        <Text style={{ color: theme.semantic.text.muted }}>
          {isPt ? 'Nenhum jogador local pronto para revelar.' : 'No local player ready to reveal.'}
        </Text>
      ) : null}
      <Button label={copy.goClues} onPress={onGoClues} disabled={isRemote && !canControl} />
      {isRemote && !canControl ? <Text style={{ color: theme.semantic.text.muted }}>{copy.hostOnly}</Text> : null}
    </Card>
  );
}

