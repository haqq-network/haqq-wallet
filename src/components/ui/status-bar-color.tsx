import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';

import {BG_1} from '../../variables';

export const StatusBarColor = ({backgroundColor = BG_1, ...props}) => {
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
