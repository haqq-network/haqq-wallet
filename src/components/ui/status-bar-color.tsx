import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';

import {LIGHT_BG_1} from '../../variables';

export const StatusBarColor = ({backgroundColor = LIGHT_BG_1, ...props}) => {
  return (
    <View style={[page.statusBar, {backgroundColor}]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  );
};

const page = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
  },
});
