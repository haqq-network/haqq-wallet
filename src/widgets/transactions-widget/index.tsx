import React, {memo, useCallback, useMemo} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {
  OnTransactionRowPress,
  TransactionListReceive,
  TransactionListSend,
  TransactionSource,
} from '@app/types';
import {TransactionsWidget} from '@app/widgets/transactions-widget/transactions-widget';

export const TransactionsWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();
  const wallets = useMemo(() => Wallet.getAll(), []);
  const adressList = Wallet.addressList();
  const transactions = useTransactionList(adressList);

  const openTotalInfo = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, [navigation]);

  const lastThreeTransactions = useMemo<
    (TransactionListSend | TransactionListReceive)[]
  >(
    () =>
      transactions
        .filter(item =>
          [
            TransactionSource.send,
            TransactionSource.receive,
            TransactionSource.contract,
          ].includes(item.source),
        )
        .slice(0, 3) as (TransactionListSend | TransactionListReceive)[],
    [transactions],
  );

  const onRowPress: OnTransactionRowPress = useCallback(
    (hash, params) => {
      const screenParams = params || {};
      navigation.navigate('transactionDetail', {
        ...screenParams,
        hash,
      });
    },
    [navigation],
  );

  return (
    <TransactionsWidget
      onPress={openTotalInfo}
      lastTransactions={lastThreeTransactions}
      onRowPress={onRowPress}
      wallets={wallets}
    />
  );
});
