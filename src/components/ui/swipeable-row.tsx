import React, {useEffect, useMemo, useRef} from 'react';

import {Animated, StyleSheet, View} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';

import {SwipeableButton} from './swipeable-button';

import {SwipeableAction} from '../../types';

export type SwipeableRowProps<T> = {
  children: React.ReactNode;
  item: T;
  rightActions: SwipeableAction<T>[];
};

export const SwipeableRow = ({
  children,
  item,
  rightActions,
}: SwipeableRowProps<any>) => {
  const ref = useRef<Swipeable>(null);

  useEffect(() => {
    ref.current?.close();
  }, [item]);

  const rActions = useMemo(
    () => (progress: Animated.AnimatedInterpolation<number>) =>
      (
        <View style={[page.container, {width: rightActions.length * 74}]}>
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
      ),
    [item, rightActions],
  );

  return (
    <Swipeable ref={ref} renderRightActions={rActions}>
      {children}
    </Swipeable>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});
