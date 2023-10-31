import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

export type MulticlickTouchableProps = {
  numberOfClicks: number;
  resetTimeout: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onAction(): void;
  onChangeClickCount?(count: number): void;
};

export function MulticlickTouchable({
  numberOfClicks,
  resetTimeout,
  children,
  style,
  onAction,
  onChangeClickCount,
}: MulticlickTouchableProps) {
  const [_, setCount] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handlePress = useCallback(() => {
    setCount(prevCount => {
      const newCount = prevCount + 1;
      onChangeClickCount?.(newCount);

      if (newCount === numberOfClicks) {
        onAction();
        return 0;
      }

      return newCount;
    });

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setCount(0);
    }, resetTimeout);
  }, [numberOfClicks, onChangeClickCount, onAction, resetTimeout]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <TouchableWithoutFeedback style={style} onPress={handlePress}>
      <View>{children}</View>
    </TouchableWithoutFeedback>
  );
}
