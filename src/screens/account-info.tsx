import React, {useCallback, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {ModalType} from '@app/types';

export const AccountInfoScreen = observer(() => {
  const route = useTypedRoute<'accountInfo'>();
  const navigation = useTypedNavigation();
  const accountId = useMemo(() => route.params.accountId, [route]);
  const wallet = Wallet.getById(accountId);
  const balances = useWalletsBalance([wallet!]);
  const {available, locked, staked, total, unlock, vested} = useMemo(
    () => balances[wallet?.address!],
    [balances, wallet],
  );
  const transactionList = useTransactionList([accountId]);

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

  const onReceive = useCallback(() => {
    showModal(ModalType.cardDetailsQr, {address: route.params.accountId});
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
      transactionsList={transactionList}
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
});
