import React from 'react';

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

export type DotProps = {
  pan: Animated.SharedValue<number>;
  index: number;
};
export const Dot = ({pan, index}: DotProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        pan.value,
        [index - 1, index, index + 1],
        [0.5, 1, 0.5],
        {
          extrapolateLeft: Extrapolation.CLAMP,
          extrapolateRight: Extrapolation.CLAMP,
        },
      ),
    };
  });

  return <Animated.View style={[styles.animateViewList, animatedStyles]} />;
};

const styles = createTheme({
  animateViewList: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 3,
    backgroundColor: Color.graphicBase1,
  },
});
