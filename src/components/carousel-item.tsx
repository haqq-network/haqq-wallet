import React from 'react';

import {Animated} from 'react-native';

import {createTheme} from '../helpers/create-theme';

export type CarouselItemProps = {
  index: number;
  pan: Animated.Value;
  children: React.ReactNode;
};

export const CarouselItem = ({children, pan, index}: CarouselItemProps) => {
  return (
    <Animated.View
      style={[
        page.container,
        {
          transform: [
            {
              translateX: pan.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [-50, 0, 50],
              }),
            },
            {
              scale: pan.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0.9, 1, 0.9],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const page = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
