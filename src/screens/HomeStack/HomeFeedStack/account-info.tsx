import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWallet} from '@app/hooks/use-wallet';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Token} from '@app/models/tokens';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {IndexerTransaction, ModalType} from '@app/types';

export const AccountInfoScreen = observer(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.AccountInfo
  >();
  const navigation = useTypedNavigation<HomeStackParamList>();
  const accountId = useMemo(() => route.params.accountId, [route]);
  const wallet = useWallet(accountId);
  const balances = useWalletsBalance([wallet!]);
  const {available, locked, staked, total, unlock, vested} = useMemo(
    () => balances[wallet?.address!],
    [balances, wallet],
  );

  const onReceive = useCallback(() => {
    showModal(ModalType.cardDetailsQr, {address: route.params.accountId});
  }, [route.params.accountId]);

  const onSend = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Transaction, {
      from: route.params.accountId,
    });
  }, [navigation, route.params.accountId]);

  const onPressTxRow = useCallback(
    (tx: IndexerTransaction) => {
      navigation.navigate(HomeStackRoutes.TransactionDetail, {
        txId: tx.id,
        addresses: [accountId],
      });
    },
    [navigation, accountId],
  );

  const onPressInfo = useCallback(
    () => showModal(ModalType.lockedTokensInfo),
    [],
  );

  if (!wallet) {
    return <Loading />;
  }

  return (
    <AccountInfo
      wallet={wallet}
      onPressInfo={onPressInfo}
      onReceive={onReceive}
      onSend={onSend}
      onPressTxRow={onPressTxRow}
      available={available}
      locked={locked}
      staked={staked}
      total={total}
      unlock={unlock}
      vested={vested}
      tokens={Token.tokens}
    />
  );
});
