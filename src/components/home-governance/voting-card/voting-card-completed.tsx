import React, {useMemo} from 'react';

import {format} from 'date-fns';
import {Pressable, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Spacer, Text} from '@app/components/ui';
import {VotingLine} from '@app/components/voting-line';
import {I18N} from '@app/i18n';
import {
  GovernanceVoting,
  ProposalRealmType,
} from '@app/models/governance-voting';
import {SHADOW_COLOR_1} from '@app/variables/common';

export enum VotingCompletedStatuses {
  passed = I18N.homeGovernanceVotingCardPassed,
  rejected = I18N.homeGovernanceVotingCardRejected,
}

export type VotingCompletedStatusesKeys = keyof typeof VotingCompletedStatuses;

type VotingCardCompletedProps = {
  id: number;

  onPress?: (id: number) => void;
};

export const VotingCardCompleted = ({
  id,
  onPress,
}: VotingCardCompletedProps) => {
  const item = useMemo(() => {
    return GovernanceVoting.getById(id) as ProposalRealmType;
  }, [id]);

  const isVoted = false; // PASS

  const status =
    VotingCompletedStatuses[item.status as VotingCompletedStatusesKeys];

  const isRejected = status === VotingCompletedStatuses.rejected;
  const statusColor = isRejected ? Color.textRed1 : Color.textGreen1;

  const handlePress = () => onPress?.(id);

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
          #{item.orderNumber}
        </Text>
        <Spacer height={2} />
        <Text t8 numberOfLines={2} color={Color.textBase2}>
          {item.title}
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
              {item.dateStart && format(item.dateStart, 'dd MMM yyyy, H:mm')}
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
              {item.dateEnd && format(item.dateEnd, 'dd MMM yyyy, H:mm')}
            </Text>
          </View>
        </View>
        <Spacer height={16} />
        <VotingLine initialVotes={item.proposalVotes} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
