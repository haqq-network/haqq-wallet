import React, {forwardRef, memo, useImperativeHandle} from 'react';

import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type ProgressLineProps = {
  initialProgress?: number;
  color?: Color | string;
  max?: number;
  total?: number;
  showBottomInfo?: true;
  markPosition?: number;
};

export interface ProgressLineInterface {
  updateProgress: (newVotes: number) => void;
}

export const ProgressLine = memo(
  forwardRef(
    (
      {
        initialProgress = 0,
        color = Color.graphicBlue1,
        max = 0,
        total = 0,
        markPosition,
        showBottomInfo,
      }: ProgressLineProps,
      ref,
    ) => {
      const width = useSharedValue(initialProgress);

      useImperativeHandle(ref, () => ({
        updateProgress(percent: number) {
          width.value = withTiming(percent, {duration: 500});
        },
      }));

      const progressWidth = useAnimatedStyle(() => ({
        width: `${width.value * 100}%`,
      }));

      return (
        <>
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.lineStyle,
                {backgroundColor: getColor(color)},
                progressWidth,
              ]}
            />
            {markPosition !== undefined && (
              <View
                style={[styles.markLine, {left: `${markPosition * 100}%`}]}
              />
            )}
          </View>
          <Spacer height={8} />
          {showBottomInfo && (
            <Text t15 color={Color.textBase2}>
              {total.toFixed(0)} ISLM from {max.toFixed(0)} ISLM
            </Text>
          )}
        </>
      );
    },
  ),
);

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Color.graphicSecond1,
    width: '100%',
    borderRadius: 40,
  },
  lineStyle: {
    borderRadius: 40,
    height: 8,
  },
  markLine: {
    position: 'absolute',
    height: 10,
    width: 1,
    transform: [{translateY: -1}, {translateX: -0.5}],
    borderRadius: 5,
    backgroundColor: Color.graphicSecond4,
  },
});
