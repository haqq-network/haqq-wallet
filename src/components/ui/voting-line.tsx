import React, {forwardRef, memo, useImperativeHandle} from 'react';

import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {votesType} from '@app/types';

export type VotingLineProps = {
  initialVotes: votesType;
  showBottomText?: boolean;
};

export interface VotingLineInterface {
  updateValues: (newVotes: votesType) => void;
}

export const VotingLine = memo(
  forwardRef(({initialVotes, showBottomText}: VotingLineProps, ref) => {
    const yesVotes = useSharedValue(initialVotes.yes);
    const noVotes = useSharedValue(initialVotes.no);
    const abstainVotes = useSharedValue(initialVotes.abstain);
    const vetoVotes = useSharedValue(initialVotes.veto);

    const totalVotes = useDerivedValue(
      () =>
        yesVotes.value + noVotes.value + abstainVotes.value + vetoVotes.value,
    );

    useImperativeHandle(ref, () => ({
      updateValues(newVotes: votesType) {
        yesVotes.value = withTiming(newVotes.yes, {duration: 500});
        noVotes.value = withTiming(newVotes.no, {duration: 500});
        abstainVotes.value = withTiming(newVotes.abstain, {duration: 500});
        vetoVotes.value = withTiming(newVotes.veto, {duration: 500});
      },
    }));

    const yesPercent = useDerivedValue(
      () => (yesVotes.value / totalVotes.value) * 100,
    );
    const yesVotesWidth = useAnimatedStyle(() => ({
      width: `${yesPercent.value}%`,
      paddingHorizontal: yesPercent.value === 100 ? 0 : 2,
    }));

    const noPercent = useDerivedValue(
      () => (noVotes.value / totalVotes.value) * 100,
    );
    const noVotesWidth = useAnimatedStyle(() => ({
      width: `${noPercent.value}%`,
      paddingHorizontal: noPercent.value === 100 ? 0 : 2,
    }));

    const abstainPercent = useDerivedValue(
      () => (abstainVotes.value / totalVotes.value) * 100,
    );
    const abstainVotesWidth = useAnimatedStyle(() => ({
      width: `${abstainPercent.value}%`,
      paddingHorizontal: abstainPercent.value === 100 ? 0 : 2,
    }));

    const vetoPercent = useDerivedValue(
      () => (vetoVotes.value / totalVotes.value) * 100,
    );
    const vetoVotesWidth = useAnimatedStyle(() => ({
      width: `${vetoPercent.value}%`,
      paddingHorizontal: vetoPercent.value === 100 ? 0 : 2,
    }));

    return (
      <View style={styles.container}>
        <View style={styles.lineContainer}>
          <Animated.View style={[yesVotesWidth, styles.leftLine]}>
            <View style={[styles.lineStyle, styles.green, styles.leftLine]} />
          </Animated.View>
          <Animated.View style={noVotesWidth}>
            <View style={[styles.lineStyle, styles.red]} />
          </Animated.View>
          <Animated.View style={abstainVotesWidth}>
            <View style={[styles.lineStyle, styles.gray]} />
          </Animated.View>
          <Animated.View style={[vetoVotesWidth, styles.rightLine]}>
            <View style={[styles.lineStyle, styles.yellow]} />
          </Animated.View>
        </View>
        {showBottomText && (
          <View style={styles.statisticContainer}>
            <Animated.Text>Yes {yesPercent.value.toFixed(0)}%</Animated.Text>
            <Animated.Text>No {noPercent.value.toFixed(0)}%</Animated.Text>
            <Animated.Text>
              Abstain {abstainPercent.value.toFixed(0)}%
            </Animated.Text>
            <Animated.Text>Veto {vetoPercent.value.toFixed(0)}%</Animated.Text>
          </View>
        )}
      </View>
    );
  }),
);

const styles = createTheme({
  lineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statisticContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  container: {
    width: '100%',
  },
  rightLine: {
    paddingRight: 0,
  },
  leftLine: {
    paddingLeft: 0,
  },
  lineStyle: {
    borderRadius: 4,
    height: 12,
    width: '100%',
  },
  green: {
    backgroundColor: Color.graphicGreen1,
  },
  red: {
    backgroundColor: Color.textRed1,
  },
  gray: {
    backgroundColor: Color.graphicSecond4,
  },
  yellow: {
    backgroundColor: Color.textYellow1,
  },
});
