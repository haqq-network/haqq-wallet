import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionDetail} from '@app/components/transaction-detail';
import {openURL} from '@app/helpers';
import {useTransactions, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';

export const TransactionDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionDetail'>();

  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(route.params.hash),
  );

  const provider = useMemo(
    () => (transaction ? Provider.getProvider(transaction.providerId) : null),
    [transaction],
  );

  useEffect(() => {
    setTransaction(transactions.getTransaction(route.params.hash));
  }, [route.params.hash, transactions]);

  const onPressInfo = useCallback(async () => {
    try {
      const url = `${EthNetwork.explorer}tx/${transaction?.hash}`;
      await openURL(url);
    } catch (_e) {}
  }, [transaction?.hash]);

  if (!transaction) {
    return null;
  }

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  return (
    <TransactionDetail
      provider={provider}
      transaction={transaction}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
    />
  );
};
