import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Text} from '../ui';
import {TEXT_BASE_1, TEXT_BASE_2} from '../../variables';
import {Ledger, OnScanEvent} from '../../services/ledger';

export type LedgerScanHeaderProps = {
  ledgerService: Ledger;
};

export const LedgerScanHeader = ({ledgerService}: LedgerScanHeaderProps) => {
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    const subscription = (event: OnScanEvent) => {
      if (event.refreshing) {
        setRefreshing(event.refreshing);
      }
    };

    ledgerService.on('onScan', subscription);
    return () => {
      ledgerService.off('onScan', subscription);
    };
  }, [ledgerService]);

  console.log('refreshing', refreshing);

  return (
    <View style={styles.container}>
      <Text t9 style={styles.title}>
        Looking for devices
      </Text>
      <Text t14 style={styles.description}>
        Please make sure your Ledger Nano X is unlocked, Bluetooth is enabled
        and Ethereum app is installed and opened
      </Text>
      {refreshing && <ActivityIndicator style={styles.activity} />}
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
  activity: {
    marginTop: 45,
  },
});
