import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Device} from 'react-native-ble-plx';

import {LedgerScan} from '../components/ledger-scan';
import {RootStackParamList} from '../types';

export const LedgerScanScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPress = useCallback(
    (item: Device) => {
      navigation.navigate('ledgerAccounts', {
        deviceId: item.id,
        deviceName: `Ledger ${item.name}`,
      });
    },
    [navigation],
  );

  return <LedgerScan onSelect={onPress} />;
};
