import React from 'react';

import {View} from 'react-native';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {Text} from '../ui';

export const LedgerScanHeader = () => {
  return (
    <View style={styles.container}>
      <Text t9 style={styles.title}>
        Looking for devices
      </Text>
      <Text t14 style={styles.description}>
        Please make sure your Ledger Nano X is{' '}
        <Text clean style={styles.bold}>
          unlocked
        </Text>
        ,{' '}
        <Text clean style={styles.bold}>
          Bluetooth is enabled
        </Text>{' '}
        and{' '}
        <Text clean style={styles.bold}>
          Ethereum app on your Ledger is installed
        </Text>{' '}
        and opened
      </Text>
    </View>
  );
};

const styles = createTheme({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: Color.textBase1,
  },
  description: {
    textAlign: 'center',
    color: Color.textBase2,
  },
  bold: {
    fontWeight: '700',
  },
});
