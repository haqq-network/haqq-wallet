import React from 'react';

import {useHeaderHeight} from '@react-navigation/elements';
import {KeyboardAvoidingView, StyleSheet} from 'react-native';
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
  useKeyboardDismissInBackground();

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
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
