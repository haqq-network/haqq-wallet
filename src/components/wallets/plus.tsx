import React from 'react';

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {Icon} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type DotProps = {
  pan: Animated.SharedValue<number>;
  index: number;
};
export const Plus = ({pan, index}: DotProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pan.value, [index - 1, index], [0.5, 1], {
        extrapolateLeft: Extrapolation.CLAMP,
      }),
    };
  });

  return (
    <Animated.View style={[styles.animateView, animatedStyles]}>
      <Icon i12 name="plus_mid" color={Color.graphicBase1} />
    </Animated.View>
  );
};

const styles = createTheme({
  animateView: {
    width: 12,
    height: 12,
  },
});
