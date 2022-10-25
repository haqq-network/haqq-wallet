import React, {useCallback, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {useUser} from '../contexts/app';
import {LedgerBluetooth} from '../components/ledger-bluetooth/ledger-bluetooth';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [checked, setChecked] = useState(false);

  const onDone = useCallback(async () => {
    if (!checked) {
      user.bluetooth = true;
      navigation.navigate('ledgerScan');

      setChecked(true);
    }
  }, [checked, navigation, user]);

  return <LedgerBluetooth onDone={onDone} user={user} />;
};
