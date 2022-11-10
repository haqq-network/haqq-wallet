import React from 'react';

import {StatusBar, StyleSheet, View} from 'react-native';

import {GRAPHIC_GREEN_2} from '../../variables';
import {Waiting} from '../ui';

export type SplashModalProps = {};
export const SplashModal = ({}: SplashModalProps) => {
  return (
    <>
      <StatusBar backgroundColor={GRAPHIC_GREEN_2} />
      <View style={page.container}>
        <Waiting />
      </View>
    </>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GRAPHIC_GREEN_2,
  },
});
