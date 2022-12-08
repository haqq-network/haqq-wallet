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
  depositNeeds?: number;
  depositCollected?: number;
  showBottomInfo?: true;
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
        depositNeeds = 0,
        depositCollected = 0,
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
          </View>
          <Spacer height={8} />
          {showBottomInfo && (
            <Text t15 color={Color.textBase2}>
              {depositCollected.toFixed(0)} ISLM from {depositNeeds.toFixed(0)}{' '}
              ISLM
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
});
