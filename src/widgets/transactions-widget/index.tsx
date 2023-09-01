import React, {memo, useCallback, useMemo} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {
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
          [TransactionSource.send, TransactionSource.receive].includes(
            item.source,
          ),
        )
        .slice(0, 3) as (TransactionListSend | TransactionListReceive)[],
    [transactions],
  );

  const onRowPress = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
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
