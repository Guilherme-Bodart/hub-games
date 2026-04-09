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
          borderColor: theme.semantic.border.subtle,
          backgroundColor: theme.semantic.bg.surface,
        },
      ]}>
      <Text style={[styles.resultBlockTitle, { color: theme.semantic.text.primary }]}>{title}</Text>
      {entries.map((entry) => (
        <View
          key={`vote-map-${entry.suspect.id}`}
          style={[
            styles.voteMapRow,
            {
              borderColor: theme.semantic.border.subtle,
              backgroundColor: theme.semantic.bg.elevated,
            },
          ]}>
          <View style={styles.voteMapTarget}>
            <AvatarSprite avatarId={entry.suspect.avatarId} size={28} />
            <Text style={{ color: theme.semantic.text.primary, fontSize: 13 }}>{entry.suspect.name}</Text>
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
              <Text style={{ color: theme.semantic.text.muted, fontSize: 12 }}>-</Text>
            )}
          </View>
          <Text style={{ color: theme.semantic.text.secondary, fontSize: 12 }}>
            {`${entry.voteCount} ${votesCountLabel}`}
          </Text>
        </View>
      ))}
    </View>
  );
}
