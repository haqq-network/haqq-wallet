import React, {useCallback, useMemo, useRef, useState} from 'react';

import {TotalValueInfo} from '@app/components/total-value-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {
  OnTransactionRowPress,
  TransactionListContract,
  TransactionSource,
} from '@app/types';

export const TotalValueInfoScreen = () => {
  const navigation = useTypedNavigation();
  const wallets = useWalletsVisible();
  const adressList = useMemo(() => Wallet.addressList(), []);
  const transactionsList = useTransactionList(adressList);
  const balances = useWalletsBalance(wallets);
  const stakingBalances = useWalletsStakingBalance(wallets);
  const balance = useMemo(
    () =>
      Object.values(balances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [balances],
  );

  const stakingBalance = useMemo(
    () =>
      Object.values(stakingBalances).reduce(
        (prev, curr) => prev?.operate(curr, 'add'),
        Balance.Empty,
      ) ?? Balance.Empty,
    [stakingBalances],
  );

  const unvestedBalance = useRef(Balance.Empty).current;
  const vestedBalance = useRef(Balance.Empty).current;
  const lockedBalance = useRef(Balance.Empty).current;

  const [contractNameMap, setContractNameMap] = useState({});

  useEffectAsync(async () => {
    const names = transactionsList
      .filter(({source}) => source === TransactionSource.contract)
      .map(item => (item as TransactionListContract).to);
    const uniqueNames = [...new Set(names)];
    const info = await Indexer.instance.getContractNames(uniqueNames);
    setContractNameMap(info);
  }, []);

  const onPressRow: OnTransactionRowPress = useCallback(
    (hash, params) => {
      const screenParams = params || {};
      navigation.navigate('transactionDetail', {
        ...screenParams,
        hash,
      });
    },
    [navigation],
  );

  const onPressInfo = useCallback(() => showModal('lockedTokensInfo'), []);

  if (!wallets?.length) {
    return <Loading />;
  }

  return (
    <TotalValueInfo
      balance={balance}
      lockedBalance={lockedBalance}
      transactionsList={transactionsList}
      stakingBalance={stakingBalance}
      unvestedBalance={unvestedBalance}
      vestedBalance={vestedBalance}
      onPressInfo={onPressInfo}
      onPressRow={onPressRow}
      contractNameMap={contractNameMap}
    />
  );
};
