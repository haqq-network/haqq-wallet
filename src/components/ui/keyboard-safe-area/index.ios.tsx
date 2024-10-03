import React, {useCallback, useRef} from 'react';

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
  ...props
}: KeyboardSafeAreaProps) => {
  const header = useHeaderHeight();
  const {bottom, top} = useSafeAreaInsets();
  const prevHeight = useRef(0);
  useKeyboardDismissInBackground();

  useFocusEffect(
    useCallback(() => {
      const keyboardWillShowSub = Keyboard.addListener(
        'keyboardDidShow',
        ({endCoordinates: {height}}) => {
          if (props.sharedValue) {
            prevHeight.current =
              Math.max(height, prevHeight.current) > 0
                ? Math.max(height, prevHeight.current)
                : height;
            props.sharedValue &&
              (props.sharedValue.value = withTiming(
                prevHeight.current - bottom,
                {
                  duration: 50,
                },
              ));
          }
        },
      );
      const keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', () => {
        props.sharedValue &&
          (props.sharedValue.value = withTiming(0, {duration: 70}));
      });
      return () => {
        keyboardWillShowSub.remove();
        keyboardDidHideSub.remove();
        props.sharedValue && (props.sharedValue.value = 0);
      };
    }, [props.sharedValue, bottom]),
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={top + header}
      style={[styles.flexOne, {marginBottom: bottom}, style]}
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
