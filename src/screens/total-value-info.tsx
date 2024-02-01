import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TotalValueInfo} from '@app/components/total-value-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {Indexer} from '@app/services/indexer';
import {
  ModalType,
  OnTransactionRowPress,
  TransactionListContract,
  TransactionSource,
} from '@app/types';
import {calculateBalances} from '@app/utils';

export const TotalValueInfoScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TotalValueInfo
  >();
  const wallets = Wallet.getAllVisible();
  const addressList = useMemo(() => Wallet.addressList(), []);
  const transactionsList = useTransactionList(addressList);
  const balances = useWalletsBalance(wallets);
  const calculatedBalance = useMemo(
    () => calculateBalances(balances, wallets),
    [balances, wallets],
  );

  const [contractNameMap, setContractNameMap] = useState({});

  useEffectAsync(async () => {
    Token.fetchTokens();

    const names = transactionsList
      .filter(({source}) => source === TransactionSource.contract)
      .map(item => (item as TransactionListContract).contractAddress as string);
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length > 0) {
      const info = await Indexer.instance.getContractNames(uniqueNames);
      setContractNameMap(info);
    }
  }, []);

  const onPressRow: OnTransactionRowPress = useCallback(
    (hash, params) => {
      const screenParams = params || {};
      navigation.navigate(HomeStackRoutes.TransactionDetail, {
        ...screenParams,
        hash,
      });
    },
    [navigation],
  );

  const onPressInfo = useCallback(
    () => showModal(ModalType.lockedTokensInfo),
    [],
  );

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
      tokens={Token.tokens}
      initialTab={route?.params?.tab}
    />
  );
});
