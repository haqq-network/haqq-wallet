import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface PopupContainerProps {
  scrollEnabled?: boolean;
}

export const PopupContainer = ({
  children,
  style,
  scrollEnabled,
  ...props
}: ViewProps & PopupContainerProps) => {
  const insets = useSafeAreaInsets();
  const Component = scrollEnabled ? ScrollView : View;

  const propStyle = StyleSheet.compose(
    {flex: 1, paddingBottom: insets.bottom},
    style,
  );

  const defaultViewProps: ViewProps = {
    style: propStyle,
  };
  const defaultScrollViewProps: ScrollViewProps = {
    showsVerticalScrollIndicator: false,
    contentContainerStyle: propStyle,
  };

  const defaultProps = scrollEnabled
    ? defaultScrollViewProps
    : defaultViewProps;

  return (
    <Component {...defaultProps} {...props}>
      {children}
    </Component>
  );
};
