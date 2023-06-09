import React, {useCallback} from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';
import {format} from 'date-fns';
import {Pressable, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Spacer, Text} from '@app/components/ui';
import {VotingLine} from '@app/components/voting-line';
import {createTheme} from '@app/helpers';
import {proposalVotes} from '@app/helpers/governance';
import {I18N} from '@app/i18n';
import {SHADOW_COLOR_1} from '@app/variables/common';

export enum VotingCompletedStatuses {
  passed = I18N.homeGovernanceVotingCardPassed,
  rejected = I18N.homeGovernanceVotingCardRejected,
}

export type VotingCompletedStatusesKeys = keyof typeof VotingCompletedStatuses;

type VotingCardCompletedProps = {
  item: Proposal;
  onPress: (item: Proposal) => void;
};

export const VotingCardCompleted = ({
  item,
  onPress,
}: VotingCardCompletedProps) => {
  const isVoted = false; // PASS

  const status =
    VotingCompletedStatuses[item.status as VotingCompletedStatusesKeys];

  const isRejected = status === VotingCompletedStatuses.rejected;
  const statusColor = isRejected ? Color.textRed1 : Color.textGreen1;

  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  return (
    <Pressable onPress={handlePress} style={styles.backgroundContainer}>
      <View style={styles.topInfoBlock}>
        <Icon i18 color={statusColor} name={isRejected ? 'close' : 'check'} />
        <Spacer width={5.5} />
        <Text t12 color={statusColor} i18n={status as number} />
        <Spacer />
        {isVoted && (
          <Text
            t17
            color={Color.textBase2}
            i18n={I18N.homeGovernanceVotingCardYouVoted}
          />
        )}
      </View>
      <View style={styles.container}>
        <Text t14 color={Color.textBase2}>
          #{item.proposal_id}
        </Text>
        <Spacer height={2} />
        <Text t8 numberOfLines={2} color={Color.textBase2}>
          {item.content.title}
        </Text>
        <Spacer height={12} />
        <View style={styles.dateContainer}>
          <View>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.homeGovernanceVotingCardVotingStart}
            />
            <Spacer height={4} />
            <Text t14 color={Color.textBase1}>
              {item.voting_start_time &&
                format(new Date(item.voting_start_time), 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
          <Spacer width={16} />
          <View>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.homeGovernanceVotingCardVotingEnd}
            />
            <Spacer height={4} />
            <Text t14 color={Color.textBase1}>
              {item.voting_end_time &&
                format(new Date(item.voting_end_time), 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
        </View>
        <Spacer height={16} />
        <VotingLine initialVotes={proposalVotes(item)} />
      </View>
    </Pressable>
  );
};

const styles = createTheme({
  backgroundContainer: {
    borderRadius: 12,
    paddingTop: 6,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    backgroundColor: Color.bg1,
    shadowRadius: 24,
    elevation: 13,
  },
  container: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    marginHorizontal: -1,
    marginBottom: -1,
  },
  topInfoBlock: {
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
