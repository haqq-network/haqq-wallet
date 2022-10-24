import React from 'react';
import {StyleSheet, Platform, View, StatusBar} from 'react-native';

import {BG_1} from '../../variables';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

export const StatusBarColor = ({backgroundColor = BG_1, ...props}) => (
  <View style={[page.statusBar, {backgroundColor}]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

const page = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});
