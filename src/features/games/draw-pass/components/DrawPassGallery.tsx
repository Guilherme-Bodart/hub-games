import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { DrawingBoard } from '@/src/features/games/draw-pass/components/DrawingBoard';
import { drawPassStyles as styles } from '@/src/features/games/draw-pass/styles/drawPassStyles';
import { ChainEntry } from '@/src/features/games/draw-pass/types/drawPass.types';
import { ELEVATION_STYLES, getGameAccent, useTheme } from '@/src/theme';
import { AvatarSprite, Badge, Card } from '@/src/ui/atoms';

type DrawPassGalleryProps = {
  chain: ChainEntry[];
  isPt: boolean;
};

export function DrawPassGallery({ chain, isPt }: DrawPassGalleryProps) {
  const { theme } = useTheme();
  const accent = getGameAccent('draw-pass');

  return (
    <Card
      title={isPt ? 'Álbum do Telefone Sem Fio' : 'Broken Telephone Gallery'}
      subtitle={
        isPt
          ? 'Veja quadro a quadro como a história original desandou!'
          : 'Scroll frame by frame to see how the original prompt went off the rails!'
      }>
      <View style={styles.galleryList}>
        {chain.map((item, idx) => {
          const isOriginal = item.type === 'prompt' && idx === 0;
          const badgeLabel =
            item.type === 'prompt'
              ? isOriginal
                ? isPt
                  ? 'Frase Original'
                  : 'Original Prompt'
                : isPt
                  ? `Chute de ${item.authorName}`
                  : `${item.authorName}'s Guess`
              : isPt
                ? `Desenho de ${item.authorName}`
                : `${item.authorName}'s Drawing`;

          return (
            <Fragment key={`chain-${idx}`}>
              <View
                style={[
                  styles.comicPanel,
                  ELEVATION_STYLES.card,
                  {
                    backgroundColor: theme.semantic.bg.surface,
                    borderColor: isOriginal ? accent.primary : theme.semantic.border.hairline,
                  },
                ]}>
                <View style={styles.comicHeader}>
                  <View style={styles.comicAuthorRow}>
                    <View
                      style={[
                        styles.comicStepNum,
                        { backgroundColor: accent.tint },
                      ]}>
                      <Text
                        style={[
                          styles.comicStepNumText,
                          {
                            color: accent.primary,
                            fontFamily: theme.semantic.typography.numberFamily,
                            fontWeight: theme.semantic.typography.numberWeight,
                          },
                        ]}>
                        {idx + 1}
                      </Text>
                    </View>
                    {!isOriginal ? <AvatarSprite avatarId={item.authorAvatarId} size={28} /> : null}
                    <Badge label={badgeLabel} variant={item.type === 'prompt' ? 'info' : 'success'} />
                  </View>
                </View>

                {item.type === 'prompt' ? (
                  <View
                    style={[
                      styles.comicPromptBubble,
                      {
                        backgroundColor: isOriginal ? accent.tint : theme.semantic.bg.subtle,
                        borderColor: theme.semantic.border.hairline,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.comicPromptText,
                        {
                          color: theme.semantic.text.primary,
                          fontFamily: theme.semantic.typography.titleFamily,
                          fontWeight: theme.semantic.typography.titleWeight,
                        },
                      ]}>
                      “{item.text}”
                    </Text>
                  </View>
                ) : (
                  <DrawingBoard strokes={item.strokes} interactive={false} compact isPt={isPt} />
                )}
              </View>

              {idx < chain.length - 1 ? (
                <View style={styles.comicConnector}>
                  <SymbolView
                    name={{ ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' }}
                    size={15}
                    tintColor={theme.semantic.text.muted}
                  />
                </View>
              ) : null}
            </Fragment>
          );
        })}
      </View>
    </Card>
  );
}
