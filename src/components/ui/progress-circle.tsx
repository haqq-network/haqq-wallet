import React, {forwardRef, useImperativeHandle} from 'react';

import {View} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';

interface ProgressCircleProps {
  strokeWidth?: number;
  color?: Color;
  children?: React.ReactNode;
}

export interface ProgressCircleInterface {
  animateTo(percent: number): void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressCircle = forwardRef(
  (
    {
      color = Color.graphicGreen1,
      strokeWidth = 2,
      children,
    }: ProgressCircleProps,
    ref,
  ) => {
    const innerRadius = 20 - strokeWidth / 2;
    const circumfrence = 2 * Math.PI * innerRadius;

    useImperativeHandle(ref, () => ({
      animateTo(percent: number) {
        theta.value = (2 * Math.PI * (100 - percent)) / 100;
      },
    }));

    const theta = useSharedValue(2 * Math.PI);

    const animatedProps = useAnimatedProps(() => {
      return {
        strokeDashoffset: withTiming(-theta.value * innerRadius, {
          duration: 1000,
        }),
      };
    });

    return (
      <View style={styles.container}>
        <Svg
          style={styles.svgContainer}
          viewBox="0 0 40 40"
          width={40}
          height={40}>
          <Circle
            cx={20}
            cy={20}
            r={19}
            stroke={getColor(Color.graphicSecond2)}
            strokeWidth={2}
            strokeDasharray="2 4"
          />
          <AnimatedCircle
            animatedProps={animatedProps}
            cx={20}
            cy={20}
            r={innerRadius}
            fill={'transparent'}
            stroke={getColor(color)}
            strokeDasharray={`${circumfrence} ${circumfrence}`}
            strokeWidth={strokeWidth}
            strokeDashoffset={2 * Math.PI * (innerRadius * 0.5)}
            strokeLinecap="round"
          />
        </Svg>
        {children}
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'absolute',
    transform: [{rotate: '-90deg'}],
  },
});
