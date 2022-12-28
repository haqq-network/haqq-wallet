import React from 'react';

import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useTheme} from '@app/hooks';

export const Loading = () => {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.graphicGreen1} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
