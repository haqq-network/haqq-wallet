import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {Waiting} from '@app/components/ui';
import {useAndroidSystemColors, useThematicStyles} from '@app/hooks';

export type SplashModalProps = {};

export const SplashModal = ({}: SplashModalProps) => {
  useAndroidSystemColors();
  const styles = useThematicStyles(stylesObj);
  return (
    <View style={styles.container}>
      <Waiting />
    </View>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicGreen2,
  },
});
