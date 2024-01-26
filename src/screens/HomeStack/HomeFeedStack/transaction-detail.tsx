import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {format} from 'date-fns';
import {observer} from 'mobx-react';
import {Linking} from 'react-native';

import {TransactionDetail} from '@app/components/transaction-detail';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {getExplorerUrlForTxHash} from '@app/helpers/get-explorer-url-for-tx-hash';
import {IndexerTransactionUtils} from '@app/helpers/indexer-transaction-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useTransaction} from '@app/hooks/use-transaction';
import {I18N} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {splitAddress} from '@app/utils';

export const TransactionDetailScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TransactionDetail
  >();
  const addressList = route.params.addresses;
  const tx = useTransaction(route.params.txId);
  const provider = useMemo(() => app.provider, []);

  const contractName = useMemo(
    () => IndexerTransactionUtils.getContractName(tx),
    [tx],
  );

  const isSent = useMemo(
    () => IndexerTransactionUtils.isOutcomingTx(tx, addressList),
    [tx, addressList],
  );

  const isContract = useMemo(
    () => IndexerTransactionUtils.isContractInteraction(tx),
    [tx],
  );

  const tokenInfo = useMemo(
    () => IndexerTransactionUtils.getTokenInfo(tx),
    [tx],
  );

  const {from, to} = useMemo(
    () => IndexerTransactionUtils.getFromAndTo(tx, addressList),
    [tx, addressList],
  );

  const {title} = useMemo(
    () => IndexerTransactionUtils.getDescription(tx, addressList),
    [tx, addressList],
  );

  const timestamp = useMemo(
    () => format(new Date(tx.ts), 'dd MMMM yyyy, HH:mm'),
    [tx.ts],
  );

  const splitted = useMemo(
    () => splitAddress(isSent ? to : from),
    [from, isSent, to],
  );

  const amount = useMemo(() => IndexerTransactionUtils.getAmount(tx), []);
  const isCosmosTx = useMemo(() => IndexerTransactionUtils.isCosmosTx(tx), []);
  const isEthereumTx = useMemo(
    () => IndexerTransactionUtils.isEthereumTx(tx),
    [],
  );

  const fee = useMemo(() => new Balance(`${tx.fee}`), [tx.fee]);

  const total = useMemo(() => fee.operate(amount, 'add'), [fee, amount]);

  const onPressInfo = useCallback(async () => {
    const url = getExplorerUrlForTxHash(tx?.hash);
    if (url) {
      Linking.openURL(url);
    }
  }, [tx]);

  const onPressAddress = useCallback(() => {
    Clipboard.setString(isSent ? to : from);
    sendNotification(I18N.notificationCopied);
  }, [from, isSent, to]);

  const onCloseBottomSheet = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  if (!tx) {
    return <Loading />;
  }

  Logger.log('tx', JSON.stringify(tx, null, 2));

  return (
    <TransactionDetail
      provider={provider}
      transaction={tx}
      contractName={contractName}
      isSent={isSent}
      isContract={isContract}
      title={title}
      timestamp={timestamp}
      splitted={splitted}
      amount={amount}
      fee={fee}
      total={total}
      isCosmosTx={isCosmosTx}
      isEthereumTx={isEthereumTx}
      tokenInfo={tokenInfo}
      onPressAddress={onPressAddress}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
    />
  );
});
