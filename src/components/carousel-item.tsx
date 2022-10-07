import React from 'react';

import {StyleSheet, Animated} from 'react-native';

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

const page = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
