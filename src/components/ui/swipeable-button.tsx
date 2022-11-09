import React, {useCallback} from 'react';

import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {SwipeableAction} from '../../types';

type SwipeableButtonProps<T> = SwipeableAction<T> & {
  progress: Animated.AnimatedInterpolation;
  x: number;
  item: T;
};

export const SwipeableButton = ({
  progress,
  x,
  backgroundColor,
  icon,
  item,
  onPress,
}: SwipeableButtonProps<any>) => {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [x, 0],
    extrapolate: 'clamp',
  });

  const pressHandler = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Animated.View
      style={[
        page.container,
        {
          backgroundColor: backgroundColor,
          transform: [{translateX: translateX}],
        },
      ]}>
      <TouchableWithoutFeedback onPress={pressHandler}>
        <View style={page.iconContainer}>{icon}</View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const page = StyleSheet.create({
  container: {width: 74},
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
