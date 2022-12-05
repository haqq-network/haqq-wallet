import React, {useEffect, useRef} from 'react';

import {Pressable, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Icon,
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
  votes?: votesType;
  isVoted?: boolean;
  onPress?: () => void;
  orderNumber?: number;
};

const initialVotes = {
  yes: 1,
  no: 1,
  abstain: 1,
  veto: 1,
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
}: VotingCardActiveProps) => {
  const lineRef = useRef<VotingLineInterface>(null);

  useEffect(() => {
    lineRef.current?.updateValues(votes);
  }, [votes]);

  return (
    <Pressable onPress={onPress} style={styles.backgroundContainer}>
      <View style={styles.topInfoBlock}>
        <Icon i18 color={Color.graphicBase3} name="time" />
        <Spacer width={5.5} />
        <Text
          t12
          color={Color.textBase3}
          i18n={I18N.homeGovernanceVotingCardVoting}
        />
        <Spacer />
        {isVoted && (
          <Text
            t17
            color={Color.textBase3}
            i18n={I18N.homeGovernanceVotingCardYouVoted}
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
          <Icon i42 color={Color.graphicGreen1} name="timer_governance" />
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
        <VotingLine ref={lineRef} initialVotes={initialVotes} />
      </View>
    </Pressable>
  );
};

const styles = createTheme({
  backgroundContainer: {
    backgroundColor: Color.graphicGreen1,
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
