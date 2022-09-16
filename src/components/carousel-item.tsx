import {Animated} from 'react-native';
import React from 'react';

export type CarouselItemProps = {
  height: number;
  index: number;
  pan: Animated.Value;
  children: React.ReactNode;
};

export const CarouselItem = ({
  children,
  pan,
  height,
  index,
}: CarouselItemProps) => {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 24,
        left: 20,
        opacity: pan.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
        }),
        transform: [
          {
            translateY: pan.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [height * 0.95, 0, height * -0.95],
            }),
          },
          {
            scale: pan.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.9, 1, 0.9],
            }),
          },
        ],
      }}>
      {children}
    </Animated.View>
  );
};
