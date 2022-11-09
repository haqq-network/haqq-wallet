import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {Device} from 'react-native-ble-plx';
import {RootStackParamList} from '../types';
import {LedgerScan} from '../components/ledger-scan';

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
