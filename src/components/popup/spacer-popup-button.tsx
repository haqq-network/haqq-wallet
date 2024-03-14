import React from 'react';

import {View} from 'react-native';

import {createTheme} from '@app/theme';

export const SpacerPopupButton = () => {
  return <View style={styles.spacer} />;
};

const styles = createTheme({
  spacer: {
    width: 24,
    height: 24,
  },
});
