import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {prepareTransactions, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {useWalletsVestingBalance} from '@app/hooks/use-wallets-vesting-balance';
import {Transaction} from '@app/models/transaction';
import {VestingMetadataType} from '@app/models/vesting-metadata';
import {TransactionList} from '@app/types';

export const AccountInfoScreen = () => {
  const route = useTypedRoute<'accountInfo'>();
  const [showLockedTokensInfo, setShowLockedTokensInfo] = useState(false);
  const navigation = useTypedNavigation();
  const wallet = useWallet(route.params.accountId);
  const balances = useWalletsBalance([wallet!]);
  const vestingBalances = useWalletsVestingBalance([wallet!]);
  const stakingBalances = useWalletsStakingBalance([wallet!]);
  const currentBalance = useMemo(
    () => balances[wallet?.address!],
    [balances, wallet?.address],
  );
  const currentVestingBalance = useMemo(
    () => vestingBalances[wallet?.address!],
    [vestingBalances, wallet?.address],
  );

  const unvestedBalance = useMemo(
    () => currentVestingBalance?.[VestingMetadataType.unvested],
    [currentVestingBalance],
  );

  const lockedBalance = useMemo(
    () => currentVestingBalance?.[VestingMetadataType.locked],

    [currentVestingBalance],
  );

  const vestedBalance = useMemo(
    () => currentVestingBalance?.[VestingMetadataType.vested],
    [currentVestingBalance],
  );

  const stakingBalance = useMemo(
    () => stakingBalances?.[wallet?.address!],
    [stakingBalances, wallet?.address],
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

  const onPressInfo = useCallback(() => {
    setShowLockedTokensInfo(v => !v);
  }, []);

  const onCloseLockedTokensInfo = useCallback(() => {
    setShowLockedTokensInfo(false);
  }, []);

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
      balance={currentBalance}
      transactionsList={transactionsList}
      unvestedBalance={unvestedBalance}
      lockedBalance={lockedBalance}
      vestedBalance={vestedBalance}
      stakingBalance={stakingBalance}
      showLockedTokensInfo={showLockedTokensInfo}
      onCloseLockedTokensInfo={onCloseLockedTokensInfo}
      onPressInfo={onPressInfo}
      onReceive={onReceive}
      onSend={onSend}
      onPressRow={onPressRow}
    />
  );
};
