import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Waiting} from '../ui';

export type SplashModalProps = {};
export const SplashModal = ({}: SplashModalProps) => {
  return (
    <View style={page.container}>
      <Waiting />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04D484',
  },
});
