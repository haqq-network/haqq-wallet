import React, {useMemo, useRef} from 'react';

import {ScrollView, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Badge,
  Icon,
  Spacer,
  Text,
  TextSum,
  VotingLine,
  VotingLineInterface,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {GovernanceVoting} from '@app/models/governance-voting';
import {ProposalsTags} from '@app/types';

export function Proposal() {
  const {hash} = useTypedRoute<'proposal'>().params;
  const lineRef = useRef<VotingLineInterface>();
  const item = useMemo(() => {
    return GovernanceVoting.getByHash(hash);
  }, [hash]);

  if (!item) {
    return <></>;
  }
  const {
    status,
    dataDifference: {daysLeft, minLeft, hourLeft, isActive},
    orderNumber,
    title,
    proposalVotes,
  } = item;
  const badgePropsByStatus = () => {
    const props = ProposalsTags.find(tag => tag[0] === status);
    return {
      i18n: props?.[1],
      labelColor: props?.[2],
      textColor: props?.[3],
      iconLeftName: props?.[4],
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Spacer height={32} />
      <Badge {...badgePropsByStatus()} />
      <Spacer height={16} />
      <Text color={Color.textBase1} t14>
        #{orderNumber}
      </Text>
      <Spacer height={2} />
      <Text t5>{title}</Text>
      <Spacer height={24} />

      <View style={styles.cardInfo}>
        <View style={styles.row}>
          <Text t9 i18n={I18N.proposalVoteResults} />
          <Spacer width={12} />
          <Text t15 color={Color.textBase2} i18n={I18N.proposalVoteResults} />
          <Spacer width={4} />
          <Text t15 color={Color.textGreen1}>
            YES
          </Text>
        </View>
        <Spacer height={12} />
        {!isActive && (
          <>
            <View style={styles.timeContainer}>
              <Icon i42 color={Color.graphicGreen1} name="timer_governance" />
              <View style={styles.timeRightContainer}>
                <Text
                  t14
                  color={Color.textBase2}
                  i18n={I18N.homeGovernanceVotingCardVotingEnd}
                />
                <Spacer height={4} />
                <View style={styles.row}>
                  <TextSum
                    style={styles.timeUnit}
                    sum={daysLeft.toFixed(0)}
                    rightText={I18N.homeGovernanceVotingCardDay}
                  />
                  <TextSum
                    style={styles.timeUnit}
                    sum={hourLeft.toFixed(0)}
                    rightText={I18N.homeGovernanceVotingCardHour}
                  />
                  <TextSum
                    style={styles.timeUnit}
                    sum={minLeft.toFixed(0)}
                    rightText={I18N.homeGovernanceVotingCardMin}
                  />
                </View>
              </View>
            </View>
            <Spacer height={12} />
          </>
        )}
        <VotingLine ref={lineRef} showBottomText initialVotes={proposalVotes} />
      </View>
    </ScrollView>
  );
}

const styles = createTheme({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardInfo: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Color.bg8,
    width: '100%',
    borderRadius: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRightContainer: {
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    marginRight: 8,
  },
});
