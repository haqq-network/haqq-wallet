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
  (props: {plain: true} & ViewProps): JSX.Element;
  (props: ScrollViewProps): JSX.Element;
}

export const PopupContainer: PopupContainerProps = ({
  children,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const propStyle = StyleSheet.compose(
    {flexGrow: 1, paddingBottom: insets.bottom},
    style,
  );

  if ('plain' in props) {
    return (
      <View {...props} style={propStyle}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={propStyle}
      overScrollMode="never"
      bounces={false}
      {...props}>
      {children}
    </ScrollView>
  );
};
