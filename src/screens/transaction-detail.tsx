import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionDetail} from '@app/components/transaction-detail';
import {openURL} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider} from '@app/models/provider';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {TransactionSource} from '@app/types';

export const TransactionDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionDetail'>();

  const [transaction, setTransaction] = useState<Transaction | null>(
    Transaction.getById(route.params.hash),
  );

  const source = useMemo(() => {
    const visible = Wallet.getAllVisible().map(w => w.address);

    return visible.includes(transaction?.from.toLowerCase() ?? '')
      ? TransactionSource.send
      : TransactionSource.receive;
  }, [transaction]);

  const provider = useMemo(
    () => (transaction ? Provider.getProvider(transaction.providerId) : null),
    [transaction],
  );

  useEffect(() => {
    setTransaction(Transaction.getById(route.params.hash));
  }, [route.params.hash]);

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
      source={source}
      provider={provider}
      transaction={transaction}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
    />
  );
};
