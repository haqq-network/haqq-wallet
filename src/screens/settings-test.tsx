import React from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

export const SettingsTestScreen = () => {
  return (
    <View>
      <Image source={{uri: 'staking'}} style={styles.icon1} />
      <Image source={{uri: 'staking'}} style={styles.icon2} />
    </View>
  );
};

const styles = createTheme({
  icon1: {
    width: 24,
    height: 24,
    tintColor: Color.graphicBase1,
    backgroundColor: 'tomato',
  },
  icon2: {
    width: 32,
    height: 32,
    tintColor: Color.graphicGreen1,
    backgroundColor: 'green',
  },
});
