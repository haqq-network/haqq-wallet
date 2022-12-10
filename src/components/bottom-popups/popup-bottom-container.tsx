import React, {useCallback, useEffect} from 'react';

import {Pressable, StyleSheet, View, useWindowDimensions} from 'react-native';
import Animated, {
  Easing,
  WithTimingConfig,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

const timingOutAnimationConfig: WithTimingConfig = {
  duration: 650,
  easing: Easing.in(Easing.back()),
};

const timingInAnimationConfig: WithTimingConfig = {
  duration: 650,
  easing: Easing.out(Easing.back()),
};

interface BottomPopupContainerProps {
  children: (handleClose: (onEnd?: () => void) => void) => JSX.Element;
  transparent?: boolean;
  onPressOutContent?: () => void;
  closeOnPressOut?: boolean;
}

export const BottomPopupContainer = ({
  children,
  transparent,
  onPressOutContent,
  closeOnPressOut,
}: BottomPopupContainerProps) => {
  const {height: H} = useWindowDimensions();

  const fullyOpen = 0;
  const fullyClosed = H * 0.85;

  const fadeAnim = useSharedValue(fullyClosed);

  const fadeOut = useCallback(
    (endCallback?: () => void) => {
      const onEnd = () => endCallback?.();
      fadeAnim.value = withTiming(fullyClosed, timingOutAnimationConfig, () =>
        runOnJS(onEnd)(),
      );
    },
    [fullyClosed, fadeAnim],
  );

  useEffect(() => {
    fadeAnim.value = withTiming(fullyOpen, timingInAnimationConfig);
  }, [fadeAnim]);

  const bgAnimation = useAnimatedStyle(() => ({
    opacity: interpolate(fadeAnim.value, [fullyOpen, fullyClosed], [1, 0]),
  }));

  const slideFromBottomAnimation = useAnimatedStyle(() => ({
    transform: [{translateY: fadeAnim.value}],
  }));

  const handlePressOut = () => {
    closeOnPressOut && fadeOut(onPressOutContent);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.fullFill, bgAnimation, !transparent && styles.bgColor]}
      />
      <Animated.View style={[styles.animateViewFade, slideFromBottomAnimation]}>
        <Pressable style={styles.fullFill} onPress={handlePressOut} />
        {children(fadeOut)}
      </Animated.View>
    </View>
  );
};

const styles = createTheme({
  container: {flex: 1},
  fullFill: {
    ...StyleSheet.absoluteFillObject,
  },
  bgColor: {
    backgroundColor: Color.bg9,
  },
  animateViewFade: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
