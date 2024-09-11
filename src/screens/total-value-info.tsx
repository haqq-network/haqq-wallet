import React, {useCallback, useEffect, useMemo} from 'react';

import {toJS} from 'mobx';
import {observer} from 'mobx-react';

import {TotalValueInfo} from '@app/components/total-value-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletsAddressList} from '@app/hooks/use-wallets-address-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N, getText} from '@app/i18n';
import {Token} from '@app/models/tokens';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {
  HomeStackParamList,
  HomeStackRoutes,
  TransactionStackRoutes,
} from '@app/route-types';
import {IToken, ModalType} from '@app/types';
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

  useEffect(() => {
    navigation.setOptions({
      title: getText(I18N.lockedTokensTotalValue),
    });
  }, [navigation]);

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

  const onPressToken = useCallback(
    (w: Wallet, token: IToken) => {
      navigation.navigate(HomeStackRoutes.Transaction, {
        // @ts-ignore
        screen: TransactionStackRoutes.TransactionAddress,
        params: {
          token: toJS(token),
          from: w.address!,
        },
      });
    },
    [navigation],
  );

  if (!wallets?.length) {
    return <Loading />;
  }

  return (
    <TotalValueInfo
      balance={calculatedBalance}
      addressList={addressList}
      tokens={Token.tokens}
      initialTab={route?.params?.tab}
      onPressInfo={onPressInfo}
      onPressTxRow={onPressTxRow}
      onPressToken={onPressToken}
    />
  );
});
