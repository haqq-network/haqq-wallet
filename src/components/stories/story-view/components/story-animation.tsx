import React, {FC, memo} from 'react';

import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from '@override/react-native-reanimated';
import {Platform, StyleSheet} from 'react-native';

import {createTheme} from '@app/helpers';

import {HEIGHT, WIDTH} from '../core/constants';
import {AnimationProps} from '../core/dto/componentsDTO';

const StoryAnimation: FC<AnimationProps> = memo(({children, x, index}) => {
  const angle = Math.PI / 3;
  const ratio = Platform.OS === 'ios' ? 2 : 1.2;
  const offset = WIDTH * index;
  const inputRange = [offset - WIDTH, offset + WIDTH];
  const maskInputRange = [offset - WIDTH, offset, offset + WIDTH];

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      x.value,
      inputRange,
      [WIDTH / ratio, -WIDTH / ratio],
      Extrapolation.CLAMP,
    );

    const rotateY = interpolate(
      x.value,
      inputRange,
      [angle, -angle],
      Extrapolation.CLAMP,
    );

    const alpha = Math.abs(rotateY);
    const gamma = angle - alpha;
    const beta = Math.PI - alpha - gamma;
    const w = WIDTH / 2 - (WIDTH / 2) * (Math.sin(gamma) / Math.sin(beta));
    const translateX1 = rotateY > 0 ? w : -w;
    const left =
      Platform.OS === 'android'
        ? interpolate(
            rotateY,
            [-angle, -angle + 0.1, 0, angle - 0.1, angle],
            [0, 20, 0, -20, 0],
            Extrapolation.CLAMP,
          )
        : 0;

    return {
      transform: [
        {perspective: WIDTH},
        {translateX},
        {rotateY: `${rotateY}rad`},
        {translateX: translateX1},
      ],
      left,
    };
  });

  const maskAnimatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      x.value,
      maskInputRange,
      [0.5, 0, 0.5],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[animatedStyle, StyleSheet.absoluteFill, styles.cube]}>
      {children}
      <Animated.View
        style={[
          maskAnimatedStyles,
          styles.absolute,
          {width: WIDTH, height: HEIGHT},
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
});

const styles = createTheme({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cube: {
    justifyContent: 'center',
  },
});

export {StoryAnimation};
