import React, {useCallback, useContext} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {CompositeScreenProps, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LedgerScan} from '../components/ledger-scan';
import {Ledger} from '../services/ledger';
import {Device} from 'react-native-ble-plx';
import {LedgerContext} from '../contexts/ledger';

export type LedgerScanScreen = CompositeScreenProps<any, any> & {
  ledgerService: Ledger;
};

export const LedgerScanScreen = () => {
  const ledgerService = useContext(LedgerContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPress = useCallback(
    (item: Device) => {
      ledgerService.device = item;
      navigation.navigate('ledgerAccounts');
    },
    [ledgerService, navigation],
  );

  return <LedgerScan onSelect={onPress} ledgerService={ledgerService} />;
};
