import React from 'react';
import {StyleSheet} from 'react-native';
import {BlurView as Blur} from '@react-native-community/blur';

type BlurViewProps = {
  action: string;
  cardState: string;
};

export const BlurView = ({action, cardState}: BlurViewProps) => {
  return (
    <Blur
      key={`${action}-${cardState}`}
      blurType="light"
      blurAmount={7}
      style={StyleSheet.absoluteFillObject}
    />
  );
};
