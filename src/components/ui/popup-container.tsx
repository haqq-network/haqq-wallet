import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const PopupContainer = ({children, style, ...props}: ViewProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={StyleSheet.compose({flex: 1, paddingBottom: insets.bottom}, style)}
      {...props}>
      {children}
    </View>
  );
};
