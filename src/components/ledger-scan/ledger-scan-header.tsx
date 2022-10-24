import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from '../ui';
import {TEXT_BASE_1, TEXT_BASE_2} from '../../variables';

export const LedgerScanHeader = () => {
  return (
    <View style={styles.container}>
      <Text t9 style={styles.title}>
        Looking for devices
      </Text>
      <Text t14 style={styles.description}>
        Please make sure your Ledger Nano X is unlocked, Bluetooth is enabled
        and Ethereum app is installed and opened
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
    color: TEXT_BASE_1,
  },
  description: {
    textAlign: 'center',
    color: TEXT_BASE_2,
  },
});
