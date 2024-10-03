import React, {useCallback, useMemo, useRef} from 'react';

import {useHeaderHeight} from '@react-navigation/elements';
import {useFocusEffect} from '@react-navigation/native';
import {Keyboard, KeyboardAvoidingView, StyleSheet} from 'react-native';
import {withTiming} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useKeyboardDismissInBackground} from '@app/hooks';

import {KeyboardSafeAreaProps} from '.';

export const KeyboardSafeArea = ({
  children,
  style,
  withBottom = true,
  sharedValue,
  ...props
}: KeyboardSafeAreaProps) => {
  const header = useHeaderHeight();
  const {bottom, top} = useSafeAreaInsets();
  const prevHeight = useRef(0);
  useKeyboardDismissInBackground();

  const marginBottom = useMemo(
    () => (withBottom ? bottom : 0),
    [withBottom, bottom],
  );

  useFocusEffect(
    useCallback(() => {
      const keyboardWillShowSub = Keyboard.addListener(
        'keyboardDidShow',
        ({endCoordinates: {height}}) => {
          if (sharedValue) {
            prevHeight.current =
              Math.max(height, prevHeight.current) > 0
                ? Math.max(height, prevHeight.current)
                : height;
            sharedValue &&
              (sharedValue.value = withTiming(prevHeight.current - bottom, {
                duration: 50,
              }));
          }
        },
      );
      const keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', () => {
        sharedValue && (sharedValue.value = withTiming(0, {duration: 70}));
      });
      return () => {
        keyboardWillShowSub.remove();
        keyboardDidHideSub.remove();
        sharedValue && (sharedValue.value = 0);
      };
    }, [sharedValue, bottom]),
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={top + header}
      style={[styles.flexOne, {marginBottom}, style]}
      {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
});
