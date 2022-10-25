import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useUser} from '../contexts/app';
import {LedgerBluetooth} from '../components/ledger-bluetooth/ledger-bluetooth';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onDone = useCallback(async () => {
    user.bluetooth = true;
    navigation.navigate('ledgerScan');
  }, [navigation, user]);

  return <LedgerBluetooth onDone={onDone} user={user} />;
};
