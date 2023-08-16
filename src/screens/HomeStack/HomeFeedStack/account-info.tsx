import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {prepareTransactions, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {TransactionList} from '@app/types';

export const AccountInfoScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.AccountInfo
  >();
  const navigation = useTypedNavigation<HomeStackParamList>();
  const wallet = useWallet(route.params.accountId);
  const [balance, setBalance] = useState(
    app.getBalance(route.params.accountId),
  );

  const transactions = useMemo(() => {
    return Transaction.getAllByAccountIdAndProviderId(
      route.params.accountId,
      app.providerId,
    );
  }, [route.params.accountId]);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions([route.params.accountId], transactions.snapshot()),
  );

  const onTransactionList = useCallback(
    (collection: Collection<Transaction>, changes: CollectionChangeSet) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setTransactionsList(
          prepareTransactions(
            [route.params.accountId],
            transactions.snapshot(),
          ),
        );
      }
    },
    [route.params.accountId, transactions],
  );

  useEffect(() => {
    transactions.addListener(onTransactionList);
    return () => {
      transactions.removeListener(onTransactionList);
    };
  }, [onTransactionList, transactions]);

  useEffect(() => {
    const onBalance = () => {
      setBalance(app.getBalance(route.params.accountId));
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [route.params.accountId]);

  const onReceive = useCallback(() => {
    showModal('cardDetailsQr', {address: route.params.accountId});
  }, [route.params.accountId]);

  const onSend = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Transaction, {
      from: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  const onPressRow = useCallback(
    (hash: string) => {
      navigation.navigate(HomeStackRoutes.TransactionDetail, {
        hash,
      });
    },
    [navigation],
  );

  if (!wallet) {
    return <Loading />;
  }

  return (
    <AccountInfo
      wallet={wallet}
      balance={balance}
      onReceive={onReceive}
      onSend={onSend}
      transactionsList={transactionsList}
      onPressRow={onPressRow}
    />
  );
});
