import React from 'react';
import Lottie from 'lottie-react-native';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';

type WaitingProps = {
  style?: StyleProp<ViewStyle>;
};

export const Waiting = ({style}: WaitingProps) => {
  return (
    <Lottie
      style={[page.container, style]}
      source={require('../../../assets/animations/waiting.json')}
      autoPlay
      loop={true}
    />
  );
};

const page = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
  },
});
