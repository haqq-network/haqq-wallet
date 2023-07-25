import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
  ProgressCircle,
  ProgressCircleInterface,
  ProgressLine,
  ProgressLineInterface,
  Spacer,
  Text,
  TextSum,
} from '@app/components/ui';
import {VotingLine, VotingLineInterface} from '@app/components/voting-line';
import {createTheme} from '@app/helpers';
import {
  proposalDepositNeeds,
  proposalVotes,
  timeLeftPercent,
  yesPercent,
} from '@app/helpers/governance';
import {useTimer} from '@app/hooks/use-timer';
import {I18N} from '@app/i18n';
import {TimerUpdateInterval, VoteNamesType} from '@app/types';
import {VOTES} from '@app/variables/votes';

export type VotingCardDetailRefInterface =
  | ({
      updateNotEnoughProgress: (value: number) => void;
      updateDepositProgress: (value: number) => void;
    } & VotingLineInterface)
  | undefined;

interface VotingCardDetailProps {
  item: Proposal;
  yourVote?: VoteNamesType;
  totalCollected?: number;
}

export const VotingCardDetail = forwardRef<
  VotingCardDetailRefInterface,
  VotingCardDetailProps
>(({item, yourVote, totalCollected}, ref) => {
  const {days, hours, minutes} = useTimer({
    start: item.voting_start_time,
    end: item.voting_end_time,
    updateInterval: TimerUpdateInterval.minute,
  });

  const isVoting = item.status === 'PROPOSAL_STATUS_VOTING_PERIOD';
  const isDeposited = item.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD';

  const isActive = isVoting || isDeposited;

  const pv = proposalVotes(item);

  const circleRef = useRef<ProgressCircleInterface>();
  const votingRef = useRef<VotingLineInterface | undefined>();
  const depositLineRef = useRef<ProgressLineInterface | undefined>();
  const notEnoughVotesRef = useRef<ProgressLineInterface | undefined>();

  const {i18n, color} = VOTES.find(v => v.name === yourVote) || {};

  useImperativeHandle(ref, () => ({
    setSelected: (...params) => votingRef.current?.setSelected(...params),
    updateNotEnoughProgress: (...params) =>
      notEnoughVotesRef.current?.updateProgress(...params),
    updateValues: (...params) => votingRef.current?.updateValues(...params),
    updateDepositProgress: (...params) =>
      depositLineRef.current?.updateProgress(...params),
  }));

  useEffect(() => {
    circleRef.current?.animateTo(timeLeftPercent(item));
  }, [item]);

  const isNotEnoughVotes = yesPercent(item) < 51;

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
                    sum={days.toFixed(0)}
                    rightText={I18N.homeGovernanceVotingCardDay}
                  />
                  <TextSum
                    style={styles.timeUnit}
                    sum={hours.toFixed(0)}
                    rightText={I18N.homeGovernanceVotingCardHour}
                  />
                  <TextSum
                    style={styles.timeUnit}
                    sum={minutes.toFixed(0)}
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
            initialProgress={0}
            showBottomInfo
            ref={depositLineRef}
            max={proposalDepositNeeds(item)}
            total={totalCollected}
          />
        ) : (
          <VotingLine ref={votingRef} showBottomText initialVotes={pv} />
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
              i18params={{percent: yesPercent(item).toFixed(0)}}
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
