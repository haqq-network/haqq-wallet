import React from 'react';

import {StyleSheet, View} from 'react-native';

export interface ModalPops {
  children: React.ReactNode;
  visible: boolean;
}

export const Modal = ({children, visible}: ModalPops) => {
  if (visible) {
    return <View style={StyleSheet.absoluteFillObject}>{children}</View>;
  }
  return null;
};
