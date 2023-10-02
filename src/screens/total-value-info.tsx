import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TotalValueInfo} from '@app/components/total-value-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {
  OnTransactionRowPress,
  TransactionListContract,
  TransactionSource,
} from '@app/types';
import {calculateBalances} from '@app/utils';

export const TotalValueInfoScreen = observer(() => {
  const navigation = useTypedNavigation();
  const wallets = Wallet.getAllVisible();
  const adressList = useMemo(() => Wallet.addressList(), []);
  const transactionsList = useTransactionList(adressList);
  const balances = useWalletsBalance(wallets);
  const calculatedBalance = useMemo(
    () => calculateBalances(balances, wallets),
    [balances, wallets],
  );

  const [contractNameMap, setContractNameMap] = useState({});

  useEffectAsync(async () => {
    const names = transactionsList
      .filter(({source}) => source === TransactionSource.contract)
      .map(item => (item as TransactionListContract).to);
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length > 0) {
      const info = await Indexer.instance.getContractNames(uniqueNames);
      setContractNameMap(info);
    }
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
      balance={calculatedBalance}
      transactionsList={transactionsList}
      onPressInfo={onPressInfo}
      onPressRow={onPressRow}
      contractNameMap={contractNameMap}
    />
  );
});
