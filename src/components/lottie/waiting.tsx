import React from 'react';

import {StyleProp, StyleSheet, ViewStyle} from 'react-native';

import {LottieWrap} from './';

type WaitingProps = {
  style?: StyleProp<ViewStyle>;
};

export const Waiting = ({style}: WaitingProps) => {
  return (
    <LottieWrap
      style={[page.container, style]}
      source={require('@assets/animations/waiting.json')}
      autoPlay
      loop
      renderMode="HARDWARE"
    />
  );
};

const page = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
  },
});
