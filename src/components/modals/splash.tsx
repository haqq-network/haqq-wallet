import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Waiting} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useAndroidSystemColors} from '@app/hooks';

export type SplashModalProps = {};

export const SplashModal = ({}: SplashModalProps) => {
  useAndroidSystemColors();

  return (
    <View style={styles.container}>
      <Waiting />
    </View>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicGreen2,
  },
});
