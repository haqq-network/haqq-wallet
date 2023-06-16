import React from 'react';

import {StyleSheet} from 'react-native';
import Animated, {SlideInDown, SlideOutUp} from 'react-native-reanimated';

export interface ModalPops {
  children: React.ReactNode;
  visible: boolean;
}

export const Modal = ({children, visible}: ModalPops) => {
  return (
    <>
      {visible && (
        <Animated.View
          style={StyleSheet.absoluteFillObject}
          entering={SlideInDown}
          exiting={SlideOutUp}>
          {children}
        </Animated.View>
      )}
    </>
  );
};
