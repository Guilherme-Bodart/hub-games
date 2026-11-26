import { Text, View } from 'react-native';

import { impostorPhaseStyles as styles } from '@/src/features/games/impostor/styles/impostorPhaseStyles';
import { ThemeTokens } from '@/src/theme/types';
import { AvatarSprite } from '@/src/ui/atoms';

type VoteBreakdownEntry = {
  suspect: {
    id: string;
    name: string;
    avatarId: number;
  };
  voteCount: number;
  voters: Array<{
    id: string;
    avatarId: number;
  }>;
};

type ResultVoteMapBlockProps = {
  entries: VoteBreakdownEntry[];
  title: string;
  votesCountLabel: string;
  theme: ThemeTokens;
};

export function ResultVoteMapBlock({
  entries,
  title,
  votesCountLabel,
  theme,
}: ResultVoteMapBlockProps) {
  return (
    <View
      style={[
        styles.resultBlock,
        {
          borderColor: theme.semantic.border.hairline,
          backgroundColor: theme.semantic.bg.subtle,
        },
      ]}>
      <Text
        style={[
          styles.resultBlockTitle,
          {
            color: theme.semantic.text.primary,
            fontFamily: theme.semantic.typography.titleFamily,
            fontWeight: theme.semantic.typography.titleWeight,
          },
        ]}>
        {title}
      </Text>
      {entries.map((entry) => (
        <View
          key={`vote-map-${entry.suspect.id}`}
          style={[
            styles.voteMapRow,
            {
              borderColor: theme.semantic.border.hairline,
              backgroundColor: theme.semantic.bg.surface,
            },
          ]}>
          <View style={styles.voteMapTarget}>
            <AvatarSprite avatarId={entry.suspect.avatarId} size={28} />
            <Text
              numberOfLines={1}
              style={[
                styles.voteMapTargetName,
                {
                  color: theme.semantic.text.primary,
                  fontFamily: theme.semantic.typography.bodyFamily,
                  fontWeight: theme.semantic.typography.bodyWeight,
                },
              ]}>
              {entry.suspect.name}
            </Text>
          </View>
          <View style={styles.voteMapVoters}>
            {entry.voters.length ? (
              entry.voters.map((voter) => (
                <AvatarSprite
                  key={`vote-voter-${entry.suspect.id}-${voter.id}`}
                  avatarId={voter.avatarId}
                  size={18}
                />
              ))
            ) : (
              <Text style={[styles.voteMapCount, { color: theme.semantic.text.muted }]}>-</Text>
            )}
          </View>
          <Text
            style={[
              styles.voteMapCount,
              {
                color: theme.semantic.text.secondary,
                fontFamily: theme.semantic.typography.numberFamily,
                fontWeight: theme.semantic.typography.numberWeight,
              },
            ]}>
            {`${entry.voteCount} ${votesCountLabel}`}
          </Text>
        </View>
      ))}
    </View>
  );
}
