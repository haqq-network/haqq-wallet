import React, {useEffect, useRef} from 'react';

import {Pressable, View} from 'react-native';

import {Color, getColor} from '@app/colors';
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
import {votesType} from '@app/types';

type VotingCardActiveProps = {
  title: string;
  daysLeft: number;
  hourLeft: number;
  minLeft: number;
  depositNeeds?: number;
  depositCollected?: number;
  yourDeposit?: number;
  votes?: votesType;
  isVoted?: boolean;
  onPress?: () => void;
  orderNumber?: number;
};

const initialVotes = {
  yes: 1,
  no: 2,
  abstain: 1,
  veto: 1,
};

const colorVotes = {
  yes: Color.graphicGreen1,
  no: Color.textRed1,
  abstain: Color.graphicSecond4,
  veto: Color.textYellow1,
};

export const VotingCardActive = ({
  title,
  daysLeft,
  hourLeft,
  minLeft,
  votes = initialVotes,
  isVoted,
  onPress,
  orderNumber = 0,
  depositNeeds,
  depositCollected,
  yourDeposit,
}: VotingCardActiveProps) => {
  const linesRef = useRef<VotingLineInterface>(null);
  const depositProgressRef = useRef<ProgressLineInterface>(null);

  const votesList = Object.entries(votes) as [keyof typeof votes, number][];
  const [majorityVotes] = votesList.reduce((prev, cur) => {
    return prev[1] > cur[1] ? prev : cur;
  }, votesList[0]);

  const primaryColor = getColor(
    depositNeeds ? Color.graphicBlue1 : colorVotes[majorityVotes],
  );

  useEffect(() => {
    linesRef.current?.updateValues(votes);
  }, [votes]);

  useEffect(() => {
    if (depositNeeds && depositCollected) {
      depositProgressRef.current?.updateProgress(
        depositCollected / depositNeeds,
      );
    }
  }, [depositNeeds, depositCollected]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.backgroundContainer, {backgroundColor: primaryColor}]}>
      <View style={styles.topInfoBlock}>
        <Icon
          i18
          color={Color.graphicBase3}
          name={depositNeeds ? 'deposit' : 'time'}
        />
        <Spacer width={5.5} />
        <Text
          t12
          color={Color.textBase3}
          i18n={
            depositNeeds
              ? I18N.homeGovernanceVotingCardDepositPeriod
              : I18N.homeGovernanceVotingCardVoting
          }
        />
        <Spacer />
        {isVoted && !yourDeposit && (
          <Text
            t17
            color={Color.textBase3}
            i18n={I18N.homeGovernanceVotingCardYouVoted}
          />
        )}
        {yourDeposit && (
          <Text
            t17
            color={Color.textBase3}
            i18n={I18N.homeGovernanceVotingCardYouDeposited}
          />
        )}
      </View>
      <View style={styles.container}>
        <Text t14 color={Color.textBase2}>
          #{orderNumber}
        </Text>
        <Spacer height={2} />
        <Text t8 numberOfLines={2} color={Color.textBase1}>
          {title}
        </Text>
        <Spacer height={12} />
        <View style={styles.timeContainer}>
          <Icon i42 color={primaryColor} name="timer_governance" />
          <View style={styles.timeRightContainer}>
            <Text
              t14
              color={Color.textBase2}
              i18n={I18N.homeGovernanceVotingCardVotingEnd}
            />
            <Spacer height={4} />
            <View style={styles.timeValuesContainer}>
              <TextSum
                style={styles.timeUnit}
                sum={String(daysLeft)}
                rightText={I18N.homeGovernanceVotingCardDay}
              />
              <TextSum
                style={styles.timeUnit}
                sum={String(hourLeft)}
                rightText={I18N.homeGovernanceVotingCardHour}
              />
              <TextSum
                style={styles.timeUnit}
                sum={String(minLeft)}
                rightText={I18N.homeGovernanceVotingCardMin}
              />
            </View>
          </View>
        </View>
        <Spacer height={16} />
        {depositNeeds ? (
          <>
            <ProgressLine ref={depositProgressRef} initialProgress={0.1} />
            <Spacer height={8} />
            <Text t15 color={Color.textBase2}>
              {depositCollected?.toFixed(0)} ISLM from{' '}
              {depositNeeds?.toFixed(0)} ISLM
            </Text>
          </>
        ) : (
          <VotingLine ref={linesRef} initialVotes={initialVotes} />
        )}
      </View>
    </Pressable>
  );
};

const styles = createTheme({
  backgroundContainer: {
    borderRadius: 12,
    paddingTop: 6,
  },
  container: {
    backgroundColor: Color.bg1,
    margin: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  topInfoBlock: {
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRightContainer: {
    marginLeft: 12,
  },
  timeValuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    marginRight: 8,
  },
});
