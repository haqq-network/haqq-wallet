import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {LedgerBluetooth} from '../components/ledger-bluetooth';
import {useUser} from '../hooks/use-user';
import {RootStackParamList} from '../types';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onDone = useCallback(async () => {
    user.bluetooth = true;
    navigation.navigate('ledgerScan');
  }, [navigation, user]);

  return <LedgerBluetooth onDone={onDone} user={user} />;
};
