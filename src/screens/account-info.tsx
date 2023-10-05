import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {prepareTransactions, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Transaction} from '@app/models/transaction';
import {Indexer} from '@app/services/indexer';
import {TransactionList} from '@app/types';

export const AccountInfoScreen = () => {
  const route = useTypedRoute<'accountInfo'>();
  const navigation = useTypedNavigation();
  const accountId = useMemo(() => route.params.accountId, [route]);
  const wallet = useWallet(accountId);
  const balances = useWalletsBalance([wallet!]);
  const {available, locked, staked, total, unlock, vested} = useMemo(
    () => balances[wallet?.address!],
    [balances, wallet],
  );

  const transactions = useMemo(() => {
    return Transaction.getAllByAccountIdAndProviderId(
      route.params.accountId,
      app.providerId,
    );
  }, [route.params.accountId]);
  const [contractNameMap, setContractNameMap] = useState({});

  useEffectAsync(async () => {
    const names = transactions
      .filter(({input}) => input.includes('0x') && input.length > 2)
      .map(item => item.to);
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length > 0) {
      const info = await Indexer.instance.getContractNames(uniqueNames);
      setContractNameMap(info);
    }
  }, []);

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

  const onReceive = useCallback(() => {
    showModal('cardDetailsQr', {address: route.params.accountId});
  }, [route.params.accountId]);

  const onSend = useCallback(() => {
    navigation.navigate('transaction', {from: route.params.accountId});
  }, [navigation, route.params.accountId]);

  const onPressRow = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
        hash,
      });
    },
    [navigation],
  );

  const onPressInfo = useCallback(() => showModal('lockedTokensInfo'), []);

  useEffect(() => {
    transactions.addListener(onTransactionList);
    return () => {
      transactions.removeListener(onTransactionList);
    };
  }, [onTransactionList, transactions]);

  if (!wallet) {
    return <Loading />;
  }

  return (
    <AccountInfo
      wallet={wallet}
      transactionsList={transactionsList}
      onPressInfo={onPressInfo}
      onReceive={onReceive}
      onSend={onSend}
      onPressRow={onPressRow}
      contractNameMap={contractNameMap}
      available={available}
      locked={locked}
      staked={staked}
      total={total}
      unlock={unlock}
      vested={vested}
    />
  );
};
