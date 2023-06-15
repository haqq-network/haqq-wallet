import React, {useEffect, useMemo} from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Circle, CircleProps} from 'react-native-svg';

import {Color, getColor} from '@app/colors';

export interface CircularProgressProps {
  /**
   * value between 0 and 1
   */
  progress: number;
  size?: number;
  inverted?: boolean;
  dashColor?: Color;
  fillColor?: Color;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  childrenContainerStyle?: StyleProp<ViewStyle>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE_WIDTH = 4;
const ANIMATION_DURATION = 1000;

export const CircularProgress = ({
  inverted,
  children,
  progress = 0,
  size = 220,
  dashColor = Color.graphicSecond2,
  fillColor = Color.graphicBlue1,
  style,
  childrenContainerStyle,
}: CircularProgressProps) => {
  const radius = useMemo(() => size / 2 - STROKE_WIDTH / 2, [size]);
  const dashColorString = useMemo(() => getColor(dashColor), [dashColor]);
  const fillColorString = useMemo(() => getColor(fillColor), [fillColor]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const animatedStrokeDashoffset = useSharedValue(progress);
  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: withTiming(animatedStrokeDashoffset.value, {
        duration: ANIMATION_DURATION,
      }),
    };
  });
  const commonCircleProps: CircleProps = useMemo(
    () => ({
      cy: '50%',
      cx: '50%',
      strokeWidth: STROKE_WIDTH,
      r: radius,
      fill: 'transparent',
    }),
    [radius],
  );
  const containerStyle: ViewStyle = useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  );

  useEffect(() => {
    const formattedProgress = progress > 1 ? 1 : progress < 0 ? 0 : progress;
    const progressOffset = inverted
      ? formattedProgress - 1
      : 1 - formattedProgress;
    const progressStrokeDashoffset = circumference * progressOffset;
    animatedStrokeDashoffset.value = progressStrokeDashoffset;
  }, [progress, animatedStrokeDashoffset, inverted, circumference]);

  return (
    <View style={[containerStyle, styles.container, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          {...commonCircleProps}
          stroke={dashColorString}
          strokeDasharray={'2 6'}
        />
        <AnimatedCircle
          {...commonCircleProps}
          stroke={fillColorString}
          strokeDasharray={`${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap={'round'}
        />
      </Svg>
      <View style={[styles.children, childrenContainerStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {transform: [{rotate: '270deg'}]},
  children: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 1,
  },
});
