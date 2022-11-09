import React from 'react';

import {StyleSheet, View} from 'react-native';

import {LIGHT_TEXT_BASE_1, LIGHT_TEXT_BASE_2} from '../../variables';
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_1,
  },
  description: {
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
  },
  bold: {
    fontWeight: '700',
  },
});
