import React from 'react';

import {ActivityIndicator, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';

export const Loading = () => {
  return (
    <View style={styles.container}>
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
