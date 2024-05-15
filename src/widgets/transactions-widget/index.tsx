import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {TotalValueTabNames} from '@app/components/total-value-info';
import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsAddressList} from '@app/hooks/use-wallets-address-list';
import {HomeStackRoutes} from '@app/route-types';
import {IndexerTransaction} from '@app/types';
import {TransactionsWidget} from '@app/widgets/transactions-widget/transactions-widget';

export const TransactionsWidgetWrapper = observer(() => {
  const navigation = useTypedNavigation();
  const addressList = useWalletsAddressList();
  const {transactions, isTransactionsLoading} = useTransactionList(addressList);

  const lastThreeTransactions = useMemo(
    () => transactions.slice(0, 3),
    [transactions[0]?.hash],
  );

  const openTotalInfo = useCallback(() => {
    navigation.navigate(HomeStackRoutes.TotalValueInfo, {
      tab: TotalValueTabNames.transactions,
    });
  }, [navigation]);

  const onRowPress = useCallback(
    (tx: IndexerTransaction) => {
      navigation.navigate(HomeStackRoutes.TransactionDetail, {
        txId: tx.id,
        addresses: addressList,
      });
    },
    [navigation, addressList],
  );

  return (
    <TransactionsWidget
      addressList={addressList}
      lastTransactions={lastThreeTransactions}
      isTransactionsLoading={isTransactionsLoading}
      onPress={openTotalInfo}
      onRowPress={onRowPress}
    />
  );
});
