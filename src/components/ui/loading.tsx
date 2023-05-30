import React from 'react';

import {ActivityIndicator, StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';

export interface LoadingProps {
  style?: StyleProp<ViewStyle>;
}

export const Loading = ({style}: LoadingProps) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator color={getColor(Color.graphicGreen1)} />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
