import React from 'react';
import {ScrollView, ScrollViewProps, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const PopupContainer = ({
  children,
  style,
  ...props
}: ScrollViewProps) => {
  const insets = useSafeAreaInsets();

  const propStyle = StyleSheet.compose(
    {flexGrow: 1, paddingBottom: insets.bottom},
    style,
  );
  const defaultProps: ScrollViewProps = {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: propStyle,
    overScrollMode: 'never',
    bounces: false,
  };

  return (
    <ScrollView {...defaultProps} {...props}>
      {children}
    </ScrollView>
  );
};
