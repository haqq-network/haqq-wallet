import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LedgerScan} from '../components/ledger-scan';
import {Device} from 'react-native-ble-plx';

export const LedgerScanScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPress = useCallback(
    (item: Device) => {
      navigation.navigate('ledgerAccounts', {
        deviceId: item.id,
        deviceName: item.name ?? '',
      });
    },
    [navigation],
  );

  return <LedgerScan onSelect={onPress} />;
};
