import React from 'react';

import {StatusBar, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {useTheme} from '@app/hooks';

export function StatusBarColor({backgroundColor = Color.bg1, ...props}) {
  const {colors, isDark} = useTheme();

  return (
    <View
      style={[styles.statusBar, {backgroundColor: colors[backgroundColor]}]}>
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors[backgroundColor]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    height: StatusBar.currentHeight,
  },
});
