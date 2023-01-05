import React, {useEffect, useMemo, useRef} from 'react';

import {Pressable, View} from 'react-native';

import {Color, getColor} from '@app/colors';
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
import {I18N} from '@app/i18n';
import {
  GovernanceVoting,
  ProposalRealmType,
} from '@app/models/governance-voting';
import {SHADOW_COLOR_1} from '@app/variables/common';

type VotingCardActiveProps = {
  id: number;
  onPress?: (hash: number) => void;
};

const initialVotes = {
  yes: 1,
  no: 1,
  abstain: 1,
  veto: 1,
};

const colorVotes = {
  yes: Color.graphicGreen1,
  no: Color.textRed1,
  abstain: Color.graphicSecond4,
  veto: Color.textYellow1,
};

export const VotingCardActive = ({id, onPress}: VotingCardActiveProps) => {
  const item = useMemo(() => {
    return GovernanceVoting.getById(id) as ProposalRealmType;
  }, [id]);
  const isVoted = true; // PASS
  const yourDeposit = 100; // PASS

  const {daysLeft, hourLeft, minLeft} = item.dataDifference;
  const circleRef = useRef<ProgressCircleInterface>();
  const linesRef = useRef<VotingLineInterface>(null);
  const depositProgressRef = useRef<ProgressLineInterface>(null);

  const votesList = Object.entries(item.proposalVotes) as [
    keyof typeof item.proposalVotes,
    number,
  ][];

  const isDeposited = item.status === 'deposited';

  const [majorityVotes] = votesList.reduce((prev, cur) => {
    return prev[1] > cur[1] ? prev : cur;
  }, votesList[0]);

  const primaryColor = getColor(
    isDeposited ? Color.graphicBlue1 : colorVotes[majorityVotes],
  );

  useEffect(() => {
    circleRef.current?.animateTo(item.timeLeftPercent);
  }, [item.timeLeftPercent]);

  useEffect(() => {
    linesRef.current?.updateValues(item.proposalVotes);
  }, [item.proposalVotes]);

  useEffect(() => {
    if (item.proposalDepositNeeds && isDeposited) {
      depositProgressRef.current?.updateProgress(
        /*depositCollected*/ 100 / item.proposalDepositNeeds, // PASS
      );
    }
  }, [item.proposalDepositNeeds, isDeposited]);

  const handlePress = () => onPress?.(id);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.backgroundContainer, {backgroundColor: primaryColor}]}>
      <View style={styles.topInfoBlock}>
        <Icon
          i18
          color={Color.graphicBase3}
          name={isDeposited ? 'deposit' : 'time'}
        />
        <Spacer width={6} />
        <Text
          t12
          color={Color.textBase3}
          i18n={
            isDeposited
              ? I18N.homeGovernanceVotingCardDepositPeriod
              : I18N.homeGovernanceVotingCardVoting
          }
        />
        <Spacer />
        {isVoted && !isDeposited && (
          <Text
            t17
            color={Color.textBase3}
            i18n={I18N.homeGovernanceVotingCardYouVoted}
          />
        )}
        {isDeposited && yourDeposit && (
          <Text
            t17
            color={Color.textBase3}
            i18n={I18N.homeGovernanceVotingCardYouDeposited}
          />
        )}
      </View>
      <View style={styles.container}>
        <Text t14 color={Color.textBase2}>
          #{item.orderNumber}
        </Text>
        <Spacer height={2} />
        <Text t8 numberOfLines={2} color={Color.textBase1}>
          {item.title}
        </Text>
        <Spacer height={12} />
        <View style={styles.timeContainer}>
          <ProgressCircle ref={circleRef} color={primaryColor}>
            <Icon i24 color={primaryColor} name="timer" />
          </ProgressCircle>

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
        <Spacer height={16} />
        {isDeposited ? (
          <ProgressLine
            ref={depositProgressRef}
            initialProgress={0}
            showBottomInfo
            max={item.proposalDepositNeeds}
            total={95}
          />
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
    shadowColor: SHADOW_COLOR_1,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 13,
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
