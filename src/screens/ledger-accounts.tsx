import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LedgerAccounts} from '../components/ledger-accounts';

export const LedgerAccountsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerAccounts'>>();

  const onPressAdd = useCallback(
    (address: string) => {
      navigation.navigate('ledgerVerify', {
        address,
        deviceId: route.params.deviceId,
        deviceName: route.params.deviceName,
      });
    },
    [navigation, route.params.deviceId, route.params.deviceName],
  );

  return <LedgerAccounts deviceId={route.params.deviceId} onAdd={onPressAdd} />;
};
