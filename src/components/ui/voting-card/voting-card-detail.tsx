import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  ProgressLine,
  ProgressLineInterface,
  Spacer,
  Text,
  TextSum,
  VotingLine,
  VotingLineInterface,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ProposalRealmType} from '@app/models/governance-voting';
import {VoteNamesType} from '@app/types';
import {VOTES} from '@app/variables';

import {ProgressCircle, ProgressCircleInterface} from './progress-circle';

export type VotingCardDetailRefInterface =
  | ({
      updateNotEnoughProgress: (value: number) => void;
    } & VotingLineInterface)
  | undefined;

interface VotingCardDetailProps {
  item: ProposalRealmType;
  yourVote?: VoteNamesType;
}

export const VotingCardDetail = forwardRef<
  VotingCardDetailRefInterface,
  VotingCardDetailProps
>(({item, yourVote}, ref) => {
  const {
    dataDifference: {daysLeft, minLeft, hourLeft, isActive},
    proposalVotes,
    isDeposited,
    isVoting,
  } = item;
  const circleRef = useRef<ProgressCircleInterface>();
  const votingRef = useRef<VotingLineInterface | undefined>();
  const notEnoughVotesRef = useRef<ProgressLineInterface | undefined>();

  const {i18n, color} = VOTES.find(v => v.name === yourVote) || {};

  useImperativeHandle(ref, () => ({
    setSelected: (...params) => votingRef.current?.setSelected(...params),
    updateNotEnoughProgress: (...params) =>
      notEnoughVotesRef.current?.updateProgress(...params),
    updateValues: (...params) => votingRef.current?.updateValues(...params),
  }));

  useEffect(() => {
    circleRef.current?.animateTo(item.timeLeftPercent);
  }, [item.timeLeftPercent]);

  const isNotEnoughVotes = item.yesPercent < 51;

  const iconColor = isDeposited ? Color.textBlue1 : Color.graphicGreen1;
  return (
    <>
      <View style={styles.cardInfo}>
        <View style={styles.row}>
          <Text t9 i18n={I18N.proposalVoteResults} />
          <Spacer width={12} />
          {i18n && (
            <>
              <Text t15 color={Color.textBase2} i18n={I18N.proposalYouVoted} />
              <Spacer width={4} />
              <Text t15 color={color} i18n={i18n} />
            </>
          )}
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
            max={item.proposalDepositNeeds}
            total={95}
          />
        ) : (
          <VotingLine
            ref={votingRef}
            showBottomText
            initialVotes={proposalVotes}
          />
        )}
      </View>
      {isVoting && isNotEnoughVotes && (
        <View style={styles.subContainer}>
          <ProgressLine
            ref={notEnoughVotesRef}
            initialProgress={0}
            markPosition={0.51}
            color={Color.graphicSecond2}
          />
          <Spacer height={8} />
          <Text>
            <Text
              t18
              i18params={{percent: item.yesPercent.toFixed(0)}}
              color={Color.textBase2}
              i18n={I18N.proposalNotEnough}
            />
            <Text
              t15
              color={Color.textBase2}
              i18n={I18N.proposalNotEnoughDescription}
            />
          </Text>
        </View>
      )}
    </>
  );
});

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
  subContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    borderRadius: 12,
  },
});
