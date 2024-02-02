import React, {useCallback, useEffect, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {format} from 'date-fns';
import {observer} from 'mobx-react';
import {Linking} from 'react-native';

import {TransactionDetail} from '@app/components/transaction-detail';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {getExplorerUrlForTxHash} from '@app/helpers/get-explorer-url-for-tx-hash';
import {IndexerTransactionUtils} from '@app/helpers/indexer-transaction-utils';
import {shortAddress} from '@app/helpers/short-address';
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
    () => !IndexerTransactionUtils.isIncomingTx(tx, addressList),
    [tx, addressList],
  );

  const isContract = useMemo(
    () => IndexerTransactionUtils.isContractInteraction(tx),
    [tx],
  );

  const tokensInfo = useMemo(
    () => IndexerTransactionUtils.getTokensInfo(tx),
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

  // TODO: fix calculation of total amount
  // const total = useMemo(() => fee.operate(amount, 'add'), [fee, amount]);
  const total = useMemo(() => Balance.Empty, []);

  const isErc20TransferTx = useMemo(
    () => IndexerTransactionUtils.isErc20TransferTx(tx),
    [tx],
  );

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

  const erc20InputDataJson = useMemo(
    () => IndexerTransactionUtils.getErc20InputDataJson(tx),
    [tx],
  );

  useEffect(() => {
    if (app.isTesterMode || app.isDeveloper) {
      Logger.log(
        '===================== [ TRANSACTION DETAILS ] =====================',
      );
      Logger.log(
        '🟢 tx',
        shortAddress(tx.hash, '*'),
        JSON.stringify(tx, null, 2),
      );
      Logger.log(
        '🟢 tx parsed props',
        JSON.stringify(
          {
            contractName,
            isSent,
            isContract,
            title,
            timestamp,
            splitted,
            amount,
            fee,
            total,
            isCosmosTx,
            isEthereumTx,
            tokensInfo,
            isErc20TransferTx,
            erc20InputDataJson,
            from,
            to,
          },
          null,
          2,
        ),
      );
    }
  }, [tx]);

  if (!tx) {
    return <Loading />;
  }

  return (
    <TransactionDetail
      provider={provider}
      tx={tx}
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
      tokensInfo={tokensInfo}
      isErc20TransferTx={isErc20TransferTx}
      erc20InputDataJson={erc20InputDataJson}
      onPressAddress={onPressAddress}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
    />
  );
});
