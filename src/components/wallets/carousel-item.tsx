import React from 'react';

import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {createTheme} from '@app/helpers';

export type CarouselItemProps = {
  index: number;
  pan: SharedValue<number>;
  children: React.ReactNode;
};

export const CarouselItem = ({children, pan, index}: CarouselItemProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            pan.value,
            [index - 1, index, index + 1],
            [-50, 0, 50],
          ),
        },
        {
          scale: interpolate(
            pan.value,
            [index - 1, index, index + 1],
            [0.9, 1, 0.9],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyles]}>
      {children}
    </Animated.View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
