import React from 'react';

import {Animated, View} from 'react-native';

import {SwipeableButton} from '@app/components/ui/swipeable-button';
import {createTheme} from '@app/helpers';
import {SwipeableAction} from '@app/types';

export type SwipeableButtonListProps<T> = {
  rightActions: SwipeableAction<T>[];
  progress: Animated.AnimatedInterpolation<number>;
  item: T;
};

export const SwipeableButtonList = ({
  rightActions,
  progress,
  item,
}: SwipeableButtonListProps<any>) => {
  return (
    <View style={[styles.container, {width: rightActions.length * 74}]}>
      {rightActions.map((action, i) => (
        <SwipeableButton
          backgroundColor={action.backgroundColor}
          progress={progress}
          x={(rightActions.length - i) * 74}
          key={action.key}
          item={item}
          icon={action.icon}
          onPress={action.onPress}
        />
      ))}
    </View>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
  },
});
