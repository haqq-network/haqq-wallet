import React from 'react';

import {StatusBar, StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';

export const StatusBarColor = ({
  backgroundColor = getColor(Color.bg1),
  ...props
}) => {
  return (
    <View style={[styles.statusBar, {backgroundColor}]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
  },
});
