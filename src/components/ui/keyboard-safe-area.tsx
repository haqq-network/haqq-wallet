import React from 'react';

import {useHeaderHeight} from '@react-navigation/elements';
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
  const header = useHeaderHeight();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({
        android: header + 47,
        ios: insets.top + header,
      })}
      style={StyleSheet.compose({flex: 1, marginBottom: insets.bottom}, style)}
      {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};
