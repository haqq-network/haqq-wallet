import React, {useCallback, useEffect, useRef} from 'react';

import {Animated} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';

import {SwipeableButtonList} from '@app/components/swipeable-button-list';
import {SwipeableAction} from '@app/types';

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

  const renderRightActions = useCallback(
    (progress: Animated.AnimatedInterpolation<number>) => {
      return (
        <SwipeableButtonList
          item={item}
          rightActions={rightActions}
          progress={progress}
        />
      );
    },
    [item, rightActions],
  );

  return (
    <Swipeable ref={ref} renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};
