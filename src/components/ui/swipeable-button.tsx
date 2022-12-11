import React, {useCallback} from 'react';

import {Animated, TouchableWithoutFeedback} from 'react-native';

import {createTheme} from '@app/helpers';
import {SwipeableAction} from '@app/types';

type SwipeableButtonProps<T> = SwipeableAction<T> & {
  progress: Animated.AnimatedInterpolation<number>;
  x: number;
  item: T;
};

const AnimatedTouchableWithoutFeedback = Animated.createAnimatedComponent(
  TouchableWithoutFeedback,
);

export const SwipeableButton = ({
  progress,
  x,
  backgroundColor,
  icon,
  item,
  onPress,
}: SwipeableButtonProps<any>) => {
  const iconScale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const buttonPosition = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [x, 0],
    extrapolate: 'clamp',
  });

  const iconTranslationX = iconScale.interpolate({
    inputRange: [0, 1],
    outputRange: [-37, 0],
    extrapolate: 'clamp',
  });

  const pressHandler = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor,
          transform: [{translateX: buttonPosition}],
        },
      ]}>
      <AnimatedTouchableWithoutFeedback
        style={{
          transform: [
            {scale: iconScale},
            {
              translateX: iconTranslationX,
            },
          ],
        }}
        onPress={pressHandler}>
        <Animated.View style={styles.iconContainer}>{icon}</Animated.View>
      </AnimatedTouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = createTheme({
  container: {width: 74},
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
