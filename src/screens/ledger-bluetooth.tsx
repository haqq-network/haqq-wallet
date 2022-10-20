import React, {useCallback, useContext} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useUser} from '../contexts/app';
import {LedgerContext} from '../contexts/ledger';
import {LedgerBluetooth} from '../components/ledger-bluetooth/ledger-bluetooth';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const ledgerService = useContext(LedgerContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onDone = useCallback(async () => {
    navigation.navigate('ledgerScan');
  }, [navigation]);

  const onAllow = useCallback(() => {
    user.bluetooth = true;
  }, [user]);

  return (
    <LedgerBluetooth
      onDone={onDone}
      onAllow={onAllow}
      ledgerService={ledgerService}
      user={user}
    />
  );
};
