import React, {forwardRef, memo, useImperativeHandle, useState} from 'react';

import {View} from 'react-native';
import Animated, {
  WithTimingConfig,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {getText} from '@app/i18n';
import {VoteNamesType, VotesType} from '@app/types';
import {VOTES} from '@app/variables';

export type VotingLineProps = {
  initialVotes: VotesType;
  showBottomText?: boolean;
};

export interface VotingLineInterface {
  updateValues: (newVotes: VotesType) => void;
  setSelected: React.Dispatch<React.SetStateAction<VoteNamesType>>;
}

const animConfig: WithTimingConfig = {
  duration: 500,
};

export const VotingLine = memo(
  forwardRef(({initialVotes, showBottomText}: VotingLineProps, ref) => {
    const initialSum =
      Object.values(initialVotes).reduce((a, b) => a + b, 0) / 100;
    const initPercentYes = initialVotes.yes / initialSum;
    const initPercentNo = initialVotes.no / initialSum;
    const initPercentAbstain = initialVotes.abstain / initialSum;
    const initPercentVeto = initialVotes.veto / initialSum;

    const yesVotes = useSharedValue(initPercentYes);
    const noVotes = useSharedValue(initPercentNo);
    const abstainVotes = useSharedValue(initPercentAbstain);
    const vetoVotes = useSharedValue(initPercentVeto);

    const [selected, setSelected] = useState<VoteNamesType | undefined>();
    const [percents, setPercents] = useState<{[name: string]: number}>({
      yes: initPercentYes,
      no: initPercentNo,
      abstain: initPercentAbstain,
      veto: initPercentVeto,
    });

    useImperativeHandle(ref, () => ({
      updateValues(newVotes: VotesType) {
        const factor = Object.values(newVotes).reduce((a, b) => a + b, 0) / 100;
        const yes = newVotes.yes / factor;
        const no = newVotes.no / factor;
        const abstain = newVotes.abstain / factor;
        const veto = newVotes.veto / factor;

        yesVotes.value = withTiming(yes, animConfig);
        noVotes.value = withTiming(no, animConfig);
        abstainVotes.value = withTiming(abstain, animConfig);
        vetoVotes.value = withTiming(veto, animConfig);

        setPercents({yes, no, abstain, veto});
      },
      setSelected,
    }));

    const yesVotesStyle = useAnimatedStyle(() => {
      const {value} = yesVotes;
      const isSelected = selected === 'yes' || typeof selected === 'undefined';
      return {
        width: `${value}%`,
        opacity: !isSelected ? 0.5 : 1,
        paddingHorizontal: value === 100 || value < 4 ? 0 : 2,
      };
    }, [selected]);

    const noVotesWidth = useAnimatedStyle(() => {
      const {value} = noVotes;
      const isSelected = selected === 'no' || typeof selected === 'undefined';
      return {
        width: `${value}%`,
        opacity: !isSelected ? 0.5 : 1,
        paddingHorizontal: value === 100 || value < 4 ? 0 : 2,
      };
    }, [selected]);

    const abstainVotesWidth = useAnimatedStyle(() => {
      const {value} = abstainVotes;
      const isSelected =
        selected === 'abstain' || typeof selected === 'undefined';
      return {
        width: `${value}%`,
        opacity: !isSelected ? 0.5 : 1,
        paddingHorizontal: value === 100 || value < 4 ? 0 : 2,
      };
    }, [selected]);

    const vetoVotesWidth = useAnimatedStyle(() => {
      const {value} = vetoVotes;
      const isSelected = selected === 'veto' || typeof selected === 'undefined';
      return {
        width: `${value}%`,
        opacity: !isSelected ? 0.5 : 1,
        paddingHorizontal: value === 100 || value < 4 ? 0 : 2,
      };
    }, [selected]);

    return (
      <View style={styles.container}>
        <View style={styles.lineContainer}>
          <Animated.View style={[styles.leftLine, yesVotesStyle]}>
            <View style={[styles.lineStyle, styles.green]} />
          </Animated.View>
          <Animated.View style={noVotesWidth}>
            <View style={[styles.lineStyle, styles.red]} />
          </Animated.View>
          <Animated.View style={abstainVotesWidth}>
            <View style={[styles.lineStyle, styles.gray]} />
          </Animated.View>
          <Animated.View style={[styles.rightLine, vetoVotesWidth]}>
            <View style={[styles.lineStyle, styles.yellow]} />
          </Animated.View>
        </View>
        {showBottomText && (
          <View style={styles.statisticContainer}>
            {VOTES.map(({name, color, i18n}) => {
              const isSelected =
                selected === name || typeof selected === 'undefined';
              return (
                <View
                  key={name}
                  style={[styles.textItem, !isSelected && styles.withOpacity]}>
                  <View
                    style={[styles.dot, {backgroundColor: getColor(color)}]}
                  />
                  <Text t13 color={Color.textBase1}>
                    {getText(i18n)} {percents[name].toFixed(0)}%
                  </Text>
                </View>
              );
            })}
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
    flexWrap: 'wrap',
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
  textItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withOpacity: {
    opacity: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 2,
  },
});
