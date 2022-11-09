import React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewProps,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type KeyboardSafeAreaProps = ViewProps & {};

export const KeyboardSafeArea = ({
  children,
  style,
  ...props
}: KeyboardSafeAreaProps) => {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({
        android: 75,
        ios: insets.top + 66,
      })}
      style={StyleSheet.compose({flex: 1, marginBottom: insets.bottom}, style)}
      {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};
