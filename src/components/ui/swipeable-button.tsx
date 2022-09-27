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
  });
  const pressHandler = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: backgroundColor,
        transform: [{translateX: translateX}],
      }}>
      <TouchableWithoutFeedback onPress={pressHandler}>
        <View style={page.iconContainer}>{icon}</View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const page = StyleSheet.create({
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
