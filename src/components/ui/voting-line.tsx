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
};

export interface VotingLineInterface {
  updateValues: (newVotes: votesType) => void;
}

export const VotingLine = memo(
  forwardRef(({initialVotes}: VotingLineProps, ref) => {
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

    const yesVotesWidth = useAnimatedStyle(() => ({
      width: `${(yesVotes.value / totalVotes.value) * 97}%`,
    }));

    const noVotesWidth = useAnimatedStyle(() => ({
      width: `${(noVotes.value / totalVotes.value) * 97}%`,
    }));

    const abstainVotesWidth = useAnimatedStyle(() => ({
      width: `${(abstainVotes.value / totalVotes.value) * 97}%`,
    }));

    const vetoVotesWidth = useAnimatedStyle(() => ({
      width: `${(vetoVotes.value / totalVotes.value) * 97}%`,
    }));

    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.lineStyle, styles.green, yesVotesWidth]}
        />
        <Animated.View style={[styles.lineStyle, styles.red, noVotesWidth]} />
        <Animated.View
          style={[styles.lineStyle, styles.gray, abstainVotesWidth]}
        />
        <Animated.View
          style={[styles.lineStyle, styles.yellow, vetoVotesWidth]}
        />
      </View>
    );
  }),
);

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineStyle: {
    borderRadius: 4,
    height: 12,
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
