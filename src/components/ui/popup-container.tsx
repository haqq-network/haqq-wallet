import React from 'react';

import {ScrollView, ScrollViewProps, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '../../hooks/use-theme';

export type PopupContainerProps = ScrollViewProps;

export const PopupContainer = ({
  children,
  style,
  ...props
}: PopupContainerProps) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
    <ScrollView {...defaultProps} {...props} key={theme}>
      {children}
    </ScrollView>
  );
};
