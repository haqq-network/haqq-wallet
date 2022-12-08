import React from 'react';

import {format} from 'date-fns';
import {Pressable, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Spacer, Text, VotingLine} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {votesType} from '@app/types';

export enum VotingCompletedStatuses {
  passed = I18N.homeGovernanceVotingCardPassed,
  rejected = I18N.homeGovernanceVotingCardRejected,
}
export type VotingCompletedStatusesKeys = keyof typeof VotingCompletedStatuses;

type VotingCardCompletedProps = {
  hash: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  status: VotingCompletedStatuses;
  votes: votesType;
  isVoted?: boolean;
  onPress?: (hash: string) => void;
  orderNumber?: number;
};

export const VotingCardCompleted = ({
  hash,
  title,
  startDate,
  endDate,
  status,
  votes,
  isVoted,
  onPress,
  orderNumber = 0,
}: VotingCardCompletedProps) => {
  const isRejected = status === VotingCompletedStatuses.rejected;
  const statusColor = isRejected ? Color.textRed1 : Color.textGreen1;

  const handlePress = () => onPress?.(hash);

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
          #{orderNumber}
        </Text>
        <Spacer height={2} />
        <Text t8 numberOfLines={2} color={Color.textBase2}>
          {title}
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
              {startDate && format(startDate, 'dd MMM yyyy, H:mm')}
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
              {endDate && format(endDate, 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
        </View>
        <Spacer height={16} />
        <VotingLine initialVotes={votes} />
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
  },
  container: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
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
