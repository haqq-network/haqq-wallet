import React, {useEffect, useRef} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  ProgressLine,
  Spacer,
  Text,
  TextSum,
  VotingLine,
  VotingLineInterface,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ProposalRealmType} from '@app/models/governance-voting';

import {ProgressCircle, ProgressCircleInterface} from './progress-circle';

interface VotingCardDetailProps {
  item: ProposalRealmType;
  votingRef: React.RefObject<VotingLineInterface | undefined>;
}

export function VotingCardDetail({item, votingRef}: VotingCardDetailProps) {
  const {
    dataDifference: {daysLeft, minLeft, hourLeft, isActive},
    proposalVotes,
    isDeposited,
  } = item;
  const circleRef = useRef<ProgressCircleInterface>();

  useEffect(() => {
    circleRef.current?.animateTo(item.timeLeftPercent);
  }, [item.timeLeftPercent]);

  const iconColor = isDeposited ? Color.textBlue1 : Color.graphicGreen1;
  return (
    <>
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
        {(isActive || isDeposited) && (
          <>
            <View style={styles.timeContainer}>
              <ProgressCircle ref={circleRef} color={iconColor}>
                <Icon i24 color={iconColor} name="timer" />
              </ProgressCircle>
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
        {isDeposited ? (
          <ProgressLine
            initialProgress={0.1}
            showBottomInfo
            depositNeeds={item.proposalDepositNeeds}
            depositCollected={95}
          />
        ) : (
          <VotingLine
            ref={votingRef}
            showBottomText
            initialVotes={proposalVotes}
          />
        )}
      </View>
    </>
  );
}

const styles = createTheme({
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
