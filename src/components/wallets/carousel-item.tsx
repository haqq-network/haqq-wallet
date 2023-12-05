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
  noScale?: boolean;
};

export const CarouselItem = ({
  children,
  pan,
  index,
  noScale,
}: CarouselItemProps) => {
  const animatedStyles = useAnimatedStyle(() => {
    if (noScale) {
      return {
        transform: [
          {
            translateX: interpolate(
              pan.value,
              [index - 1, index, index + 1],
              [0, 0, 0],
            ),
          },
        ],
      };
    }

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
    <Animated.View style={[!noScale && styles.container, animatedStyles]}>
      {children}
    </Animated.View>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
