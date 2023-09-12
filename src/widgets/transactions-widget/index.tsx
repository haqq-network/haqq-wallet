import React, {memo, useCallback, useMemo, useState} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {
  OnTransactionRowPress,
  TransactionListContract,
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
  const [contractNameMap, setContractNameMap] = useState({});

  const openTotalInfo = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, [navigation]);

  const lastThreeTransactions = useMemo<
    (TransactionListSend | TransactionListReceive | TransactionListContract)[]
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
        .slice(0, 3) as (
        | TransactionListSend
        | TransactionListReceive
        | TransactionListContract
      )[],
    [transactions],
  );

  useEffectAsync(async () => {
    const names = lastThreeTransactions
      .filter(({source}) => source === TransactionSource.contract)
      .map(item => (item as TransactionListContract).to);
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length > 0) {
      const info = await Indexer.instance.getContractNames(uniqueNames);
      setContractNameMap(info);
    }
  }, []);

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
      contractNameMap={contractNameMap}
    />
  );
});
