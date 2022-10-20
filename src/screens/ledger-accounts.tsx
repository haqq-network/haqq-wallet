import React, {useCallback, useContext} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LedgerContext} from '../contexts/ledger';
import {LedgerAccounts} from '../components/ledger-accounts';

export const LedgerAccountsScreen = () => {
  const ledgerService = useContext(LedgerContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressAdd = useCallback(
    (address: string) => {
      navigation.navigate('ledgerVerify', {address});
    },
    [navigation],
  );

  return <LedgerAccounts ledgerService={ledgerService} onAdd={onPressAdd} />;
};
