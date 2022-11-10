import React, {useCallback} from 'react';

import {TransactionResponse} from '@ethersproject/abstract-provider';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {TransactionLedger} from '../components/transaction-ledger';
import {useUser} from '../contexts/app';
import {Transaction} from '../models/transaction';
import {RootStackParamList} from '../types';

export const TransactionLedgerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'transactionConfirmation'>>();
  const user = useUser();

  const onDone = useCallback(
    async (transaction: TransactionResponse) => {
      if (transaction) {
        await Transaction.createTransaction(
          transaction,
          user.providerId,
          route.params.fee,
        );

        navigation.navigate('transactionFinish', {
          hash: transaction.hash,
        });
      }
    },
    [user.providerId, route.params.fee, navigation],
  );

  return (
    <TransactionLedger
      from={route.params.from}
      to={route.params.to}
      amount={route.params.amount}
      onDone={onDone}
    />
  );
};
