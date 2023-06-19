import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export const HideModal = () => {
  return (
    <View style={styles.container}>
      <Icon i120 name="logo" color={Color.graphicBase3} />
      <Text color={Color.textBase3} t2 center style={styles.text}>
        HAQQ Wallet
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Color.graphicGreen2,
  },
  text: {
    marginHorizontal: 20,
    marginTop: 24,
  },
});
