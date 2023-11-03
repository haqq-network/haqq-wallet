import React, {memo} from 'react';

import {Platform, StyleSheet, View} from 'react-native';
import {FullWindowOverlay} from 'react-native-screens';

type Props = {
  children: React.ReactNode;
};

export const ModalProvider = memo(({children}: Props) => {
  if (Platform.OS === 'ios') {
    return <FullWindowOverlay>{children}</FullWindowOverlay>;
  }
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
});
