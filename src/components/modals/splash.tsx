import React from 'react';

import {StatusBar, View} from 'react-native';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {Waiting} from '../ui';

export type SplashModalProps = {};
export const SplashModal = ({}: SplashModalProps) => {
  return (
    <>
      <StatusBar backgroundColor={getColor(Color.graphicGreen2)} />
      <View style={page.container}>
        <Waiting />
      </View>
    </>
  );
};

const page = createTheme({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicGreen2,
  },
});
