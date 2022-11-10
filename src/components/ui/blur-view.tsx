import React from 'react';

import {BlurView as Blur} from '@react-native-community/blur';
import {StyleSheet} from 'react-native';

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
