import React, {memo} from 'react';

import {StyleSheet, View} from 'react-native';
import {FullWindowOverlay} from 'react-native-screens';

import {IS_IOS} from '@app/variables/common';

type Props = {
  children: React.ReactNode;
};

export const ModalProvider = memo(({children}: Props) => {
  if (IS_IOS) {
    return <FullWindowOverlay>{children}</FullWindowOverlay>;
  }
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
});
