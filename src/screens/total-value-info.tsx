import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {TotalValueInfo} from '@app/components/total-value-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletsAddressList} from '@app/hooks/use-wallets-address-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Token} from '@app/models/tokens';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {ModalType} from '@app/types';
import {calculateBalances} from '@app/utils';

export const TotalValueInfoScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TotalValueInfo
  >();
  const wallets = Wallet.getAllVisible();
  const addressList = useWalletsAddressList();
  const balances = useWalletsBalance(wallets);
  const calculatedBalance = useMemo(
    () => calculateBalances(balances, wallets),
    [balances, wallets],
  );

  const onPressTxRow = useCallback(
    (tx: Transaction) => {
      navigation.navigate(HomeStackRoutes.TransactionDetail, {
        txId: tx.id,
        addresses: addressList,
      });
    },
    [navigation, addressList],
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
      addressList={addressList}
      onPressInfo={onPressInfo}
      onPressTxRow={onPressTxRow}
      tokens={Token.tokens}
      initialTab={route?.params?.tab}
    />
  );
});
